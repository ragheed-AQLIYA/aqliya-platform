/**
 * Tier-1 product page content — @see docs/marketing/MARKETING_REDESIGN_PLAN.md R3
 */

export type ProductPageContent = {
  metadata: { title: string; description: string };
  eyebrow: string;
  productName: string;
  statusLabel: string;
  problemLine: string;
  outcomeLine: string;
  before: string[];
  after: string[];
  flowSteps: string[];
  highlights: [string, string, string];
  demoHref?: string;
  demoLabel?: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  technicalDetails?: {
    title: string;
    steps: Array<{ title: string; detail: string }>;
  };
};

export const auditProductContent: ProductPageContent = {
  metadata: {
    title: "AuditOS — نظام تشغيل المراجعة والالتزام | AQLIYA",
    description:
      "مسار مراجعة محكوم من قبول العميل إلى حزمة الارتباط — أدلة، مراجعة بشرية، وسجل تدقيق.",
  },
  eyebrow: "AuditOS",
  productName: "نظام تشغيل المراجعة والالتزام",
  statusLabel: "متاح للتطبيق",
  problemLine: "Excel وبريد وملفات متفرقة — مراجعة يصعب الدفاع عنها أمام الشريك أو الجهة التنظيمية.",
  outcomeLine: "مسار واحد من المصدر إلى الاعتماد — كل رقم مرتبط بمصدره، كل قرار موثّق.",
  before: [
    "قبول عملاء — ملفات مبعثرة بدون مسار مخاطر",
    "ميزان مراجعة — تصنيف يدوي بدون ربط بالمعايير",
    "أوراق عمل — ملفات منفصلة بدون ترقيم أو أدلة",
    "ملاحظات مراجعة — بريد وواتساب بدون متابعة",
    "الاعتماد — بدون بوابات واضحة قبل النشر",
  ],
  after: [
    "قبول محكوم — مخاطر مقاسة واعتماد الشريك",
    "ميزان → IFRS — اقتراحات AI للمراجعة البشرية",
    "أوراق عمل — ملف متكامل بمراجع تبادلية",
    "ملاحظات — دورة حياة مع SLA وتصعيد",
    "بوابة اعتماد — ٥ شروط قبل أي تصدير",
  ],
  flowSteps: ["قبول", "ميزان", "قوائم", "أدلة", "مراجعة", "اعتماد"],
  highlights: [
    "سلسلة أدلة كاملة",
    "اعتماد بشري إلزامي",
    "سجل تدقيق لا يُعدَّل",
  ],
  demoHref: "/auditos",
  demoLabel: "ديمو AuditOS",
  primaryCta: { label: "احجز مكالمة", href: "/contact" },
  secondaryCta: { label: "مواد الإثبات", href: "/proof" },
  technicalDetails: {
    title: "المحطات التقنية (١٢ محطة)",
    steps: [
      { title: "قبول واستقلالية", detail: "KYC، مخاطر، IESBA، اعتماد الشريك" },
      { title: "تخطيط وميزان", detail: "ISA 320، رفع TB، IFRS mapping" },
      { title: "قوائم وإيضاحات", detail: "مسودات AI + ربط ببند القائمة" },
      { title: "عينات وأدلة", detail: "MUS، خزينة أدلة، نتائج" },
      { title: "أوراق عمل وملاحظات", detail: "WP، دورة حياة ٧ حالات" },
      { title: "جودة ونشر", detail: "ISQM1، حزمة ارتباط، أرشفة" },
    ],
  },
};

export const decisionProductContent: ProductPageContent = {
  metadata: {
    title: "DecisionOS — نظام تشغيل القرارات المؤسسية | AQLIYA",
    description:
      "مسار قرار محكوم: بدائل، معايير، مخاطر، توصية AI، واعتماد بشري — لا قرار متفرق.",
  },
  eyebrow: "DecisionOS",
  productName: "نظام تشغيل القرارات المؤسسية",
  statusLabel: "متكامل في المنصة",
  problemLine: "قرارات على نقاشات وملفات — بدون معايير موحدة أو سجل اعتماد.",
  outcomeLine: "مذكرة قرار موثقة — قابلة للمراجعة والتدقيق في أي وقت.",
  before: [
    "قرارات تعتمد على النقاشات فقط",
    "ملفات ومبررات غير موثقة",
    "تقييم مخاطر غير منهجي",
    "صعوبة تتبع سبب القرار",
    "اعتمادات غير واضحة",
  ],
  after: [
    "مسار قرار موثق ومنهجي",
    "معايير تقييم قابلة للقياس",
    "ملخص مخاطر مرتبط بالبدائل",
    "توصية مدعومة بالأدلة",
    "سجل اعتماد كامل",
  ],
  flowSteps: ["مشكلة", "بدائل", "معايير", "مخاطر", "توصية", "اعتماد"],
  highlights: [
    "توصية AI مع مسوّغات",
    "كل قرار مرتبط بأدلته",
    "لا تعديل بعد الاعتماد",
  ],
  demoHref: "/demo",
  demoLabel: "ديمو تفاعلي",
  primaryCta: { label: "تواصل معنا", href: "/contact" },
  secondaryCta: { label: "حالات الاستخدام", href: "/use-cases" },
};

export const localContentProductContent: ProductPageContent = {
  metadata: {
    title: "LocalContentOS — المحتوى المحلي والامتثال | AQLIYA",
    description:
      "موردون، إنفاق، تصنيف، فجوات امتثال، وتقارير تنظيمية — مسار تشغيلي واحد للسوق السعودي.",
  },
  eyebrow: "LocalContentOS",
  productName: "نظام المحتوى المحلي وسلاسل التوريد",
  statusLabel: "متاح باتفاق النطاق",
  problemLine: "بيانات موردين وإنفاق متفرقة — تقارير محتوى محلي متأخرة وغير قابلة للدفاع.",
  outcomeLine: "امتثال ومحتوى محلي كمسار تشغيلي — ليس تقارير لحظية من جداول.",
  before: [
    "موردون غير مصنفين",
    "إنفاق يُحلّل يدوياً",
    "فجوات امتثال مخفية",
    "مؤشرات غير واضحة",
    "قرارات شراء دون محاكاة أثر",
  ],
  after: [
    "تصنيف موردين محكوم",
    "إنفاق مرتبط بالمورد الفعلي",
    "فجوات امتثال مرئية",
    "مؤشرات محتوى محلي دقيقة",
    "تقارير جاهزة للجهات التنظيمية",
  ],
  flowSteps: ["موردون", "إنفاق", "تصنيف", "فجوات", "مؤشرات", "تقارير"],
  highlights: [
    "مسار مورد–إنفاق–امتثال",
    "ربط ERP عند التفعيل",
    "تقارير LCGPA جاهزة",
  ],
  demoHref: "/proof#evidence-samples",
  demoLabel: "نماذج مخرجات",
  primaryCta: { label: "تواصل معنا", href: "/contact" },
  secondaryCta: { label: "قطاع الحكومة", href: "/industries#government" },
};

export type ProductIndexCard = {
  id: string;
  title: string;
  subtitle: string;
  statusLabel: string;
  problem: string;
  href: string;
  muted?: boolean;
};

export const tier1ProductCards: ProductIndexCard[] = [
  {
    id: "audit",
    title: "AuditOS",
    subtitle: "مراجعة وامتثال مالي",
    statusLabel: "متاح للتطبيق",
    problem: "من ميزان المراجعة إلى حزمة الارتباط — مسار أدلة كامل.",
    href: "/products/audit",
  },
  {
    id: "decision",
    title: "DecisionOS",
    subtitle: "حوكمة القرارات",
    statusLabel: "متكامل في المنصة",
    problem: "بدائل، معايير، مخاطر، واعتماد — لا مذكرات متفرقة.",
    href: "/products/decision",
  },
  {
    id: "local-content",
    title: "LocalContentOS",
    subtitle: "محتوى محلي وامتثال",
    statusLabel: "متاح باتفاق النطاق",
    problem: "موردون، إنفاق، مؤشرات، وتقارير تنظيمية في مسار واحد.",
    href: "/products/local-content",
  },
];

export const roadmapProductCards: ProductIndexCard[] = [
  {
    id: "office-ai",
    title: "Office AI Assistant",
    subtitle: "مساعد مؤسسي مشترك",
    statusLabel: "خدمة مشتركة",
    problem: "مساعد مؤسسي عبر حلول المنصة.",
    href: "/products/office-ai",
    muted: true,
  },
  {
    id: "sales",
    title: "SalesOS",
    subtitle: "ذاكرة تجارية",
    statusLabel: "قريباً على خارطة المنصة",
    problem: "تأهيل، pipeline، وذاكرة مبيعات — نموذج أولي.",
    href: "/products/sales",
    muted: true,
  },
];
