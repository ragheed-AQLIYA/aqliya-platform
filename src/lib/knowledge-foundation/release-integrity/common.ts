import "server-only";
import * as path from "path";

export const ARTIFACTS_ROOT = path.join(process.cwd(), "knowledge", "releases");

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

export type VerifyOptions = {
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

export function jsonEquivalent(a: unknown, b: unknown): boolean {
  return JSON.stringify(normalizeJson(a)) === JSON.stringify(normalizeJson(b));
}

export function buildResult(input: {
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
