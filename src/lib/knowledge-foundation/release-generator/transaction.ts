import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function executeReleaseTransaction(input: {
  versionId: string;
  artifactPath: string;
  releaseNotes?: string;
  changeSummary: Prisma.InputJsonValue;
  manifestPath: string;
  sha256: string;
  provenance: Prisma.InputJsonValue;
  previousReleaseId: string | null;
  previousReleaseHash: string | null;
  actorId: string;
}): Promise<{ releaseId: string; candidateCount: number }> {
  return prisma.$transaction(async (tx) => {
    const releasedAt = new Date();
    await tx.knowledgeFoundationVersionCandidate.updateMany({
      where: { versionId: input.versionId },
      data: { includedInRelease: true, releasedAt },
    });

    const count = await tx.knowledgeFoundationVersionCandidate.count({
      where: { versionId: input.versionId },
    });

    await tx.knowledgeFoundationVersion.update({
      where: { id: input.versionId },
      data: {
        artifactPath: input.artifactPath,
        candidateCount: count,
        status: "RELEASED",
      },
    });

    const release = await tx.knowledgeFoundationRelease.create({
      data: {
        versionId: input.versionId,
        releaseNotes: input.releaseNotes,
        changeSummary: input.changeSummary,
        manifestPath: input.manifestPath,
        manifestSha256: input.sha256,
        provenanceSnapshot: input.provenance,
        previousReleaseId: input.previousReleaseId,
        previousReleaseHash: input.previousReleaseHash,
        artifactStatus: "PENDING",
        createdById: input.actorId,
      },
    });

    return { releaseId: release.id, candidateCount: count };
  });
}
