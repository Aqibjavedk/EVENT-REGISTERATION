import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  AlertCircle, 
  RotateCcw, 
  Loader2, 
  Sparkles, 
  Database,
  PlusCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { EventItem, EventCategory, EventStatus, DbEvent } from '../types';
import { supabaseService, mapDbEventToEventItem } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_SAMPLE_EVENTS } from '../services/eventService';
import { EventCard } from '../components/events/EventCard';
import { Button } from '../components/common/Button';

interface UpcomingEventsPageProps {
  onSelectEvent: (eventId: string) => void;
}

export const UpcomingEventsPage: React.FC<UpcomingEventsPageProps> = ({ onSelectEvent }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [seedSuccessMessage, setSeedSuccessMessage] = useState<string | null>(null);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (isSupabaseConfigured) {
        // Query Supabase published events
        const { data: dbEvents, activeCounts } = await supabaseService.getUpcomingEvents();

        if (dbEvents && dbEvents.length > 0) {
          const mapped = dbEvents.map((dbEv) =>
            mapDbEventToEventItem(dbEv, activeCounts[dbEv.id] || 0)
          );
          setEvents(mapped);
        } else {
          // If Supabase table is empty, show sample events as fallback
          setEvents(INITIAL_SAMPLE_EVENTS);
        }
      } else {
        // Fallback when Supabase variables aren't injected yet
        setEvents(INITIAL_SAMPLE_EVENTS);
      }
    } catch (err: any) {
      console.error('Error loading events from Supabase:', err);
      // If error occurs from Supabase query, display error with fallback option
      setErrorMessage(
        err.message || 'Unable to load upcoming events from Supabase. Displaying cached events.'
      );
      setEvents(INITIAL_SAMPLE_EVENTS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedSampleEvents = async () => {
    try {
      setIsLoading(true);
      const count = await supabaseService.seedInitialEventsIfEmpty();
      if (count > 0) {
        setSeedSuccessMessage(`Successfully seeded ${count} sample events into your Supabase database!`);
      } else {
        setSeedSuccessMessage('Events are already seeded in your Supabase database.');
      }
      await fetchEvents();
      setTimeout(() => setSeedSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to seed sample events into Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  const categories: ('All' | EventCategory)[] = [
    'All',
    'Workshop',
    'Seminar',
    'Community',
    'Technology',
    'Business',
    'Education'
  ];

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesSearch = 
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || ev.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || ev.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [events, searchQuery, selectedCategory, selectedStatus]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nowshera Events Directory</span>
              {isSupabaseConfigured && (
                <span className="ml-1 inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-300 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Supabase Live
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Upcoming Events
            </h1>
            <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-2xl">
              Explore upcoming workshops, educational seminars, and community gatherings happening across Nowshera district.
            </p>
          </div>

          {/* Quick Refresh & Database Actions */}
          <div className="flex items-center gap-2">
            {isSupabaseConfigured && (
              <button
                onClick={handleSeedSampleEvents}
                title="Seed sample events if table is empty"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Seed Events</span>
              </button>
            )}
            <button
              onClick={fetchEvents}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Seed Notification */}
        {seedSuccessMessage && (
          <div className="my-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{seedSuccessMessage}</span>
            </div>
            <button onClick={() => setSeedSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="my-8 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                id="events-search-bar"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by event title, location, or keywords..."
                className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="sm:w-44 shrink-0">
              <select
                id="events-status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                aria-label="Filter events by availability status"
                className="w-full py-2.5 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open for Registration</option>
                <option value="Limited">Few Seats Left</option>
                <option value="Sold Out">Sold Out</option>
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-sm no-scrollbar">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                id={`filter-category-${cat.toLowerCase()}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}

            {(searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All') && (
              <button
                onClick={clearFilters}
                className="ml-auto text-xs text-rose-600 hover:text-rose-700 font-medium underline flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* ================= STATES HANDLING ================= */}

        {/* 1. LOADING STATE */}
        {isLoading && (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 mb-4 animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Loading Events</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              Fetching upcoming published workshops and community seminars from Supabase...
            </p>
          </div>
        )}

        {/* 2. ERROR STATE (WITH GRACEFUL FALLBACK) */}
        {!isLoading && errorMessage && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 my-6 max-w-3xl mx-auto shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-amber-900">
                  Supabase Query Notice
                </h3>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  {errorMessage}
                </p>
                <p className="text-[11px] text-amber-700 mt-2">
                  Showing default Nowshera event listings. You can still browse and test event details.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchEvents}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* 3. EMPTY STATE */}
        {!isLoading && filteredEvents.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center my-8 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Events Found</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              We couldn't find any upcoming events matching "{searchQuery || selectedCategory}".
            </p>
            <Button
              variant="outline"
              onClick={clearFilters}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* 4. SUCCESS / EVENT GRID */}
        {!isLoading && filteredEvents.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6 text-sm text-slate-500">
              <span>
                Showing <strong>{filteredEvents.length}</strong> upcoming published {filteredEvents.length === 1 ? 'event' : 'events'}
              </span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium">
                {isSupabaseConfigured ? 'Connected to Supabase' : 'Preview Mode'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={onSelectEvent}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
