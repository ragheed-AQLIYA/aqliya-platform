"use server";

import { prisma } from "@/lib/prisma";
import {
  listFindings,
  createFinding,
  deleteFinding,
} from "@/lib/local-content/services";
import {
  assertProjectAccess,
  ProjectAccessError,
} from "@/lib/local-content/guards";
import { enforce } from "@/lib/kernel";
import { parseOrError } from "@/lib/local-content/schemas/common";
import {
  createFindingSchema,
  updateFindingSchema,
} from "@/lib/local-content/schemas/finding";
import {
  requirePermission,
  Permission,
  ResourceType,
} from "@/actions/localcontent-rbac";
import { type ActionResult } from "@/lib/platform/action-result";
import { invalidateCacheByPrefix } from "@/lib/platform/cache-strategy";
import {
  safe,
  logToPlatform,
  revalidateLocalContentPaths,
} from "@/actions/localcontent-shared";

// ─── Findings Actions ───

export async function listLocalContentFindingsAction(
  projectId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof listFindings>>>> {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    await requirePermission(Permission.FINDING_MANAGEMENT, ResourceType.FINDING);
    return listFindings(projectId);
  });
}

export async function createLocalContentFindingAction(
  projectId: string,
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createFinding>>>> {
  const raw = Object.fromEntries(formData);
  const parsed = parseOrError(createFindingSchema, raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { type, title, description, severity, linkedSupplierId, linkedSpendRecordId } = parsed.data;

  return safe(async () => {
    const { user, project } = await assertProjectAccess(projectId, "manage_findings");
    await enforce(user, { type: "project", id: projectId, tenantId: project.organizationId }, "create");
    await requirePermission(Permission.FINDING_MANAGEMENT, ResourceType.FINDING);

    const finding = await createFinding(
      {
        projectId,
        type,
        severity: severity || undefined,
        title,
        description,
        linkedSupplierId: linkedSupplierId || undefined,
        linkedSpendRecordId: linkedSpendRecordId || undefined,
        createdById: user.id,
        createdByName: user.name,
      },
      { id: user.id, name: user.name },
    );

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.finding.created",
      targetType: "LocalContentFinding",
      targetId: finding.id,
      metadata: {
        title: finding.title,
        type: finding.type,
        severity: finding.severity,
      },
    });

    revalidateLocalContentPaths(projectId, ["findings"]);
    await invalidateCacheByPrefix(`dashboard:localcontent:${user.organizationId}:stats`);
    return finding;
  });
}

export async function updateLocalContentFindingAction(
  projectId: string,
  findingId: string,
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createFinding>>>> {
  const raw = Object.fromEntries(formData);
  const parsed = parseOrError(updateFindingSchema, raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { type, title, description, severity, linkedSupplierId, linkedSpendRecordId } = parsed.data;

  return safe(async () => {
    const { user, project } = await assertProjectAccess(projectId, "manage_findings");
    await enforce(user, { type: "project", id: projectId, tenantId: project.organizationId }, "update");
    await requirePermission(Permission.FINDING_MANAGEMENT, ResourceType.FINDING);
    const existing = await prisma.localContentFinding.findUnique({
      where: { id: findingId },
    });

    if (!existing || existing.projectId !== projectId) {
      throw new ProjectAccessError("Finding not found", "NOT_FOUND");
    }

    const finding = await prisma.localContentFinding.update({
      where: { id: findingId },
      data: {
        type,
        title,
        description,
        severity: formData.has("severity")
          ? (severity ?? undefined)
          : (existing.severity ?? undefined),
        status: formData.has("status") ? raw.status as string : existing.status,
        linkedSupplierId: formData.has("linkedSupplierId")
          ? (linkedSupplierId ?? undefined)
          : (existing.linkedSupplierId ?? undefined),
        linkedSpendRecordId: formData.has("linkedSpendRecordId")
          ? (linkedSpendRecordId ?? undefined)
          : (existing.linkedSpendRecordId ?? undefined),
      },
    });

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.finding.updated",
      targetType: "LocalContentFinding",
      targetId: findingId,
      metadata: {
        title: finding.title,
        type: finding.type,
        severity: finding.severity,
        status: finding.status,
      },
    });

    revalidateLocalContentPaths(projectId, [
      "findings",
      "review",
      "approval",
      "audit-trail",
    ]);
    await invalidateCacheByPrefix(`dashboard:localcontent:${user.organizationId}:stats`);
    return finding;
  });
}

export async function deleteLocalContentFindingAction(
  projectId: string,
  findingId: string,
): Promise<ActionResult<void>> {
  return safe(async () => {
    const { user, project } = await assertProjectAccess(projectId, "manage_findings");
    await enforce(user, { type: "project", id: projectId, tenantId: project.organizationId }, "delete");
    await requirePermission(Permission.FINDING_MANAGEMENT, ResourceType.FINDING);
    await deleteFinding(projectId, findingId, {
      id: user.id,
      name: user.name ?? "",
    });
    await logToPlatform({
      projectId,
      user,
      action: "localcontent.finding.deleted",
      targetType: "LocalContentFinding",
      targetId: findingId,
    });
    revalidateLocalContentPaths(projectId, [
      "findings",
      "review",
      "approval",
      "audit-trail",
    ]);
  });
}
