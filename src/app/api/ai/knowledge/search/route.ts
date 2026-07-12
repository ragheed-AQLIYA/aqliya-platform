import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, hasRequiredRole } from "@/lib/auth"
import { handleAiApiError } from "@/lib/core/ai/api-errors"
import {
  searchKnowledge,
  resolveKnowledgeOrganizationId,
} from "@/lib/core/knowledge/rag/knowledge-service"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "VIEWER")) {
      throw new Error("Access denied: VIEWER role required");
    }
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
