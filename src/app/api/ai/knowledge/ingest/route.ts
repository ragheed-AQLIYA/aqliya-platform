import { NextRequest, NextResponse } from "next/server"
import { requireUserContext } from "@/lib/auth"
import { handleAiApiError } from "@/lib/ai/api-errors"
import {
  ingestKnowledgeDocument,
  resolveKnowledgeOrganizationId,
} from "@/lib/rag/knowledge-service"

export const dynamic = "force-dynamic"
export const maxDuration = 120

export async function POST(request: NextRequest) {
  try {
    const user = await requireUserContext("OPERATOR")
    const body = await request.json()

    const organizationId = resolveKnowledgeOrganizationId(
      user,
      body.organizationId,
    )

    const result = await ingestKnowledgeDocument(
      organizationId,
      {
        documentId: body.documentId,
        content: body.content,
        metadata: body.metadata,
        productKey: body.productKey,
        sourceType: body.sourceType,
        sensitivity: body.sensitivity,
      },
      user.id,
    )

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return handleAiApiError(error, "KNOWLEDGE_INGEST_ERROR")
  }
}
