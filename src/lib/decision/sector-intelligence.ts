/**
 * D3-03 — Sector intelligence snapshot for a governed decision (deterministic).
 */

export type SectorBenchmarkSummary = {
  metricName: string;
  value: number;
  unit: string;
  benchmarkType: string;
};

export type SectorPatternSummary = {
  patternType: string;
  patternKey: string;
  description: string | null;
  confidenceScore: number | null;
  occurrenceCount: number;
};

export type DecisionSectorIntelligenceSnapshot = {
  assigned: boolean;
  sector: { id: string; name: string; code: string } | null;
  benchmarks: SectorBenchmarkSummary[];
  patterns: SectorPatternSummary[];
  guidance: string[];
};

type BuildInput = {
  sectorId: string | null;
  sector: {
    id: string;
    name: string;
    code: string;
    description: string | null;
    benchmarks: Array<{
      metricName: string;
      value: number;
      unit: string;
      benchmarkType: string;
    }>;
    patterns: Array<{
      patternType: string;
      patternKey: string;
      confidenceScore: number | null;
      occurrenceCount: number;
    }>;
  } | null;
};

export function buildDecisionSectorIntelligence(
  input: BuildInput,
): DecisionSectorIntelligenceSnapshot {
  if (!input.sectorId || !input.sector) {
    return {
      assigned: false,
      sector: null,
      benchmarks: [],
      patterns: [],
      guidance: [
        "عيّن قطاعاً للقرار من تبويب القطاع لعرض المعايير والأنماط المؤسسية.",
      ],
    };
  }

  const benchmarks = input.sector.benchmarks.map((b) => ({
    metricName: b.metricName,
    value: b.value,
    unit: b.unit,
    benchmarkType: b.benchmarkType,
  }));

  const patterns = input.sector.patterns.map((p) => ({
    patternType: p.patternType,
    patternKey: p.patternKey,
    description: null as string | null,
    confidenceScore: p.confidenceScore,
    occurrenceCount: p.occurrenceCount,
  }));

  const guidance: string[] = [
    `القطاع: ${input.sector.name} (${input.sector.code})`,
  ];

  if (input.sector.description?.trim()) {
    guidance.push(input.sector.description.trim().slice(0, 280));
  }
  if (benchmarks.length > 0) {
    guidance.push(
      `${benchmarks.length} معيار مقارنة متاح — راجعها عند تقييم البدائل والمخاطر.`,
    );
  } else {
    guidance.push("لا توجد معايير مقارنة مسجّلة لهذا القطاع بعد.");
  }
  if (patterns.length > 0) {
    const top = patterns[0];
    guidance.push(
      `أحدث نمط مرصود: ${top.patternType} / ${top.patternKey} (تكرار ${top.occurrenceCount}).`,
    );
  }

  return {
    assigned: true,
    sector: {
      id: input.sector.id,
      name: input.sector.name,
      code: input.sector.code,
    },
    benchmarks,
    patterns,
    guidance,
  };
}
