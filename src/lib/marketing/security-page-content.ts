/**
 * Condensed security page content (R5)
 * @see docs/marketing/MARKETING_REDESIGN_PLAN.md §5.3
 */

export type SecurityPillar = {
  id: string;
  title: string;
  body: string;
};

export type SecurityControlRow = {
  area: string;
  control: string;
};

export const securityPillarsAr: SecurityPillar[] = [
  {
    id: "rbac",
    title: "التحكم بالوصول (RBAC)",
    body: "صلاحيات حسب الدور والمؤسسة — لا وصول جانبي بين الأقسام أو المستأجرين.",
  },
  {
    id: "audit",
    title: "سجل تدقيقي ثابت",
    body: "كل طلب وقرار وتصدير مُسجَّل بهوية المستخدم — غير قابل للحذف أو التعديل.",
  },
  {
    id: "evidence",
    title: "تتبع الأدلة",
    body: "كل مخرج مرتبط بمصدره. لا توصية أو رقم بدون دليل قابل للمراجعة.",
  },
  {
    id: "isolation",
    title: "عزل المستأجرين",
    body: "فصل البيانات والصلاحيات وسجلات التدقيق على مستوى المؤسسة.",
  },
  {
    id: "human",
    title: "موافقة بشرية",
    body: "الذكاء يساعد — الإنسان يقرر. التصدير والإجراءات الحرجة تتطلب اعتماداً صريحاً.",
  },
  {
    id: "data",
    title: "ملكية البيانات",
    body: "TLS في النقل، تشفير في الراحة، حق حذف موثّق. بيانات العملاء لا تُستخدم لتدريب نماذج خارجية.",
  },
];

export const securityControlsAr: SecurityControlRow[] = [
  { area: "المصادقة", control: "NextAuth v5 · جلسات محمية · SSO (SAML/OIDC) متاح" },
  { area: "العزل", control: "organizationId على كل مسار محكوم · RBAC في middleware" },
  { area: "التدقيق", control: "AuditEvent لكل تغيير حالة · تصدير للامتثال" },
  { area: "الملفات", control: "فحص uploads · صلاحيات تنزيل · checksum عند التوفر" },
  { area: "SOC2 / ISO", control: "خارطة طريق — لا ادعاء شهادة قبل اكتمالها" },
  { area: "الإقامة", control: "سحابة سعودية/خليجية افتراضياً — راجع /deployment" },
];

export const aiGovernanceRulesAr = [
  "لا قرار نهائي بدون إنسان",
  "لا تصدير بدون إذن",
  "لا توصية بدون دليل",
  "لا وصول بدون هوية",
];

export const securityPdfLinksAr = [
  { label: "ملخص الأمن (PDF)", href: "/print/security-summary" },
  { label: "إقامة البيانات (PDF)", href: "/print/data-residency" },
  { label: "ملخص DPA (PDF)", href: "/print/dpa-summary" },
  { label: "المعالِجون الفرعيون (PDF)", href: "/print/subprocessors" },
];
