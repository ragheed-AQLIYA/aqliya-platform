// LocalContentOS domain types

export const VALID_PROJECT_STATUSES = [
  "Draft",
  "DataCollection",
  "ClassificationInProgress",
  "EvidenceReview",
  "FindingsDrafted",
  "InReview",
  "Returned",
  "Approved",
  "Rejected",
  "ReportReady",
  "Exported",
  "Archived",
] as const;
export type LocalContentProjectStatus = (typeof VALID_PROJECT_STATUSES)[number];

export const VALID_SUPPLIER_LOCALITIES = [
  "local",
  "non_local",
  "mixed",
  "unclassified",
] as const;
export type SupplierLocality = (typeof VALID_SUPPLIER_LOCALITIES)[number];

export const VALID_OWNERSHIP_TYPES = [
  "Saudi",
  "foreign",
  "joint_venture",
] as const;
export type OwnershipType = (typeof VALID_OWNERSHIP_TYPES)[number];

export const VALID_EVIDENCE_TYPES = [
  "certificate",
  "contract",
  "attestation",
  "invoice",
  "registration",
  "other",
] as const;
export type EvidenceType = (typeof VALID_EVIDENCE_TYPES)[number];

export const VALID_EVIDENCE_STATUSES = [
  "uploaded",
  "linked",
  "reviewed",
  "verified",
  "rejected",
  "missing",
] as const;
export type EvidenceStatus = (typeof VALID_EVIDENCE_STATUSES)[number];

export const VALID_FINDING_TYPES = [
  "evidence_gap",
  "low_content",
  "unclassified_supplier",
  "data_quality",
  "compliance_risk",
] as const;
export type FindingType = (typeof VALID_FINDING_TYPES)[number];

export const VALID_FINDING_SEVERITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;
export type FindingSeverity = (typeof VALID_FINDING_SEVERITIES)[number];

export const VALID_CLASSIFICATION_BASES = [
  "certificate",
  "self_declaration",
  "contract_term",
  "analyst_estimate",
] as const;
export type ClassificationBasis = (typeof VALID_CLASSIFICATION_BASES)[number];

export const VALID_CONFIDENCE_LEVELS = [
  "high",
  "medium",
  "low",
  "unverified",
] as const;
export type ConfidenceLevel = (typeof VALID_CONFIDENCE_LEVELS)[number];

export interface ScoringResult {
  totalSpend: number;
  localSpend: number;
  nonLocalSpend: number;
  mixedSpend: number;
  unclassifiedSpend: number;
  localContentPercentage: number;
  supplierCounts: {
    total: number;
    local: number;
    nonLocal: number;
    mixed: number;
    unclassified: number;
  };
  evidenceStats: {
    total: number;
    verified: number;
    reviewed: number;
    uploaded: number;
    linked: number;
    rejected: number;
    missing: number;
    coveragePercentage: number;
  };
  findingStats: {
    total: number;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
  };
  classificationStats: {
    total: number;
    confirmed: number;
    draft: number;
    disputed: number;
    byBasis: Record<string, number>;
  };
}

export interface CreateProjectInput {
  organizationId: string;
  name: string;
  reportingPeriod: string;
  scopeDescription?: string;
  platformOrganizationId?: string;
  clientWorkspaceId?: string;
  projectId?: string;
  createdById?: string;
  createdByName?: string;
}

export interface CreateSupplierInput {
  projectId: string;
  name: string;
  crNumber?: string;
  localityClassification?: string;
  localContentPercentage?: number;
  ownershipType?: string;
  workforceLocalPct?: number;
}

export interface CreateSpendRecordInput {
  projectId: string;
  supplierId: string;
  amount: number;
  category: string;
  currency?: string;
  contractReference?: string;
  period: string;
  description?: string;
}

export interface CreateClassificationInput {
  projectId: string;
  supplierId?: string;
  spendRecordId?: string;
  classifiedBy?: string;
  localPercentage: number;
  classificationBasis: string;
  confidence?: string;
  notes?: string;
}

export interface CreateFindingInput {
  projectId: string;
  type: string;
  severity?: string;
  title: string;
  description: string;
  linkedSupplierId?: string;
  linkedSpendRecordId?: string;
  createdById?: string;
  createdByName?: string;
}
