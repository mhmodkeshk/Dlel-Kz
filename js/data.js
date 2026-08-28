/* ===== البيانات ===== */
const data = {
  "الصيدليات":       { icon:"💊", services:[{name:"صيدلية كشك",phone:"01020302005"},{name:"صيدلية النوساني",phone:"01080401313"},{name:"صيدلية سيف",phone:"01062723221"}]},
  "المطاعم":         { icon:"🍽️", services:[{name:"Cheezy Pasta",phone:"01010704717"},{name:"مستر بروست",phone:"01224034979"},{name:"3Chefs",phone:"01004274386"},{name:"الأكيل بيتزا وفطير",phone:"01016823903"},{name:"مطعم جزاره الريس",phone:"01055492555"}]},
  "دليفيري":         { icon:"🛵", services:[{name:"بدوي دليفيري",phone:"01013014611"},{name:"محمد",phone:"01032537900"}]},
  "نقل ومواصلات":    { icon:"🚗", services:[{name:"سيارة خاصة أبو محمد",phone:"01064160693"}]},
  "مكتبات وخدمات":   { icon:"📚", services:[{name:"مكتبة شهد",phone:"01097767534"},{name:"مكتبة النخبة",phone:"01097816372"}]},
  "تبريد وتكييف":    { icon:"❄️", services:[{name:"فني تبريد وتكييف",phone:"01067322002"},{name:"شركة الصفوة",phone:"01024552419"},{name:"مركز قطب للحل السريع",phone:"01026663706"}]},
  "صنايعية":         { icon:"🛠️", services:[{name:"تصليح بوتاجازات",phone:"01091476145"},{name:"كهربائي كفر الزيات",phone:"01002793431"}]},
  "ألوميتال ومطابخ": { icon:"🏗️", services:[{name:"ورشة ألوميتال",phone:"01093489501"}]},
  "خدمات قانونية":   { icon:"⚖️", services:[{name:"مكتب محاماة",phone:"01003521522"}]},
  "خضروات وعطارة":   { icon:"🥦", services:[{name:"خضروات بسعر الجملة",phone:"01014770104"},{name:"سرجة الرشيدي",phone:"01223964136"},{name:"عطارة حارة زمان",phone:"01120220422"}]},
  "معامل التحاليل":  { icon:"🧪", services:[{name:"معمل الشفاء",phone:"01062977200"}]},
  "دعاية وإعلان":    { icon:"📢", services:[{name:"دزاين للدعاية",phone:"01204486000"}]},
  "تجميل":           { icon:"💄", services:[{name:"سانتو للتجميل",phone:"01013757671"}]},
  "مصورين":          { icon:"📸", services:[{name:"Ahmed Elso8yer",phone:"01062776443"}]},
  "ألعاب وخدمات":    { icon:"🎮", services:[{name:"Max Store",phone:"01062956628"}]}
};

const totalCats = Object.keys(data).length;
const totalServices = Object.values(data).reduce((s,c)=>s+c.services.length,0);

/* ===== المستخدم الحالي ===== */
let currentUser = null;

