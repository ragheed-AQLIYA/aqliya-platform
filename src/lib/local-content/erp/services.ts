// ERP Integration — CRUD services for ErpConnection, ErpImportBatch, ErpSyncLog
// All mutations emit PlatformAuditLog entries.
// Tenant isolation enforced via organizationId.

import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";

const PRODUCT_KEY = "local-content-os";

function trimValue(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

// ─── ErpConnection ───

export async function listErpConnections(organizationId: string) {
  return prisma.erpConnection.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getErpConnection(
  connectionId: string,
  organizationId: string,
) {
  const conn = await prisma.erpConnection.findUnique({
    where: { id: connectionId },
  });
  if (!conn || conn.organizationId !== organizationId) {
    return null;
  }
  return conn;
}

export async function createErpConnection(input: {
  organizationId: string;
  provider: string;
  label: string;
  connectionType?: string;
  apiEndpoint?: string;
  apiKey?: string;
  apiSecret?: string;
  sourceSystem?: string;
  defaultCurrency?: string;
  fieldMapping?: Record<string, string>;
  metadata?: Record<string, unknown>;
  actorId?: string;
  actorName?: string;
}) {
  const conn = await prisma.erpConnection.create({
    data: {
      organizationId: input.organizationId,
      provider: input.provider,
      label: input.label,
      connectionType: input.connectionType ?? "api",
      apiEndpoint: trimValue(input.apiEndpoint),
      apiKey: input.apiKey ?? null,
      apiSecret: input.apiSecret ?? null,
      sourceSystem: trimValue(input.sourceSystem),
      defaultCurrency: input.defaultCurrency ?? "SAR",
      syncEnabled: false,
      fieldMapping: (input.fieldMapping ?? undefined) as unknown as Prisma.InputJsonValue | undefined,
      metadata: (input.metadata ?? undefined) as unknown as Prisma.InputJsonValue | undefined,
      createdById: input.actorId ?? null,
    },
  });

  await writePlatformAuditLog({
    productKey: PRODUCT_KEY,
    action: "erp.connection.created",
    platformOrganizationId: undefined,
    actorId: input.actorId,
    actorName: input.actorName,
    targetType: "ErpConnection",
    targetId: conn.id,
    targetLabel: conn.label,
    metadata: { provider: conn.provider },
  });

  return conn;
}

export async function updateErpConnection(
  connectionId: string,
  organizationId: string,
  input: {
    label?: string;
    apiEndpoint?: string;
    apiKey?: string;
    apiSecret?: string;
    syncEnabled?: boolean;
    syncIntervalMin?: number;
    sourceSystem?: string;
    defaultCurrency?: string;
    fieldMapping?: Record<string, string>;
    metadata?: Record<string, unknown>;
    actorId?: string;
    actorName?: string;
  },
) {
  const existing = await prisma.erpConnection.findUnique({
    where: { id: connectionId },
  });
  if (!existing || existing.organizationId !== organizationId) {
    throw new Error("اتصال ERP غير موجود");
  }

  const conn = await prisma.erpConnection.update({
    where: { id: connectionId },
    data: {
      label: input.label ?? existing.label,
      apiEndpoint:
        input.apiEndpoint !== undefined
          ? trimValue(input.apiEndpoint)
          : existing.apiEndpoint,
      apiKey: input.apiKey !== undefined ? input.apiKey : existing.apiKey,
      apiSecret:
        input.apiSecret !== undefined ? input.apiSecret : existing.apiSecret,
      syncEnabled:
        input.syncEnabled ?? existing.syncEnabled,
      syncIntervalMin:
        input.syncIntervalMin ?? existing.syncIntervalMin,
      sourceSystem:
        input.sourceSystem !== undefined
          ? trimValue(input.sourceSystem)
          : existing.sourceSystem,
      defaultCurrency:
        input.defaultCurrency ?? existing.defaultCurrency,
      fieldMapping:
        input.fieldMapping !== undefined
          ? (input.fieldMapping as unknown as Prisma.InputJsonValue)
          : (existing.fieldMapping as unknown as Prisma.InputJsonValue),
      metadata:
        input.metadata !== undefined
          ? (input.metadata as unknown as Prisma.InputJsonValue)
          : (existing.metadata as unknown as Prisma.InputJsonValue),
    },
  });

  await writePlatformAuditLog({
    productKey: PRODUCT_KEY,
    action: "erp.connection.updated",
    actorId: input.actorId,
    actorName: input.actorName,
    targetType: "ErpConnection",
    targetId: conn.id,
    targetLabel: conn.label,
  });

  return conn;
}

export async function deleteErpConnection(
  connectionId: string,
  organizationId: string,
  actor?: { id: string; name: string },
) {
  const existing = await prisma.erpConnection.findUnique({
    where: { id: connectionId },
  });
  if (!existing || existing.organizationId !== organizationId) {
    throw new Error("اتصال ERP غير موجود");
  }

  await prisma.erpConnection.delete({
    where: { id: connectionId },
  });

  await writePlatformAuditLog({
    productKey: PRODUCT_KEY,
    action: "erp.connection.deleted",
    actorId: actor?.id,
    actorName: actor?.name,
    targetType: "ErpConnection",
    targetId: connectionId,
    targetLabel: existing.label,
  });
}

// ─── ErpImportBatch ───

export async function listImportBatches(
  connectionId: string,
  organizationId: string,
  statusFilter?: string,
) {
  const where: Prisma.ErpImportBatchWhereInput = {
    connection: { organizationId },
    connectionId,
  };
  if (statusFilter) {
    where.status = statusFilter;
  }
  return prisma.erpImportBatch.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function listImportBatchesByOrganization(
  organizationId: string,
  statusFilter?: string,
) {
  const where: Prisma.ErpImportBatchWhereInput = {
    connection: { organizationId },
  };
  if (statusFilter) {
    where.status = statusFilter;
  }
  return prisma.erpImportBatch.findMany({
    where,
    include: {
      connection: { select: { id: true, label: true, provider: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getImportBatch(
  batchId: string,
  organizationId: string,
) {
  const batch = await prisma.erpImportBatch.findUnique({
    where: { id: batchId },
    include: {
      connection: {
        select: { id: true, label: true, provider: true },
      },
    },
  });
  if (!batch || batch.organizationId !== organizationId) {
    return null;
  }
  return batch;
}

export async function approveImportBatch(
  batchId: string,
  organizationId: string,
  actor: { id: string; name: string },
) {
  const batch = await getImportBatch(batchId, organizationId);
  if (!batch) {
    throw new Error("الدفعة غير موجودة");
  }
  if (batch.status !== "needs_review" && batch.status !== "validated") {
    throw new Error(
      `لا يمكن اعتماد دفعة بحالة ${batch.status}. مطلوب: needs_review أو validated`,
    );
  }

  const updated = await prisma.erpImportBatch.update({
    where: { id: batchId },
    data: {
      status: "approved",
      reviewedById: actor.id,
      reviewedAt: new Date(),
      approvedById: actor.id,
      approvedAt: new Date(),
    },
  });

  await writePlatformAuditLog({
    productKey: PRODUCT_KEY,
    action: "erp.batch.approved",
    actorId: actor.id,
    actorName: actor.name,
    targetType: "ErpImportBatch",
    targetId: batchId,
    metadata: { connectionId: batch.connectionId, totalLines: batch.totalLines },
  });

  return updated;
}

export async function rejectImportBatch(
  batchId: string,
  organizationId: string,
  actor: { id: string; name: string },
  reason?: string,
) {
  const batch = await getImportBatch(batchId, organizationId);
  if (!batch) {
    throw new Error("الدفعة غير موجودة");
  }
  if (batch.status !== "needs_review" && batch.status !== "validated") {
    throw new Error(
      `لا يمكن رفض دفعة بحالة ${batch.status}`,
    );
  }

  const updated = await prisma.erpImportBatch.update({
    where: { id: batchId },
    data: {
      status: "rejected",
      reviewNotes: reason ?? null,
      reviewedById: actor.id,
      reviewedAt: new Date(),
    },
  });

  await writePlatformAuditLog({
    productKey: PRODUCT_KEY,
    action: "erp.batch.rejected",
    actorId: actor.id,
    actorName: actor.name,
    targetType: "ErpImportBatch",
    targetId: batchId,
    metadata: { connectionId: batch.connectionId, reason },
  });

  return updated;
}

// ─── Test / Trigger / Toggle ───

export async function testErpConnection(
  connectionId: string,
  organizationId: string,
  actor?: { id: string; name: string },
) {
  const conn = await getErpConnection(connectionId, organizationId);
  if (!conn) {
    throw new Error("اتصال ERP غير موجود");
  }

  const { createErpConnector } = await import("./connector-factory");
  const record = {
    id: conn.id,
    organizationId: conn.organizationId,
    provider: conn.provider,
    label: conn.label,
    connectionType: conn.connectionType,
    apiEndpoint: conn.apiEndpoint,
    apiKey: conn.apiKey,
    apiSecret: conn.apiSecret,
    fieldMapping: conn.fieldMapping,
    defaultCurrency: conn.defaultCurrency,
    metadata: conn.metadata,
  };

  try {
    const connector = await createErpConnector(record);
    const health = await connector.testConnection();
    const result = health.success ? "success" : "failed";

    await writePlatformAuditLog({
      productKey: PRODUCT_KEY,
      action: "erp.connection.test",
      actorId: actor?.id,
      actorName: actor?.name,
      targetType: "ErpConnection",
      targetId: connectionId,
      targetLabel: conn.label,
      metadata: { result, message: health.message },
    });

    return health;
  } catch (err) {
    const message = err instanceof Error ? err.message : "فشل الاتصال";
    await writePlatformAuditLog({
      productKey: PRODUCT_KEY,
      action: "erp.connection.test",
      actorId: actor?.id,
      actorName: actor?.name,
      targetType: "ErpConnection",
      targetId: connectionId,
      targetLabel: conn.label,
      severity: "error",
      metadata: { result: "failed", message },
    });

    return { success: false, message };
  }
}

export async function triggerImport(
  connectionId: string,
  organizationId: string,
  actor?: { id: string; name: string },
) {
  const conn = await getErpConnection(connectionId, organizationId);
  if (!conn) {
    throw new Error("اتصال ERP غير موجود");
  }

  const { runErpImport } = await import("./import-pipeline");
  const result = await runErpImport({
    organizationId,
    connectionId,
    actorId: actor?.id,
    actorName: actor?.name,
  });

  await writePlatformAuditLog({
    productKey: PRODUCT_KEY,
    action: "erp.import.triggered",
    actorId: actor?.id,
    actorName: actor?.name,
    targetType: "ErpConnection",
    targetId: connectionId,
    targetLabel: conn.label,
    metadata: {
      batchId: result.batchId,
      totalRecords: result.totalRecords,
      status: result.status,
    },
  });

  return result;
}

export async function toggleSync(
  connectionId: string,
  organizationId: string,
  enabled: boolean,
  actor?: { id: string; name: string },
) {
  const conn = await getErpConnection(connectionId, organizationId);
  if (!conn) {
    throw new Error("اتصال ERP غير موجود");
  }

  const updated = await prisma.erpConnection.update({
    where: { id: connectionId },
    data: { syncEnabled: enabled },
  });

  await writePlatformAuditLog({
    productKey: PRODUCT_KEY,
    action: enabled ? "erp.sync.enabled" : "erp.sync.disabled",
    actorId: actor?.id,
    actorName: actor?.name,
    targetType: "ErpConnection",
    targetId: connectionId,
    targetLabel: conn.label,
  });

  return updated;
}

// ─── ErpSyncLog ───

export async function listSyncLogs(
  connectionId: string,
  organizationId: string,
  limit = 20,
) {
  return prisma.erpSyncLog.findMany({
    where: {
      connection: { organizationId },
      connectionId,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
