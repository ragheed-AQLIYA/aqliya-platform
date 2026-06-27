import { NextRequest, NextResponse } from "next/server";
import { requireUserContext } from "@/lib/auth";
import { removeHold } from "@/lib/core/policy/retention/holds";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUserContext("ADMIN");
    const { id } = await params;

    const removed = await removeHold(id);

    if (removed) {
      await writePlatformAuditLog({
        productKey: "platform",
        action: "retention.hold_removed",
        actorId: user.id,
        actorEmail: user.email,
        targetType: "RetentionHold",
        targetId: id,
        severity: "info",
      });
    }

    return NextResponse.json({ removed });
  } catch (err) {
    if (err instanceof Error && (err.message === "Unauthenticated" || err.message.startsWith("Access denied"))) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
