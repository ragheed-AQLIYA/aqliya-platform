// ─── LCGPA Regulatory Intelligence :: Prisma ↔ domain mappers ───
//
// The engine core is pure and synchronous. Persistence is an explicit boundary:
// state is HYDRATED from the database, the pure pipeline runs over it, and the
// results are PERSISTED afterwards. These mappers are the only place the two
// representations meet.

import { productVersionDigest } from "../versioning";
import type { EffectiveDateEvidence } from "../effective-date-evidence";
import type {
  ApprovalRecord,
  GovernanceCase,
  GovernanceTransition,
  IntegrityReport,
  MinimumLcScheduleEntry,
  RegulatoryAlert,
  RegulatoryArtifact,
  RegulatoryChangeEvent,
  RegulatoryDataset,
  RegulatoryImpactAssessment,
  RegulatoryProduct,
  RegulatoryProvenance,
  RegulatorySource,
  RejectionRecord,
} from "../types";

type Json = unknown;

function asRecord(value: Json): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === "string" && value !== "") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function asStringArray(value: Json): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

// ─── Source ───

export interface SourceRow {
  id: string;
  authority: string;
  name: string;
  description: string;
  url: string;
  sourceType: string;
  authorityTier: number;
  monitoringMethod: string;
  checkFrequency: string;
  enabled: boolean;
  status: string;
  lastCheckedAt: Date | null;
  lastSuccessfulCheckAt: Date | null;
  lastFailedAt: Date | null;
  lastArtifactHash: string | null;
  lastKnownVersion: string | null;
  consecutiveFailures: number;
  verifiedById: string | null;
  verifiedAt: Date | null;
  verificationEvidence: string | null;
  verifiedUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function toSource(row: SourceRow): RegulatorySource {
  return {
    id: row.id,
    authority: row.authority,
    name: row.name,
    description: row.description,
    url: row.url,
    sourceType: row.sourceType as RegulatorySource["sourceType"],
    authorityTier: row.authorityTier as RegulatorySource["authorityTier"],
    monitoringMethod: row.monitoringMethod as RegulatorySource["monitoringMethod"],
    checkFrequency: row.checkFrequency as RegulatorySource["checkFrequency"],
    enabled: row.enabled,
    lastCheckedAt: row.lastCheckedAt,
    lastSuccessfulCheckAt: row.lastSuccessfulCheckAt,
    lastFailedAt: row.lastFailedAt,
    lastArtifactHash: row.lastArtifactHash,
    lastKnownVersion: row.lastKnownVersion,
    consecutiveFailures: row.consecutiveFailures,
    status: row.status as RegulatorySource["status"],
    verification:
      row.verifiedById && row.verifiedAt && row.verificationEvidence && row.verifiedUrl
        ? {
            verifiedById: row.verifiedById,
            verifiedAt: row.verifiedAt,
            evidence: row.verificationEvidence,
            confirmedUrl: row.verifiedUrl,
          }
        : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function fromSource(source: RegulatorySource) {
  return {
    id: source.id,
    authority: source.authority,
    name: source.name,
    description: source.description,
    url: source.url,
    sourceType: source.sourceType,
    authorityTier: source.authorityTier,
    monitoringMethod: source.monitoringMethod,
    checkFrequency: source.checkFrequency,
    enabled: source.enabled,
    status: source.status,
    lastCheckedAt: source.lastCheckedAt,
    lastSuccessfulCheckAt: source.lastSuccessfulCheckAt,
    lastFailedAt: source.lastFailedAt,
    lastArtifactHash: source.lastArtifactHash,
    lastKnownVersion: source.lastKnownVersion,
    consecutiveFailures: source.consecutiveFailures,
    verifiedById: source.verification?.verifiedById ?? null,
    verifiedAt: source.verification?.verifiedAt ?? null,
    verificationEvidence: source.verification?.evidence ?? null,
    verifiedUrl: source.verification?.confirmedUrl ?? null,
  };
}

// ─── Artifact ───

export interface ArtifactRow {
  id: string;
  sourceId: string;
  sourceUrl: string;
  directUrl: string;
  filename: string;
  mimeType: string;
  size: number;
  sha256: string;
  acquiredAt: Date;
  acquiredBy: string;
  publishedAt: Date | null;
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
  version: string | null;
  status: string;
  blockedReason: string | null;
  integrity: Json;
}

export function toArtifact(row: ArtifactRow): RegulatoryArtifact {
  const integrity = asRecord(row.integrity);
  return {
    artifactId: row.id,
    sourceId: row.sourceId,
    sourceUrl: row.sourceUrl,
    directUrl: row.directUrl,
    filename: row.filename,
    mimeType: row.mimeType,
    size: row.size,
    sha256: row.sha256,
    acquiredAt: row.acquiredAt,
    acquiredBy: row.acquiredBy,
    publishedAt: row.publishedAt,
    effectiveFrom: row.effectiveFrom,
    effectiveTo: row.effectiveTo,
    version: row.version,
    status: row.status as RegulatoryArtifact["status"],
    blockedReason: row.blockedReason,
    integrity: {
      sha256: String(integrity.sha256 ?? row.sha256),
      sizeBytes: Number(integrity.sizeBytes ?? row.size),
      declaredMimeType: String(integrity.declaredMimeType ?? row.mimeType),
      detectedMimeType: (integrity.detectedMimeType as string | null) ?? null,
      extension: (integrity.extension as string | null) ?? null,
      errors: asStringArray(integrity.errors),
      warnings: asStringArray(integrity.warnings),
      checks: Array.isArray(integrity.checks)
        ? (integrity.checks as IntegrityReport["checks"])
        : [],
    },
  };
}

export function fromArtifact(a: RegulatoryArtifact, rawStorageKey?: string | null) {
  return {
    id: a.artifactId,
    sourceId: a.sourceId,
    sourceUrl: a.sourceUrl,
    directUrl: a.directUrl,
    filename: a.filename,
    mimeType: a.mimeType,
    size: a.size,
    sha256: a.sha256,
    acquiredAt: a.acquiredAt,
    acquiredBy: a.acquiredBy,
    publishedAt: a.publishedAt,
    effectiveFrom: a.effectiveFrom,
    effectiveTo: a.effectiveTo,
    version: a.version,
    status: a.status,
    blockedReason: a.blockedReason,
    integrity: a.integrity as unknown as object,
    rawStorageKey: rawStorageKey ?? null,
  };
}

// ─── Product ───

export interface ProductRow {
  productCode: string;
  productCodeRaw: string | null;
  productNameAr: string;
  productNameEn: string | null;
  sectorCode: string | null;
  sectorNameAr: string | null;
  sectorNameEn: string | null;
  category: string | null;
  hsCode: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  minimumLcPct: number | null;
  minimumLcSchedule: Json;
  priceCeilingRaw: number | null;
  manufacturerBaseline: string | null;
  requirements: Json;
  applicability: string | null;
  regulatoryStatus: string;
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
}

export function toProduct(row: ProductRow): RegulatoryProduct {
  const product: RegulatoryProduct = {
    productCode: row.productCode,
    productNameAr: row.productNameAr,
    productNameEn: row.productNameEn,
    sectorCode: row.sectorCode,
    sectorNameAr: row.sectorNameAr,
    sectorNameEn: row.sectorNameEn,
    category: row.category,
    hsCode: row.hsCode,
    minimumLcPct: row.minimumLcPct,
    requirements: asStringArray(row.requirements),
    applicability: row.applicability,
    regulatoryStatus: row.regulatoryStatus as RegulatoryProduct["regulatoryStatus"],
    effectiveFrom: row.effectiveFrom,
    effectiveTo: row.effectiveTo,
    productCodeRaw: row.productCodeRaw,
    descriptionAr: row.descriptionAr,
    descriptionEn: row.descriptionEn,
    priceCeilingRaw: row.priceCeilingRaw,
    manufacturerBaseline: row.manufacturerBaseline,
  };
  if (Array.isArray(row.minimumLcSchedule)) {
    product.minimumLcSchedule = row.minimumLcSchedule as MinimumLcScheduleEntry[];
  }
  return product;
}

export function fromProduct(
  datasetId: string,
  p: RegulatoryProduct,
  datasetVersion: string,
) {
  return {
    datasetId,
    productVersionId: productVersionDigest(datasetVersion, p),
    productCode: p.productCode,
    productCodeRaw: p.productCodeRaw ?? null,
    productNameAr: p.productNameAr,
    productNameEn: p.productNameEn,
    sectorCode: p.sectorCode,
    sectorNameAr: p.sectorNameAr,
    sectorNameEn: p.sectorNameEn,
    category: p.category,
    hsCode: p.hsCode,
    descriptionAr: p.descriptionAr ?? null,
    descriptionEn: p.descriptionEn ?? null,
    minimumLcPct: p.minimumLcPct,
    // Prisma nullable Json: omit the field rather than writing SQL NULL.
    minimumLcSchedule: (p.minimumLcSchedule ?? undefined) as unknown as object | undefined,
    priceCeilingRaw: p.priceCeilingRaw ?? null,
    manufacturerBaseline: p.manufacturerBaseline ?? null,
    requirements: p.requirements as unknown as object,
    applicability: p.applicability,
    regulatoryStatus: p.regulatoryStatus,
    effectiveFrom: p.effectiveFrom,
    effectiveTo: p.effectiveTo,
  };
}

// ─── Dataset ───

export interface DatasetRow {
  id: string;
  datasetVersion: string;
  sourceId: string;
  artifactSha256: string;
  documentVersionId: string;
  parserVersion: string;
  schemaVersion: string;
  ruleVersion: string;
  status: string;
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
  activatedAt: Date | null;
  deactivatedAt: Date | null;
  provenance: Json;
  createdAt: Date;
  products?: ProductRow[];
}

export function toDataset(row: DatasetRow): RegulatoryDataset {
  const p = asRecord(row.provenance);
  const provenance: RegulatoryProvenance = {
    sourceAuthority: String(p.sourceAuthority ?? ""),
    sourceId: String(p.sourceId ?? row.sourceId),
    sourceUrl: String(p.sourceUrl ?? ""),
    directArtifactUrl: String(p.directArtifactUrl ?? ""),
    artifactFilename: String(p.artifactFilename ?? ""),
    artifactSha256: String(p.artifactSha256 ?? row.artifactSha256),
    artifactSize: Number(p.artifactSize ?? 0),
    acquiredAt: asDate(p.acquiredAt) ?? row.createdAt,
    acquiredBy: String(p.acquiredBy ?? ""),
    publicationDate: asDate(p.publicationDate),
    effectiveFrom: asDate(p.effectiveFrom),
    effectiveTo: asDate(p.effectiveTo),
    datasetVersion: String(p.datasetVersion ?? row.datasetVersion),
    documentVersion: String(p.documentVersion ?? ""),
    parserVersion: String(p.parserVersion ?? row.parserVersion),
    schemaVersion: String(p.schemaVersion ?? row.schemaVersion),
    ruleVersion: String(p.ruleVersion ?? row.ruleVersion),
  };
  return {
    datasetId: row.id,
    datasetVersion: row.datasetVersion,
    documentVersionId: row.documentVersionId,
    sourceId: row.sourceId,
    artifactSha256: row.artifactSha256,
    products: (row.products ?? []).map(toProduct),
    parserVersion: row.parserVersion,
    schemaVersion: row.schemaVersion,
    ruleVersion: row.ruleVersion,
    status: row.status as RegulatoryDataset["status"],
    effectiveFrom: row.effectiveFrom,
    effectiveTo: row.effectiveTo,
    createdAt: row.createdAt,
    activatedAt: row.activatedAt,
    deactivatedAt: row.deactivatedAt,
    provenance,
  };
}

// ─── Governance case ───

export interface CaseRow {
  id: string;
  sourceId: string;
  artifactSha256: string;
  datasetVersion: string;
  diffId: string | null;
  impactId: string | null;
  state: string;
  history: Json;
  approvedById: string | null;
  approvedByName: string | null;
  approvedAt: Date | null;
  approvalAutomatic: boolean;
  approvalPolicyId: string | null;
  approvalNote: string | null;
  rejectedById: string | null;
  rejectedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function toCase(row: CaseRow): GovernanceCase {
  const approval: ApprovalRecord | null =
    row.approvedById && row.approvedAt
      ? {
          approvedById: row.approvedById,
          approvedByName: row.approvedByName,
          approvedAt: row.approvedAt,
          automatic: row.approvalAutomatic,
          policyId: row.approvalPolicyId,
          note: row.approvalNote ?? "",
        }
      : null;
  const rejection: RejectionRecord | null =
    row.rejectedById && row.rejectedAt
      ? {
          rejectedById: row.rejectedById,
          rejectedByName: null,
          rejectedAt: row.rejectedAt,
          reason: row.rejectionReason ?? "",
        }
      : null;
  const history = (Array.isArray(row.history) ? row.history : []).map((h) => {
    const t = asRecord(h);
    return {
      from: String(t.from ?? "DETECTED"),
      to: String(t.to ?? "DETECTED"),
      at: asDate(t.at) ?? row.createdAt,
      actorId: String(t.actorId ?? ""),
      actorName: (t.actorName as string | null) ?? null,
      reason: String(t.reason ?? ""),
      correlationId: String(t.correlationId ?? ""),
    } as GovernanceTransition;
  });

  return {
    caseId: row.id,
    sourceId: row.sourceId,
    artifactSha256: row.artifactSha256,
    datasetVersion: row.datasetVersion,
    diffId: row.diffId,
    impactId: row.impactId,
    state: row.state as GovernanceCase["state"],
    history,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    approval,
    rejection,
  };
}

export function fromCase(c: GovernanceCase, correlationId: string, impact?: unknown) {
  const impactJson = (impact ?? undefined) as object | undefined;
  return {
    id: c.caseId,
    sourceId: c.sourceId,
    artifactSha256: c.artifactSha256,
    datasetVersion: c.datasetVersion,
    diffId: c.diffId,
    impactId: c.impactId,
    state: c.state,
    history: c.history as unknown as object,
    impact: impactJson,
    approvedById: c.approval?.approvedById ?? null,
    approvedByName: c.approval?.approvedByName ?? null,
    approvedAt: c.approval?.approvedAt ?? null,
    approvalAutomatic: c.approval?.automatic ?? false,
    approvalPolicyId: c.approval?.policyId ?? null,
    approvalNote: c.approval?.note ?? null,
    rejectedById: c.rejection?.rejectedById ?? null,
    rejectedAt: c.rejection?.rejectedAt ?? null,
    rejectionReason: c.rejection?.reason ?? null,
    correlationId,
  };
}

// ─── Alerts & journal ───

export function fromAlert(a: RegulatoryAlert) {
  return {
    id: a.alertId,
    category: a.category,
    severity: a.severity,
    sourceId: a.sourceId,
    changeId: a.changeId,
    summary: a.summary,
    evidence: a.evidence as unknown as object,
    effectiveDate: a.effectiveDate,
    impactLevel: a.impactLevel,
    recommendedAction: a.recommendedAction,
    status: a.status,
  };
}

export function fromChangeEvent(e: RegulatoryChangeEvent) {
  return {
    id: e.eventId,
    detectedAt: e.detectedAt,
    sourceId: e.sourceId,
    sourceName: e.sourceName,
    artifactFilename: e.artifactFilename,
    artifactSha256: e.artifactSha256,
    datasetVersion: e.datasetVersion,
    changeIds: e.changeIds as unknown as object,
    summary: e.summary,
    effectiveFrom: e.effectiveFrom,
    impactLevel: e.impactLevel,
    governanceState: e.governanceState,
    activatedAt: e.activatedAt,
    correlationId: e.correlationId,
  };
}

// ─── Effective-date evidence (P0.7) ───

export interface EvidenceRow {
  id: string;
  sourceId: string;
  dateKind: string;
  regime: string;
  artifactSha256: string | null;
  datasetId: string | null;
  scope: string;
  cohortLabel: string | null;
  productCodes: Json;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  confidence: string;
  evidence: string;
  note: string | null;
  recordedById: string;
  recordedAt: Date;
  supersededById: string | null;
  supersededAt: Date | null;
  dataset?: { datasetVersion: string } | null;
}

export function toEvidence(row: EvidenceRow): EffectiveDateEvidence {
  return {
    evidenceId: row.id,
    sourceId: row.sourceId,
    dateKind: row.dateKind as EffectiveDateEvidence["dateKind"],
    regime: row.regime as EffectiveDateEvidence["regime"],
    artifactSha256: row.artifactSha256,
    datasetVersion: row.dataset?.datasetVersion ?? null,
    scope: row.scope as EffectiveDateEvidence["scope"],
    cohortLabel: row.cohortLabel,
    productCodes: Array.isArray(row.productCodes) ? asStringArray(row.productCodes) : null,
    effectiveFrom: row.effectiveFrom,
    effectiveTo: row.effectiveTo,
    confidence: row.confidence as EffectiveDateEvidence["confidence"],
    evidence: row.evidence,
    note: row.note,
    recordedById: row.recordedById,
    recordedAt: row.recordedAt,
    supersededById: row.supersededById,
    supersededAt: row.supersededAt,
  };
}

export function fromEvidence(e: EffectiveDateEvidence, datasetId: string | null) {
  return {
    id: e.evidenceId,
    sourceId: e.sourceId,
    dateKind: e.dateKind,
    regime: e.regime,
    artifactSha256: e.artifactSha256,
    datasetId,
    scope: e.scope,
    cohortLabel: e.cohortLabel,
    productCodes: (e.productCodes ?? undefined) as unknown as object | undefined,
    effectiveFrom: e.effectiveFrom,
    effectiveTo: e.effectiveTo,
    confidence: e.confidence,
    evidence: e.evidence,
    note: e.note,
    recordedById: e.recordedById,
    recordedAt: e.recordedAt,
    supersededById: e.supersededById,
    supersededAt: e.supersededAt,
  };
}

// ─── Impact assessment ───

export function fromImpact(
  impact: RegulatoryImpactAssessment,
  datasetId: string,
  unresolvable: string[],
) {
  const s = impact.estimatedScope;
  return {
    id: impact.impactId,
    diffId: impact.diffId,
    datasetId,
    impactLevel: impact.impactLevel,
    affectedProducts: impact.affectedProducts as unknown as object,
    changeIds: impact.changeIds as unknown as object,
    affected: impact.affected as unknown as object,
    calculationCount: s.calculations,
    projectCount: s.projects,
    tenderCount: s.tenders,
    supplierCount: s.suppliers,
    contractCount: s.contracts,
    reportCount: s.reports,
    complianceCount: s.complianceAssessments,
    requiresReview: impact.requiresReview,
    rationale: impact.rationale,
    unresolvableEntities: unresolvable as unknown as object,
    computedAt: impact.computedAt,
  };
}
