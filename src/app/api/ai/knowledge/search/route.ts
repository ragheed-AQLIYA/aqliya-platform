import { NextRequest, NextResponse } from "next/server"
import { requireUserContext } from "@/lib/auth"
import { handleAiApiError } from "@/lib/ai/api-errors"
import {
  searchKnowledge,
  resolveKnowledgeOrganizationId,
} from "@/lib/rag/knowledge-service"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const user = await requireUserContext("VIEWER")
    const { searchParams } = new URL(request.url)

    const organizationId = resolveKnowledgeOrganizationId(
      user,
      searchParams.get("organizationId"),
    )

    const governed = searchParams.get("governed") !== "false"

    const result = await searchKnowledge(organizationId, {
      query: searchParams.get("query") ?? "",
      limit: parseInt(searchParams.get("limit") ?? "10", 10),
      minSimilarity: parseFloat(searchParams.get("minSimilarity") ?? "0.25"),
      documentId: searchParams.get("documentId") ?? undefined,
      governed,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return handleAiApiError(error, "KNOWLEDGE_SEARCH_ERROR")
  }
}
