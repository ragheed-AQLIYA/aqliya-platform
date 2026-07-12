import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import { getAllPolicies, setPolicyOverride, resetPolicyOverride } from "@/lib/core/policy/retention/policies";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { sanitizeError, httpStatusFromCode } from "@/lib/platform/api-error";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "ADMIN")) {
      throw new Error("Access denied: ADMIN role required");
    }
    const policies = getAllPolicies(user.platformOrganizationId);
    return NextResponse.json({ policies });
  } catch (err) {
    const { message, code } = sanitizeError(err);
    return NextResponse.json({ error: message }, { status: httpStatusFromCode(code) });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "ADMIN")) {
      throw new Error("Access denied: ADMIN role required");
    }
    const body = (await request.json()) as {
      modelName: string;
      retentionDays: number;
      action: "delete" | "archive" | "anonymize";
      enabled: boolean;
      notifyBeforeDelete?: boolean;
    };

    if (!body.modelName || typeof body.retentionDays !== "number") {
      return NextResponse.json({ error: "modelName and retentionDays are required" }, { status: 400 });
    }

    const entry = setPolicyOverride({
      modelName: body.modelName,
      retentionDays: body.retentionDays,
      action: body.action,
      enabled: body.enabled,
      notifyBeforeDelete: body.notifyBeforeDelete ?? false,
      organizationId: user.platformOrganizationId,
    });

    await writePlatformAuditLog({
      productKey: "platform",
      action: "retention.policy_updated",
      actorId: user.id,
      actorEmail: user.email,
      targetType: "RetentionPolicy",
      targetId: body.modelName,
      severity: "info",
      metadata: { retentionDays: body.retentionDays, action: body.action, enabled: body.enabled },
    });

    return NextResponse.json({ policy: entry });
  } catch (err) {
    const { message, code } = sanitizeError(err);
    return NextResponse.json({ error: message }, { status: httpStatusFromCode(code) });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "ADMIN")) {
      throw new Error("Access denied: ADMIN role required");
    }
    const { searchParams } = new URL(request.url);
    const modelName = searchParams.get("modelName");
    if (!modelName) {
      return NextResponse.json({ error: "modelName query param required" }, { status: 400 });
    }
    const reset = resetPolicyOverride(modelName, user.platformOrganizationId);

    await writePlatformAuditLog({
      productKey: "platform",
      action: "retention.policy_reset",
      actorId: user.id,
      actorEmail: user.email,
      targetType: "RetentionPolicy",
      targetId: modelName,
      severity: "info",
    });

    return NextResponse.json({ reset });
  } catch (err) {
    const { message, code } = sanitizeError(err);
    return NextResponse.json({ error: message }, { status: httpStatusFromCode(code) });
  }
}
