import "server-only";

import { prisma } from "@/lib/prisma";
import { buildRollforwardReport, type RollforwardReport } from "./rollforward";

export type EngagementRollforwardResult =
  | { available: false; reasonAr: string }
  | { available: true; report: RollforwardReport };

export async function getEngagementRollforward(
  engagementId: string,
): Promise<EngagementRollforwardResult> {
  const balances = await prisma.auditTrialBalance.findMany({
    where: { engagementId },
    include: { lines: true },
    orderBy: { createdAt: "desc" },
    take: 2,
  });

  if (balances.length < 2) {
    return {
      available: false,
      reasonAr: "يلزم رفع ميزان مراجعة ثانٍ (فترة سابقة) لإجراء الـ rollforward.",
    };
  }

  const [current, prior] = balances;
  const mapLines = (tb: typeof current) =>
    (tb.lines ?? []).map((l) => ({
      accountCode: l.accountCode,
      accountName: l.accountName,
      balance: l.balance,
    }));

  return {
    available: true,
    report: buildRollforwardReport({
      current: mapLines(current),
      prior: mapLines(prior),
      currentPeriodLabel: current.createdAt.toISOString().slice(0, 10),
      priorPeriodLabel: prior.createdAt.toISOString().slice(0, 10),
    }),
  };
}
