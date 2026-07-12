import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import { addHold, listHolds } from "@/lib/core/policy/retention/holds";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { sanitizeError, httpStatusFromCode } from "@/lib/platform/api-error";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "ADMIN")) {
      throw new Error("Access denied: ADMIN role required");
    }
    const holds = await listHolds(user.platformOrganizationId);
    return NextResponse.json({ holds });
  } catch (err) {
    const { message, code } = sanitizeError(err);
    return NextResponse.json({ error: message }, { status: httpStatusFromCode(code) });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "ADMIN")) {
      throw new Error("Access denied: ADMIN role required");
    }
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
    const { message, code } = sanitizeError(err);
    return NextResponse.json({ error: message }, { status: httpStatusFromCode(code) });
  }
}
