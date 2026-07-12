"use server";

import { prisma } from "@/lib/prisma";
import {
  listSuppliers,
  createSupplier,
  deleteSupplier,
} from "@/lib/local-content/services";
import {
  assertProjectAccess,
  ProjectAccessError,
} from "@/lib/local-content/guards";
import { parseOrError } from "@/lib/local-content/schemas/common";
import {
  createSupplierSchema,
  updateSupplierSchema,
} from "@/lib/local-content/schemas/supplier";
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

// ─── Supplier Actions ───

export async function listLocalContentSuppliersAction(
  projectId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof listSuppliers>>>> {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    await requirePermission(Permission.SUPPLIER_MANAGEMENT, ResourceType.SUPPLIER);
    return listSuppliers(projectId);
  });
}

export async function createLocalContentSupplierAction(
  projectId: string,
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createSupplier>>>> {
  const raw = Object.fromEntries(formData);
  const parsed = parseOrError(createSupplierSchema, raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { name, crNumber, localityClassification, localContentPercentage, ownershipType, workforceLocalPct } = parsed.data;

  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "create_supplier");
    await requirePermission(Permission.SUPPLIER_MANAGEMENT, ResourceType.SUPPLIER);

    const supplier = await createSupplier(
      {
        projectId,
        name,
        crNumber: crNumber || undefined,
        localityClassification: localityClassification || undefined,
        localContentPercentage: localContentPercentage ?? undefined,
        ownershipType: ownershipType || undefined,
        workforceLocalPct: workforceLocalPct ?? undefined,
      },
      { id: user.id, name: user.name },
    );

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.supplier.created",
      targetType: "LocalContentSupplier",
      targetId: supplier.id,
      metadata: { supplierName: supplier.name },
    });

    revalidateLocalContentPaths(projectId, ["suppliers", "classification"]);
    await invalidateCacheByPrefix(`dashboard:localcontent:${user.organizationId}:stats`);
    return supplier;
  });
}

export async function updateLocalContentSupplierAction(
  projectId: string,
  supplierId: string,
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createSupplier>>>> {
  const raw = Object.fromEntries(formData);
  const parsed = parseOrError(updateSupplierSchema, raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { name, crNumber, localityClassification, localContentPercentage, ownershipType, workforceLocalPct } = parsed.data;

  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "create_supplier");
    await requirePermission(Permission.SUPPLIER_MANAGEMENT, ResourceType.SUPPLIER);
    const existing = await prisma.localContentSupplier.findUnique({
      where: { id: supplierId },
    });
    if (!existing || existing.projectId !== projectId) {
      throw new ProjectAccessError("Supplier not found", "NOT_FOUND");
    }

    const supplier = await prisma.localContentSupplier.update({
      where: { id: supplierId },
      data: {
        name,
        crNumber: formData.has("crNumber")
          ? (crNumber ?? null)
          : existing.crNumber,
        localityClassification: formData.has("localityClassification")
          ? (localityClassification ?? null)
          : existing.localityClassification,
        localContentPercentage: formData.has("localContentPercentage")
          ? (localContentPercentage ?? null)
          : existing.localContentPercentage,
        ownershipType: formData.has("ownershipType")
          ? (ownershipType ?? null)
          : existing.ownershipType,
        workforceLocalPct: formData.has("workforceLocalPct")
          ? (workforceLocalPct ?? null)
          : existing.workforceLocalPct,
      },
    });

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.supplier.updated",
      targetType: "LocalContentSupplier",
      targetId: supplierId,
      metadata: { supplierName: supplier.name },
    });

    revalidateLocalContentPaths(projectId, ["suppliers", "classification"]);
    await invalidateCacheByPrefix(`dashboard:localcontent:${user.organizationId}:stats`);
    return supplier;
  });
}

export async function deleteLocalContentSupplierAction(
  projectId: string,
  supplierId: string,
): Promise<ActionResult<void>> {
  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "create_supplier");
    await requirePermission(Permission.SUPPLIER_MANAGEMENT, ResourceType.SUPPLIER);
    await deleteSupplier(projectId, supplierId, {
      id: user.id,
      name: user.name ?? "",
    });
    await logToPlatform({
      projectId,
      user,
      action: "localcontent.supplier.deleted",
      targetType: "LocalContentSupplier",
      targetId: supplierId,
    });
    revalidateLocalContentPaths(projectId, [
      "suppliers",
      "classification",
      "spend",
    ]);
    await invalidateCacheByPrefix(`dashboard:localcontent:${user.organizationId}:stats`);
  });
}
