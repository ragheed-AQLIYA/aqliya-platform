import { NextRequest, NextResponse } from "next/server"
import { evaluateWithGate, getGateThreshold, registerGateThreshold } from "@/lib/ai/eval-gate"
import { requireUserContext } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const user = await requireUserContext("OPERATOR")
    const body = await request.json()
    const { suiteId, taskType, actualOutput } = body

    if (!suiteId || !taskType || actualOutput === undefined) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "suiteId, taskType, and actualOutput are required" } }, { status: 400 })
    }

    const result = await evaluateWithGate(suiteId, taskType, String(actualOutput), user.organizationId ?? undefined)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    if (msg === "Unauthenticated") return NextResponse.json({ success: false, error: { code: "UNAUTHENTICATED" } }, { status: 401 })
    if (msg.startsWith("Access denied")) return NextResponse.json({ success: false, error: { code: "FORBIDDEN" } }, { status: 403 })
    return NextResponse.json({ success: false, error: { code: "EVAL_GATE_ERROR" } }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireUserContext("ADMIN")
    const { searchParams } = new URL(request.url)
    const suiteId = searchParams.get("suiteId")
    if (suiteId) {
      return NextResponse.json({ success: true, data: { suiteId, threshold: getGateThreshold(suiteId) } })
    }
    return NextResponse.json({ success: true, data: { message: "Specify suiteId to get threshold" } })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    if (msg === "Unauthenticated") return NextResponse.json({ success: false, error: { code: "UNAUTHENTICATED" } }, { status: 401 })
    return NextResponse.json({ success: false, error: { code: "EVAL_GATE_ERROR" } }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireUserContext("ADMIN")
    const body = await request.json()
    const { suiteId, threshold } = body
    if (!suiteId || threshold === undefined) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "suiteId and threshold are required" } }, { status: 400 })
    }
    registerGateThreshold(suiteId, Number(threshold))
    return NextResponse.json({ success: true, data: { suiteId, threshold: Number(threshold) } })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    if (msg === "Unauthenticated") return NextResponse.json({ success: false, error: { code: "UNAUTHENTICATED" } }, { status: 401 })
    if (msg.startsWith("Access denied")) return NextResponse.json({ success: false, error: { code: "FORBIDDEN" } }, { status: 403 })
    return NextResponse.json({ success: false, error: { code: "EVAL_GATE_ERROR" } }, { status: 500 })
  }
}
