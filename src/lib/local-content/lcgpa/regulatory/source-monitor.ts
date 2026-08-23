// ─── LCGPA Regulatory Intelligence :: Continuous Source Monitor (§6, §7, §26) ───
//
//   Scheduler → Source Registry → Fetch → Fingerprint → Compare
//               → NO_CHANGE | CHANGE_DETECTED | SOURCE_UNAVAILABLE
//
// The monitor NEVER mutates regulatory state. It produces immutable check
// results and hands changed artifacts to the governance pipeline.
//
// Response metadata (ETag, Last-Modified, Content-Length) is recorded but is
// NEVER authoritative for artifact identity — content hashing is (§6).

import type {
  Clock,
  FetchedResource,
  RegulatoryFetcher,
  RegulatorySource,
  ResourceMetadata,
  SourceCheckOutcome,
  SourceCheckResult,
} from "./types";
import { deterministicId } from "./ids";
import { sha256 } from "./integrity";
import {
  applyCheckResult,
  computeNextCheckAt,
  isDueForCheck,
  selectDueSources,
} from "./source-registry";

// ─── Metadata extraction ───

export function extractMetadata(resource: FetchedResource): ResourceMetadata {
  const h = (name: string): string | undefined => {
    const target = name.toLowerCase();
    for (const [k, v] of Object.entries(resource.headers)) {
      if (k.toLowerCase() === target) return v;
    }
    return undefined;
  };
  const meta: ResourceMetadata = {};
  const etag = h("etag");
  if (etag) meta.etag = etag;
  const lastModified = h("last-modified");
  if (lastModified) meta.lastModified = lastModified;
  const lengthRaw = h("content-length");
  const parsedLength = lengthRaw !== undefined ? Number(lengthRaw) : undefined;
  if (parsedLength !== undefined && Number.isFinite(parsedLength)) {
    meta.contentLength = parsedLength;
  }
  const contentType = h("content-type");
  if (contentType) meta.contentType = contentType;
  const declaredVersion = h("x-document-version");
  if (declaredVersion) meta.declaredVersion = declaredVersion;
  const declaredPublished = h("x-published-at");
  if (declaredPublished) meta.declaredPublishedAt = declaredPublished;
  return meta;
}

// ─── Single source check ───

export interface CheckSourceInput {
  source: RegulatorySource;
  fetcher: RegulatoryFetcher;
  clock: Clock;
  /** Trace identity linking every event produced by this check. */
  correlationId: string;
  /** Bypass the schedule (manual trigger / ON_DEMAND). */
  force?: boolean;
}

export interface CheckSourceOutput {
  result: SourceCheckResult;
  /** Source state after the check has been applied. */
  source: RegulatorySource;
  /** The fetched resource, when a body was retrieved. Raw and unmodified. */
  resource: FetchedResource | null;
}

function buildResult(
  source: RegulatorySource,
  checkedAt: Date,
  outcome: SourceCheckOutcome,
  fields: Partial<SourceCheckResult>,
): SourceCheckResult {
  return {
    checkId: deterministicId("CHK", [source.id, checkedAt.toISOString(), outcome]),
    sourceId: source.id,
    checkedAt,
    outcome,
    httpStatus: null,
    observedSha256: null,
    previousSha256: source.lastArtifactHash,
    metadata: null,
    errorCode: null,
    errorMessage: null,
    nextCheckAt: computeNextCheckAt(source, checkedAt),
    attemptCount: source.consecutiveFailures + 1,
    correlationId: "",
    ...fields,
  };
}

/**
 * Check one source: fetch, fingerprint, compare.
 *
 * A failed check NEVER invalidates the currently active dataset (§26).
 */
export async function checkSource(input: CheckSourceInput): Promise<CheckSourceOutput> {
  const { source, fetcher, clock, correlationId, force } = input;
  const checkedAt = clock.now();

  if (!source.enabled) {
    const result = buildResult(source, checkedAt, "SKIPPED_DISABLED", { correlationId });
    return { result, source, resource: null };
  }
  if (!force && !isDueForCheck(source, checkedAt)) {
    const result = buildResult(source, checkedAt, "SKIPPED_NOT_DUE", { correlationId });
    return { result, source, resource: null };
  }

  let resource: FetchedResource;
  try {
    resource = await fetcher.fetch(source.url);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const result = buildResult(source, checkedAt, "SOURCE_UNAVAILABLE", {
      correlationId,
      errorCode: "FETCH_THREW",
      errorMessage: message,
    });
    return { result, source: applyCheckResult(source, result), resource: null };
  }

  if (!resource.ok || resource.body === null || resource.body.length === 0) {
    const emptyBody = resource.body === null || resource.body.length === 0;
    const result = buildResult(source, checkedAt, "SOURCE_UNAVAILABLE", {
      correlationId,
      httpStatus: resource.status ?? null,
      metadata: extractMetadata(resource),
      errorCode:
        resource.errorCode ?? (emptyBody ? "EMPTY_BODY" : `HTTP_${resource.status}`),
      errorMessage: resource.errorMessage ?? null,
    });
    return { result, source: applyCheckResult(source, result), resource: null };
  }

  let observed: string;
  try {
    observed = sha256(resource.body);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const result = buildResult(source, checkedAt, "INTEGRITY_FAILURE", {
      correlationId,
      httpStatus: resource.status,
      metadata: extractMetadata(resource),
      errorCode: "HASH_FAILED",
      errorMessage: message,
    });
    return { result, source: applyCheckResult(source, result), resource: null };
  }

  const previous = source.lastArtifactHash;
  const outcome: SourceCheckOutcome =
    previous === null
      ? "FIRST_OBSERVATION"
      : previous === observed
        ? "NO_CHANGE"
        : "CHANGE_DETECTED";

  const result = buildResult(source, checkedAt, outcome, {
    correlationId,
    httpStatus: resource.status,
    observedSha256: observed,
    previousSha256: previous,
    metadata: extractMetadata(resource),
  });

  return { result, source: applyCheckResult(source, result), resource };
}

// ─── Scheduled cycle ───

export interface MonitorCycleInput {
  sources: RegulatorySource[];
  fetcher: RegulatoryFetcher;
  clock: Clock;
  /** Correlation id for the whole cycle; per-source ids are derived from it. */
  correlationId: string;
  /** Check every enabled source regardless of schedule. */
  force?: boolean;
}

export interface MonitorCycleOutput {
  /** Check results in deterministic source-id order. */
  results: SourceCheckResult[];
  /** Updated sources, including untouched ones, in source-id order. */
  sources: RegulatorySource[];
  /** Sources whose content changed, paired with the raw body observed. */
  changed: { source: RegulatorySource; resource: FetchedResource }[];
  startedAt: Date;
  finishedAt: Date;
}

/**
 * Run one monitoring cycle over the registry.
 * Deterministic: sources are processed in id order.
 */
export async function runMonitorCycle(
  input: MonitorCycleInput,
): Promise<MonitorCycleOutput> {
  const { sources, fetcher, clock, correlationId, force } = input;
  const startedAt = clock.now();

  const due = force
    ? sources.filter((s) => s.enabled).slice().sort((a, b) => a.id.localeCompare(b.id))
    : selectDueSources(sources, startedAt);
  const dueIds = new Set(due.map((s) => s.id));

  const results: SourceCheckResult[] = [];
  const updated = new Map<string, RegulatorySource>();
  const changed: { source: RegulatorySource; resource: FetchedResource }[] = [];

  for (const source of due) {
    const out = await checkSource({
      source,
      fetcher,
      clock,
      correlationId: `${correlationId}:${source.id}`,
      force,
    });
    results.push(out.result);
    updated.set(source.id, out.source);
    if (
      (out.result.outcome === "CHANGE_DETECTED" ||
        out.result.outcome === "FIRST_OBSERVATION") &&
      out.resource
    ) {
      changed.push({ source: out.source, resource: out.resource });
    }
  }

  const finalSources = sources
    .map((s) => (dueIds.has(s.id) ? (updated.get(s.id) ?? s) : s))
    .sort((a, b) => a.id.localeCompare(b.id));

  return {
    results,
    sources: finalSources,
    changed,
    startedAt,
    finishedAt: clock.now(),
  };
}

// ─── Failure record (§26) ───

export interface SourceFailureRecord {
  sourceId: string;
  failureAt: Date;
  errorCode: string;
  errorMessage: string | null;
  retryAt: Date | null;
  attemptCount: number;
}

/** Build the persisted failure record for a failed check. */
export function toFailureRecord(
  result: SourceCheckResult,
): SourceFailureRecord | null {
  if (result.outcome !== "SOURCE_UNAVAILABLE" && result.outcome !== "INTEGRITY_FAILURE") {
    return null;
  }
  return {
    sourceId: result.sourceId,
    failureAt: result.checkedAt,
    errorCode: result.errorCode ?? "UNKNOWN",
    errorMessage: result.errorMessage,
    retryAt: result.nextCheckAt,
    attemptCount: result.attemptCount,
  };
}
