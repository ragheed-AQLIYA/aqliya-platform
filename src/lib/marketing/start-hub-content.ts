/**
 * Start hub sections — engagement models + process (R4 merge)
 * @see docs/marketing/MARKETING_REDESIGN_PLAN.md §7.2
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

export const engagementModelsAr: EngagementModelCard[] = [
  {
    id: "diagnostic",
    name: "التشخيص التنفيذي",
    tagline: "فهم الوضع قبل أي قرار",
    duration: "٤٥–٩٠ دقيقة",
    cost: "مجاني",
    description:
      "جلسة تشخيص — لا عرض مبيعات. نحدد ملاءمة عقلية والخطوة التالية.",
  },
  {
    id: "pilot",
    name: "التقييم التشغيلي",
    tagline: "إثبات القيمة على بياناتك",
    duration: "٢–٤ أسابيع",
    cost: "مجاني",
    description:
      "مسار واحد محدود على بيانات فعلية — معايير متفق عليها وتقرير قرار بالأدلة.",
    featured: true,
  },
  {
    id: "deployment",
    name: "تفعيل مؤسسي",
    tagline: "من التقييم إلى التشغيل",
    duration: "حسب النطاق",
    cost: "بعد التقييم",
    description: "Cloud Managed مع مصادقة إنتاجية، نسخ احتياطي، وتدريب الفريق.",
  },
  {
    id: "private-assessment",
    name: "تقييم النشر الخاص",
    tagline: "سيادة البيانات والخصوصية",
    duration: "٤–٨ أسابيع",
    cost: "حسب النطاق",
    description:
      "تقييم تقني مشترك — On-Prem/Air-Gapped استراتيجي، ليس حزمة جاهزة.",
  },
  {
    id: "custom",
    name: "نظام مؤسسي مخصص",
    tagline: "فوق Intelligence Core",
    duration: "حسب المتطلبات",
    cost: "مخصص",
    description: "سير عمل مصمم لسياقك — نفس الحوكمة والأدلة والـ RBAC.",
  },
];

export const processPhasesAr: ProcessPhase[] = [
  {
    num: "١",
    title: "التشخيص",
    desc: "جلسة منظمة — سياق المؤسسة ومدى الملاءمة. بدون عرض مبيعات.",
  },
  {
    num: "٢",
    title: "التقييم التشغيلي",
    desc: "مسار كامل على بيانات فعلية — معايير متفق عليها مسبقاً.",
  },
  {
    num: "٣",
    title: "قرار بالأدلة",
    desc: "متابعة · مراجعة نطاق · أو إيقاف — بناءً على نتائج مقاسة.",
  },
  {
    num: "٤",
    title: "تفعيل وتوسع",
    desc: "تشغيل مؤسسي — مسارات إضافية مع استمرار الحوكمة.",
  },
];

export const processPrinciplesAr = [
  "الذكاء يساعد — الإنسان يقرر",
  "الدليل يحكم — كل مخرج مرتبط بمصدر",
  "الحوكمة مضمنة — ليست إضافة لاحقة",
  "نبدأ من واقع المؤسسة — لا حلول افتراضية",
];
