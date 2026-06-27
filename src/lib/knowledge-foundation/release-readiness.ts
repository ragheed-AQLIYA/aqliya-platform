import "server-only";

import { prisma } from "@/lib/prisma";
import { buildVersionProvenanceManifest } from "./provenance-manifest";

export type ReleaseReadinessMetrics = {
  versionStatus: string;
  boundCandidateCount: number;
  releasedCandidateCount: number;
  averageConfidence: number;
  averageEvidenceCount: number;
  duplicateCanonicalCodes: string[];
  candidatesWithoutEvidence: number;
  candidatesWithLowConfidence: number;
  provenanceCandidateCount: number;
};

export type ReleaseReadinessResult = {
  ready: boolean;
  score: number;
  warnings: string[];
  blockers: string[];
  metrics: ReleaseReadinessMetrics;
};

const LOW_CONFIDENCE_THRESHOLD = 0.5;

/**
 * Governance-only release readiness assessment. Does not mutate lifecycle.
 */
export async function evaluateReleaseReadiness(
  versionId: string,
): Promise<ReleaseReadinessResult> {
  const version = await prisma.knowledgeFoundationVersion.findUniqueOrThrow({
    where: { id: versionId },
    select: { id: true, status: true, versionNumber: true },
  });

  const bindings = await prisma.knowledgeFoundationVersionCandidate.findMany({
    where: { versionId },
    include: {
      candidate: {
        include: {
          _count: { select: { evidence: true } },
        },
      },
    },
    orderBy: { boundAt: "asc" },
  });

  const provenance = await buildVersionProvenanceManifest(versionId);

  const blockers: string[] = [];
  const warnings: string[] = [];

  if (version.status !== "APPROVED") {
    blockers.push(
      `Version status is ${version.status}; must be APPROVED before release.`,
    );
  }

  const boundCandidateCount = bindings.length;
  if (boundCandidateCount === 0) {
    blockers.push("No candidates are bound to this version.");
  }

  const canonicalCounts = new Map<string, number>();
  for (const b of bindings) {
    canonicalCounts.set(
      b.candidate.canonicalCode,
      (canonicalCounts.get(b.candidate.canonicalCode) ?? 0) + 1,
    );
  }
  const duplicateCanonicalCodes = [...canonicalCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([code]) => code);

  if (duplicateCanonicalCodes.length > 0) {
    blockers.push(
      `Duplicate canonical codes in bindings: ${duplicateCanonicalCodes.join(", ")}`,
    );
  }

  let candidatesWithoutEvidence = 0;
  let candidatesWithLowConfidence = 0;
  let confidenceSum = 0;
  let evidenceSum = 0;

  for (const b of bindings) {
    const evidenceCount = b.candidate._count.evidence;
    evidenceSum += evidenceCount;
    confidenceSum += b.candidate.confidence;

    if (evidenceCount === 0) {
      candidatesWithoutEvidence += 1;
    }
    if (b.candidate.confidence < LOW_CONFIDENCE_THRESHOLD) {
      candidatesWithLowConfidence += 1;
    }
  }

  const releasedCandidateCount = bindings.filter((b) => b.includedInRelease).length;

  if (candidatesWithoutEvidence > 0) {
    warnings.push(
      `${candidatesWithoutEvidence} bound candidate(s) have no linked evidence.`,
    );
  }

  if (candidatesWithLowConfidence > 0) {
    warnings.push(
      `${candidatesWithLowConfidence} bound candidate(s) have confidence below ${LOW_CONFIDENCE_THRESHOLD * 100}%.`,
    );
  }

  if (provenance.candidateCount !== boundCandidateCount) {
    warnings.push(
      `Provenance manifest candidate count (${provenance.candidateCount}) differs from binding count (${boundCandidateCount}).`,
    );
  }

  if (boundCandidateCount > 0 && provenance.candidates.length === 0) {
    blockers.push("Provenance manifest is empty while bindings exist.");
  }

  const averageConfidence =
    boundCandidateCount > 0 ? confidenceSum / boundCandidateCount : 0;
  const averageEvidenceCount =
    boundCandidateCount > 0 ? evidenceSum / boundCandidateCount : 0;

  let score = 100;
  score -= blockers.length * 25;
  score -= warnings.length * 10;
  if (boundCandidateCount === 0) score = 0;
  score = Math.max(0, Math.min(100, score));

  const ready = blockers.length === 0 && boundCandidateCount > 0;

  return {
    ready,
    score,
    warnings,
    blockers,
    metrics: {
      versionStatus: version.status,
      boundCandidateCount,
      releasedCandidateCount,
      averageConfidence,
      averageEvidenceCount,
      duplicateCanonicalCodes,
      candidatesWithoutEvidence,
      candidatesWithLowConfidence,
      provenanceCandidateCount: provenance.candidateCount,
    },
  };
}
