/** Public SOC2 roadmap milestones — targets, not certifications. */
export type Soc2Milestone = {
  quarter: string;
  title: string;
  titleEn: string;
  status: "done" | "in_progress" | "planned";
  items: string[];
};

export const soc2RoadmapMilestones: Soc2Milestone[] = [
  {
    quarter: "Q2 2026",
    title: "أساس الضوابط والشفافية",
    titleEn: "Control baseline & transparency",
    status: "in_progress",
    items: [
      "مصفوفة ضوابط أمنية v1 (RBAC، audit trail، evidence، tenant isolation)",
      "حزمة المشتريات: ملخص أمن، DPA، subprocessors، إقامة بيانات",
      "سجل تغييرات للمعالجين الفرعيين (عملية داخلية)",
    ],
  },
  {
    quarter: "Q3 2026",
    title: "جاهزية SOC2 Type I — تقييم داخلي",
    titleEn: "SOC2 Type I readiness — internal gap review",
    status: "planned",
    items: [
      "Gap assessment مقابل Trust Services Criteria (Security focus)",
      "توثيق سياسات: access, incident response, change management",
      "Pen-test أو security review خارجي — مشاركة تحت NDA عند الاكتمال",
    ],
  },
  {
    quarter: "Q4 2026",
    title: "SOC2 Type I — engagement مستهدف",
    titleEn: "SOC2 Type I — target audit engagement",
    status: "planned",
    items: [
      "اختيار مدقق مستقل (قيد التقييم)",
      "Type I observation window — **هدف** وليس شهادة حالية",
      "تحديث هذه الصفحة عند بدء أو إكمال التدقيق",
    ],
  },
  {
    quarter: "2027",
    title: "مسار Type II (بعد Type I)",
    titleEn: "Type II path (after Type I)",
    status: "planned",
    items: [
      "Type II يتطلب فترة مر observation — لا يُعلَن قبل Type I",
      "SSO enterprise tier وضوابط إضافية حسب طلب العملاء",
    ],
  },
];

export const soc2HonestDisclaimerAr =
  "لا نملك شهادة SOC2 أو ISO اليوم. هذه الصفحة خارطة طريق بمواعيد مستهدفة — وليست ادعاءً بالامتثال.";

export const soc2HonestDisclaimerEn =
  "We do not hold SOC2 or ISO certification today. This page is a target roadmap — not a compliance claim.";
