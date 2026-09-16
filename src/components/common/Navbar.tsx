import React, { useState } from 'react';
import { 
  CalendarDays, 
  Menu, 
  X, 
  Ticket, 
  LayoutDashboard, 
  CalendarRange, 
  Users, 
  BarChart3, 
  LogIn, 
  UserPlus, 
  LogOut,
  ChevronDown,
  Sparkles,
  User as UserIcon,
  Shield
} from 'lucide-react';
import { PageId } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId, eventId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();

  const handleNav = (page: PageId, eventId?: string) => {
    onNavigate(page, eventId);
    setMobileMenuOpen(false);
    setAdminDropdownOpen(false);
    setUserMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    onNavigate('home');
  };

  const isAdminActive = [
    'admin-dashboard',
    'event-management',
    'attendee-list',
    'reports'
  ].includes(currentPage);

  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div 
            onClick={() => handleNav('home')} 
            className="flex items-center gap-3 cursor-pointer group"
            id="brand-logo-button"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:bg-emerald-700 transition-colors">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                  Nowshera<span className="text-emerald-600 font-black">Events</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Co.
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block -mt-0.5">
                Workshops &bull; Seminars &bull; Community
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              id="nav-home-btn"
              onClick={() => handleNav('home')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'home'
                  ? 'text-emerald-700 bg-emerald-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>

            <button
              id="nav-upcoming-events-btn"
              onClick={() => handleNav('upcoming-events')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'upcoming-events' || currentPage === 'event-details'
                  ? 'text-emerald-700 bg-emerald-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Upcoming Events
            </button>

            {user && (
              <button
                id="nav-my-registrations-btn"
                onClick={() => handleNav('my-registrations')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentPage === 'my-registrations'
                    ? 'text-emerald-700 bg-emerald-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Ticket className="w-4 h-4 text-emerald-600" />
                <span>My Registrations</span>
              </button>
            )}

            {/* Admin Dropdown (Visible only if Admin) */}
            {isAdmin && (
              <div className="relative">
                <button
                  id="nav-admin-menu-toggle"
                  onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isAdminActive
                      ? 'text-emerald-700 bg-emerald-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Admin & Reports</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${adminDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {adminDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setAdminDropdownOpen(false)}
                  >
                    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                      <span>Organizer Workspace</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Admin</span>
                    </div>
                    <button
                      id="admin-subnav-dashboard"
                      onClick={() => handleNav('admin-dashboard')}
                      className="w-full px-3.5 py-2 text-left text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      <span>Admin Dashboard</span>
                    </button>
                    <button
                      id="admin-subnav-management"
                      onClick={() => handleNav('event-management')}
                      className="w-full px-3.5 py-2 text-left text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 cursor-pointer"
                    >
                      <CalendarRange className="w-4 h-4 text-slate-400" />
                      <span>Event Management</span>
                    </button>
                    <button
                      id="admin-subnav-attendees"
                      onClick={() => handleNav('attendee-list')}
                      className="w-full px-3.5 py-2 text-left text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>Attendee List</span>
                    </button>
                    <button
                      id="admin-subnav-reports"
                      onClick={() => handleNav('reports')}
                      className="w-full px-3.5 py-2 text-left text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 cursor-pointer"
                    >
                      <BarChart3 className="w-4 h-4 text-slate-400" />
                      <span>Reports & Analytics</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Desktop Right Auth Actions */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button
                  id="user-profile-menu-toggle"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left leading-tight hidden lg:block">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{displayName}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{profile?.role || 'attendee'}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in duration-150"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                        Role: {profile?.role || 'attendee'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleNav('my-registrations')}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Registrations</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => handleNav('admin-dashboard')}
                        className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        id="user-logout-btn"
                        onClick={handleSignOut}
                        className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  id="nav-login-btn"
                  onClick={() => handleNav('login')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    currentPage === 'login'
                      ? 'text-emerald-700 bg-emerald-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>

                <button
                  id="nav-register-btn"
                  onClick={() => handleNav('register')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl">
          {user && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{displayName}</p>
                <p className="text-[11px] text-slate-500">{user.email}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 uppercase">
                {profile?.role || 'attendee'}
              </span>
            </div>
          )}

          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              Navigation
            </div>
            <button
              id="mobile-nav-home"
              onClick={() => handleNav('home')}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-base font-medium text-left ${
                currentPage === 'home' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-700'
              }`}
            >
              Home
            </button>
            <button
              id="mobile-nav-upcoming"
              onClick={() => handleNav('upcoming-events')}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-base font-medium text-left ${
                currentPage === 'upcoming-events' || currentPage === 'event-details' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-700'
              }`}
            >
              Upcoming Events
            </button>
            {user && (
              <button
                id="mobile-nav-registrations"
                onClick={() => handleNav('my-registrations')}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-medium text-left ${
                  currentPage === 'my-registrations' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-700'
                }`}
              >
                <Ticket className="w-4 h-4 text-emerald-600" />
                <span>My Registrations</span>
              </button>
            )}
          </div>

          {isAdmin && (
            <div className="space-y-1 border-t border-slate-100 pt-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Organizer & Admin</span>
              </div>
              <button
                id="mobile-nav-admin"
                onClick={() => handleNav('admin-dashboard')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  currentPage === 'admin-dashboard' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </button>
              <button
                id="mobile-nav-management"
                onClick={() => handleNav('event-management')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  currentPage === 'event-management' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600'
                }`}
              >
                <CalendarRange className="w-4 h-4" />
                <span>Event Management</span>
              </button>
              <button
                id="mobile-nav-attendees"
                onClick={() => handleNav('attendee-list')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  currentPage === 'attendee-list' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Attendee List</span>
              </button>
              <button
                id="mobile-nav-reports"
                onClick={() => handleNav('reports')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  currentPage === 'reports' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Reports</span>
              </button>
            </div>
          )}

          <div className="border-t border-slate-100 pt-3">
            {user ? (
              <button
                id="mobile-nav-logout"
                onClick={handleSignOut}
                className="w-full py-2.5 px-3 rounded-lg border border-rose-200 text-rose-600 font-semibold text-center text-sm flex items-center justify-center gap-1.5 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({displayName})</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="mobile-nav-login"
                  onClick={() => handleNav('login')}
                  className="w-full py-2.5 px-3 rounded-lg border border-slate-200 text-slate-700 font-medium text-center text-sm flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
                <button
                  id="mobile-nav-register"
                  onClick={() => handleNav('register')}
                  className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 text-white font-semibold text-center text-sm flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
