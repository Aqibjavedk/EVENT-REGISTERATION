import React from 'react';
import { CalendarDays, MapPin, Mail, Phone, ExternalLink, ShieldCheck } from 'lucide-react';
import { PageId } from '../../types';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <CalendarDays className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                Nowshera<span className="text-emerald-400">Events</span> Co.
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Empowering the community in Nowshera through accessible workshops, professional seminars, 
              and grassroots networking events. Bridging youth, local businesses, educators, and technology.
            </p>
            <div className="space-y-2 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Nowshera Cantt & District Center, Khyber Pakhtunkhwa, Pakistan</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>info@nowshera-events.org</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+92 923 555-EVENT</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('upcoming-events')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Upcoming Events
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('my-registrations')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  My Registrations
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('login')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Attendee Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('register')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Create Account
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Administration */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Organizers & Admin
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('admin-dashboard')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Admin Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('event-management')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Event Management
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('attendee-list')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Attendee List
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('reports')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Reports & Metrics
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Architecture note */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Nowshera Events Co. All rights reserved.
          </div>
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target Architecture: Frontend &bull; FastAPI &bull; Supabase &bull; n8n</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
