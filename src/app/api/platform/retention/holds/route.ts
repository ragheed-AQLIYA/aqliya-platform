import { NextRequest, NextResponse } from "next/server";
import { requireUserContext } from "@/lib/auth";
import { addHold, listHolds } from "@/lib/core/policy/retention/holds";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";

export async function GET() {
  try {
    const user = await requireUserContext("ADMIN");
    const holds = await listHolds(user.platformOrganizationId);
    return NextResponse.json({ holds });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUserContext("ADMIN");
    const body = (await request.json()) as {
      recordType: string;
      recordId: string;
      reason: string;
    };

    if (!body.recordType || !body.recordId || !body.reason) {
      return NextResponse.json({ error: "recordType, recordId, and reason are required" }, { status: 400 });
    }

    const hold = await addHold({
      recordType: body.recordType,
      recordId: body.recordId,
      reason: body.reason,
      userId: user.id,
      organizationId: user.platformOrganizationId,
    });

    await writePlatformAuditLog({
      productKey: "platform",
      action: "retention.hold_added",
      actorId: user.id,
      actorEmail: user.email,
      targetType: "RetentionHold",
      targetId: hold.id,
      severity: "warning",
      metadata: { recordType: body.recordType, recordId: body.recordId, reason: body.reason },
    });

    return NextResponse.json({ hold });
  } catch (err) {
    if (err instanceof Error && (err.message === "Unauthenticated" || err.message.startsWith("Access denied"))) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
