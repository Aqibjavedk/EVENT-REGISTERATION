import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  CheckCircle2, 
  Mail, 
  Calendar, 
  ShieldAlert, 
  RotateCcw, 
  Loader2, 
  ArrowRight,
  UserCheck,
  Ticket,
  X
} from 'lucide-react';
import { PageId, DbRegistrationWithEvent, DbEvent } from '../types';
import { supabaseService } from '../services/supabaseService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

interface AttendeeListPageProps {
  onNavigate: (page: PageId) => void;
}

export const AttendeeListPage: React.FC<AttendeeListPageProps> = ({ onNavigate }) => {
  const { user, profile, isAdmin } = useAuth();

  const [registrations, setRegistrations] = useState<DbRegistrationWithEvent[]>([]);
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'all' | 'cancelled'>('active');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const [regs, evs] = await Promise.all([
          supabaseService.getAllRegistrationsAdmin(),
          supabaseService.getAllEventsAdmin(),
        ]);
        setRegistrations(regs);
        setEvents(evs);
      }
    } catch (err) {
      console.error('Error loading attendees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
            Access Restricted
          </h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            The attendee registration roster contains attendee identity and contact information. Only accounts with the <strong>"admin"</strong> role can view this page.
          </p>
          <Button
            variant="primary"
            onClick={() => onNavigate('upcoming-events')}
            leftIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full justify-center"
          >
            Go to Upcoming Events
          </Button>
        </div>
      </div>
    );
  }

  const filteredRegistrations = registrations.filter((reg) => {
    const attendeeName = reg.attendee_name || reg.profiles?.name || reg.profile?.name || '';
    const attendeeEmail = reg.attendee_email || reg.profiles?.email || reg.profile?.email || '';
    const eventTitle = reg.event_title || reg.events?.title || reg.event?.title || '';

    const matchesSearch =
      attendeeName.toLowerCase().includes(search.toLowerCase()) ||
      attendeeEmail.toLowerCase().includes(search.toLowerCase()) ||
      eventTitle.toLowerCase().includes(search.toLowerCase());

    const matchesEvent = selectedEventId === 'all' || String(reg.event_id) === String(selectedEventId);
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;

    return matchesSearch && matchesEvent && matchesStatus;
  });

  const activeCount = filteredRegistrations.filter((r) => r.status === 'active').length;

  const handleExportCSV = () => {
    const headers = 'RegistrationID,AttendeeName,AttendeeEmail,EventTitle,EventDate,Status,RegisteredAt\n';
    const rows = filteredRegistrations.map((r) => {
      const regId = r.registration_id || r.id || '';
      const name = (r.attendee_name || r.profiles?.name || r.profile?.name || '').replace(/"/g, '""');
      const email = (r.attendee_email || r.profiles?.email || r.profile?.email || '').replace(/"/g, '""');
      const title = (r.event_title || r.events?.title || r.event?.title || '').replace(/"/g, '""');
      const eventDate = (r.event_date || r.events?.event_date || r.event?.event_date || '').replace(/"/g, '""');
      return `"${regId}","${name}","${email}","${title}","${eventDate}","${r.status}","${r.created_at}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nowshera-attendees-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Attendee roster exported to CSV successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Event Operations • Supabase Registrations Table</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Attendee Roster & Registrations
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Verify attendee credentials, view reservation statuses, and export participant data.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="my-4 p-3.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{toast}</span>
            </div>
            <button onClick={() => setToast(null)} className="text-white/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filters and Stats Bar */}
        <div className="my-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attendee name, email, or event..."
              className="w-full pl-10 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>

          <div>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              aria-label="Filter attendee list by event"
              className="w-full py-2 px-3 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
            >
              <option value="all">All Events ({events.length})</option>
              {events.map((ev) => (
                <option key={ev.id} value={String(ev.id)}>
                  {ev.title ? (ev.title.length > 30 ? `${ev.title.slice(0, 30)}...` : ev.title) : 'Untitled Event'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              aria-label="Filter attendee list by registration status"
              className="w-full py-2 px-3 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
            >
              <option value="active">Active Registrations</option>
              <option value="all">All Registrations (Active & Cancelled)</option>
              <option value="cancelled">Cancelled Only</option>
            </select>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 flex justify-between items-center shadow-xs">
            <span>Active Count:</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {activeCount} of {filteredRegistrations.length}
            </span>
          </div>
        </div>

        {/* Attendee Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Attendee Details</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Event Title</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Registered Date</th>
                  <th className="px-6 py-3.5 text-right">Registration ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                      <span>Loading registrations from Supabase...</span>
                    </td>
                  </tr>
                ) : filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No attendee registrations found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{reg.attendee_name || reg.profiles?.name || reg.profile?.name || 'N/A'}</div>
                        <div className="text-[11px] text-slate-400">Role: {reg.profiles?.role || reg.profile?.role || 'attendee'}</div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{reg.attendee_email || reg.profiles?.email || reg.profile?.email || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs max-w-xs font-medium text-slate-800">
                        <div className="truncate">{reg.event_title || reg.events?.title || reg.event?.title || 'Unknown Event'}</div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          {reg.event_date || reg.events?.event_date || reg.event?.event_date ? `Date: ${reg.event_date || reg.events?.event_date || reg.event?.event_date}` : 'Date: N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          reg.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            reg.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`} />
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap text-slate-500">
                        {reg.created_at ? new Date(reg.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap font-mono text-xs text-slate-400">
                        {String(reg.registration_id || reg.id).length > 8 ? `${String(reg.registration_id || reg.id).slice(0, 8)}...` : String(reg.registration_id || reg.id)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
