export type ProcurementPackItem = {
  title: string;
  body: string;
  href: string;
  cta: string;
  external?: boolean;
};

export const procurementPackItems: ProcurementPackItem[] = [
  {
    title: "الإحاطة التنفيذية (PDF — عربي)",
    body: "ملخص ٥ دقائق للقيادة: المنصة، الحوكمة، القدرات، وما ليس متاحاً.",
    href: "/print/executive-brief",
    cta: "تحميل / طباعة",
    external: true,
  },
  {
    title: "Executive Brief (PDF — EN)",
    body: "Five-minute leadership summary for board forwarding.",
    href: "/print/executive-brief-en",
    cta: "Download / print",
    external: true,
  },
  {
    title: "ملخص الأمن (PDF)",
    body: "RBAC، سجل التدقيق، الأدلة، العزل، وحدود AI — للمسؤول التقني.",
    href: "/print/security-summary",
    cta: "تحميل / طباعة",
    external: true,
  },
  {
    title: "إقامة البيانات (PDF)",
    body: "أين تُستضاف البيانات افتراضياً، منطقة AWS، وحدود النشر الخاص.",
    href: "/print/data-residency",
    cta: "تحميل / طباعة",
    external: true,
  },
  {
    title: "المعالجون الفرعيون (PDF)",
    body: "قائمة شفافة للبنية السحابية وخدمات التشغيل — بدون ادعاء SOC2.",
    href: "/print/subprocessors",
    cta: "تحميل / طباعة",
    external: true,
  },
  {
    title: "ملخص اتفاقية المعالجة (PDF)",
    body: "إطار DPA على مستوى المبادئ — النسخة الملزمة تُعدّ حسب العقد.",
    href: "/print/dpa-summary",
    cta: "تحميل / طباعة",
    external: true,
  },
  {
    title: "Evaluation SOW template (PDF — EN)",
    body: "Short scope template for a governed operational evaluation — English.",
    href: "/print/evaluation-sow-en",
    cta: "Download / print",
    external: true,
  },
  {
    title: "نموذج نطاق التقييم التشغيلي (PDF)",
    body: "SOW مختصر: مسار واحد، معايير نجاح، وحدود المسؤولية.",
    href: "/print/pilot-sow-template",
    cta: "تحميل / طباعة",
    external: true,
  },
  {
    title: "ملخص قطاع مكاتب المراجعة (PDF)",
    body: "لماذا AuditOS كمسار تدقيق محكوم — من الميزان إلى حزمة الارتباط.",
    href: "/print/industry-audit-firms",
    cta: "تحميل / طباعة",
    external: true,
  },
  {
    title: "مقارنة Excel مقابل AQLIYA (PDF)",
    body: "أدوات يدوية مقابل مسار محكوم — للمبيعات والمشتري.",
    href: "/print/comparison-excel-aqliya",
    cta: "تحميل / طباعة",
    external: true,
  },
  {
    title: "ردود الاعتراضات (PDF)",
    body: "اعتراضات شائعة — ردود صادقة للمشتري والتقنية.",
    href: "/print/objection-handling",
    cta: "تحميل / طباعة",
    external: true,
  },
  {
    title: "قالب مرجع تقييم (PDF)",
    body: "هيكل case study anonymized — يُملأ بعد قرار بالأدلة وإذن.",
    href: "/print/reference-case-template",
    cta: "تحميل / طباعة",
    external: true,
  },
  {
    title: "خارطة SOC2",
    body: "أهداف Type I بمواعيد مستهدفة — بدون ادعاء شهادة.",
    href: "/soc2-roadmap",
    cta: "خارطة SOC2",
  },
  {
    title: "قالب metrics أسبوعي (PDF)",
    body: "Checkpoint أسبوعي لتقييم AuditOS — للاستخدام مع العميل.",
    href: "/print/pilot-weekly-metrics",
    cta: "تحميل / طباعة",
    external: true,
  },
  {
    title: "نتائج التقييم التشغيلي",
    body: "مقاييس مجمّعة — تُنشر بصدق عند اكتمال تقييمين تشغيليين أو أكثر.",
    href: "/proof#outcomes",
    cta: "نتائج التقييم",
  },
  {
    title: "مركز الإثبات",
    body: "ديمو تفاعلي، مكتبة مخرجات، ومسارات التحقق قبل أي التزام.",
    href: "/proof",
    cta: "مركز الإثبات",
  },
  {
    title: "إطار التقييم التشغيلي",
    body: "معايير قرار بالأدلة، أبعاد التقييم، وأمثلة أدلة تُلتقط أثناء التجربة.",
    href: "/proof#evaluation-framework",
    cta: "إطار التقييم",
  },
  {
    title: "نماذج التعاون",
    body: "تشخيص → تقييم تشغيلي محدود → تفعيل مؤسسي — بدون عقد واسع قبل الإثبات.",
    href: "/start#engagement",
    cta: "نماذج التعاون",
  },
  {
    title: "دليل المشتريات",
    body: "أسئلة التقييم، نطاق التقييم التشغيلي، ومتطلبات الأدلة للمشتريات.",
    href: "/start#procurement",
    cta: "دليل المشتريات",
  },
];

export const procurementPackItemsEn: ProcurementPackItem[] = [
  {
    title: "Executive brief (PDF — EN)",
    body: "Five-minute leadership summary for board forwarding.",
    href: "/print/executive-brief-en",
    cta: "Download / print",
    external: true,
  },
  {
    title: "Executive brief (PDF — AR)",
    body: "Arabic leadership summary — platform, governance, capabilities, limits.",
    href: "/print/executive-brief",
    cta: "Download / print",
    external: true,
  },
  {
    title: "Security summary (PDF)",
    body: "RBAC, audit trail, evidence, isolation, AI boundaries — for security review.",
    href: "/print/security-summary",
    cta: "Download / print",
    external: true,
  },
  {
    title: "Data residency (PDF)",
    body: "Default hosting region, AWS geography, private deployment limits.",
    href: "/print/data-residency",
    cta: "Download / print",
    external: true,
  },
  {
    title: "Subprocessors (PDF)",
    body: "Transparent cloud and operations providers — no false SOC2 claims.",
    href: "/print/subprocessors",
    cta: "Download / print",
    external: true,
  },
  {
    title: "DPA summary (PDF)",
    body: "Principles-level processing agreement — binding version per contract.",
    href: "/print/dpa-summary",
    cta: "Download / print",
    external: true,
  },
  {
    title: "Evaluation SOW template (PDF — EN)",
    body: "Short scope for a governed operational evaluation.",
    href: "/print/evaluation-sow-en",
    cta: "Download / print",
    external: true,
  },
  {
    title: "Industry brief — audit firms (PDF)",
    body: "Why AuditOS as a governed audit path — trial balance to engagement pack.",
    href: "/print/industry-audit-firms",
    cta: "Download / print",
    external: true,
  },
  {
    title: "Objection handling (PDF)",
    body: "Common buyer objections — honest responses for procurement and IT.",
    href: "/print/objection-handling",
    cta: "Download / print",
    external: true,
  },
  {
    title: "SOC2 roadmap",
    body: "Type I targets and timeline — no certification claim.",
    href: "/en/soc2-roadmap",
    cta: "SOC2 roadmap",
  },
  {
    title: "Proof center",
    body: "Interactive demo, documents, evaluation criteria — before wide commitment.",
    href: "/en/proof",
    cta: "Proof center",
  },
  {
    title: "Engagement models",
    body: "Diagnostic → operational evaluation → institutional activation.",
    href: "/en/start#engagement",
    cta: "Engagement models",
  },
  {
    title: "Deployment options",
    body: "Managed cloud, private (planned), air-gapped (strategic) — stated honestly.",
    href: "/en/deployment",
    cta: "Deployment",
  },
];
