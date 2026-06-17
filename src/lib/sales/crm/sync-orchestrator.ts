import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { createConnector } from "./connector-factory";
import { notifyOnEvent } from "@/lib/platform/notification/integration";
import {
  applyAccountMapping,
  applyContactMapping,
  applyOpportunityMapping,
  getDefaultMappings,
} from "./field-mapping";
import type {
  ConflictPolicy,
  SyncOptions,
  SyncResourceResult,
  SyncResult,
  SyncResourceType,
  SyncStatus,
} from "./types";

const SYNC_RESOURCE_ORDER: SyncResourceType[] = [
  "account",
  "contact",
  "opportunity",
];

// ─── Upsert helpers ───

async function upsertAccount(
  organizationId: string,
  mapped: { name: string; industry?: string; website?: string; phone?: string; description?: string },
  crmId: string,
  conflictPolicy: ConflictPolicy,
): Promise<{ action: "created" | "updated" | "skipped" }> {
  const existing = await prisma.salesAccount.findFirst({
    where: { organizationId, metadata: { path: ["crmId"], equals: crmId } },
    select: { id: true },
  });

  if (existing) {
    if (conflictPolicy === "crm_wins") {
      const updateData: Record<string, unknown> = { name: mapped.name };
      if (mapped.industry !== undefined) updateData.industry = mapped.industry;
      await prisma.salesAccount.update({
        where: { id: existing.id },
        data: updateData as Record<string, never> & { name: string },
      });
      return { action: "updated" };
    }
    return { action: "skipped" };
  }

  const acc = await prisma.salesAccount.create({
    data: {
      organizationId,
      name: mapped.name,
      industry: mapped.industry ?? null,
      metadata: { crmId, crmWebsite: mapped.website, crmPhone: mapped.phone, crmDescription: mapped.description } as Prisma.InputJsonValue,
      createdById: "crm-sync",
      updatedById: "crm-sync",
    },
    select: { id: true },
  });

  return { action: "created" };
}

async function upsertContact(
  organizationId: string,
  mapped: { name: string; email?: string; title?: string; phone?: string; accountId: string },
  crmId: string,
  conflictPolicy: ConflictPolicy,
): Promise<{ action: "created" | "updated" | "skipped" }> {
  const existing = await prisma.salesContact.findFirst({
    where: { organizationId },
    select: { id: true },
  });

  if (existing) {
    if (conflictPolicy === "crm_wins") {
      await prisma.salesContact.update({
        where: { id: existing.id },
        data: { name: mapped.name, email: mapped.email ?? null, role: mapped.title ?? null },
      });
      return { action: "updated" };
    }
    return { action: "skipped" };
  }

  await prisma.salesContact.create({
    data: {
      organizationId,
      accountId: mapped.accountId,
      name: mapped.name,
      email: mapped.email ?? null,
      role: mapped.title ?? null,
    },
  });

  return { action: "created" };
}

async function upsertOpportunity(
  organizationId: string,
  mapped: { name: string; amount?: number; currency?: string; stage?: string; probability?: number; expectedCloseDate?: string; accountId: string },
  crmId: string,
  conflictPolicy: ConflictPolicy,
): Promise<{ action: "created" | "updated" | "skipped" }> {
  const existing = await prisma.salesDeal.findFirst({
    where: { organizationId, metadata: { path: ["crmId"], equals: crmId } },
    select: { id: true },
  });

  if (existing) {
    if (conflictPolicy === "crm_wins") {
      await prisma.salesDeal.update({
        where: { id: existing.id },
        data: {
          title: mapped.name,
          amount: mapped.amount ?? null,
          currency: mapped.currency ?? "SAR",
          probability: mapped.probability ?? null,
          expectedCloseDate: mapped.expectedCloseDate ? new Date(mapped.expectedCloseDate) : null,
        },
      });
      return { action: "updated" };
    }
    return { action: "skipped" };
  }

  await prisma.salesDeal.create({
    data: {
      organizationId,
      accountId: mapped.accountId,
      title: mapped.name,
      amount: mapped.amount ?? null,
      currency: mapped.currency ?? "SAR",
      probability: mapped.probability ?? null,
      expectedCloseDate: mapped.expectedCloseDate ? new Date(mapped.expectedCloseDate) : null,
      createdById: "crm-sync",
      updatedById: "crm-sync",
    },
  });

  return { action: "created" };
}

// ─── Create sync log ───

async function createSyncLog(
  connectionId: string,
  organizationId: string,
  resourceType: SyncResourceType,
  direction: "import" | "export",
): Promise<string> {
  const log = await prisma.crmSyncLog.create({
    data: {
      connectionId,
      organizationId,
      resourceType,
      direction,
      status: "running",
    },
    select: { id: true },
  });
  return log.id;
}

async function completeSyncLog(
  logId: string,
  status: SyncStatus,
  counts: {
    totalRecords: number;
    createdRecords: number;
    updatedRecords: number;
    failedRecords: number;
    skippedRecords: number;
  },
  errorDetails?: string,
): Promise<void> {
  await prisma.crmSyncLog.update({
    where: { id: logId },
    data: {
      status,
      totalRecords: counts.totalRecords,
      createdRecords: counts.createdRecords,
      updatedRecords: counts.updatedRecords,
      failedRecords: counts.failedRecords,
      skippedRecords: counts.skippedRecords,
      errorDetails: errorDetails ?? undefined,
      completedAt: new Date(),
    },
  });
}

// ─── Main sync ───

export async function runSync(
  connectionId: string,
  organizationId: string,
  actor?: { id: string; name?: string },
  options?: SyncOptions,
): Promise<SyncResult> {
  const connection = await prisma.crmConnection.findFirst({
    where: { id: connectionId, organizationId },
  });

  if (!connection) {
    throw new Error("CRM connection not found for this organization");
  }

  const startedAt = new Date().toISOString();
  const resources: SyncResourceType[] = options?.resourceTypes ?? SYNC_RESOURCE_ORDER;
  const conflictPolicy: ConflictPolicy = options?.conflictPolicy ?? (connection.conflictPolicy as ConflictPolicy) ?? "crm_wins";

  const connector = createConnector(connection);

  const resourceResults: SyncResourceResult[] = [];

  for (const resourceType of resources) {
    const syncLogId = await createSyncLog(connectionId, organizationId, resourceType, "import");

    try {
      const fetcher = getFetcher(connector, resourceType);
      const crmRecords = await fetcher(options?.since ?? connection.lastSyncAt ?? undefined);

      let createdRecords = 0;
      let updatedRecords = 0;
      let skippedRecords = 0;
      let failedRecords = 0;

      const mappings = getDefaultMappings(connection.provider, resourceType);
      const requiresReview = conflictPolicy === "manual";

      for (const crmRecord of crmRecords) {
        try {
          let action: "created" | "updated" | "skipped";

          if (resourceType === "account") {
            const mapped = applyAccountMapping(crmRecord as never, mappings, "crm_to_sales");
            action = (await upsertAccount(organizationId, mapped, (crmRecord as { id: string }).id, conflictPolicy)).action;
          } else if (resourceType === "contact") {
            const mapped = applyContactMapping(crmRecord as never, mappings, "crm_to_sales");
            action = (await upsertContact(organizationId, mapped, (crmRecord as { id: string }).id, conflictPolicy)).action;
          } else if (resourceType === "opportunity") {
            const mapped = applyOpportunityMapping(crmRecord as never, mappings, "crm_to_sales");
            action = (await upsertOpportunity(organizationId, mapped, (crmRecord as { id: string }).id, conflictPolicy)).action;
          } else {
            action = "skipped";
          }

          if (action === "created") createdRecords++;
          else if (action === "updated") updatedRecords++;
          else skippedRecords++;
        } catch {
          failedRecords++;
        }
      }

      const status: SyncStatus = failedRecords > 0 && createdRecords === 0 && updatedRecords === 0
        ? "failed"
        : failedRecords > 0
          ? "partial"
          : "success";

      await completeSyncLog(syncLogId, status, {
        totalRecords: crmRecords.length,
        createdRecords,
        updatedRecords,
        failedRecords,
        skippedRecords,
      });

      resourceResults.push({
        resourceType,
        direction: "import",
        status,
        totalRecords: crmRecords.length,
        createdRecords,
        updatedRecords,
        failedRecords,
        skippedRecords,
        syncLogId,
        requiresReview,
      });

      await logSyncAuditEvent(connectionId, organizationId, resourceType, status, actor);
    } catch (err) {
      const errorDetails = err instanceof Error ? err.message : "Unknown error";

      await completeSyncLog(syncLogId, "failed", {
        totalRecords: 0,
        createdRecords: 0,
        updatedRecords: 0,
        failedRecords: 0,
        skippedRecords: 0,
      }, errorDetails);

      resourceResults.push({
        resourceType,
        direction: "import",
        status: "failed",
        totalRecords: 0,
        createdRecords: 0,
        updatedRecords: 0,
        failedRecords: 0,
        skippedRecords: 0,
        syncLogId,
        requiresReview: false,
        errorDetails,
      });

      try {
        const connection = await prisma.crmConnection.findUnique({
          where: { id: connectionId },
          select: { label: true },
        });
        const admins = await prisma.user.findMany({
          where: { organizationId, role: "ADMIN" },
          select: { id: true },
          take: 1,
        });
        if (admins.length > 0 && connection) {
          await notifyOnEvent("on_error", organizationId, connectionId, {
            productKey: "sales_os",
            templateKey: "sales_crm_sync_error",
            recipientId: admins[0].id,
            templateVars: {
              systemName: connection.label,
              errorMessage: errorDetails,
            },
          });
        }
      } catch {
        // Notification must not block the primary action
      }
    }
  }

  // Update connection last sync
  const overallFailed = resourceResults.some((r) => r.status === "failed");
  const overallPartial = resourceResults.some((r) => r.status === "partial");
  const overallSuccess = !overallFailed && !overallPartial;

  await prisma.crmConnection.update({
    where: { id: connectionId },
    data: {
      lastSyncAt: new Date(),
      lastSyncStatus: overallSuccess ? "success" : overallPartial ? "partial" : "failed",
    },
  });

  const completedAt = new Date().toISOString();

  return {
    connectionId,
    organizationId,
    startedAt,
    completedAt,
    overallStatus: overallSuccess ? "success" : overallPartial ? "partial" : "failed",
    resources: resourceResults,
  };
}

function getFetcher(
  connector: ReturnType<typeof createConnector>,
  resourceType: SyncResourceType,
): (since?: Date) => Promise<unknown[]> {
  switch (resourceType) {
    case "account":
      return (since?: Date) => connector.fetchAccounts(since);
    case "contact":
      return (since?: Date) => connector.fetchContacts(since);
    case "opportunity":
      return (since?: Date) => connector.fetchOpportunities(since);
    default:
      throw new Error(`Unsupported resource type: ${resourceType}`);
  }
}

async function logSyncAuditEvent(
  connectionId: string,
  organizationId: string,
  resourceType: string,
  status: string,
  actor?: { id: string; name?: string },
): Promise<void> {
  await writePlatformAuditLog({
    productKey: "sales_os",
    action: `crm.sync.${resourceType}.${status}`,
    platformOrganizationId: organizationId,
    sourceSystem: "crm-sync",
    actorId: actor?.id ?? "system",
    actorName: actor?.name ?? "CRM Sync",
    targetType: "CrmConnection",
    targetId: connectionId,
    targetLabel: `CRM Sync: ${resourceType}`,
    severity: status === "failed" ? "error" : "info",
    status: status === "success" ? "success" : status === "partial" ? "failure" : "failure",
    metadata: {
      resourceType,
      syncStatus: status,
    },
  });
}

// ─── Test connection ───

export async function testCrmConnection(
  connectionId: string,
  organizationId: string,
): Promise<{ success: boolean; message: string }> {
  const connection = await prisma.crmConnection.findFirst({
    where: { id: connectionId, organizationId },
  });

  if (!connection) {
    throw new Error("CRM connection not found for this organization");
  }

  const connector = createConnector(connection);
  return connector.testConnection();
}

// ─── List sync logs ───

export async function listSyncLogs(
  connectionId: string,
  organizationId: string,
  limit = 20,
) {
  return prisma.crmSyncLog.findMany({
    where: { connectionId, organizationId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      resourceType: true,
      direction: true,
      status: true,
      totalRecords: true,
      createdRecords: true,
      updatedRecords: true,
      failedRecords: true,
      skippedRecords: true,
      errorDetails: true,
      createdAt: true,
      completedAt: true,
    },
  });
}

// ─── List connections ───

export async function listCrmConnections(organizationId: string) {
  return prisma.crmConnection.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      provider: true,
      label: true,
      syncEnabled: true,
      syncIntervalMin: true,
      lastSyncAt: true,
      lastSyncStatus: true,
      lastSyncError: true,
      conflictPolicy: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}


