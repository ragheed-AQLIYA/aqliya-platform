/**
 * Buyer-facing operating system status labels (no internal L4/L5 jargon).
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
  auditOS: { label: "جاهز للبايلوت", tone: "success" },
  decisionOS: { label: "نشط", tone: "primary" },
  localContentOS: { label: "بايلوت منسّق", tone: "amber" },
  officeAI: { label: "نشط", tone: "primary" },
  salesOS: { label: "قيد التطوير — غير متاح للشراء", tone: "muted" },
  simulationOS: { label: "قيد التخطيط", tone: "muted" },
};

export const publicReadinessGate =
  "جاهز لبيئة بايلوت تقييمي — التوسع بعد Go/No-Go";
