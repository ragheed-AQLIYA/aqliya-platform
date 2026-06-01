"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isExpectedAccessDeniedError } from "@/lib/auth";
import { requireMutationAccess } from "@/core/access";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export type OrgMemberResult = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

/** Pilot stub — org member invites ship after dedicated membership model. */
export async function inviteOrgMemberAction(
  _organizationId: string,
  _input: { email: string; name?: string; role: string },
): Promise<ActionResult<OrgMemberResult>> {
  return {
    ok: false,
    error: "Member invitations are not enabled in v0.1 pilot",
  };
}

/** Pilot stub — org member role updates ship after dedicated membership model. */
export async function updateMemberRoleAction(
  _organizationId: string,
  _memberId: string,
  _role: string,
): Promise<ActionResult<OrgMemberResult>> {
  return {
    ok: false,
    error: "Member role updates are not enabled in v0.1 pilot",
  };
}

function auditOrgMutation(
  user: { id: string; email: string; name: string },
  action: string,
  org: { id: string; name: string },
  metadata?: Record<string, unknown>,
) {
  writePlatformAuditLog({
    productKey: "platform",
    action,
    targetType: "organization",
    targetId: org.id,
    targetLabel: org.name,
    actorId: user.id,
    actorType: "user",
    actorEmail: user.email,
    actorName: user.name,
    metadata,
  });
}

export async function createOrganizationAction(data: {
  name: string;
}): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    const trimmed = data.name?.trim();
    if (!trimmed) {
      return { ok: false, error: "اسم المؤسسة مطلوب" };
    }

    const user = await requireMutationAccess("organization", "create", {
      minRole: "ADMIN",
      allowPlatformAdminCrossTenant: true,
    });

    const org = await prisma.organization.create({
      data: { name: trimmed },
    });

    auditOrgMutation(user, "organization.create", org, { name: trimmed });
    revalidatePath("/organizations");

    return { ok: true, data: { id: org.id, name: org.name } };
  } catch (error) {
    if (isExpectedAccessDeniedError(error)) {
      return { ok: false, error: "Access denied" };
    }
    console.error("[createOrganizationAction]", error);
    const message =
      error instanceof Error ? error.message : "تعذر إنشاء المؤسسة";
    return { ok: false, error: message };
  }
}

export async function updateOrganizationAction(
  organizationId: string,
  data: { name: string },
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    const trimmed = data.name?.trim();
    if (!trimmed) {
      return { ok: false, error: "اسم المؤسسة مطلوب" };
    }

    const existing = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true },
    });
    if (!existing) {
      return { ok: false, error: "المؤسسة غير موجودة" };
    }

    const sessionUser = await getCurrentUser();
    const isOwnOrg = sessionUser.organizationId === organizationId;
    const user = await requireMutationAccess("organization", "update", {
      organizationId,
      resourceId: organizationId,
      minRole: isOwnOrg ? "OPERATOR" : "ADMIN",
      allowPlatformAdminCrossTenant: !isOwnOrg,
    });

    const org = await prisma.organization.update({
      where: { id: organizationId },
      data: { name: trimmed },
    });

    auditOrgMutation(user, "organization.update", org, {
      previousName: existing.name,
    });
    revalidatePath("/organizations");
    revalidatePath(`/organizations/${organizationId}`);

    return { ok: true, data: { id: org.id, name: org.name } };
  } catch (error) {
    if (isExpectedAccessDeniedError(error)) {
      return { ok: false, error: "Access denied" };
    }
    console.error("[updateOrganizationAction]", error);
    const message =
      error instanceof Error ? error.message : "تعذر تحديث المؤسسة";
    return { ok: false, error: message };
  }
}
