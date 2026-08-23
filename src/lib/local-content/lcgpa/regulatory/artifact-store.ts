// ─── LCGPA Regulatory Intelligence :: Artifact Acquisition & Store (§8, §9, §32) ───
//
// The artifact store is APPEND-ONLY. A changed SHA-256 always creates a new
// artifact version; previous versions are preserved forever so that any
// historical dataset remains reproducible.
//
// Identity is content-addressed: `${sourceId}:${sha256}`. Re-acquiring the same
// bytes from the same source is therefore idempotent (§32) — one artifact
// version, no duplicate events.

import type {
  Clock,
  FetchedResource,
  IntegrityReport,
  RegulatoryArtifact,
  RegulatoryProvenance,
  RegulatorySource,
} from "./types";
import { REGULATORY_PARSER_VERSION, REGULATORY_SCHEMA_VERSION } from "./types";
import { artifactIdentity, validateArtifactIntegrity } from "./integrity";
import { canUpdateAuthoritativeState, isDiscoveryOnly } from "./source-registry";

// ─── Filename derivation ───

/** Decode a value that may have been percent-encoded more than once. */
function decodeRepeatedly(value: string, rounds = 3): string {
  let out = value;
  for (let i = 0; i < rounds; i++) {
    let next: string;
    try {
      next = decodeURIComponent(out);
    } catch {
      return out;
    }
    if (next === out) return out;
    out = next;
  }
  return out;
}

/** Strip path separators so a served filename can never escape a directory. */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[\\/]/g, "_")
    .replace(/[\u0000-\u001f]/g, "")
    .trim();
}

/**
 * Parse RFC 6266 `Content-Disposition`. `filename*` (RFC 5987) wins over
 * `filename`, matching browser behaviour.
 */
export function filenameFromContentDisposition(
  value: string | undefined,
): string | null {
  if (!value) return null;
  const extended = /filename\*\s*=\s*([^;]+)/i.exec(value);
  if (extended) {
    const raw = extended[1].trim().replace(/^"|"$/g, "");
    const parts = raw.split("'");
    const encoded = parts.length >= 3 ? parts.slice(2).join("'") : raw;
    const decoded = sanitizeFilename(decodeRepeatedly(encoded));
    if (decoded) return decoded;
  }
  const plain = /filename\s*=\s*("([^"]*)"|[^;]+)/i.exec(value);
  if (plain) {
    const decoded = sanitizeFilename(decodeRepeatedly((plain[2] ?? plain[1]).trim()));
    if (decoded) return decoded;
  }
  return null;
}

/**
 * Derive the artifact filename.
 *
 * Order of authority — the server's own statement wins:
 *   1. `Content-Disposition`
 *   2. the last URL path segment, when it carries an extension
 *   3. a `name=` query parameter (Mendix document endpoints carry one, often
 *      double-encoded)
 *   4. the last path segment without an extension
 *   5. the source id
 */
export function deriveFilename(
  url: string,
  sourceId: string,
  headers?: Record<string, string>,
): string {
  const fromHeader = filenameFromContentDisposition(
    headers ? header(headers, "content-disposition") : undefined,
  );
  if (fromHeader) return fromHeader;

  try {
    const parsed = new URL(url);
    const last = parsed.pathname.split("/").filter(Boolean).pop();
    if (last && last.includes(".")) return sanitizeFilename(decodeRepeatedly(last));

    const nameParam = parsed.searchParams.get("name");
    if (nameParam) {
      const decoded = sanitizeFilename(decodeRepeatedly(nameParam));
      if (decoded) return decoded;
    }
    if (last) return sanitizeFilename(decodeRepeatedly(last));
  } catch {
    // fall through
  }
  return sourceId;
}

/** Normalize a header lookup (headers are case-insensitive). */
export function header(
  headers: Record<string, string>,
  name: string,
): string | undefined {
  const target = name.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === target) return v;
  }
  return undefined;
}

// ─── Declared metadata (never inferred) ───

export interface DeclaredArtifactMetadata {
  /** Publication date as stated by the authority. */
  publishedAt?: Date | null;
  /** Regulatory effectivity as stated by the authority. */
  effectiveFrom?: Date | null;
  effectiveTo?: Date | null;
  /** Version label as stated by the authority. */
  version?: string | null;
}

// ─── Acquisition ───

export interface AcquireArtifactInput {
  source: RegulatorySource;
  resource: FetchedResource;
  /** Authenticated actor or named system principal. */
  acquiredBy: string;
  clock: Clock;
  /** Explicit filename override. */
  filename?: string;
  /** Only values the official artifact actually states. */
  declared?: DeclaredArtifactMetadata;
}

export interface AcquireArtifactResult {
  ok: boolean;
  artifact: RegulatoryArtifact | null;
  /** Machine-readable blocker when acquisition is refused. */
  blockedReason: string | null;
  integrity: IntegrityReport | null;
}

/**
 * Capture exactly what the source served, fingerprint it, and validate it.
 *
 * The raw body is preserved by the caller BEFORE this function computes the
 * hash — this function never mutates the buffer it is given.
 */
export function acquireArtifact(input: AcquireArtifactInput): AcquireArtifactResult {
  const { source, resource, acquiredBy, clock } = input;

  if (!acquiredBy) {
    return {
      ok: false,
      artifact: null,
      blockedReason:
        "ACQUIRER_MISSING: acquisition must be attributable to an authenticated actor or named system principal",
      integrity: null,
    };
  }

  if (isDiscoveryOnly(source)) {
    // TIER 4 content is captured for early warning only; it is never stored as
    // a regulatory artifact that could reach the registry (§30).
    return {
      ok: false,
      artifact: null,
      blockedReason:
        "THIRD_PARTY_INGESTION_BLOCKED: TIER 4 sources are discovery/cross-check only and may never produce regulatory artifacts",
      integrity: null,
    };
  }

  if (!resource.ok || resource.body === null) {
    return {
      ok: false,
      artifact: null,
      blockedReason: `SOURCE_FETCH_FAILED: ${resource.errorCode ?? "HTTP_" + resource.status}${
        resource.errorMessage ? " — " + resource.errorMessage : ""
      }`,
      integrity: null,
    };
  }

  const filename =
    input.filename ?? deriveFilename(resource.finalUrl, source.id, resource.headers);
  const declaredMime =
    header(resource.headers, "content-type")?.split(";")[0]?.trim() ?? "application/octet-stream";

  const integrity = validateArtifactIntegrity({
    buffer: resource.body,
    filename,
    declaredMimeType: declaredMime,
  });

  if (integrity.sha256.length !== 64) {
    return {
      ok: false,
      artifact: null,
      blockedReason: "INGESTION_BLOCKED: SHA-256 could not be generated for this artifact",
      integrity,
    };
  }

  const clean = integrity.errors.length === 0;
  const declared = input.declared ?? {};

  const artifact: RegulatoryArtifact = {
    artifactId: artifactIdentity(source.id, integrity.sha256),
    sourceId: source.id,
    sourceUrl: source.url,
    directUrl: resource.finalUrl,
    filename,
    mimeType: declaredMime,
    size: resource.body.length,
    sha256: integrity.sha256,
    acquiredAt: clock.now(),
    acquiredBy,
    publishedAt: declared.publishedAt ?? null,
    effectiveFrom: declared.effectiveFrom ?? null,
    effectiveTo: declared.effectiveTo ?? null,
    version: declared.version ?? null,
    status: clean ? "VERIFIED" : "QUARANTINED",
    blockedReason: clean ? null : integrity.errors.join("; "),
    integrity,
  };

  return {
    ok: true,
    artifact,
    blockedReason: clean ? null : `ARTIFACT_QUARANTINED: ${integrity.errors.join("; ")}`,
    integrity,
  };
}

/**
 * Gate: may this artifact update authoritative regulatory state?
 * Requires a TIER 1 verified source AND a clean, verified artifact.
 */
export function canArtifactUpdateAuthority(
  source: RegulatorySource,
  artifact: RegulatoryArtifact,
): { allowed: boolean; reason: string } {
  const tierGate = canUpdateAuthoritativeState(source);
  if (!tierGate.allowed) return tierGate;
  if (artifact.sourceId !== source.id) {
    return {
      allowed: false,
      reason: "ARTIFACT_SOURCE_MISMATCH: artifact was not acquired from this source",
    };
  }
  if (artifact.status === "QUARANTINED" || artifact.status === "REJECTED") {
    return {
      allowed: false,
      reason: `ARTIFACT_${artifact.status}: ${artifact.blockedReason ?? "artifact failed validation"}`,
    };
  }
  if (artifact.sha256.length !== 64) {
    return { allowed: false, reason: "ARTIFACT_HASH_MISSING: SHA-256 is required" };
  }
  return { allowed: true, reason: "TIER_1_VERIFIED_CLEAN_ARTIFACT" };
}

// ─── Store ───

export interface ArtifactPutResult {
  artifact: RegulatoryArtifact;
  /** False when an artifact with the same identity was already stored (§32). */
  isNew: boolean;
}

export interface ArtifactStore {
  /** Append-only. Re-putting identical content is a no-op returning isNew=false. */
  put(artifact: RegulatoryArtifact): ArtifactPutResult;
  get(artifactId: string): RegulatoryArtifact | undefined;
  getByHash(sourceId: string, sha256: string): RegulatoryArtifact | undefined;
  /** All artifacts for a source, oldest first. */
  listBySource(sourceId: string): RegulatoryArtifact[];
  /** Most recently acquired artifact for a source. */
  latestBySource(sourceId: string): RegulatoryArtifact | undefined;
  /** Mark an artifact superseded without deleting it. */
  supersede(artifactId: string, at: Date): RegulatoryArtifact | undefined;
  /** Quarantine an artifact, preserving evidence (§50). */
  quarantine(artifactId: string, reason: string): RegulatoryArtifact | undefined;
  /** Mark parse outcome. */
  markParsed(artifactId: string): RegulatoryArtifact | undefined;
  markParseFailed(artifactId: string, error: string): RegulatoryArtifact | undefined;
  size(): number;
}

export function createArtifactStore(
  initial: RegulatoryArtifact[] = [],
): ArtifactStore {
  const byId = new Map<string, RegulatoryArtifact>();
  const order: string[] = [];

  function insert(a: RegulatoryArtifact): void {
    byId.set(a.artifactId, a);
    order.push(a.artifactId);
  }
  for (const a of initial) if (!byId.has(a.artifactId)) insert(a);

  function replace(id: string, next: RegulatoryArtifact): RegulatoryArtifact {
    byId.set(id, next);
    return next;
  }

  return {
    put(artifact) {
      const existing = byId.get(artifact.artifactId);
      if (existing) return { artifact: existing, isNew: false };
      insert(artifact);
      return { artifact, isNew: true };
    },
    get: (artifactId) => byId.get(artifactId),
    getByHash: (sourceId, hash) => byId.get(artifactIdentity(sourceId, hash)),
    listBySource: (sourceId) =>
      order
        .map((id) => byId.get(id))
        .filter((a): a is RegulatoryArtifact => !!a && a.sourceId === sourceId),
    latestBySource(sourceId) {
      const list = this.listBySource(sourceId);
      return list.length ? list[list.length - 1] : undefined;
    },
    supersede(artifactId) {
      const a = byId.get(artifactId);
      if (!a) return undefined;
      return replace(artifactId, { ...a, status: "SUPERSEDED" });
    },
    quarantine(artifactId, reason) {
      const a = byId.get(artifactId);
      if (!a) return undefined;
      return replace(artifactId, {
        ...a,
        status: "QUARANTINED",
        blockedReason: reason,
      });
    },
    markParsed(artifactId) {
      const a = byId.get(artifactId);
      if (!a) return undefined;
      if (a.status === "QUARANTINED" || a.status === "REJECTED") return a;
      return replace(artifactId, { ...a, status: "PARSED" });
    },
    markParseFailed(artifactId, error) {
      const a = byId.get(artifactId);
      if (!a) return undefined;
      return replace(artifactId, {
        ...a,
        status: "PARSE_FAILED",
        blockedReason: error,
      });
    },
    size: () => byId.size,
  };
}

// ─── Provenance assembly (§11, §36) ───

export interface BuildProvenanceInput {
  artifact: RegulatoryArtifact;
  source: RegulatorySource;
  datasetVersion: string;
  documentVersion: string;
  ruleVersion: string;
  parserVersion?: string;
  schemaVersion?: string;
}

/** Assemble the complete provenance chain for a normalized regulatory value. */
export function buildProvenance(input: BuildProvenanceInput): RegulatoryProvenance {
  const { artifact, source } = input;
  return {
    sourceAuthority: source.authority,
    sourceId: source.id,
    sourceUrl: source.url,
    directArtifactUrl: artifact.directUrl,
    artifactFilename: artifact.filename,
    artifactSha256: artifact.sha256,
    artifactSize: artifact.size,
    acquiredAt: artifact.acquiredAt,
    acquiredBy: artifact.acquiredBy,
    publicationDate: artifact.publishedAt,
    effectiveFrom: artifact.effectiveFrom,
    effectiveTo: artifact.effectiveTo,
    datasetVersion: input.datasetVersion,
    documentVersion: input.documentVersion,
    parserVersion: input.parserVersion ?? REGULATORY_PARSER_VERSION,
    schemaVersion: input.schemaVersion ?? REGULATORY_SCHEMA_VERSION,
    ruleVersion: input.ruleVersion,
  };
}

/** Provenance completeness gate — every field in §11 must be present. */
export function validateProvenance(p: RegulatoryProvenance): string[] {
  const missing: string[] = [];
  const required: (keyof RegulatoryProvenance)[] = [
    "sourceAuthority",
    "sourceId",
    "sourceUrl",
    "directArtifactUrl",
    "artifactFilename",
    "artifactSha256",
    "acquiredAt",
    "acquiredBy",
    "datasetVersion",
    "documentVersion",
    "parserVersion",
    "schemaVersion",
    "ruleVersion",
  ];
  for (const key of required) {
    const value = p[key];
    if (value === null || value === undefined || value === "") {
      missing.push(`PROVENANCE_FIELD_MISSING: ${key}`);
    }
  }
  if (p.artifactSha256 && p.artifactSha256.length !== 64) {
    missing.push("PROVENANCE_HASH_INVALID: artifactSha256 must be a 64-character SHA-256 digest");
  }
  if (p.artifactSize <= 0) {
    missing.push("PROVENANCE_FIELD_MISSING: artifactSize");
  }
  return missing;
}
