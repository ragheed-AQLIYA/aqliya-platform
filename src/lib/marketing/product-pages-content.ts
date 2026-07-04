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
  governanceItems?: Array<{
    title: string;
    detail: string;
    icon?: "evidence" | "approval" | "permissions" | "audit";
  }>;
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
  primaryCta: { label: "احجز جلسة تشخيص", href: "/contact" },
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
  governanceItems: [
    { icon: "evidence", title: "ربط كل بند بمصدره", detail: "كل رقم في قائمة الدخل أو الميزانية مرتبط بمصدره في ميزان المراجعة — فاتورة، عقد، أو قيد. لا إدعاء بلا دليل." },
    { icon: "approval", title: "اعتماد الشريك قبل كل خروج", detail: "خمسة شروط في بوابة الاعتماد قبل التصدير: مراجعة الشريك، استكمال أدلة، موافقة الجودة، خلو من الأخطاء، وتوقيع إلكتروني." },
    { icon: "permissions", title: "فريق الارتباط فقط", detail: "المستخدمون ضمن فريق الارتباط فقط يرون ملف المراجعة. لا وصول خارجي، لا صلاحيات متجاوزة." },
    { icon: "audit", title: "سجل تدقيق ISA 230", detail: "كل حدث — إنشاء، تعديل، مراجعة، اعتماد — يُسجَّل مع التوقيت والهوية. السجل غير قابل للتعديل وجاهز لمراجعة الجودة." },
  ],
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
  primaryCta: { label: "احجز جلسة تشخيص", href: "/contact" },
  secondaryCta: { label: "مواد الإثبات", href: "/proof" },
  governanceItems: [
    { icon: "evidence", title: "كل قرار مرتبط ببياناته", detail: "البدائل، المعايير، تقييم المخاطر — كلها مرتبطة بمصادرها (تقارير، دراسات، أرقام). لا قرار بلا أساس." },
    { icon: "approval", title: "اعتماد هرمي حسب السياسة", detail: "القرار يمر بموافقة المدير، ثم اللجنة، ثم مجلس الإدارة حسب مبلغ القرار وتأثيره. كل مستوى يُسجِّل موافقته أو طلب التعديل." },
    { icon: "permissions", title: "صلاحيات حسب الدور", detail: "من يقترح، من يراجع، من يعتمد — مسارات واضحة ومقيدة مسبقاً. لا يستطيع المقترح اعتماد قراره بنفسه." },
    { icon: "audit", title: "تجميد القرار بعد الاعتماد", detail: "بمجرد اعتماد القرار، يُجمَد النص ولا يمكن تعديله. أي تغيير لاحق يمر بقرار جديد مرتبط بالأصل." },
  ],
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
  primaryCta: { label: "احجز جلسة تشخيص", href: "/contact" },
  secondaryCta: { label: "مواد الإثبات", href: "/proof" },
  governanceItems: [
    { icon: "evidence", title: "إقرارات الموردين كأدلة", detail: "نسبة المحتوى المحلي لكل مورد مدعومة بإقراراته وفواتيره. لا رقم بدون مستند." },
    { icon: "approval", title: "اعتماد التصنيف والتقارير", detail: "تصنيف الموردين وتقارير المحتوى المحلي تمر بمراجعة واعتماد قبل الإرسال للجهات الرقابية." },
    { icon: "permissions", title: "بيانات الموردين محمية", detail: "الوصول إلى بيانات الموردين والإنفاق مقيّد حسب دور المستخدم داخل المنشأة. لا اطلاع بدون صلاحية." },
    { icon: "audit", title: "سجل تدقيق تنظيمي", detail: "كل تغيير في تصنيف مورد، أو إنفاق، أو تقرير — مسجل بالكامل وجاهز لمراجعة الجهات الرقابية." },
  ],
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
    id: "local-content",
    title: "LocalContentOS",
    subtitle: "محتوى محلي وامتثال",
    statusLabel: "متاح باتفاق النطاق",
    problem: "موردون، إنفاق، وامتثال للجهات الرقابية.",
    href: "/products/local-content",
    muted: false,
  },
  {
    id: "decision",
    title: "DecisionOS",
    subtitle: "حوكمة القرارات",
    statusLabel: "متكامل في المنصة",
    problem: "بدائل، معايير، مخاطر، واعتماد — لا مذكرات متفرقة.",
    href: "/products/decision",
  },
];

export const roadmapProductCards: ProductIndexCard[] = [
  {
    id: "sales",
    title: "SalesOS",
    subtitle: "ذاكرة تجارية",
    statusLabel: "قريباً على خارطة المنصة",
    problem: "تأهيل، pipeline، وذاكرة مبيعات — في خارطة المنصة.",
    href: "/products/sales",
    muted: true,
  },
  {
    id: "office-ai",
    title: "Office AI Assistant",
    subtitle: "مساعد مؤسسي مشترك",
    statusLabel: "خدمة مشتركة",
    problem: "مساعد مؤسسي عبر حلول المنصة — تلخيص، تحرير، تحليل.",
    href: "/products/office-ai",
    muted: true,
  },
];
