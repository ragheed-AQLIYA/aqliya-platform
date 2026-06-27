import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { promises as fs } from "fs";
import * as path from "path";
import { emitFoundationEvent } from "./events";
import { registerFoundationAuditHandler } from "./audit-handler";
import * as crypto from "crypto";
import type { ReleasePackage } from "./types";
import { loadVersionBoundCandidates } from "./version-candidate-snapshot";
import { buildVersionProvenanceManifest } from "./provenance-manifest";
import { resolveChainParentRelease } from "./trust-chain";

registerFoundationAuditHandler();

const ARTIFACTS_ROOT = path.join(process.cwd(), "knowledge", "releases");

export type ReleaseManifest = {
  versionId: string;
  versionNumber: string;
  candidateIds: string[];
  candidateCount: number;
  sha256: string;
  generatedAt: string;
  previousReleaseId: string | null;
  previousReleaseHash: string | null;
  provenance: Awaited<ReturnType<typeof buildVersionProvenanceManifest>>;
  artifactPath: string;
  /** @deprecated Use sha256 */
  hash?: string;
  createdAt?: string;
};

type ReleaseArtifactFiles = {
  versionDir: string;
  candidateListContent: string;
  foundationContent: string;
  provenanceContent: string;
  releaseNotesContent: string;
  changeSummaryContent: string;
  manifestContent: string;
};

async function writeReleaseArtifacts(files: ReleaseArtifactFiles): Promise<void> {
  const { versionDir } = files;
  await fs.mkdir(versionDir, { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(versionDir, "candidate-list.json"), files.candidateListContent, "utf-8"),
    fs.writeFile(path.join(versionDir, "knowledge-foundation.json"), files.foundationContent, "utf-8"),
    fs.writeFile(path.join(versionDir, "provenance-manifest.json"), files.provenanceContent, "utf-8"),
    fs.writeFile(path.join(versionDir, "release-notes.md"), files.releaseNotesContent, "utf-8"),
    fs.writeFile(path.join(versionDir, "change-summary.json"), files.changeSummaryContent, "utf-8"),
    fs.writeFile(path.join(versionDir, "manifest.json"), files.manifestContent, "utf-8"),
  ]);
}

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

  const { releaseId, candidateCount } = await prisma.$transaction(async (tx) => {
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
        artifactPath,
        candidateCount: count,
        status: "RELEASED",
      },
    });

    const release = await tx.knowledgeFoundationRelease.create({
      data: {
        versionId: input.versionId,
        releaseNotes: input.releaseNotes,
        changeSummary,
        manifestPath,
        manifestSha256: sha256,
        provenanceSnapshot: provenance,
        previousReleaseId: chainParent?.id ?? null,
        previousReleaseHash: chainParent?.manifestSha256 ?? null,
        artifactStatus: "PENDING",
        createdById: input.actorId,
      },
    });

    return { releaseId: release.id, candidateCount: count };
  });

  try {
    await writeReleaseArtifacts(artifactFiles);

    await prisma.knowledgeFoundationRelease.update({
      where: { id: releaseId },
      data: { artifactStatus: "COMPLETE" },
    });

    await emitFoundationEvent({
      type: "knowledge.foundation.version.released",
      versionId: input.versionId,
      actorId: input.actorId,
      timestamp: generatedAt,
      versionNumber: input.versionNumber,
      previousStatus: version.status,
      newStatus: "RELEASED",
      notes: input.releaseNotes,
      payload: {
        candidateIds,
        candidateCount,
        sha256,
        manifestPath,
        artifactStatus: "COMPLETE",
        previousReleaseId: chainParent?.id ?? null,
        previousReleaseHash: chainParent?.manifestSha256 ?? null,
      },
    });
  } catch (error) {
    await prisma.knowledgeFoundationRelease.update({
      where: { id: releaseId },
      data: { artifactStatus: "FAILED" },
    });
    throw error;
  }

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
