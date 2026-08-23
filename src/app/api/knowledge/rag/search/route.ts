import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { searchIfrsKnowledge } from "@/lib/core/knowledge/rag/ifrs-search"
import { formatIfrsCitations } from "@/lib/core/knowledge/rag/ifrs-search"
import { getMetrics } from "@/lib/core/knowledge/rag/rag-metrics"

export const dynamic = "force-dynamic"

/**
 * Shared IFRS knowledge corpus lives under the platform organization
 * (D1 decision — platform-shared reference data). The session acts as an
 * authentication gate only; client-provided organization IDs are never
 * trusted for retrieval.
 */
const SHARED_KNOWLEDGE_ORG = "platform"

export async function POST(request: NextRequest) {
  // Auth guard — session required
  try {
    await getCurrentUser()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { query, standardCode, topic, limit } = body

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "query is required" }, { status: 400 })
    }

    const results = await searchIfrsKnowledge(query, {
      standardCode,
      topic,
      limit: Math.min(limit ?? 3, 10),
      organizationId: SHARED_KNOWLEDGE_ORG,
    })

    const citations = formatIfrsCitations(results)

    return NextResponse.json({
      citations,
      count: citations.length,
      metrics: getMetrics(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Search failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    await getCurrentUser()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({
    status: "healthy",
    service: "ifrs-rag-search",
    metrics: getMetrics(),
  })
}
