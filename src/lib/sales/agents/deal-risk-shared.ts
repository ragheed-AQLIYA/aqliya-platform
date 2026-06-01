/** Client-safe deal risk types + metadata readers (no prisma). */

export const DEAL_RISK_SEVERITIES = ["none", "low", "medium", "high"] as const;
export type DealRiskSeverity = (typeof DEAL_RISK_SEVERITIES)[number];

export const DEAL_RISK_FLAG_IDS = [
  "activity_gap",
  "no_response",
  "missing_stakeholder_hint",
] as const;
export type DealRiskFlagId = (typeof DEAL_RISK_FLAG_IDS)[number];

export interface DealRiskFlag {
  id: DealRiskFlagId;
  label: string;
  severity: DealRiskSeverity;
  detail: string;
}

export interface DealRiskAssessment {
  riskFlags: DealRiskFlag[];
  severity: DealRiskSeverity;
  computedAt: string;
  agentGenerated: true;
  advisory: true;
  notes?: string;
}

function parseMetadata(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function parseDealRiskFlag(raw: unknown): DealRiskFlag | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  if (
    row.id !== "activity_gap" &&
    row.id !== "no_response" &&
    row.id !== "missing_stakeholder_hint"
  ) {
    return null;
  }
  if (typeof row.label !== "string" || !row.label.trim()) return null;
  if (typeof row.detail !== "string" || !row.detail.trim()) return null;
  if (
    row.severity !== "none" &&
    row.severity !== "low" &&
    row.severity !== "medium" &&
    row.severity !== "high"
  ) {
    return null;
  }

  return {
    id: row.id,
    label: row.label.trim(),
    severity: row.severity,
    detail: row.detail.trim(),
  };
}

export function parseDealRiskAssessment(raw: unknown): DealRiskAssessment | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  if (typeof row.computedAt !== "string" || !row.computedAt.trim()) return null;
  if (
    row.severity !== "none" &&
    row.severity !== "low" &&
    row.severity !== "medium" &&
    row.severity !== "high"
  ) {
    return null;
  }
  if (row.agentGenerated !== true || row.advisory !== true) return null;

  const riskFlags: DealRiskFlag[] = [];
  if (Array.isArray(row.riskFlags)) {
    for (const item of row.riskFlags) {
      const flag = parseDealRiskFlag(item);
      if (flag) riskFlags.push(flag);
    }
  }

  return {
    riskFlags,
    severity: row.severity,
    computedAt: row.computedAt.trim(),
    agentGenerated: true,
    advisory: true,
    notes: typeof row.notes === "string" ? row.notes : undefined,
  };
}

export function readDealRiskAssessment(metadata: unknown): DealRiskAssessment | null {
  return parseDealRiskAssessment(parseMetadata(metadata).riskAssessment);
}

export function dealRiskSeverityLabelAr(severity: DealRiskSeverity): string {
  switch (severity) {
    case "high":
      return "مرتفع";
    case "medium":
      return "متوسط";
    case "low":
      return "منخفض";
    default:
      return "لا مخاطر قواعدية";
  }
}
