/**
 * Vision-layer capability labels for operating systems (no engineering maturity).
 * @see docs/marketing/MARKETING_TERMINOLOGY.md
 */

export type PublicOsKey =
  | "auditOS"
  | "decisionOS"
  | "localContentOS"
  | "officeAI"
  | "salesOS"
  | "simulationOS";

export const publicOsStatus: Record<
  PublicOsKey,
  { label: string; tone: "success" | "primary" | "amber" | "muted" }
> = {
  auditOS: { label: "جاهز للتفعيل المؤسسي", tone: "success" },
  decisionOS: { label: "متكامل في المنصة", tone: "primary" },
  localContentOS: { label: "نطاق تفعيل مؤسسي", tone: "amber" },
  officeAI: { label: "قدرة مشتركة", tone: "primary" },
  salesOS: { label: "في خارطة المنصة", tone: "muted" },
  simulationOS: { label: "في خارطة المنصة", tone: "muted" },
};

export const publicCapabilityNote: Record<PublicOsKey, string> = {
  auditOS: "مسار مراجعة كامل من المصدر إلى الاعتماد",
  decisionOS: "مذكرات قرار محكومة مع مراجعة بشرية",
  localContentOS: "موردون، إنفاق، امتثال، وتقارير تنظيمية",
  officeAI: "مساعد مؤسسي عبر جميع أنظمة التشغيل",
  salesOS: "ذاكرة تجارية وذكاء مبيعات مؤسسي",
  simulationOS: "محاكاة سيناريوهات قبل القرار",
};

export const publicEngagementGate =
  "نبدأ بتشخيص، ثم تقييم تشغيلي، ثم قرار بالأدلة";

export const publicOsStatusEn: Record<
  PublicOsKey,
  { label: string; capabilityNote: string }
> = {
  auditOS: {
    label: "Ready for institutional activation",
    capabilityNote: "Full audit path from source to approval",
  },
  decisionOS: {
    label: "Integrated into platform",
    capabilityNote: "Governed decision memos with human review",
  },
  localContentOS: {
    label: "Institution activation scope",
    capabilityNote: "Suppliers, spend, compliance, regulatory reports",
  },
  officeAI: {
    label: "Shared capability",
    capabilityNote: "Governed assistant across all operating systems",
  },
  salesOS: {
    label: "On platform roadmap",
    capabilityNote: "Commercial intelligence and institutional memory",
  },
  simulationOS: {
    label: "On platform roadmap",
    capabilityNote: "Scenario simulation before decisions",
  },
};

export const publicEngagementGateEn =
  "Diagnostic session → operational evaluation → evidence-based decision";
