/**
 * Buyer journey paths — plain language (R6)
 * @see docs/marketing/VOICE_GUIDE.md
 */

export type BuyerJourneyStep = {
  label: string;
  href: string;
  time: string;
};

export type BuyerJourney = {
  id: string;
  label: string;
  subtitle: string;
  hook: string;
  steps: BuyerJourneyStep[];
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export const buyerJourneys: BuyerJourney[] = [
  {
    id: "executive",
    label: "قيادة تنفيذية",
    subtitle: "مدير عام · مجلس إدارة",
    hook: "اقرأ الملخص، شاهد الديمو، ثم قرروا إذا يستحق وقت فريقكم.",
    steps: [
      { label: "ملخص للقيادة", href: "/proof#executive-brief", time: "قراءة قصيرة" },
      { label: "مواد الإثبات", href: "/proof", time: "قراءة" },
      { label: "الديمو", href: "/demo", time: "تجربة" },
    ],
    primaryCta: { label: "احجز مكالمة", href: "/contact" },
    secondaryCta: { label: "خطوات العمل", href: "/start#process" },
  },
  {
    id: "cfo",
    label: "المدير المالي",
    subtitle: "مالية · مراجعة داخلية",
    hook: "من ميزان المراجعة إلى ملف جاهز — وكل رقم يفتح مصدره.",
    steps: [
      { label: "حل AuditOS", href: "/products/audit", time: "قراءة" },
      { label: "نماذج مخرجات", href: "/proof#evidence-samples", time: "قراءة" },
      { label: "الديمو", href: "/demo", time: "تجربة" },
    ],
    primaryCta: { label: "تواصل معنا", href: "/contact" },
    secondaryCta: { label: "شاهد الديمو", href: "/demo" },
  },
  {
    id: "contracting",
    label: "مقاولات ومحتوى محلي",
    subtitle: "مقاولات · مشتريات · امتثال",
    hook: "موردون وإنفاق ومحتوى محلي — في مكان واحد بدل جداول متفرقة.",
    steps: [
      { label: "حل المحتوى المحلي", href: "/products/local-content", time: "قراءة" },
      { label: "أمثلة عملية", href: "/use-cases", time: "قراءة" },
      { label: "مواد الإثبات", href: "/proof", time: "قراءة" },
    ],
    primaryCta: { label: "احجز مكالمة", href: "/contact" },
    secondaryCta: { label: "قطاع الحكومة", href: "/industries#government" },
  },
  {
    id: "cio",
    label: "مدير التقنية",
    subtitle: "تقنية · أمن معلومات",
    hook: "نشر سحابي جاهز. خيارات خاصة أو معزولة — نناقشها بصراحة إذا احتجتموها.",
    steps: [
      { label: "الأمن", href: "/security", time: "قراءة" },
      { label: "خيارات النشر", href: "/deployment", time: "قراءة" },
      { label: "ملف المشتريات", href: "/procurement-pack", time: "قراءة" },
    ],
    primaryCta: { label: "طلب جلسة تقنية", href: "/contact" },
    secondaryCta: { label: "ملف المشتريات", href: "/procurement-pack" },
  },
  {
    id: "audit",
    label: "شريك التدقيق",
    subtitle: "مكاتب مراجعة · ارتباط",
    hook: "ملف ارتباط كامل — لا يُعدَّل بعد توقيع الشريك.",
    steps: [
      { label: "حل AuditOS", href: "/products/audit", time: "قراءة" },
      { label: "ديمو AuditOS", href: "/auditos", time: "تجربة" },
      { label: "معايير التجربة", href: "/proof#evaluation-framework", time: "قراءة" },
    ],
    primaryCta: { label: "احجز مكالمة", href: "/contact" },
    secondaryCta: { label: "قطاع المراجعة", href: "/industries#audit-firms" },
  },
  {
    id: "procurement",
    label: "المشتريات",
    subtitle: "تقييم مورد · لجنة ترسية",
    hook: "PDF جاهز: أمن، نطاق عمل، ومعايير — للجنة الترسية.",
    steps: [
      { label: "ملف المشتريات", href: "/procurement-pack", time: "قراءة" },
      { label: "طرق التعاون", href: "/start#engagement", time: "قراءة" },
      { label: "معايير التجربة", href: "/proof#evaluation-framework", time: "قراءة" },
    ],
    primaryCta: { label: "اطلب الملف", href: "/contact" },
    secondaryCta: { label: "مواد الإثبات", href: "/proof" },
  },
  {
    id: "government",
    label: "جهة حكومية",
    subtitle: "امتثال · محتوى محلي",
    hook: "تقارير محتوى محلي وامتثال جاهزة للمراجعة التنظيمية.",
    steps: [
      { label: "حل المحتوى المحلي", href: "/products/local-content", time: "قراءة" },
      { label: "الحوكمة", href: "/governance", time: "قراءة" },
      { label: "مواد الإثبات", href: "/proof", time: "قراءة" },
    ],
    primaryCta: { label: "احجز مكالمة", href: "/contact" },
    secondaryCta: { label: "قطاع الحكومة", href: "/industries#government" },
  },
];

export const universalJourneySteps: BuyerJourneyStep[] = [
  { label: "مكالمة تعريفية", href: "/contact", time: "مجانية" },
  { label: "تجربة على بياناتكم", href: "/proof#evaluation-framework", time: "أسابيع" },
  { label: "قراركم", href: "/start#engagement", time: "بعد النتائج" },
  { label: "التشغيل", href: "/start#process", time: "حسب الاتفاق" },
];
