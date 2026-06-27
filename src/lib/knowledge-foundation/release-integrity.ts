import "server-only";

import { promises as fs } from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { emitFoundationEvent } from "./events";

const ARTIFACTS_ROOT = path.join(process.cwd(), "knowledge", "releases");

export type ReleaseIntegrityResult = {
  valid: boolean;
  artifactFound: boolean;
  manifestFound: boolean;
  provenanceFound: boolean;
  hashMatch: boolean;
  chainValid: boolean;
  releaseRowValid: boolean;
  blockers: string[];
  releaseId: string | null;
  previousReleaseId: string | null;
  previousReleaseHash: string | null;
};

type VerifyOptions = {
  actorId: string;
  emitAudit?: boolean;
  versionNumber?: string;
  /** When true, RELEASED or ACTIVE may pass status gate (activate + rollback). */
  forActivation?: boolean;
};

function normalizeJson(value: unknown): unknown {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(normalizeJson);
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    out[key] = normalizeJson(obj[key]);
  }
  return out;
}

function jsonEquivalent(a: unknown, b: unknown): boolean {
  return JSON.stringify(normalizeJson(a)) === JSON.stringify(normalizeJson(b));
}

/**
 * DB is source of truth (manifestSha256, provenanceSnapshot, artifactStatus).
 * Filesystem artifacts are verification evidence only.
 */
export async function verifyReleaseIntegrity(
  versionId: string,
  options: VerifyOptions,
): Promise<ReleaseIntegrityResult> {
  const blockers: string[] = [];
  let releaseRowValid = false;
  let artifactFound = false;
  let manifestFound = false;
  let provenanceFound = false;
  let hashMatch = false;
  let chainValid = false;

  const version = await prisma.knowledgeFoundationVersion.findUnique({
    where: { id: versionId },
    select: { id: true, status: true, versionNumber: true },
  });

  if (!version) {
    blockers.push("Version not found.");
    return buildResult({
      blockers,
      releaseId: null,
      previousReleaseId: null,
      previousReleaseHash: null,
      releaseRowValid,
      artifactFound,
      manifestFound,
      provenanceFound,
      hashMatch,
      chainValid,
    });
  }

  if (options.forActivation) {
    if (version.status !== "RELEASED" && version.status !== "ACTIVE") {
      blockers.push(
        `Version status is ${version.status}; activation requires RELEASED or ACTIVE with verified release.`,
      );
    }
  } else if (version.status !== "RELEASED") {
    blockers.push(
      `Version status is ${version.status}; integrity gate requires RELEASED.`,
    );
  }

  const release = await prisma.knowledgeFoundationRelease.findFirst({
    where: { versionId, artifactStatus: "COMPLETE" },
    orderBy: { createdAt: "desc" },
    include: {
      previousRelease: {
        select: { id: true, manifestSha256: true, artifactStatus: true },
      },
    },
  });

  if (!release) {
    blockers.push("No COMPLETE release row found in database.");
  } else if (release.artifactStatus !== "COMPLETE") {
    blockers.push(`Release artifactStatus is ${release.artifactStatus}, not COMPLETE.`);
  } else if (!release.manifestSha256) {
    blockers.push("Release manifestSha256 missing in database (source of truth).");
  } else if (!release.provenanceSnapshot) {
    blockers.push("Release provenanceSnapshot missing in database (source of truth).");
  } else {
    releaseRowValid = true;
  }

  if (release?.previousReleaseId) {
    if (!release.previousReleaseHash) {
      blockers.push("Trust chain broken: previousReleaseHash missing on release row.");
      chainValid = false;
    } else if (!release.previousRelease) {
      blockers.push(
        "Trust chain broken: previousReleaseId points to missing release row.",
      );
      chainValid = false;
    } else if (release.previousRelease.artifactStatus !== "COMPLETE") {
      blockers.push("Trust chain broken: parent release is not COMPLETE.");
      chainValid = false;
    } else if (
      release.previousRelease.manifestSha256 !== release.previousReleaseHash
    ) {
      blockers.push(
        "Trust chain broken: previousReleaseHash does not match parent manifestSha256.",
      );
      chainValid = false;
    } else {
      chainValid = true;
    }
  } else if (release) {
    chainValid = true;
  }

  if (release && releaseRowValid) {
    const versionDir = path.join(ARTIFACTS_ROOT, `v${version.versionNumber}`);
    const foundationPath = path.join(versionDir, "knowledge-foundation.json");
    const manifestPath = path.join(versionDir, "manifest.json");
    const provenancePath = path.join(versionDir, "provenance-manifest.json");

    try {
      await fs.access(foundationPath);
      artifactFound = true;
    } catch {
      blockers.push(
        "Verification evidence missing: knowledge-foundation.json not found on disk.",
      );
    }

    try {
      await fs.access(manifestPath);
      manifestFound = true;
    } catch {
      blockers.push("Verification evidence missing: manifest.json not found on disk.");
    }

    try {
      const provenanceRaw = await fs.readFile(provenancePath, "utf-8");
      const provenanceFile = JSON.parse(provenanceRaw) as unknown;
      if (jsonEquivalent(provenanceFile, release.provenanceSnapshot)) {
        provenanceFound = true;
      } else {
        blockers.push(
          "Provenance verification evidence does not match database provenanceSnapshot.",
        );
      }
    } catch {
      blockers.push(
        "Verification evidence missing or invalid: provenance-manifest.json.",
      );
    }

    if (artifactFound) {
      try {
        const foundationContent = await fs.readFile(foundationPath, "utf-8");
        const computed = crypto
          .createHash("sha256")
          .update(foundationContent)
          .digest("hex");
        if (computed === release.manifestSha256) {
          hashMatch = true;
        } else {
          blockers.push(
            "Hash mismatch: knowledge-foundation.json SHA256 does not match database manifestSha256.",
          );
        }
      } catch {
        blockers.push("Failed to read knowledge-foundation.json for hash verification.");
      }
    }
  }

  const result = buildResult({
    blockers,
    releaseId: release?.id ?? null,
    previousReleaseId: release?.previousReleaseId ?? null,
    previousReleaseHash: release?.previousReleaseHash ?? null,
    releaseRowValid,
    artifactFound,
    manifestFound,
    provenanceFound,
    hashMatch,
    chainValid,
  });

  if (options.emitAudit !== false) {
    await emitFoundationEvent({
      type: result.valid
        ? "knowledge.foundation.integrity.verified"
        : "knowledge.foundation.integrity.failed",
      versionId,
      actorId: options.actorId,
      timestamp: new Date().toISOString(),
      versionNumber: options.versionNumber ?? version?.versionNumber,
      payload: {
        valid: result.valid,
        releaseId: result.releaseId,
        artifactFound: result.artifactFound,
        manifestFound: result.manifestFound,
        provenanceFound: result.provenanceFound,
        hashMatch: result.hashMatch,
        chainValid: result.chainValid,
        releaseRowValid: result.releaseRowValid,
        blockers: result.blockers,
        previousReleaseId: result.previousReleaseId,
        previousReleaseHash: result.previousReleaseHash,
      },
    });
  }

  return result;
}

/** Operator-facing verification API (read-only). */
export async function verifyFoundationRelease(
  versionId: string,
  actorId: string,
): Promise<ReleaseIntegrityResult> {
  return verifyReleaseIntegrity(versionId, { actorId, emitAudit: true });
}

function buildResult(input: {
  blockers: string[];
  releaseId: string | null;
  previousReleaseId: string | null;
  previousReleaseHash: string | null;
  releaseRowValid: boolean;
  artifactFound: boolean;
  manifestFound: boolean;
  provenanceFound: boolean;
  hashMatch: boolean;
  chainValid: boolean;
}): ReleaseIntegrityResult {
  const valid =
    input.blockers.length === 0 &&
    input.releaseRowValid &&
    input.artifactFound &&
    input.manifestFound &&
    input.provenanceFound &&
    input.hashMatch &&
    input.chainValid;

  return {
    valid,
    artifactFound: input.artifactFound,
    manifestFound: input.manifestFound,
    provenanceFound: input.provenanceFound,
    hashMatch: input.hashMatch,
    chainValid: input.chainValid,
    releaseRowValid: input.releaseRowValid,
    blockers: input.blockers,
    releaseId: input.releaseId,
    previousReleaseId: input.previousReleaseId,
    previousReleaseHash: input.previousReleaseHash,
  };
}
