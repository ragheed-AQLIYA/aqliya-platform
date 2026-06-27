import "server-only";

import { prisma } from "@/lib/prisma";
import { listEligiblePromotedCandidates } from "./candidate-bridge";

export type CandidatePoolOverview = {
  totalPromoted: number;
  eligibleUnbound: number;
  boundTotal: number;
  releasedTotal: number;
};

export type BoundCandidatePoolItem = {
  id: string;
  candidateId: string;
  versionId: string;
  versionNumber: string;
  versionStatus: string;
  candidatePhrase: string;
  canonicalCode: string;
  confidence: number;
  promotedAt: string | null;
  evidenceCount: number;
  includedInRelease: boolean;
};

/**
 * Platform-wide candidate pool visibility for operators.
 */
export async function getCandidatePoolOverview(): Promise<CandidatePoolOverview> {
  const [totalPromoted, eligible, boundTotal, releasedTotal] = await Promise.all([
    prisma.knowledgeCandidate.count({ where: { status: "PROMOTED" } }),
    listEligiblePromotedCandidates(),
    prisma.knowledgeFoundationVersionCandidate.count(),
    prisma.knowledgeFoundationVersionCandidate.count({
      where: { includedInRelease: true },
    }),
  ]);

  return {
    totalPromoted,
    eligibleUnbound: eligible.length,
    boundTotal,
    releasedTotal,
  };
}

export async function listBoundCandidatesPool(): Promise<BoundCandidatePoolItem[]> {
  const bindings = await prisma.knowledgeFoundationVersionCandidate.findMany({
    include: {
      version: { select: { versionNumber: true, status: true } },
      candidate: {
        include: {
          promotionHistory: { orderBy: { promotedAt: "desc" }, take: 1 },
          _count: { select: { evidence: true } },
        },
      },
    },
    orderBy: { boundAt: "desc" },
  });

  return bindings.map((b) => ({
    id: b.id,
    candidateId: b.candidateId,
    versionId: b.versionId,
    versionNumber: b.version.versionNumber,
    versionStatus: b.version.status,
    candidatePhrase: b.candidate.candidatePhrase,
    canonicalCode: b.candidate.canonicalCode,
    confidence: b.candidate.confidence,
    promotedAt:
      b.candidate.promotionHistory[0]?.promotedAt.toISOString() ?? null,
    evidenceCount: b.candidate._count.evidence,
    includedInRelease: b.includedInRelease,
  }));
}
