"use server";

import { revalidatePath } from "next/cache";
import { requireUserContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import {
  listOrganizations,
  getOrganizationDetail,
  updateOrganization,
  createOrganization,
  deleteOrganization,
} from "@/lib/organization/organization-service";

function resolvePlatformOrgId(user: {
  organizationId: string;
  platformOrganizationId?: string;
}) {
  return user.platformOrganizationId || user.organizationId;
}

// ─── List ───

export async function listOrganizationsAction() {
  const user = await requireUserContext("VIEWER");

  const orgs = await listOrganizations(resolvePlatformOrgId(user));

  return { ok: true, data: orgs };
}

// ─── Get Detail ───

export async function getOrganizationAction(orgId: string) {
  const user = await requireUserContext("VIEWER");

  const detail = await getOrganizationDetail(
    orgId,
    resolvePlatformOrgId(user),
  );

  if (!detail) {
    return { ok: false, error: "لم يتم العثور على المؤسسة" };
  }

  return { ok: true, data: detail };
}

// ─── Create ───

export async function createOrganizationAction(data: { name: string }) {
  const user = await requireUserContext("ADMIN");

  if (!data.name || data.name.trim().length < 2) {
    return { ok: false, error: "اسم المؤسسة يجب أن يكون حرفين على الأقل" };
  }

  const org = await createOrganization({
    name: data.name.trim(),
    platformOrganizationId: resolvePlatformOrgId(user),
  });

  await writePlatformAuditLog({
    productKey: "platform",
    platformOrganizationId: user.platformOrganizationId || user.organizationId,
    action: "ORGANIZATION_CREATED",
    actorId: user.id,
    actorType: "user",
    targetType: "organization",
    targetId: org.id,
    targetLabel: org.name,
    metadata: { createdBy: user.email },
  });

  revalidatePath("/organizations");
  return { ok: true, data: org };
}

// ─── Update ───

export async function updateOrganizationAction(
  orgId: string,
  data: { name?: string },
) {
  const user = await requireUserContext("ADMIN");

  if (data.name !== undefined && data.name.trim().length < 2) {
    return { ok: false, error: "اسم المؤسسة يجب أن يكون حرفين على الأقل" };
  }

  const oldOrg = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { name: true },
  });

  if (!oldOrg) {
    return { ok: false, error: "لم يتم العثور على المؤسسة" };
  }

  const updated = await updateOrganization(orgId, {
    name: data.name?.trim(),
  });

  if (!updated) {
    return { ok: false, error: "فشل تحديث المؤسسة" };
  }

  await writePlatformAuditLog({
    productKey: "platform",
    platformOrganizationId: user.platformOrganizationId || user.organizationId,
    action: "ORGANIZATION_UPDATED",
    actorId: user.id,
    actorType: "user",
    targetType: "organization",
    targetId: orgId,
    targetLabel: updated.name,
    metadata: {
      before: { name: oldOrg.name },
      after: { name: updated.name },
    },
  });

  revalidatePath("/organizations");
  revalidatePath(`/organizations/${orgId}`);
  return { ok: true, data: updated };
}

// ─── Delete ───

export async function deleteOrganizationAction(orgId: string) {
  const user = await requireUserContext("ADMIN");

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { name: true },
  });

  if (!org) {
    return { ok: false, error: "لم يتم العثور على المؤسسة" };
  }

  const deleted = await deleteOrganization(orgId);

  if (!deleted) {
    return {
      ok: false,
      error:
        "لا يمكن حذف المؤسسة — يوجد مستخدمون أو قرارات مرتبطة بها. قم بنقلهم أولاً.",
    };
  }

  await writePlatformAuditLog({
    productKey: "platform",
    platformOrganizationId: user.platformOrganizationId || user.organizationId,
    action: "ORGANIZATION_DELETED",
    actorId: user.id,
    actorType: "user",
    targetType: "organization",
    targetId: orgId,
    targetLabel: org.name,
    metadata: { deletedBy: user.email },
  });

  revalidatePath("/organizations");
  return { ok: true };
}
