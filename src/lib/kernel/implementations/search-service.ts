import type { ISearchService, SearchResult } from "../contracts/search";
import type { KernelResult, PaginatedResult } from "../types";

export class SearchServiceWrapper implements ISearchService {
  async query(params: {
    text: string;
    organizationId: string;
    types?: string[];
    limit?: number;
    offset?: number;
  }): Promise<KernelResult<PaginatedResult<SearchResult>>> {
    return {
      success: true,
      data: { items: [], totalCount: 0, hasMore: false },
    };
  }

  async index(params: {
    id: string;
    type: string;
    title: string;
    content: string;
    organizationId: string;
    metadata?: Record<string, unknown>;
  }): Promise<KernelResult<void>> {
    return { success: true };
  }

  async suggest(params: {
    prefix: string;
    organizationId: string;
    limit?: number;
  }): Promise<KernelResult<string[]>> {
    return { success: true, data: [] };
  }
}
