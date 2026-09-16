import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  KeyRound,
  UserPlus,
  User,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { PageId } from '../types';
import { Button } from '../components/common/Button';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onNavigate: (page: PageId) => void;
  redirectAfterLogin?: PageId;
  initialMode?: 'signin' | 'signup';
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onNavigate, 
  redirectAfterLogin = 'upcoming-events',
  initialMode = 'signin'
}) => {
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>(initialMode);
  const [authMode, setAuthMode] = useState<'password' | 'magic-link'>('password');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCredentialError, setIsCredentialError] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const { refreshProfile } = useAuth();

  // Pre-load saved email if available
  useEffect(() => {
    const savedEmail = localStorage.getItem('nowshera_auth_email');
    if (savedEmail && !email) {
      setEmail(savedEmail);
    }
  }, []);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    localStorage.setItem('nowshera_auth_email', val);
    setIsCredentialError(false);
    setErrorMessage(null);
  };

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setIsCredentialError(false);
    setSuccessMessage(null);

    if (!isSupabaseConfigured) {
      setErrorMessage(
        'Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment.'
      );
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === 'password') {
        if (!password) {
          setErrorMessage('Please enter your password.');
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          setSuccessMessage('Logged in successfully! Redirecting...');
          await refreshProfile();
          setTimeout(() => {
            onNavigate(redirectAfterLogin);
          }, 800);
        }
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) {
          throw error;
        }

        setSuccessMessage(`Magic login link dispatched to ${email.trim()}! Please check your inbox.`);
      }
    } catch (err: any) {
      console.warn('Login attempt response:', err);
      const msg = err.message || '';
      if (msg.toLowerCase().includes('invalid login credentials') || msg.toLowerCase().includes('invalid_grant')) {
        setIsCredentialError(true);
        setErrorMessage(
          'Invalid email or password. If you do not have an account yet, you can create one right below or use Magic Link.'
        );
      } else {
        setIsCredentialError(false);
        setErrorMessage(msg || 'Failed to sign in. Please verify your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setIsCredentialError(false);
    setSuccessMessage(null);

    if (!isSupabaseConfigured) {
      setErrorMessage(
        'Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment.'
      );
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const displayName = name.trim() || email.split('@')[0];
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: displayName,
            role: 'attendee',
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Check if user already exists (identities is empty array in Supabase when enumeration prevention is on)
        if (data.user.identities && data.user.identities.length === 0) {
          setErrorMessage(
            'An account with this email already exists. Please switch to Sign In or reset your password.'
          );
          setAuthTab('signin');
          setIsLoading(false);
          return;
        }

        // Upsert into profiles table with role: 'attendee'
        const profilePayload = {
          id: data.user.id,
          name: displayName,
          email: email.trim(),
          role: 'attendee',
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(profilePayload);

        if (profileError) {
          console.warn('Profile upsert notice:', profileError.message);
        }

        await refreshProfile();

        if (data.session) {
          setSuccessMessage('Account created and logged in! Redirecting to upcoming events...');
          setTimeout(() => {
            onNavigate(redirectAfterLogin);
          }, 900);
        } else {
          setSuccessMessage(
            `Account created for ${email.trim()}! Please check your email to confirm registration or sign in directly.`
          );
          setAuthTab('signin');
        }
      }
    } catch (err: any) {
      console.warn('Registration attempt response:', err);
      setErrorMessage(err.message || 'Failed to create your account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter your email address first so we can send a password reset link.');
      return;
    }

    setForgotPasswordLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/#login`,
      });

      if (error) {
        throw error;
      }

      setSuccessMessage(`Password recovery link dispatched to ${email.trim()}! Check your inbox.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send password reset email.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleSendMagicLinkDirectly = async () => {
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter your email address to receive a magic link.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }

      setSuccessMessage(`Magic login link sent to ${email.trim()}! Check your email to sign in.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch magic link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-sm shadow-emerald-600/20 mb-3">
            {authTab === 'signin' ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {authTab === 'signin' ? 'Sign in to Nowshera Events' : 'Create Attendee Account'}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            {authTab === 'signin' 
              ? 'Access your registrations, event tickets, and organizer console'
              : 'Join as an attendee to discover and register for local events'}
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
              To enable live authentication with Supabase, ensure <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_PUBLISHABLE_KEY</strong> are provided in your environment variables.
            </p>
          </div>
        )}

        {/* Auth Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          
          {/* Main Tab Switcher: Sign In vs Create Account */}
          <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 mb-6 text-xs font-bold">
            <button
              id="tab-signin"
              type="button"
              onClick={() => { 
                setAuthTab('signin'); 
                setErrorMessage(null); 
                setIsCredentialError(false);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer text-center ${
                authTab === 'signin' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-signup"
              type="button"
              onClick={() => { 
                setAuthTab('signup'); 
                setErrorMessage(null); 
                setIsCredentialError(false);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer text-center ${
                authTab === 'signup' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Sub-toggle for Sign In: Password vs Magic Link */}
          {authTab === 'signin' && (
            <div className="flex rounded-lg bg-slate-50 border border-slate-200/80 p-0.5 mb-5 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => { setAuthMode('password'); setErrorMessage(null); setIsCredentialError(false); }}
                className={`flex-1 py-1 rounded-md transition-colors cursor-pointer ${
                  authMode === 'password' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('magic-link'); setErrorMessage(null); setIsCredentialError(false); }}
                className={`flex-1 py-1 rounded-md transition-colors cursor-pointer ${
                  authMode === 'magic-link' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Passwordless Magic Link
              </button>
            </div>
          )}

          {/* Special smart error box when credentials fail */}
          {isCredentialError && authTab === 'signin' && (
            <div className="mb-5 p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-950 text-xs space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Account not found or password incorrect</span>
              </div>
              <p className="text-amber-800 leading-relaxed text-[11px]">
                We couldn&apos;t sign in with this email and password. If you haven&apos;t registered yet, create an account now with this email, or sign in instantly with a Magic Link.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('signup');
                    setErrorMessage(null);
                    setIsCredentialError(false);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Create account with this email
                </button>
                <button
                  type="button"
                  onClick={handleSendMagicLinkDirectly}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  Send Magic Link
                </button>
              </div>
            </div>
          )}

          {/* Standard error message */}
          {errorMessage && !isCredentialError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={authTab === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
            
            {/* Name Field (Sign Up only) */}
            {authTab === 'signup' && (
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
                    placeholder="e.g. Aqib Javed"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
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

            {/* Password Field */}
            {(authTab === 'signup' || (authTab === 'signin' && authMode === 'password')) && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Password
                  </label>
                  {authTab === 'signin' && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={forgotPasswordLoading}
                      className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                    >
                      {forgotPasswordLoading ? 'Sending link...' : 'Forgot password?'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={authTab === 'signup' ? 'Min. 6 characters' : '••••••••••••'}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
                {authTab === 'signup' && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Must be at least 6 characters. You will automatically be assigned an <strong>attendee</strong> role.
                  </p>
                )}
              </div>
            )}

            <Button
              id="auth-submit-btn"
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full justify-center mt-2"
              rightIcon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            >
              {isLoading 
                ? 'Processing...' 
                : authTab === 'signup' 
                  ? 'Create Attendee Account' 
                  : authMode === 'password' 
                    ? 'Sign In with Supabase' 
                    : 'Send Magic Login Link'}
            </Button>
          </form>

          {/* Quick info note */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Connected directly to Supabase Auth with persisted session token storage and Row Level Security.
            </span>
          </div>
        </div>

        {/* Footer Helper */}
        <div className="text-center text-xs sm:text-sm text-slate-600">
          {authTab === 'signin' ? (
            <>
              Don&apos;t have an account yet?{' '}
              <button
                onClick={() => {
                  setAuthTab('signup');
                  setErrorMessage(null);
                  setIsCredentialError(false);
                }}
                className="font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer underline"
              >
                Create attendee account
              </button>
            </>
          ) : (
            <>
              Already registered?{' '}
              <button
                onClick={() => {
                  setAuthTab('signin');
                  setErrorMessage(null);
                  setIsCredentialError(false);
                }}
                className="font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer underline"
              >
                Sign in to your account
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
