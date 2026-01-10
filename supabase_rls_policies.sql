-- =====================================================
-- Row Level Security (RLS) Policies
-- بصمة - Basma Portfolio
-- =====================================================

-- =====================================================
-- 1. PORTFOLIO TABLE
-- =====================================================

-- Enable RLS on portfolio table
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published portfolio items
CREATE POLICY "Allow public read published portfolio"
ON public.portfolio FOR SELECT
TO public
USING (is_published = true);

-- Allow anon and authenticated users to read all portfolio items (for admin)
CREATE POLICY "Allow anon read all portfolio"
ON public.portfolio FOR SELECT
TO anon, authenticated
USING (true);

-- Allow anon and authenticated users to insert portfolio items
CREATE POLICY "Allow anon insert portfolio"
ON public.portfolio FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anon and authenticated users to update portfolio items
CREATE POLICY "Allow anon update portfolio"
ON public.portfolio FOR UPDATE
TO anon, authenticated
USING (true);

-- Allow anon and authenticated users to delete portfolio items
CREATE POLICY "Allow anon delete portfolio"
ON public.portfolio FOR DELETE
TO anon, authenticated
USING (true);

-- =====================================================
-- 2. ADMIN_USERS TABLE
-- =====================================================

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Allow anon users to read admin_users (for login verification)
CREATE POLICY "Allow anon read admin_users"
ON public.admin_users FOR SELECT
TO anon, authenticated
USING (true);

-- Allow anon users to insert admin_users
CREATE POLICY "Allow anon insert admin_users"
ON public.admin_users FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anon users to update admin_users
CREATE POLICY "Allow anon update admin_users"
ON public.admin_users FOR UPDATE
TO anon, authenticated
USING (true);

-- Allow anon users to delete admin_users
CREATE POLICY "Allow anon delete admin_users"
ON public.admin_users FOR DELETE
TO anon, authenticated
USING (true);

-- =====================================================
-- 3. SITE_SETTINGS TABLE
-- =====================================================

-- Enable RLS on site_settings table
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to site settings
CREATE POLICY "Allow public read site_settings"
ON public.site_settings FOR SELECT
TO public
USING (true);

-- Allow anon and authenticated users to update site settings
CREATE POLICY "Allow anon update site_settings"
ON public.site_settings FOR UPDATE
TO anon, authenticated
USING (true);

-- Allow anon and authenticated users to insert site settings
CREATE POLICY "Allow anon insert site_settings"
ON public.site_settings FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- =====================================================
-- NOTES:
-- =====================================================
-- 
-- These policies allow anon (anonymous) users because the admin
-- dashboard uses localStorage authentication instead of Supabase Auth.
-- 
-- For production, consider:
-- 1. Implementing proper Supabase Auth in admin dashboard
-- 2. Restricting policies to authenticated users only
-- 3. Adding IP-based restrictions
-- 4. Implementing API key validation
-- 
-- =====================================================
