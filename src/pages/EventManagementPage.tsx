import React, { useState, useEffect } from 'react';
import { 
  CalendarRange, 
  Plus, 
  Search, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  X,
  AlertCircle,
  Clock,
  MapPin,
  Users,
  ShieldAlert,
  Loader2,
  RotateCcw,
  ArrowRight,
  Edit3
} from 'lucide-react';
import { PageId, DbEvent, EventStatus } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { supabaseService } from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

interface EventManagementPageProps {
  onNavigate: (page: PageId, eventId?: string) => void;
}

export const EventManagementPage: React.FC<EventManagementPageProps> = ({ onNavigate }) => {
  const { user, profile, isAdmin } = useAuth();

  const [events, setEvents] = useState<DbEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DbEvent | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for creating a new event
  const [formData, setFormData] = useState({
    title: '',
    date: '2026-10-30',
    time: '10:00 AM - 02:00 PM',
    location: 'Nowshera IT Park, Grand Trunk Road',
    capacity: 100,
    status: 'published' as 'published' | 'draft' | 'completed' | 'cancelled',
    description: '',
  });

  // Form State for editing an event
  const [editFormData, setEditFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    capacity: 100,
    status: 'published' as 'published' | 'draft' | 'completed' | 'cancelled',
    description: '',
  });

  useEffect(() => {
    if (isAdmin) {
      fetchEvents();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const fetchEvents = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (isSupabaseConfigured) {
        const data = await supabaseService.getAllEventsAdmin();
        setEvents(data);
      }
    } catch (err: any) {
      console.error('Error fetching admin events:', err);
      setErrorMessage(err.message || 'Unable to load events from Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const cap = Number(formData.capacity);
    if (!Number.isInteger(cap) || cap <= 0) {
      setErrorMessage('Capacity must be a positive whole number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      if (isSupabaseConfigured) {
        const payload = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          event_date: formData.date,
          event_time: formData.time.trim(),
          location: formData.location.trim(),
          capacity: cap,
          status: formData.status,
        };

        await supabaseService.createEvent(payload);

        showToast(`Event "${formData.title}" successfully created in Supabase!`);
        setIsModalOpen(false);
        setFormData({
          title: '',
          date: '2026-10-30',
          time: '10:00 AM - 02:00 PM',
          location: 'Nowshera IT Park, Grand Trunk Road',
          capacity: 100,
          status: 'published',
          description: '',
        });
        await fetchEvents();
      }
    } catch (err: any) {
      console.error('Create event error:', err);
      setErrorMessage(err.message || 'Failed to create event in Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (ev: DbEvent) => {
    setEditingEvent(ev);
    setEditFormData({
      title: ev.title || '',
      date: ev.event_date || '',
      time: ev.event_time || '',
      location: ev.location || '',
      capacity: ev.capacity || 50,
      status: (ev.status as any) || 'published',
      description: ev.description || '',
    });
    setErrorMessage(null);
    setIsEditModalOpen(true);
  };

  const handleSaveEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingEvent) return;

    const cap = Number(editFormData.capacity);
    if (!Number.isInteger(cap) || cap <= 0) {
      setErrorMessage('Capacity must be a positive whole number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      if (isSupabaseConfigured) {
        await supabaseService.updateEvent(String(editingEvent.id), {
          title: editFormData.title.trim(),
          event_date: editFormData.date,
          event_time: editFormData.time.trim(),
          location: editFormData.location.trim(),
          capacity: cap,
          status: editFormData.status,
          description: editFormData.description.trim(),
        });

        showToast(`Event "${editFormData.title}" updated successfully!`);
        setIsEditModalOpen(false);
        setEditingEvent(null);
        await fetchEvents();
      }
    } catch (err: any) {
      console.error('Update event error:', err);
      setErrorMessage(err.message || 'Failed to update event in Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      if (isSupabaseConfigured) {
        await supabaseService.updateEventStatus(id, newStatus);
        setEvents(events.map(ev => String(ev.id) === String(id) ? { ...ev, status: newStatus } : ev));
        showToast(`Event status updated to "${newStatus}"!`);
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      setErrorMessage(err.message || 'Failed to update event status.');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this event from Supabase?')) return;

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('events').delete().eq('id', id);
        if (error) throw error;

        setEvents(events.filter(ev => ev.id !== id));
        showToast('Event removed successfully from database.');
      }
    } catch (err: any) {
      console.error('Delete event error:', err);
      setErrorMessage(err.message || 'Failed to delete event. Make sure dependent registrations are cancelled first.');
    }
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
            Only accounts with an <strong>"admin"</strong> role in Supabase profiles can manage or publish events.
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

  const filteredEvents = events.filter(ev =>
    ev.title.toLowerCase().includes(search.toLowerCase()) ||
    ev.location.toLowerCase().includes(search.toLowerCase()) ||
    ev.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
              <CalendarRange className="w-3.5 h-3.5 text-emerald-600" />
              <span>Organizer Tools • Supabase Events Table</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Event Management
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Create, update status, and manage published programs in Nowshera.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchEvents}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <Button
              id="open-create-event-modal"
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Publish New Event
            </Button>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="my-4 p-3.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="my-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-700 hover:text-rose-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search & Actions Bar */}
        <div className="my-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search managed events..."
              className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium self-end sm:self-auto">
            Showing <strong>{filteredEvents.length}</strong> events in Supabase
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Event Title & Description</th>
                  <th className="px-6 py-3.5">Date & Venue</th>
                  <th className="px-6 py-3.5">Capacity</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                      <span>Loading events from database...</span>
                    </td>
                  </tr>
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No events found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 leading-snug">{ev.title}</div>
                        <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{ev.description}</div>
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap">
                        <div className="font-medium text-slate-800">{ev.event_date} ({ev.event_time})</div>
                        <div className="text-slate-500 truncate max-w-[180px]">{ev.location}</div>
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap font-bold text-slate-800">
                        {ev.capacity} seats
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={ev.status}
                          onChange={(e) => handleStatusChange(String(ev.id), e.target.value)}
                          aria-label={`Update status for ${ev.title}`}
                          className="text-xs font-semibold py-1 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        >
                          <option value="draft">draft</option>
                          <option value="published">published</option>
                          <option value="completed">completed</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(ev)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                            title="Edit Event"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onNavigate('event-details', String(ev.id))}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                            title="View Public Details"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(String(ev.id))}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Event Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 relative my-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  Create New Event
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Adds a record to the Supabase <code className="text-emerald-700 font-mono">events</code> table.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Nowshera Digital Freelancing Bootcamp"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Event Date (YYYY-MM-DD)
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Event Time
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      placeholder="10:00 AM - 01:00 PM"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Publication Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="draft">draft (Hidden from attendees)</option>
                      <option value="published">published (Visible on discovery)</option>
                      <option value="completed">completed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Venue / Location
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Nowshera IT Park, Grand Trunk Road"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Event Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide workshop objectives, prerequisites, and itinerary..."
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    rightIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                  >
                    {isSubmitting ? 'Publishing...' : 'Save to Supabase'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Event Modal */}
        {isEditModalOpen && editingEvent && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 relative my-8">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingEvent(null);
                }}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  Edit Event
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Modify event specifications in the Supabase <code className="text-emerald-700 font-mono">events</code> table.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveEditEvent} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Event Date (YYYY-MM-DD)
                    </label>
                    <input
                      type="date"
                      required
                      value={editFormData.date}
                      onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={editFormData.capacity}
                      onChange={(e) => setEditFormData({ ...editFormData, capacity: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Must be a positive whole number and cannot be reduced below current active registrations.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Event Time
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.time}
                      onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Status
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="draft">draft</option>
                      <option value="published">published</option>
                      <option value="completed">completed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Venue / Location
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Event Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingEvent(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    rightIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                  >
                    {isSubmitting ? 'Updating...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
