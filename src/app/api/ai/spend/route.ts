import { NextRequest, NextResponse } from "next/server"
import { getAISpendSummary } from "@/lib/ai/spend-tracker"
import { requireUserContext } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    await requireUserContext("ADMIN")
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get("days") ?? "30", 10)
    const summary = await getAISpendSummary(days)
    return NextResponse.json({ success: true, data: summary })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    if (msg === "Unauthenticated") return NextResponse.json({ success: false, error: { code: "UNAUTHENTICATED" } }, { status: 401 })
    if (msg.startsWith("Access denied")) return NextResponse.json({ success: false, error: { code: "FORBIDDEN" } }, { status: 403 })
    return NextResponse.json({ success: false, error: { code: "SPEND_ERROR" } }, { status: 500 })
  }
}
