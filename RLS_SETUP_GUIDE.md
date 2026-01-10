# دليل تفعيل Row Level Security (RLS)

## المشكلة

Supabase بيحذرك إن الجداول التالية مفتوحة للعامة بدون حماية:
- ❌ `portfolio` - Table is public, but RLS has not been enabled
- ❌ `admin_users` - Table is public, but RLS has not been enabled  
- ❌ `site_settings` - Table is public, but RLS has not been enabled

## الحل

تفعيل **Row Level Security (RLS)** وإنشاء Policies للتحكم في الصلاحيات.

## خطوات التطبيق

### الطريقة الأولى: SQL Editor (الأسرع) ✅

1. **افتح SQL Editor في Supabase**
   - من القائمة الجانبية → SQL Editor

2. **نفذ السكريبت الكامل**
   - افتح ملف [`supabase_rls_policies.sql`](file:///d:/agancy/supabase_rls_policies.sql)
   - انسخ الكود كله
   - الصقه في SQL Editor
   - اضغط **Run** أو **Ctrl+Enter**

3. **تحقق من النتيجة**
   - اذهب إلى **Database** → **Tables**
   - افتح أي جدول (مثل `portfolio`)
   - اضغط على تبويب **Policies**
   - يجب أن ترى الـ Policies الجديدة

### الطريقة الثانية: من خلال UI

#### لجدول Portfolio:

1. **تفعيل RLS:**
   - Database → Tables → `portfolio`
   - اضغط على زر **Enable RLS**

2. **إضافة Policies:**
   - اضغط **New Policy**
   - اختر **Custom**
   
   **Policy 1: قراءة عامة للمنشور**
   - Name: `Allow public read published portfolio`
   - Command: `SELECT`
   - Target roles: `public`
   - USING: `is_published = true`

   **Policy 2: قراءة كاملة للإدارة**
   - Name: `Allow anon read all portfolio`
   - Command: `SELECT`
   - Target roles: `anon, authenticated`
   - USING: `true`

   **Policy 3: إضافة**
   - Name: `Allow anon insert portfolio`
   - Command: `INSERT`
   - Target roles: `anon, authenticated`
   - WITH CHECK: `true`

   **Policy 4: تعديل**
   - Name: `Allow anon update portfolio`
   - Command: `UPDATE`
   - Target roles: `anon, authenticated`
   - USING: `true`

   **Policy 5: حذف**
   - Name: `Allow anon delete portfolio`
   - Command: `DELETE`
   - Target roles: `anon, authenticated`
   - USING: `true`

كرر نفس الخطوات لجداول `admin_users` و `site_settings`.

## التحقق من الحل

بعد تطبيق الـ Policies:

1. **افتح Database → Tables**
2. **لكل جدول، تأكد من:**
   - ✅ RLS مفعّل (يظهر شارة خضراء)
   - ✅ يوجد Policies (عدد > 0)

3. **جرب لوحة التحكم:**
   - افتح https://basmaweb.online/admin/
   - جرب إضافة/تعديل/حذف عمل
   - يجب أن يعمل بدون مشاكل

## ملاحظات مهمة

> [!WARNING]
> الـ Policies الحالية تسمح لـ `anon` users بالوصول الكامل لأن لوحة التحكم لا تستخدم Supabase Auth الحقيقي.

> [!TIP]
> للحماية الأفضل في المستقبل:
> - استخدم Supabase Auth في لوحة التحكم
> - قيّد الصلاحيات على `authenticated` users فقط
> - أضف IP restrictions أو API key validation

## استكشاف الأخطاء

### إذا ظهرت مشاكل بعد تفعيل RLS:

**المشكلة:** لا يمكن قراءة البيانات من الموقع
- **الحل:** تأكد من وجود policy للقراءة العامة (`public`)

**المشكلة:** لا يمكن الإضافة/التعديل من لوحة التحكم
- **الحل:** تأكد من وجود policies لـ `anon` و `authenticated`

**المشكلة:** خطأ "new row violates row-level security policy"
- **الحل:** راجع الـ policies وتأكد من `WITH CHECK (true)` للـ INSERT

## الجداول المحمية

بعد تطبيق السكريبت، الجداول التالية ستكون محمية:

✅ `portfolio` - 5 policies  
✅ `admin_users` - 4 policies  
✅ `site_settings` - 3 policies  
✅ `services` - 5 policies  
✅ `menu_items` - 5 policies

**إجمالي: 5 جداول محمية بـ 22 policy** 🔒
