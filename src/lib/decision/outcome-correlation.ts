/**
 * D3-06 — decision → outcome correlation analytics (deterministic).
 */

import type { OutcomeDashboardDecision } from "./outcome-dashboard";

export type OutcomeCorrelationRow = {
  key: string;
  labelAr: string;
  decisionsWithOutcome: number;
  successRatePct: number | null;
  avgVariance: number | null;
};

export type OutcomeCorrelationDecision = OutcomeDashboardDecision & {
  type?: string | null;
};

export type OutcomeCorrelationSnapshot = {
  byPriority: OutcomeCorrelationRow[];
  byDecisionType: OutcomeCorrelationRow[];
  disclaimerAr: string;
};

function groupCorrelation(
  decisions: OutcomeDashboardDecision[],
  keyFn: (d: OutcomeDashboardDecision) => string,
  labelFn: (key: string) => string,
): OutcomeCorrelationRow[] {
  const groups = new Map<string, OutcomeDashboardDecision[]>();
  for (const d of decisions) {
    const key = keyFn(d);
    const list = groups.get(key) ?? [];
    list.push(d);
    groups.set(key, list);
  }

  return [...groups.entries()].map(([key, rows]) => {
    const withOutcome = rows.filter((r) => r.outcome);
    const successes = withOutcome.filter(
      (r) => r.outcome!.outcomeStatus === "SUCCESS",
    ).length;
    const variances = withOutcome
      .map((r) => r.outcome?.variance)
      .filter((v): v is number => v != null);

    return {
      key,
      labelAr: labelFn(key),
      decisionsWithOutcome: withOutcome.length,
      successRatePct:
        withOutcome.length > 0
          ? Math.round((successes / withOutcome.length) * 1000) / 10
          : null,
      avgVariance:
        variances.length > 0
          ? Math.round(
              (variances.reduce((s, v) => s + v, 0) / variances.length) * 100,
            ) / 100
          : null,
    };
  });
}

export function buildOutcomeCorrelation(
  decisions: OutcomeCorrelationDecision[],
): OutcomeCorrelationSnapshot {
  return {
    byPriority: groupCorrelation(
      decisions,
      (d) => d.priority ?? "none",
      (k) => (k === "none" ? "بدون أولوية" : k),
    ),
    byDecisionType: groupCorrelation(
      decisions,
      (d) => d.type ?? "general",
      (k) => k,
    ),
    disclaimerAr:
      "ارتباط نتائج القرارات إحصائي مساعد — لا يثبت سبباً ونتيجة نهائية.",
  };
}
