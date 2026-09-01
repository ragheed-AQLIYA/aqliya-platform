import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import { removeHold } from "@/lib/core/policy/retention/holds";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { sanitizeError, httpStatusFromCode } from "@/lib/platform/api-error";
import { isPlatformAdmin } from "@/lib/authorization/platform-admin";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "ADMIN") && !isPlatformAdmin(user)) {
      throw new Error("Access denied: ADMIN role required");
    }
    const { id } = await params;

    const removed = isPlatformAdmin(user)
      ? await removeHold(id)
      : await removeHold(id, user.organizationId);

    if (removed) {
      await writePlatformAuditLog({
        productKey: "platform",
        action: "retention.hold_removed",
        actorId: user.id,
        actorEmail: user.email,
        targetType: "RetentionHold",
        targetId: id,
        severity: "info",
        metadata: { organizationId: user.organizationId },
      });
    }

    return NextResponse.json({ removed });
  } catch (err) {
    const { message, code } = sanitizeError(err);
    return NextResponse.json({ error: message }, { status: httpStatusFromCode(code) });
  }
}
