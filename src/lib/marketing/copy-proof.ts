/**
 * Proof-layer copy — clearer but human (R6)
 * @see docs/marketing/VOICE_GUIDE.md
 */

export const proofPageCopyAr = {
  metadata: {
    title: "الإثبات | AQLIYA",
    description:
      "ديمو، ملخص للقيادة، معايير التجربة، ونماذج مخرجات — كل ما تحتاجه قبل قرار الشراء.",
  },
  hero: {
    eyebrow: "الإثبات",
    title: "كل مواد التقييم في مكان واحد",
    subtitle:
      "ديمو تفاعلي، ملخص للقيادة، ومعايير واضحة للتجربة على بياناتكم. نبدأ بمكالمة، ثم تجربة محدودة، ثم تقررون.",
    sampleNote: "الديمو والنماذج على بيانات تجريبية — لا بيانات عملاء حقيقية.",
  },
  sections: {
    demo: {
      title: "الديمو",
      subtitle: "مسار مراجعة كامل على بيانات تجريبية — بدون تسجيل.",
      primaryCta: "افتح الديمو",
      secondaryCta: "مسار AuditOS المباشر",
    },
    brief: {
      title: "ملخص للقيادة",
      subtitle: "نظرة سريعة على المنصة والحلول وخيارات النشر.",
    },
    evaluation: {
      title: "كيف نقيّم التجربة",
      subtitle: "ستة أسئلة نجيب عنها معاً أثناء التجربة على بياناتكم.",
      engagementLink: "طرق التعاون والتجربة المجانية",
    },
    evidence: {
      title: "نماذج مخرجات",
      subtitle: "أمثلة على ما يخرج من المنصة — للمراجعة لا للاعتماد النهائي.",
      sampleBadge: "بيانات تجريبية",
    },
    outcomes: {
      title: "نتائج العملاء",
      statusLabel: "الوضع الحالي",
      statusTitle: "نحضّر أول مراجعات حقيقية للنشر",
      statusBody:
        "لا ننشر أرقاماً وهمية. عندما نكمل أول تجربة مع عميل ونحصل على موافقة، نضيف النتائج هنا.",
    },
    procurement: {
      title: "روابط مفيدة",
    },
  },
  anchorNav: [
    { id: "demo", label: "الديمو" },
    { id: "executive-brief", label: "ملخص القيادة" },
    { id: "evaluation-framework", label: "معايير التجربة" },
    { id: "evidence-samples", label: "نماذج مخرجات" },
    { id: "outcomes", label: "نتائج" },
    { id: "procurement", label: "مشتريات" },
  ],
  externalLinks: [
    { label: "ملف المشتريات", href: "/procurement-pack" },
    { label: "الأمن والنشر", href: "/security" },
    { label: "دراسات الحالة", href: "/case-studies" },
    { label: "من أين تبدأ", href: "/start" },
  ],
} as const;

export const executiveBriefLayers = [
  {
    name: "منصة عقلية",
    description: "صلاحيات، سجل عمل، وربط كل مخرج بمصدره — أساس مشترك لكل الحلول.",
  },
  {
    name: "AuditOS",
    description: "من رفع ميزان المراجعة إلى ملف ارتباط جاهز.",
  },
  {
    name: "DecisionOS",
    description: "قرارات موثقة: السياق، البدائل، والموافقات.",
  },
  {
    name: "LocalContentOS",
    description: "موردون، إنفاق، محتوى محلي، وتقارير للجهات الرقابية.",
  },
];

export const governancePrinciples = [
  {
    title: "الذكاء يقترح",
    detail: "ما يخرج من النظام مسودة — لا قرار نهائي تلقائي.",
  },
  {
    title: "فريقكم يعتمد",
    detail: "لا يُصدَر ملف قبل موافقة الشخص المخوّل.",
  },
  {
    title: "كل شيء له مصدر",
    detail: "رقم أو قرار — يمكن الرجوع للملف أو السجل الذي بني عليه.",
  },
];

export const deploymentOptions = [
  {
    name: "سحابة مُدارة",
    status: "متاح اليوم",
    note: "الخيار الافتراضي لمعظم المؤسسات",
  },
  {
    name: "سحابة خاصة",
    status: "حسب الاتفاق",
    note: "عندما تريدون البيانات داخل حسابكم",
  },
  {
    name: "بيئة معزولة",
    status: "مشروع خاص — ليس جاهزاً للطلب الفوري",
    note: "للجهات ذات متطلبات أمن استثنائية — نناقشها في المكالمة",
  },
];

export const proofDimensions = [
  {
    dimension: "هل المسار واضح؟",
    question: "هل يستطيع فريقكم تنفيذ الخطوات على المنصة بدون تخمين؟",
  },
  {
    dimension: "هل البيانات جاهزة؟",
    question: "هل عندكم الملفات والصيغ اللازمة للتجربة؟",
  },
  {
    dimension: "هل المصدر ظاهر؟",
    question: "هل يمكن فتح أي رقم أو قرار والوصول لملفه الأصلي؟",
  },
  {
    dimension: "هل المراجعة عملية؟",
    question: "هل استطاع المراجعون قبول أو رفض المخرجات بسهولة؟",
  },
  {
    dimension: "هل النتيجة مفيدة؟",
    question: "هل المخرجات توفر وقتاً في العمل اليومي؟",
  },
  {
    dimension: "هل أنتم مرتاحون للقرار؟",
    question: "بعد التجربة — هل لديكم ما يكفي للمضي أو التوقف بصدق؟",
  },
];

export const proofScenarios = [
  {
    title: "من الرقم إلى الملف",
    verifiable: "ارفعوا ميزاناً تجريبياً وافتحوا مصدر أي رقم في الديمو.",
  },
  {
    title: "سجل لا يُمحى",
    verifiable: "نفّذوا خطوة وراجعوا من غيّر ماذا ومتى.",
  },
  {
    title: "الاعتماد قبل الإصدار",
    verifiable: "حاولوا إصدار ملف قبل اكتمال الشروط — المنصة ترفض.",
  },
  {
    title: "صلاحيات حسب الدور",
    verifiable: "جرّبوا أدواراً مختلفة ولاحظوا من يرى ماذا.",
  },
];

export const evidenceSamples = [
  {
    id: "tb",
    title: "فحص ميزان المراجعة",
    category: "ميزان المراجعة",
    highlight: "١٤٧ حساباً — اتزان فوري — اقتراحات توجيه للمراجع البشري",
  },
  {
    id: "statements",
    title: "مسودة قائمة المركز المالي",
    category: "قوائم مالية",
    highlight: "مسودة للمراجعة — أغلب البنود المهمة مربوطة بملفات",
  },
  {
    id: "trail",
    title: "سجل العمل",
    category: "سجل التدقيق",
    highlight: "مئات الأحداث — عدة مستخدمين — لا يُعدَّل بعد التسجيل",
  },
];

export const outcomesFutureMetrics = [
  "وقت إغلاق المراجعة (قبل وبعد)",
  "نسبة البنود المربوطة بملف مصدر",
  "خطوات المراجعة المكتملة مقابل المعلّقة",
  "راحة المعتمد من المخرجات",
  "قراركم: نكمل · نعدّل النطاق · نتوقف",
];

export const pilotDecisionOutcomes = [
  {
    outcome: "نكمل",
    detail: "التجربة أقنعتكم — ننتقل لتشغيل أوسع باتفاق واضح.",
  },
  {
    outcome: "نعدّل النطاق",
    detail: "فجوة في البيانات أو المسار — نضبط ونعيد التجربة.",
  },
  {
    outcome: "نتوقف",
    detail: "الحل غير مناسب الآن — نغلق الملف بصدق.",
  },
];
