import "server-only";

import { prisma } from "@/lib/prisma";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { createConnector } from "./connector-factory";
import type { CrmProvider, SyncResult, SyncResourceType } from "./types";

// ─── Run a full CRM sync ───

export async function runSync(
  organizationId: string,
  provider: CrmProvider,
  actor?: { id: string; name?: string },
): Promise<SyncResult> {
  const startedAt = new Date().toISOString();

  const connection = await prisma.crmConnection.findFirst({
    where: { organizationId, provider, syncEnabled: true },
  });

  if (!connection) {
    throw new Error(`No active ${provider} connection found for this organization`);
  }

  const connector = createConnector(connection);
  const resourceResults: SyncResult["resources"] = [];
  const resourceTypes: SyncResourceType[] = ["account", "contact", "opportunity"];

  for (const resourceType of resourceTypes) {
    const syncLog = await prisma.crmSyncLog.create({
      data: {
        connectionId: connection.id,
        organizationId,
        resourceType,
        direction: "import",
        status: "running",
      },
      select: { id: true },
    });

    try {
      const fetcher = getFetcher(connector, resourceType);
      const records = await fetcher(connection.lastSyncAt ?? undefined);

      if (!connector.syncToLocal) {
        throw new Error(`Connector ${connector.provider} does not support syncToLocal`);
      }

      const syncResult = await connector.syncToLocal(
        organizationId,
        {
          accounts: resourceType === "account" ? (records as never[]) : [],
          contacts: resourceType === "contact" ? (records as never[]) : [],
          opportunities: resourceType === "opportunity" ? (records as never[]) : [],
        },
        connection.conflictPolicy ?? "crm_wins",
      );

      const counts = resourceType === "account"
        ? syncResult.accounts
        : resourceType === "contact"
          ? syncResult.contacts
          : syncResult.opportunities;

      const totalRecords = records.length;
      const failed = counts.failed;
      const status = failed > 0 && counts.created === 0 && counts.updated === 0
        ? "failed"
        : failed > 0
          ? "partial"
          : "success";

      await prisma.crmSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status,
          totalRecords,
          createdRecords: counts.created,
          updatedRecords: counts.updated,
          failedRecords: counts.failed,
          skippedRecords: counts.skipped,
          completedAt: new Date(),
        },
      });

      resourceResults.push({
        resourceType,
        direction: "import",
        status,
        totalRecords,
        createdRecords: counts.created,
        updatedRecords: counts.updated,
        failedRecords: counts.failed,
        skippedRecords: counts.skipped,
        syncLogId: syncLog.id,
        requiresReview: false,
      });

      await logAuditEvent(connection.id, organizationId, resourceType, status, actor);
    } catch (err) {
      const errorDetails = err instanceof Error ? err.message : "Unknown error";

      await prisma.crmSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: "failed",
          errorDetails,
          completedAt: new Date(),
        },
      });

      resourceResults.push({
        resourceType,
        direction: "import",
        status: "failed",
        totalRecords: 0,
        createdRecords: 0,
        updatedRecords: 0,
        failedRecords: 0,
        skippedRecords: 0,
        syncLogId: syncLog.id,
        requiresReview: false,
        errorDetails,
      });
    }
  }

  const overallFailed = resourceResults.some((r) => r.status === "failed");
  const overallPartial = resourceResults.some((r) => r.status === "partial");
  const overallSuccess = !overallFailed && !overallPartial;

  await prisma.crmConnection.update({
    where: { id: connection.id },
    data: {
      lastSyncAt: new Date(),
      lastSyncStatus: overallSuccess ? "success" : overallPartial ? "partial" : "failed",
    },
  });

  const completedAt = new Date().toISOString();

  return {
    connectionId: connection.id,
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

async function logAuditEvent(
  connectionId: string,
  organizationId: string,
  resourceType: string,
  status: string,
  actor?: { id: string; name?: string },
): Promise<void> {
  await writePlatformAuditLog({
    productKey: "salesos",
    action: `crm.sync.${resourceType}.${status}`,
    platformOrganizationId: organizationId,
    sourceSystem: "crm-sync",
    actorId: actor?.id ?? "system",
    actorName: actor?.name ?? "CRM Sync",
    targetType: "CrmConnection",
    targetId: connectionId,
    targetLabel: `CRM Sync: ${resourceType}`,
    severity: status === "failed" ? "error" : "info",
    status: status === "success" ? "success" : "failure",
    metadata: { resourceType, syncStatus: status },
  });
}

// ─── Get latest sync status ───

export async function getLatestSyncStatus(
  organizationId: string,
  provider: CrmProvider,
) {
  const connection = await prisma.crmConnection.findFirst({
    where: { organizationId, provider },
    select: {
      id: true,
      lastSyncAt: true,
      lastSyncStatus: true,
      syncEnabled: true,
      label: true,
    },
  });

  if (!connection) return null;

  const latestLog = await prisma.crmSyncLog.findFirst({
    where: { connectionId: connection.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      totalRecords: true,
      createdRecords: true,
      updatedRecords: true,
      failedRecords: true,
      createdAt: true,
      completedAt: true,
    },
  });

  return {
    connection: connection.label,
    lastSyncAt: connection.lastSyncAt,
    lastSyncStatus: connection.lastSyncStatus,
    syncEnabled: connection.syncEnabled,
    latestLog,
  };
}

// ─── Get aggregate sync counts ───

export async function getSyncCounts(
  organizationId: string,
  provider: CrmProvider,
) {
  const connection = await prisma.crmConnection.findFirst({
    where: { organizationId, provider },
    select: { id: true },
  });

  if (!connection) {
    return { dealsImported: 0, contactsImported: 0, accountsImported: 0 };
  }

  const [deals, contacts, accounts] = await Promise.all([
    prisma.crmSyncLog.aggregate({
      where: { connectionId: connection.id, resourceType: "opportunity" },
      _sum: { createdRecords: true },
    }),
    prisma.crmSyncLog.aggregate({
      where: { connectionId: connection.id, resourceType: "contact" },
      _sum: { createdRecords: true },
    }),
    prisma.crmSyncLog.aggregate({
      where: { connectionId: connection.id, resourceType: "account" },
      _sum: { createdRecords: true },
    }),
  ]);

  return {
    dealsImported: deals._sum.createdRecords ?? 0,
    contactsImported: contacts._sum.createdRecords ?? 0,
    accountsImported: accounts._sum.createdRecords ?? 0,
  };
}
