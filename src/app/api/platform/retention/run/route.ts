import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import { isPlatformAdmin } from "@/lib/authorization/platform-admin";
import { runScheduledRetention } from "@/lib/core/policy/retention/engine";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { addHistory } from "@/lib/core/policy/retention/history-store";
import { sanitizeError, httpStatusFromCode } from "@/lib/platform/api-error";

const retentionRunSchema = z.object({
  organizationId: z.string().optional(),
}).passthrough();

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "ADMIN") && !isPlatformAdmin(user)) {
      throw new Error("Access denied: ADMIN role required");
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      rawBody = {};
    }
    const parsed = retentionRunSchema.safeParse(rawBody);
    const data = parsed.success ? parsed.data : {};
    const organizationId = isPlatformAdmin(user)
      ? (data.organizationId ?? user.organizationId)
      : user.organizationId;
    if (!organizationId) {
      throw new Error("Access denied: organization context required");
    }
    const result = await runScheduledRetention(organizationId);

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
    const { message, code } = sanitizeError(err);
    return NextResponse.json({ error: message }, { status: httpStatusFromCode(code) });
  }
}
