import { prisma } from "@/lib/prisma";

export type FirmMemoryKpis = {
  measuredAt: string;
  feedbackTotal: number;
  feedbackAccepted: number;
  feedbackRejected: number;
  patternCount: number;
  trustedPatternCount: number;
  confirmedPatternCount: number;
  averagePatternConfidence: number | null;
  reuseRate: number | null;
  reuseSampleSize: number;
  firmMemoryHits: number;
};

/**
 * Operational KPIs for TB firm memory feedback loop (platform-wide aggregate).
 */
export async function getFirmMemoryKpis(): Promise<FirmMemoryKpis> {
  const [
    feedbackTotal,
    feedbackAccepted,
    patternCount,
    trustedPatternCount,
    confirmedPatternCount,
    patternConfidenceAgg,
    historyRows,
  ] = await Promise.all([
    prisma.tBMappingFeedback.count(),
    prisma.tBMappingFeedback.count({ where: { wasAccepted: true } }),
    prisma.tBMappingPattern.count({
      where: { status: { not: "DEPRECATED" } },
    }),
    prisma.tBMappingPattern.count({ where: { status: "TRUSTED" } }),
    prisma.tBMappingPattern.count({ where: { status: "CONFIRMED" } }),
    prisma.tBMappingPattern.aggregate({
      where: { status: { not: "DEPRECATED" } },
      _avg: { lastConfidence: true },
    }),
    prisma.tBClassificationHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: 5000,
      select: {
        organizationId: true,
        engagementId: true,
        accountCode: true,
        source: true,
      },
    }),
  ]);

  const latestByKey = new Map<string, { source: string }>();
  for (const row of historyRows) {
    const key = `${row.organizationId}:${row.engagementId ?? ""}:${row.accountCode}`;
    if (!latestByKey.has(key)) {
      latestByKey.set(key, { source: row.source });
    }
  }

  let firmMemoryHits = 0;
  for (const entry of latestByKey.values()) {
    if (entry.source === "firm_memory") firmMemoryHits++;
  }

  const reuseSampleSize = latestByKey.size;
  const reuseRate =
    reuseSampleSize > 0 ? firmMemoryHits / reuseSampleSize : null;

  return {
    measuredAt: new Date().toISOString(),
    feedbackTotal,
    feedbackAccepted,
    feedbackRejected: feedbackTotal - feedbackAccepted,
    patternCount,
    trustedPatternCount,
    confirmedPatternCount,
    averagePatternConfidence: patternConfidenceAgg._avg.lastConfidence,
    reuseRate,
    reuseSampleSize,
    firmMemoryHits,
  };
}
