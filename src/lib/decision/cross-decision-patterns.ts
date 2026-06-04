/**
 * D3-04 — cross-decision pattern analysis (deterministic aggregates).
 */

export type CrossDecisionInput = {
  id: string;
  type: string;
  status: string;
  risks: Array<{ level: string; description: string }>;
  outcomeStatus?: string | null;
};

export type CrossDecisionPatternRow = {
  patternKey: string;
  labelAr: string;
  count: number;
  affectedDecisionIds: string[];
};

export type CrossDecisionPatternSnapshot = {
  riskLevelCounts: Record<string, number>;
  recurringRiskThemes: CrossDecisionPatternRow[];
  outcomeByType: Record<string, number>;
  disclaimerAr: string;
};

function themeKey(description: string): string {
  const normalized = description.trim().toLowerCase().slice(0, 48);
  return normalized || "unknown";
}

export function buildCrossDecisionPatterns(
  decisions: CrossDecisionInput[],
): CrossDecisionPatternSnapshot {
  const riskLevelCounts: Record<string, number> = {};
  const themeMap = new Map<string, { labelAr: string; ids: Set<string> }>();
  const outcomeByType: Record<string, number> = {};

  for (const d of decisions) {
    if (d.outcomeStatus) {
      const key = `${d.type}:${d.outcomeStatus}`;
      outcomeByType[key] = (outcomeByType[key] ?? 0) + 1;
    }

    for (const risk of d.risks) {
      riskLevelCounts[risk.level] = (riskLevelCounts[risk.level] ?? 0) + 1;
      const key = themeKey(risk.description);
      const entry = themeMap.get(key) ?? {
        labelAr: risk.description.slice(0, 80),
        ids: new Set<string>(),
      };
      entry.ids.add(d.id);
      themeMap.set(key, entry);
    }
  }

  const recurringRiskThemes: CrossDecisionPatternRow[] = [...themeMap.entries()]
    .filter(([, v]) => v.ids.size >= 2)
    .map(([patternKey, v]) => ({
      patternKey,
      labelAr: v.labelAr,
      count: v.ids.size,
      affectedDecisionIds: [...v.ids],
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    riskLevelCounts,
    recurringRiskThemes,
    outcomeByType,
    disclaimerAr:
      "أنماط عبر القرارات — تحليل إحصائي مساعد، لا يغني عن مراجعة كل قرار.",
  };
}
