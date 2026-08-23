// ─── LCGPA Regulatory Intelligence :: Alert Engine (§23, §30) ───
//
// Alerts carry evidence, not adjectives. Every alert states the artifact hash
// and the values that substantiate it, plus the action a reviewer should take.
//
// TIER 4 (third-party) signals produce POSSIBLE_CHANGE_DETECTED only. They can
// never assert a regulatory change — they open an investigation (§30).

import type {
  AlertCategory,
  ChangeSeverity,
  Clock,
  ImpactLevel,
  RegulatoryAlert,
  RegulatoryChange,
  RegulatoryConflict,
  RegulatoryDiff,
  RegulatoryImpactAssessment,
  RegulatorySource,
  SourceCheckResult,
} from "./types";
import { deterministicId } from "./ids";
import { describeChange } from "./semantic-diff";
import { isDiscoveryOnly } from "./source-registry";

// ─── Category mapping ───

const CHANGE_TYPE_TO_CATEGORY: Partial<Record<RegulatoryChange["changeType"], AlertCategory>> = {
  PRODUCT_ADDED: "PRODUCT_ADDED",
  PRODUCT_REMOVED: "PRODUCT_REMOVED",
  PRODUCT_RESTORED: "PRODUCT_CHANGED",
  MINIMUM_LC_CHANGED: "MINIMUM_LC_CHANGED",
  EFFECTIVE_DATE_CHANGED: "EFFECTIVE_DATE_CHANGED",
  EXPIRY_DATE_CHANGED: "EFFECTIVE_DATE_CHANGED",
};

function categoryFor(change: RegulatoryChange): AlertCategory {
  return CHANGE_TYPE_TO_CATEGORY[change.changeType] ?? "PRODUCT_CHANGED";
}

const RECOMMENDED_ACTION: Record<AlertCategory, string> = {
  NEW_REGULATION:
    "Review the official publication, confirm the effective date, then route the change set for approval.",
  DOCUMENT_UPDATED:
    "Compare the new artifact against the previous version and confirm whether the regulatory content changed.",
  PRODUCT_ADDED:
    "Confirm the new product against the official artifact and assess supplier and spend coverage before activation.",
  PRODUCT_REMOVED:
    "Confirm removal against the official artifact; re-check any calculation that relied on this product being mandatory.",
  PRODUCT_CHANGED:
    "Review the field-level diff against the official artifact and approve or reject.",
  MINIMUM_LC_CHANGED:
    "Re-run affected calculations against the new minimum before the effective date; notify affected suppliers.",
  EFFECTIVE_DATE_CHANGED:
    "Re-check the activation schedule; confirm no calculation has been produced under the wrong regime.",
  SOURCE_UNAVAILABLE:
    "Investigate connectivity to the official source. The currently active dataset remains in force and must not be invalidated.",
  SOURCE_AUTHENTICATION_FAILURE:
    "Verify credentials or access policy for the official source; do not substitute a third-party source.",
  PARSING_FAILURE:
    "Investigate the parser against the exact artifact hash. Do NOT mark the regulatory dataset as updated.",
  DATA_VALIDATION_FAILURE:
    "Inspect the failing records against the official artifact; the dataset must not be activated.",
  REGULATORY_CONFLICT:
    "Two official sources disagree. Do not select one. Escalate to regulatory review with both artifacts.",
  IMPACT_HIGH:
    "Escalate to regulatory review; notify owners of affected calculations, tenders and contracts.",
  POSSIBLE_CHANGE_DETECTED:
    "Third-party signal only. Search the official LCGPA sources for confirmation. Do NOT update any registry from this signal.",
};

// ─── Builders ───

function build(params: {
  category: AlertCategory;
  severity: ChangeSeverity;
  sourceId: string;
  changeId: string | null;
  summary: string;
  evidence: string[];
  effectiveDate: Date | null;
  impactLevel: ImpactLevel | null;
  clock: Clock;
}): RegulatoryAlert {
  return {
    alertId: deterministicId("ALERT", [
      params.category,
      params.sourceId,
      params.changeId,
      params.summary,
    ]),
    category: params.category,
    severity: params.severity,
    sourceId: params.sourceId,
    changeId: params.changeId,
    summary: params.summary,
    evidence: params.evidence,
    effectiveDate: params.effectiveDate,
    impactLevel: params.impactLevel,
    recommendedAction: RECOMMENDED_ACTION[params.category],
    createdAt: params.clock.now(),
    status: "OPEN",
  };
}

export interface DiffAlertInput {
  source: RegulatorySource;
  diff: RegulatoryDiff;
  impact: RegulatoryImpactAssessment | null;
  clock: Clock;
  /** Only raise alerts at or above this severity. Defaults to MEDIUM. */
  minSeverity?: ChangeSeverity;
}

const SEVERITY_RANK: Record<ChangeSeverity, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

/**
 * Alerts for a diff.
 *
 * A TIER 4 source yields exactly one POSSIBLE_CHANGE_DETECTED alert regardless
 * of what it appears to say (§30).
 */
export function buildDiffAlerts(input: DiffAlertInput): RegulatoryAlert[] {
  const { source, diff, impact, clock } = input;

  if (isDiscoveryOnly(source)) {
    return [
      build({
        category: "POSSIBLE_CHANGE_DETECTED",
        severity: "LOW",
        sourceId: source.id,
        changeId: null,
        summary: `Third-party source "${source.name}" reports ${diff.changes.length} potential regulatory difference(s). Official verification required.`,
        evidence: [
          `source=${source.url}`,
          `authorityTier=${source.authorityTier}`,
          `changes=${diff.changes.length}`,
        ],
        effectiveDate: null,
        impactLevel: null,
        clock,
      }),
    ];
  }

  // A baseline is one event, not one alert per product (§23).
  if (diff.isBaseline) {
    return [
      build({
        category: "NEW_REGULATION",
        severity: "MEDIUM",
        sourceId: source.id,
        changeId: null,
        summary: `Baseline established for "${source.name}": ${diff.summary.productsAfter} product(s) recorded from the first observed artifact. This is the existing regulatory state, not a change.`,
        evidence: [
          `artifactAfter=${diff.changes[0]?.sourceArtifactAfter ?? "(none)"}`,
          `datasetAfter=${diff.datasetAfter}`,
          `products=${diff.summary.productsAfter}`,
        ],
        effectiveDate: null,
        impactLevel: impact?.impactLevel ?? null,
        clock,
      }),
    ];
  }

  const threshold = SEVERITY_RANK[input.minSeverity ?? "MEDIUM"];
  const alerts: RegulatoryAlert[] = diff.changes
    .filter((c) => SEVERITY_RANK[c.severity] >= threshold)
    .map((change) =>
      build({
        category: categoryFor(change),
        severity: change.severity,
        sourceId: source.id,
        changeId: change.changeId,
        summary: describeChange(change),
        evidence: [
          `artifactBefore=${change.sourceArtifactBefore ?? "(none)"}`,
          `artifactAfter=${change.sourceArtifactAfter}`,
          `datasetBefore=${change.datasetBefore}`,
          `datasetAfter=${change.datasetAfter}`,
          `severityRationale=${change.severityRationale}`,
        ],
        effectiveDate: change.effectiveFrom,
        impactLevel: impact?.impactLevel ?? null,
        clock,
      }),
    );

  if (impact && (impact.impactLevel === "HIGH" || impact.impactLevel === "CRITICAL")) {
    const s = impact.estimatedScope;
    alerts.push(
      build({
        category: "IMPACT_HIGH",
        severity: impact.impactLevel === "CRITICAL" ? "CRITICAL" : "HIGH",
        sourceId: source.id,
        changeId: null,
        summary: `${impact.impactLevel} impact: ${impact.affectedProducts.length} product(s), ${s.calculations} calculation(s), ${s.tenders} tender(s), ${s.suppliers} supplier(s).`,
        evidence: [`diffId=${impact.diffId}`, `impactId=${impact.impactId}`, impact.rationale],
        effectiveDate: null,
        impactLevel: impact.impactLevel,
        clock,
      }),
    );
  }

  return alerts.sort((a, b) => a.alertId.localeCompare(b.alertId));
}

/** Alert for a failed or degraded source check (§26). */
export function buildSourceFailureAlert(
  source: RegulatorySource,
  result: SourceCheckResult,
  clock: Clock,
): RegulatoryAlert | null {
  if (result.outcome !== "SOURCE_UNAVAILABLE" && result.outcome !== "INTEGRITY_FAILURE") {
    return null;
  }
  const isAuth = result.httpStatus === 401 || result.httpStatus === 403;
  const category: AlertCategory = isAuth
    ? "SOURCE_AUTHENTICATION_FAILURE"
    : "SOURCE_UNAVAILABLE";
  return build({
    category,
    severity: source.authorityTier === 1 ? "HIGH" : "MEDIUM",
    sourceId: source.id,
    changeId: null,
    summary: `${source.name}: ${result.errorCode ?? "unknown error"} on attempt ${result.attemptCount}. Active dataset remains in force.`,
    evidence: [
      `url=${source.url}`,
      `httpStatus=${result.httpStatus ?? "(none)"}`,
      `error=${result.errorMessage ?? "(none)"}`,
      `retryAt=${result.nextCheckAt ? result.nextCheckAt.toISOString() : "(not scheduled)"}`,
    ],
    effectiveDate: null,
    impactLevel: null,
    clock,
  });
}

/** Alert for a parser failure (§28). The dataset must NOT be marked updated. */
export function buildParserFailureAlert(
  source: RegulatorySource,
  artifactSha256: string,
  artifactFilename: string,
  parserError: string,
  clock: Clock,
): RegulatoryAlert {
  return build({
    category: "PARSING_FAILURE",
    severity: "HIGH",
    sourceId: source.id,
    changeId: null,
    summary: `REGULATORY_DATA_PIPELINE_FAILURE: artifact acquired and source verified, but parsing failed for ${artifactFilename}.`,
    evidence: [
      `artifactSha256=${artifactSha256}`,
      `artifactFilename=${artifactFilename}`,
      `parserError=${parserError}`,
      "datasetUpdated=false",
    ],
    effectiveDate: null,
    impactLevel: null,
    clock,
  });
}

/** Alert for an integrity/validation failure that quarantined an artifact (§27). */
export function buildValidationFailureAlert(
  source: RegulatorySource,
  artifactSha256: string,
  errors: string[],
  clock: Clock,
): RegulatoryAlert {
  return build({
    category: "DATA_VALIDATION_FAILURE",
    severity: "HIGH",
    sourceId: source.id,
    changeId: null,
    summary: `Artifact from ${source.name} failed validation and was QUARANTINED (${errors.length} error(s)).`,
    evidence: [`artifactSha256=${artifactSha256}`, ...errors],
    effectiveDate: null,
    impactLevel: null,
    clock,
  });
}

/** Alert for contradictory official sources (§29). */
export function buildConflictAlert(
  conflict: RegulatoryConflict,
  clock: Clock,
): RegulatoryAlert {
  return build({
    category: "REGULATORY_CONFLICT",
    severity: "CRITICAL",
    sourceId: conflict.sourceAId,
    changeId: null,
    summary: `Official sources disagree on ${conflict.productCode}: ${conflict.conflictingFields.map((f) => f.field).join(", ")}.`,
    evidence: [
      `sourceA=${conflict.sourceAId}`,
      `sourceB=${conflict.sourceBId}`,
      `artifactA=${conflict.artifactAHash}`,
      `artifactB=${conflict.artifactBHash}`,
      ...conflict.conflictingFields.map(
        (f) => `${f.field}: A=${f.valueA ?? "(none)"} B=${f.valueB ?? "(none)"}`,
      ),
    ],
    effectiveDate: null,
    impactLevel: null,
    clock,
  });
}
