export interface HealthRow {
  status: string;
  healthScore: number;
}

export interface HealthMetrics {
  totalHealthRecords: number;
  highPerformingRecords: number;
  activeRecords: number;
  decayingRecords: number;
  obsoleteRecords: number;
  avgHealthScore: number | null;
}

export function computeHealthMetrics(
  healthRecords: HealthRow[],
): HealthMetrics {
  const totalHealthRecords = healthRecords.length;
  const highPerformingRecords = healthRecords.filter(
    (h) => h.status === "high_performing",
  ).length;
  const activeRecords = healthRecords.filter((h) => h.status === "active").length;
  const decayingRecords = healthRecords.filter(
    (h) => h.status === "decaying",
  ).length;
  const obsoleteRecords = healthRecords.filter(
    (h) => h.status === "obsolete",
  ).length;
  const avgHealthScore =
    totalHealthRecords > 0
      ? Math.round(
          healthRecords.reduce((sum, h) => sum + h.healthScore, 0) /
            totalHealthRecords,
        )
      : null;

  return {
    totalHealthRecords,
    highPerformingRecords,
    activeRecords,
    decayingRecords,
    obsoleteRecords,
    avgHealthScore,
  };
}
