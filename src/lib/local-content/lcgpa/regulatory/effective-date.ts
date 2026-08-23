// ─── LCGPA Regulatory Intelligence :: Effective-Date & Temporal State (§18-§20, §37) ───
//
// FOUR DISTINCT MOMENTS — never conflate them:
//   DETECTED_AT      when the engine noticed
//   PUBLISHED_AT     when the authority published
//   EFFECTIVE_FROM   when the rule begins to bind
//   EFFECTIVE_TO     when it stops binding
//
// A regulation published today may take effect next year. The engine MUST NOT
// apply a future rule to a calculation performed today, and MUST NOT apply
// today's rule to a historical calculation.
//
// There is no implicit "latest". Every resolution requires an explicit `asOf`.

import {
  resolveEffectiveDate,
  type EffectiveDateEvidence,
} from "./effective-date-evidence";
import type {
  RegulatoryChange,
  RegulatoryDataset,
  RegulatoryProduct,
  RegulatoryProvenance,
} from "./types";

/** Dataset states that may be consulted when resolving regulatory truth. */
const RESOLVABLE_STATUSES = new Set<RegulatoryDataset["status"]>([
  "ACTIVE",
  "SUPERSEDED",
]);

function effectiveFromTime(d: RegulatoryDataset): number | null {
  return d.effectiveFrom ? d.effectiveFrom.getTime() : null;
}

/** Is the dataset in force at `asOf`? */
export function isInForce(dataset: RegulatoryDataset, asOf: Date): boolean {
  const from = effectiveFromTime(dataset);
  // A dataset with no stated effective date cannot be asserted to be in force (§45).
  if (from === null) return false;
  if (asOf.getTime() < from) return false;
  if (dataset.effectiveTo && asOf.getTime() >= dataset.effectiveTo.getTime()) return false;
  return true;
}

// ─── Current / future / historical resolution ───

export interface RegulatoryStateResolution {
  /** The dataset in force at `asOf`, or null when none can be asserted. */
  dataset: RegulatoryDataset | null;
  asOf: Date;
  /** Why this dataset was selected, or why none was. */
  rationale: string;
  /** Candidate datasets that were considered, newest effective date first. */
  considered: string[];
}

/**
 * Resolve the regulatory state in force at an explicit instant.
 * NEVER falls back to "the newest dataset" — that would silently apply a future
 * or superseded regime.
 */
export function resolveRegulatoryState(
  datasets: RegulatoryDataset[],
  asOf: Date,
): RegulatoryStateResolution {
  const candidates = datasets
    .filter((d) => RESOLVABLE_STATUSES.has(d.status))
    .filter((d) => isInForce(d, asOf))
    .sort((a, b) => {
      const fa = effectiveFromTime(a) ?? 0;
      const fb = effectiveFromTime(b) ?? 0;
      if (fb !== fa) return fb - fa;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  if (candidates.length === 0) {
    const withoutDates = datasets.filter(
      (d) => RESOLVABLE_STATUSES.has(d.status) && d.effectiveFrom === null,
    );
    return {
      dataset: null,
      asOf,
      rationale:
        withoutDates.length > 0
          ? `NO_STATE_RESOLVED: ${withoutDates.length} dataset(s) exist but state no effective date. Effective dates are never inferred — operator review required.`
          : "NO_STATE_RESOLVED: no dataset was in force at the requested instant.",
      considered: withoutDates.map((d) => d.datasetVersion),
    };
  }

  return {
    dataset: candidates[0],
    asOf,
    rationale: `RESOLVED: ${candidates[0].datasetVersion} effective ${candidates[0].effectiveFrom?.toISOString().slice(0, 10)} is in force at ${asOf.toISOString().slice(0, 10)}.`,
    considered: candidates.map((d) => d.datasetVersion),
  };
}

/** The regulatory state in force right now. */
export function currentRegulatoryState(
  datasets: RegulatoryDataset[],
  now: Date,
): RegulatoryStateResolution {
  return resolveRegulatoryState(datasets, now);
}

/** Approved/published datasets whose effective date has not yet arrived (§19). */
export function futureScheduledStates(
  datasets: RegulatoryDataset[],
  now: Date,
): RegulatoryDataset[] {
  return datasets
    .filter(
      (d) =>
        (d.status === "APPROVED" || d.status === "PUBLISHED" || d.status === "ACTIVE") &&
        d.effectiveFrom !== null &&
        d.effectiveFrom.getTime() > now.getTime(),
    )
    .sort(
      (a, b) =>
        (a.effectiveFrom as Date).getTime() - (b.effectiveFrom as Date).getTime(),
    );
}

// ─── Product-level temporal resolution (§20, §36) ───

export interface ProductStateResolution {
  productCode: string;
  asOf: Date;
  /** Null when no dataset in force states this product. */
  product: RegulatoryProduct | null;
  datasetVersion: string | null;
  ruleVersion: string | null;
  provenance: RegulatoryProvenance | null;
  /** "RESOLVED" | "UNKNOWN" — never a guessed value (§45). */
  outcome: "RESOLVED" | "UNKNOWN";
  rationale: string;
}

/**
 * Resolve one product's regulatory state at an explicit instant.
 * Returns UNKNOWN rather than substituting a value when nothing is in force.
 */
export function resolveProductState(
  datasets: RegulatoryDataset[],
  productCode: string,
  asOf: Date,
): ProductStateResolution {
  const state = resolveRegulatoryState(datasets, asOf);
  if (!state.dataset) {
    return {
      productCode,
      asOf,
      product: null,
      datasetVersion: null,
      ruleVersion: null,
      provenance: null,
      outcome: "UNKNOWN",
      rationale: state.rationale,
    };
  }
  const product =
    state.dataset.products.find((p) => p.productCode === productCode) ?? null;
  if (!product) {
    return {
      productCode,
      asOf,
      product: null,
      datasetVersion: state.dataset.datasetVersion,
      ruleVersion: state.dataset.ruleVersion,
      provenance: state.dataset.provenance,
      outcome: "UNKNOWN",
      rationale: `PRODUCT_NOT_IN_FORCE: ${productCode} is not present in ${state.dataset.datasetVersion}, the dataset in force at ${asOf.toISOString().slice(0, 10)}.`,
    };
  }
  // A product may carry its own effectivity window inside a dataset already in force.
  if (product.effectiveFrom && asOf.getTime() < product.effectiveFrom.getTime()) {
    return {
      productCode,
      asOf,
      product: null,
      datasetVersion: state.dataset.datasetVersion,
      ruleVersion: state.dataset.ruleVersion,
      provenance: state.dataset.provenance,
      outcome: "UNKNOWN",
      rationale: `PRODUCT_NOT_YET_EFFECTIVE: ${productCode} becomes effective ${product.effectiveFrom.toISOString().slice(0, 10)}, after the requested instant.`,
    };
  }
  if (product.effectiveTo && asOf.getTime() >= product.effectiveTo.getTime()) {
    return {
      productCode,
      asOf,
      product: null,
      datasetVersion: state.dataset.datasetVersion,
      ruleVersion: state.dataset.ruleVersion,
      provenance: state.dataset.provenance,
      outcome: "UNKNOWN",
      rationale: `PRODUCT_EXPIRED: ${productCode} ceased to apply on ${product.effectiveTo.toISOString().slice(0, 10)}.`,
    };
  }

  return {
    productCode,
    asOf,
    product,
    datasetVersion: state.dataset.datasetVersion,
    ruleVersion: state.dataset.ruleVersion,
    provenance: state.dataset.provenance,
    outcome: "RESOLVED",
    rationale: state.rationale,
  };
}

// ─── Calculation binding (§20) ───

export interface CalculationResolutionRequest {
  /** The date the calculation is performed FOR. Required — no implicit "latest". */
  calculationDate: Date;
  productCodes: string[];
}

export interface CalculationResolution {
  calculationDate: Date;
  datasetVersion: string | null;
  ruleVersion: string | null;
  products: ProductStateResolution[];
  /** True when every requested product resolved. */
  complete: boolean;
  unresolved: string[];
}

/**
 * Bind a calculation to the exact regulatory versions that applied on its date.
 * @throws when no calculation date is supplied.
 */
export function resolveForCalculation(
  datasets: RegulatoryDataset[],
  request: CalculationResolutionRequest,
): CalculationResolution {
  if (!request.calculationDate || Number.isNaN(request.calculationDate.getTime())) {
    throw new Error(
      "CALCULATION_DATE_REQUIRED: historical calculations must never resolve against an implicit latest dataset",
    );
  }
  const state = resolveRegulatoryState(datasets, request.calculationDate);
  const products = request.productCodes
    .slice()
    .sort()
    .map((code) => resolveProductState(datasets, code, request.calculationDate));
  const unresolved = products
    .filter((p) => p.outcome === "UNKNOWN")
    .map((p) => p.productCode);

  return {
    calculationDate: request.calculationDate,
    datasetVersion: state.dataset?.datasetVersion ?? null,
    ruleVersion: state.dataset?.ruleVersion ?? null,
    products,
    complete: unresolved.length === 0,
    unresolved,
  };
}

// ─── Activation eligibility (§11 of the pipeline, §25) ───

export interface ActivationDecision {
  eligible: boolean;
  reason: string;
  activateAt: Date | null;
  /**
   * Where the effective date came from. `ARTIFACT` means the official file
   * stated it. Anything else means a human put it on record with evidence, and
   * that evidence id travels with the activation.
   */
  basis: "ARTIFACT" | "ARTIFACT_EVIDENCE" | "CORROBORATING_EVIDENCE" | "OPERATOR_EVIDENCE" | "NONE";
  evidenceId: string | null;
}

/**
 * May an approved dataset be activated at `now`?
 *
 * Approval alone is not enough: activation waits for the effective date.
 */
export function evaluateActivation(
  dataset: RegulatoryDataset,
  now: Date,
  evidence: EffectiveDateEvidence[] = [],
): ActivationDecision {
  if (dataset.status !== "APPROVED" && dataset.status !== "PUBLISHED") {
    return {
      eligible: false,
      reason: `NOT_APPROVED: dataset status is ${dataset.status}; only APPROVED or PUBLISHED datasets may be activated`,
      activateAt: null,
      basis: "NONE",
      evidenceId: null,
    };
  }

  // The artifact's own date wins. Failing that, recorded evidence may supply
  // one — but never an assumption.
  let effectiveFrom = dataset.effectiveFrom;
  let basis: ActivationDecision["basis"] = effectiveFrom ? "ARTIFACT" : "NONE";
  let evidenceId: string | null = null;
  let evidenceRationale = "";

  if (effectiveFrom === null && evidence.length > 0) {
    const resolved = resolveEffectiveDate(evidence, {
      datasetVersion: dataset.datasetVersion,
    });
    if (resolved.effectiveFrom && resolved.basis !== "UNKNOWN") {
      effectiveFrom = resolved.effectiveFrom;
      basis = resolved.basis;
      evidenceId = resolved.evidenceId;
      evidenceRationale = ` (${resolved.rationale})`;
    }
  }

  if (effectiveFrom === null) {
    return {
      eligible: false,
      reason:
        "EFFECTIVE_DATE_UNKNOWN: neither the official artifact nor any recorded evidence states when this takes effect. Record EffectiveDateEvidence before activating; do not assume a date.",
      activateAt: null,
      basis: "NONE",
      evidenceId: null,
    };
  }
  if (now.getTime() < effectiveFrom.getTime()) {
    return {
      eligible: false,
      reason: `NOT_YET_EFFECTIVE: scheduled to take effect ${effectiveFrom.toISOString().slice(0, 10)}${evidenceRationale}`,
      activateAt: effectiveFrom,
      basis,
      evidenceId,
    };
  }
  return {
    eligible: true,
    reason: `EFFECTIVE: in force since ${effectiveFrom.toISOString().slice(0, 10)}${evidenceRationale}`,
    activateAt: effectiveFrom,
    basis,
    evidenceId,
  };
}

// ─── Expiry sweep (§18, §25, §50) ───

/**
 * Result of evaluating whether an ACTIVE dataset has expired.
 *
 * An ACTIVE dataset whose `effectiveTo` date has passed is no longer in force.
 * The sweep detects this so the governance gate may quarantine it — the dataset
 * is never silently removed; it is explicitly deactivated with an audit trail.
 */
export interface ExpiryDecision {
  /** Whether this dataset should be expired. */
  expired: boolean;
  /** Human-readable explanation for the decision. */
  reason: string;
  /** The `effectiveTo` date that was breached, if any. */
  effectiveTo: Date | null;
}

/**
 * Is this ACTIVE dataset past its validity window?
 *
 * Returns `expired: false` for non-ACTIVE datasets (they are handled by
 * other lifecycle transitions). Returns `expired: false` when no `effectiveTo`
 * is stated — an open-ended dataset is never assumed to expire (§45).
 */
export function evaluateExpiry(dataset: RegulatoryDataset, now: Date): ExpiryDecision {
  if (dataset.status !== "ACTIVE") {
    return {
      expired: false,
      reason: `NOT_ACTIVE: dataset status is ${dataset.status}; expiry sweep only applies to ACTIVE datasets`,
      effectiveTo: null,
    };
  }
  if (dataset.effectiveTo === null) {
    return {
      expired: false,
      reason: "NO_EXPIRY_DATE: dataset has no stated effectiveTo; it is never assumed to expire (§45)",
      effectiveTo: null,
    };
  }
  if (now.getTime() >= dataset.effectiveTo.getTime()) {
    return {
      expired: true,
      reason: `EXPIRED: effectiveTo ${dataset.effectiveTo.toISOString().slice(0, 10)} has passed as of ${now.toISOString().slice(0, 10)}`,
      effectiveTo: dataset.effectiveTo,
    };
  }
  return {
    expired: false,
    reason: `IN_FORCE: effectiveTo ${dataset.effectiveTo.toISOString().slice(0, 10)} has not yet passed`,
    effectiveTo: dataset.effectiveTo,
  };
}

/**
 * Find all ACTIVE datasets whose `effectiveTo` has passed.
 *
 * Only returns datasets that should be deactivated. Datasets with no stated
 * `effectiveTo` are excluded — open-ended datasets are never silently expired.
 */
export function findExpiredDatasets(
  datasets: RegulatoryDataset[],
  now: Date,
): RegulatoryDataset[] {
  return datasets.filter((d) => evaluateExpiry(d, now).expired);
}

// ─── Timeline (§37) ───

export interface TimelineEntry {
  at: Date;
  kind:
    | "PUBLISHED"
    | "DETECTED"
    | "DIFFED"
    | "REVIEWED"
    | "APPROVED"
    | "REJECTED"
    | "ACTIVATED"
    | "EFFECTIVE"
    | "EXPIRED"
    | "ROLLED_BACK";
  label: string;
  reference: string;
}

/** Merge dataset and change facts into one chronological regulatory timeline. */
export function buildTimeline(
  datasets: RegulatoryDataset[],
  changes: RegulatoryChange[],
): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  for (const d of datasets) {
    if (d.provenance.publicationDate) {
      entries.push({
        at: d.provenance.publicationDate,
        kind: "PUBLISHED",
        label: `LCGPA published ${d.datasetVersion}`,
        reference: d.artifactSha256,
      });
    }
    entries.push({
      at: d.createdAt,
      kind: "DETECTED",
      label: `System normalized ${d.datasetVersion}`,
      reference: d.datasetId,
    });
    if (d.activatedAt) {
      entries.push({
        at: d.activatedAt,
        kind: "ACTIVATED",
        label: `${d.datasetVersion} activated`,
        reference: d.datasetId,
      });
    }
    if (d.effectiveFrom) {
      entries.push({
        at: d.effectiveFrom,
        kind: "EFFECTIVE",
        label: `${d.datasetVersion} takes effect`,
        reference: d.datasetId,
      });
    }
    if (d.deactivatedAt && (d.status === "SUPERSEDED" || d.status === "QUARANTINED" || d.status === "ROLLED_BACK")) {
      entries.push({
        at: d.deactivatedAt,
        kind: "EXPIRED",
        label: `${d.datasetVersion} deactivated (${d.status})`,
        reference: d.datasetId,
      });
    }
  }

  for (const c of changes) {
    entries.push({
      at: c.detectedAt,
      kind: "DIFFED",
      label: `${c.productCode} ${c.changeType}: ${c.oldValue ?? "(none)"} → ${c.newValue ?? "(none)"}`,
      reference: c.changeId,
    });
    if (c.effectiveFrom) {
      entries.push({
        at: c.effectiveFrom,
        kind: "EFFECTIVE",
        label: `${c.productCode} ${c.changeType} becomes effective`,
        reference: c.changeId,
      });
    }
  }

  return entries.sort(
    (a, b) => a.at.getTime() - b.at.getTime() || a.kind.localeCompare(b.kind),
  );
}
