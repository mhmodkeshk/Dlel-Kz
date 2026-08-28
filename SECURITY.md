# Security Notes — V5 Phase 2

## قواعد أساسية
- لا تستخدم Supabase Service Role Key في أي ملف Frontend.
- `js/config.js` يحتوي فقط URL وAnon key.
- كل تعديل مالي يتم عبر PostgreSQL RPC محمي وليس من JavaScript مباشرة.
- صور الإيصالات داخل Bucket خاص، والوصول لها لصاحبها أو Admin فقط.
- المنتجات الجديدة لا تظهر للعامة قبل المراجعة.
- كلمات المرور لا تُخزن في localStorage.

## قبل الإطلاق العام
- فعّل Phone confirmation/OTP مع مزود SMS موثوق.
- اضبط Password policy وRate Limits في Supabase Auth.
- راجع RLS في بيئة Staging قبل Production.
- فعّل CAPTCHA للتسجيل/الدخول إذا ارتفع الاستخدام.
- أضف CSP بعد التخلص التدريجي من inline handlers/styles.
- أضف Logging ومراقبة أخطاء للـAdmin RPCs.
