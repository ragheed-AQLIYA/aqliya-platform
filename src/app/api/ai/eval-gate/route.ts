import { z } from "zod"
import { NextRequest, NextResponse } from "next/server"
import { evaluateWithGate, getGateThreshold, registerGateThreshold } from "@/lib/core/ai/eval-gate"
import { getCurrentUser, hasRequiredRole } from "@/lib/auth"
import { assertPlatformAdmin } from "@/lib/authorization/platform-admin"

export const dynamic = "force-dynamic"

const evalGatePostSchema = z.object({
  suiteId: z.string().min(1),
  taskType: z.string().min(1),
  actualOutput: z.string().min(1),
});

const evalGatePutSchema = z.object({
  suiteId: z.string().min(1),
  threshold: z.number().min(0).max(1),
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

    const parsed = evalGatePostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues.map((i) => i.message).join(" ") } },
        { status: 400 },
      )
    }

    const { suiteId, taskType, actualOutput } = parsed.data;
    const result = await evaluateWithGate(suiteId, taskType, actualOutput, user.organizationId ?? undefined)
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
    const user = await getCurrentUser();
    assertPlatformAdmin(user);
    const { searchParams } = new URL(request.url)
    const suiteId = searchParams.get("suiteId")
    if (suiteId) {
      return NextResponse.json({ success: true, data: { suiteId, threshold: getGateThreshold(suiteId) } })
    }
    return NextResponse.json({ success: true, data: { message: "Specify suiteId to get threshold" } })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    if (msg === "Unauthenticated") return NextResponse.json({ success: false, error: { code: "UNAUTHENTICATED" } }, { status: 401 })
    if (msg.startsWith("Access denied")) return NextResponse.json({ success: false, error: { code: "FORBIDDEN" } }, { status: 403 })
    return NextResponse.json({ success: false, error: { code: "EVAL_GATE_ERROR" } }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    assertPlatformAdmin(user);

    let body: unknown;
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid JSON body" } }, { status: 400 })
    }

    const parsed = evalGatePutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues.map((i) => i.message).join(" ") } },
        { status: 400 },
      )
    }

    const { suiteId, threshold } = parsed.data;
    registerGateThreshold(suiteId, threshold)
    return NextResponse.json({ success: true, data: { suiteId, threshold } })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    if (msg === "Unauthenticated") return NextResponse.json({ success: false, error: { code: "UNAUTHENTICATED" } }, { status: 401 })
    if (msg.startsWith("Access denied")) return NextResponse.json({ success: false, error: { code: "FORBIDDEN" } }, { status: 403 })
    return NextResponse.json({ success: false, error: { code: "EVAL_GATE_ERROR" } }, { status: 500 })
  }
}
