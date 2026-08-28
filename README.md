# دليل كفر الزيات — V5 Phase 2

هذه المرحلة تنقل الأجزاء الحساسة من المتصفح إلى Supabase مع الحفاظ على الواجهة الحالية.

## تم تنفيذه
- Supabase Auth بدل تخزين كلمات المرور في `localStorage`.
- PostgreSQL + Row Level Security للحسابات والمنتجات والمحفظة.
- Marketplace مشترك: المنتجات تُخزن في قاعدة البيانات وتظهر لكل المستخدمين بعد قبول الإدارة.
- Supabase Storage لصور المنتجات وإيصالات Vodafone Cash.
- المحفظة أصبحت Server-authoritative: المتصفح لا يستطيع تعديل الرصيد مباشرة.
- RPC ذري لشراء الخدمات وخصم الرصيد.
- RPC ذري لاعتماد طلب الشحن ومنع الاعتماد المكرر.
- لوحة Admin لمراجعة المنتجات وطلبات الشحن.
- فصل بيانات الاتصال في `js/config.js`.

## خطوات التشغيل
1. أنشئ مشروعاً جديداً على Supabase.
2. افتح SQL Editor وشغّل الملف `supabase/schema.sql` مرة واحدة.
3. من Supabase > Authentication فعّل Phone Auth واضبط مزود SMS إذا أردت تأكيد الهاتف/OTP.
4. انسخ Project URL وAnon/Public Key إلى `js/config.js`:

```js
window.APP_CONFIG = {
  SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_ANON_KEY',
  APP_NAME: 'دليل كفر الزيات و القري المجاوره',
  ADMIN_WHATSAPP: '01016264637',
  VODAFONE_CASH: '01016264637'
};
```

> الـAnon key مصمم ليكون عاماً، والحماية الحقيقية هنا هي RLS. لا تضع Service Role Key في الواجهة نهائياً.

5. أنشئ أول حساب من الموقع. ثم اجعله Admin من SQL Editor:

```sql
update public.profiles
set role = 'admin'
where phone = '01XXXXXXXXX';
```

6. افتح `admin.html` بعد تسجيل الدخول بنفس حساب الـAdmin.
7. على Netlify أضف `OPENWEATHER_API_KEY` في Environment Variables لتفعيل الطقس.

## سلوك المنتجات
- المنتج الجديد يدخل بالحالة `pending`.
- صاحبه والـAdmin فقط يقدروا يشوفوه قبل القبول.
- عند قبول الـAdmin يتحول إلى `active` ويظهر للجميع.

## سلوك شحن المحفظة
- المستخدم يرفع الإيصال إلى Bucket خاص `receipts`.
- الطلب يدخل `pending`.
- الـAdmin يراجع الإيصال من `admin.html`.
- عند الاعتماد، دالة SQL واحدة تقفل الطلب، تضيف الرصيد، وتسجل المعاملة Atomic Transaction.

## ما زال في Phase 3
- نقل دليل الخدمات الثابت نفسه إلى قاعدة البيانات ولوحة الإدارة.
- نظام قرى/مناطق وعناوين وخرائط.
- إدارة الإعلانات من الـAdmin بدل الصور الثابتة.
- OTP/Password recovery UI كامل.
- Notifications/Analytics وقياس WhatsApp leads.
- اختبارات E2E تلقائية.
