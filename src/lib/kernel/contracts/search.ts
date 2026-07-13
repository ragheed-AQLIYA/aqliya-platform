import type { KernelResult, PaginatedResult } from "../types";

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  snippet: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface ISearchService {
  query(params: {
    text: string;
    organizationId: string;
    types?: string[];
    limit?: number;
    offset?: number;
  }): Promise<KernelResult<PaginatedResult<SearchResult>>>;
  index(params: {
    id: string;
    type: string;
    title: string;
    content: string;
    organizationId: string;
    metadata?: Record<string, unknown>;
  }): Promise<KernelResult<void>>;
  suggest(params: {
    prefix: string;
    organizationId: string;
    limit?: number;
  }): Promise<KernelResult<string[]>>;
}
