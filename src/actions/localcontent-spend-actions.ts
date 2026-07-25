"use server";

import { prisma } from "@/lib/prisma";
import {
  listSpendRecords,
  createSpendRecord,
  deleteSpendRecord,
  createClassification,
} from "@/lib/local-content/services";
import { assertProjectAccess } from "@/lib/local-content/guards";
import { enforce } from "@/lib/kernel";
import { notifyOnEvent } from "@/lib/platform/notification/integration";
import { checkRateLimit } from "@/lib/rate-limit";
import { parseLocalContentCSV } from "@/lib/local-content/import";
import { parseOrError } from "@/lib/local-content/schemas/common";
import {
  createSpendRecordSchema,
  classifySpendRecordSchema,
  importSpendCsvSchema,
} from "@/lib/local-content/schemas/spend";
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
import { publishDomainEvent } from "@/lib/kernel/publish";
import {
  publishLocalContentOSEvent,
  LOCAL_CONTENT_OS_EVENTS,
} from "@/lib/kernel/events/lcos-events";
import { createLogger } from "@/lib/observability/logger";

// ─── Spend Actions ───

export async function listLocalContentSpendRecordsAction(
  projectId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof listSpendRecords>>>> {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    await requirePermission(Permission.SPEND_DATA_ENTRY, ResourceType.SPEND_RECORD);
    return listSpendRecords(projectId);
  });
}

export async function createLocalContentSpendRecordAction(
  projectId: string,
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createSpendRecord>>>> {
  const raw = Object.fromEntries(formData);
  const parsed = parseOrError(createSpendRecordSchema, raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { supplierId, amount, category, currency, contractReference, period, description } = parsed.data;

  return safe(async () => {
    const { user, project } = await assertProjectAccess(projectId, "create_spend");
    await enforce(user, { type: "project", id: projectId, tenantId: project.organizationId }, "create");
    await requirePermission(Permission.SPEND_DATA_ENTRY, ResourceType.SPEND_RECORD);

    const record = await createSpendRecord(
      {
        projectId,
        supplierId,
        amount,
        category,
        currency: currency || undefined,
        contractReference: contractReference || undefined,
        period,
        description: description || undefined,
      },
      { id: user.id, name: user.name },
    );

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.spend.created",
      targetType: "LocalContentSpendRecord",
      targetId: record.id,
      metadata: { amount: record.amount, category: record.category },
    });

    revalidateLocalContentPaths(projectId, ["spend", "classification"]);
    await invalidateCacheByPrefix(`dashboard:localcontent:${user.organizationId}:stats`);
    return record;
  });
}

export async function importLocalContentSpendCsvAction(
  projectId: string,
  csvText: string,
): Promise<
  ActionResult<{ created: number; rejected: number; errors: string[] }>
> {
  const parsed = parseOrError(importSpendCsvSchema, { csvText });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { csvText: validatedCsv } = parsed.data;

  return safe(async () => {
    const { user, project } = await assertProjectAccess(projectId, "create_spend");
    await enforce(user, { type: "project", id: projectId, tenantId: project.organizationId }, "create");
    await requirePermission(Permission.IMPORT, ResourceType.IMPORT_BATCH);
    // Rate limit: CSV import is DB-heavy (creates suppliers + spend records)
    const { allowed } = await checkRateLimit(`lcos:import:${user.id}`, { maxRequests: 5, windowMs: 60_000 });
    if (!allowed) {
      throw new Error("Rate limit exceeded. Please wait before importing more data.");
    }
    const result = parseLocalContentCSV(validatedCsv);

    if (result.rejectedRows.length > 0 && result.validRows.length === 0) {
      throw new Error("No valid rows to import");
    }

    let created = 0;
    const errors: string[] = [];

    const supplierNames = [...new Set(result.validRows.map((r) => r.supplierName))];
    const crNumbers = [...new Set(
      result.validRows.filter((r) => r.supplierRegistrationNumber).map((r) => r.supplierRegistrationNumber!),
    )];

    const [existingByName, existingByCr] = await Promise.all([
      prisma.localContentSupplier.findMany({
        where: { projectId, name: { in: supplierNames } },
      }),
      crNumbers.length > 0
        ? prisma.localContentSupplier.findMany({
            where: { projectId, crNumber: { in: crNumbers } },
          })
        : Promise.resolve([]),
    ]);

    const supplierMap = new Map<string, typeof existingByName[number]>();
    for (const s of existingByName) supplierMap.set(s.name, s);
    for (const s of existingByCr) supplierMap.set(`cr:${s.crNumber}`, s);

    const missingNames = supplierNames.filter((n) => !supplierMap.has(n));
    const missingCrMap = new Map<string, string>(); // crNumber -> supplierName
    for (const row of result.validRows) {
      if (row.supplierRegistrationNumber && !supplierMap.has(`cr:${row.supplierRegistrationNumber}`)) {
        missingCrMap.set(row.supplierRegistrationNumber, row.supplierName);
      }
    }

    if (missingNames.length > 0) {
      const createdSuppliers = await prisma.localContentSupplier.createMany({
        data: missingNames.map((name) => ({
          projectId,
          name,
          crNumber: null,
          localityClassification: "unclassified",
        })),
      });
      if (createdSuppliers.count > 0) {
        const fresh = await prisma.localContentSupplier.findMany({
          where: { projectId, name: { in: missingNames } },
        });
        for (const s of fresh) supplierMap.set(s.name, s);
      }
    }

    for (const [crNum, supplierName] of missingCrMap) {
      if (!supplierMap.has(`cr:${crNum}`)) {
        const existing = supplierMap.get(supplierName);
        if (existing) {
          supplierMap.set(`cr:${crNum}`, existing);
        } else {
          const newSupplier = await prisma.localContentSupplier.create({
            data: {
              projectId,
              name: supplierName,
              crNumber: crNum,
              localityClassification: "unclassified",
            },
          });
          supplierMap.set(`cr:${crNum}`, newSupplier);
          supplierMap.set(supplierName, newSupplier);
        }
      }
    }

    const resolveSupplier = (row: typeof result.validRows[number]) => {
      if (row.supplierRegistrationNumber) {
        const byCr = supplierMap.get(`cr:${row.supplierRegistrationNumber}`);
        if (byCr) return byCr;
      }
      return supplierMap.get(row.supplierName) ?? null;
    };

    for (const row of result.validRows) {
      try {
        let supplier = resolveSupplier(row);

        if (!supplier) {
          supplier = await prisma.localContentSupplier.create({
            data: {
              projectId,
              name: row.supplierName,
              crNumber: row.supplierRegistrationNumber ?? null,
              localityClassification: "unclassified",
            },
          });
          supplierMap.set(row.supplierName, supplier);
          if (row.supplierRegistrationNumber) {
            supplierMap.set(`cr:${row.supplierRegistrationNumber}`, supplier);
          }
        }

        await createSpendRecord(
          {
            projectId,
            supplierId: supplier.id,
            amount: row.amount,
            category: row.category,
            currency: row.currency,
            contractReference: row.contractReference,
            period: row.period,
            description: row.description,
          },
          { id: user.id, name: user.name },
        );
        created++;
      } catch (e) {
        const logger = createLogger({ product: "localcontentos", action: "importLocalContentSpendCsv" });
        logger.error("Row import failed", e instanceof Error ? e : undefined, { rowNumber: row.rowNumber, projectId });
        errors.push(
          `Row ${row.rowNumber}: ${e instanceof Error ? e.message : "unknown error"}`,
        );
      }
    }

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.spend.imported",
      targetType: "LocalContentSpendRecord",
      targetId: projectId,
      metadata: {
        createdCount: created,
        rejectedCount: result.rejectedRows.length + errors.length,
      },
    });

    try {
      const project = await prisma.localContentProject.findUnique({
        where: { id: projectId },
        select: { name: true, organizationId: true },
      });
      if (project) {
        await notifyOnEvent("on_sync_complete", project.organizationId, projectId, {
          productKey: "localcontentos",
          templateKey: "localcontent_batch_import_complete",
          recipientId: user.id,
          templateVars: {
            batchName: project.name,
            recordCount: String(created),
          },
        });
      }
    } catch (error) {
      const logger = createLogger({ product: "localcontentos", action: "importLocalContentSpendCsvNotification" });
      logger.error("Notification failed for spend import", error instanceof Error ? error : undefined, { projectId });
      // Notification must not block the primary action
    }

    revalidateLocalContentPaths(projectId, [
      "spend",
      "suppliers",
      "classification",
    ]);

    try {
      await publishDomainEvent(
        publishLocalContentOSEvent(LOCAL_CONTENT_OS_EVENTS.SPEND_IMPORTED, {
          actorId: user.id,
          resourceId: projectId,
          resourceType: "LocalContentSpendRecord",
          metadata: {
            createdCount: created,
            rejectedCount: result.rejectedRows.length + errors.length,
          },
        }),
      );
    } catch {
      // Event publishing is fire-and-forget
    }

    await invalidateCacheByPrefix(`dashboard:localcontent:${user.organizationId}:stats`);
    return {
      created,
      rejected: result.rejectedRows.length + errors.length,
      errors,
    };
  });
}

// ─── Classification Action ───

export async function classifyLocalContentSpendRecordAction(
  projectId: string,
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createClassification>>>> {
  const raw = Object.fromEntries(formData);
  const parsed = parseOrError(classifySpendRecordSchema, raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { supplierId, spendRecordId, localPercentage, classificationBasis, confidence, notes } = parsed.data;

  return safe(async () => {
    const { user, project } = await assertProjectAccess(projectId, "classify");
    await enforce(user, { type: "project", id: projectId, tenantId: project.organizationId }, "update");
    await requirePermission(Permission.SPEND_DATA_ENTRY, ResourceType.SPEND_RECORD);

    const classification = await createClassification(
      {
        projectId,
        supplierId: supplierId || undefined,
        spendRecordId: spendRecordId || undefined,
        classifiedBy: user.id,
        localPercentage,
        classificationBasis,
        confidence: confidence || undefined,
        notes: notes || undefined,
      },
      { id: user.id, name: user.name },
    );

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.classification.created",
      targetType: "LocalContentClassification",
      targetId: classification.id,
      metadata: { localPercentage, basis: classification.classificationBasis },
    });

    revalidateLocalContentPaths(projectId, ["classification"]);
    await invalidateCacheByPrefix(`dashboard:localcontent:${user.organizationId}:stats`);

    try {
      await publishDomainEvent(
        publishLocalContentOSEvent(LOCAL_CONTENT_OS_EVENTS.CLASSIFICATION_COMPLETED, {
          actorId: user.id,
          resourceId: classification.id,
          resourceType: "LocalContentClassification",
          metadata: {
            localPercentage,
            classificationBasis: classification.classificationBasis,
          },
        }),
      );
    } catch {
      // Event publishing is fire-and-forget
    }

    return classification;
  });
}

export async function deleteLocalContentSpendRecordAction(
  projectId: string,
  recordId: string,
): Promise<ActionResult<void>> {
  return safe(async () => {
    const { user, project } = await assertProjectAccess(projectId, "create_spend");
    await enforce(user, { type: "project", id: projectId, tenantId: project.organizationId }, "delete");
    await requirePermission(Permission.SPEND_DATA_ENTRY, ResourceType.SPEND_RECORD);
    await deleteSpendRecord(projectId, recordId, {
      id: user.id,
      name: user.name ?? "",
    });
    await logToPlatform({
      projectId,
      user,
      action: "localcontent.spend.deleted",
      targetType: "LocalContentSpendRecord",
      targetId: recordId,
    });
    revalidateLocalContentPaths(projectId, ["spend", "classification"]);
    await invalidateCacheByPrefix(`dashboard:localcontent:${user.organizationId}:stats`);
  });
}
