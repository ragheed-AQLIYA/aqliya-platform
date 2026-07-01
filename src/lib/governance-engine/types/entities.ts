// Governance Engine — Entity Types
// M2 Baseline v1.2 (Frozen) — 12 Entities
// DO NOT MODIFY — Architecture Decision Required for changes

export type EntityType = 'Platform' | 'Product' | 'Workspace' | 'Engine' | 'Foundation' | 'Runtime' | 'Service' | 'Library';

export type Dimension = 'Implementation Reality' | 'Product Maturity' | 'Commercial Claim' | 'Strategic Intent';

export type StrategicIntentValue = 'Approved' | 'Deferred' | 'Frozen' | 'Experimental';

export type LLevelStatus = 'Verified' | 'Disputed' | 'Frozen';

export type LLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6';

export type ClaimType = 'CR-ST' | 'CR-TC' | 'CR-OP' | 'CR-MK' | 'CR-MT' | 'CR-AR';

export type ClaimStatus = 'Verified' | 'Contradicted' | 'Unverified' | 'Requires Decision' | 'Stale' | 'Superseded';

export type Priority = 'P0' | 'P1' | 'P2' | 'P3';

export type Confidence = 'High' | 'Medium' | 'Low';

export type Tier = 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'T7';

export type EvidenceQuality = 'Strong' | 'Moderate' | 'Weak';

export type SourceType = 'CODE' | 'SCHEMA' | 'TEST' | 'DOC' | 'OPERATION' | 'CONFIG' | 'COMMAND';

export type DecisionType = 'MAT' | 'STR' | 'COM' | 'FRZ' | 'MOD' | 'EVI' | 'GRC';

export type DecisionStatus = 'Draft' | 'Under Review' | 'Approved' | 'Rejected' | 'Active' | 'Superseded' | 'Archived';

export type FindingSeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Observation';

export type FindingStatus = 'Open' | 'Resolved' | 'Accepted' | 'Rejected';

// ---- Core Entities ----

export interface KnowledgeArea {
  id: string; // KA-{NN}
  name: string;
}

export interface Product {
  id: string; // PROD-{NAME}
  name: string;
  nameAr: string;
  entityType: EntityType;
  knowledgeArea: string; // KA-XXX
  authority: string; // AUTH-XXX
  currentLLevel: string;
  lLevelStatus: LLevelStatus;
  strategicIntent: StrategicIntentValue;
  parentSystem?: string;
  evidenceStatus: 'Not Started' | 'Partial' | 'Complete';
  manifestStatus: 'Missing' | 'Generated';
  dossierStatus: 'Missing' | 'Generated';
  lastVerification: string; // ISO date
}

export interface Claim {
  id: string; // CLM-{AREA}-{NNNN}
  version: string; // SemVer
  hash: string; // SHA256
  type: ClaimType;
  origin: string;
  dimension: Dimension;
  capabilities?: string[]; // CAP-{NNN}
  claimText: string;
  knowledgeArea: string;
  product: string; // PROD-XXX
  authorities: string[]; // AUTH-XXX
  evidenceRefs: string[]; // EV-NNNN
  currentDecision?: string; // DEC-YYYY-NNNN
  confidence: Confidence;
  completeness: number; // 0-100
  historicalRefs?: string[]; // HC-{PRODUCT}-{NNN}
  decisionImpact?: string;
  created: string; // ISO date
}

export interface Evidence {
  id: string; // EV-{NNNN}
  version: string; // SemVer
  tier: Tier;
  strength: EvidenceQuality;
  reusable: boolean;
  description: string;
  sourceRef: string; // SRC-{TYPE}-{NNNN}
  score: 0 | 1 | 2 | 3;
  supportsClaims: string[]; // CLM-XXX-NNNN
  freshness: FreshnessInfo;
}

export interface FreshnessInfo {
  evidenceDate: string;
  commit: string;
  verificationDate: string;
  reviewer: string;
  expires: string;
}

export interface Source {
  id: string; // SRC-{TYPE}-{NNNN}
  version: string;
  type: SourceType;
  location: string;
  description: string;
  producesEvidence: string[]; // EV-NNNN
  containedIn: string[]; // Document paths
}

export interface Authority {
  id: string; // AUTH-{AREA}
  version: string;
  knowledgeArea: string;
  document: string;
  type: 'Authority' | 'Reference';
  supersedes?: string;
  supersededBy?: string;
  chainPosition: number; // 0-5
}

export interface Decision {
  id: string; // DEC-{YYYY}-{NNNN}
  version: string;
  type: DecisionType;
  title: string;
  authority: string;
  decisionDate: string;
  effectiveDate: string;
  reviewDate: string;
  affectedClaims: string[];
  evidenceReviewed: string[];
  manifestRef?: string;
  dossierRef?: string;
  accepted: string[];
  rejected: string[];
  conditions: string[];
  rationale: string;
  governingRule: string;
  supersedes?: string;
  supersededBy?: string;
  status: DecisionStatus;
}

export interface Review {
  id: string; // REV-{YYYY}-{NNNN}
  date: string;
  reviewer: string;
  findings: string[]; // FND-REV-{YYYY}-{NNNN}
}

export interface Finding {
  id: string; // FND-{REV}-{NNNN}
  severity: FindingSeverity;
  product: string;
  category: string;
  description: string;
  recommendation: string;
  status: FindingStatus;
  resolvedBy?: string;
}

export interface Manifest {
  productId: string;
  version: string;
  hash: string;
  generated: string;
  claims: string[];
  evidenceRefs: string[];
  integrityScore: number;
}

export interface Dossier {
  productId: string;
  version: string;
  generated: string;
  manifestHash: string;
  rubricScores: Record<string, string>;
  recommendation: string;
}

// Registry container
export interface GovernanceRegistries {
  products: Product[];
  claims: Claim[];
  evidence: Evidence[];
  sources: Source[];
  authorities: Authority[];
  decisions: Decision[];
  reviews: Review[];
  findings: Finding[];
  manifests: Manifest[];
  dossiers: Dossier[];
  knowledgeAreas: KnowledgeArea[];
  frozen: boolean;
}
