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
  auditOS: { label: "متاح للتطبيق", tone: "success" },
  decisionOS: { label: "متكامل في المنصة", tone: "primary" },
  localContentOS: { label: "متاح باتفاق النطاق", tone: "amber" },
  officeAI: { label: "خدمة مشتركة", tone: "primary" },
  salesOS: { label: "قريباً على خارطة المنصة", tone: "muted" },
  simulationOS: { label: "قريباً على خارطة المنصة", tone: "muted" },
};

export const publicCapabilityNote: Record<PublicOsKey, string> = {
  auditOS: "من رفع ميزان المراجعة إلى ملف جاهز للاعتماد",
  decisionOS: "قرارات موثقة: السياق، البدائل، والموافقات",
  localContentOS: "موردون، إنفاق، محتوى محلي، وتقارير للجهات الرقابية",
  officeAI: "مساعد مؤسسي عبر حلول المنصة",
  salesOS: "ذاكرة تجارية ومتابعة فرص",
  simulationOS: "محاكاة سيناريوهات قبل القرار",
};

export const publicEngagementGate =
  "مكالمة أولاً، ثم تجربة على بياناتكم، ثم قراركم";

export const publicOsStatusEn: Record<
  PublicOsKey,
  { label: string; capabilityNote: string }
> = {
  auditOS: {
    label: "Available to deploy",
    capabilityNote: "From trial balance upload to a file ready for sign-off",
  },
  decisionOS: {
    label: "Integrated into platform",
    capabilityNote: "Documented decisions: context, options, and approvals",
  },
  localContentOS: {
    label: "Available by agreed scope",
    capabilityNote: "Suppliers, spend, local content, and regulatory reports",
  },
  officeAI: {
    label: "Shared service",
    capabilityNote: "Institutional assistant across platform solutions",
  },
  salesOS: {
    label: "Coming on platform roadmap",
    capabilityNote: "Commercial memory and opportunity tracking",
  },
  simulationOS: {
    label: "Coming on platform roadmap",
    capabilityNote: "Scenario simulation before decisions",
  },
};

export const publicEngagementGateEn =
  "Intro call first, then a trial on your data, then your decision";
