import "server-only";

import { prisma } from "@/lib/prisma";

export type VersionBoundCandidateRow = {
  bindingId: string;
  candidateId: string;
  candidatePhrase: string;
  canonicalCode: string;
  category: string;
  confidence: number;
  supportCount: number;
  organizationCount: number;
  includedInRelease: boolean;
  releasedAt: Date | null;
};

/**
 * Load candidates explicitly bound to a foundation version.
 * Source of truth for release artifacts and version-scoped diffs.
 */
export async function loadVersionBoundCandidates(
  versionId: string,
): Promise<VersionBoundCandidateRow[]> {
  const bindings = await prisma.knowledgeFoundationVersionCandidate.findMany({
    where: { versionId },
    include: {
      candidate: {
        select: {
          id: true,
          candidatePhrase: true,
          canonicalCode: true,
          category: true,
          confidence: true,
          supportCount: true,
          organizationCount: true,
        },
      },
    },
    orderBy: { boundAt: "asc" },
  });

  return bindings.map((b) => ({
    bindingId: b.id,
    candidateId: b.candidateId,
    candidatePhrase: b.candidate.candidatePhrase,
    canonicalCode: b.candidate.canonicalCode,
    category: b.candidate.category,
    confidence: b.candidate.confidence,
    supportCount: b.candidate.supportCount,
    organizationCount: b.candidate.organizationCount,
    includedInRelease: b.includedInRelease,
    releasedAt: b.releasedAt,
  }));
}
