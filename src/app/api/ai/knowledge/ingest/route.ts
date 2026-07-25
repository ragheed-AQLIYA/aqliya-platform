import { z } from "zod"
import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, hasRequiredRole } from "@/lib/auth"
import { handleAiApiError } from "@/lib/core/ai/api-errors"
import {
  ingestKnowledgeDocument,
  resolveKnowledgeOrganizationId,
} from "@/lib/core/knowledge/rag/knowledge-service"

export const dynamic = "force-dynamic"
export const maxDuration = 120

const knowledgeIngestSchema = z.object({
  documentId: z.string().min(1),
  content: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
  productKey: z.string().optional(),
  sourceType: z.string().optional(),
  sensitivity: z.string().optional(),
  organizationId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "OPERATOR")) {
      throw new Error("Access denied: OPERATOR role required");
    }

    let body: unknown;
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid JSON body" } }, { status: 400 })
    }

    const parsed = knowledgeIngestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues.map((i) => i.message).join(" ") } },
        { status: 400 },
      )
    }

    const data = parsed.data;
    const organizationId = resolveKnowledgeOrganizationId(
      user,
      data.organizationId,
    )

    const result = await ingestKnowledgeDocument(
      organizationId,
      {
        documentId: data.documentId,
        content: data.content,
        metadata: data.metadata,
        productKey: data.productKey,
        sourceType: data.sourceType,
        sensitivity: data.sensitivity,
      },
      user.id,
    )

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return handleAiApiError(error, "KNOWLEDGE_INGEST_ERROR")
  }
}
