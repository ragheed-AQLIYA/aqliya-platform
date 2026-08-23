// ─── LCGPA Regulatory Intelligence :: Prisma repository ───
//
//   HYDRATE (db → domain) → RUN the pure pipeline → PERSIST (domain → db)
//
// The engine core never touches the database. This module is the only adapter.
// Everything it writes is additive: artifacts, datasets, products, changes and
// journal entries are created once and never overwritten; only lifecycle
// columns (source health, dataset status, case state, alert status) are updated.

import type { PrismaClient } from "@prisma/client";

import type { EffectiveDateEvidence } from "../effective-date-evidence";
import type {
  GovernanceCase,
  RegulatoryAlert,
  RegulatoryArtifact,
  RegulatoryChangeEvent,
  RegulatoryConflict,
  RegulatoryDataset,
  RegulatoryDiff,
  RegulatoryImpactAssessment,
  RegulatorySource,
  SourceCheckResult,
} from "../types";
import { datasetFingerprint } from "../versioning";
import {
  fromAlert,
  fromArtifact,
  fromCase,
  fromChangeEvent,
  fromEvidence,
  fromImpact,
  fromProduct,
  fromSource,
  toCase,
  toDataset,
  toEvidence,
  toSource,
  type ArtifactRow,
  type CaseRow,
  type DatasetRow,
  type EvidenceRow,
  type SourceRow,
} from "./mappers";

/** Products are inserted in chunks; the mandatory list carries ~1,700 rows. */
export const PRODUCT_INSERT_CHUNK = 500;

export interface EngineState {
  sources: RegulatorySource[];
  datasets: RegulatoryDataset[];
  cases: GovernanceCase[];
  journal: RegulatoryChangeEvent[];
}

type Db = PrismaClient;

// ─── Hydrate ───

/**
 * Lightweight query: load only datasets whose status permits temporal resolution,
 * WITH their products hydrated. Designed for request-path use (server actions)
 * where the full engine state (sources, cases, journal) is not needed.
 *
 * The temporal resolution layer (`effective-date.ts`) handles ACTIVE + SUPERSEDED
 * datasets and enforces effectiveFrom/effectiveTo windows — no filtering by status
 * at query time.
 */
export async function loadResolvableDatasets(
  db: Db,
): Promise<RegulatoryDataset[]> {
  const rows = await db.lcRegulatoryDataset.findMany({
    where: { status: { in: ["ACTIVE", "SUPERSEDED"] } },
    orderBy: { createdAt: "asc" },
    include: {
      products: { orderBy: { productCode: "asc" } },
    },
  });
  return (rows as unknown as DatasetRow[]).map(toDataset);
}

/**
 * Load the regulatory state the pure engine needs.
 *
 * Only datasets that can participate in resolution or diffing are hydrated with
 * their products — loading every historical product set would be wasteful and
 * is never required for a monitoring cycle.
 */
export async function loadEngineState(
  db: Db,
  options: { sourceIds?: string[]; includeProductsFor?: string[] } = {},
): Promise<EngineState> {
  const where = options.sourceIds?.length ? { id: { in: options.sourceIds } } : {};

  const [sourceRows, datasetRows, caseRows, journalRows] = await Promise.all([
    db.lcRegulatorySource.findMany({ where, orderBy: { id: "asc" } }),
    db.lcRegulatoryDataset.findMany({
      where: options.sourceIds?.length ? { sourceId: { in: options.sourceIds } } : {},
      orderBy: { createdAt: "asc" },
      include: {
        products: {
          orderBy: { productCode: "asc" },
          ...(options.includeProductsFor
            ? { where: { dataset: { status: { in: ["ACTIVE", "SUPERSEDED"] } } } }
            : {}),
        },
      },
    }),
    db.lcRegulatoryCase.findMany({
      where: options.sourceIds?.length ? { sourceId: { in: options.sourceIds } } : {},
      orderBy: { createdAt: "asc" },
    }),
    db.lcRegulatoryChangeEvent.findMany({
      where: options.sourceIds?.length ? { sourceId: { in: options.sourceIds } } : {},
      orderBy: { detectedAt: "asc" },
    }),
  ]);

  return {
    sources: (sourceRows as unknown as SourceRow[]).map(toSource),
    datasets: (datasetRows as unknown as DatasetRow[]).map(toDataset),
    cases: (caseRows as unknown as CaseRow[]).map(toCase),
    journal: journalRows.map((r) => ({
      eventId: r.id,
      detectedAt: r.detectedAt,
      sourceId: r.sourceId,
      sourceName: r.sourceName,
      artifactFilename: r.artifactFilename,
      artifactSha256: r.artifactSha256,
      datasetVersion: r.datasetVersion,
      changeIds: Array.isArray(r.changeIds) ? (r.changeIds as string[]) : [],
      summary: r.summary,
      effectiveFrom: r.effectiveFrom,
      impactLevel: r.impactLevel as RegulatoryChangeEvent["impactLevel"],
      governanceState: r.governanceState as RegulatoryChangeEvent["governanceState"],
      activatedAt: r.activatedAt,
      correlationId: r.correlationId,
    })),
  };
}

/** Seed sources that are not yet in the database. Existing rows are untouched. */
export async function ensureSources(
  db: Db,
  sources: RegulatorySource[],
): Promise<{ created: string[]; existing: string[] }> {
  const created: string[] = [];
  const existing: string[] = [];
  for (const source of sources) {
    const found = await db.lcRegulatorySource.findUnique({ where: { id: source.id } });
    if (found) {
      existing.push(source.id);
      continue;
    }
    await db.lcRegulatorySource.create({ data: fromSource(source) });
    created.push(source.id);
  }
  return { created, existing };
}

// ─── Persist ───

export async function persistSource(db: Db, source: RegulatorySource): Promise<void> {
  const data = fromSource(source);
  await db.lcRegulatorySource.upsert({
    where: { id: source.id },
    create: data,
    update: data,
  });
}

/** Checks are immutable: an existing check id is left exactly as it was. */
export async function persistCheck(db: Db, check: SourceCheckResult): Promise<void> {
  await db.lcRegulatoryCheck.upsert({
    where: { id: check.checkId },
    create: {
      id: check.checkId,
      sourceId: check.sourceId,
      checkedAt: check.checkedAt,
      outcome: check.outcome,
      httpStatus: check.httpStatus,
      observedSha256: check.observedSha256,
      previousSha256: check.previousSha256,
      metadata: (check.metadata ?? undefined) as object | undefined,
      errorCode: check.errorCode,
      errorMessage: check.errorMessage,
      nextCheckAt: check.nextCheckAt,
      attemptCount: check.attemptCount,
      correlationId: check.correlationId,
    },
    update: {},
  });
}

/**
 * Artifacts are content-addressed and immutable. Re-persisting the same
 * artifact updates only its lifecycle status, never its bytes or provenance.
 */
export async function persistArtifact(
  db: Db,
  artifact: RegulatoryArtifact,
  rawStorageKey?: string | null,
): Promise<void> {
  const data = fromArtifact(artifact, rawStorageKey);
  await db.lcRegulatoryArtifact.upsert({
    where: { id: artifact.artifactId },
    create: data,
    update: { status: artifact.status, blockedReason: artifact.blockedReason },
  });
}

export interface PersistDatasetInput {
  dataset: RegulatoryDataset;
  artifactId: string;
  documentTitleAr?: string | null;
  documentTitleEn?: string | null;
  documentType?: string | null;
}

/** Datasets and their products are written once. Later calls update status only. */
export async function persistDataset(
  db: Db,
  input: PersistDatasetInput,
): Promise<{ created: boolean }> {
  const { dataset } = input;
  const existing = await db.lcRegulatoryDataset.findUnique({
    where: { id: dataset.datasetId },
    select: { id: true },
  });

  if (existing) {
    await db.lcRegulatoryDataset.update({
      where: { id: dataset.datasetId },
      data: {
        status: dataset.status,
        effectiveFrom: dataset.effectiveFrom,
        effectiveTo: dataset.effectiveTo,
        activatedAt: dataset.activatedAt,
        deactivatedAt: dataset.deactivatedAt,
      },
    });
    return { created: false };
  }

  await db.lcRegulatoryDataset.create({
    data: {
      id: dataset.datasetId,
      datasetVersion: dataset.datasetVersion,
      sourceId: dataset.sourceId,
      artifactId: input.artifactId,
      artifactSha256: dataset.artifactSha256,
      documentVersionId: dataset.documentVersionId,
      documentVersion: dataset.provenance.documentVersion,
      documentTitleAr: input.documentTitleAr ?? null,
      documentTitleEn: input.documentTitleEn ?? null,
      documentType: input.documentType ?? null,
      parserVersion: dataset.parserVersion,
      schemaVersion: dataset.schemaVersion,
      ruleVersion: dataset.ruleVersion,
      status: dataset.status,
      effectiveFrom: dataset.effectiveFrom,
      effectiveTo: dataset.effectiveTo,
      activatedAt: dataset.activatedAt,
      deactivatedAt: dataset.deactivatedAt,
      productCount: dataset.products.length,
      provenance: dataset.provenance as unknown as object,
      fingerprint: datasetFingerprint(dataset),
    },
  });

  for (let i = 0; i < dataset.products.length; i += PRODUCT_INSERT_CHUNK) {
    const chunk = dataset.products.slice(i, i + PRODUCT_INSERT_CHUNK);
    await db.lcRegulatoryProduct.createMany({
      data: chunk.map((p) => fromProduct(dataset.datasetId, p, dataset.datasetVersion)),
      skipDuplicates: true,
    });
  }
  return { created: true };
}

/** Changes are immutable facts about a diff. Duplicates are skipped. */
export async function persistDiff(
  db: Db,
  diff: RegulatoryDiff,
  datasetAfterId: string,
  datasetBeforeId: string | null,
): Promise<number> {
  if (diff.changes.length === 0) return 0;
  const result = await db.lcRegulatoryChange.createMany({
    data: diff.changes.map((c) => ({
      id: c.changeId,
      datasetBeforeId,
      datasetAfterId,
      diffId: diff.diffId,
      productCode: c.productCode,
      changeType: c.changeType,
      field: c.field,
      oldValue: c.oldValue,
      newValue: c.newValue,
      detectedAt: c.detectedAt,
      effectiveFrom: c.effectiveFrom,
      sourceArtifactBefore: c.sourceArtifactBefore,
      sourceArtifactAfter: c.sourceArtifactAfter,
      severity: c.severity,
      severityRationale: c.severityRationale,
      isBaseline: diff.isBaseline,
    })),
    skipDuplicates: true,
  });
  return result.count;
}

export async function persistCase(
  db: Db,
  governanceCase: GovernanceCase,
  correlationId: string,
  impact?: RegulatoryImpactAssessment | null,
): Promise<void> {
  const data = fromCase(governanceCase, correlationId, impact ?? undefined);
  await db.lcRegulatoryCase.upsert({
    where: { id: governanceCase.caseId },
    create: data,
    update: data,
  });
}

export async function persistAlerts(db: Db, alerts: RegulatoryAlert[]): Promise<void> {
  for (const alert of alerts) {
    const data = fromAlert(alert);
    await db.lcRegulatoryAlert.upsert({
      where: { id: alert.alertId },
      create: data,
      update: {}, // an existing alert keeps its acknowledgement state
    });
  }
}

export async function persistChangeEvent(
  db: Db,
  event: RegulatoryChangeEvent,
): Promise<void> {
  const data = fromChangeEvent(event);
  await db.lcRegulatoryChangeEvent.upsert({
    where: { id: event.eventId },
    create: data,
    update: {
      governanceState: event.governanceState,
      activatedAt: event.activatedAt,
      impactLevel: event.impactLevel,
    },
  });
}

// ─── Cycle persistence ───

export interface PersistableResult {
  sourceId: string;
  artifact: RegulatoryArtifact | null;
  dataset: RegulatoryDataset | null;
  diff: RegulatoryDiff | null;
  impact: RegulatoryImpactAssessment | null;
  governanceCase: GovernanceCase | null;
  changeEvent: RegulatoryChangeEvent | null;
  alerts: RegulatoryAlert[];
}

export interface PersistCycleInput {
  sources: RegulatorySource[];
  checks: SourceCheckResult[];
  results: PersistableResult[];
  alerts: RegulatoryAlert[];
  correlationId: string;
  document?: { titleAr?: string; titleEn?: string | null; documentType?: string };
  /** Where the preserved raw bytes were archived, keyed by artifact id. */
  rawStorageKeys?: Record<string, string>;
}

export interface PersistCycleSummary {
  sources: number;
  checks: number;
  artifacts: number;
  datasetsCreated: number;
  changes: number;
  cases: number;
  alerts: number;
  journalEntries: number;
}

/**
 * Persist one monitoring cycle.
 *
 * Ordering matters: sources and artifacts first, then datasets (which reference
 * artifacts), then changes, cases, alerts and the journal.
 */
export async function persistCycle(
  db: Db,
  input: PersistCycleInput,
): Promise<PersistCycleSummary> {
  const summary: PersistCycleSummary = {
    sources: 0,
    checks: 0,
    artifacts: 0,
    datasetsCreated: 0,
    changes: 0,
    cases: 0,
    alerts: 0,
    journalEntries: 0,
  };

  for (const source of input.sources) {
    await persistSource(db, source);
    summary.sources++;
  }
  for (const check of input.checks) {
    await persistCheck(db, check);
    summary.checks++;
  }

  for (const result of input.results) {
    if (result.artifact) {
      await persistArtifact(
        db,
        result.artifact,
        input.rawStorageKeys?.[result.artifact.artifactId] ?? null,
      );
      summary.artifacts++;
    }
    if (result.dataset && result.artifact) {
      const previousId = result.diff?.datasetBefore
        ? (
            await db.lcRegulatoryDataset.findUnique({
              where: { datasetVersion: result.diff.datasetBefore },
              select: { id: true },
            })
          )?.id ?? null
        : null;

      const { created } = await persistDataset(db, {
        dataset: result.dataset,
        artifactId: result.artifact.artifactId,
        documentTitleAr: input.document?.titleAr ?? null,
        documentTitleEn: input.document?.titleEn ?? null,
        documentType: input.document?.documentType ?? null,
      });
      if (created) summary.datasetsCreated++;

      if (result.diff) {
        summary.changes += await persistDiff(
          db,
          result.diff,
          result.dataset.datasetId,
          previousId,
        );
      }
    }
    if (result.governanceCase) {
      await persistCase(db, result.governanceCase, input.correlationId, result.impact);
      summary.cases++;
    }
    if (result.changeEvent) {
      await persistChangeEvent(db, result.changeEvent);
      summary.journalEntries++;
    }
  }

  const uniqueAlerts = new Map<string, RegulatoryAlert>();
  for (const alert of [...input.alerts, ...input.results.flatMap((r) => r.alerts)]) {
    uniqueAlerts.set(alert.alertId, alert);
  }
  await persistAlerts(db, Array.from(uniqueAlerts.values()));
  summary.alerts = uniqueAlerts.size;

  return summary;
}

// ─── Effective-date evidence (P0.7) ───

/** Evidence is append-only: an existing record is never rewritten in place. */
export async function persistEvidence(
  db: Db,
  evidence: EffectiveDateEvidence[],
): Promise<{ created: number; superseded: number }> {
  let created = 0;
  let superseded = 0;
  for (const e of evidence) {
    const datasetId = e.datasetVersion
      ? (
          await db.lcRegulatoryDataset.findUnique({
            where: { datasetVersion: e.datasetVersion },
            select: { id: true },
          })
        )?.id ?? null
      : null;

    const existing = await db.lcRegulatoryEffectiveDateEvidence.findUnique({
      where: { id: e.evidenceId },
      select: { id: true, supersededById: true },
    });

    if (!existing) {
      await db.lcRegulatoryEffectiveDateEvidence.create({
        data: fromEvidence(e, datasetId),
      });
      created++;
      continue;
    }
    // The only mutation ever permitted is marking it superseded.
    if (e.supersededById && !existing.supersededById) {
      await db.lcRegulatoryEffectiveDateEvidence.update({
        where: { id: e.evidenceId },
        data: { supersededById: e.supersededById, supersededAt: e.supersededAt },
      });
      superseded++;
    }
  }
  return { created, superseded };
}

/** Load live (non-superseded) evidence, optionally for one source. */
export async function loadEvidence(
  db: Db,
  options: { sourceId?: string; datasetVersion?: string; includeSuperseded?: boolean } = {},
): Promise<EffectiveDateEvidence[]> {
  const rows = await db.lcRegulatoryEffectiveDateEvidence.findMany({
    where: {
      ...(options.sourceId ? { sourceId: options.sourceId } : {}),
      ...(options.datasetVersion
        ? { dataset: { datasetVersion: options.datasetVersion } }
        : {}),
      ...(options.includeSuperseded ? {} : { supersededById: null }),
    },
    include: { dataset: { select: { datasetVersion: true } } },
    orderBy: { recordedAt: "asc" },
  });
  return (rows as unknown as EvidenceRow[]).map(toEvidence);
}

// ─── Impact assessments ───

/** Impact assessments are immutable facts about a diff at a point in time. */
export async function persistImpact(
  db: Db,
  impact: RegulatoryImpactAssessment,
  datasetId: string,
  unresolvableEntities: string[],
): Promise<void> {
  const data = fromImpact(impact, datasetId, unresolvableEntities);
  await db.lcRegulatoryImpactAssessment.upsert({
    where: { id: impact.impactId },
    create: data,
    update: {},
  });
}

// ─── Conflicts (§29) ───

/**
 * Persist a regulatory conflict. Never resolved automatically — the resolution
 * column stays PENDING_HUMAN_REVIEW until a person records a decision.
 */
export async function persistConflicts(
  db: Db,
  conflicts: RegulatoryConflict[],
): Promise<{ created: number; existing: number }> {
  let created = 0;
  let existing = 0;
  for (const c of conflicts) {
    const found = await db.lcRegulatoryConflict.findUnique({
      where: { id: c.conflictId },
      select: { id: true },
    });
    if (found) {
      existing++;
      continue;
    }
    await db.lcRegulatoryConflict.create({
      data: {
        id: c.conflictId,
        sourceAId: c.sourceAId,
        sourceBId: c.sourceBId,
        artifactAHash: c.artifactAHash,
        artifactBHash: c.artifactBHash,
        productCode: c.productCode,
        conflictingFields: c.conflictingFields as unknown as object,
        detectedAt: c.detectedAt,
        resolution: c.resolution,
      },
    });
    created++;
  }
  return { created, existing };
}
