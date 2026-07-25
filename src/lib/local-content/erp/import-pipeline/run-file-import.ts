import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import type { ErpImportBatchStatus, PipelineResult, RecordIssue } from "../types";
import type { SpendRecordInputFromErp } from "../field-mapping";
import {
  PRODUCT_KEY,
  type ImportOptions,
  findOrCreateSupplier,
  createSupplierFromErp,
  validateMappedRecord,
} from "./common";

export async function runFileImport(
  options: ImportOptions & {
    records: SpendRecordInputFromErp[];
    fileHash?: string;
    filename?: string;
    sourceType: "csv" | "excel" | "manual";
  },
): Promise<PipelineResult> {
  const mappedRecords = options.records;

  // ── Validate ──

  const allIssues: RecordIssue[] = [];
  let errorCount = 0;

  for (let i = 0; i < mappedRecords.length; i++) {
    const issues = validateMappedRecord(mappedRecords[i]!, i + 1);
    allIssues.push(...issues);
    if (issues.some((iss) => iss.severity === "error")) {
      errorCount++;
    }
  }

  // ── Determine status ──

  const hasHighAmount = allIssues.some(
    (iss) => iss.field === "amount" && iss.severity === "warning",
  );
  let batchStatus: ErpImportBatchStatus;
  if (errorCount > 0 || hasHighAmount) {
    batchStatus = "needs_review";
  } else if (options.autoApprove) {
    batchStatus = "imported";
  } else {
    batchStatus = "validated";
  }

  // ── Create batch ──

  const batch = await prisma.erpImportBatch.create({
    data: {
      connectionId: options.connectionId,
      organizationId: options.organizationId,
      status: batchStatus,
      sourceType: options.sourceType,
      totalLines: mappedRecords.length,
      validLines: mappedRecords.length - errorCount,
      errorLines: errorCount,
      fileHash: options.fileHash ?? null,
      originalFile: options.filename ?? null,
      metadata: {
        issues: allIssues,
        totalRecords: mappedRecords.length,
      } as unknown as Prisma.InputJsonValue,
      createdById: options.actorId ?? null,
    },
  });

  // ── Sync log ──

  const syncLog = await prisma.erpSyncLog.create({
    data: {
      connectionId: options.connectionId,
      organizationId: options.organizationId,
      direction: "import",
      status: errorCount > 0 ? "partial" : "success",
      totalRecords: mappedRecords.length,
      importedRecords: 0,
      failedRecords: errorCount,
      sourceFile: options.filename ?? null,
      fileHash: options.fileHash ?? null,
      completedAt: new Date(),
    },
  });

  // ── Import if approved ──

  let importedCount = 0;
  if (batchStatus === "imported" && options.projectId) {
    const projectId = options.projectId;
    for (let i = 0; i < mappedRecords.length; i++) {
      const mapped = mappedRecords[i]!;
      const rowIssues = allIssues.filter((iss) => iss.rowNumber === i + 1);
      if (rowIssues.some((iss) => iss.severity === "error")) continue;

      try {
        let supplierId = await findOrCreateSupplier(
          options.organizationId,
          projectId,
          mapped,
        );
        if (!supplierId) {
          supplierId = await createSupplierFromErp(
            projectId,
            mapped,
            options.organizationId,
            options.actorId,
          );
        }

        await prisma.localContentSpendRecord.create({
          data: {
            projectId,
            supplierId,
            amount: mapped.amount,
            currency: mapped.currency,
            category: mapped.category,
            contractReference: mapped.contractReference ?? null,
            period: mapped.period,
            description: mapped.description ?? null,
            createdById: options.actorId ?? null,
            metadata: {
              sourceSystem: "file-import",
              sourceId: mapped.sourceId,
              erpBatchId: batch.id,
              fileHash: options.fileHash,
            } as Prisma.InputJsonValue,
          },
        });
        importedCount++;
      } catch {
        errorCount++;
      }
    }

    await prisma.erpSyncLog.update({
      where: { id: syncLog.id },
      data: {
        importedRecords: importedCount,
        failedRecords: errorCount,
      },
    });
  }

  // ── Audit ──

  await writePlatformAuditLog({
    productKey: PRODUCT_KEY,
    action: `erp.file-import.${batchStatus === "imported" ? "completed" : "review_needed"}`,
    actorId: options.actorId,
    actorName: options.actorName,
    targetType: "ErpImportBatch",
    targetId: batch.id,
    severity: errorCount > 0 ? "warning" : "info",
    metadata: {
      connectionId: options.connectionId,
      totalRecords: mappedRecords.length,
      importedCount,
      errorCount,
      status: batchStatus,
      sourceType: options.sourceType,
      fileHash: options.fileHash,
    },
  });

  return {
    batchId: batch.id,
    connectionId: options.connectionId,
    status: batchStatus,
    totalRecords: mappedRecords.length,
    importedRecords: importedCount,
    failedRecords: errorCount,
    issues: allIssues,
    syncLogId: syncLog.id,
  };
}
