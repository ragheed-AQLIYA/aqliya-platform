/**
 * Start hub — engagement + process (R6 plain language)
 */

export type EngagementModelCard = {
  id: string;
  name: string;
  tagline: string;
  duration: string;
  cost: string;
  description: string;
  featured?: boolean;
};

export type ProcessPhase = {
  num: string;
  title: string;
  desc: string;
};

export type EngagementPricingBand = {
  model: string;
  from: string;
  to: string;
  note: string;
};

export const engagementPricingAr: EngagementPricingBand[] = [
  {
    model: "مكالمة تعريفية",
    from: "٠ ر.س",
    to: "٠ ر.س",
    note: "بدون التزام",
  },
  {
    model: "تجربة على بياناتكم",
    from: "٠ ر.س",
    to: "٠ ر.س",
    note: "نطاق محدود نتفق عليه مسبقاً",
  },
  {
    model: "تشغيل (سحابة)",
    from: "بعد التجربة",
    to: "حسب المستخدمين والمسارات",
    note: "عرض سعر بعد ما تشوفون النتيجة",
  },
  {
    model: "نشر خاص أو معزول",
    from: "دراسة جدوى",
    to: "مشروع تصميم",
    note: "للجهات ذات متطلبات استثنائية",
  },
];

export const engagementModelsAr: EngagementModelCard[] = [
  {
    id: "diagnostic",
    name: "مكالمة تعريفية",
    tagline: "نفهم وضعكم قبل أي التزام",
    duration: "حوالي ساعة",
    cost: "مجانية",
    description: "نسمع عن احتياجكم ونوضح إذا عقلية مناسبة — بدون عرض مبيعات.",
  },
  {
    id: "pilot",
    name: "تجربة على بياناتكم",
    tagline: "تشوفون النتيجة قبل العقد",
    duration: "٢–٤ أسابيع",
    cost: "مجانية",
    description: "مسار واحد محدود على ملفاتكم — معايير واضحة وتقرير في النهاية.",
    featured: true,
  },
  {
    id: "deployment",
    name: "بدء التشغيل",
    tagline: "من التجربة إلى الاستخدام اليومي",
    duration: "حسب الاتفاق",
    cost: "بعد التجربة",
    description: "حسابات، صلاحيات، نسخ احتياطي، وتدريب الفريق على السحابة.",
  },
  {
    id: "private-assessment",
    name: "نشر داخل بيئتكم",
    tagline: "عندما تريدون البيانات عندكم",
    duration: "٤–٨ أسابيع",
    cost: "حسب النطاق",
    description: "دراسة مشتركة للنشر الخاص أو المعزول — ليس طلباً جاهزاً من الرف.",
  },
  {
    id: "custom",
    name: "سير عمل مخصص",
    tagline: "لاحتياج لا يغطيه الحل الجاهز",
    duration: "حسب المتطلبات",
    cost: "حسب المتطلبات",
    description: "نصمم مساراً لسياقكم — بنفس الصلاحيات والسجل.",
  },
];

export const processPhasesAr: ProcessPhase[] = [
  {
    num: "١",
    title: "مكالمة",
    desc: "نفهم المؤسسة والاحتياج — ونقترح الخطوة التالية.",
  },
  {
    num: "٢",
    title: "تجربة",
    desc: "نشتغل على بياناتكم ضمن نطاق متفق عليه.",
  },
  {
    num: "٣",
    title: "قراركم",
    desc: "نكمل · نعدّل النطاق · أو نتوقف — حسب النتائج.",
  },
  {
    num: "٤",
    title: "تشغيل",
    desc: "نوسّع الاستخدام مع بقاء الصلاحيات والسجل كما هي.",
  },
];

export const processPrinciplesAr = [
  "الذكاء يقترح — فريقكم يعتمد",
  "كل مخرج مربوط بملف أو سجل",
  "نبدأ من واقعكم — لا من قالب عام",
];
