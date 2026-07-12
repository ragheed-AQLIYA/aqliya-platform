import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, hasRequiredRole } from "@/lib/auth"
import { handleAiApiError } from "@/lib/core/ai/api-errors"
import {
  ingestKnowledgeDocument,
  resolveKnowledgeOrganizationId,
} from "@/lib/core/knowledge/rag/knowledge-service"

export const dynamic = "force-dynamic"
export const maxDuration = 120

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "OPERATOR")) {
      throw new Error("Access denied: OPERATOR role required");
    }
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
