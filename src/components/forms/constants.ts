// ─── Types ───

export type FormData = {
  orgName: string;
  industry: string;
  orgSize: string;
  country: string;
  systemCategory: string;
  challenges: string[];
  environment: string[];
  outcomes: string[];
  intent: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
};

export type FormStatus = "idle" | "submitting" | "success" | "error";

export type FormErrors = Partial<Record<keyof FormData, string>>;

// ─── Initial Data ───

export const initialData: FormData = {
  orgName: "",
  industry: "",
  orgSize: "",
  country: "",
  systemCategory: "",
  challenges: [],
  environment: [],
  outcomes: [],
  intent: "",
  contactName: "",
  contactRole: "",
  contactEmail: "",
  contactPhone: "",
  notes: "",
};

// ─── Constants ───

export const industries = [
  { value: "", label: "اختر القطاع..." },
  { value: "financial_services", label: "الخدمات المالية" },
  { value: "audit_accounting", label: "المراجعة والمحاسبة" },
  { value: "consulting", label: "الاستشارات" },
  { value: "oil_gas", label: "النفط والغاز" },
  { value: "construction", label: "الإنشاءات" },
  { value: "retail_wholesale", label: "التجزئة والجملة" },
  { value: "healthcare", label: "الرعاية الصحية" },
  { value: "technology", label: "التقنية" },
  { value: "manufacturing", label: "التصنيع" },
  { value: "logistics", label: "الخدمات اللوجستية" },
  { value: "government", label: "القطاع الحكومي" },
  { value: "education", label: "التعليم" },
  { value: "real_estate", label: "العقارات" },
  { value: "other", label: "قطاع آخر" },
];

export const sizes = [
  { value: "", label: "اختر الحجم..." },
  { value: "1_10", label: "١–١٠ موظفين" },
  { value: "11_50", label: "١١–٥٠ موظفًا" },
  { value: "51_200", label: "٥١–٢٠٠ موظف" },
  { value: "201_500", label: "٢٠١–٥٠٠ موظف" },
  { value: "501_plus", label: "+٥٠٠ موظف" },
];

export const countries = [
  { value: "", label: "اختر الدولة..." },
  { value: "sa", label: "المملكة العربية السعودية" },
  { value: "ae", label: "الإمارات العربية المتحدة" },
  { value: "kw", label: "الكويت" },
  { value: "qa", label: "قطر" },
  { value: "bh", label: "البحرين" },
  { value: "om", label: "عُمان" },
  { value: "eg", label: "مصر" },
  { value: "jo", label: "الأردن" },
  { value: "other", label: "دولة أخرى" },
];

export const systemCategories = [
  {
    id: "decision",
    label: "أنظمة اتخاذ القرار",
    desc: "تنظيم القرارات المعقدة من المشكلة إلى التوصية والاعتماد",
  },
  {
    id: "simulation",
    label: "أنظمة المحاكاة",
    desc: "اختبار السيناريوهات قبل التنفيذ وفهم الأثر والمخاطر",
  },
  {
    id: "sales",
    label: "أنظمة المبيعات",
    desc: "تأهيل العملاء وترتيب الأولويات وتحسين الأداء",
  },
  {
    id: "audit",
    label: "أنظمة المراجعة والتدقيق",
    desc: "تنظيم المراجعة والأدلة والملاحظات والمخرجات",
  },
  {
    id: "local_content",
    label: "أنظمة المحتوى المحلي",
    desc: "إدارة الموردين والإنفاق والالتزام والمؤشرات",
  },
  {
    id: "custom",
    label: "نظام مؤسسي مخصص",
    desc: "نظام يُبنى بالكامل حسب طبيعة عمل مؤسستك",
  },
];

export const challenges = [
  { id: "slow_decisions", label: "بطء في اتخاذ القرارات" },
  { id: "fragmented_workflows", label: "إجراءات متفرقة وغير مترابطة" },
  { id: "manual_audit", label: "مراجعة وتدقيق يدوية" },
  { id: "weak_traceability", label: "ضعف التتبع والمراجعة" },
  { id: "disconnected_data", label: "بيانات منفصلة غير متصلة" },
  { id: "forecasting_gaps", label: "ضعف القدرة على التنبؤ والتخطيط" },
  { id: "sales_visibility", label: "غياب رؤية واضحة لأداء المبيعات" },
  {
    id: "local_content_compliance",
    label: "صعوبة الالتزام بمتطلبات المحتوى المحلي",
  },
  { id: "reporting_burden", label: "عبء إعداد التقارير" },
  { id: "excel_dependency", label: "اعتماد مفرط على Excel والملفات اليدوية" },
  { id: "other_challenge", label: "تحديات أخرى" },
];

export const environments = [
  { id: "erp", label: "نظام ERP" },
  { id: "spreadsheets", label: "Excel / أوراق عمل" },
  { id: "legacy", label: "أنظمة قديمة (Legacy)" },
  { id: "manual", label: "إجراءات ورقية / يدوية" },
  { id: "mixed", label: "خليط من أنظمة متفرقة" },
  { id: "none", label: "لا يوجد نظام حالي" },
];

export const outcomes = [
  { id: "automation", label: "أتمتة الإجراءات" },
  { id: "visibility", label: "وضوح البيانات والمؤشرات" },
  { id: "operational_control", label: "تحكم تشغيلي أفضل" },
  { id: "reporting", label: "تقارير دقيقة ومؤتمتة" },
  { id: "auditability", label: "قابلية المراجعة والتتبع" },
  { id: "simulation", label: "محاكاة السيناريوهات" },
  { id: "forecasting", label: "التنبؤ والتخطيط" },
  { id: "compliance", label: "الالتزام والامتثال" },
  { id: "traceability", label: "تتبع كامل للمخرجات" },
];

export const intents = [
  { value: "", label: "اختر هدف التواصل..." },
  { value: "exploratory", label: "نقاش استكشافي — فهم الإمكانيات" },
  { value: "demo", label: "طلب عرض توضيحي — مشاهدة نظام حي" },
  { value: "pilot", label: "مشروع تجريبي — تطبيق مبدئي" },
  { value: "full_build", label: "بناء نظام كامل — جاهز للتشغيل" },
];

// ─── Helpers ───

export function buildMailtoLink(data: FormData): string {
  const subject = encodeURIComponent(`طلب تصميم نظام مؤسسي | ${data.orgName}`);
  const body = encodeURIComponent(
    `طلب تصميم نظام مؤسسي من AQLIYA\n\n` +
      `المؤسسة: ${data.orgName}\nالقطاع: ${industries.find((i) => i.value === data.industry)?.label ?? data.industry}\n` +
      `الحجم: ${sizes.find((s) => s.value === data.orgSize)?.label ?? data.orgSize}\nالدولة: ${countries.find((c) => c.value === data.country)?.label ?? data.country}\n\n` +
      `نوع النظام: ${systemCategories.find((c) => c.id === data.systemCategory)?.label ?? data.systemCategory}\n\n` +
      `التحديات: ${data.challenges.map((c) => challenges.find((x) => x.id === c)?.label ?? c).join("، ")}\n` +
      `البيئة الحالية: ${data.environment.map((e) => environments.find((x) => x.id === e)?.label ?? e).join("، ")}\n` +
      `المخرجات المطلوبة: ${data.outcomes.map((o) => outcomes.find((x) => x.id === o)?.label ?? o).join("، ")}\n` +
      `هدف التواصل: ${intents.find((i) => i.value === data.intent)?.label ?? data.intent}\n\n` +
      `الاسم: ${data.contactName}\nالمنصب: ${data.contactRole}\n` +
      `البريد: ${data.contactEmail}\nالهاتف: ${data.contactPhone}\n\n` +
      `ملاحظات: ${data.notes || "لا يوجد"}\n\n` +
      `---\nمرسل من: AQLIYA Custom Product Request\nhttps://aqliya.com/custom-product`,
  );
  return `mailto:ragheed@aqliya.com?subject=${subject}&body=${body}`;
}

// ─── Lookup Helpers ───

export function findLabel(
  items: { value?: string; id?: string; label: string }[],
  key: string,
): string {
  return items.find((i) => (i.value ?? i.id) === key)?.label ?? "-";
}
