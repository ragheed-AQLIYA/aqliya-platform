import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import { getAllPolicies, setPolicyOverride, resetPolicyOverride } from "@/lib/core/policy/retention/policies";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { sanitizeError, httpStatusFromCode } from "@/lib/platform/api-error";
import { isPlatformAdmin } from "@/lib/authorization/platform-admin";

const policyOverrideSchema = z.object({
  modelName: z.string().min(1).max(200),
  retentionDays: z.number().int().min(1),
  action: z.enum(["delete", "archive", "anonymize"]).optional(),
  enabled: z.boolean().optional(),
  notifyBeforeDelete: z.boolean().optional(),
});

function assertRetentionPolicyAccess(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  if (!hasRequiredRole(user, "ADMIN") && !isPlatformAdmin(user)) {
    throw new Error("Access denied: ADMIN role required");
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    assertRetentionPolicyAccess(user);
    const policies = isPlatformAdmin(user)
      ? getAllPolicies()
      : getAllPolicies(user.organizationId);
    return NextResponse.json({ policies });
  } catch (err) {
    const { message, code } = sanitizeError(err);
    return NextResponse.json({ error: message }, { status: httpStatusFromCode(code) });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    assertRetentionPolicyAccess(user);
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = policyOverrideSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(" ") },
        { status: 400 },
      );
    }

    const { modelName, retentionDays, action, enabled, notifyBeforeDelete } = parsed.data;
    const organizationId = isPlatformAdmin(user) ? undefined : user.organizationId;

    const entry = setPolicyOverride({
      modelName,
      retentionDays,
      action: action ?? "delete",
      enabled: enabled ?? true,
      notifyBeforeDelete: notifyBeforeDelete ?? false,
      organizationId,
    });

    await writePlatformAuditLog({
      productKey: "platform",
      action: "retention.policy_updated",
      actorId: user.id,
      actorEmail: user.email,
      targetType: "RetentionPolicy",
      targetId: modelName,
      severity: "info",
      metadata: { retentionDays, action, enabled, organizationId: organizationId ?? null },
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
    assertRetentionPolicyAccess(user);
    const { searchParams } = new URL(request.url);
    const modelName = searchParams.get("modelName");
    if (!modelName) {
      return NextResponse.json({ error: "modelName query param required" }, { status: 400 });
    }
    const organizationId = isPlatformAdmin(user) ? undefined : user.organizationId;
    const reset = resetPolicyOverride(modelName, organizationId);

    await writePlatformAuditLog({
      productKey: "platform",
      action: "retention.policy_reset",
      actorId: user.id,
      actorEmail: user.email,
      targetType: "RetentionPolicy",
      targetId: modelName,
      severity: "info",
      metadata: { organizationId: organizationId ?? null },
    });

    return NextResponse.json({ reset });
  } catch (err) {
    const { message, code } = sanitizeError(err);
    return NextResponse.json({ error: message }, { status: httpStatusFromCode(code) });
  }
}
