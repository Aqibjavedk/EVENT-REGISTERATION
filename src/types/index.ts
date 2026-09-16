export type UserRole = 'attendee' | 'admin';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface DbEvent {
  id: string | number;
  title: string;
  description: string;
  event_date: string; // e.g. "2026-10-24"
  event_time: string; // e.g. "10:00 AM" or "10:00:00"
  location: string;
  capacity: number;
  status: 'published' | 'draft' | 'completed' | 'cancelled' | string;
  created_at?: string;
  updated_at?: string;
}

export interface DbRegistration {
  id: string | number;
  user_id: string;
  event_id: string | number;
  status: 'active' | 'cancelled' | string;
  created_at?: string;
  updated_at?: string;
}

export interface UserRegistrationWithEvent extends DbRegistration {
  event?: DbEvent;
  events?: DbEvent;
  profile?: Profile;
  profiles?: Profile;
}

export interface DbRegistrationWithEvent extends DbRegistration {
  event?: DbEvent;
  events?: DbEvent;
  profile?: Profile;
  profiles?: Profile;
}

export interface RegistrationWithProfileAndEvent extends DbRegistration {
  profile?: Profile;
  profiles?: Profile;
  event?: DbEvent;
  events?: DbEvent;
}

export type EventStatus = 'Open' | 'Limited' | 'Sold Out' | 'Completed' | 'Draft' | 'Cancelled';

export type EventCategory = 'Workshop' | 'Seminar' | 'Community' | 'Technology' | 'Business' | 'Education';

export interface EventItem {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: EventCategory;
  date: string; // ISO or readable date (e.g. "October 24, 2026")
  time: string; // e.g. "10:00 AM - 02:00 PM"
  location: string;
  venueType: 'In-Person' | 'Hybrid' | 'Online';
  capacity: number;
  registeredCount: number;
  status: EventStatus;
  price: string; // e.g. "Free" or "PKR 500"
  organizer: {
    name: string;
    organization: string;
    contactEmail: string;
    phone?: string;
  };
  featuredImage?: string;
  agenda?: {
    time: string;
    activity: string;
    speaker?: string;
  }[];
  requirements?: string[];
  tags: string[];
}

export type RegistrationStatus = 'Confirmed' | 'Waitlisted' | 'Cancelled' | 'Attended';

export interface RegistrationItem {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  registeredAt: string;
  status: RegistrationStatus;
  ticketCode: string;
}

export interface AttendeeRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  name: string;
  email: string;
  phone: string;
  organization?: string;
  registrationDate: string;
  status: 'Registered' | 'Checked In' | 'Cancelled';
  ticketType: 'General' | 'Student' | 'VIP';
}

export interface ReportMetric {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  description: string;
}

export type PageId = 
  | 'home'
  | 'upcoming-events'
  | 'event-details'
  | 'login'
  | 'register'
  | 'my-registrations'
  | 'admin-dashboard'
  | 'event-management'
  | 'attendee-list'
  | 'reports';
