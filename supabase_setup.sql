-- =====================================================
-- Supabase Database Setup - بصمة Admin Dashboard
-- =====================================================

-- ===== 1. Admin Users Table =====
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin', -- admin, super_admin
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== 2. Services Table =====
CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    image_url TEXT,
    video_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== 3. Portfolio Table =====
CREATE TABLE IF NOT EXISTS portfolio (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    image_url TEXT,
    video_url TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== 4. Menu Items Table =====
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'link', -- link, cta
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== 5. Site Settings Table =====
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'text', -- text, number, boolean, json
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Disable RLS for all tables (for easier admin access)
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- Insert Default Data
-- =====================================================

-- Default Admin User (password: admin123)
-- Note: In production, use proper password hashing!
INSERT INTO admin_users (email, password_hash, full_name, role, is_active) 
VALUES ('admin@basma.com', '$2a$10$rQZ9vXqZ9vXqZ9vXqZ9vXO', 'المدير العام', 'super_admin', true)
ON CONFLICT (email) DO NOTHING;

-- Default Site Settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('site_name', 'بصمة', 'text', 'اسم الموقع'),
('site_description', 'أفضل كورسات موشن جرافيك وتصميم في الوطن العربي', 'text', 'وصف الموقع'),
('whatsapp_number', '01229602179', 'text', 'رقم الواتساب'),
('youtube_url', 'https://www.youtube.com/@basma-web', 'text', 'رابط يوتيوب'),
('instagram_url', '', 'text', 'رابط انستجرام'),
('tiktok_url', '', 'text', 'رابط تيك توك'),
('twitter_url', '', 'text', 'رابط تويتر')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check all tables
SELECT 'admin_users' as table_name, COUNT(*) as count FROM admin_users
UNION ALL
SELECT 'services', COUNT(*) FROM services
UNION ALL
SELECT 'portfolio', COUNT(*) FROM portfolio
UNION ALL
SELECT 'menu_items', COUNT(*) FROM menu_items
UNION ALL
SELECT 'site_settings', COUNT(*) FROM site_settings;
