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
    body: "ملخص ٥ دقائق للقيادة: المنصة، الحوكمة، الجاهزية، وما ليس متاحاً.",
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
    title: "نموذج نطاق البايلوت (PDF)",
    body: "SOW مختصر: سير عمل واحد، معايير نجاح، وحدود المسؤولية.",
    href: "/print/pilot-sow-template",
    cta: "تحميل / طباعة",
    external: true,
  },
  {
    title: "ملخص قطاع مكاتب المراجعة (PDF)",
    body: "لماذا AuditOS كإسفين تجاري — مسار من الميزان إلى حزمة الارتباط.",
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
    title: "قالب مرجع بايلوت (PDF)",
    body: "هيكل case study anonymized — يُملأ بعد Proceed + إذن.",
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
    body: "Checkpoint أسبوعي لبايلوت AuditOS — للاستخدام مع العميل.",
    href: "/print/pilot-weekly-metrics",
    cta: "تحميل / طباعة",
    external: true,
  },
  {
    title: "نتائج البايلوت",
    body: "مقاييس مجمّعة — تُنشر بصدق عند ≥2 بايلوت مكتمل (placeholder حالياً).",
    href: "/pilot-outcomes",
    cta: "نتائج البايلوت",
  },
  {
    title: "مركز الإثبات",
    body: "ديمو تفاعلي، مكتبة مخرجات، ومسارات التحقق قبل أي التزام.",
    href: "/proof",
    cta: "مركز الإثبات",
  },
  {
    title: "إطار البايلوت",
    body: "معايير Go/No-Go، أبعاد التقييم، وأمثلة أدلة تُلتقط أثناء التجربة.",
    href: "/pilot-proof",
    cta: "إطار البايلوت",
  },
  {
    title: "نماذج التعاون",
    body: "تشخيص → بايلوت محدود → توسع — بدون عقد واسع قبل الإثبات.",
    href: "/engagement-models",
    cta: "نماذج التعاون",
  },
  {
    title: "دليل المشتريات",
    body: "أسئلة التقييم، نطاق البايلوت، ومتطلبات الأدلة للمشتريات.",
    href: "/buyers#procurement",
    cta: "دليل المشتريات",
  },
];
