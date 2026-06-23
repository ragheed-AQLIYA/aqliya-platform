/**
 * Official buyer journey paths — @see docs/marketing/MARKETING_ROADMAP.md
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
    subtitle: "CEO · مجلس إدارة · مدير عام",
    hook: "قرار استثمار في ٥ دقائق — ثم إثبات قبل أي التزام واسع.",
    steps: [
      { label: "الملخص التنفيذي", href: "/proof#executive-brief", time: "٥ دقائق" },
      { label: "مركز الإثبات", href: "/proof", time: "١٥ دقيقة" },
      { label: "الديمو التفاعلي", href: "/demo", time: "١٠ دقائق" },
    ],
    primaryCta: { label: "احجز جلسة تشخيص", href: "/contact" },
    secondaryCta: { label: "كيف نعمل", href: "/how-we-work" },
  },
  {
    id: "cfo",
    label: "المدير المالي",
    subtitle: "CFO · مراجعة داخلية",
    hook: "كل رقم مرتبط بمصدره — من ميزان المراجعة إلى حزمة الارتباط.",
    steps: [
      { label: "دليل المدير المالي", href: "/buyers/cfo", time: "١٠ دقائق" },
      { label: "نظام AuditOS", href: "/products/audit", time: "٨ دقائق" },
      { label: "مكتبة الأدلة", href: "/proof#evidence-samples", time: "١٥ دقيقة" },
    ],
    primaryCta: { label: "طلب جلسة تنفيذية", href: "/contact" },
    secondaryCta: { label: "مشاهدة الديمو", href: "/demo" },
  },
  {
    id: "contracting",
    label: "مقاولات ومحتوى محلي",
    subtitle: "مقاولات · مشتريات · امتثال",
    hook: "موردون، إنفاق، محتوى محلي، وتقارير تنظيمية — في مسار محكوم واحد.",
    steps: [
      { label: "LocalContentOS", href: "/products/local-content", time: "٨ دقائق" },
      { label: "حالات الاستخدام", href: "/use-cases", time: "١٢ دقيقة" },
      { label: "مركز الإثبات", href: "/proof", time: "١٥ دقيقة" },
    ],
    primaryCta: { label: "ناقش التفعيل المؤسسي", href: "/contact" },
    secondaryCta: { label: "قطاع الحكومة", href: "/industries#government" },
  },
  {
    id: "cio",
    label: "مدير التقنية",
    subtitle: "CIO · CISO · أمن معلومات",
    hook: "شفافية تقنية كاملة — نشر، عزل، صلاحيات، وحدود الذكاء الاصطناعي.",
    steps: [
      { label: "ملخص الأمن", href: "/security", time: "١٠ دقائق" },
      { label: "بيئات النشر", href: "/deployment", time: "٨ دقائق" },
      { label: "دليل CIO", href: "/buyers/cio", time: "١٢ دقيقة" },
    ],
    primaryCta: { label: "طلب جلسة تقنية", href: "/contact" },
    secondaryCta: { label: "حزمة المشتريات", href: "/procurement-pack" },
  },
  {
    id: "audit",
    label: "شريك التدقيق",
    subtitle: "مكاتب مراجعة · ارتباط",
    hook: "اعتمادك يحمي سمعتك — مسار أدلة كامل لا يُعدَّل بعد الاعتماد.",
    steps: [
      { label: "دليل شريك التدقيق", href: "/buyers/audit-partner", time: "١٠ دقائق" },
      { label: "ديمو AuditOS", href: "/auditos", time: "١٣ دقيقة" },
      { label: "إطار التقييم", href: "/proof#evaluation-framework", time: "١٠ دقائق" },
    ],
    primaryCta: { label: "احجز جلسة تشخيص", href: "/contact" },
    secondaryCta: { label: "قطاع المراجعة", href: "/industries#audit-firms" },
  },
  {
    id: "procurement",
    label: "المشتريات",
    subtitle: "تقييم مورد · لجنة ترسية",
    hook: "حزمة PDF جاهزة: brief، أمن، SOW، ومقارنة مع الأدوات الحالية.",
    steps: [
      { label: "حزمة المشتريات", href: "/procurement-pack", time: "٢٠ دقيقة" },
      { label: "نماذج التعاون", href: "/engagement-models", time: "١٠ دقائق" },
      { label: "إطار التقييم التشغيلي", href: "/proof#evaluation-framework", time: "١٠ دقائق" },
    ],
    primaryCta: { label: "طلب حزمة التقييم", href: "/contact" },
    secondaryCta: { label: "مركز الإثبات", href: "/proof" },
  },
  {
    id: "government",
    label: "جهة حكومية",
    subtitle: "امتثال · محتوى محلي · مساءلة",
    hook: "مسارات محتوى محلي وامتثال مع تقارير جاهزة للجهات التنظيمية.",
    steps: [
      { label: "دليل الجهات الحكومية", href: "/buyers/government", time: "١٢ دقيقة" },
      { label: "LocalContentOS", href: "/products/local-content", time: "٨ دقائق" },
      { label: "بنية الحوكمة", href: "/governance", time: "١٠ دقائق" },
    ],
    primaryCta: { label: "ناقش التفعيل المؤسسي", href: "/contact" },
    secondaryCta: { label: "قطاع الحكومة", href: "/industries#government" },
  },
];

export const universalJourneySteps: BuyerJourneyStep[] = [
  { label: "تشخيص", href: "/contact", time: "٤٥ دقيقة" },
  { label: "تقييم تشغيلي", href: "/proof#evaluation-framework", time: "٢–٤ أسابيع" },
  { label: "قرار بالأدلة", href: "/engagement-models", time: "جلسة واحدة" },
  { label: "تفعيل", href: "/how-we-work", time: "حسب النطاق" },
];
