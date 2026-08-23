// ─── LCGPA Regulatory Intelligence :: Effective-date evidence (P0.7, §18, §45) ───
//
// An effective date is a REGULATORY FACT IN ITS OWN RIGHT and must carry its own
// source. It is never copied onto a product because an announcement mentioned it.
//
//   WRONG   product.effectiveFrom = 2026-08-01   // "SPA said August"
//   RIGHT   EffectiveDateEvidence {
//             source: spa-lcgpa-announcements
//             scope: COHORT
//             cohortLabel: "233 products, first tranche"
//             effectiveFrom: 2026-08-01
//             confidence: CORROBORATED
//             evidence: "SPA announcement N2514218, 2026-02-17"
//           }
//
// The second form can be contradicted, superseded and audited. The first cannot.

import { deterministicId } from "./ids";
import type { Clock, RegulatoryDataset, RegulatoryProduct } from "./types";

// ─── Types ───

/** What a piece of evidence speaks about. More specific wins. */
export const EVIDENCE_SCOPES = ["PRODUCT", "COHORT", "DATASET"] as const;
export type EvidenceScope = (typeof EVIDENCE_SCOPES)[number];

/**
 * How much weight the claim carries.
 *
 * VERIFIED     stated by a TIER 1 artifact — LCGPA said it, in the document
 * CORROBORATED stated by an official TIER 2/3 source, not by LCGPA's own artifact
 * ASSERTED     supplied by an operator, with written evidence, because no
 *              artifact states it
 * DISPUTED     contradicted by a higher-confidence source; never applies
 */
/**
 * WHAT the date is the effective date OF.
 *
 * Two dates about different things are not a disagreement. The Mandatory List's
 * `تاريخ التطبيق` says when a product became subject to the list; the schedule's
 * `تاريخ بدء إشتراط الحد الأدنى` says when its minimum local content percentage
 * starts to bind. A product can legitimately carry both, years apart.
 */
export const EFFECTIVE_DATE_KINDS = [
  "MANDATORY_LIST_INCLUSION",
  "MINIMUM_LC_REQUIREMENT",
  "DOCUMENT_PUBLICATION",
  "OTHER",
] as const;
export type EffectiveDateKind = (typeof EFFECTIVE_DATE_KINDS)[number];

/**
 * WHO the requirement binds. LCGPA publishes separate Mandatory Lists for
 * government entities and for state-owned companies; the same product may
 * commence on different dates under each. That is two regimes, not a conflict.
 */
export const REGULATORY_REGIMES = [
  "GOVERNMENT_ENTITIES",
  "STATE_OWNED_COMPANIES",
  "ALL",
] as const;
export type RegulatoryRegime = (typeof REGULATORY_REGIMES)[number];

export const EVIDENCE_CONFIDENCE = [
  "VERIFIED",
  "CORROBORATED",
  "ASSERTED",
  "DISPUTED",
] as const;
export type EvidenceConfidence = (typeof EVIDENCE_CONFIDENCE)[number];

export const CONFIDENCE_RANK: Record<EvidenceConfidence, number> = {
  VERIFIED: 4,
  CORROBORATED: 3,
  ASSERTED: 2,
  DISPUTED: 0,
};

export const SCOPE_RANK: Record<EvidenceScope, number> = {
  PRODUCT: 3,
  COHORT: 2,
  DATASET: 1,
};

export interface EffectiveDateEvidence {
  evidenceId: string;
  sourceId: string;
  /** What this date is the effective date OF. */
  dateKind: EffectiveDateKind;
  /** Who the requirement binds. */
  regime: RegulatoryRegime;
  /** The artifact that states it, when one does. */
  artifactSha256: string | null;
  datasetVersion: string | null;
  scope: EvidenceScope;
  /** Cohort label exactly as published, e.g. "1 أغسطس 2027م". */
  cohortLabel: string | null;
  /** Explicit product codes — only when the source names them. */
  productCodes: string[] | null;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  confidence: EvidenceConfidence;
  /** What the claim rests on: document reference, announcement id, ticket. */
  evidence: string;
  note: string | null;
  recordedById: string;
  recordedAt: Date;
  supersededById: string | null;
  supersededAt: Date | null;
}

// ─── Construction ───

export interface CreateEvidenceInput {
  sourceId: string;
  /** Required — a date with no stated subject cannot be compared to anything. */
  dateKind: EffectiveDateKind;
  /** Defaults to ALL when the source does not distinguish. */
  regime?: RegulatoryRegime;
  artifactSha256?: string | null;
  datasetVersion?: string | null;
  scope: EvidenceScope;
  cohortLabel?: string | null;
  productCodes?: string[] | null;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  confidence: EvidenceConfidence;
  evidence: string;
  note?: string | null;
  recordedById: string;
}

/**
 * Record a claim about when something takes effect.
 * Refuses an unattributed or unevidenced claim — that is the whole point.
 */
export function createEffectiveDateEvidence(
  input: CreateEvidenceInput,
  clock: Clock,
): EffectiveDateEvidence {
  if (!input.recordedById) {
    throw new Error(
      "EVIDENCE_ACTOR_REQUIRED: an effective-date claim must be attributable to a real actor",
    );
  }
  if (!input.evidence || input.evidence.trim() === "") {
    throw new Error(
      "EVIDENCE_REQUIRED: an effective date without a stated source is an assumption, not evidence",
    );
  }
  if (!input.dateKind) {
    throw new Error(
      "EVIDENCE_KIND_REQUIRED: state what this date is the effective date OF; a bare date cannot be compared",
    );
  }
  if (Number.isNaN(input.effectiveFrom.getTime())) {
    throw new Error("EVIDENCE_DATE_INVALID: effectiveFrom is not a valid date");
  }
  if (input.scope === "PRODUCT" && (!input.productCodes || input.productCodes.length === 0)) {
    throw new Error(
      "EVIDENCE_SCOPE_MISMATCH: PRODUCT-scoped evidence must name the product codes it applies to",
    );
  }
  if (input.scope === "COHORT" && !input.cohortLabel) {
    throw new Error(
      "EVIDENCE_SCOPE_MISMATCH: COHORT-scoped evidence must carry the cohort label as published",
    );
  }

  return {
    evidenceId: deterministicId("EDE", [
      input.sourceId,
      input.dateKind,
      input.regime ?? "ALL",
      input.artifactSha256 ?? null,
      input.datasetVersion ?? null,
      input.scope,
      input.cohortLabel ?? null,
      (input.productCodes ?? []).slice().sort().join(","),
      input.effectiveFrom.toISOString(),
      input.confidence,
      input.evidence,
    ]),
    sourceId: input.sourceId,
    dateKind: input.dateKind,
    regime: input.regime ?? "ALL",
    artifactSha256: input.artifactSha256 ?? null,
    datasetVersion: input.datasetVersion ?? null,
    scope: input.scope,
    cohortLabel: input.cohortLabel ?? null,
    productCodes: input.productCodes ? input.productCodes.slice().sort() : null,
    effectiveFrom: input.effectiveFrom,
    effectiveTo: input.effectiveTo ?? null,
    confidence: input.confidence,
    evidence: input.evidence,
    note: input.note ?? null,
    recordedById: input.recordedById,
    recordedAt: clock.now(),
    supersededById: null,
    supersededAt: null,
  };
}

/** Supersede evidence rather than editing or deleting it. */
export function supersedeEvidence(
  existing: EffectiveDateEvidence,
  replacementId: string,
  at: Date,
): EffectiveDateEvidence {
  return { ...existing, supersededById: replacementId, supersededAt: at };
}

// ─── Derivation from a TIER 1 artifact ───

/**
 * Turn what the official artifact itself states into VERIFIED evidence.
 *
 * The Mandatory List states `تاريخ التطبيق` per row and the minimum-LC schedule
 * states `تاريخ بدء إشتراط الحد الأدنى` per row. Those are LCGPA's own words, so
 * they are VERIFIED — but they are still recorded as evidence with a source,
 * not as a bare field nobody can trace.
 *
 * Products sharing a date are grouped into one cohort record.
 */
export function deriveEvidenceFromDataset(
  dataset: RegulatoryDataset,
  clock: Clock,
  options: { dateKind: EffectiveDateKind; regime?: RegulatoryRegime },
): EffectiveDateEvidence[] {
  const byDate = new Map<string, RegulatoryProduct[]>();
  for (const p of dataset.products) {
    if (!p.effectiveFrom) continue;
    const key = p.effectiveFrom.toISOString();
    const list = byDate.get(key) ?? [];
    list.push(p);
    byDate.set(key, list);
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([iso, products]) =>
      createEffectiveDateEvidence(
        {
          sourceId: dataset.sourceId,
          dateKind: options.dateKind,
          regime: options.regime ?? "ALL",
          artifactSha256: dataset.artifactSha256,
          datasetVersion: dataset.datasetVersion,
          scope: "PRODUCT",
          productCodes: products.map((p) => p.productCode),
          effectiveFrom: new Date(iso),
          confidence: "VERIFIED",
          evidence: `Stated per product in ${dataset.provenance.artifactFilename} (sha256 ${dataset.artifactSha256}).`,
          note: `${products.length} product(s) in ${dataset.datasetVersion}.`,
          recordedById: "system:lcgpa-regulatory-monitor",
        },
        clock,
      ),
    );
}

// ─── Resolution ───

export interface EvidenceResolution {
  effectiveFrom: Date | null;
  basis: "ARTIFACT_EVIDENCE" | "OPERATOR_EVIDENCE" | "CORROBORATING_EVIDENCE" | "UNKNOWN";
  evidenceId: string | null;
  confidence: EvidenceConfidence | null;
  rationale: string;
  /** Every candidate considered, most authoritative first. */
  considered: string[];
}

function regimeCompatible(a: RegulatoryRegime, b: RegulatoryRegime): boolean {
  return a === b || a === "ALL" || b === "ALL";
}

function applies(
  e: EffectiveDateEvidence,
  query: {
    datasetVersion?: string | null;
    productCode?: string | null;
    cohortLabel?: string | null;
    dateKind?: EffectiveDateKind;
    regime?: RegulatoryRegime;
  },
): boolean {
  if (e.supersededById !== null) return false;
  if (e.confidence === "DISPUTED") return false;
  if (query.dateKind && e.dateKind !== query.dateKind) return false;
  if (query.regime && !regimeCompatible(e.regime, query.regime)) return false;
  if (e.datasetVersion && query.datasetVersion && e.datasetVersion !== query.datasetVersion) {
    return false;
  }
  if (e.scope === "PRODUCT") {
    return Boolean(query.productCode && e.productCodes?.includes(query.productCode));
  }
  if (e.scope === "COHORT") {
    // A cohort claim applies only where the caller names the same cohort, or
    // where the evidence explicitly lists the product.
    if (query.productCode && e.productCodes?.includes(query.productCode)) return true;
    return Boolean(query.cohortLabel && e.cohortLabel === query.cohortLabel);
  }
  return true; // DATASET scope
}

const BASIS: Record<EvidenceConfidence, EvidenceResolution["basis"]> = {
  VERIFIED: "ARTIFACT_EVIDENCE",
  CORROBORATED: "CORROBORATING_EVIDENCE",
  ASSERTED: "OPERATOR_EVIDENCE",
  DISPUTED: "UNKNOWN",
};

/**
 * Resolve the effective date for a dataset, cohort or product.
 *
 * Precedence: confidence first, then specificity. A VERIFIED dataset-scoped
 * claim outranks an ASSERTED product-scoped one — LCGPA's own words beat an
 * operator's inference, whatever its scope.
 *
 * Returns UNKNOWN rather than a guess.
 */
export function resolveEffectiveDate(
  evidence: EffectiveDateEvidence[],
  query: {
    datasetVersion?: string | null;
    productCode?: string | null;
    cohortLabel?: string | null;
    /** Strongly recommended — without it, unrelated dates compete. */
    dateKind?: EffectiveDateKind;
    regime?: RegulatoryRegime;
  },
): EvidenceResolution {
  const candidates = evidence
    .filter((e) => applies(e, query))
    .sort(
      (a, b) =>
        CONFIDENCE_RANK[b.confidence] - CONFIDENCE_RANK[a.confidence] ||
        SCOPE_RANK[b.scope] - SCOPE_RANK[a.scope] ||
        b.recordedAt.getTime() - a.recordedAt.getTime(),
    );

  if (candidates.length === 0) {
    return {
      effectiveFrom: null,
      basis: "UNKNOWN",
      evidenceId: null,
      confidence: null,
      rationale:
        "NO_EFFECTIVE_DATE_EVIDENCE: nothing on record states when this takes effect. It is not inferred.",
      considered: [],
    };
  }

  const winner = candidates[0];
  return {
    effectiveFrom: winner.effectiveFrom,
    basis: BASIS[winner.confidence],
    evidenceId: winner.evidenceId,
    confidence: winner.confidence,
    rationale: `${winner.confidence} ${winner.scope}-scoped evidence from ${winner.sourceId}: ${winner.evidence}`,
    considered: candidates.map((c) => c.evidenceId),
  };
}

// ─── Contradiction detection ───

export interface EvidenceConflict {
  conflictId: string;
  scopeKey: string;
  a: EffectiveDateEvidence;
  b: EffectiveDateEvidence;
  detail: string;
}

/**
 * Find claims that give DIFFERENT effective dates for the same thing.
 *
 * This is what keeps an announcement from quietly becoming a fact: when SPA
 * says a cohort commences on one date and a later TIER 1 workbook states
 * another, both stay on record and the disagreement is surfaced.
 */
export function detectEvidenceConflicts(
  evidence: EffectiveDateEvidence[],
): EvidenceConflict[] {
  const live = evidence.filter((e) => e.supersededById === null && e.confidence !== "DISPUTED");
  const conflicts: EvidenceConflict[] = [];

  for (let i = 0; i < live.length; i++) {
    for (let j = i + 1; j < live.length; j++) {
      const a = live[i];
      const b = live[j];
      if (a.effectiveFrom.getTime() === b.effectiveFrom.getTime()) continue;
      // Two dates about DIFFERENT things are not a disagreement.
      if (a.dateKind !== b.dateKind) continue;
      // Two dates for DIFFERENT regimes are not a disagreement either.
      if (!regimeCompatible(a.regime, b.regime)) continue;

      // Same cohort label, or overlapping product codes.
      let scopeKey: string | null = null;
      if (a.cohortLabel && a.cohortLabel === b.cohortLabel) {
        scopeKey = `cohort:${a.cohortLabel}`;
      } else if (a.productCodes && b.productCodes) {
        const overlap = a.productCodes.filter((c) => b.productCodes?.includes(c));
        if (overlap.length > 0) scopeKey = `products:${overlap.slice(0, 5).join(",")}`;
      } else if (
        a.scope === "DATASET" &&
        b.scope === "DATASET" &&
        a.datasetVersion &&
        a.datasetVersion === b.datasetVersion
      ) {
        scopeKey = `dataset:${a.datasetVersion}`;
      }
      if (!scopeKey) continue;

      conflicts.push({
        conflictId: deterministicId("EDC", [a.evidenceId, b.evidenceId, scopeKey]),
        scopeKey: `${a.dateKind}/${scopeKey}`,
        a,
        b,
        detail:
          `${a.sourceId} states ${a.effectiveFrom.toISOString().slice(0, 10)} (${a.confidence}); ` +
          `${b.sourceId} states ${b.effectiveFrom.toISOString().slice(0, 10)} (${b.confidence}).`,
      });
    }
  }
  return conflicts;
}

/** Operator-facing rendering. */
export function renderEvidence(e: EffectiveDateEvidence): string {
  return [
    `evidenceId    ${e.evidenceId}`,
    `source        ${e.sourceId}`,
    `dateKind      ${e.dateKind}`,
    `regime        ${e.regime}`,
    `artifact      ${e.artifactSha256 ?? "(none)"}`,
    `scope         ${e.scope}${e.cohortLabel ? ` — ${e.cohortLabel}` : ""}`,
    `products      ${e.productCodes ? `${e.productCodes.length} code(s)` : "(not enumerated)"}`,
    `effectiveFrom ${e.effectiveFrom.toISOString().slice(0, 10)}`,
    `confidence    ${e.confidence}`,
    `evidence      ${e.evidence}`,
    `recordedBy    ${e.recordedById} at ${e.recordedAt.toISOString()}`,
  ].join("\n");
}
