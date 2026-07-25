import "server-only";
import { prisma } from "@/lib/prisma";
import { writeReleaseArtifacts, type ReleaseArtifactFiles } from "./common";
import { emitFoundationEvent } from "../events";

export async function writeArtifactsAndFinalize(params: {
  releaseId: string;
  artifactFiles: ReleaseArtifactFiles;
  versionId: string;
  actorId: string;
  versionNumber: string;
  releaseNotes?: string;
  generatedAt: string;
  previousVersionStatus: string;
  candidateIds: string[];
  candidateCount: number;
  sha256: string;
  manifestPath: string;
  previousReleaseId: string | null;
  previousReleaseHash: string | null;
}): Promise<void> {
  try {
    await writeReleaseArtifacts(params.artifactFiles);

    await prisma.knowledgeFoundationRelease.update({
      where: { id: params.releaseId },
      data: { artifactStatus: "COMPLETE" },
    });

    await emitFoundationEvent({
      type: "knowledge.foundation.version.released",
      versionId: params.versionId,
      actorId: params.actorId,
      timestamp: params.generatedAt,
      versionNumber: params.versionNumber,
      previousStatus: params.previousVersionStatus,
      newStatus: "RELEASED",
      notes: params.releaseNotes,
      payload: {
        candidateIds: params.candidateIds,
        candidateCount: params.candidateCount,
        sha256: params.sha256,
        manifestPath: params.manifestPath,
        artifactStatus: "COMPLETE",
        previousReleaseId: params.previousReleaseId,
        previousReleaseHash: params.previousReleaseHash,
      },
    });
  } catch (error) {
    await prisma.knowledgeFoundationRelease.update({
      where: { id: params.releaseId },
      data: { artifactStatus: "FAILED" },
    });
    throw error;
  }
}
