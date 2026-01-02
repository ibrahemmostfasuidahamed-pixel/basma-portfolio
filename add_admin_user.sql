-- إضافة مستخدم admin بسرعة
-- نفذ هذا الكود في Supabase SQL Editor

-- أولاً: تأكد من وجود الجدول
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ثانياً: إضافة مستخدم admin
INSERT INTO admin_users (email, password_hash, full_name, role, is_active) 
VALUES ('admin@basma.com', 'temp123', 'المدير العام', 'super_admin', true)
ON CONFLICT (email) DO UPDATE 
SET is_active = true, updated_at = NOW();

-- ثالثاً: التحقق من البيانات
SELECT * FROM admin_users;
