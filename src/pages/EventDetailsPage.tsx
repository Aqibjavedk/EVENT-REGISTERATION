import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ArrowLeft, 
  Share2, 
  ShieldCheck, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  Building,
  UserCheck,
  Mail,
  Loader2,
  Ticket,
  ExternalLink,
  Ban,
  ArrowRight
} from 'lucide-react';
import { EventItem, PageId, DbEvent } from '../types';
import { supabaseService, mapDbEventToEventItem } from '../services/supabaseService';
import { eventService, INITIAL_SAMPLE_EVENTS } from '../services/eventService';
import { EventStatusBadge, EventCategoryBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

interface EventDetailsPageProps {
  eventId: string | null;
  onBack: () => void;
  onNavigate: (page: PageId) => void;
}

export const EventDetailsPage: React.FC<EventDetailsPageProps> = ({ 
  eventId, 
  onBack,
  onNavigate 
}) => {
  const [event, setEvent] = useState<EventItem | null>(null);
  const [rawDbEvent, setRawDbEvent] = useState<DbEvent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState<boolean>(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!eventId) return;

    fetchEventDetails(eventId);
  }, [eventId, user]);

  const fetchEventDetails = async (id: string, showFullLoader = false) => {
    if (showFullLoader) {
      setIsLoading(true);
    }
    setRegistrationError(null);

    try {
      if (isSupabaseConfigured) {
        // 1. Fetch from Supabase
        const { event: dbEv, activeCount } = await supabaseService.getEventById(id);
        if (dbEv) {
          setRawDbEvent(dbEv);
          const mapped = mapDbEventToEventItem(dbEv, activeCount);
          setEvent(mapped);

          // 2. Check if current logged-in user is already registered with status = "active"
          if (user) {
            const alreadyReg = await supabaseService.checkUserEventRegistration(user.id, id);
            setIsAlreadyRegistered(alreadyReg);
          } else {
            setIsAlreadyRegistered(false);
          }
          setIsLoading(false);
          return;
        }
      }

      // Fallback to sample events if not found in Supabase or not configured
      const fallback = await eventService.getEventById(id);
      if (fallback) {
        setEvent(fallback);
      } else {
        // Find in initial sample events
        const sample = INITIAL_SAMPLE_EVENTS.find(e => e.id === id);
        setEvent(sample || null);
      }
    } catch (err: any) {
      console.error('Error fetching event details:', err);
      // Fallback
      const sample = INITIAL_SAMPLE_EVENTS.find(e => e.id === id);
      setEvent(sample || null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleRegisterClick = async () => {
    // Check 1: If user is not logged in, redirect to login page
    if (!user) {
      onNavigate('login');
      return;
    }

    if (!eventId || !event) return;

    setIsRegistering(true);
    setRegistrationError(null);
    setRegistrationSuccess(null);

    try {
      if (!isSupabaseConfigured) {
        // Demo mode fallback
        setIsAlreadyRegistered(true);
        setRegistrationSuccess('Registration successful in preview mode! (Supabase not configured yet)');
        setEvent(prev => prev ? { ...prev, registeredCount: prev.registeredCount + 1 } : null);
        return;
      }

      // Execute full registration validation & insertion in Supabase
      const result = await supabaseService.registerForEvent(user.id, eventId);

      if (!result.success) {
        setRegistrationError(result.message);
        if (result.message.toLowerCase().includes('already registered')) {
          setIsAlreadyRegistered(true);
        }
      } else {
        setIsAlreadyRegistered(true);
        setRegistrationSuccess('Registration successful');
        // Refresh the event availability immediately from Supabase
        await fetchEventDetails(eventId);
      }
    } catch (err: any) {
      console.error('Registration failure:', err);
      setRegistrationError(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Event Not Found</h2>
          <p className="text-sm text-slate-600 mb-6">
            The event you are looking for might have been moved or is no longer available.
          </p>
          <Button variant="primary" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Upcoming Events
          </Button>
        </div>
      </div>
    );
  }

  const remainingSeats = Math.max(0, event.capacity - event.registeredCount);
  const percentFilled = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));
  const isSoldOut = remainingSeats <= 0;

  // Check if date has passed
  let isPastEvent = false;
  if (rawDbEvent?.event_date) {
    const today = new Date().toISOString().split('T')[0];
    if (rawDbEvent.event_date < today) {
      isPastEvent = true;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-6 sm:pt-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation / Back Button */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Button
            id="back-to-events-btn"
            variant="ghost"
            size="sm"
            onClick={onBack}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="text-slate-600 hover:text-slate-900 -ml-2"
          >
            Back to All Events
          </Button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copied!' : 'Share Event'}</span>
          </button>
        </div>

        {/* Hero Banner Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs mb-8">
          {/* Cover image */}
          <div className="relative h-64 sm:h-80 md:h-96 w-full bg-slate-900">
            {event.featuredImage ? (
              <img
                src={event.featuredImage}
                alt={event.title}
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-800 to-teal-900 text-white font-bold text-2xl p-6 text-center">
                {event.title}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

            {/* Badges on cover */}
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
              <EventCategoryBadge category={event.category} />
              <EventStatusBadge status={event.status} />
              {isPastEvent && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500 text-white shadow-xs">
                  Event Passed
                </span>
              )}
            </div>

            {/* Title & Organization on cover overlay */}
            <div className="absolute bottom-6 left-4 right-4 sm:left-8 sm:right-8 text-white">
              <div className="text-xs uppercase tracking-wider font-semibold text-emerald-400 mb-1">
                {event.organizer.organization}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                {event.title}
              </h1>
            </div>
          </div>

          {/* Key Facts Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50/70 border-b border-slate-200">
            <div className="p-4 sm:p-5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-100/70 text-emerald-700 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Date
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {event.date}
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100/70 text-blue-700 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Time
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {event.time}
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-100/70 text-indigo-700 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Location
                </span>
                <span className="text-sm font-bold text-slate-800 line-clamp-1" title={event.location}>
                  {event.location}
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100/70 text-amber-700 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Capacity
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {event.capacity} Attendees
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Two Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Main Content (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Full Description */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                About this Event
              </h2>
              <div className="text-sm sm:text-base text-slate-700 leading-relaxed space-y-4 whitespace-pre-line">
                {event.fullDescription}
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-slate-400 font-medium">Keywords:</span>
                  {event.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Event Agenda (if present) */}
            {event.agenda && event.agenda.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                  Schedule & Agenda
                </h2>
                <div className="space-y-4">
                  {event.agenda.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="w-24 shrink-0 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200/60 text-center">
                        {item.time}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-slate-900">
                          {item.activity}
                        </h4>
                        {item.speaker && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            Presented by: <span className="font-medium text-slate-700">{item.speaker}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Important Attendee Guidelines */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Important Attendee Guidelines
              </h2>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Please arrive 15 minutes prior to start time for check-in and seat allocation.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Have your registered email or ticket confirmation handy on your mobile device.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Free entry for verified registrants. Seating is filled on a first-come, first-served basis.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Sidebar: Registration Box & Location & Organizer */}
          <div className="space-y-6">
            
            {/* Registration Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Registration
                </span>
                <span className="text-sm font-extrabold text-slate-900 bg-slate-100 px-3 py-1 rounded-md">
                  {event.price}
                </span>
              </div>

              {/* Current Availability Progress */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-5">
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                  <span>Remaining Capacity</span>
                  <span className={remainingSeats <= 0 ? 'text-rose-600 font-bold' : 'text-emerald-700'}>
                    {remainingSeats <= 0 ? 'Sold Out' : `${remainingSeats} seats available`}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      percentFilled >= 100
                        ? 'bg-rose-500'
                        : percentFilled > 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percentFilled}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>{event.registeredCount} active registrants</span>
                  <span>{event.capacity} maximum capacity</span>
                </div>
              </div>

              {/* Alerts: Success or Error */}
              {registrationSuccess && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{registrationSuccess}</p>
                    <button
                      onClick={() => onNavigate('my-registrations')}
                      className="mt-1.5 font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <span>View in My Registrations</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {registrationError && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{registrationError}</span>
                </div>
              )}

              {/* Already registered banner */}
              {isAlreadyRegistered && !registrationSuccess && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold">Already registered for this event</span>
                    <button
                      onClick={() => onNavigate('my-registrations')}
                      className="block mt-1 font-bold text-emerald-700 hover:underline"
                    >
                      View or cancel registration in My Registrations →
                    </button>
                  </div>
                </div>
              )}

              {/* Registration Action Buttons */}
              <div className="space-y-3">
                {!user ? (
                  /* Not Logged In State: Redirects to Login */
                  <Button
                    id="event-register-login-btn"
                    variant="primary"
                    size="lg"
                    onClick={() => onNavigate('login')}
                    className="w-full justify-center"
                    rightIcon={<Ticket className="w-4 h-4" />}
                  >
                    Register Now (Sign In Required)
                  </Button>
                ) : isAlreadyRegistered ? (
                  /* Already Registered State: Shows 'Already registered' and prevents second registration */
                  <div className="space-y-2.5">
                    <Button
                      id="event-already-registered-btn"
                      variant="outline"
                      size="lg"
                      disabled={true}
                      className="w-full justify-center border-emerald-600 text-emerald-700 bg-emerald-50/60 font-semibold opacity-90 cursor-not-allowed"
                      leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    >
                      Already registered
                    </Button>
                    <button
                      type="button"
                      onClick={() => onNavigate('my-registrations')}
                      className="w-full text-center text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Manage or cancel in My Registrations</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ) : isPastEvent ? (
                  /* Event Date Passed */
                  <Button
                    variant="outline"
                    size="lg"
                    disabled={true}
                    className="w-full justify-center opacity-70 cursor-not-allowed text-slate-500"
                    leftIcon={<Ban className="w-4 h-4" />}
                  >
                    Event Has Concluded
                  </Button>
                ) : (isSoldOut || remainingSeats <= 0 || registrationError === 'Event is full') ? (
                  /* Capacity Full */
                  <Button
                    id="event-sold-out-btn"
                    variant="outline"
                    size="lg"
                    disabled={true}
                    className="w-full justify-center opacity-75 cursor-not-allowed text-rose-600 border-rose-200 bg-rose-50"
                  >
                    Event is full
                  </Button>
                ) : (
                  /* Active Registration Button */
                  <Button
                    id="event-register-now-btn"
                    variant="primary"
                    size="lg"
                    disabled={isRegistering}
                    onClick={handleRegisterClick}
                    className="w-full justify-center"
                    leftIcon={isRegistering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ticket className="w-4 h-4" />}
                  >
                    {isRegistering ? 'Reserving Your Seat...' : 'Register Now'}
                  </Button>
                )}

                {/* Subtext info */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Direct Supabase registration validates seat quota, prevents double booking, and saves your reservation with status = "active".
                  </span>
                </div>
              </div>
            </div>

            {/* Venue & Location Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Venue & Location</span>
              </h3>
              <p className="text-sm font-medium text-slate-800 mb-1">
                {event.location}
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Nowshera District, Khyber Pakhtunkhwa
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Format: <strong>{event.venueType}</strong> Event</span>
              </div>
            </div>

            {/* Organizer Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Organized by</span>
              </h3>
              <div className="space-y-2 text-xs text-slate-600">
                <p className="text-sm font-bold text-slate-900">
                  {event.organizer.name}
                </p>
                <p className="text-slate-600">
                  {event.organizer.organization}
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{event.organizer.contactEmail}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
