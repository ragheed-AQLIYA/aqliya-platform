import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, hasRequiredRole } from "@/lib/auth"
import { handleAiApiError } from "@/lib/core/ai/api-errors"
import {
  deleteKnowledgeDocument,
  resolveKnowledgeOrganizationId,
} from "@/lib/core/knowledge/rag/knowledge-service"

export const dynamic = "force-dynamic"

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "OPERATOR")) {
      throw new Error("Access denied: OPERATOR role required");
    }
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get("documentId")

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: { code: "DOCUMENT_ID_REQUIRED" } },
        { status: 400 },
      )
    }

    const organizationId = resolveKnowledgeOrganizationId(
      user,
      searchParams.get("organizationId"),
    )

    const result = await deleteKnowledgeDocument(
      organizationId,
      documentId,
      user.id,
    )

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return handleAiApiError(error, "KNOWLEDGE_DELETE_ERROR")
  }
}
