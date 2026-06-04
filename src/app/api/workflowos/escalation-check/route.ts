import { NextResponse } from "next/server";
import { checkPendingExports } from "@/lib/workflowos/escalation-service";

export async function GET() {
  try {
    const result = await checkPendingExports();
    return NextResponse.json({
      ok: true,
      escalated: result.escalated,
      skipped: result.skipped,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    console.error("[EscalationCheck] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Escalation check failed" },
      { status: 500 },
    );
  }
}
