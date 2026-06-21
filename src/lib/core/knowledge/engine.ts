import "server-only";

import {
  retrieveGovernedContext,
  type GovernedRAGContext,
} from "@/lib/rag/intelligence-core-rag";

export interface KnowledgeRetrieveInput {
  organizationId: string;
  query: string;
  limit?: number;
  minScore?: number;
}

/**
 * IC-P1-04 — canonical governed knowledge retrieval entry.
 */
export async function retrieve(
  input: KnowledgeRetrieveInput,
): Promise<GovernedRAGContext> {
  return retrieveGovernedContext(input.query, {
    organizationId: input.organizationId,
    limit: input.limit,
    minSimilarity: input.minScore,
  });
}

export const KnowledgeEngine = {
  retrieve,
};

export type { GovernedRAGContext };
