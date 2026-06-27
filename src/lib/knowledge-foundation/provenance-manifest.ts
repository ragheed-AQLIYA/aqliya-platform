import "server-only";

import { prisma } from "@/lib/prisma";

export type ProvenanceEvidenceSummary = {
  evidenceCount: number;
  contributingOrganizationCount: number;
  evidenceTypes: string[];
};

export type ProvenanceCandidateEntry = {
  candidateId: string;
  pattern: string;
  canonicalCode: string;
  category: string;
  supportCount: number;
  organizationCount: number;
  confidence: number;
  promotionDate: string | null;
  boundAt: string;
  boundById: string;
  evidenceSummary: ProvenanceEvidenceSummary;
};

export type VersionProvenanceManifest = {
  versionId: string;
  versionNumber: string;
  generatedAt: string;
  candidateCount: number;
  candidates: ProvenanceCandidateEntry[];
};

/**
 * Canonical provenance manifest for a foundation version.
 * No raw TB account codes, client names, or organization secrets.
 */
export async function buildVersionProvenanceManifest(
  versionId: string,
): Promise<VersionProvenanceManifest> {
  const version = await prisma.knowledgeFoundationVersion.findUniqueOrThrow({
    where: { id: versionId },
    select: { id: true, versionNumber: true },
  });

  const bindings = await prisma.knowledgeFoundationVersionCandidate.findMany({
    where: { versionId },
    include: {
      candidate: {
        include: {
          promotionHistory: { orderBy: { promotedAt: "desc" }, take: 1 },
          evidence: { select: { evidenceType: true, organizationId: true } },
        },
      },
    },
    orderBy: { boundAt: "asc" },
  });

  const candidates: ProvenanceCandidateEntry[] = bindings.map((b) => {
    const evidenceTypes = [
      ...new Set(b.candidate.evidence.map((e) => e.evidenceType)),
    ];
    const orgIds = new Set(
      b.candidate.evidence.map((e) => e.organizationId).filter(Boolean),
    );

    return {
      candidateId: b.candidateId,
      pattern: b.candidate.candidatePhrase,
      canonicalCode: b.candidate.canonicalCode,
      category: b.candidate.category,
      supportCount: b.candidate.supportCount,
      organizationCount: b.candidate.organizationCount,
      confidence: b.candidate.confidence,
      promotionDate:
        b.candidate.promotionHistory[0]?.promotedAt.toISOString() ?? null,
      boundAt: b.boundAt.toISOString(),
      boundById: b.boundById,
      evidenceSummary: {
        evidenceCount: b.candidate.evidence.length,
        contributingOrganizationCount: orgIds.size,
        evidenceTypes,
      },
    };
  });

  return {
    versionId: version.id,
    versionNumber: version.versionNumber,
    generatedAt: new Date().toISOString(),
    candidateCount: candidates.length,
    candidates,
  };
}
