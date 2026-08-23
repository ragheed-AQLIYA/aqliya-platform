// ─── LCGPA Regulatory Intelligence :: Read Model & Explainability (§36, §37, §38) ───
//
// Backend-first read contracts for a future dashboard. No UI is built here.
//
// The central question this module answers is §36:
//   "Why did LocalContentOS use this percentage?"

import type {
  GovernanceCase,
  ImpactLevel,
  RegulatoryAlert,
  RegulatoryChangeEvent,
  RegulatoryDataset,
  RegulatorySource,
  SourceCheckResult,
  SourceHealth,
} from "./types";
import { buildSourceHealth } from "./source-registry";
import {
  currentRegulatoryState,
  futureScheduledStates,
  resolveProductState,
  type ProductStateResolution,
  type RegulatoryStateResolution,
} from "./effective-date";

// ─── Explainability (§36) ───

export interface RegulatoryExplanation {
  productCode: string;
  asOf: Date;
  field: string;
  value: string | null;
  outcome: "RESOLVED" | "UNKNOWN";
  sourceAuthority: string | null;
  sourceUrl: string | null;
  documentVersion: string | null;
  datasetVersion: string | null;
  artifactSha256: string | null;
  artifactFilename: string | null;
  publicationDate: Date | null;
  effectiveFrom: Date | null;
  previousValue: string | null;
  changeEventId: string | null;
  approval: {
    approvedById: string;
    approvedAt: Date;
    automatic: boolean;
    policyId: string | null;
  } | null;
  ruleVersion: string | null;
  parserVersion: string | null;
  schemaVersion: string | null;
  rationale: string;
}

export interface ExplainInput {
  datasets: RegulatoryDataset[];
  productCode: string;
  /** Which normalized field to explain. Defaults to the minimum LC percentage. */
  field?: "minimumLcPct" | "sectorCode" | "category" | "regulatoryStatus" | "hsCode";
  asOf: Date;
  /** Change journal, used to name the change event that produced the value. */
  journal?: RegulatoryChangeEvent[];
  /** Governance cases, used to attribute the approval. */
  cases?: GovernanceCase[];
}

/**
 * Reconstruct the full evidence chain behind a regulatory value.
 * Returns UNKNOWN with a rationale rather than substituting a value (§45).
 */
export function explainRegulatoryValue(input: ExplainInput): RegulatoryExplanation {
  const field = input.field ?? "minimumLcPct";
  const resolution: ProductStateResolution = resolveProductState(
    input.datasets,
    input.productCode,
    input.asOf,
  );

  if (resolution.outcome === "UNKNOWN" || !resolution.product) {
    return {
      productCode: input.productCode,
      asOf: input.asOf,
      field,
      value: null,
      outcome: "UNKNOWN",
      sourceAuthority: null,
      sourceUrl: null,
      documentVersion: null,
      datasetVersion: resolution.datasetVersion,
      artifactSha256: null,
      artifactFilename: null,
      publicationDate: null,
      effectiveFrom: null,
      previousValue: null,
      changeEventId: null,
      approval: null,
      ruleVersion: resolution.ruleVersion,
      parserVersion: null,
      schemaVersion: null,
      rationale: resolution.rationale,
    };
  }

  const dataset = input.datasets.find(
    (d) => d.datasetVersion === resolution.datasetVersion,
  );
  const provenance = dataset?.provenance ?? null;
  const raw = resolution.product[field];
  const value = raw === null || raw === undefined ? null : String(raw);

  // Previous value: the newest superseded dataset that states this product.
  const previousDataset = input.datasets
    .filter(
      (d) =>
        d.status === "SUPERSEDED" &&
        d.datasetVersion !== resolution.datasetVersion &&
        d.effectiveFrom !== null,
    )
    .sort(
      (a, b) => (b.effectiveFrom as Date).getTime() - (a.effectiveFrom as Date).getTime(),
    )[0];
  const previousProduct = previousDataset?.products.find(
    (p) => p.productCode === input.productCode,
  );
  const previousRaw = previousProduct ? previousProduct[field] : undefined;
  const previousValue =
    previousRaw === null || previousRaw === undefined ? null : String(previousRaw);

  const event =
    input.journal?.find((e) => e.datasetVersion === resolution.datasetVersion) ?? null;
  const governanceCase =
    input.cases?.find((c) => c.datasetVersion === resolution.datasetVersion) ?? null;

  return {
    productCode: input.productCode,
    asOf: input.asOf,
    field,
    value,
    outcome: "RESOLVED",
    sourceAuthority: provenance?.sourceAuthority ?? null,
    sourceUrl: provenance?.sourceUrl ?? null,
    documentVersion: provenance?.documentVersion ?? null,
    datasetVersion: resolution.datasetVersion,
    artifactSha256: provenance?.artifactSha256 ?? null,
    artifactFilename: provenance?.artifactFilename ?? null,
    publicationDate: provenance?.publicationDate ?? null,
    effectiveFrom: resolution.product.effectiveFrom ?? dataset?.effectiveFrom ?? null,
    previousValue,
    changeEventId: event?.eventId ?? null,
    approval: governanceCase?.approval
      ? {
          approvedById: governanceCase.approval.approvedById,
          approvedAt: governanceCase.approval.approvedAt,
          automatic: governanceCase.approval.automatic,
          policyId: governanceCase.approval.policyId,
        }
      : null,
    ruleVersion: resolution.ruleVersion,
    parserVersion: dataset?.parserVersion ?? null,
    schemaVersion: dataset?.schemaVersion ?? null,
    rationale: resolution.rationale,
  };
}

/** Operator-facing rendering of §36. */
export function renderExplanation(e: RegulatoryExplanation): string {
  return [
    `Product:          ${e.productCode}`,
    `Field:            ${e.field}`,
    `Value:            ${e.value ?? "UNKNOWN"}`,
    `Source Authority: ${e.sourceAuthority ?? "(none)"}`,
    `Source URL:       ${e.sourceUrl ?? "(none)"}`,
    `Document:         ${e.documentVersion ?? "(none)"}`,
    `Dataset:          ${e.datasetVersion ?? "(none)"}`,
    `Artifact SHA-256: ${e.artifactSha256 ?? "(none)"}`,
    `Effective:        ${e.effectiveFrom ? e.effectiveFrom.toISOString().slice(0, 10) : "(not stated)"}`,
    `Previous:         ${e.previousValue ?? "(none)"}`,
    `Change Event:     ${e.changeEventId ?? "(none)"}`,
    `Approval:         ${e.approval ? `${e.approval.approvedById} at ${e.approval.approvedAt.toISOString()}${e.approval.automatic ? ` (auto, ${e.approval.policyId})` : ""}` : "(none)"}`,
    `Rule Version:     ${e.ruleVersion ?? "(none)"}`,
    `Parser Version:   ${e.parserVersion ?? "(none)"}`,
    `Rationale:        ${e.rationale}`,
  ].join("\n");
}

// ─── Dashboard read model (§38) ───

export interface MonitoringHealth {
  totalSources: number;
  enabledSources: number;
  healthy: number;
  degraded: number;
  unavailable: number;
  quarantined: number;
  unverified: number;
  /** TIER 1 sources that are still awaiting operator verification. */
  authoritativeSourcesAwaitingVerification: string[];
}

export interface PipelineFailure {
  sourceId: string;
  at: Date;
  errorCode: string;
  errorMessage: string | null;
  attemptCount: number;
}

export interface RegulatoryReadModel {
  generatedAt: Date;
  currentState: RegulatoryStateResolution;
  futureChanges: RegulatoryDataset[];
  recentChanges: RegulatoryChangeEvent[];
  pendingReviews: GovernanceCase[];
  highImpactChanges: RegulatoryChangeEvent[];
  sourceHealth: SourceHealth[];
  monitoringHealth: MonitoringHealth;
  openAlerts: RegulatoryAlert[];
  dataPipelineFailures: PipelineFailure[];
}

export interface BuildReadModelInput {
  sources: RegulatorySource[];
  datasets: RegulatoryDataset[];
  journal: RegulatoryChangeEvent[];
  cases: GovernanceCase[];
  alerts: RegulatoryAlert[];
  checks: SourceCheckResult[];
  now: Date;
  /** How many recent change events to include. Defaults to 20. */
  recentLimit?: number;
}

const HIGH_IMPACT: ImpactLevel[] = ["HIGH", "CRITICAL"];

export function buildReadModel(input: BuildReadModelInput): RegulatoryReadModel {
  const { sources, datasets, journal, cases, alerts, checks, now } = input;
  const limit = input.recentLimit ?? 20;

  const lastChangeBySource = new Map<string, Date>();
  for (const e of journal) {
    const prev = lastChangeBySource.get(e.sourceId);
    if (!prev || e.detectedAt.getTime() > prev.getTime()) {
      lastChangeBySource.set(e.sourceId, e.detectedAt);
    }
  }

  const health = sources
    .map((s) => buildSourceHealth(s, lastChangeBySource.get(s.id) ?? null, now))
    .sort((a, b) => a.sourceId.localeCompare(b.sourceId));

  const monitoringHealth: MonitoringHealth = {
    totalSources: sources.length,
    enabledSources: sources.filter((s) => s.enabled).length,
    healthy: sources.filter((s) => s.status === "HEALTHY").length,
    degraded: sources.filter((s) => s.status === "DEGRADED").length,
    unavailable: sources.filter((s) => s.status === "UNAVAILABLE").length,
    quarantined: sources.filter((s) => s.status === "QUARANTINED").length,
    unverified: sources.filter((s) => s.status === "UNVERIFIED").length,
    authoritativeSourcesAwaitingVerification: sources
      .filter((s) => s.authorityTier === 1 && s.verification === null)
      .map((s) => s.id)
      .sort(),
  };

  const dataPipelineFailures: PipelineFailure[] = checks
    .filter(
      (c) => c.outcome === "SOURCE_UNAVAILABLE" || c.outcome === "INTEGRITY_FAILURE",
    )
    .map((c) => ({
      sourceId: c.sourceId,
      at: c.checkedAt,
      errorCode: c.errorCode ?? "UNKNOWN",
      errorMessage: c.errorMessage,
      attemptCount: c.attemptCount,
    }))
    .sort((a, b) => b.at.getTime() - a.at.getTime());

  const recentChanges = journal
    .slice()
    .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime())
    .slice(0, limit);

  return {
    generatedAt: now,
    currentState: currentRegulatoryState(datasets, now),
    futureChanges: futureScheduledStates(datasets, now),
    recentChanges,
    pendingReviews: cases
      .filter((c) => c.state === "PENDING_REVIEW")
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
    highImpactChanges: journal
      .filter((e) => e.impactLevel !== null && HIGH_IMPACT.includes(e.impactLevel))
      .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime()),
    sourceHealth: health,
    monitoringHealth,
    openAlerts: alerts
      .filter((a) => a.status === "OPEN")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    dataPipelineFailures,
  };
}
