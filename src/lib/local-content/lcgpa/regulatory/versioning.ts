// ─── LCGPA Regulatory Intelligence :: Document & Dataset Versioning (§12, §13, §14, §42) ───
//
// THREE INDEPENDENT VERSION AXES — never collapse them:
//
//   RULE VERSION      LCGPA_RULE_VERSION (frozen "2026-01"). Changes only when the
//                     regulatory METHODOLOGY changes.
//   DOCUMENT VERSION  The authority's own version of a published document.
//   DATASET VERSION   A normalized snapshot of product data, e.g.
//                     "LCGPA_MANDATORY_LIST_2026-08".
//
// A product-data update is a DATASET CHANGE. It does NOT bump the rule version.

import { LCGPA_RULE_VERSION } from "../types";
import type {
  Clock,
  DatasetStatus,
  RegulatoryArtifact,
  RegulatoryDataset,
  RegulatoryDocument,
  RegulatoryDocumentVersion,
  RegulatoryProduct,
  RegulatoryProvenance,
} from "./types";
import { REGULATORY_PARSER_VERSION, REGULATORY_SCHEMA_VERSION } from "./types";
import { deterministicId } from "./ids";

/** Re-exported for callers that must record which rule version produced a value. */
export const ACTIVE_RULE_VERSION = LCGPA_RULE_VERSION;

// ─── Documents ───

export interface CreateDocumentInput {
  authority: string;
  sourceId: string;
  titleAr: string;
  titleEn?: string | null;
  documentType: RegulatoryDocument["documentType"];
}

export function createDocument(
  input: CreateDocumentInput,
  clock: Clock,
): RegulatoryDocument {
  return {
    documentId: deterministicId("DOC", [
      input.authority,
      input.sourceId,
      input.documentType,
      input.titleAr,
    ]),
    authority: input.authority,
    sourceId: input.sourceId,
    titleAr: input.titleAr,
    titleEn: input.titleEn ?? null,
    documentType: input.documentType,
    createdAt: clock.now(),
  };
}

export interface CreateDocumentVersionInput {
  document: RegulatoryDocument;
  artifact: RegulatoryArtifact;
  /** Version label declared by the authority, when stated. */
  declaredVersion?: string | null;
  supersedesVersionId?: string | null;
}

/**
 * Create a document version bound to exactly one artifact.
 *
 * `publicationDate` and `effectiveFrom` are copied from the artifact and are
 * null when the authority did not state them. They are NEVER inferred (§45):
 * a document published today may take effect next year (§12).
 */
export function createDocumentVersion(
  input: CreateDocumentVersionInput,
  clock: Clock,
): RegulatoryDocumentVersion {
  const { document, artifact } = input;
  const version =
    input.declaredVersion ?? artifact.version ?? `sha256:${artifact.sha256.slice(0, 12)}`;
  return {
    documentVersionId: deterministicId("DOCV", [document.documentId, artifact.sha256]),
    documentId: document.documentId,
    version,
    artifactSha256: artifact.sha256,
    publicationDate: artifact.publishedAt,
    effectiveFrom: artifact.effectiveFrom,
    effectiveTo: artifact.effectiveTo,
    supersedesVersionId: input.supersedesVersionId ?? null,
    createdAt: clock.now(),
  };
}

// ─── Dataset version derivation ───

export interface DatasetVersionDerivation {
  datasetVersion: string;
  /** True when the label was derived by the engine rather than declared by LCGPA. */
  derived: boolean;
  basis: "DECLARED_VERSION" | "PUBLICATION_DATE" | "CONTENT_FINGERPRINT";
}

function yyyymm(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/**
 * Derive a dataset version label.
 *
 * Preference order — the authority's own label always wins:
 *   1. version declared by LCGPA
 *   2. publication month declared by LCGPA
 *   3. content fingerprint (marked as engine-derived, never presented as official)
 */
export function deriveDatasetVersion(
  datasetKey: string,
  artifact: RegulatoryArtifact,
): DatasetVersionDerivation {
  if (artifact.version) {
    return {
      datasetVersion: `${datasetKey}_${artifact.version}`,
      derived: false,
      basis: "DECLARED_VERSION",
    };
  }
  if (artifact.publishedAt) {
    return {
      datasetVersion: `${datasetKey}_${yyyymm(artifact.publishedAt)}`,
      derived: true,
      basis: "PUBLICATION_DATE",
    };
  }
  return {
    datasetVersion: `${datasetKey}_sha-${artifact.sha256.slice(0, 12)}`,
    derived: true,
    basis: "CONTENT_FINGERPRINT",
  };
}

// ─── Datasets ───

export interface CreateDatasetInput {
  datasetVersion: string;
  documentVersion: RegulatoryDocumentVersion;
  sourceId: string;
  artifact: RegulatoryArtifact;
  products: RegulatoryProduct[];
  provenance: RegulatoryProvenance;
  /** Rule version under which the dataset was normalized. Defaults to the frozen one. */
  ruleVersion?: string;
  parserVersion?: string;
  schemaVersion?: string;
  status?: DatasetStatus;
}

/**
 * Build a normalized dataset. Products are stored sorted by product code so
 * that the same artifact always yields a byte-identical dataset (§33).
 */
export function createDataset(
  input: CreateDatasetInput,
  clock: Clock,
): RegulatoryDataset {
  const products = input.products
    .slice()
    .sort((a, b) => a.productCode.localeCompare(b.productCode));

  return {
    datasetId: deterministicId("DS", [
      input.datasetVersion,
      input.artifact.sha256,
      input.parserVersion ?? REGULATORY_PARSER_VERSION,
      input.schemaVersion ?? REGULATORY_SCHEMA_VERSION,
      input.ruleVersion ?? ACTIVE_RULE_VERSION,
    ]),
    datasetVersion: input.datasetVersion,
    documentVersionId: input.documentVersion.documentVersionId,
    sourceId: input.sourceId,
    artifactSha256: input.artifact.sha256,
    products,
    parserVersion: input.parserVersion ?? REGULATORY_PARSER_VERSION,
    schemaVersion: input.schemaVersion ?? REGULATORY_SCHEMA_VERSION,
    ruleVersion: input.ruleVersion ?? ACTIVE_RULE_VERSION,
    status: input.status ?? "DRAFT",
    effectiveFrom: input.documentVersion.effectiveFrom ?? input.artifact.effectiveFrom,
    effectiveTo: input.documentVersion.effectiveTo ?? input.artifact.effectiveTo,
    createdAt: clock.now(),
    activatedAt: null,
    deactivatedAt: null,
    provenance: input.provenance,
  };
}

/**
 * Deterministic per-product version identity.
 *
 * Two rows carrying the same `productVersionId` state exactly the same
 * regulatory facts about the same product. This is what a calculation pins so
 * that "which product version did you use?" has a precise answer, without a
 * second versioning table: a product version IS its facts inside a dataset.
 */
export function productVersionDigest(
  datasetVersion: string,
  p: RegulatoryProduct,
): string {
  return deterministicId("PV", [
    datasetVersion,
    p.productCode,
    p.productCodeRaw ?? null,
    p.productNameAr,
    p.productNameEn,
    p.sectorCode,
    p.sectorNameAr,
    p.category,
    p.hsCode,
    p.descriptionAr ?? null,
    p.descriptionEn ?? null,
    p.minimumLcPct,
    p.priceCeilingRaw ?? null,
    p.manufacturerBaseline ?? null,
    p.requirements.slice().sort().join(","),
    p.applicability,
    p.regulatoryStatus,
    p.effectiveFrom ? p.effectiveFrom.toISOString() : null,
    p.effectiveTo ? p.effectiveTo.toISOString() : null,
    (p.minimumLcSchedule ?? [])
      .slice()
      .sort((a, b) => a.year - b.year)
      .map((e) => `${e.year}:${e.state}:${e.pct}`)
      .join(","),
  ]);
}

/**
 * Reproducibility fingerprint (§33).
 * Identical (artifact, parser, schema, rule) inputs must yield an identical digest.
 */
export function datasetFingerprint(dataset: RegulatoryDataset): string {
  return deterministicId("FP", [
    dataset.artifactSha256,
    dataset.parserVersion,
    dataset.schemaVersion,
    dataset.ruleVersion,
    ...dataset.products.flatMap((p) => [
      p.productCode,
      p.productNameAr,
      p.productNameEn,
      p.sectorCode,
      p.category,
      p.hsCode,
      p.minimumLcPct,
      p.requirements.slice().sort().join(","),
      p.applicability,
      p.regulatoryStatus,
      p.productCodeRaw ?? null,
      p.descriptionAr ?? null,
      p.descriptionEn ?? null,
      p.priceCeilingRaw ?? null,
      p.manufacturerBaseline ?? null,
      (p.minimumLcSchedule ?? [])
        .slice()
        .sort((a, b) => a.year - b.year)
        .map((e) => `${e.year}:${e.state}:${e.pct}`)
        .join(","),
      p.effectiveFrom ? p.effectiveFrom.toISOString() : null,
      p.effectiveTo ? p.effectiveTo.toISOString() : null,
    ]),
  ]);
}

// ─── Dataset store ───

export interface DatasetStore {
  put(dataset: RegulatoryDataset): RegulatoryDataset;
  get(datasetId: string): RegulatoryDataset | undefined;
  getByVersion(datasetVersion: string): RegulatoryDataset | undefined;
  /** All datasets for a source in insertion order. */
  listBySource(sourceId: string): RegulatoryDataset[];
  /** All datasets in insertion order. */
  list(): RegulatoryDataset[];
  /** The single ACTIVE dataset for a source, if any. */
  active(sourceId: string): RegulatoryDataset | undefined;
  /** Replace a stored dataset (status transitions only). */
  update(dataset: RegulatoryDataset): RegulatoryDataset;
}

export function createDatasetStore(
  initial: RegulatoryDataset[] = [],
): DatasetStore {
  const byId = new Map<string, RegulatoryDataset>();
  const order: string[] = [];

  for (const d of initial) {
    if (!byId.has(d.datasetId)) {
      byId.set(d.datasetId, d);
      order.push(d.datasetId);
    }
  }

  const all = (): RegulatoryDataset[] =>
    order.map((id) => byId.get(id)).filter((d): d is RegulatoryDataset => !!d);

  return {
    put(dataset) {
      const existing = byId.get(dataset.datasetId);
      if (existing) return existing;
      byId.set(dataset.datasetId, dataset);
      order.push(dataset.datasetId);
      return dataset;
    },
    get: (datasetId) => byId.get(datasetId),
    getByVersion: (datasetVersion) =>
      all().find((d) => d.datasetVersion === datasetVersion),
    listBySource: (sourceId) => all().filter((d) => d.sourceId === sourceId),
    list: all,
    active: (sourceId) =>
      all().find((d) => d.sourceId === sourceId && d.status === "ACTIVE"),
    update(dataset) {
      if (!byId.has(dataset.datasetId)) {
        throw new Error(
          `DATASET_NOT_FOUND: cannot update unknown dataset ${dataset.datasetId}`,
        );
      }
      byId.set(dataset.datasetId, dataset);
      return dataset;
    },
  };
}

// ─── Rule vs dataset distinction (§42) ───

export const RULE_CHANGE_INDICATORS = [
  "CALCULATION_METHODOLOGY",
  "RULE_INTERPRETATION",
  "SCOPE_DEFINITION",
  "WEIGHTING_CHANGE",
] as const;
export type RuleChangeIndicator = (typeof RULE_CHANGE_INDICATORS)[number];

export interface RuleVersionDecision {
  /** True only when a verified METHODOLOGY change was identified by a reviewer. */
  requiresNewRuleVersion: boolean;
  currentRuleVersion: string;
  rationale: string;
  indicators: RuleChangeIndicator[];
}

/**
 * Decide whether an observed change set implies a RULE version bump.
 *
 * The engine never decides this on its own. A rule change requires an explicit
 * reviewer-supplied methodology indicator; product data changes never qualify.
 */
export function decideRuleVersion(
  reviewerIndicators: RuleChangeIndicator[],
): RuleVersionDecision {
  const indicators = reviewerIndicators.slice().sort();
  if (indicators.length === 0) {
    return {
      requiresNewRuleVersion: false,
      currentRuleVersion: ACTIVE_RULE_VERSION,
      rationale:
        "DATASET_CHANGE_ONLY: product data changed; no reviewer-confirmed methodology change. Rule version stays frozen.",
      indicators,
    };
  }
  return {
    requiresNewRuleVersion: true,
    currentRuleVersion: ACTIVE_RULE_VERSION,
    rationale: `RULE_CHANGE_CONFIRMED: reviewer identified methodology indicators (${indicators.join(", ")}); a new rule version must be issued before activation.`,
    indicators,
  };
}
