import "server-only";

export interface CreateVersionInput {
  versionNumber: string;
  notes?: string;
  createdById: string;
  candidateIds?: string[];
}

export interface UpdateVersionStatusInput {
  versionId: string;
  status: "DRAFT" | "APPROVED" | "RELEASED" | "ACTIVE" | "DEPRECATED";
  actorId: string;
  notes?: string;
}

export interface ApproveVersionInput {
  versionId: string;
  approvedById: string;
  notes?: string;
}

export interface RollbackInput {
  versionId: string;
  targetVersionId: string;
  actorId: string;
  reason: string;
}

export interface ReleasePackage {
  versionId: string;
  versionNumber: string;
  manifest: {
    versionId: string;
    versionNumber: string;
    candidateIds: string[];
    candidateCount: number;
    sha256: string;
    generatedAt: string;
    provenance: Record<string, unknown>;
    artifactPath: string;
    /** @deprecated Use sha256 */
    hash?: string;
    createdAt?: string;
  };
  candidateList: Array<{
    id: string;
    phrase: string;
    canonicalCode: string;
    category: string;
    confidence: number;
  }>;
  knowledgeFoundation: {
    versionId: string;
    rules: Array<{
      phrase: string;
      canonicalCode: string;
      category: string;
      confidence: number;
      supportCount: number;
      organizationCount: number;
    }>;
    releasedAt: string;
    versionNumber: string;
    totalCandidates: number;
    candidateIds: string[];
  };
  releaseNotes: string;
  changeSummary: {
    versionId: string;
    versionNumber: string;
    candidateIds: string[];
    candidateCount: number;
    addedCount: number;
    modifiedCount: number;
    removedCount: number;
    breakingChange: boolean;
    riskScore: number;
    generatedAt: string;
  };
}

export interface DiffResult {
  fromVersionId: string;
  toVersionId: string;
  fromVersionNumber: string;
  toVersionNumber: string;
  addedRules: Array<{ phrase: string; canonicalCode: string; category: string; confidence: number }>;
  modifiedRules: Array<{ phrase: string; canonicalCode: string; category: string; oldConfidence: number; newConfidence: number }>;
  removedRules: Array<{ phrase: string; canonicalCode: string; category: string; confidence: number }>;
  breakingChange: boolean;
  riskScore: number;
  summary: string;
}

export interface VersionListItem {
  id: string;
  versionNumber: string;
  status: string;
  candidateCount: number;
  createdById: string;
  createdByName: string | null;
  approvedById: string | null;
  approvedByName: string | null;
  activatedAt: string | null;
  createdAt: string;
  rollbackVersionId: string | null;
  notes: string | null;
}

export interface FoundationVersionStatusCounts {
  DRAFT: number;
  APPROVED: number;
  RELEASED: number;
  ACTIVE: number;
  DEPRECATED: number;
}

export interface FoundationCandidateMetrics {
  eligiblePromoted: number;
  boundCandidates: number;
  releasedCandidates: number;
  averageConfidence: number;
  averageEvidenceCount: number;
}

export interface FoundationKPIs {
  activeVersion: string | null;
  totalVersions: number;
  totalReleases: number;
  rollbackCount: number;
  latestVersionId: string | null;
  versionCounts: FoundationVersionStatusCounts;
  candidateMetrics: FoundationCandidateMetrics;
}
