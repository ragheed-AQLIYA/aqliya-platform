// D3-02 — deterministic post-decision monitoring signal generation (system-only)

import type { RiskLevel, SignalSeverity } from "@prisma/client";

export type MonitoringSignalDraft = {
  decisionId: string;
  organizationId: string;
  source: "risk";
  referenceId: string;
  signalType: string;
  description: string;
  severity: SignalSeverity;
};

const ELIGIBLE_DECISION_STATUSES = new Set(["APPROVED"]);

function riskLevelToSeverity(level: RiskLevel): SignalSeverity {
  switch (level) {
    case "HIGH":
      return "HIGH";
    case "MEDIUM":
      return "MEDIUM";
    case "LOW":
      return "LOW";
    default:
      return "INFO";
  }
}

export function buildMonitoringSignalsFromRisks(input: {
  decisionId: string;
  organizationId: string;
  decisionStatus: string;
  risks: Array<{ id: string; description: string; level: RiskLevel }>;
  existingReferenceIds: Set<string>;
}): MonitoringSignalDraft[] {
  if (!ELIGIBLE_DECISION_STATUSES.has(input.decisionStatus)) {
    return [];
  }

  const drafts: MonitoringSignalDraft[] = [];

  for (const risk of input.risks) {
    if (input.existingReferenceIds.has(risk.id)) continue;
    if (risk.level !== "HIGH" && risk.level !== "MEDIUM") continue;

    drafts.push({
      decisionId: input.decisionId,
      organizationId: input.organizationId,
      source: "risk",
      referenceId: risk.id,
      signalType:
        risk.level === "HIGH" ? "risk-elevated" : "risk-monitor",
      description: `مراقبة تلقائية: ${risk.description.slice(0, 500)}`,
      severity: riskLevelToSeverity(risk.level),
    });
  }

  return drafts;
}
