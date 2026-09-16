import React from 'react';
import { EventStatus, EventCategory, RegistrationStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'rose' | 'blue' | 'indigo' | 'slate' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  className = '',
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
    blue: 'bg-sky-50 text-sky-700 border-sky-200/80',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 font-medium',
    md: 'text-sm px-3 py-1 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border whitespace-nowrap ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const EventStatusBadge: React.FC<{ status: EventStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'sm',
}) => {
  switch (status) {
    case 'Open':
      return (
        <Badge variant="emerald" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Open for Registration
        </Badge>
      );
    case 'Limited':
      return (
        <Badge variant="amber" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Few Seats Left
        </Badge>
      );
    case 'Sold Out':
      return (
        <Badge variant="rose" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Sold Out
        </Badge>
      );
    case 'Completed':
      return (
        <Badge variant="slate" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Completed
        </Badge>
      );
    case 'Draft':
      return (
        <Badge variant="indigo" size={size}>
          Draft
        </Badge>
      );
    case 'Cancelled':
      return (
        <Badge variant="rose" size={size}>
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="slate" size={size}>{status}</Badge>;
  }
};

export const EventCategoryBadge: React.FC<{ category: EventCategory }> = ({ category }) => {
  const map: Record<EventCategory, 'blue' | 'purple' | 'emerald' | 'indigo' | 'amber' | 'slate'> = {
    Workshop: 'blue',
    Seminar: 'purple',
    Community: 'emerald',
    Technology: 'indigo',
    Business: 'amber',
    Education: 'blue',
  };

  return <Badge variant={map[category] || 'slate'}>{category}</Badge>;
};

export const RegistrationStatusBadge: React.FC<{ status: RegistrationStatus }> = ({ status }) => {
  switch (status) {
    case 'Confirmed':
      return <Badge variant="emerald">Confirmed</Badge>;
    case 'Waitlisted':
      return <Badge variant="amber">Waitlisted</Badge>;
    case 'Attended':
      return <Badge variant="blue">Attended</Badge>;
    case 'Cancelled':
      return <Badge variant="rose">Cancelled</Badge>;
  }
};
