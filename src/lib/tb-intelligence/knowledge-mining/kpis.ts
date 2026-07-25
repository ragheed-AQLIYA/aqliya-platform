/**
 * Phase 8 — Knowledge Mining KPIs for monitoring.
 */

import "server-only";

import { prisma } from "@/lib/prisma";
import type { KnowledgeMiningKPIs, KnowledgeCandidateStatus } from "./types";


type PatternRow = {
  candidatePhrase: string;
  canonicalCode: string;
  supportCount: number;
  confidence: number;
};

type CoverageRow = {
  canonicalCode: string;
  _count: {
    canonicalCode: number;
  };
};

/**
 * Get operational KPIs for the knowledge mining pipeline.
 */
export async function getKnowledgeMiningKPIs(): Promise<KnowledgeMiningKPIs> {
  const [totalCandidates, byStatusGrouped, evidenceCount, patternsResult] =
    await Promise.all([
      prisma.knowledgeCandidate.count(),
      prisma.knowledgeCandidate.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.knowledgeCandidateEvidence.count(),
      prisma.knowledgeCandidate.findMany({
        where: { status: { not: "REJECTED" } },
        orderBy: { supportCount: "desc" },
        take: 10,
        select: {
          candidatePhrase: true,
          canonicalCode: true,
          supportCount: true,
          confidence: true,
        },
      }),
    ]);

  const byStatusResult = byStatusGrouped.map((row) => ({
    status: row.status,
    count: row._count._all,
  }));

  const byStatus = {} as Record<KnowledgeCandidateStatus, number>;
  for (const item of byStatusResult) {
    byStatus[item.status as KnowledgeCandidateStatus] = item.count;
  }

  const approved = byStatus["APPROVED"] ?? 0;
  const promoted = byStatus["PROMOTED"] ?? 0;
  const rejected = byStatus["REJECTED"] ?? 0;
  const reviewed = approved + rejected;
  const approvalRate = reviewed > 0 ? approved / reviewed : null;
  const promotionRate = approved > 0 ? promoted / approved : null;

  const coverageResult = (await prisma.knowledgeCandidate.groupBy({
    by: ["canonicalCode"],
    _count: { canonicalCode: true },
  })) as unknown as CoverageRow[];

  const totalCanonicalAccounts = await prisma.auditCanonicalAccount.count();
  const knowledgeCoverage =
    totalCanonicalAccounts > 0
      ? coverageResult.length / totalCanonicalAccounts
      : null;

  const patterns = patternsResult as unknown as PatternRow[];

  return {
    measuredAt: new Date().toISOString(),
    totalCandidates,
    byStatus,
    approvalRate,
    promotionRate,
    totalEvidenceRecords: evidenceCount,
    topEmergingPatterns: patterns.map((p: PatternRow) => ({
      phrase: p.candidatePhrase,
      canonicalCode: p.canonicalCode,
      supportCount: p.supportCount,
      confidence: p.confidence,
    })),
    knowledgeCoverage,
  };
}