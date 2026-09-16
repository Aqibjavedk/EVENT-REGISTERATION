-- ==============================================================================
-- Nowshera Events Co. - Supabase Database Schema & Row-Level Security (RLS)
-- ==============================================================================
-- Run this SQL in your Supabase Dashboard SQL Editor (https://supabase.com/dashboard)
-- to configure tables, foreign key constraints, indexes, triggers, and secure RLS policies.

-- 1. PROFILES TABLE
-- Stores attendee & organizer role information linked to Supabase Auth (auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'attendee' CHECK (role IN ('attendee', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. EVENTS TABLE
-- Stores workshop, seminar, and community gathering details
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 50 CHECK (capacity > 0),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. REGISTRATIONS TABLE
-- Connects attendees to events, tracking seat bookings & reservation status
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_event UNIQUE (user_id, event_id)
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_events_status_date ON public.events(status, event_date);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON public.registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON public.registrations(event_id, status);

-- Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS trg_events_updated_at ON public.events;
CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS trg_registrations_updated_at ON public.registrations;
CREATE TRIGGER trg_registrations_updated_at
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ==============================================================================
-- 4. ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the authenticated user is an admin without recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- A. PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- 1. Users can read their own profile; admins can read all profiles
DROP POLICY IF EXISTS "Users can read own profile or admin can read all" ON public.profiles;
CREATE POLICY "Users can read own profile or admin can read all"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id OR public.is_admin()
);

-- 2. Users can insert their own profile upon registration
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (
  auth.uid() = id
);

-- 3. Users can update their own profile; admins can update any profile
DROP POLICY IF EXISTS "Users can update own profile or admin can update all" ON public.profiles;
CREATE POLICY "Users can update own profile or admin can update all"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id OR public.is_admin()
)
WITH CHECK (
  auth.uid() = id OR public.is_admin()
);

-- ------------------------------------------------------------------------------
-- B. EVENTS POLICIES
-- ------------------------------------------------------------------------------
-- 1. Anyone (public or authenticated) can read published events
--    Admins can also read draft and cancelled events
DROP POLICY IF EXISTS "Anyone can read published events" ON public.events;
CREATE POLICY "Anyone can read published events"
ON public.events
FOR SELECT
USING (
  status = 'published' OR public.is_admin()
);

-- 2. Admins can create new events
DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
CREATE POLICY "Admins can insert events"
ON public.events
FOR INSERT
WITH CHECK (
  public.is_admin()
);

-- 3. Admins can update events
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Admins can update events"
ON public.events
FOR UPDATE
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);

-- 4. Admins can delete events
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
CREATE POLICY "Admins can delete events"
ON public.events
FOR DELETE
USING (
  public.is_admin()
);

-- ------------------------------------------------------------------------------
-- C. REGISTRATIONS POLICIES
-- ------------------------------------------------------------------------------
-- 1. Users can read their own registrations; admins can read all registrations
--    (Also allows anyone to check count of active registrations for an event)
DROP POLICY IF EXISTS "Users can read own registrations or admin can read all" ON public.registrations;
CREATE POLICY "Users can read own registrations or admin can read all"
ON public.registrations
FOR SELECT
USING (
  auth.uid() = user_id OR public.is_admin()
);

-- 2. Users can insert their own registration
DROP POLICY IF EXISTS "Users can insert own registration" ON public.registrations;
CREATE POLICY "Users can insert own registration"
ON public.registrations
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- 3. Users can update their own registration status (e.g. to cancel)
--    Admins can update any registration
DROP POLICY IF EXISTS "Users can update own registration status" ON public.registrations;
CREATE POLICY "Users can update own registration status"
ON public.registrations
FOR UPDATE
USING (
  auth.uid() = user_id OR public.is_admin()
)
WITH CHECK (
  auth.uid() = user_id OR public.is_admin()
);

-- ==============================================================================
-- 5. INITIAL SAMPLE DATA SEED (OPTIONAL)
-- ==============================================================================
INSERT INTO public.events (title, description, event_date, event_time, location, capacity, status)
VALUES
  (
    'Nowshera Digital Skills & AI Workshop',
    'A high-impact, hands-on masterclass for university students and developers covering machine learning foundations and building modern web apps.',
    (CURRENT_DATE + INTERVAL '12 days')::DATE,
    '09:30 AM - 01:30 PM',
    'Nowshera IT Park, Grand Trunk Road',
    60,
    'published'
  ),
  (
    'Khyber Youth Leadership & Civic Seminar',
    'Interactive keynote lectures on regional civic engagement, youth entrepreneurship, and grassroots community problem-solving.',
    (CURRENT_DATE + INTERVAL '18 days')::DATE,
    '10:00 AM - 02:00 PM',
    'Nowshera Press Club & Community Hall',
    120,
    'published'
  ),
  (
    'Nowshera Small Business & E-Commerce Expo',
    'Learn how local artisans, traders, and shop owners can digitize payments, manage inventory, and sell regionally via online channels.',
    (CURRENT_DATE + INTERVAL '24 days')::DATE,
    '11:00 AM - 04:00 PM',
    'Grand River View Convention Center, Nowshera',
    150,
    'published'
  ),
  (
    'Agricultural Innovation & Water Management Symposium',
    'Field experts and agronomists discuss sustainable irrigation methods, solarized tubewells, and high-yield crop techniques in KP.',
    (CURRENT_DATE + INTERVAL '30 days')::DATE,
    '09:00 AM - 01:00 PM',
    'District Agriculture Research Station, Nowshera',
    80,
    'published'
  )
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 6. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH.USERS
-- ==============================================================================
-- Ensures whenever a user registers via Supabase Auth, a corresponding row in public.profiles is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'attendee')
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 7. PROMOTING AN ACCOUNT TO ADMIN ROLE (RUN IN SUPABASE SQL EDITOR AS NEEDED)
-- ==============================================================================
-- Example to grant full organizer admin rights to any email:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'javedaqib814@gmail.com';

