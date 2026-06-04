import { prisma } from "@/lib/prisma";
import { buildDecisionSectorIntelligence } from "./sector-intelligence";

/** D3-03 — tenant-scoped sector intelligence for decision workspace */
export async function getDecisionSectorIntelligence(
  decisionId: string,
  organizationId: string,
) {
  const row = await prisma.decision.findFirst({
    where: { id: decisionId, organizationId },
    select: {
      sectorId: true,
      sector: {
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
          benchmarks: {
            orderBy: { metricName: "asc" },
            take: 8,
            select: {
              metricName: true,
              value: true,
              unit: true,
              benchmarkType: true,
            },
          },
          patterns: {
            orderBy: { lastObservedAt: "desc" },
            take: 6,
            select: {
              patternType: true,
              patternKey: true,
              confidenceScore: true,
              occurrenceCount: true,
            },
          },
        },
      },
    },
  });

  if (!row) {
    return buildDecisionSectorIntelligence({ sectorId: null, sector: null });
  }

  return buildDecisionSectorIntelligence({
    sectorId: row.sectorId,
    sector: row.sector,
  });
}
