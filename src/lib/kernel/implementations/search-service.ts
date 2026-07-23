import type { ISearchService, SearchResult } from "../contracts/search";
import type { KernelResult, PaginatedResult } from "../types";
import { prisma } from "../prisma";

export class SearchServiceWrapper implements ISearchService {
  async query(params: {
    text: string;
    organizationId: string;
    types?: string[];
    limit?: number;
    offset?: number;
  }): Promise<KernelResult<PaginatedResult<SearchResult>>> {
    try {
      const results: SearchResult[] = [];
      const limit = params.limit ?? 20;

      if (params.types?.includes("decision") || !params.types?.length) {
        const decisions = await prisma.decision.findMany({
          where: {
            organizationId: params.organizationId,
            title: { contains: params.text, mode: "insensitive" },
          },
          select: { id: true, title: true, type: true, status: true, createdAt: true },
          take: limit,
          skip: params.offset ?? 0,
        });
        for (const d of decisions) {
          results.push({
            id: d.id,
            type: "decision",
            title: d.title,
            snippet: `${d.type} · ${d.status}`,
            score: 1.0,
          });
        }
      }

      if (params.types?.includes("deal") || !params.types?.length) {
        const deals = await prisma.salesDeal.findMany({
          where: {
            organizationId: params.organizationId,
            title: { contains: params.text, mode: "insensitive" },
          },
          select: { id: true, title: true, pipelineStage: true, status: true, createdAt: true },
          take: limit,
          skip: params.offset ?? 0,
        });
        for (const d of deals) {
          results.push({
            id: d.id,
            type: "deal",
            title: d.title,
            snippet: `${d.pipelineStage} · ${d.status}`,
            score: 1.0,
          });
        }
      }

      return {
        success: true,
        data: {
          items: results.slice(0, limit),
          totalCount: results.length,
          hasMore: results.length >= limit,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Search failed",
      };
    }
  }

  async index(params: {
    id: string;
    type: string;
    title: string;
    content: string;
    organizationId: string;
    metadata?: Record<string, unknown>;
  }): Promise<KernelResult<void>> {
    // Indexing is implicit via Prisma. Full-text index would use Elasticsearch/Meilisearch.
    void params; // Acknowledge for now
    return { success: true };
  }

  async suggest(params: {
    prefix: string;
    organizationId: string;
    limit?: number;
  }): Promise<KernelResult<string[]>> {
    try {
      const decisions = await prisma.decision.findMany({
        where: {
          organizationId: params.organizationId,
          title: { startsWith: params.prefix, mode: "insensitive" },
        },
        select: { title: true },
        take: params.limit ?? 10,
      });
      return {
        success: true,
        data: decisions.map((d) => d.title),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Suggest failed",
      };
    }
  }
}
