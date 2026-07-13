import type { KernelResult, PaginatedResult } from "../types";

export interface KnowledgeItem {
  id: string;
  organizationId: string;
  type: string;
  content: string;
  source?: string;
  confidence: number;
  tags: string[];
  metadata?: Record<string, unknown>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IKnowledgeService {
  record(input: {
    organizationId: string;
    type: string;
    content: string;
    source?: string;
    confidence?: number;
    tags?: string[];
    metadata?: Record<string, unknown>;
    createdBy: string;
  }): Promise<KernelResult<KnowledgeItem>>;
  recall(params: {
    organizationId: string;
    query: string;
    type?: string;
    tags?: string[];
    limit?: number;
  }): Promise<KernelResult<PaginatedResult<KnowledgeItem>>>;
  classify(itemId: string, classification: string): Promise<KernelResult<void>>;
}
