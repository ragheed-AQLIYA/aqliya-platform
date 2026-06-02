/** Phase 2 stub — deal risk assessment in SalesDeal.metadata.riskAssessment (no LLM). */

export type DealRiskFlagId =
  | "activity_gap"
  | "no_response"
  | "missing_stakeholder"
  | "missing_stakeholder_hint";

export type DealRiskFlagSeverity = "low" | "medium" | "high";

export type DealRiskSeverity = "none" | DealRiskFlagSeverity;

export interface DealRiskFlag {
  id: DealRiskFlagId;
  severity: DealRiskFlagSeverity;
  message: string;
}

export interface DealRiskAssessment {
  riskFlags: DealRiskFlag[];
  severity: DealRiskSeverity;
  computedAt: string;
  source: "rules-agent";
  advisoryOnly: true;
  agentGenerated: true;
}

const SEVERITY_RANK: Record<DealRiskSeverity, number> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
};

export function aggregateDealRiskSeverity(
  flags: DealRiskFlag[],
): DealRiskSeverity {
  let max: DealRiskSeverity = "none";
  for (const flag of flags) {
    if (SEVERITY_RANK[flag.severity] > SEVERITY_RANK[max]) {
      max = flag.severity;
    }
  }
  return max;
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
      return "لا مخاطر مكتشفة";
  }
}

function parseAssessment(raw: unknown): DealRiskAssessment | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  if (typeof row.computedAt !== "string" || !row.computedAt.trim()) return null;
  if (row.source !== "rules-agent") return null;
  if (row.advisoryOnly !== true) return null;

  const severity =
    row.severity === "none" ||
    row.severity === "low" ||
    row.severity === "medium" ||
    row.severity === "high"
      ? row.severity
      : null;
  if (!severity) return null;

  const riskFlags: DealRiskFlag[] = [];
  if (Array.isArray(row.riskFlags)) {
    for (const item of row.riskFlags) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      const flag = item as Record<string, unknown>;
      if (
        flag.id !== "activity_gap" &&
        flag.id !== "no_response" &&
        flag.id !== "missing_stakeholder" &&
        flag.id !== "missing_stakeholder_hint"
      ) {
        continue;
      }
      if (
        flag.severity !== "low" &&
        flag.severity !== "medium" &&
        flag.severity !== "high"
      ) {
        continue;
      }
      if (typeof flag.message !== "string" || !flag.message.trim()) continue;
      riskFlags.push({
        id: flag.id,
        severity: flag.severity,
        message: flag.message.trim(),
      });
    }
  }

  return {
    riskFlags,
    severity,
    computedAt: row.computedAt,
    source: "rules-agent",
    advisoryOnly: true,
    agentGenerated: true,
  };
}

export function readDealRiskAssessment(metadata: unknown): {
  configured: boolean;
  assessment: DealRiskAssessment | null;
} {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return { configured: false, assessment: null };
  }
  const assessment = parseAssessment(
    (metadata as Record<string, unknown>).riskAssessment,
  );
  return {
    configured: assessment != null,
    assessment,
  };
}
