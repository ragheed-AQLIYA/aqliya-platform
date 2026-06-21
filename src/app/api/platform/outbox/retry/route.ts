import { NextResponse } from "next/server";
import { requireUserContext } from "@/lib/auth";
import { AuditEngine } from "@/lib/core/audit";
import { retryFailedOutboxEvents } from "@/lib/core/events/outbox-service";

export const dynamic = "force-dynamic";

/** ADMIN — reset failed outbox rows to pending for operator replay. */
export async function POST(request: Request) {
  try {
    const user = await requireUserContext("ADMIN");
    let ids: string[] | undefined;
    try {
      const body = (await request.json()) as { ids?: string[] };
      if (Array.isArray(body?.ids) && body.ids.length > 0) {
        ids = body.ids;
      }
    } catch {
      ids = undefined;
    }

    const result = await retryFailedOutboxEvents({ ids, limit: 50 });

    await AuditEngine.write({
      productKey: "platform",
      sourceSystem: "outbox_operator",
      platformOrganizationId: user.organizationId,
      actorId: user.id,
      action: "platform.outbox.retry",
      targetType: "outbox",
      targetId: result.ids.join(",") || "none",
      metadata: { retried: result.retried, ids: result.ids },
    }).catch(() => {});

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Outbox retry failed";
    return NextResponse.json({ ok: false, error: message }, { status: 403 });
  }
}
