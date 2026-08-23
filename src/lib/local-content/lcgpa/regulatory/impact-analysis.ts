// ─── LCGPA Regulatory Intelligence :: Impact Analysis (§21, §22) ───
//
// A detected change is not an alert. It is a question:
//   "What in LocalContentOS is affected, and how much of it?"
//
// Counts are RESOLVED FROM THE DATABASE through the injected `ImpactResolver`.
// This module never invents, estimates or extrapolates a count (§22, §45).

import type {
  AffectedEntities,
  ChangeSeverity,
  Clock,
  ImpactLevel,
  ImpactResolver,
  RegulatoryChange,
  RegulatoryDiff,
  RegulatoryImpactAssessment,
} from "./types";
import { deterministicId } from "./ids";
import { highestSeverity, SEVERITY_ORDER } from "./change-classification";

export const EMPTY_AFFECTED: AffectedEntities = {
  calculationIds: [],
  projectIds: [],
  tenderIds: [],
  supplierIds: [],
  contractIds: [],
  reportIds: [],
  complianceAssessmentIds: [],
};

const IMPACT_ORDER: Record<ImpactLevel, number> = {
  NONE: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

function maxImpact(a: ImpactLevel, b: ImpactLevel): ImpactLevel {
  return IMPACT_ORDER[a] >= IMPACT_ORDER[b] ? a : b;
}

function totalAffected(a: AffectedEntities): number {
  return (
    a.calculationIds.length +
    a.projectIds.length +
    a.tenderIds.length +
    a.supplierIds.length +
    a.contractIds.length +
    a.reportIds.length +
    a.complianceAssessmentIds.length
  );
}

// ─── Impact policy ───

/**
 * Impact level policy.
 *
 * Two inputs decide it, and both are explained in the rationale:
 *   1. the highest CHANGE SEVERITY in the set  (how bad is the change)
 *   2. the BLAST RADIUS resolved from the database (how much is touched)
 *
 * A CRITICAL change with zero affected entities is still at least MEDIUM: the
 * regulation changed even if nothing in this tenant is touched yet.
 */
export function deriveImpactLevel(
  severity: ChangeSeverity,
  affected: AffectedEntities,
): { level: ImpactLevel; rationale: string } {
  const touched = totalAffected(affected);

  let bySeverity: ImpactLevel;
  if (severity === "CRITICAL") bySeverity = "HIGH";
  else if (severity === "HIGH") bySeverity = "MEDIUM";
  else if (severity === "MEDIUM") bySeverity = "LOW";
  else bySeverity = "LOW";

  let byRadius: ImpactLevel;
  if (touched === 0) byRadius = "NONE";
  else if (touched <= 5) byRadius = "LOW";
  else if (touched <= 25) byRadius = "MEDIUM";
  else if (touched <= 100) byRadius = "HIGH";
  else byRadius = "CRITICAL";

  // Live calculations and contracts carry more weight than passive records.
  const bindingTouched =
    affected.calculationIds.length +
    affected.contractIds.length +
    affected.tenderIds.length;
  const bindingBoost: ImpactLevel =
    bindingTouched === 0 ? "NONE" : bindingTouched <= 5 ? "MEDIUM" : "HIGH";

  let level = maxImpact(maxImpact(bySeverity, byRadius), bindingBoost);

  // A CRITICAL change never resolves below MEDIUM even with an empty radius.
  if (severity === "CRITICAL" && IMPACT_ORDER[level] < IMPACT_ORDER.MEDIUM) {
    level = "MEDIUM";
  }
  // Nothing touched and nothing severe: genuinely no impact.
  if (touched === 0 && SEVERITY_ORDER[severity] <= SEVERITY_ORDER.LOW) {
    level = "NONE";
  }

  const rationale = [
    `highest change severity ${severity} → ${bySeverity}`,
    `blast radius ${touched} entit${touched === 1 ? "y" : "ies"} → ${byRadius}`,
    `binding entities (calculations+contracts+tenders) ${bindingTouched} → ${bindingBoost}`,
    `resolved impact ${level}`,
  ].join("; ");

  return { level, rationale };
}

// ─── Assessment ───

export interface AnalyzeImpactInput {
  diff: RegulatoryDiff;
  resolver: ImpactResolver;
  clock: Clock;
  /** Restrict analysis to a subset of changes (e.g. one product). */
  changeFilter?: (change: RegulatoryChange) => boolean;
}

/**
 * Produce a full impact assessment for a diff.
 * Every count in `estimatedScope` is derived from `affected` — never invented.
 */
export async function analyzeImpact(
  input: AnalyzeImpactInput,
): Promise<RegulatoryImpactAssessment> {
  const { diff, resolver, clock } = input;
  const changes = input.changeFilter
    ? diff.changes.filter(input.changeFilter)
    : diff.changes;

  const affectedProducts = Array.from(
    new Set(changes.map((c) => c.productCode)),
  ).sort();

  const affected =
    affectedProducts.length > 0
      ? await resolver.findAffected(affectedProducts)
      : EMPTY_AFFECTED;

  const severity = highestSeverity(changes.map((c) => c.severity));
  const { level, rationale } = deriveImpactLevel(severity, affected);

  const estimatedScope = {
    calculations: affected.calculationIds.length,
    projects: affected.projectIds.length,
    tenders: affected.tenderIds.length,
    suppliers: affected.supplierIds.length,
    contracts: affected.contractIds.length,
    reports: affected.reportIds.length,
    complianceAssessments: affected.complianceAssessmentIds.length,
  };

  return {
    impactId: deterministicId("IMP", [
      diff.diffId,
      affectedProducts.join(","),
      severity,
      level,
    ]),
    changeIds: changes.map((c) => c.changeId).sort(),
    diffId: diff.diffId,
    impactLevel: changes.length === 0 ? "NONE" : level,
    affectedProducts,
    affected,
    estimatedScope,
    requiresReview: changes.length > 0 && level !== "NONE",
    computedAt: clock.now(),
    rationale:
      changes.length === 0
        ? "NO_CHANGES: diff contained no semantic changes."
        : rationale,
  };
}

/** Rendering used by the reviewer UI and the change journal (§22). */
export function renderImpactSummary(
  assessment: RegulatoryImpactAssessment,
): string {
  const s = assessment.estimatedScope;
  const lines = [
    `Impact: ${assessment.impactLevel}`,
    `Products: ${assessment.affectedProducts.length}`,
    `Affected: ${s.calculations} calculations, ${s.projects} projects, ${s.tenders} tenders, ${s.suppliers} suppliers, ${s.contracts} contracts, ${s.reports} reports, ${s.complianceAssessments} compliance assessments`,
    `Review: ${assessment.requiresReview ? "REQUIRED" : "NOT REQUIRED"}`,
  ];
  return lines.join("\n");
}

/**
 * A resolver that reports nothing affected.
 * Used only where the application has explicitly determined there is no data to
 * search; it must never stand in for an unavailable database.
 */
export const nullImpactResolver: ImpactResolver = {
  async findAffected() {
    return { ...EMPTY_AFFECTED };
  },
};
