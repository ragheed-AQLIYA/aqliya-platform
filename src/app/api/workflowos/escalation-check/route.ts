import { NextResponse } from "next/server";
import { createLogger } from "@/lib/observability/logger";
import { checkPendingExports } from "@/lib/workflowos/escalation-service";
import { getCurrentUser } from "@/lib/auth";
import { hasRequiredRole } from "@/lib/kernel";


const logger = createLogger({ product: "platform", action: "unknown" });

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "VIEWER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await checkPendingExports();
    return NextResponse.json({
      ok: true,
      escalated: result.escalated,
      skipped: result.skipped,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    logger.error("[EscalationCheck] Error:", error instanceof Error ? error : undefined);
    return NextResponse.json(
      { ok: false, error: "Escalation check failed" },
      { status: 500 },
    );
  }
}
