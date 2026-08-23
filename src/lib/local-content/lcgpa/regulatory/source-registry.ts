// ─── LCGPA Regulatory Intelligence :: Source Registry (§5, §4, §31) ───
//
// Holds every monitored regulatory source, its authority tier, and its
// monitoring policy. Enforces the single most important rule of the engine:
//
//   ONLY a TIER 1 (LCGPA) source that an authenticated operator has verified
//   may produce artifacts that update authoritative regulatory state.
//
// All functions are pure. State transitions return NEW objects.

import type {
  AuthorityTier,
  CheckFrequency,
  Clock,
  RegulatorySource,
  SourceCheckResult,
  SourceHealth,
  SourceStatus,
  SourceVerification,
} from "./types";
import { AuthorityTier as Tier } from "./types";

// ─── Monitoring cadence (§31) ───

/** Interval in milliseconds for each configurable frequency. */
export const CHECK_INTERVAL_MS: Record<CheckFrequency, number | null> = {
  HOURLY: 60 * 60 * 1000,
  DAILY: 24 * 60 * 60 * 1000,
  WEEKLY: 7 * 24 * 60 * 60 * 1000,
  /** ON_DEMAND sources are never scheduled; they are triggered manually. */
  ON_DEMAND: null,
};

/** Consecutive failures tolerated before a source is marked UNAVAILABLE. */
export const FAILURE_TOLERANCE = 3;

/** Exponential backoff applied to the normal interval while a source is failing. */
export function backoffMultiplier(consecutiveFailures: number): number {
  if (consecutiveFailures <= 0) return 1;
  // 2, 4, 8 … capped at 16 so a broken source is still retried within a day.
  return Math.min(2 ** consecutiveFailures, 16);
}

// ─── Construction ───

export interface CreateSourceInput {
  id: string;
  authority: string;
  name: string;
  description: string;
  url: string;
  sourceType: RegulatorySource["sourceType"];
  authorityTier: AuthorityTier;
  monitoringMethod: RegulatorySource["monitoringMethod"];
  checkFrequency: CheckFrequency;
  enabled?: boolean;
}

/**
 * Register a source. Newly registered sources are always UNVERIFIED: the engine
 * has not yet confirmed that the URL serves the canonical artifact.
 */
export function createSource(
  input: CreateSourceInput,
  clock: Clock,
): RegulatorySource {
  const now = clock.now();
  return {
    id: input.id,
    authority: input.authority,
    name: input.name,
    description: input.description,
    url: input.url,
    sourceType: input.sourceType,
    authorityTier: input.authorityTier,
    monitoringMethod: input.monitoringMethod,
    checkFrequency: input.checkFrequency,
    enabled: input.enabled ?? true,
    lastCheckedAt: null,
    lastSuccessfulCheckAt: null,
    lastFailedAt: null,
    lastArtifactHash: null,
    lastKnownVersion: null,
    consecutiveFailures: 0,
    status: "UNVERIFIED",
    verification: null,
    createdAt: now,
    updatedAt: now,
  };
}

// ─── Authority enforcement (§4, §30) ───

/**
 * May artifacts from this source update the authoritative regulatory registry?
 *
 * Requires ALL of:
 *   - TIER 1 (the regulatory authority itself)
 *   - operator-verified canonical URL
 *   - enabled
 *   - not quarantined
 */
export function canUpdateAuthoritativeState(source: RegulatorySource): {
  allowed: boolean;
  reason: string;
} {
  if (source.authorityTier !== Tier.REGULATORY_AUTHORITY) {
    return {
      allowed: false,
      reason: `TIER_${source.authorityTier}_NOT_AUTHORITATIVE: only TIER 1 (regulatory authority) sources may update authoritative state`,
    };
  }
  if (!source.enabled) {
    return { allowed: false, reason: "SOURCE_DISABLED: source is not enabled" };
  }
  if (source.status === "QUARANTINED") {
    return {
      allowed: false,
      reason: "SOURCE_QUARANTINED: source failed integrity validation and is quarantined",
    };
  }
  if (!source.verification) {
    return {
      allowed: false,
      reason:
        "SOURCE_UNVERIFIED: canonical artifact URL has not been confirmed by an authenticated operator",
    };
  }
  return { allowed: true, reason: "TIER_1_VERIFIED" };
}

/** Third-party (TIER 4) sources are discovery / cross-check only (§30). */
export function isDiscoveryOnly(source: RegulatorySource): boolean {
  return source.authorityTier === Tier.THIRD_PARTY;
}

/** Corroborating official sources: TIER 2 and TIER 3. */
export function isCorroborating(source: RegulatorySource): boolean {
  return (
    source.authorityTier === Tier.OFFICIAL_GOVERNMENT ||
    source.authorityTier === Tier.SUPPORTING_OFFICIAL
  );
}

/** Throwing variant for call sites where a violation is a programming error. */
export function assertCanUpdateAuthority(source: RegulatorySource): void {
  const gate = canUpdateAuthoritativeState(source);
  if (!gate.allowed) {
    throw new Error(`AUTHORITATIVE_INGESTION_BLOCKED: ${gate.reason}`);
  }
}

// ─── Operator verification ───

/**
 * Record that an authenticated operator confirmed the canonical URL.
 * The confirmed URL becomes the source URL — an operator may correct it here.
 */
export function verifySource(
  source: RegulatorySource,
  verification: SourceVerification,
): RegulatorySource {
  if (!verification.verifiedById) {
    throw new Error(
      "VERIFIER_MISSING: source verification must be attributable to an authenticated user",
    );
  }
  if (!verification.evidence) {
    throw new Error("VERIFICATION_EVIDENCE_MISSING: evidence is required");
  }
  if (!verification.confirmedUrl) {
    throw new Error("CONFIRMED_URL_MISSING: the confirmed canonical URL is required");
  }
  return {
    ...source,
    url: verification.confirmedUrl,
    verification,
    status: source.status === "UNVERIFIED" ? "HEALTHY" : source.status,
    updatedAt: verification.verifiedAt,
  };
}

// ─── Scheduling (§7, §31) ───

/** When should this source next be checked, given its state at `from`? */
export function computeNextCheckAt(
  source: RegulatorySource,
  from: Date,
): Date | null {
  const base = CHECK_INTERVAL_MS[source.checkFrequency];
  if (base === null) return null;
  if (!source.enabled) return null;
  const interval = base * backoffMultiplier(source.consecutiveFailures);
  return new Date(from.getTime() + interval);
}

/** Is the source due for a scheduled check at `now`? */
export function isDueForCheck(source: RegulatorySource, now: Date): boolean {
  if (!source.enabled) return false;
  if (source.checkFrequency === "ON_DEMAND") return false;
  if (source.lastCheckedAt === null) return true;
  const next = computeNextCheckAt(source, source.lastCheckedAt);
  if (next === null) return false;
  return now.getTime() >= next.getTime();
}

/** All sources due for a check, in deterministic id order. */
export function selectDueSources(
  sources: RegulatorySource[],
  now: Date,
): RegulatorySource[] {
  return sources
    .filter((s) => isDueForCheck(s, now))
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id));
}

// ─── State transitions from a check result (§26, §27) ───

function nextStatus(
  source: RegulatorySource,
  result: SourceCheckResult,
  consecutiveFailures: number,
): SourceStatus {
  if (source.status === "DISABLED") return "DISABLED";
  if (result.outcome === "INTEGRITY_FAILURE") return "QUARANTINED";
  if (source.status === "QUARANTINED") return "QUARANTINED";
  if (result.outcome === "SOURCE_UNAVAILABLE") {
    return consecutiveFailures >= FAILURE_TOLERANCE ? "UNAVAILABLE" : "DEGRADED";
  }
  if (
    result.outcome === "NO_CHANGE" ||
    result.outcome === "CHANGE_DETECTED" ||
    result.outcome === "FIRST_OBSERVATION"
  ) {
    // A source can only leave UNVERIFIED through operator verification.
    return source.verification ? "HEALTHY" : "UNVERIFIED";
  }
  return source.status;
}

/**
 * Apply a check result to a source, returning the updated source.
 *
 * INVARIANT: a failed check NEVER clears `lastArtifactHash` or invalidates the
 * currently active dataset (§26).
 */
export function applyCheckResult(
  source: RegulatorySource,
  result: SourceCheckResult,
): RegulatorySource {
  const failed =
    result.outcome === "SOURCE_UNAVAILABLE" || result.outcome === "INTEGRITY_FAILURE";
  const consecutiveFailures = failed ? source.consecutiveFailures + 1 : 0;

  const observed = result.observedSha256;
  const succeeded =
    result.outcome === "NO_CHANGE" ||
    result.outcome === "CHANGE_DETECTED" ||
    result.outcome === "FIRST_OBSERVATION";

  return {
    ...source,
    lastCheckedAt: result.checkedAt,
    lastSuccessfulCheckAt: succeeded ? result.checkedAt : source.lastSuccessfulCheckAt,
    lastFailedAt: failed ? result.checkedAt : source.lastFailedAt,
    // Never lose the last known good hash on failure.
    lastArtifactHash: succeeded && observed ? observed : source.lastArtifactHash,
    lastKnownVersion:
      succeeded && result.metadata?.declaredVersion
        ? result.metadata.declaredVersion
        : source.lastKnownVersion,
    consecutiveFailures,
    status: nextStatus(source, result, consecutiveFailures),
    updatedAt: result.checkedAt,
  };
}

/** Quarantine a source after an unexplained/invalid content change (§27). */
export function quarantineSource(
  source: RegulatorySource,
  at: Date,
): RegulatorySource {
  return { ...source, status: "QUARANTINED", updatedAt: at };
}

/** Clear a quarantine. Requires an authenticated operator decision upstream. */
export function releaseQuarantine(
  source: RegulatorySource,
  at: Date,
): RegulatorySource {
  if (source.status !== "QUARANTINED") return source;
  return {
    ...source,
    status: source.verification ? "HEALTHY" : "UNVERIFIED",
    consecutiveFailures: 0,
    updatedAt: at,
  };
}

// ─── Health read model (§39) ───

export function buildSourceHealth(
  source: RegulatorySource,
  lastChangeAt: Date | null,
  now: Date,
): SourceHealth {
  return {
    sourceId: source.id,
    name: source.name,
    authorityTier: source.authorityTier,
    status: source.status,
    enabled: source.enabled,
    lastCheckedAt: source.lastCheckedAt,
    lastSuccessfulCheckAt: source.lastSuccessfulCheckAt,
    lastFailedAt: source.lastFailedAt,
    lastChangeAt,
    lastArtifactSha256: source.lastArtifactHash,
    consecutiveFailures: source.consecutiveFailures,
    nextCheckAt: computeNextCheckAt(source, source.lastCheckedAt ?? now),
  };
}

// ─── In-memory registry container ───

export interface SourceRegistry {
  list(): RegulatorySource[];
  get(id: string): RegulatorySource | undefined;
  upsert(source: RegulatorySource): void;
  byTier(tier: AuthorityTier): RegulatorySource[];
  authoritative(): RegulatorySource[];
}

export function createSourceRegistry(
  initial: RegulatorySource[] = [],
): SourceRegistry {
  const map = new Map<string, RegulatorySource>();
  for (const s of initial) map.set(s.id, s);

  return {
    list: () =>
      Array.from(map.values()).sort((a, b) => a.id.localeCompare(b.id)),
    get: (id) => map.get(id),
    upsert: (source) => {
      map.set(source.id, source);
    },
    byTier: (tier) =>
      Array.from(map.values())
        .filter((s) => s.authorityTier === tier)
        .sort((a, b) => a.id.localeCompare(b.id)),
    authoritative: () =>
      Array.from(map.values())
        .filter((s) => canUpdateAuthoritativeState(s).allowed)
        .sort((a, b) => a.id.localeCompare(b.id)),
  };
}

// ─── Seed registry ───────────────────────────────────────────────────────────
//
// DISCOVERY RESULT (2026-08-22). lcgpa.gov.sa is a Mendix single-page
// application: every path returns the same shell and the content is loaded over
// the Mendix runtime API (`POST /xas/`). The former SharePoint paths
// (`/ar/Regulations/DocumentsLibrary/...`, `/en/Regulations/Docs-Lists/...`,
// `/en/LocalContent/Pages/...`, `/en/eservices/Pages/...`) no longer resolve and
// have been removed from this registry rather than left in place as dead
// monitoring targets.
//
// Published documents are served from `/file?guid=<guid>&changedDate=<epochMs>`.
// That endpoint returns HTTP 401 without a Mendix runtime session, so a fetcher
// monitoring these sources MUST establish a session against `https://lcgpa.gov.sa/`
// and carry its cookies. See docs/regulatory/LCGPA_SOURCE_REGISTRY.md.
//
// The `guid` identifies a document version: when LCGPA republishes a document
// the guid changes. The documents page is therefore monitored by
// DOCUMENT_DISCOVERY to detect a replacement, while each current artifact is
// monitored by FILE_FINGERPRINT to detect an in-place change.

/** Build a canonical Mendix document URL. */
export function lcgpaFileUrl(guid: string, changedDate: number): string {
  return `https://lcgpa.gov.sa/file?guid=${guid}&changedDate=${changedDate}`;
}

export const SEED_SOURCE_INPUTS: CreateSourceInput[] = [
  // ── TIER 1 — LCGPA ──
  {
    id: "lcgpa-mandatory-list-documents",
    authority: "LCGPA",
    name: "LCGPA Mandatory List — documents page",
    description:
      "Official documents page for the Mandatory List of National Products. Verified 2026-08-22: renders eight published documents. Requires a rendering fetcher (Mendix SPA); a plain HTTP GET returns only the application shell.",
    url: "https://lcgpa.gov.sa/#/ar_SA/MandatoryListNationalProducts/Documents",
    sourceType: "WEB_PAGE",
    authorityTier: Tier.REGULATORY_AUTHORITY,
    monitoringMethod: "DOCUMENT_DISCOVERY",
    checkFrequency: "DAILY",
  },
  {
    id: "lcgpa-mandatory-list-government",
    authority: "LCGPA",
    name: "Mandatory List — government entities (July 2026)",
    description:
      "القائمة الإلزامية للجهات الحكومية. Canonical product list applied by government entities. One worksheet per sector; 1,727 products in the July 2026 publication.",
    url: lcgpaFileUrl("8725724278325064", 1785224655483),
    sourceType: "XLSX",
    authorityTier: Tier.REGULATORY_AUTHORITY,
    monitoringMethod: "FILE_FINGERPRINT",
    checkFrequency: "DAILY",
  },
  {
    id: "lcgpa-mandatory-list-state-owned",
    authority: "LCGPA",
    name: "Mandatory List — state-owned companies (July 2026)",
    description:
      "القائمة الإلزامية للشركات المملوكة للدولة. Same product population as the government list in the July 2026 publication, without the price-ceiling and manufacturer-baseline columns.",
    url: lcgpaFileUrl("8725724278324869", 1785224636605),
    sourceType: "XLSX",
    authorityTier: Tier.REGULATORY_AUTHORITY,
    monitoringMethod: "FILE_FINGERPRINT",
    checkFrequency: "DAILY",
  },
  {
    id: "lcgpa-minimum-lc-schedule",
    authority: "LCGPA",
    name: "Minimum local content schedule (July 2026)",
    description:
      "الحد الأدنى لنسبة المحتوى المحلي في شهادة المحتوى المحلي على منتجات القائمة الإلزامية. Multi-year binding minimum percentages, 2026-2031, per product.",
    url: lcgpaFileUrl("8725724278312159", 1785404027587),
    sourceType: "XLSX",
    authorityTier: Tier.REGULATORY_AUTHORITY,
    monitoringMethod: "FILE_FINGERPRINT",
    checkFrequency: "DAILY",
  },
  {
    id: "lcgpa-delivery-instructions",
    authority: "LCGPA",
    name: "Delivery instructions for mandatory-list and price-preference products (2026)",
    description:
      "التعليمات الخاصة بتسليم المنتجات الوطنية المدرجة في القائمة الإلزامية أو المنتجات الوطنية الخاضعة لآلية التفضيل السعري. Procedural instructions; monitored for methodology changes.",
    url: lcgpaFileUrl("8725724278376079", 1783418664349),
    sourceType: "PDF",
    authorityTier: Tier.REGULATORY_AUTHORITY,
    monitoringMethod: "FILE_FINGERPRINT",
    checkFrequency: "WEEKLY",
  },

  // ── TIER 2 — Official government corroboration ──
  {
    id: "spa-lcgpa-announcements",
    authority: "Saudi Press Agency",
    name: "SPA — LCGPA regulatory announcements",
    description:
      "Official state news agency. Corroborates announcements and effective dates. Verified reachable 2026-08-22. Cannot update authoritative state.",
    url: "https://www.spa.gov.sa/en/N2514218",
    sourceType: "ANNOUNCEMENT",
    authorityTier: Tier.OFFICIAL_GOVERNMENT,
    monitoringMethod: "CONTENT_HASH",
    checkFrequency: "DAILY",
  },

  // ── TIER 4 — Third party: DISCOVERY / CROSS-CHECK ONLY (§30) ──
  {
    id: "third-party-trade-alert",
    authority: "Global Trade Alert",
    name: "Global Trade Alert — Saudi local content measures",
    description:
      "Third-party trade policy tracker. EARLY WARNING ONLY. May never modify the product registry, regulatory dataset or computation engine.",
    url: "https://globaltradealert.org/state-act/96585-saudi-arabia-lcgpa-introduces-and-increases-minimum-local-content-requirements-for-government-procurement",
    sourceType: "WEB_PAGE",
    authorityTier: Tier.THIRD_PARTY,
    monitoringMethod: "CONTENT_HASH",
    checkFrequency: "WEEKLY",
  },
];

/** Build the seeded registry. Every TIER 1 entry starts UNVERIFIED. */
export function buildSeedRegistry(clock: Clock): SourceRegistry {
  return createSourceRegistry(
    SEED_SOURCE_INPUTS.map((input) => createSource(input, clock)),
  );
}
