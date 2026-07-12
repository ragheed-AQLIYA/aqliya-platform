import { NextRequest, NextResponse } from "next/server"
import { getHealthCheck, getSystemMetrics, getQueueMetrics, getFailedJobs } from "@/lib/platform/monitoring/system-monitor"
import { getCurrentUser, hasRequiredRole } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "ADMIN")) {
      throw new Error("Access denied: ADMIN role required");
    }
    const { searchParams } = new URL(request.url)
    const scope = searchParams.get("scope") ?? "all"

    const result: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
    }

    if (scope === "health" || scope === "all") {
      result.health = await getHealthCheck()
    }
    if (scope === "system" || scope === "all") {
      result.system = getSystemMetrics()
    }
    if (scope === "queue" || scope === "all") {
      result.queue = await getQueueMetrics()
      result.failedJobs = await getFailedJobs(10)
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    if (msg === "Unauthenticated") {
      return NextResponse.json({ success: false, error: { code: "UNAUTHENTICATED" } }, { status: 401 })
    }
    if (msg.startsWith("Access denied")) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN" } }, { status: 403 })
    }
    return NextResponse.json({ success: false, error: { code: "MONITORING_ERROR" } }, { status: 500 })
  }
}
