import "server-only";

export interface KnowledgeFoundationExportInput {
  versionId: string;
  versionNumber: string;
  status: string;
  notes: string | null;
  candidateCount: number;
  artifactPath: string | null;
  createdByName: string | null;
  approvedByName: string | null;
  activatedAt: string | null;
  createdAt: string;
  rollbackVersionId: string | null;
  candidateBindings?: Array<{
    phrase: string;
    canonicalCode: string;
    category: string;
    confidence: number;
  }>;
  releases?: Array<{
    id: string;
    releaseNotes: string | null;
    createdAt: string;
    createdByName: string | null;
  }>;
  diffsAsFrom?: Array<{
    toVersion: string;
    riskScore: number;
    breakingChange: boolean;
    summary: string | null;
    generatedAt: string;
  }>;
}

export interface KnowledgeFoundationExportResult {
  format: "pdf" | "json";
  filename: string;
  mimeType: string;
  content: Buffer;
}
