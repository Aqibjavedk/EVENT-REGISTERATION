import { EventItem, RegistrationItem, AttendeeRecord } from '../types';

export const INITIAL_SAMPLE_EVENTS: EventItem[] = [
  {
    id: 'ev-1',
    title: 'Nowshera Digital Skills & AI Hands-On Workshop',
    shortDescription: 'A practical, 4-hour immersive workshop covering modern AI tools, Python automation, and freelancing techniques for youths and professionals in Nowshera.',
    fullDescription: 'Join industry leaders and tech mentors at the Nowshera Civic & IT Center for a comprehensive hands-on workshop designed to boost your digital competencies. Participants will learn how to leverage generative AI in workplace workflows, explore Python scripting for routine data tasks, and get direct mentorship on launching successful remote freelance careers.\n\nAll attendees will receive digital certificates of completion, course materials, and access to the Nowshera Tech Community discord server.',
    category: 'Workshop',
    date: 'October 12, 2026',
    time: '09:30 AM - 02:00 PM',
    location: 'Nowshera IT Park, Grand Trunk Road, Nowshera Cantt',
    venueType: 'In-Person',
    capacity: 120,
    registeredCount: 88,
    status: 'Open',
    price: 'Free',
    organizer: {
      name: 'Engr. Tariq Khattak',
      organization: 'KP Youth Tech Network',
      contactEmail: 'tech@nowshera-events.org',
      phone: '+92 923 555123'
    },
    featuredImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    agenda: [
      { time: '09:30 AM', activity: 'Registration & Welcome Coffee', speaker: 'Event Committee' },
      { time: '10:00 AM', activity: 'Demystifying Modern AI Tools for Daily Productivity', speaker: 'Engr. Tariq Khattak' },
      { time: '11:30 AM', activity: 'Hands-on Python Automation Lab', speaker: 'Sara Ahmad, Senior Data Scientist' },
      { time: '01:00 PM', activity: 'Freelancing & Remote Work Playbook in 2026', speaker: 'Bilal Khan, Top-Rated Freelancer' },
      { time: '01:45 PM', activity: 'Q&A & Certificate Distribution', speaker: 'Panel' }
    ],
    requirements: [
      'Bring a personal laptop with Google Chrome or Firefox installed',
      'Basic familiarity with computers and web browsing',
      'Valid student or national identity card for check-in'
    ],
    tags: ['Artificial Intelligence', 'Digital Skills', 'Career Growth', 'Students']
  },
  {
    id: 'ev-2',
    title: 'Regional AgriTech & Modern Irrigation Seminar',
    shortDescription: 'Discover smart water management, drip irrigation technology, and sustainable farming methods tailored for Khyber Pakhtunkhwa soils.',
    fullDescription: 'Water conservation and climate-resilient farming are vital for sustainable agricultural yields across the Kabul River and Nowshera farming belts. This seminar convenes agronomists, soil engineers, and local farming cooperatives to showcase cost-effective drip irrigation systems, satellite soil moisture sensors, and solar-powered tube wells.',
    category: 'Seminar',
    date: 'October 25, 2026',
    time: '10:00 AM - 01:30 PM',
    location: 'District Agriculture Hall, Shaidu Road, Nowshera',
    venueType: 'Hybrid',
    capacity: 80,
    registeredCount: 74,
    status: 'Limited',
    price: 'Free',
    organizer: {
      name: 'Dr. Arshad Mehmood',
      organization: 'Khyber Agricultural Research Institute',
      contactEmail: 'agri.seminars@nowshera-events.org',
      phone: '+92 923 555456'
    },
    featuredImage: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80',
    agenda: [
      { time: '10:00 AM', activity: 'Keynote: KP Water Challenges & Agricultural Horizons', speaker: 'Dr. Arshad Mehmood' },
      { time: '11:00 AM', activity: 'Solar Water Systems Case Studies', speaker: 'Engr. Hamza Jan' },
      { time: '12:15 PM', activity: 'Government Subsidies & Farmer Support Schemes', speaker: 'Directorate of Agriculture' }
    ],
    requirements: [
      'Open to local farmers, agriculture students, and commercial growers',
      'Pre-registration required due to limited auditorium seating'
    ],
    tags: ['Agriculture', 'Sustainability', 'Water Conservation', 'Innovation']
  },
  {
    id: 'ev-3',
    title: 'Nowshera Community Clean & Green Eco Summit',
    shortDescription: 'A grassroots community gathering focusing on urban afforestation, plastic waste reduction, and eco-clubs in schools.',
    fullDescription: 'Join passionate citizen volunteers, environmental activists, and local municipal officers for an engaging summit dedicated to greening Nowshera city and preserving the banks of the Kabul River. Featuring breakout discussion tables, interactive waste recycling demos, and a sapling distribution initiative.',
    category: 'Community',
    date: 'November 05, 2026',
    time: '02:00 PM - 05:30 PM',
    location: 'Nowshera Community Hall, River View Enclave',
    venueType: 'In-Person',
    capacity: 150,
    registeredCount: 150,
    status: 'Sold Out',
    price: 'Free',
    organizer: {
      name: 'Amina Gul',
      organization: 'Clean Nowshera Action Group',
      contactEmail: 'green@nowshera-events.org'
    },
    featuredImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    agenda: [
      { time: '02:00 PM', activity: 'Opening Remarks & Community Report Card', speaker: 'Amina Gul' },
      { time: '03:00 PM', activity: 'Solid Waste Segregation Workshop', speaker: 'Municipal Sanitation Board' },
      { time: '04:15 PM', activity: 'Pledge & 500 Saplings Handout', speaker: 'Volunteer Leads' }
    ],
    requirements: ['Bring a reusable water flask', 'Open to all family members and youth'],
    tags: ['Environment', 'Community', 'Green Living', 'Youth Action']
  },
  {
    id: 'ev-4',
    title: 'Small Business Financing & E-Commerce Seminar',
    shortDescription: 'Learn practical micro-financing strategies, digital payment integration, and how to sell products nationwide using online storefronts.',
    fullDescription: 'Tailored for small business owners, retail shopkeepers, and aspiring home entrepreneurs in Nowshera and surrounding districts. Get direct insights from banking experts on concessionary SME loans, setting up merchant digital bank accounts, and expanding retail reach via modern marketplace platforms.',
    category: 'Business',
    date: 'November 14, 2026',
    time: '11:00 AM - 03:00 PM',
    location: 'Chamber of Commerce Conference Suite, Risalpur Road, Nowshera',
    venueType: 'In-Person',
    capacity: 90,
    registeredCount: 42,
    status: 'Open',
    price: 'Free',
    organizer: {
      name: 'Kamran Shah',
      organization: 'District Small & Medium Enterprise Forum',
      contactEmail: 'sme@nowshera-events.org',
      phone: '+92 923 555789'
    },
    featuredImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
    agenda: [
      { time: '11:00 AM', activity: 'Navigating Bank SME Finance Schemes', speaker: 'Kamran Shah' },
      { time: '12:30 PM', activity: 'Setting up Online Order Fulfillment & Courier Logistics', speaker: 'Faizan Ullah' },
      { time: '02:00 PM', activity: 'Taxation & Legal Compliance for Traders', speaker: 'Tax Consultant Panel' }
    ],
    requirements: ['Business owners or aspiring entrepreneurs', 'Notebook or tablet for financial worksheets'],
    tags: ['Business', 'E-Commerce', 'Finance', 'Startups']
  },
  {
    id: 'ev-5',
    title: 'Maternal & Public Health Education Workshop',
    shortDescription: 'Community health education workshop focusing on infant nutrition, preventive healthcare, and accessible clinical services.',
    fullDescription: 'A collaborative public healthcare outreach workshop organized in coordination with district health officers and clinical pediatricians. Designed for community health workers, lady health visitors (LHVs), and young mothers to enhance family wellness and emergency first-aid awareness.',
    category: 'Education',
    date: 'November 28, 2026',
    time: '10:00 AM - 01:00 PM',
    location: 'Qazi Hussain Ahmad Medical Complex Auditorium, Nowshera',
    venueType: 'In-Person',
    capacity: 100,
    registeredCount: 65,
    status: 'Open',
    price: 'Free',
    organizer: {
      name: 'Dr. Fatima Zahra',
      organization: 'Nowshera Healthcare Alliance',
      contactEmail: 'health@nowshera-events.org'
    },
    featuredImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    agenda: [
      { time: '10:00 AM', activity: 'Preventive Healthcare in Rural & Urban Communities', speaker: 'Dr. Fatima Zahra' },
      { time: '11:15 AM', activity: 'First Aid Protocols & CPR Simulation', speaker: 'Rescue 1122 Trainers' },
      { time: '12:30 PM', activity: 'Free Health Screening & Consultations', speaker: 'Medical Staff' }
    ],
    requirements: ['No prior medical experience needed', 'Free informational handbooks provided'],
    tags: ['Health', 'First Aid', 'Public Wellness', 'Community']
  },
  {
    id: 'ev-6',
    title: 'Cybersecurity & Online Safety for Schools & Colleges',
    shortDescription: 'An interactive seminar to protect students and educators against cyber fraud, social media impersonation, and phishing threats.',
    fullDescription: 'With rapid smartphone adoption among youth, digital safety literacy has become crucial. This educational seminar guides school principals, teachers, and college students on password hygiene, detecting scam messages, safeguarding private photos, and reporting cyber harassment to legal authorities.',
    category: 'Technology',
    date: 'December 05, 2026',
    time: '10:30 AM - 01:30 PM',
    location: 'Government Post Graduate College Hall, Nowshera',
    venueType: 'In-Person',
    capacity: 110,
    registeredCount: 30,
    status: 'Open',
    price: 'Free',
    organizer: {
      name: 'Muhammad Asif',
      organization: 'Cyber Defense Advocates KP',
      contactEmail: 'safety@nowshera-events.org'
    },
    featuredImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    agenda: [
      { time: '10:30 AM', activity: 'Modern Digital Threats: Phishing & Identity Theft', speaker: 'Muhammad Asif' },
      { time: '11:45 AM', activity: 'Two-Factor Authentication & Account Security Clinic', speaker: 'IT Mentors' },
      { time: '12:45 PM', activity: 'Reporting Mechanisms and Legal Safeguards', speaker: 'Legal Advisor' }
    ],
    requirements: ['Open to students aged 14+ and teachers', 'Bring smartphone for 2FA security walkthrough'],
    tags: ['Cybersecurity', 'Safety', 'Technology', 'Education']
  }
];

export const INITIAL_SAMPLE_REGISTRATIONS: RegistrationItem[] = [
  {
    id: 'reg-101',
    eventId: 'ev-1',
    eventTitle: 'Nowshera Digital Skills & AI Hands-On Workshop',
    eventDate: 'October 12, 2026',
    eventTime: '09:30 AM - 02:00 PM',
    eventLocation: 'Nowshera IT Park, Grand Trunk Road, Nowshera Cantt',
    attendeeName: 'Javed Aqib',
    attendeeEmail: 'javedaqib814@gmail.com',
    attendeePhone: '+92 300 1234567',
    registeredAt: '2026-09-01 14:32',
    status: 'Confirmed',
    ticketCode: 'NEC-2026-8812'
  },
  {
    id: 'reg-102',
    eventId: 'ev-2',
    eventTitle: 'Regional AgriTech & Modern Irrigation Seminar',
    eventDate: 'October 25, 2026',
    eventTime: '10:00 AM - 01:30 PM',
    eventLocation: 'District Agriculture Hall, Shaidu Road, Nowshera',
    attendeeName: 'Javed Aqib',
    attendeeEmail: 'javedaqib814@gmail.com',
    attendeePhone: '+92 300 1234567',
    registeredAt: '2026-09-08 10:15',
    status: 'Confirmed',
    ticketCode: 'NEC-2026-3490'
  }
];

export const INITIAL_SAMPLE_ATTENDEES: AttendeeRecord[] = [
  {
    id: 'att-1',
    eventId: 'ev-1',
    eventTitle: 'Nowshera Digital Skills & AI Hands-On Workshop',
    name: 'Javed Aqib',
    email: 'javedaqib814@gmail.com',
    phone: '+92 300 1234567',
    organization: 'Nowshera Tech Guild',
    registrationDate: '2026-09-01',
    status: 'Registered',
    ticketType: 'General'
  },
  {
    id: 'att-2',
    eventId: 'ev-1',
    eventTitle: 'Nowshera Digital Skills & AI Hands-On Workshop',
    name: 'Fatima Noor',
    email: 'fatima.noor@university.edu.pk',
    phone: '+92 301 9876543',
    organization: 'University of Peshawar',
    registrationDate: '2026-09-02',
    status: 'Checked In',
    ticketType: 'Student'
  },
  {
    id: 'att-3',
    eventId: 'ev-1',
    eventTitle: 'Nowshera Digital Skills & AI Hands-On Workshop',
    name: 'Zeeshan Ali',
    email: 'zeeshan.khattak@gmail.com',
    phone: '+92 333 4567890',
    organization: 'Freelance Developer',
    registrationDate: '2026-09-03',
    status: 'Registered',
    ticketType: 'General'
  },
  {
    id: 'att-4',
    eventId: 'ev-2',
    eventTitle: 'Regional AgriTech & Modern Irrigation Seminar',
    name: 'Malik Sheraz',
    email: 'sheraz.farm@nowshera.pk',
    phone: '+92 312 3456789',
    organization: 'Kabul River Growers Group',
    registrationDate: '2026-09-05',
    status: 'Checked In',
    ticketType: 'VIP'
  },
  {
    id: 'att-5',
    eventId: 'ev-3',
    eventTitle: 'Nowshera Community Clean & Green Eco Summit',
    name: 'Sanaullah Khan',
    email: 'sana.volunteer@eco.org',
    phone: '+92 345 6789012',
    organization: 'Nowshera Scouts',
    registrationDate: '2026-09-07',
    status: 'Registered',
    ticketType: 'General'
  }
];

/**
 * EventService provides an abstraction layer over event data.
 * When Supabase and FastAPI are connected later, the calls inside these methods
 * will call the FastAPI endpoints (e.g., `fetch('/api/v1/events')`) or Supabase Client.
 */
class EventService {
  private events: EventItem[] = [...INITIAL_SAMPLE_EVENTS];
  private registrations: RegistrationItem[] = [...INITIAL_SAMPLE_REGISTRATIONS];
  private attendees: AttendeeRecord[] = [...INITIAL_SAMPLE_ATTENDEES];

  async getEvents(): Promise<EventItem[]> {
    // Simulated network latency for realistic feel
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.events]), 150);
    });
  }

  async getEventById(id: string): Promise<EventItem | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = this.events.find((e) => e.id === id);
        resolve(found ? { ...found } : null);
      }, 150);
    });
  }

  async getMyRegistrations(): Promise<RegistrationItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.registrations]), 150);
    });
  }

  async getAttendees(eventId?: string): Promise<AttendeeRecord[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!eventId || eventId === 'all') {
          resolve([...this.attendees]);
        } else {
          resolve(this.attendees.filter((a) => a.eventId === eventId));
        }
      }, 150);
    });
  }

  async createEvent(eventData: Omit<EventItem, 'id' | 'registeredCount'>): Promise<EventItem> {
    const newEvent: EventItem = {
      ...eventData,
      id: `ev-${Date.now()}`,
      registeredCount: 0
    };
    this.events.unshift(newEvent);
    return newEvent;
  }

  async updateEventStatus(id: string, status: EventItem['status']): Promise<boolean> {
    const ev = this.events.find((e) => e.id === id);
    if (ev) {
      ev.status = status;
      return true;
    }
    return false;
  }

  async toggleAttendeeCheckIn(attendeeId: string): Promise<boolean> {
    const att = this.attendees.find((a) => a.id === attendeeId);
    if (att) {
      att.status = att.status === 'Checked In' ? 'Registered' : 'Checked In';
      return true;
    }
    return false;
  }
}

export const eventService = new EventService();
