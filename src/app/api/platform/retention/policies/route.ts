import { NextRequest, NextResponse } from "next/server";
import { requireUserContext } from "@/lib/auth";
import { getAllPolicies, setPolicyOverride, resetPolicyOverride } from "@/lib/core/policy/retention/policies";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";

export async function GET() {
  try {
    const user = await requireUserContext("ADMIN");
    const policies = getAllPolicies(user.platformOrganizationId);
    return NextResponse.json({ policies });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireUserContext("ADMIN");
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
    if (err instanceof Error && (err.message === "Unauthenticated" || err.message.startsWith("Access denied"))) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUserContext("ADMIN");
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
    if (err instanceof Error && (err.message === "Unauthenticated" || err.message.startsWith("Access denied"))) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
