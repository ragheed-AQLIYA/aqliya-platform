import "server-only";
import * as path from "path";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import type { Prisma } from "@prisma/client";
import * as crypto from "crypto";
import type { ReleasePackage } from "../types";
import { loadVersionBoundCandidates } from "../version-candidate-snapshot";
import { buildVersionProvenanceManifest } from "../provenance-manifest";
import { resolveChainParentRelease } from "../trust-chain";
import { registerFoundationAuditHandler } from "../audit-handler";
import { ARTIFACTS_ROOT, type ReleaseManifest, type ReleaseArtifactFiles } from "./common";
import { executeReleaseTransaction } from "./transaction";
import { writeArtifactsAndFinalize } from "./artifacts";

registerFoundationAuditHandler();

export type { ReleaseManifest };

/**
 * Generate an immutable release package from version-bound candidates only.
 *
 * Phase A (DB transaction): binding marks, version RELEASED, release row.
 * Phase B (filesystem): artifact writes, artifactStatus COMPLETE, audit event.
 */
export async function generateReleasePackage(input: {
  versionId: string;
  versionNumber: string;
  actorId: string;
  releaseNotes?: string;
}): Promise<ReleasePackage> {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
    throw new Error("Access denied: OPERATOR role required");
  }

  const version = await prisma.knowledgeFoundationVersion.findUniqueOrThrow({
    where: { id: input.versionId },
    select: {
      id: true,
      status: true,
      versionNumber: true,
      rollbackVersionId: true,
    },
  });

  if (version.status !== "APPROVED") {
    throw new Error(
      `Cannot release version in status "${version.status}". Must be APPROVED.`,
    );
  }

  const boundCandidates = await loadVersionBoundCandidates(input.versionId);
  const candidateIds = boundCandidates.map((c) => c.candidateId);
  const generatedAt = new Date().toISOString();

  const candidateList = boundCandidates.map((c) => ({
    id: c.candidateId,
    phrase: c.candidatePhrase,
    canonicalCode: c.canonicalCode,
    category: c.category,
    confidence: c.confidence,
  }));

  const rules = boundCandidates.map((c) => ({
    phrase: c.candidatePhrase,
    canonicalCode: c.canonicalCode,
    category: c.category,
    confidence: c.confidence,
    supportCount: c.supportCount,
    organizationCount: c.organizationCount,
  }));

  const provenance = await buildVersionProvenanceManifest(input.versionId);

  const chainParent = await resolveChainParentRelease(
    input.versionId,
    version.rollbackVersionId,
  );

  const foundation = {
    versionId: input.versionId,
    rules,
    releasedAt: generatedAt,
    versionNumber: input.versionNumber,
    totalCandidates: rules.length,
    candidateIds,
  };
  const foundationContent = JSON.stringify(foundation, null, 2);

  const sha256 = crypto
    .createHash("sha256")
    .update(foundationContent)
    .digest("hex");

  const artifactPath = `knowledge/releases/v${input.versionNumber}`;
  const manifestPath = `${artifactPath}/manifest.json`;
  const versionDir = path.join(ARTIFACTS_ROOT, `v${input.versionNumber}`);

  const changeSummary = {
    versionId: input.versionId,
    versionNumber: input.versionNumber,
    candidateIds,
    candidateCount: candidateList.length,
    addedCount: candidateList.length,
    modifiedCount: 0,
    removedCount: 0,
    breakingChange: false,
    riskScore: 0,
    generatedAt,
  };

  const manifest: ReleaseManifest = {
    versionId: input.versionId,
    versionNumber: input.versionNumber,
    candidateIds,
    candidateCount: candidateList.length,
    sha256,
    generatedAt,
    previousReleaseId: chainParent?.id ?? null,
    previousReleaseHash: chainParent?.manifestSha256 ?? null,
    provenance,
    artifactPath: versionDir,
    hash: sha256,
    createdAt: generatedAt,
  };

  const releaseNotesContent = input.releaseNotes
    ? `# Knowledge Foundation v${input.versionNumber}\n\n${input.releaseNotes}\n\n---\n\n*Generated: ${generatedAt}*\n*Bound candidates: ${candidateList.length}*\n`
    : `# Knowledge Foundation v${input.versionNumber}\n\nRelease of ${candidateList.length} version-bound knowledge candidates.\n\n*Generated: ${generatedAt}*\n`;

  const artifactFiles: ReleaseArtifactFiles = {
    versionDir,
    candidateListContent: JSON.stringify(
      {
        versionId: input.versionId,
        versionNumber: input.versionNumber,
        generatedAt,
        candidateIds,
        candidates: candidateList,
      },
      null,
      2,
    ),
    foundationContent,
    provenanceContent: JSON.stringify(provenance, null, 2),
    releaseNotesContent,
    changeSummaryContent: JSON.stringify(changeSummary, null, 2),
    manifestContent: JSON.stringify(manifest, null, 2),
  };

  const { releaseId, candidateCount } = await executeReleaseTransaction({
    versionId: input.versionId,
    artifactPath,
    releaseNotes: input.releaseNotes,
    changeSummary: changeSummary as Prisma.InputJsonValue,
    manifestPath,
    sha256,
    provenance: provenance as Prisma.InputJsonValue,
    previousReleaseId: chainParent?.id ?? null,
    previousReleaseHash: chainParent?.manifestSha256 ?? null,
    actorId: input.actorId,
  });

  await writeArtifactsAndFinalize({
    releaseId,
    artifactFiles,
    versionId: input.versionId,
    actorId: input.actorId,
    versionNumber: input.versionNumber,
    releaseNotes: input.releaseNotes,
    generatedAt,
    previousVersionStatus: version.status,
    candidateIds,
    candidateCount,
    sha256,
    manifestPath,
    previousReleaseId: chainParent?.id ?? null,
    previousReleaseHash: chainParent?.manifestSha256 ?? null,
  });

  return {
    versionId: input.versionId,
    versionNumber: input.versionNumber,
    manifest,
    candidateList,
    knowledgeFoundation: foundation,
    releaseNotes: releaseNotesContent,
    changeSummary,
  };
}
