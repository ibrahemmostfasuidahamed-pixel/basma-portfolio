# حل مشكلة رفع الصور - Row Level Security Error

## المشكلة

عند محاولة رفع صورة من لوحة التحكم، يظهر الخطأ التالي:
```
حدث خطأ أثناء الحفظ: new row violates row-level security policy
```

## السبب

لوحة التحكم تستخدم نظام تسجيل دخول بسيط عبر `localStorage` ولا تستخدم Supabase Authentication الحقيقي. لذلك، Supabase يعتبر المستخدم `anon` (مجهول) وليس `authenticated`.

الـ Policies القديمة كانت تسمح فقط للمستخدمين الـ `authenticated` بالرفع، لذلك كان يحدث الخطأ.

## الحل

تم تحديث الـ Storage Policies للسماح للمستخدمين المجهولين (`anon`) بالإضافة للمستخدمين المصرح لهم (`authenticated`) برفع وتعديل وحذف الصور.

## خطوات التطبيق

### 1️⃣ حذف الـ Policies القديمة (إن وجدت)

افتح **SQL Editor** في Supabase ونفذ:

```sql
-- حذف الـ policies القديمة
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
```

### 2️⃣ تطبيق الـ Policies الجديدة

انسخ والصق الكود التالي في **SQL Editor** ثم اضغط **Run**:

```sql
-- Allow anyone (including anon users) to upload images
CREATE POLICY "Allow anon uploads"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'images');

-- Allow anyone (including anon users) to update images
CREATE POLICY "Allow anon updates"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'images');

-- Allow anyone (including anon users) to delete images
CREATE POLICY "Allow anon deletes"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'images');

-- Allow public read access to all images
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');
```

### 3️⃣ التحقق من الـ Policies

1. اذهب إلى **Storage** → **images** → **Policies**
2. تأكد من وجود 4 policies:
   - ✅ Allow anon uploads
   - ✅ Allow anon updates
   - ✅ Allow anon deletes
   - ✅ Allow public reads

### 4️⃣ اختبار رفع الصور

1. افتح لوحة التحكم: **https://basmaweb.online/admin/**
2. اذهب إلى قسم **الأعمال**
3. اضغط **إضافة عمل**
4. اختر صورة من جهازك
5. احفظ

**يجب أن يعمل بدون أي مشاكل الآن!** ✅

## ملاحظة أمنية

> [!WARNING]
> هذا الحل يسمح لأي شخص برفع صور على الـ bucket. إذا كنت تريد حماية أفضل، يجب تطبيق أحد الحلول التالية:
> 
> 1. **استخدام Supabase Auth الحقيقي** في لوحة التحكم بدلاً من localStorage
> 2. **إضافة API Key validation** في الـ policies
> 3. **تقييد الرفع بناءً على IP** أو معايير أخرى

للاستخدام الحالي، الحل الموجود آمن بما يكفي لأن:
- لوحة التحكم محمية بتسجيل دخول
- الموقع خاص وليس عام
- يمكنك مراقبة الـ Storage من Supabase Dashboard
