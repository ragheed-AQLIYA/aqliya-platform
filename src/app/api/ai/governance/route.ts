import { NextRequest, NextResponse } from "next/server"
import { getAIGovernanceMetrics } from "@/lib/core/ai/governance-metrics"
import { getCurrentUser, hasRequiredRole } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "ADMIN")) {
      throw new Error("Access denied: ADMIN role required");
    }
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get("days") ?? "30", 10)
    const metrics = await getAIGovernanceMetrics(days)
    return NextResponse.json({ success: true, data: metrics })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    if (msg === "Unauthenticated") return NextResponse.json({ success: false, error: { code: "UNAUTHENTICATED" } }, { status: 401 })
    if (msg.startsWith("Access denied")) return NextResponse.json({ success: false, error: { code: "FORBIDDEN" } }, { status: 403 })
    return NextResponse.json({ success: false, error: { code: "GOVERNANCE_ERROR" } }, { status: 500 })
  }
}
