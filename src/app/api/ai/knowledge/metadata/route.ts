import { NextRequest, NextResponse } from "next/server"
import { requireUserContext } from "@/lib/auth"
import { handleAiApiError } from "@/lib/ai/api-errors"
import {
  getKnowledgeDocumentMetadata,
  resolveKnowledgeOrganizationId,
} from "@/lib/rag/knowledge-service"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const user = await requireUserContext("VIEWER")
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

    const metadata = await getKnowledgeDocumentMetadata(organizationId, documentId)

    if (!metadata) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND" } },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, data: metadata })
  } catch (error) {
    return handleAiApiError(error, "KNOWLEDGE_METADATA_ERROR")
  }
}
