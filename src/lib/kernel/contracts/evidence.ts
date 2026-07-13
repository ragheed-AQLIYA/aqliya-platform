import type { KernelResult, PaginatedResult } from "../types";

export interface EvidenceItem {
  id: string;
  organizationId: string;
  workspaceId?: string;
  engagementId?: string;
  title: string;
  description?: string;
  category: string;
  sourceType: string;
  sourceId?: string;
  fileKey?: string;
  checksum?: string;
  metadata?: Record<string, unknown>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEvidenceInput {
  organizationId: string;
  workspaceId?: string;
  engagementId?: string;
  title: string;
  description?: string;
  category: string;
  sourceType: string;
  sourceId?: string;
  fileKey?: string;
  checksum?: string;
  metadata?: Record<string, unknown>;
  createdBy: string;
}

export interface IEvidenceService {
  create(input: CreateEvidenceInput): Promise<KernelResult<EvidenceItem>>;
  getById(id: string, organizationId: string): Promise<KernelResult<EvidenceItem>>;
  list(params: {
    organizationId: string;
    engagementId?: string;
    category?: string;
    skip?: number;
    take?: number;
  }): Promise<KernelResult<PaginatedResult<EvidenceItem>>>;
  linkToOutput(evidenceId: string, outputType: string, outputId: string): Promise<KernelResult<void>>;
}
