-- =====================================================
-- Supabase Portfolio Table Setup
-- بصمة - Basma Portfolio
-- =====================================================

-- Drop existing table if needed (CAUTION: This will delete all data!)
-- DROP TABLE IF EXISTS portfolio;

-- Create portfolio table
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

-- Enable Row Level Security
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON portfolio
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create policy to allow read for anonymous users (for website)
CREATE POLICY "Allow read for anonymous users" ON portfolio
    FOR SELECT
    USING (true);

-- Insert sample data (optional)
INSERT INTO portfolio (title, category, description, image_url, video_url, is_published) VALUES
('مشروع موشن جرافيك', 'موشن جرافيك', 'فيديو موشن جرافيك احترافي لشركة تقنية', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop', '', true),
('تصميم هوية بصرية', 'تصميم جرافيك', 'تصميم هوية بصرية كاملة لمطعم', 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=600&h=400&fit=crop', '', true);

-- Check data
SELECT * FROM portfolio;
