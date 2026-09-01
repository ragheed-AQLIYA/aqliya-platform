import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import { addHold, listHolds } from "@/lib/core/policy/retention/holds";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { sanitizeError, httpStatusFromCode } from "@/lib/platform/api-error";
import { isPlatformAdmin } from "@/lib/authorization/platform-admin";

const addHoldSchema = z.object({
  recordType: z.string().min(1).max(200),
  recordId: z.string().min(1).max(200),
  reason: z.string().min(1).max(2000),
});

function assertRetentionHoldAccess(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  if (!hasRequiredRole(user, "ADMIN") && !isPlatformAdmin(user)) {
    throw new Error("Access denied: ADMIN role required");
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    assertRetentionHoldAccess(user);
    const holds = isPlatformAdmin(user)
      ? await listHolds()
      : await listHolds(user.organizationId);
    return NextResponse.json({ holds });
  } catch (err) {
    const { message, code } = sanitizeError(err);
    return NextResponse.json({ error: message }, { status: httpStatusFromCode(code) });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    assertRetentionHoldAccess(user);
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = addHoldSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(" ") },
        { status: 400 },
      );
    }

    const { recordType, recordId, reason } = parsed.data;

    const hold = await addHold({
      recordType,
      recordId,
      reason,
      userId: user.id,
      organizationId: user.organizationId,
    });

    await writePlatformAuditLog({
      productKey: "platform",
      action: "retention.hold_added",
      actorId: user.id,
      actorEmail: user.email,
      targetType: "RetentionHold",
      targetId: hold.id,
      severity: "warning",
      metadata: { recordType, recordId, reason, organizationId: user.organizationId },
    });

    return NextResponse.json({ hold });
  } catch (err) {
    const { message, code } = sanitizeError(err);
    return NextResponse.json({ error: message }, { status: httpStatusFromCode(code) });
  }
}
