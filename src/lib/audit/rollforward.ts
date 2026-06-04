/**
 * A1-04 — multi-period trial balance rollforward (deterministic).
 */

export type RollforwardBalanceLine = {
  accountCode: string;
  accountName: string;
  balance: number;
};

export type RollforwardVarianceRow = {
  accountCode: string;
  accountName: string;
  currentBalance: number;
  priorBalance: number;
  variance: number;
  variancePct: number | null;
  material: boolean;
};

export type RollforwardReport = {
  currentPeriodLabel: string;
  priorPeriodLabel: string;
  rows: RollforwardVarianceRow[];
  materialCount: number;
  totalVarianceAbs: number;
  disclaimerAr: string;
};

export function buildRollforwardReport(input: {
  current: RollforwardBalanceLine[];
  prior: RollforwardBalanceLine[];
  currentPeriodLabel?: string;
  priorPeriodLabel?: string;
  materialThresholdPct?: number;
}): RollforwardReport {
  const threshold = input.materialThresholdPct ?? 10;
  const priorMap = new Map(
    input.prior.map((l) => [l.accountCode, l.balance]),
  );
  const codes = new Set([
    ...input.current.map((l) => l.accountCode),
    ...input.prior.map((l) => l.accountCode),
  ]);

  const rows: RollforwardVarianceRow[] = [];
  let materialCount = 0;
  let totalVarianceAbs = 0;

  for (const code of codes) {
    const currentLine = input.current.find((l) => l.accountCode === code);
    const priorLine = input.prior.find((l) => l.accountCode === code);
    const currentBalance = currentLine?.balance ?? 0;
    const priorBalance = priorMap.get(code) ?? priorLine?.balance ?? 0;
    const variance = currentBalance - priorBalance;
    const variancePct =
      priorBalance !== 0
        ? Math.round((variance / Math.abs(priorBalance)) * 1000) / 10
        : null;
    const material =
      Math.abs(variance) > 0 &&
      (variancePct == null
        ? Math.abs(variance) >= threshold
        : Math.abs(variancePct) >= threshold);

    if (material) materialCount += 1;
    totalVarianceAbs += Math.abs(variance);

    rows.push({
      accountCode: code,
      accountName: currentLine?.accountName ?? priorLine?.accountName ?? code,
      currentBalance,
      priorBalance,
      variance,
      variancePct,
      material,
    });
  }

  rows.sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));

  return {
    currentPeriodLabel: input.currentPeriodLabel ?? "الفترة الحالية",
    priorPeriodLabel: input.priorPeriodLabel ?? "الفترة السابقة",
    rows,
    materialCount,
    totalVarianceAbs: Math.round(totalVarianceAbs * 100) / 100,
    disclaimerAr:
      "مقارنة فترات حتمية — المراجع يحدد المادية والتفسير النهائي.",
  };
}
