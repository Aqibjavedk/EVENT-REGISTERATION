import React, { useState, useEffect } from 'react';
import { PageId } from './types';
import { INITIAL_SAMPLE_EVENTS } from './services/eventService';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { UpcomingEventsPage } from './pages/UpcomingEventsPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MyRegistrationsPage } from './pages/MyRegistrationsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { EventManagementPage } from './pages/EventManagementPage';
import { AttendeeListPage } from './pages/AttendeeListPage';
import { ReportsPage } from './pages/ReportsPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [selectedEventId, setSelectedEventId] = useState<string | null>('ev-1');

  // URL Hash synchronization for browser history & back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) {
        setCurrentPage('home');
        return;
      }

      if (hash.startsWith('event-details/')) {
        const id = hash.replace('event-details/', '');
        setSelectedEventId(id);
        setCurrentPage('event-details');
      } else if (
        [
          'home',
          'upcoming-events',
          'event-details',
          'login',
          'register',
          'my-registrations',
          'admin-dashboard',
          'event-management',
          'attendee-list',
          'reports',
        ].includes(hash)
      ) {
        setCurrentPage(hash as PageId);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: PageId, eventId?: string) => {
    if (page === 'event-details') {
      const id = eventId || selectedEventId || 'ev-1';
      setSelectedEventId(id);
      window.location.hash = `event-details/${id}`;
    } else {
      window.location.hash = page;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    navigateTo('event-details', eventId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateTo}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            featuredEvents={INITIAL_SAMPLE_EVENTS}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'upcoming-events' && (
          <UpcomingEventsPage
            onSelectEvent={handleSelectEvent}
          />
        )}

        {currentPage === 'event-details' && (
          <EventDetailsPage
            eventId={selectedEventId}
            onBack={() => navigateTo('upcoming-events')}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'login' && (
          <LoginPage
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'register' && (
          <RegisterPage
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'my-registrations' && (
          <MyRegistrationsPage
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'admin-dashboard' && (
          <AdminDashboardPage
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'event-management' && (
          <EventManagementPage
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'attendee-list' && (
          <AttendeeListPage
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'reports' && (
          <ReportsPage
            onNavigate={navigateTo}
          />
        )}
      </main>

      {/* Site Footer */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
}
