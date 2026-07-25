import "server-only"
import { prisma } from "@/lib/prisma"
import { normalizeType, writeEvent, MUTATION_ACTIONS } from "./common"
import type { SearchMemoryInput } from "./common"

// ─── Search and Query ───

export async function searchMemory(input: SearchMemoryInput): Promise<unknown[]> {
  const maxResults = input.maxResults ?? 20
  const where: Record<string, unknown> = {}

  if (input.organizationId) {
    where.organizationId = input.organizationId
  }

  if (input.query) {
    where.OR = [
      { name: { contains: input.query, mode: "insensitive" } },
    ]
  }

  if (input.nodeTypes && input.nodeTypes.length > 0) {
    where.type = { in: input.nodeTypes.map(t => normalizeType(t)) }
  }

  const results = await prisma.intelligenceGraphNode.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: maxResults,
  })

  await logQuery(input.query, results.length, input.userId, input.organizationId)

  return results
}

export async function logQuery(
  query: string,
  resultCount: number,
  userId?: string,
  organizationId?: string,
): Promise<void> {
  try {
    await prisma.intelligenceQuery.create({
      data: {
        organizationId: organizationId ?? "",
        query,
        resultCount,
        userId: userId ?? null,
        results: [],
      },
    })

    await writeEvent({
      organizationId,
      action: MUTATION_ACTIONS.QUERY_EXECUTED,
      metadata: { query, resultCount },
      performedBy: userId,
    })
  } catch {
    // Non-blocking
  }
}
