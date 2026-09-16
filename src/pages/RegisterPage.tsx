import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Ticket,
  LogIn
} from 'lucide-react';
import { PageId } from '../types';
import { Button } from '../components/common/Button';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface RegisterPageProps {
  onNavigate: (page: PageId) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userAlreadyExists, setUserAlreadyExists] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { refreshProfile } = useAuth();

  useEffect(() => {
    const savedEmail = localStorage.getItem('nowshera_auth_email');
    if (savedEmail && !email) {
      setEmail(savedEmail);
    }
  }, []);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    localStorage.setItem('nowshera_auth_email', val);
    setUserAlreadyExists(false);
    setErrorMessage(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setUserAlreadyExists(false);
    setSuccessMessage(null);

    if (!isSupabaseConfigured) {
      setErrorMessage(
        'Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment.'
      );
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Sign up user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            role: 'attendee', // As requested: after signup, treated as an attendee
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Check if user already exists
        if (data.user.identities && data.user.identities.length === 0) {
          setUserAlreadyExists(true);
          setErrorMessage(
            'An account with this email already exists. You can sign in using your password or request a Magic Link.'
          );
          setIsLoading(false);
          return;
        }

        // 2. Insert into profiles table with role: 'attendee'
        const profilePayload = {
          id: data.user.id,
          name: name.trim(),
          email: email.trim(),
          role: 'attendee', // Treated as attendee
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(profilePayload);

        if (profileError) {
          console.warn('Profile upsert notice:', profileError.message);
        }

        await refreshProfile();

        // Check if email confirmation is required by project settings
        if (data.session) {
          setSuccessMessage('Account registered successfully! Redirecting to upcoming events...');
          setTimeout(() => {
            onNavigate('upcoming-events');
          }, 1200);
        } else {
          setSuccessMessage(
            'Account created! If email confirmation is enabled on your Supabase project, check your inbox to confirm your registration.'
          );
        }
      }
    } catch (err: any) {
      console.warn('Registration response:', err);
      const msg = err.message || '';
      if (msg.toLowerCase().includes('already registered')) {
        setUserAlreadyExists(true);
        setErrorMessage('An account with this email is already registered. Please sign in instead.');
      } else {
        setErrorMessage(msg || 'Failed to create your account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-lg w-full mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-sm shadow-emerald-600/20 mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Attendee Account
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Register to RSVP for workshops, seminars & community gatherings in Nowshera
          </p>
        </div>

        {/* Configuration Notice if Supabase not set */}
        {!isSupabaseConfigured && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Supabase Connection Needed</span>
            </div>
            <p className="text-amber-700 leading-relaxed">
              To enable user registration, ensure <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_PUBLISHABLE_KEY</strong> are provided in the environment variables.
            </p>
          </div>
        )}

        {/* Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          {userAlreadyExists && (
            <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Account Already Exists</span>
              </div>
              <p className="text-amber-800 leading-relaxed text-[11px]">
                An account with the email <strong>{email}</strong> already exists on Nowshera Events. Please sign in or use Magic Link.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                Go to Sign In Page
              </button>
            </div>
          )}

          {errorMessage && !userAlreadyExists && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Javed Aqib"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Attendee Role Info */}
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-900">
              <Ticket className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                You will be enrolled as an <strong>Attendee</strong> to reserve seats and track registrations.
              </span>
            </div>

            <Button
              id="register-submit-btn"
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full justify-center mt-2"
              rightIcon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            >
              {isLoading ? 'Creating Account...' : 'Register with Supabase'}
            </Button>
          </form>

          {/* Database Info */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Directly provisions attendee account in Supabase Auth and creates a linked record in the <strong>profiles</strong> table.
            </span>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs sm:text-sm text-slate-600">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer underline"
          >
            Sign in here
          </button>
        </div>

      </div>
    </div>
  );
};
