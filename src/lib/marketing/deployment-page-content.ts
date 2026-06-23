/**
 * Condensed deployment page content (R5)
 * @see docs/marketing/MARKETING_REDESIGN_PLAN.md §5.3
 */

export type DeploymentModel = {
  id: string;
  name: string;
  status: string;
  statusTone: "available" | "planned" | "strategic";
  summary: string;
  highlights: string[];
  note?: string;
};

export const deploymentModelsAr: DeploymentModel[] = [
  {
    id: "cloud",
    name: "السحابة المُدارة",
    status: "متاح الآن",
    statusTone: "available",
    summary:
      "البيئة الإنتاجية لمعظم المؤسسات — عقلية تُدير البنية والتحديثات والاستمرارية، ومؤسستك تتحكم بالبيانات والصلاحيات.",
    highlights: [
      "إقامة بيانات سعودية/خليجية افتراضياً",
      "عزل مستأجرين على DB والتطبيق",
      "نسخ احتياطي يومي مشفّر",
      "99.5% توفر مستهدف شهرياً",
    ],
  },
  {
    id: "private",
    name: "الخوادم الخاصة",
    status: "قيد التخطيط",
    statusTone: "planned",
    summary:
      "نشر المنصة داخل حساب سحابتك — سيطرة على الشبكة والبيانات ودورة التحديث، مع دعم هندسي مشترك.",
    highlights: [
      "AWS / Azure / GCP داخل حساب المؤسسة",
      "تكامل IAM وأدوات أمن المؤسسة",
      "تحديثات بموافقة واختبار داخلي",
    ],
    note: "يتطلب تقييم جدوى مشتركاً — ليس حزمة جاهزة للتفعيل الفوري.",
  },
  {
    id: "airgapped",
    name: "البيئة المعزولة",
    status: "استراتيجي",
    statusTone: "strategic",
    summary:
      "تشغيل منفصل عن الإنترنت لأشد البيئات حساسية — تصميم مشترك معمق، وليس منتجاً جاهزاً اليوم.",
    highlights: [
      "لا اتصال خارجي — تحديثات عبر وسائط آمنة",
      "نماذج محلية بدون اعتماد سحابي",
      "تكامل هوية داخلية",
    ],
    note: "On-Prem / Air-Gapped استراتيجي — تواصل لنطاق التصميم، لا ادعاء جاهزية.",
  },
];
