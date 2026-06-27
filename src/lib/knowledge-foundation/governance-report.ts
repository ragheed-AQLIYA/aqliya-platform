import "server-only";

import { prisma } from "@/lib/prisma";
import { evaluateReleaseReadiness, type ReleaseReadinessResult } from "./release-readiness";
import { buildVersionProvenanceManifest } from "./provenance-manifest";
import { summarizeProvenanceManifest, type ProvenanceSummary } from "./provenance-summary";

export type FoundationGovernanceReport = {
  versionId: string;
  versionNumber: string;
  generatedAt: string;
  lifecycle: {
    status: string;
    createdAt: string;
    approvedById: string | null;
    activatedAt: string | null;
    artifactPath: string | null;
    rollbackVersionId: string | null;
  };
  candidateMetrics: ReleaseReadinessResult["metrics"];
  provenanceMetrics: ProvenanceSummary;
  readiness: ReleaseReadinessResult;
  releaseHistory: Array<{
    id: string;
    createdAt: string;
    manifestPath: string | null;
    manifestSha256: string | null;
    artifactStatus: string;
    releaseNotes: string | null;
    createdById: string;
  }>;
};

/**
 * Read-only governance report for operator export/review.
 */
export async function generateFoundationGovernanceReport(
  versionId: string,
): Promise<FoundationGovernanceReport> {
  const version = await prisma.knowledgeFoundationVersion.findUniqueOrThrow({
    where: { id: versionId },
    include: {
      releases: { orderBy: { createdAt: "desc" } },
    },
  });

  const [readiness, provenance] = await Promise.all([
    evaluateReleaseReadiness(versionId),
    buildVersionProvenanceManifest(versionId),
  ]);

  const provenanceMetrics = summarizeProvenanceManifest(provenance);

  return {
    versionId: version.id,
    versionNumber: version.versionNumber,
    generatedAt: new Date().toISOString(),
    lifecycle: {
      status: version.status,
      createdAt: version.createdAt.toISOString(),
      approvedById: version.approvedById,
      activatedAt: version.activatedAt?.toISOString() ?? null,
      artifactPath: version.artifactPath,
      rollbackVersionId: version.rollbackVersionId,
    },
    candidateMetrics: readiness.metrics,
    provenanceMetrics,
    readiness,
    releaseHistory: version.releases.map((r) => ({
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      manifestPath: r.manifestPath,
      manifestSha256: r.manifestSha256,
      artifactStatus: r.artifactStatus,
      releaseNotes: r.releaseNotes,
      createdById: r.createdById,
    })),
  };
}
