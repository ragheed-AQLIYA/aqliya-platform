export interface ExplanationRow {
  status: string;
  confidence: number;
  riskLevel: string;
}

export interface FalsePositiveRow {
  id: string;
  status: string;
}

export interface ExplanationMetrics {
  totalExplanations: number;
  confirmedExplanations: number;
  rejectedExplanations: number;
  falsePositives: number;
  falsePositiveRate: number | null;
  avgExplanationConfidence: number | null;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

export function computeExplanationMetrics(
  explanations: ExplanationRow[],
  fpExplanations: FalsePositiveRow[],
): ExplanationMetrics {
  const totalExplanations = explanations.length;
  const confirmedExplanations = explanations.filter(
    (e) => e.status === "confirmed",
  ).length;
  const rejectedExplanations = explanations.filter(
    (e) => e.status === "rejected",
  ).length;
  const falsePositives = fpExplanations.length;
  const falsePositiveRate =
    totalExplanations + falsePositives > 0
      ? Math.round(
          (falsePositives / (totalExplanations + falsePositives)) * 100,
        )
      : null;
  const avgExplanationConfidence =
    totalExplanations > 0
      ? Math.round(
          explanations.reduce((sum, e) => sum + e.confidence, 0) /
            totalExplanations,
        )
      : null;
  const highRiskCount = explanations.filter((e) => e.riskLevel === "high").length;
  const mediumRiskCount = explanations.filter(
    (e) => e.riskLevel === "medium",
  ).length;
  const lowRiskCount = explanations.filter((e) => e.riskLevel === "low").length;

  return {
    totalExplanations,
    confirmedExplanations,
    rejectedExplanations,
    falsePositives,
    falsePositiveRate,
    avgExplanationConfidence,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
  };
}
