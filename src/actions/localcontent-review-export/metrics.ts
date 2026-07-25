export interface ReviewMetrics {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  acceptanceRate: number;
  avgConf: number;
  totalExp: number;
  confirmedExp: number;
  fpositives: number;
  highRisk: number;
  healthyRecords: number;
  avgHealth: number;
}

export function computeReviewMetrics(
  suggestions: { status: string; confidence: number }[],
  explanations: { status: string; isFalsePositive: boolean; riskLevel: string }[],
  healthRecords: { healthScore: number; status: string }[],
): ReviewMetrics {
  const total = suggestions.length;
  const approved = suggestions.filter((s) => s.status === "approved").length;
  const rejected = suggestions.filter((s) => s.status === "rejected").length;
  const pending = suggestions.filter((s) => s.status === "pending").length;
  const acceptanceRate =
    approved + rejected > 0
      ? Math.round((approved / (approved + rejected)) * 100)
      : 0;
  const avgConf =
    total > 0
      ? Math.round(
          suggestions.reduce((sum, s) => sum + s.confidence, 0) / total,
        )
      : 0;

  const totalExp = explanations.length;
  const confirmedExp = explanations.filter((e) => e.status === "confirmed").length;
  const fpositives = explanations.filter((e) => e.isFalsePositive).length;
  const highRisk = explanations.filter((e) => e.riskLevel === "high").length;

  const healthyRecords = healthRecords.filter(
    (h) => h.status === "high_performing",
  ).length;
  const avgHealth =
    healthRecords.length > 0
      ? Math.round(
          healthRecords.reduce((sum, h) => sum + h.healthScore, 0) /
            healthRecords.length,
        )
      : 0;

  return {
    total,
    approved,
    rejected,
    pending,
    acceptanceRate,
    avgConf,
    totalExp,
    confirmedExp,
    fpositives,
    highRisk,
    healthyRecords,
    avgHealth,
  };
}
