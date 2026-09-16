import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  PieChart, 
  Calendar, 
  Users, 
  CheckCircle,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { PageId } from '../types';
import { INITIAL_SAMPLE_EVENTS } from '../services/eventService';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

interface ReportsPageProps {
  onNavigate: (page: PageId) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigate }) => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Admin Access Required</h2>
          <p className="text-sm text-slate-600 mb-6">
            Only administrators with <code className="text-emerald-700 font-mono">role = &quot;admin&quot;</code> can access this page.
          </p>
          <Button variant="primary" onClick={() => onNavigate('home')} fullWidth>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  // Analytical calculations
  const totalEvents = INITIAL_SAMPLE_EVENTS.length;
  const totalCapacity = INITIAL_SAMPLE_EVENTS.reduce((acc, ev) => acc + ev.capacity, 0);
  const totalRegistered = INITIAL_SAMPLE_EVENTS.reduce((acc, ev) => acc + ev.registeredCount, 0);
  const averageSeats = Math.round(totalCapacity / totalEvents);

  const categoryCounts = INITIAL_SAMPLE_EVENTS.reduce((acc, ev) => {
    acc[ev.category] = (acc[ev.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Executive Reporting</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Reports & Attendance Analytics
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Performance metrics, capacity fill trends, and participant engagement across Nowshera.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => alert('Exporting full analytics workbook...')}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Executive PDF
          </Button>
        </div>

        {/* 3 Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Overall Seat Absorption</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {Math.round((totalRegistered / totalCapacity) * 100)}%
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {totalRegistered} of {totalCapacity} seats filled
            </p>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{ width: `${(totalRegistered / totalCapacity) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Avg. Event Size</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {averageSeats} <span className="text-base font-normal text-slate-500">attendees</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Targeted capacity per venue in Nowshera
            </p>
            <div className="mt-4 text-xs font-semibold text-blue-600">
              Optimal room utilization
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Registered Youth / Students</span>
              <CheckCircle className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              62.4%
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Primary demographic: Higher secondary & universities
            </p>
            <div className="mt-4 text-xs font-semibold text-purple-600">
              High youth empowerment alignment
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Per-Event Capacity Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Program Capacity Utilization</span>
              </h3>
              <span className="text-xs text-slate-400">Current Cohort</span>
            </div>

            <div className="space-y-4">
              {INITIAL_SAMPLE_EVENTS.map(ev => {
                const fillPercent = Math.min(100, Math.round((ev.registeredCount / ev.capacity) * 100));
                return (
                  <div key={ev.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-800 truncate max-w-[260px] font-bold">
                        {ev.title}
                      </span>
                      <span className="text-slate-600 font-mono">
                        {ev.registeredCount}/{ev.capacity} ({fillPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          fillPercent >= 100 ? 'bg-rose-500' : fillPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-600" />
                <span>Events by Category</span>
              </h3>
              <span className="text-xs text-slate-400">All Time</span>
            </div>

            <div className="space-y-3">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const percent = Math.round((count / totalEvents) * 100);
                return (
                  <div key={cat} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      <span className="font-bold text-slate-800">{cat}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">{count} {count === 1 ? 'event' : 'events'}</span>
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-900">Planned FastAPI & n8n Integration:</div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                When the FastAPI backend is connected, automated monthly digests and RSVP attendance alerts will be handled via n8n automation pipelines and Supabase database triggers.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
