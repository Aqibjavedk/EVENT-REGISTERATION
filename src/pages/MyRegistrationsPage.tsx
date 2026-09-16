import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Calendar, 
  Clock, 
  MapPin, 
  QrCode, 
  CheckCircle, 
  ArrowRight, 
  Download,
  AlertCircle,
  XCircle,
  Loader2,
  CheckCircle2,
  RotateCcw,
  LogIn
} from 'lucide-react';
import { PageId, DbRegistrationWithEvent } from '../types';
import { supabaseService } from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { RegistrationStatusBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

interface MyRegistrationsPageProps {
  onNavigate: (page: PageId, eventId?: string) => void;
}

export const MyRegistrationsPage: React.FC<MyRegistrationsPageProps> = ({ onNavigate }) => {
  const [registrations, setRegistrations] = useState<DbRegistrationWithEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgressId, setActionInProgressId] = useState<string | number | null>(null);
  const [selectedReg, setSelectedReg] = useState<DbRegistrationWithEvent | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { user, profile } = useAuth();

  useEffect(() => {
    fetchRegistrations();
  }, [user]);

  const fetchRegistrations = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (isSupabaseConfigured) {
        const data = await supabaseService.getUserRegistrations(user.id);
        setRegistrations(data);
        if (data.length > 0) {
          setSelectedReg(data[0]);
        } else {
          setSelectedReg(null);
        }
      } else {
        // Preview dummy fallback if Supabase not configured
        setRegistrations([]);
      }
    } catch (err: any) {
      console.error('Error fetching registrations:', err);
      setErrorMessage(err.message || 'Unable to load your registrations.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRegistration = async (registrationId: string | number) => {
    if (!user) return;

    setActionInProgressId(registrationId);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const result = await supabaseService.cancelRegistration(registrationId, user.id);
      if (result.success) {
        setSuccessMessage('Registration cancelled successfully.');
        // Refresh registrations from Supabase to ensure clean state
        await fetchRegistrations();
      } else {
        setErrorMessage(result.message || 'Failed to cancel registration.');
      }
    } catch (err: any) {
      console.error('Cancel registration error:', err);
      setErrorMessage(err.message || 'Error occurred while cancelling registration.');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Format date helper
  const formatDisplayDate = (dateStr: string) => {
    try {
      if (dateStr && dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-2">
              <Ticket className="w-3.5 h-3.5 text-emerald-600" />
              <span>Attendee Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Registrations & Passes
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              View and manage your confirmed event tickets, schedules, and reservations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={fetchRegistrations}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('upcoming-events')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Browse Events
            </Button>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="my-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900">
              Dismiss
            </button>
          </div>
        )}

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

        {/* Not Logged In View */}
        {!user ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-12 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Sign In to View Your Registrations</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Please sign in with your Nowshera Events account to access your event passes, check-in QR codes, and seat reservations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                onClick={() => onNavigate('login')}
                leftIcon={<LogIn className="w-4 h-4" />}
              >
                Sign In Now
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate('register')}
              >
                Create Account
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="py-24 text-center text-slate-500">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium">Retrieving your event registrations from Supabase...</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center my-12 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Registrations Yet</h3>
            <p className="text-sm text-slate-500 mb-6">
              You haven't reserved a seat for any upcoming events yet. Explore workshops and seminars happening in Nowshera.
            </p>
            <Button
              variant="primary"
              onClick={() => onNavigate('upcoming-events')}
            >
              Browse Upcoming Events
            </Button>
          </div>
        ) : (
          <div className="my-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Registrations List (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Your Event Bookings ({registrations.length})
                </h3>
                <span className="text-xs text-slate-400">
                  Logged in as {profile?.name || user.email}
                </span>
              </div>

              {registrations.map((reg) => {
                const ev = reg.event || reg.events;
                const isCancelled = reg.status === 'cancelled';

                return (
                  <div
                    key={reg.id}
                    className={`bg-white rounded-2xl border p-5 sm:p-6 transition-all ${
                      selectedReg?.id === reg.id
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              isCancelled
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isCancelled ? 'Cancelled' : 'Active'}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            ID: {String(reg.id).length > 8 ? `${String(reg.id).slice(0, 8)}...` : String(reg.id)}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 leading-snug">
                          {ev?.title || 'Registered Event'}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant={selectedReg?.id === reg.id ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedReg(reg)}
                          leftIcon={<QrCode className="w-3.5 h-3.5" />}
                        >
                          {selectedReg?.id === reg.id ? 'Viewing Pass' : 'Show Pass'}
                        </Button>
                      </div>
                    </div>

                    {/* Metadata details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span><strong>Event Date:</strong> {ev ? formatDisplayDate(ev.event_date) : 'TBD'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span><strong>Time:</strong> {ev?.event_time || 'Check schedule'}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate"><strong>Location:</strong> {ev?.location || 'Nowshera'}</span>
                      </div>
                    </div>

                    {/* Action & Footer Row */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="text-slate-500">
                        Booked on: {reg.created_at ? new Date(reg.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'Recent'}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onNavigate('event-details', reg.event_id)}
                          className="text-emerald-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Event details</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        {!isCancelled && (
                          <button
                            onClick={() => handleCancelRegistration(reg.id)}
                            disabled={actionInProgressId === reg.id}
                            className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer hover:underline disabled:opacity-50"
                          >
                            {actionInProgressId === reg.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            <span>Cancel Registration</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pass Preview / Digital Badge Sidebar */}
            <div>
              <div className="sticky top-24 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>Digital Event Pass</span>
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Nowshera Pass
                  </span>
                </div>

                {selectedReg ? (
                  (() => {
                    const ev = selectedReg.event || selectedReg.events;
                    const isCancelled = selectedReg.status === 'cancelled';

                    return (
                      <div className="space-y-4 text-center">
                        <div className={`p-4 rounded-xl border border-dashed flex flex-col items-center ${
                          isCancelled ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50 border-slate-300'
                        }`}>
                          {/* QR Mock graphic with attendee identifier */}
                          <div className="w-36 h-36 bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex items-center justify-center relative">
                            <div className="grid grid-cols-5 gap-1 w-full h-full p-1 opacity-80">
                              {Array.from({ length: 25 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`rounded-xs ${
                                    isCancelled
                                      ? (i % 2 === 0 ? 'bg-slate-300' : 'bg-slate-100')
                                      : (i * 7) % 3 === 0 || i === 0 || i === 4 || i === 20 || i === 24
                                      ? 'bg-slate-900'
                                      : 'bg-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className={`p-1.5 rounded-md shadow-xs text-white ${
                                isCancelled ? 'bg-rose-600' : 'bg-emerald-600'
                              }`}>
                                {isCancelled ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              </div>
                            </div>
                          </div>
                          
                          <p className="mt-2 text-xs font-mono font-bold text-slate-700 tracking-wider">
                            {isCancelled ? 'CANCELLED' : `REG-${String(selectedReg.id).length > 8 ? String(selectedReg.id).slice(0, 8).toUpperCase() : String(selectedReg.id).padStart(4, '0').toUpperCase()}`}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {isCancelled ? 'This booking was cancelled' : 'Present at check-in desk'}
                          </p>
                        </div>

                        <div className="text-left text-xs space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                          <p className="font-bold text-slate-900 text-sm truncate">
                            {ev?.title || 'Nowshera Event'}
                          </p>
                          <p className="text-slate-600">
                            <strong>Date:</strong> {ev ? formatDisplayDate(ev.event_date) : 'TBD'}
                          </p>
                          <p className="text-slate-600">
                            <strong>Attendee:</strong> {profile?.name || user.email}
                          </p>
                          <p className="text-slate-600">
                            <strong>Status:</strong>{' '}
                            <span className={isCancelled ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                              {isCancelled ? 'Cancelled' : 'Active'}
                            </span>
                          </p>
                        </div>

                        {!isCancelled && (
                          <div className="space-y-2 pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-center"
                              leftIcon={<Download className="w-3.5 h-3.5" />}
                              onClick={() => {
                                const downloadMsg = `Entry pass ready for ${ev?.title || 'event'}!`;
                                setSuccessMessage(downloadMsg);
                                setTimeout(() => setSuccessMessage(null), 3000);
                              }}
                            >
                              Download Pass (PDF)
                            </Button>
                            <button
                              id="sidebar-cancel-registration-btn"
                              onClick={() => handleCancelRegistration(selectedReg.id)}
                              disabled={actionInProgressId === selectedReg.id}
                              className="w-full py-1 text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:underline disabled:opacity-50"
                            >
                              {actionInProgressId === selectedReg.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                              <span>Cancel Registration</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-xs text-slate-400 text-center py-8">
                    Select a booking on the left to view the pass.
                  </p>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
