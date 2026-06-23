/**
 * Condensed proof hub content — merged from executive-brief, pilot-proof, proof-library, pilot-outcomes.
 * @see docs/marketing/MARKETING_REDESIGN_PLAN.md R2
 */

export const executiveBriefLayers = [
  {
    name: "AQLIYA Intelligence Core",
    description: "تنسيق الذكاء، الحوكمة، شبكة الأدلة، الصلاحيات، وسجل التدقيق.",
  },
  {
    name: "AuditOS",
    description: "مسار مراجعة كامل من المصدر إلى الاعتماد.",
  },
  {
    name: "DecisionOS",
    description: "مذكرات قرار محكومة مع مراجعة بشرية.",
  },
  {
    name: "LocalContentOS",
    description: "موردون، إنفاق، امتثال، وتقارير تنظيمية.",
  },
];

export const governancePrinciples = [
  { title: "الذكاء يساعد", detail: "كل مخرج AI مسودة — لا قرار آلي نهائي." },
  { title: "الإنسان يقرر", detail: "بوابات اعتماد تمنع النشر قبل اكتمال الشروط البشرية." },
  { title: "الدليل يحكم", detail: "كل قرار مرتبط بمصدره — سجل تدقيق لكل إجراء." },
];

export const deploymentOptions = [
  {
    name: "Cloud Managed",
    status: "متاح — النموذج الافتراضي",
    note: "مكاتب التدقيق والقطاع الخاص",
  },
  {
    name: "Private Cloud",
    status: "حسب نطاق المؤسسة",
    note: "خصوصية بيانات مرتفعة — تواصل للنطاق",
  },
  {
    name: "On-Prem / Air-Gapped",
    status: "استراتيجي — ليس حزمة جاهزة",
    note: "للجهات ذات أعلى متطلبات أمن — نناقش في التشخيص",
  },
];

export const proofDimensions = [
  {
    dimension: "وضوح سير العمل",
    question: "هل الخطوات واضحة وقابلة للتنفيذ على المنصة؟",
  },
  {
    dimension: "جاهزية البيانات",
    question: "هل البيانات متوفرة بالجودة والصيغة المطلوبة؟",
  },
  {
    dimension: "إمكانية تتبع الأدلة",
    question: "هل يمكن ربط كل مخرج بمصدره؟",
  },
  {
    dimension: "جودة المراجعة البشرية",
    question: "هل استطاع الفريق مراجعة المخرجات واتخاذ قرارات؟",
  },
  {
    dimension: "فائدة المخرجات",
    question: "هل المخرجات تخدم سير العمل الفعلي؟",
  },
  {
    dimension: "ثقة القرار",
    question: "هل يمكن اتخاذ قرار بالأدلة بناءً على التجربة؟",
  },
];

export const proofScenarios = [
  {
    title: "سلسلة الأدلة",
    verifiable: "ارفع ميزان تجريبي وتتبع أي رقم إلى مصدره في الديمو.",
  },
  {
    title: "Audit Trail غير قابل للتعديل",
    verifiable: "نفّذ خطوة وراجع السجل المباشر — ١٨+ نوع حدث.",
  },
  {
    title: "بوابة الاعتماد البشري",
    verifiable: "حاول النشر قبل اكتمال ٥ شروط — النظام يرفض.",
  },
  {
    title: "RBAC — فصل الصلاحيات",
    verifiable: "جرّب أدواراً مختلفة في الديمو وراقب الصلاحيات.",
  },
];

export const evidenceSamples = [
  {
    id: "tb",
    title: "نتيجة فحص ميزان المراجعة",
    category: "معالجة ميزان المراجعة",
    highlight: "١٤٧ حساب — اتزان فوري — اقتراح توجيه IFRS للمراجعة البشرية",
  },
  {
    id: "statements",
    title: "مسودة قائمة المركز المالي",
    category: "قوائم مالية",
    highlight: "مسودة للمراجعة البشرية — ٨٩٪ بنود مادية مرتبطة بأدلة",
  },
  {
    id: "trail",
    title: "Audit Trail — سجل ارتباط",
    category: "سجل التدقيق",
    highlight: "٢٤٧+ حدث — ٤ مستخدمين — غير قابل للتعديل",
  },
];

export const outcomesFutureMetrics = [
  "وقت الإغلاق (قبل ↔ بعد — مقاس)",
  "اكتمال سلسلة الأدلة (% بنود مرتبطة)",
  "بوابات المراجعة — مكتملة مقابل محجوبة",
  "ثقة المعتمد (استبيان نوعي)",
  "قرار بالأدلة (متابعة / مراجعة / إيقاف)",
];

export const pilotDecisionOutcomes = [
  { outcome: "متابعة — توسّع", detail: "التقييم أثبت القيمة — انتقال لتفعيل مؤسسي." },
  { outcome: "مراجعة النطاق", detail: "فجوة في المسار أو البيانات — تعديل وإعادة تقييم." },
  { outcome: "إيقاف", detail: "المسار غير مناسب — توصية ببديل أو إغلاق الملف." },
];
