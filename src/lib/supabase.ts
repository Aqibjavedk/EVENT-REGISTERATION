import { createClient } from '@supabase/supabase-js';

// Read public environment variables for Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

/**
 * Checks if both Supabase URL and Publishable Key have been set in the environment.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseUrl.trim().length > 0 && 
  supabaseUrl.startsWith('http') && 
  supabasePublishableKey && 
  supabasePublishableKey.trim().length > 0
);

// Fallback dummy credentials to prevent the client from crashing upon module load
// if the developer/tester hasn't added environment variables yet
export const safeUrl = isSupabaseConfigured 
  ? supabaseUrl.trim() 
  : 'https://placeholder.supabase.co';

export const safeKey = isSupabaseConfigured 
  ? supabasePublishableKey.trim() 
  : 'placeholder-publishable-key';

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
