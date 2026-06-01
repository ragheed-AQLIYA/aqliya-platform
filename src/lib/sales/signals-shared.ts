/** Client-safe signal types + labels (no prisma). */

export const VALID_SIGNAL_TYPES = [
  "intent",
  "engagement",
  "risk",
  "news",
  "other",
] as const;

export type SalesSignalType = (typeof VALID_SIGNAL_TYPES)[number];

export const VALID_SIGNAL_SEVERITIES = ["low", "medium", "high"] as const;

export type SalesSignalSeverity = (typeof VALID_SIGNAL_SEVERITIES)[number];

export interface SalesSignal {
  id: string;
  type: SalesSignalType;
  title: string;
  summary?: string | null;
  severity?: SalesSignalSeverity | null;
  source?: string | null;
  detectedAt: string;
  createdById?: string | null;
  createdAt: string;
}

export interface SalesSignalView extends SalesSignal {
  accountId: string;
}

export function signalTypeLabelAr(type: SalesSignalType): string {
  switch (type) {
    case "intent":
      return "نية شراء";
    case "engagement":
      return "تفاعل";
    case "risk":
      return "مخاطر";
    case "news":
      return "أخبار";
    default:
      return "أخرى";
  }
}

export function signalSeverityLabelAr(
  severity: SalesSignalSeverity | null | undefined,
): string {
  switch (severity) {
    case "high":
      return "مرتفع";
    case "medium":
      return "متوسط";
    case "low":
      return "منخفض";
    default:
      return "—";
  }
}
