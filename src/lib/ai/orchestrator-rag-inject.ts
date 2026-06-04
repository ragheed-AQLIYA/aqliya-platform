import "server-only"
import { isEnabled } from "@/lib/platform/feature-flags/registry"
import {
  retrieveGovernedContext,
  formatGovernedRAGForPrompt,
  toGovernedRAGPayload,
} from "@/lib/rag/intelligence-core-rag"
import type { AIRequest } from "./types"

function extractRagQuery(taskInput: Record<string, unknown>): string | null {
  if (typeof taskInput.query === "string" && taskInput.query.trim()) {
    return taskInput.query.trim()
  }
  if (typeof taskInput.text === "string" && taskInput.text.trim()) {
    return taskInput.text.trim()
  }
  return null
}

/**
 * Injects governed RAG context into an assembled AI request (generate + stream parity).
 * Failures are non-blocking — generation continues without RAG.
 */
export async function injectGovernedRagIntoRequest(
  assembledRequest: AIRequest,
  organizationId: string | undefined,
): Promise<AIRequest> {
  if (!organizationId || !isEnabled("ai.rag")) {
    return assembledRequest
  }

  const ragQuery = extractRagQuery(assembledRequest.taskInput)
  if (!ragQuery) {
    return assembledRequest
  }

  try {
    const governedRag = await retrieveGovernedContext(ragQuery, {
      organizationId,
      limit: 5,
      minSimilarity: 0.25,
    })
    const ragBlock = formatGovernedRAGForPrompt(governedRag)
    if (!ragBlock && governedRag.evidence.length === 0) {
      return assembledRequest
    }

    return {
      ...assembledRequest,
      taskInput: {
        ...assembledRequest.taskInput,
        ragContext: ragBlock,
        ragEvidence: governedRag.evidence,
        ragRanking: governedRag.ranking,
        ragGovernance: toGovernedRAGPayload(governedRag),
      },
    }
  } catch {
    return assembledRequest
  }
}
