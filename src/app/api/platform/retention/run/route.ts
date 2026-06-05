import { NextRequest, NextResponse } from "next/server";
import { requireUserContext } from "@/lib/auth";
import { runScheduledRetention } from "@/lib/platform/retention/engine";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { addHistory } from "@/lib/platform/retention/history-store";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUserContext("ADMIN");

    const body = (await request.json().catch(() => ({}))) as { organizationId?: string };
    const result = await runScheduledRetention(body.organizationId ?? user.platformOrganizationId);

    const historyEntry = {
      id: crypto.randomUUID(),
      startedAt: new Date(Date.now() - result.durationMs).toISOString(),
      completedAt: new Date().toISOString(),
      totalAffected: result.totalAffected,
      durationMs: result.durationMs,
      triggeredBy: user.email,
    };
    addHistory(historyEntry);

    await writePlatformAuditLog({
      productKey: "platform",
      action: "retention.run_completed",
      actorId: user.id,
      actorEmail: user.email,
      severity: "info",
      metadata: { totalAffected: result.totalAffected, durationMs: result.durationMs, jobs: result.jobs.length },
    });

    return NextResponse.json({ ...result, historyEntry });
  } catch (err) {
    if (err instanceof Error && (err.message === "Unauthenticated" || err.message.startsWith("Access denied"))) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
