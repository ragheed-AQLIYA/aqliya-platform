// ─── LCGPA Regulatory Intelligence :: Pipeline Orchestrator (§25, §53) ───
//
//   OFFICIAL LCGPA → SOURCE MONITOR → CHANGE DETECTED → ARTIFACT CAPTURE
//   → SHA-256 + PROVENANCE → SEMANTIC DIFF → IMPACT ANALYSIS
//   → GOVERNANCE GATE → APPROVE | REJECT → VERSIONED REGULATORY STATE
//   → CURRENT | FUTURE → LCGPA ENGINE → AUDITABLE RESULT
//
// The pipeline stops at the first blocker and reports it. It never advances a
// change into production state on its own: it ends at PENDING_REVIEW (or
// AUTO_APPROVED where a policy explicitly permits it). Activation is a separate,
// deliberate call.

import type {
  Clock,
  GovernanceCase,
  ImpactResolver,
  RegulatoryAlert,
  RegulatoryArtifact,
  RegulatoryAuditEvent,
  RegulatoryChangeEvent,
  RegulatoryDataset,
  RegulatoryDiff,
  RegulatoryFetcher,
  RegulatoryImpactAssessment,
  RegulatorySource,
  SourceCheckResult,
} from "./types";
import {
  acquireArtifact,
  buildProvenance,
  canArtifactUpdateAuthority,
  createArtifactStore,
  validateProvenance,
  type ArtifactStore,
} from "./artifact-store";
import {
  buildDiffAlerts,
  buildParserFailureAlert,
  buildSourceFailureAlert,
  buildValidationFailureAlert,
} from "./alerts";
import { createAuditTrail, createChangeJournal, type AuditTrail, type ChangeJournal } from "./change-journal";
import { analyzeImpact } from "./impact-analysis";
import {
  createGovernanceCase,
  DEFAULT_AUTO_APPROVAL_POLICY,
  autoApproveCase,
  evaluateAutoApproval,
  requestReview,
  SYSTEM_PRINCIPAL,
  transitionCase,
} from "./governance";
import {
  createMetricsRecorder,
  recordAlerts,
  recordArtifactAcquired,
  recordCheck,
  recordDiff,
  recordImpact,
  recordParseFailure,
  recordValidationFailure,
  type MetricsRecorder,
} from "./observability";
import { createParserRegistry, runParser, type ParserRegistry } from "./parser";
import { computeSemanticDiff } from "./semantic-diff";
import { runMonitorCycle } from "./source-monitor";
import { canUpdateAuthoritativeState } from "./source-registry";
import {
  ACTIVE_RULE_VERSION,
  createDataset,
  createDatasetStore,
  createDocument,
  createDocumentVersion,
  deriveDatasetVersion,
  type DatasetStore,
} from "./versioning";
import type { AutoApprovalPolicy } from "./types";

// ─── Engine context ───

export interface RegulatoryEngineContext {
  fetcher: RegulatoryFetcher;
  clock: Clock;
  impactResolver: ImpactResolver;
  parsers: ParserRegistry;
  artifacts: ArtifactStore;
  datasets: DatasetStore;
  journal: ChangeJournal;
  audit: AuditTrail;
  metrics: MetricsRecorder;
  autoApprovalPolicy: AutoApprovalPolicy;
  /** Named principal recorded as the actor for automated steps. */
  systemPrincipal: string;
}

export interface CreateContextInput {
  fetcher: RegulatoryFetcher;
  clock: Clock;
  impactResolver: ImpactResolver;
  parsers?: ParserRegistry;
  autoApprovalPolicy?: AutoApprovalPolicy;
  systemPrincipal?: string;
}

export function createRegulatoryEngineContext(
  input: CreateContextInput,
): RegulatoryEngineContext {
  return {
    fetcher: input.fetcher,
    clock: input.clock,
    impactResolver: input.impactResolver,
    parsers: input.parsers ?? createParserRegistry(),
    artifacts: createArtifactStore(),
    datasets: createDatasetStore(),
    journal: createChangeJournal(),
    audit: createAuditTrail(),
    metrics: createMetricsRecorder(),
    autoApprovalPolicy: input.autoApprovalPolicy ?? DEFAULT_AUTO_APPROVAL_POLICY,
    systemPrincipal: input.systemPrincipal ?? SYSTEM_PRINCIPAL,
  };
}

// ─── Per-source processing outcome ───

export const PIPELINE_OUTCOMES = [
  "NO_CHANGE",
  "AUTHORITATIVE_INGESTION_BLOCKED",
  "ARTIFACT_QUARANTINED",
  "PARSER_FAILED",
  "PROVENANCE_INCOMPLETE",
  "PENDING_REVIEW",
  "AUTO_APPROVED",
  "SOURCE_UNAVAILABLE",
  "DISCOVERY_SIGNAL_ONLY",
] as const;
export type PipelineOutcome = (typeof PIPELINE_OUTCOMES)[number];

export interface SourcePipelineResult {
  sourceId: string;
  outcome: PipelineOutcome;
  blocker: string | null;
  check: SourceCheckResult | null;
  artifact: RegulatoryArtifact | null;
  dataset: RegulatoryDataset | null;
  diff: RegulatoryDiff | null;
  impact: RegulatoryImpactAssessment | null;
  governanceCase: GovernanceCase | null;
  changeEvent: RegulatoryChangeEvent | null;
  alerts: RegulatoryAlert[];
  auditEvents: RegulatoryAuditEvent[];
}

function emptyResult(sourceId: string, outcome: PipelineOutcome, blocker: string | null): SourcePipelineResult {
  return {
    sourceId,
    outcome,
    blocker,
    check: null,
    artifact: null,
    dataset: null,
    diff: null,
    impact: null,
    governanceCase: null,
    changeEvent: null,
    alerts: [],
    auditEvents: [],
  };
}

// ─── Ingest one changed artifact ───

export interface IngestChangedSourceInput {
  ctx: RegulatoryEngineContext;
  source: RegulatorySource;
  resource: Awaited<ReturnType<RegulatoryFetcher["fetch"]>>;
  check: SourceCheckResult;
  correlationId: string;
  /** Dataset key prefix, e.g. "LCGPA_MANDATORY_LIST". */
  datasetKey: string;
  /** Document metadata for the artifact being ingested. */
  document: {
    titleAr: string;
    titleEn?: string | null;
    documentType: Parameters<typeof createDocument>[0]["documentType"];
  };
}

/**
 * Full ingestion of one changed artifact, stopping at the first blocker.
 * Ends at PENDING_REVIEW — never at ACTIVE.
 */
export async function ingestChangedSource(
  input: IngestChangedSourceInput,
): Promise<SourcePipelineResult> {
  const { ctx, source, resource, check, correlationId, datasetKey } = input;
  const auditEvents: RegulatoryAuditEvent[] = [];
  const alerts: RegulatoryAlert[] = [];

  const audit = (
    action: Parameters<AuditTrail["record"]>[0]["action"],
    entityType: string,
    entityId: string,
    reason: string,
    before?: unknown,
    after?: unknown,
  ): void => {
    auditEvents.push(
      ctx.audit.record({
        action,
        actorId: ctx.systemPrincipal,
        sourceId: source.id,
        entityType,
        entityId,
        reason,
        before,
        after,
        correlationId,
        clock: ctx.clock,
      }),
    );
  };

  audit("SOURCE_CHECKED", "RegulatorySource", source.id, `Outcome ${check.outcome}`);

  // ── Authority gate (§4, §30) ──
  const tierGate = canUpdateAuthoritativeState(source);
  if (!tierGate.allowed) {
    const result = emptyResult(
      source.id,
      source.authorityTier === 4 ? "DISCOVERY_SIGNAL_ONLY" : "AUTHORITATIVE_INGESTION_BLOCKED",
      tierGate.reason,
    );
    result.check = check;
    result.auditEvents = auditEvents;
    return result;
  }

  // ── Acquisition + integrity (§9, §10, §41) ──
  const acquisition = acquireArtifact({
    source,
    resource,
    acquiredBy: ctx.systemPrincipal,
    clock: ctx.clock,
  });
  if (!acquisition.ok || !acquisition.artifact) {
    const result = emptyResult(
      source.id,
      "SOURCE_UNAVAILABLE",
      acquisition.blockedReason,
    );
    result.check = check;
    result.auditEvents = auditEvents;
    const alert = buildSourceFailureAlert(source, check, ctx.clock);
    if (alert) result.alerts = [alert];
    return result;
  }

  const stored = ctx.artifacts.put(acquisition.artifact);
  const artifact = stored.artifact;
  recordArtifactAcquired(ctx.metrics, source.id, artifact.status);
  audit(
    "ARTIFACT_ACQUIRED",
    "RegulatoryArtifact",
    artifact.artifactId,
    `SHA-256 ${artifact.sha256} (${artifact.size} bytes), new=${stored.isNew}`,
  );

  const authorityGate = canArtifactUpdateAuthority(source, artifact);
  if (!authorityGate.allowed) {
    recordValidationFailure(ctx.metrics, source.id, artifact.integrity.errors.length || 1);
    audit(
      "ARTIFACT_QUARANTINED",
      "RegulatoryArtifact",
      artifact.artifactId,
      authorityGate.reason,
    );
    const result = emptyResult(source.id, "ARTIFACT_QUARANTINED", authorityGate.reason);
    result.check = check;
    result.artifact = artifact;
    result.alerts = [
      buildValidationFailureAlert(
        source,
        artifact.sha256,
        artifact.integrity.errors.length > 0
          ? artifact.integrity.errors
          : [authorityGate.reason],
        ctx.clock,
      ),
    ];
    result.auditEvents = auditEvents;
    return result;
  }
  audit("ARTIFACT_VERIFIED", "RegulatoryArtifact", artifact.artifactId, authorityGate.reason);

  // ── Governance case opens at DETECTED ──
  const derivation = deriveDatasetVersion(datasetKey, artifact);
  let governanceCase = createGovernanceCase(
    {
      sourceId: source.id,
      artifactSha256: artifact.sha256,
      datasetVersion: derivation.datasetVersion,
      correlationId,
    },
    ctx.clock,
  );
  governanceCase = transitionCase(governanceCase, {
    to: "VERIFIED",
    actorId: ctx.systemPrincipal,
    reason: authorityGate.reason,
    correlationId,
    clock: ctx.clock,
  });

  // ── Parsing (§28) ──
  const parser = ctx.parsers.forSource(source.id);
  const parsed = await runParser(parser, artifact, resource.body as Buffer);
  if (!parsed.ok) {
    ctx.artifacts.markParseFailed(artifact.artifactId, parsed.errors.join("; "));
    recordParseFailure(ctx.metrics, source.id);
    audit(
      "PARSER_FAILED",
      "RegulatoryArtifact",
      artifact.artifactId,
      `REGULATORY_DATA_PIPELINE_FAILURE: ${parsed.errors.join("; ")}`,
    );
    governanceCase = transitionCase(governanceCase, {
      to: "FAILED",
      actorId: ctx.systemPrincipal,
      reason: `Parser failed: ${parsed.errors.join("; ")}`,
      correlationId,
      clock: ctx.clock,
    });
    const result = emptyResult(
      source.id,
      "PARSER_FAILED",
      `REGULATORY_DATA_PIPELINE_FAILURE: artifact ${artifact.sha256} — ${parsed.errors.join("; ")}`,
    );
    result.check = check;
    result.artifact = artifact;
    result.governanceCase = governanceCase;
    result.alerts = [
      buildParserFailureAlert(
        source,
        artifact.sha256,
        artifact.filename,
        parsed.errors.join("; "),
        ctx.clock,
      ),
    ];
    result.auditEvents = auditEvents;
    return result;
  }
  ctx.artifacts.markParsed(artifact.artifactId);
  governanceCase = transitionCase(governanceCase, {
    to: "PARSED",
    actorId: ctx.systemPrincipal,
    reason: `Parsed ${parsed.products.length} product(s) with ${parser.parserVersion}`,
    correlationId,
    clock: ctx.clock,
  });

  // ── Versioning + provenance (§11, §12, §13) ──
  const document = createDocument(
    {
      authority: source.authority,
      sourceId: source.id,
      titleAr: input.document.titleAr,
      titleEn: input.document.titleEn ?? null,
      documentType: input.document.documentType,
    },
    ctx.clock,
  );
  const documentVersion = createDocumentVersion({ document, artifact }, ctx.clock);
  const provenance = buildProvenance({
    artifact,
    source,
    datasetVersion: derivation.datasetVersion,
    documentVersion: documentVersion.version,
    ruleVersion: ACTIVE_RULE_VERSION,
    parserVersion: parser.parserVersion,
  });

  const provenanceErrors = validateProvenance(provenance);
  if (provenanceErrors.length > 0) {
    audit(
      "ARTIFACT_QUARANTINED",
      "RegulatoryArtifact",
      artifact.artifactId,
      provenanceErrors.join("; "),
    );
    const result = emptyResult(
      source.id,
      "PROVENANCE_INCOMPLETE",
      provenanceErrors.join("; "),
    );
    result.check = check;
    result.artifact = artifact;
    result.governanceCase = governanceCase;
    result.auditEvents = auditEvents;
    return result;
  }

  const previous = ctx.datasets.active(source.id) ?? null;
  const dataset = ctx.datasets.put(
    createDataset(
      {
        datasetVersion: derivation.datasetVersion,
        documentVersion,
        sourceId: source.id,
        artifact,
        products: parsed.products,
        provenance,
        parserVersion: parser.parserVersion,
      },
      ctx.clock,
    ),
  );
  audit(
    "DATASET_CREATED",
    "RegulatoryDataset",
    dataset.datasetId,
    `${dataset.datasetVersion} (${dataset.products.length} products) from artifact ${artifact.sha256}`,
  );

  // ── Semantic diff + classification (§15, §16, §17) ──
  const diff = computeSemanticDiff({ before: previous, after: dataset, clock: ctx.clock });
  recordDiff(ctx.metrics, source.id, diff);
  governanceCase = transitionCase(governanceCase, {
    to: "DIFFED",
    actorId: ctx.systemPrincipal,
    reason: `${diff.changes.length} semantic change(s) detected`,
    correlationId,
    clock: ctx.clock,
  });
  audit(
    "CHANGE_DETECTED",
    "RegulatoryDiff",
    diff.diffId,
    `${diff.changes.length} change(s): ${JSON.stringify(diff.summary.byType)}`,
  );
  governanceCase = transitionCase(governanceCase, {
    to: "CLASSIFIED",
    actorId: ctx.systemPrincipal,
    reason: `Severity distribution ${JSON.stringify(diff.summary.bySeverity)}`,
    correlationId,
    clock: ctx.clock,
  });
  audit(
    "CHANGE_CLASSIFIED",
    "RegulatoryDiff",
    diff.diffId,
    JSON.stringify(diff.summary.bySeverity),
  );

  // ── Impact analysis (§21) ──
  const impact = await analyzeImpact({
    diff,
    resolver: ctx.impactResolver,
    clock: ctx.clock,
  });
  recordImpact(ctx.metrics, source.id, impact);
  governanceCase = transitionCase(governanceCase, {
    to: "IMPACT_ANALYZED",
    actorId: ctx.systemPrincipal,
    reason: impact.rationale,
    correlationId,
    clock: ctx.clock,
  });
  audit("IMPACT_ANALYZED", "RegulatoryImpactAssessment", impact.impactId, impact.rationale);

  // ── Alerts ──
  alerts.push(...buildDiffAlerts({ source, diff, impact, clock: ctx.clock }));
  recordAlerts(ctx.metrics, alerts);

  // ── Governance routing (§24) ──
  const autoDecision = evaluateAutoApproval(ctx.autoApprovalPolicy, diff, source);
  if (autoDecision.eligible) {
    governanceCase = autoApproveCase(governanceCase, autoDecision, {
      actorId: ctx.systemPrincipal,
      correlationId,
      clock: ctx.clock,
    });
    audit(
      "CHANGE_APPROVED",
      "GovernanceCase",
      governanceCase.caseId,
      autoDecision.reason,
    );
  } else {
    governanceCase = requestReview(governanceCase, diff.diffId, impact.impactId, {
      actorId: ctx.systemPrincipal,
      correlationId,
      clock: ctx.clock,
    });
    audit(
      "REVIEW_REQUESTED",
      "GovernanceCase",
      governanceCase.caseId,
      autoDecision.reason,
    );
  }

  // ── Journal (§34) ──
  const changeEvent = ctx.journal.append({
    source,
    artifact,
    datasetVersion: dataset.datasetVersion,
    diff,
    impact,
    governanceCase,
    correlationId,
    clock: ctx.clock,
  });

  return {
    sourceId: source.id,
    outcome: autoDecision.eligible ? "AUTO_APPROVED" : "PENDING_REVIEW",
    blocker: null,
    check,
    artifact,
    dataset,
    diff,
    impact,
    governanceCase,
    changeEvent,
    alerts,
    auditEvents,
  };
}

// ─── Full cycle ───

export interface RunCycleInput {
  ctx: RegulatoryEngineContext;
  sources: RegulatorySource[];
  correlationId: string;
  datasetKey: string;
  document: IngestChangedSourceInput["document"];
  force?: boolean;
}

export interface RunCycleOutput {
  sources: RegulatorySource[];
  checks: SourceCheckResult[];
  results: SourcePipelineResult[];
  alerts: RegulatoryAlert[];
  startedAt: Date;
  finishedAt: Date;
}

/**
 * One complete monitoring + intelligence cycle.
 * Safe to run repeatedly: unchanged artifacts produce no new versions or events.
 */
export async function runRegulatoryCycle(
  input: RunCycleInput,
): Promise<RunCycleOutput> {
  const { ctx, sources, correlationId, datasetKey } = input;

  const cycle = await runMonitorCycle({
    sources,
    fetcher: ctx.fetcher,
    clock: ctx.clock,
    correlationId,
    force: input.force,
  });

  for (const result of cycle.results) recordCheck(ctx.metrics, result);

  const results: SourcePipelineResult[] = [];
  const alerts: RegulatoryAlert[] = [];

  const byId = new Map(cycle.sources.map((s) => [s.id, s]));

  for (const { source, resource } of cycle.changed) {
    const check = cycle.results.find((r) => r.sourceId === source.id);
    if (!check) continue;
    const result = await ingestChangedSource({
      ctx,
      source: byId.get(source.id) ?? source,
      resource,
      check,
      correlationId: `${correlationId}:${source.id}`,
      datasetKey,
      document: input.document,
    });
    results.push(result);
    alerts.push(...result.alerts);
  }

  // Failure alerts for sources that could not be reached.
  for (const check of cycle.results) {
    const source = byId.get(check.sourceId);
    if (!source) continue;
    const alert = buildSourceFailureAlert(source, check, ctx.clock);
    if (alert) alerts.push(alert);
  }
  recordAlerts(ctx.metrics, alerts);

  return {
    sources: cycle.sources,
    checks: cycle.results,
    results,
    alerts,
    startedAt: cycle.startedAt,
    finishedAt: cycle.finishedAt,
  };
}
