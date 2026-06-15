export type ClassificationSource =
  | "firm_memory"
  | "rule"
  | "pattern"
  | "local"
  | "cloud"
  | "none";

export interface ClassificationResult {
  canonicalAccountId: string;
  canonicalCode: string;
  canonicalName: string;
  category: string;
  confidence: number;
  source: ClassificationSource;
  providerId?: string;
  evidence?: string;
  /** Structured source for explainability API (Phase 4). */
  sourceDetail?: {
    tier?: string;
  };
  /** Structured evidence for explainability API (Phase 4). */
  evidenceDetail?: {
    erpMap1?: string;
    erpMap2?: string;
    matchedPatternId?: string;
    matchedBy?: string;
    detail?: string;
  };
  /** Phase 3D — firm memory trust lifecycle when source is firm_memory. */
  memoryGovernance?: {
    status: "DRAFT" | "CONFIRMED" | "TRUSTED" | "DEPRECATED";
    trustedForAutoSuggest: boolean;
    hitCount: number;
    reviewerCount: number;
    lastUsedAt?: string;
    lastConfirmedAt?: string;
  };
}

export interface ClassifyAccountInput {
  organizationId: string;
  engagementId: string;
  accountCode: string;
  accountName: string;
  debitAmount?: number;
  creditAmount?: number;
  enableCloudAi?: boolean;
  /** Optional ERP/export mapping labels (e.g. Mapping 1 / Mapping 2 columns). */
  classificationHints?: string[];
  /** ERP BS/IS column when present (Saudi TB exports). */
  erpStatementSide?: "balance_sheet" | "income_statement";
}

export interface CanonicalCandidate {
  id: string;
  code: string;
  name: string;
  category: string;
  statementType: string;
}
