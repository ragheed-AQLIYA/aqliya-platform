// ERP Import Pipeline
// Full import cycle: fetch via connector, map fields, create batch, validate, audit.

import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { createErpConnectorFromDb } from "./connector-factory";
import {
  mapErpSpendToLocalContent,
  type SpendRecordInputFromErp,
} from "./field-mapping";
import type {
  ErpSpendRecord,
  RecordIssue,
  ErpImportBatchStatus,
  PipelineResult,
} from "./types";

const PRODUCT_KEY = "local-content-os";

export interface ImportOptions {
  organizationId: string;
  connectionId: string;
  projectId?: string;
  since?: Date;
  actorId?: string;
  actorName?: string;
  autoApprove?: boolean;
}

async function findOrCreateSupplier(
  organizationId: string,
  projectId: string,
  mapped: SpendRecordInputFromErp,
): Promise<string | null> {
  if (mapped.supplierRegistrationNumber) {
    const existing = await prisma.localContentSupplier.findFirst({
      where: {
        projectId,
        crNumber: mapped.supplierRegistrationNumber,
      },
      select: { id: true },
    });
    if (existing) return existing.id;
  }

  const existing = await prisma.localContentSupplier.findFirst({
    where: {
      projectId,
      name: mapped.supplierName,
    },
    select: { id: true },
  });
  if (existing) return existing.id;

  return null;
}

async function createSupplierFromErp(
  projectId: string,
  mapped: SpendRecordInputFromErp,
  organizationId: string,
  actorId?: string,
): Promise<string> {
  const supplier = await prisma.localContentSupplier.create({
    data: {
      projectId,
      name: mapped.supplierName,
      crNumber: mapped.supplierRegistrationNumber ?? null,
      localityClassification: "unclassified",
      createdById: actorId ?? null,
    },
  });
  return supplier.id;
}

function validateMappedRecord(
  mapped: SpendRecordInputFromErp,
  rowIndex: number,
): RecordIssue[] {
  const issues: RecordIssue[] = [];

  if (!mapped.supplierName.trim()) {
    issues.push({
      rowNumber: rowIndex,
      field: "supplierName",
      issue: "اسم المورد مطلوب",
      severity: "error",
    });
  }

  if (mapped.amount <= 0) {
    issues.push({
      rowNumber: rowIndex,
      field: "amount",
      issue: "المبلغ يجب أن يكون أكبر من صفر",
      severity: "error",
    });
  }

  if (mapped.amount > 50_000_000) {
    issues.push({
      rowNumber: rowIndex,
      field: "amount",
      issue: `المبلغ (${mapped.amount}) يتجاوز حد 50,000,000 ريال`,
      severity: "warning",
    });
  }

  if (!mapped.period.trim()) {
    issues.push({
      rowNumber: rowIndex,
      field: "period",
      issue: "الفترة مطلوبة",
      severity: "error",
    });
  }

  if (!mapped.category.trim()) {
    issues.push({
      rowNumber: rowIndex,
      field: "category",
      issue: "التصنيف مطلوب",
      severity: "error",
    });
  }

  return issues;
}

export async function runErpImport(
  options: ImportOptions,
): Promise<PipelineResult> {
  const { connector, record } = await createErpConnectorFromDb(
    options.connectionId,
  );

  const customMapping =
    typeof record.fieldMapping === "object" && record.fieldMapping !== null
      ? (record.fieldMapping as Record<string, string>)
      : undefined;

  const provider = record.provider;

  // ── Step 1: Fetch data ──

  const [spendRecords, suppliers] = await Promise.all([
    connector.fetchSpendRecords(options.since),
    connector.fetchSuppliers(options.since),
  ]);

  // ── Step 2: Start sync log ──

  const syncLog = await prisma.erpSyncLog.create({
    data: {
      connectionId: options.connectionId,
      organizationId: options.organizationId,
      direction: "import",
      status: "running",
      totalRecords: spendRecords.length,
    },
  });

  // ── Step 3: Map fields ──

  const mappedRecords: SpendRecordInputFromErp[] = [];
  const allIssues: RecordIssue[] = [];
  let errorCount = 0;

  for (let i = 0; i < spendRecords.length; i++) {
    try {
      const mapped = await mapErpSpendToLocalContent(
        spendRecords[i]!,
        provider,
        customMapping,
      );
      mappedRecords.push(mapped);

      const issues = validateMappedRecord(mapped, i + 1);
      allIssues.push(...issues);
      if (issues.some((iss) => iss.severity === "error")) {
        errorCount++;
      }
    } catch (err) {
      errorCount++;
      allIssues.push({
        rowNumber: i + 1,
        field: "record",
        issue: `خطأ في معالجة السجل: ${err instanceof Error ? err.message : "غير معروف"}`,
        severity: "error",
      });
    }
  }

  // ── Step 4: Determine batch status ──

  const hasErrors = allIssues.some((iss) => iss.severity === "error");
  const hasWarnings = allIssues.some((iss) => iss.severity === "warning");
  const hasHighAmount = allIssues.some(
    (iss) => iss.field === "amount" && iss.severity === "warning",
  );

  let batchStatus: ErpImportBatchStatus;
  if (hasErrors) {
    batchStatus = "needs_review";
  } else if (hasHighAmount || hasWarnings) {
    batchStatus = "needs_review";
  } else if (options.autoApprove) {
    batchStatus = "imported";
  } else {
    batchStatus = "validated";
  }

  // ── Step 5: Create import batch ──

  const batch = await prisma.erpImportBatch.create({
    data: {
      connectionId: options.connectionId,
      organizationId: options.organizationId,
      status: batchStatus,
      sourceType: "api",
      totalLines: mappedRecords.length,
      validLines: mappedRecords.length - errorCount,
      errorLines: errorCount,
      metadata: {
        issues: allIssues,
        supplierCount: suppliers.length,
        recordCount: mappedRecords.length,
      } as unknown as Prisma.InputJsonValue,
      createdById: options.actorId ?? null,
    },
  });

  // ── Step 6: If auto-approved or approved, import to LocalContentSpendRecord ──

  let importedCount = 0;
  if (batchStatus === "imported" || (batchStatus as ErpImportBatchStatus) === "approved") {
    const projectId = options.projectId;
    if (projectId) {
      for (let i = 0; i < mappedRecords.length; i++) {
        const mapped = mappedRecords[i]!;
        const rowIssues = allIssues.filter((iss) => iss.rowNumber === i + 1);
        if (rowIssues.some((iss) => iss.severity === "error")) continue;

        let supplierId: string | null = null;
        try {
          supplierId = await findOrCreateSupplier(
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
                sourceSystem: provider,
                sourceId: mapped.sourceId,
                erpBatchId: batch.id,
                erpConnectionId: options.connectionId,
              } as Prisma.InputJsonValue,
            },
          });
          importedCount++;
        } catch (err) {
          errorCount++;
          allIssues.push({
            rowNumber: i + 1,
            field: "import",
            issue: `فشل استيراد السجل: ${err instanceof Error ? err.message : "غير معروف"}`,
            severity: "error",
          });
        }
      }
    }
  }

  // ── Step 7: Update sync log ──

  await prisma.erpSyncLog.update({
    where: { id: syncLog.id },
    data: {
      status: "success",
      importedRecords: importedCount,
      failedRecords: errorCount,
      errorDetails:
        allIssues.length > 0
          ? (allIssues as unknown as Prisma.InputJsonValue)
          : undefined,
      completedAt: new Date(),
    },
  });

  // ── Step 8: Audit log ──

  await writePlatformAuditLog({
    productKey: PRODUCT_KEY,
    action: "erp.import.completed",
    actorId: options.actorId,
    actorName: options.actorName,
    targetType: "ErpImportBatch",
    targetId: batch.id,
    targetLabel: `ERP import from ${provider}`,
    severity: errorCount > 0 ? "warning" : "info",
    metadata: {
      connectionId: options.connectionId,
      totalRecords: mappedRecords.length,
      importedCount,
      errorCount,
      status: batchStatus,
      syncLogId: syncLog.id,
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
