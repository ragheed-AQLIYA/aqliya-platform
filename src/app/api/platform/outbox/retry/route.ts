import { z } from "zod";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { AuditEngine } from "@/lib/core/audit";
import { retryFailedOutboxEvents } from "@/lib/core/events/outbox-service";
import { sanitizeError, sanitizeErrorResponse, httpStatusFromCode } from "@/lib/platform/api-error";
import { assertPlatformAdmin } from "@/lib/authorization/platform-admin";

export const dynamic = "force-dynamic";

const outboxRetrySchema = z.object({
  ids: z.array(z.string().min(1)).max(100).optional(),
}).passthrough();

/** ADMIN — reset failed outbox rows to pending for operator replay. */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    assertPlatformAdmin(user);
    let ids: string[] | undefined;
    try {
      let rawBody: unknown;
      try {
        rawBody = await request.json();
      } catch {
        rawBody = {};
      }
      const parsed = outboxRetrySchema.safeParse(rawBody);
      if (parsed.success && Array.isArray(parsed.data.ids) && parsed.data.ids.length > 0) {
        ids = parsed.data.ids;
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
    const { code } = sanitizeError(error);
    return NextResponse.json(sanitizeErrorResponse(error), { status: httpStatusFromCode(code) });
  }
}
