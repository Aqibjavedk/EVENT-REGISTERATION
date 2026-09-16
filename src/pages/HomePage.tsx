import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  ArrowRight, 
  Sparkles, 
  GraduationCap, 
  Briefcase, 
  Globe2, 
  Clock,
  MapPin,
  Users
} from 'lucide-react';
import { PageId, EventItem } from '../types';
import { Button } from '../components/common/Button';
import { EventCard } from '../components/events/EventCard';
import { supabaseService, mapDbEventToEventItem } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';

interface HomePageProps {
  featuredEvents: EventItem[];
  onNavigate: (page: PageId, eventId?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ featuredEvents, onNavigate }) => {
  const [liveEvents, setLiveEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data: dbEvents, activeCounts } = await supabaseService.getUpcomingEvents();
        if (dbEvents && dbEvents.length > 0) {
          setLiveEvents(dbEvents.slice(0, 3).map(ev => mapDbEventToEventItem(ev, activeCounts[ev.id] || 0)));
        } else {
          setLiveEvents(featuredEvents.slice(0, 3));
        }
      } else {
        setLiveEvents(featuredEvents.slice(0, 3));
      }
    } catch {
      setLiveEvents(featuredEvents.slice(0, 3));
    } finally {
      setIsLoading(false);
    }
  };

  const topEvents = liveEvents.length > 0 ? liveEvents : featuredEvents.slice(0, 3);

  const categories = [
    { title: 'Tech Workshops', count: '12+ Planned', icon: <Sparkles className="w-5 h-5 text-emerald-600" />, desc: 'AI, coding, digital skills & automation labs.' },
    { title: 'Public Seminars', count: '8+ Planned', icon: <GraduationCap className="w-5 h-5 text-blue-600" />, desc: 'Academic, agricultural, and healthcare symposia.' },
    { title: 'Community Summits', count: '15+ Planned', icon: <Globe2 className="w-5 h-5 text-amber-600" />, desc: 'Eco initiatives, cultural galas & civic forums.' },
    { title: 'Business & Trade', count: '6+ Planned', icon: <Briefcase className="w-5 h-5 text-indigo-600" />, desc: 'SME financing, e-commerce & retail logistics.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-16 sm:py-24 border-b border-slate-800">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <CalendarDays className="w-4 h-4" />
              <span>The Premier Event Portal for Nowshera District</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Discover & Register for Workshops, Seminars & Community Events
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Nowshera Events Co. connects passionate learners, professionals, and community leaders. 
              Find upcoming hands-on masterclasses, scientific seminars, and civic meetups right in your city.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                id="hero-explore-events-btn"
                variant="primary"
                size="lg"
                onClick={() => onNavigate('upcoming-events')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                Browse Upcoming Events
              </Button>
              <Button
                id="hero-my-tickets-btn"
                variant="outline"
                size="lg"
                onClick={() => onNavigate('my-registrations')}
                className="bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                View My Registrations
              </Button>
            </div>

            {/* Quick Metrics */}
            <div className="pt-8 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-left">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">100%</div>
                <div className="text-xs text-slate-400 mt-0.5">Verified Organizers</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">500+</div>
                <div className="text-xs text-slate-400 mt-0.5">Seats Reserved</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">Nowshera</div>
                <div className="text-xs text-slate-400 mt-0.5">District Coverage</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Spotlight */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Browse by Category
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Curated learning tracks and gatherings designed for Khyber Pakhtunkhwa's brightest minds.
              </p>
            </div>
            <button
              onClick={() => onNavigate('upcoming-events')}
              className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>See all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('upcoming-events')}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 w-fit mb-4 group-hover:border-emerald-200 transition-colors">
                  {cat.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {cat.desc}
                </p>
                <div className="mt-3 text-[11px] font-semibold text-emerald-700">
                  {cat.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Upcoming Events */}
      <section className="py-14 sm:py-18 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-600">
              Featured Programs
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Top Upcoming Gatherings in Nowshera
            </h2>
          </div>
          <Button
            id="view-all-upcoming-btn"
            variant="outline"
            size="sm"
            onClick={() => onNavigate('upcoming-events')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Explore All Events
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {topEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onViewDetails={(id) => onNavigate('event-details', id)}
            />
          ))}
        </div>
      </section>

      {/* Why Choose Nowshera Events Co. */}
      <section className="py-14 bg-slate-100 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Built for Community Impact
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              A unified platform to bridge learners, organizations, and public service initiatives across Nowshera.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4">
                01
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Verified Venues & Speakers</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every workshop and seminar is vetted by local academic and professional partners to ensure real actionable learning.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
                02
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Instant Digital Badging</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Receive verifiable digital badges and attendance records to showcase your continuous development in Nowshera.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-4">
                03
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Open Civic Collaboration</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Connect directly with fellow engineers, farmers, doctors, and students to spark regional community projects.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
