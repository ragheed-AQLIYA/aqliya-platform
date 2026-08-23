import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getMetrics } from "@/lib/core/knowledge/rag/rag-metrics"
import { getCacheStats } from "@/lib/core/knowledge/rag/rag-cache"
import { getRemainingRequests } from "@/lib/core/knowledge/rag/rag-rate-limiter"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await getCurrentUser()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const metrics = getMetrics()
  const cache = getCacheStats()

  return NextResponse.json({
    status: "healthy",
    service: "ifrs-rag",
    metrics: {
      ...cache,
      ...metrics,
    },
    rateLimits: {
      platform: getRemainingRequests("platform"),
    },
    timestamp: new Date().toISOString(),
  })
}
