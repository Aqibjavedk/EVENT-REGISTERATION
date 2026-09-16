import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Plus, 
  ArrowUpRight, 
  ShieldCheck, 
  Clock, 
  MapPin,
  CalendarRange,
  BarChart3,
  ShieldAlert,
  Loader2,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Ticket,
  Eye,
  AlertCircle
} from 'lucide-react';
import { PageId, DbEvent, DbRegistrationWithEvent } from '../types';
import { supabaseService } from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { Button } from '../components/common/Button';

interface AdminDashboardPageProps {
  onNavigate: (page: PageId, eventId?: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { user, profile, isAdmin } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalEvents: 0,
    publishedEvents: 0,
    activeRegistrations: 0,
  });
  const [eventsList, setEventsList] = useState<DbEvent[]>([]);
  const [registrationsList, setRegistrationsList] = useState<DbRegistrationWithEvent[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin, user]);

  const loadAdminData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (isSupabaseConfigured) {
        const [adminMetrics, allEvents, allRegs] = await Promise.all([
          supabaseService.getAdminMetrics(),
          supabaseService.getAllEventsAdmin(),
          supabaseService.getAllRegistrationsAdmin(),
        ]);

        setMetrics(adminMetrics);
        setEventsList(allEvents);
        setRegistrationsList(allRegs);
      } else {
        // Preview fallback if Supabase env vars not yet configured
        setMetrics({
          totalEvents: 6,
          publishedEvents: 4,
          activeRegistrations: 142,
        });
      }
    } catch (err: any) {
      console.error('Error fetching admin dashboard data:', err);
      setErrorMessage(err.message || 'Unable to load admin metrics from Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1. NON-ADMIN RESTRICTION VIEW
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
            Access Restricted
          </h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            {user ? (
              <>
                You are currently signed in as <strong>{profile?.name || user.email}</strong> with role{' '}
                <span className="font-bold text-slate-900 uppercase">"{profile?.role || 'attendee'}"</span>.
                <br /><br />
                The Admin Dashboard and organizer controls require an <strong>"admin"</strong> role in the Supabase{' '}
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">profiles</code> table.
              </>
            ) : (
              <>
                You must be authenticated with an administrator account to access the organizer console.
              </>
            )}
          </p>

          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              onClick={() => onNavigate('upcoming-events')}
              leftIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full justify-center"
            >
              Back to Upcoming Events
            </Button>
            {!user ? (
              <Button
                variant="outline"
                onClick={() => onNavigate('login')}
                className="w-full justify-center"
              >
                Sign In with Admin Account
              </Button>
            ) : (
              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 text-left space-y-1">
                <span className="font-semibold text-slate-700 block">How to enable admin access in Supabase:</span>
                <p>
                  Run: <code className="bg-slate-100 p-1 rounded block text-emerald-800 font-mono mt-1">UPDATE profiles SET role = 'admin' WHERE id = '{user.id}';</code>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. ADMIN DASHBOARD VIEW
  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-2">
              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
              <span>Admin Console • Live Supabase</span>
              <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded font-bold uppercase">
                {profile?.role || 'admin'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Admin & Organizer Dashboard
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Real-time oversight of Nowshera event programs, registration counts, and attendee rosters.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAdminData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
            <Button
              id="admin-create-event-btn"
              variant="primary"
              size="sm"
              onClick={() => onNavigate('event-management')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Manage Events
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('attendee-list')}
              leftIcon={<Users className="w-4 h-4" />}
            >
              Attendee Roster
            </Button>
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="my-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-700 hover:text-rose-900">
              Dismiss
            </button>
          </div>
        )}

        {/* 3 Core Metrics Required by Prompt */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 my-8">
          
          {/* Metric 1: Total Events Count */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Events Count
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CalendarDays className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{metrics.totalEvents}</span>
              <span className="text-xs text-slate-500">all database records</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Total events registered in Supabase</p>
          </div>

          {/* Metric 2: Published Events Count */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Published Events Count
              </span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <CalendarRange className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{metrics.publishedEvents}</span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-0.5" /> status = 'published'
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Visible on public upcoming events directory</p>
          </div>

          {/* Metric 3: Total Active Registrations Count */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Active Registrations
              </span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{metrics.activeRegistrations}</span>
              <span className="text-xs text-purple-600 font-semibold">status = 'active'</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Confirmed attendee seat reservations</p>
          </div>

        </div>

        {/* Two Columns Grid: Event List & Attendee / Registration List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Section 1: Event List (Required) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CalendarRange className="w-4 h-4 text-emerald-600" />
                  <span>Event List ({eventsList.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Events stored in Supabase events table</p>
              </div>
              <button
                onClick={() => onNavigate('event-management')}
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Manage all</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                <p className="text-xs">Loading events...</p>
              </div>
            ) : eventsList.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <CalendarDays className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No events found in Supabase.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto pr-1">
                {eventsList.map((ev) => (
                  <div key={ev.id} className="py-3.5 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          ev.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ev.status === 'draft'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {ev.status}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          Cap: {ev.capacity}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {ev.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {ev.event_date} {ev.event_time}
                        </span>
                        <span className="truncate flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {ev.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate('event-details', ev.id)}
                        title="View Public Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Attendee / Registration List (Required) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Attendee / Registration List ({registrationsList.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Attendee registrations from registrations table</p>
              </div>
              <button
                onClick={() => onNavigate('attendee-list')}
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View roster</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                <p className="text-xs">Loading attendee registrations...</p>
              </div>
            ) : registrationsList.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Ticket className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No attendee registrations recorded yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto pr-1">
                {registrationsList.map((reg) => (
                  <div key={reg.id} className="py-3.5 flex items-start justify-between gap-3 text-xs">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded-full font-semibold capitalize ${
                          reg.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {reg.status}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Registered At: {reg.created_at ? new Date(reg.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 text-sm truncate">
                        Attendee Name: {reg.attendee_name || reg.profiles?.name || reg.profile?.name || 'N/A'}
                      </p>
                      <p className="text-slate-600 text-xs truncate mt-0.5">
                        Attendee Email: {reg.attendee_email || reg.profiles?.email || reg.profile?.email || 'N/A'}
                      </p>
                      <p className="text-emerald-700 font-medium truncate mt-1">
                        Event: {reg.event_title || reg.events?.title || reg.event?.title || 'Unknown Event'}
                      </p>
                      <p className="text-slate-500 text-[11px] truncate mt-0.5">
                        Event Date: {reg.event_date || reg.events?.event_date || reg.event?.event_date || 'N/A'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-slate-400 block">
                        ID: {String(reg.registration_id || reg.id).length > 6 ? `${String(reg.registration_id || reg.id).slice(0, 6)}...` : String(reg.registration_id || reg.id)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Security / Architecture Footer Note */}
        <div className="mt-8 p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800 block">Supabase Role-Based Access Control (RBAC):</span>
            <p className="mt-0.5 leading-relaxed">
              Admin privileges are enforced by checking <code className="bg-white px-1 py-0.5 rounded border border-slate-200">profiles.role = 'admin'</code> against the authenticated Supabase user ID. Non-admin users cannot trigger administrative queries or access protected endpoints.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
