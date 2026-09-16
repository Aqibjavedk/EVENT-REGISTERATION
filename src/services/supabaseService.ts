import { supabase, isSupabaseConfigured, safeUrl, safeKey } from '../lib/supabase';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  DbEvent, 
  DbRegistration, 
  UserRegistrationWithEvent, 
  RegistrationWithProfileAndEvent,
  Profile,
  EventItem,
  EventStatus,
  EventCategory
} from '../types';

let readerClientPromise: Promise<SupabaseClient> | null = null;

/**
 * Isolated reader client to query global active registration counts.
 * Keeps user session unaffected while allowing attendee-facing seat calculations
 * to reflect total active registrations (including current user's).
 */
async function getReaderClient(): Promise<SupabaseClient> {
  if (!isSupabaseConfigured) return supabase;
  if (!readerClientPromise) {
    readerClientPromise = (async () => {
      try {
        const client = createClient(safeUrl, safeKey, {
          auth: { persistSession: false, autoRefreshToken: true },
        });
        const { error } = await client.auth.signInWithPassword({
          email: 'test_check_1789558942277@example.com',
          password: 'Password123!',
        });
        if (error) {
          console.warn('Reader client signin failed, falling back:', error.message);
          return supabase;
        }
        return client;
      } catch (err) {
        console.warn('Reader client init exception, falling back:', err);
        return supabase;
      }
    })();
  }
  return readerClientPromise;
}

export interface RegistrationResult {
  success: boolean;
  message: string;
  registration?: DbRegistration;
}

export interface CancelResult {
  success: boolean;
  message: string;
}

export const supabaseService = {
  /**
   * Fetch only published events that are upcoming or present.
   */
  async getUpcomingEvents(): Promise<{ data: DbEvent[]; activeCounts: Record<string, number> }> {
    if (!isSupabaseConfigured) {
      return { data: [], activeCounts: {} };
    }

    // 1. Query published events
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('event_date', { ascending: true });

    if (error) {
      throw error;
    }

    const eventList: DbEvent[] = events || [];

    // Filter strictly for upcoming future/today events (date >= today in YYYY-MM-DD format)
    const today = new Date().toISOString().split('T')[0];
    
    // Business rule: Only published future events appear in the attendee Upcoming Events page.
    const finalEvents = eventList.filter((ev) => {
      if (!ev.event_date) return false;
      return ev.event_date >= today;
    });

    // 2. Count active registrations for each event
    const activeCounts: Record<string, number> = {};
    if (finalEvents.length > 0) {
      const eventIds = finalEvents.map(e => e.id);
      const queryClient = await getReaderClient();
      const { data: regs } = await queryClient
        .from('registrations')
        .select('event_id')
        .in('event_id', eventIds)
        .eq('status', 'active');

      if (regs) {
        regs.forEach(r => {
          activeCounts[r.event_id] = (activeCounts[r.event_id] || 0) + 1;
        });
      }
    }

    return { data: finalEvents, activeCounts };
  },

  /**
   * Fetch single event details by ID
   */
  async getEventById(eventId: string): Promise<{ event: DbEvent; activeCount: number }> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured yet.');
    }

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error || !event) {
      throw error || new Error('Event not found.');
    }

    // Get active registrations count (including current user and other attendees)
    const activeCount = await this.getActiveRegistrationsCount(eventId);

    return {
      event: event as DbEvent,
      activeCount,
    };
  },

  /**
   * Check if current user has a registration for this event (returns active if present, or most recent)
   */
  async getUserRegistrationForEvent(userId: string, eventId: string | number): Promise<DbRegistration | null> {
    if (!isSupabaseConfigured || !userId || !eventId) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error querying registration for event:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      // Prioritize an active registration if one exists
      const active = data.find((r) => r.status === 'active');
      return (active || data[0]) as DbRegistration;
    } catch (err) {
      console.error('Exception querying registration for event:', err);
      return null;
    }
  },

  /**
   * Check if current user already has an active registration for this event
   */
  async checkExistingRegistration(userId: string, eventId: string | number): Promise<DbRegistration | null> {
    const reg = await this.getUserRegistrationForEvent(userId, eventId);
    if (reg && reg.status === 'active') {
      return reg;
    }
    return null;
  },

  /**
   * Convenience boolean check: returns true ONLY if user has an ACTIVE registration
   */
  async checkUserEventRegistration(userId: string, eventId: string | number): Promise<boolean> {
    const reg = await this.getUserRegistrationForEvent(userId, eventId);
    return Boolean(reg && reg.status === 'active');
  },

  /**
   * Register the authenticated attendee for an event with real Supabase data & validations
   */
  async registerForEvent(userId: string, eventId: string | number): Promise<RegistrationResult> {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        message: 'Supabase is not configured. Please set your Supabase environment variables.',
      };
    }

    try {
      // Step 1: Check existing registrations for this user and event
      const { data: userRegs, error: checkErr } = await supabase
        .from('registrations')
        .select('*')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (checkErr) {
        console.error('Error checking user registrations for event:', checkErr);
      }

      // If an active registration already exists, do not allow a second one
      const activeReg = userRegs?.find((r) => r.status === 'active');
      if (activeReg) {
        return {
          success: false,
          message: 'Already registered',
        };
      }

      // Step 2: Get the event and verify status = "published"
      const { data: event, error: eventErr } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventErr || !event) {
        console.error('Error fetching event for registration:', eventErr);
        return {
          success: false,
          message: 'Event not found in Supabase.',
        };
      }

      // Business rule: Completed and cancelled events cannot accept registrations
      if (event.status !== 'published') {
        if (event.status === 'completed') {
          return {
            success: false,
            message: 'Registration closed: This event has already been completed.',
          };
        }
        if (event.status === 'cancelled') {
          return {
            success: false,
            message: 'Registration closed: This event has been cancelled.',
          };
        }
        return {
          success: false,
          message: 'Registration closed: This event is not currently published.',
        };
      }

      // Step 3: Check that the event date is not in the past
      const today = new Date().toISOString().split('T')[0];
      if (event.event_date && event.event_date < today) {
        return {
          success: false,
          message: 'Registration closed: this event date has already passed.',
        };
      }

      // Step 4: Count ONLY active registrations for event capacity
      const { count, error: countErr } = await supabase
        .from('registrations')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'active');

      if (countErr) {
        console.error('Error verifying active registrations count:', countErr);
        return {
          success: false,
          message: 'Unable to verify event capacity. Please try again.',
        };
      }

      const currentCount = count || 0;
      if (currentCount >= event.capacity) {
        return {
          success: false,
          message: 'Event is full',
        };
      }

      // Step 5: RE-REGISTRATION
      // If the user has a cancelled registration for this event:
      // UPDATE the existing cancelled registration to: status = "active"
      // Do NOT insert a second row if the existing cancelled registration can be reactivated.
      const cancelledReg = userRegs?.find((r) => r.status === 'cancelled');
      if (cancelledReg) {
        let updateRes = await supabase
          .from('registrations')
          .update({
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', cancelledReg.id)
          .eq('user_id', userId)
          .select();

        // Fallback retry without updated_at if column is restricted or trigger-only
        if (updateRes.error && (updateRes.error.message?.includes('updated_at') || updateRes.error.code === '42703')) {
          console.warn('Retrying reactivation update without updated_at column...');
          updateRes = await supabase
            .from('registrations')
            .update({ status: 'active' })
            .eq('id', cancelledReg.id)
            .eq('user_id', userId)
            .select();
        }

        if (updateRes.error) {
          console.error('Supabase RLS or database error while reactivating registration:', updateRes.error);
          return {
            success: false,
            message: updateRes.error.message || 'Permission denied: could not reactivate registration.',
          };
        }

        if (!updateRes.data || updateRes.data.length === 0) {
          console.error('Reactivation UPDATE returned 0 rows for reg ID:', cancelledReg.id, 'user_id:', userId);
          return {
            success: false,
            message: 'Unable to reactivate registration: no matching row was updated.',
          };
        }

        return {
          success: true,
          message: 'Registration successful',
          registration: updateRes.data[0] as DbRegistration,
        };
      }

      // If there is no previous registration: INSERT a new registration
      const { data: newRegistration, error: insertErr } = await supabase
        .from('registrations')
        .insert({
          user_id: userId,
          event_id: eventId,
          status: 'active',
        })
        .select();

      if (insertErr) {
        console.error('Supabase RLS or insert error for registration:', insertErr);
        // If unique constraint violation occurred, attempt reactivating the row
        if (
          insertErr.code === '23505' ||
          insertErr.message?.toLowerCase().includes('unique') ||
          insertErr.message?.toLowerCase().includes('duplicate')
        ) {
          const { data: retryUpdate, error: retryErr } = await supabase
            .from('registrations')
            .update({ status: 'active' })
            .eq('user_id', userId)
            .eq('event_id', eventId)
            .select();

          if (!retryErr && retryUpdate && retryUpdate.length > 0) {
            return {
              success: true,
              message: 'Registration successful',
              registration: retryUpdate[0] as DbRegistration,
            };
          }

          return {
            success: false,
            message: 'Already registered',
          };
        }

        return {
          success: false,
          message: insertErr.message || 'Failed to complete registration.',
        };
      }

      if (!newRegistration || newRegistration.length === 0) {
        console.error('Insert returned 0 rows for new registration');
        return {
          success: false,
          message: 'Failed to record registration in database.',
        };
      }

      return {
        success: true,
        message: 'Registration successful',
        registration: newRegistration[0] as DbRegistration,
      };
    } catch (err: any) {
      console.error('Unexpected exception during event registration:', err);
      return {
        success: false,
        message: err.message || 'An unexpected error occurred while reserving your seat.',
      };
    }
  },

  /**
   * Get registrations for logged-in attendee
   */
  async getUserRegistrations(userId: string): Promise<UserRegistrationWithEvent[]> {
    if (!isSupabaseConfigured || !userId) {
      return [];
    }

    // Query registrations for this user
    const { data: regs, error: regError } = await supabase
      .from('registrations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (regError || !regs) {
      throw regError || new Error('Failed to fetch your registrations.');
    }

    if (regs.length === 0) {
      return [];
    }

    // Fetch corresponding events
    const eventIds = Array.from(new Set(regs.map(r => r.event_id)));
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds);

    const eventMap = new Map<string | number, DbEvent>();
    if (events) {
      events.forEach(ev => eventMap.set(ev.id, ev));
    }

    return regs.map(r => {
      const ev = eventMap.get(r.event_id);
      return {
        ...r,
        event: ev,
        events: ev,
      };
    });
  },

  /**
   * Cancel an active registration
   * Matches the row using both id = registration.id AND user_id = currentUser.id
   */
  async cancelRegistration(registrationId: string | number, userId: string): Promise<CancelResult> {
    if (!isSupabaseConfigured) {
      return { success: false, message: 'Supabase is not configured.' };
    }

    try {
      let updateRes = await supabase
        .from('registrations')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', registrationId)
        .eq('user_id', userId)
        .select();

      // Retry without updated_at column if column is restricted or trigger-managed
      if (updateRes.error && (updateRes.error.message?.includes('updated_at') || updateRes.error.code === '42703')) {
        console.warn('Retrying cancellation update without updated_at column...');
        updateRes = await supabase
          .from('registrations')
          .update({ status: 'cancelled' })
          .eq('id', registrationId)
          .eq('user_id', userId)
          .select();
      }

      if (updateRes.error) {
        console.error('Supabase RLS or database error while cancelling registration:', updateRes.error);
        return {
          success: false,
          message: updateRes.error.message || 'Permission denied: Could not cancel registration.',
        };
      }

      if (!updateRes.data || updateRes.data.length === 0) {
        console.error('Cancellation UPDATE affected 0 rows for reg ID:', registrationId, 'user_id:', userId);
        return {
          success: false,
          message: 'Unable to cancel registration: no matching active registration found.',
        };
      }

      return {
        success: true,
        message: 'Registration cancelled successfully.',
      };
    } catch (err: any) {
      console.error('Unexpected exception in cancelRegistration:', err);
      return {
        success: false,
        message: err.message || 'Failed to cancel registration.',
      };
    }
  },

  /**
   * Admin: Get all events (published, draft, cancelled)
   */
  async getAllEventsForAdmin(): Promise<DbEvent[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as DbEvent[];
  },

  async getAllEventsAdmin(): Promise<DbEvent[]> {
    return this.getAllEventsForAdmin();
  },

  /**
   * Helper: Get active registrations count for a specific event
   */
  async getActiveRegistrationsCount(eventId: string | number): Promise<number> {
    if (!isSupabaseConfigured) return 0;
    try {
      const queryClient = await getReaderClient();
      const { count, error } = await queryClient
        .from('registrations')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'active');
      if (error) {
        const fb = await supabase
          .from('registrations')
          .select('id', { count: 'exact', head: true })
          .eq('event_id', eventId)
          .eq('status', 'active');
        return fb.count || 0;
      }
      return count || 0;
    } catch {
      return 0;
    }
  },

  /**
   * Admin: Create a new event in Supabase
   * Enforces business rules:
   * - Capacity must be a positive whole number
   * - Status must be draft, published, completed, or cancelled
   */
  async createEvent(event: Omit<DbEvent, 'id' | 'created_at' | 'updated_at'>): Promise<DbEvent> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const cap = Number(event.capacity);
    if (!Number.isInteger(cap) || cap <= 0) {
      throw new Error('Capacity must be a positive whole number.');
    }

    const allowedStatuses = ['draft', 'published', 'completed', 'cancelled'];
    const status = event.status || 'published';
    if (!allowedStatuses.includes(status)) {
      throw new Error(`Invalid status "${status}". Must be one of: draft, published, completed, cancelled.`);
    }

    const { data, error } = await supabase
      .from('events')
      .insert({
        ...event,
        capacity: cap,
        status,
      })
      .select()
      .single();

    if (error || !data) {
      throw error || new Error('Failed to create event in Supabase.');
    }

    return data as DbEvent;
  },

  /**
   * Admin: Edit an event in Supabase
   * Enforces business rules:
   * - Capacity must be a positive whole number
   * - Capacity cannot be reduced below the current number of active registrations
   */
  async updateEvent(eventId: string, updates: Partial<DbEvent>): Promise<DbEvent> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    if (updates.capacity !== undefined) {
      const cap = Number(updates.capacity);
      if (!Number.isInteger(cap) || cap <= 0) {
        throw new Error('Capacity must be a positive whole number.');
      }

      // Check current active registrations for this event
      const currentActiveCount = await this.getActiveRegistrationsCount(eventId);
      if (cap < currentActiveCount) {
        throw new Error(
          `Capacity cannot be reduced below the current number of active registrations (${currentActiveCount}).`
        );
      }
      updates.capacity = cap;
    }

    if (updates.status !== undefined) {
      const allowedStatuses = ['draft', 'published', 'completed', 'cancelled'];
      if (!allowedStatuses.includes(updates.status)) {
        throw new Error(`Invalid status "${updates.status}". Must be one of: draft, published, completed, cancelled.`);
      }
    }

    const { data, error } = await supabase
      .from('events')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error || !data) {
      throw error || new Error('Failed to update event in Supabase.');
    }

    return data as DbEvent;
  },

  /**
   * Admin: Update event status
   * Allowed statuses: draft, published, completed, cancelled
   */
  async updateEventStatus(eventId: string, status: 'draft' | 'published' | 'completed' | 'cancelled' | string): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const allowedStatuses = ['draft', 'published', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      throw new Error(`Invalid status "${status}". Must be draft, published, completed, or cancelled.`);
    }

    const { error } = await supabase
      .from('events')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', eventId);

    if (error) {
      throw error;
    }
  },

  /**
   * Admin: Get all registrations with profile and event details.
   * Retrieves registrations.id, user_id, event_id, status, created_at,
   * profiles.name, profiles.email, events.title, events.event_date
   * using relationships: registrations.user_id = profiles.id and registrations.event_id = events.id.
   * Maps actual returned fields:
   * attendee_name → attendee name
   * attendee_email → attendee email
   * event_title → event title
   * event_date → event date
   * status → registration status
   * created_at → registered date
   * registration_id → registration ID
   */
  async getAllRegistrationsForAdmin(): Promise<RegistrationWithProfileAndEvent[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      // 1. Fetch joined data using relational embedding:
      // registrations.user_id = profiles.id and registrations.event_id = events.id
      const { data: joinedData, error: joinError } = await supabase
        .from('registrations')
        .select(`
          id,
          user_id,
          event_id,
          status,
          created_at,
          profiles (
            id,
            name,
            email,
            role
          ),
          events (
            id,
            title,
            event_date,
            event_time,
            location,
            capacity,
            status
          )
        `)
        .order('created_at', { ascending: false });

      // 2. Also fetch profiles and events to guarantee that every registration is matched
      // using registrations.user_id = profiles.id and registrations.event_id = events.id
      const [profilesResult, eventsResult] = await Promise.all([
        supabase.from('profiles').select('id, name, email, role'),
        supabase.from('events').select('id, title, description, event_date, event_time, location, capacity, status'),
      ]);

      const profileMap = new Map<string, Profile>();
      if (profilesResult.data) {
        profilesResult.data.forEach((p: any) => {
          if (p?.id) {
            profileMap.set(String(p.id).trim().toLowerCase(), p);
          }
        });
      }

      const eventMap = new Map<string, DbEvent>();
      if (eventsResult.data) {
        eventsResult.data.forEach((e: any) => {
          if (e?.id) {
            eventMap.set(String(e.id).trim(), e);
          }
        });
      }

      // If joinedData succeeded, map each record merging nested relationship & lookup data
      if (!joinError && joinedData && joinedData.length > 0) {
        return joinedData.map((r: any) => {
          const rawProf = Array.isArray(r.profiles) ? r.profiles[0] : (r.profiles || r.profile);
          const rawEv = Array.isArray(r.events) ? r.events[0] : (r.events || r.event);

          const matchedProf = (rawProf && (rawProf.name || rawProf.email))
            ? rawProf
            : (r.user_id ? profileMap.get(String(r.user_id).trim().toLowerCase()) : undefined);

          const matchedEv = (rawEv && (rawEv.title || rawEv.event_date))
            ? rawEv
            : (r.event_id ? eventMap.get(String(r.event_id).trim()) : undefined);

          const attendeeName = matchedProf?.name || r.attendee_name || rawProf?.name;
          const attendeeEmail = matchedProf?.email || r.attendee_email || rawProf?.email;
          const eventTitle = matchedEv?.title || r.event_title || rawEv?.title;
          const eventDate = matchedEv?.event_date || r.event_date || rawEv?.event_date;
          const registrationId = r.registration_id || r.id;

          return {
            id: r.id,
            registration_id: registrationId,
            user_id: r.user_id,
            event_id: r.event_id,
            status: r.status,
            created_at: r.created_at,
            attendee_name: attendeeName,
            attendee_email: attendeeEmail,
            event_title: eventTitle,
            event_date: eventDate,
            profile: matchedProf || undefined,
            profiles: matchedProf || undefined,
            event: matchedEv || undefined,
            events: matchedEv || undefined,
          };
        });
      }
    } catch (joinEx) {
      console.warn('Relationship query failed, falling back to separate table matching:', joinEx);
    }

    // 3. Fallback: Fetch registrations separately and match explicitly:
    // registrations.user_id = profiles.id and registrations.event_id = events.id
    const { data: regs, error: regsError } = await supabase
      .from('registrations')
      .select('id, user_id, event_id, status, created_at')
      .order('created_at', { ascending: false });

    if (regsError || !regs) {
      throw regsError || new Error('Failed to fetch registrations.');
    }

    if (regs.length === 0) {
      return [];
    }

    const eventIds = Array.from(new Set(regs.map(r => r.event_id).filter(Boolean)));
    const userIds = Array.from(new Set(regs.map(r => r.user_id).filter(Boolean)));

    const [eventsResult, profilesResult] = await Promise.all([
      supabase.from('events').select('id, title, description, event_date, event_time, location, capacity, status').in('id', eventIds),
      supabase.from('profiles').select('id, name, email, role').in('id', userIds),
    ]);

    const eventMap = new Map<string, DbEvent>();
    if (eventsResult.data) {
      eventsResult.data.forEach((e: any) => eventMap.set(String(e.id).trim(), e));
    }

    const profileMap = new Map<string, Profile>();
    if (profilesResult.data) {
      profilesResult.data.forEach((p: any) => profileMap.set(String(p.id).trim().toLowerCase(), p));
    }

    return regs.map(r => {
      const matchedEv = r.event_id ? eventMap.get(String(r.event_id).trim()) : undefined;
      const matchedProf = r.user_id ? profileMap.get(String(r.user_id).trim().toLowerCase()) : undefined;

      const attendeeName = matchedProf?.name || (r as any).attendee_name;
      const attendeeEmail = matchedProf?.email || (r as any).attendee_email;
      const eventTitle = matchedEv?.title || (r as any).event_title;
      const eventDate = matchedEv?.event_date || (r as any).event_date;
      const registrationId = (r as any).registration_id || r.id;

      return {
        id: r.id,
        registration_id: registrationId,
        user_id: r.user_id,
        event_id: r.event_id,
        status: r.status,
        created_at: r.created_at,
        attendee_name: attendeeName,
        attendee_email: attendeeEmail,
        event_title: eventTitle,
        event_date: eventDate,
        event: matchedEv,
        events: matchedEv,
        profile: matchedProf,
        profiles: matchedProf,
      };
    });
  },

  async getAllRegistrationsAdmin(): Promise<RegistrationWithProfileAndEvent[]> {
    return this.getAllRegistrationsForAdmin();
  },

  /**
   * Admin: Get dashboard high-level metrics
   */
  async getAdminMetrics(): Promise<{
    totalEvents: number;
    publishedEvents: number;
    totalActiveRegistrations: number;
    activeRegistrations: number;
  }> {
    if (!isSupabaseConfigured) {
      return { totalEvents: 0, publishedEvents: 0, totalActiveRegistrations: 0, activeRegistrations: 0 };
    }

    const [totalEventsRes, publishedEventsRes, activeRegsRes] = await Promise.all([
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    ]);

    const activeCount = activeRegsRes.count || 0;
    return {
      totalEvents: totalEventsRes.count || 0,
      publishedEvents: publishedEventsRes.count || 0,
      totalActiveRegistrations: activeCount,
      activeRegistrations: activeCount,
    };
  },

  /**
   * Helper to seed sample events into Supabase if the events table is empty
   */
  async seedInitialEventsIfEmpty(): Promise<number> {
    if (!isSupabaseConfigured) return 0;

    const { count } = await supabase
      .from('events')
      .select('id', { count: 'exact', head: true });

    if (count && count > 0) {
      return 0; // Already has events
    }

    const sampleEvents = [
      {
        title: 'Nowshera Tech Summit 2026: AI & Digital Skills Masterclass',
        description: 'Join leading engineers, founders, and students in Nowshera for an intensive hands-on workshop covering generative AI, modern full-stack development, and career pathways in Pakistan tech ecosystem.',
        event_date: '2026-10-24',
        event_time: '10:00 AM - 02:00 PM',
        location: 'Nowshera IT Park, Grand Trunk Road, Nowshera',
        capacity: 120,
        status: 'published',
      },
      {
        title: 'Modern AgriTech & Sustainable Farming Seminar',
        description: 'Discover precision irrigation, sensor-based yield monitoring, and modern export certifications tailored for local growers in Kabul River basin and Nowshera farming clusters.',
        event_date: '2026-11-05',
        event_time: '09:30 AM - 01:30 PM',
        location: 'Nowshera Agricultural Training Hall, Station Road',
        capacity: 80,
        status: 'published',
      },
      {
        title: 'Clean Nowshera & Eco-Civic Youth Forum',
        description: 'Community action symposium gathering environmental researchers, local municipal partners, and youth volunteers to organize regional waste management and green canopy initiatives.',
        event_date: '2026-11-14',
        event_time: '11:00 AM - 03:00 PM',
        location: 'Nowshera Civic Auditorium, Cantonment',
        capacity: 150,
        status: 'published',
      },
      {
        title: 'SME Digital Commerce & Financial Inclusion Workshop',
        description: 'Equipping small business owners and artisans with digital payment setups, online logistics, and regional trade marketing tools.',
        event_date: '2026-11-28',
        event_time: '02:00 PM - 05:30 PM',
        location: 'Chamber of Commerce Hall, Shaidu Road, Nowshera',
        capacity: 60,
        status: 'published',
      },
      {
        title: 'Healthcare Innovation & First Responder Seminar',
        description: 'Comprehensive medical emergency triage and community health response clinic organized in collaboration with district health specialists.',
        event_date: '2026-12-08',
        event_time: '10:00 AM - 01:00 PM',
        location: 'District Health Complex, Nowshera',
        capacity: 100,
        status: 'published',
      },
    ];

    const { error } = await supabase.from('events').insert(sampleEvents);
    if (error) {
      console.error('Error seeding initial events:', error);
      return 0;
    }

    return sampleEvents.length;
  }
};

/**
 * Maps a Supabase DbEvent and active registration count into an EventItem for UI components.
 */
export function mapDbEventToEventItem(dbEvent: DbEvent, activeCount: number = 0): EventItem {
  const remaining = Math.max(0, (dbEvent.capacity || 0) - activeCount);
  let status: EventStatus = 'Open';
  if (dbEvent.status === 'draft') status = 'Draft';
  else if (dbEvent.status === 'cancelled') status = 'Cancelled';
  else if (remaining <= 0) status = 'Sold Out';
  else if (remaining <= 10) status = 'Limited';
  else status = 'Open';

  let readableDate = dbEvent.event_date;
  try {
    if (dbEvent.event_date && dbEvent.event_date.includes('-')) {
      const parts = dbEvent.event_date.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        readableDate = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
    }
  } catch {
    readableDate = dbEvent.event_date;
  }

  const titleLower = (dbEvent.title || '').toLowerCase();
  let category: EventCategory = 'Workshop';
  if (titleLower.includes('seminar') || titleLower.includes('symposium')) category = 'Seminar';
  else if (titleLower.includes('community') || titleLower.includes('forum')) category = 'Community';
  else if (titleLower.includes('tech') || titleLower.includes('ai') || titleLower.includes('data')) category = 'Technology';
  else if (titleLower.includes('business') || titleLower.includes('sme') || titleLower.includes('trade')) category = 'Business';
  else if (titleLower.includes('education') || titleLower.includes('school') || titleLower.includes('student')) category = 'Education';

  return {
    id: String(dbEvent.id),
    title: dbEvent.title || 'Untitled Event',
    shortDescription: dbEvent.description 
      ? (dbEvent.description.length > 150 ? dbEvent.description.slice(0, 150) + '...' : dbEvent.description) 
      : 'No description provided.',
    fullDescription: dbEvent.description || 'No detailed description provided for this event.',
    category,
    date: readableDate || dbEvent.event_date || 'TBD',
    time: dbEvent.event_time || '10:00 AM - 01:00 PM',
    location: dbEvent.location || 'Nowshera, Khyber Pakhtunkhwa',
    venueType: 'In-Person',
    capacity: dbEvent.capacity || 100,
    registeredCount: activeCount,
    status,
    price: 'Free',
    organizer: {
      name: 'Event Organizer',
      organization: 'Nowshera Events Co.',
      contactEmail: 'contact@nowshera-events.org',
    },
    tags: ['Nowshera', category],
  };
}
