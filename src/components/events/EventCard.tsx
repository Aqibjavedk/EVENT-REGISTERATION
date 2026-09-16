import React from 'react';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';
import { EventItem } from '../../types';
import { EventStatusBadge, EventCategoryBadge } from '../common/Badge';
import { Button } from '../common/Button';

interface EventCardProps {
  event: EventItem;
  onViewDetails: (eventId: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onViewDetails }) => {
  const percentFilled = Math.min(
    100,
    Math.round((event.registeredCount / event.capacity) * 100)
  );

  return (
    <div
      id={`event-card-${event.id}`}
      className="group flex flex-col bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Featured Header / Image */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
        {event.featuredImage ? (
          <img
            src={event.featuredImage}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-bold text-xl">
            {event.category}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
        
        {/* Badges on top */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <EventCategoryBadge category={event.category} />
          <span className="bg-slate-900/80 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-md border border-white/10">
            {event.price}
          </span>
        </div>

        {/* Date pill overlay at bottom of image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium text-white/95">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{event.date}</span>
          </div>
          <span className="text-xs text-white/80 bg-black/40 px-2 py-0.5 rounded">
            {event.venueType}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Status Row */}
          <div className="mb-2.5">
            <EventStatusBadge status={event.status} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 mb-2 leading-snug">
            {event.title}
          </h3>

          {/* Short Description */}
          <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
            {event.shortDescription}
          </p>

          {/* Meta Details */}
          <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate" title={event.location}>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                Capacity: <strong>{event.capacity}</strong> attendees ({event.registeredCount} booked)
              </span>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Availability</span>
              <span className="font-semibold text-slate-700">
                {event.capacity - event.registeredCount > 0
                  ? `${event.capacity - event.registeredCount} seats remaining`
                  : 'At full capacity'}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
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
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            By <span className="font-medium text-slate-700">{event.organizer.organization}</span>
          </div>
          <Button
            id={`view-details-btn-${event.id}`}
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(event.id)}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="group-hover:border-emerald-600 group-hover:text-emerald-700 group-hover:bg-emerald-50/50"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};
