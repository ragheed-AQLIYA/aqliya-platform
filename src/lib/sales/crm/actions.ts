"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { runSync, testCrmConnection as orchestratorTest, listSyncLogs as orchestratorListLogs, listCrmConnections as orchestratorList } from "./sync-orchestrator";
import type { SyncOptions, SyncResult } from "./types";

async function requireOrg(organizationId?: string): Promise<string> {
  const user = await getCurrentUser();
  if (organizationId && user.organizationId !== organizationId) {
    throw new Error("Unauthorized: organization mismatch");
  }
  return user.organizationId;
}

// ─── Connection CRUD ───

export async function createCrmConnection(
  organizationId: string,
  data: {
    provider: string;
    label: string;
    apiEndpoint?: string;
    accessToken?: string;
    refreshToken?: string;
    apiKey?: string;
    apiVersion?: string;
    syncEnabled?: boolean;
    syncIntervalMin?: number;
    conflictPolicy?: string;
    metadata?: Record<string, string>;
  },
) {
  const user = await getCurrentUser();
  const orgId = await requireOrg(organizationId);

  const connection = await prisma.crmConnection.create({
    data: {
      organizationId: orgId,
      provider: data.provider,
      label: data.label,
      apiEndpoint: data.apiEndpoint ?? null,
      accessToken: data.accessToken ? Buffer.from(data.accessToken).toString("base64") : null,
      refreshToken: data.refreshToken ? Buffer.from(data.refreshToken).toString("base64") : null,
      apiKey: data.apiKey ? Buffer.from(data.apiKey).toString("base64") : null,
      apiVersion: data.apiVersion ?? "v1",
      syncEnabled: data.syncEnabled ?? false,
      syncIntervalMin: data.syncIntervalMin ?? 60,
      conflictPolicy: data.conflictPolicy ?? "crm_wins",
      metadata: (data.metadata ?? {}) as unknown as Record<string, never>,
      createdById: user.id,
    },
    select: { id: true, label: true, provider: true, syncEnabled: true, lastSyncStatus: true, lastSyncAt: true },
  });

  await writePlatformAuditLog({
    productKey: "sales_os",
    action: "crm.connection.created",
    platformOrganizationId: orgId,
    actorId: user.id,
    actorName: user.name ?? undefined,
    targetType: "CrmConnection",
    targetId: connection.id,
    targetLabel: data.label,
  });

  return connection;
}

export async function updateCrmConnection(
  organizationId: string,
  connectionId: string,
  data: {
    label?: string;
    apiEndpoint?: string;
    accessToken?: string;
    refreshToken?: string;
    apiKey?: string;
    apiVersion?: string;
    syncEnabled?: boolean;
    syncIntervalMin?: number;
    conflictPolicy?: string;
    metadata?: Record<string, string>;
  },
) {
  const user = await getCurrentUser();
  const orgId = await requireOrg(organizationId);

  const existing = await prisma.crmConnection.findFirst({
    where: { id: connectionId, organizationId: orgId },
    select: { id: true },
  });
  if (!existing) throw new Error("CRM connection not found");

  const updateData: Record<string, unknown> = {};
  if (data.label !== undefined) updateData.label = data.label;
  if (data.apiEndpoint !== undefined) updateData.apiEndpoint = data.apiEndpoint;
  if (data.accessToken !== undefined) updateData.accessToken = Buffer.from(data.accessToken).toString("base64");
  if (data.refreshToken !== undefined) updateData.refreshToken = Buffer.from(data.refreshToken).toString("base64");
  if (data.apiKey !== undefined) updateData.apiKey = Buffer.from(data.apiKey).toString("base64");
  if (data.apiVersion !== undefined) updateData.apiVersion = data.apiVersion;
  if (data.syncEnabled !== undefined) updateData.syncEnabled = data.syncEnabled;
  if (data.syncIntervalMin !== undefined) updateData.syncIntervalMin = data.syncIntervalMin;
  if (data.conflictPolicy !== undefined) updateData.conflictPolicy = data.conflictPolicy;
  if (data.metadata !== undefined) updateData.metadata = data.metadata;

  await prisma.crmConnection.update({
    where: { id: connectionId },
    data: updateData as Record<string, never>,
  });

  await writePlatformAuditLog({
    productKey: "sales_os",
    action: "crm.connection.updated",
    platformOrganizationId: orgId,
    actorId: user.id,
    actorName: user.name ?? undefined,
    targetType: "CrmConnection",
    targetId: connectionId,
    metadata: { updatedFields: Object.keys(data) },
  });
}

export async function deleteCrmConnection(
  organizationId: string,
  connectionId: string,
) {
  const user = await getCurrentUser();
  const orgId = await requireOrg(organizationId);

  const existing = await prisma.crmConnection.findFirst({
    where: { id: connectionId, organizationId: orgId },
    select: { id: true, label: true },
  });
  if (!existing) throw new Error("CRM connection not found");

  await prisma.crmConnection.delete({ where: { id: connectionId } });

  await writePlatformAuditLog({
    productKey: "sales_os",
    action: "crm.connection.deleted",
    platformOrganizationId: orgId,
    actorId: user.id,
    actorName: user.name ?? undefined,
    targetType: "CrmConnection",
    targetId: connectionId,
    targetLabel: existing.label ?? undefined,
  });
}

// ─── Sync actions ───

export async function triggerSync(
  organizationId: string,
  connectionId: string,
  options?: SyncOptions,
): Promise<SyncResult> {
  const user = await getCurrentUser();
  const orgId = await requireOrg(organizationId);
  return runSync(connectionId, orgId, { id: user.id, name: user.name ?? undefined }, options);
}

export async function testCrmConnection(
  organizationId: string,
  connectionId: string,
) {
  const user = await getCurrentUser();
  const orgId = await requireOrg(organizationId);
  return orchestratorTest(connectionId, orgId);
}

export async function toggleSync(
  organizationId: string,
  connectionId: string,
  enabled: boolean,
) {
  const user = await getCurrentUser();
  const orgId = await requireOrg(organizationId);

  const existing = await prisma.crmConnection.findFirst({
    where: { id: connectionId, organizationId: orgId },
    select: { id: true, label: true },
  });
  if (!existing) throw new Error("CRM connection not found");

  await prisma.crmConnection.update({
    where: { id: connectionId },
    data: { syncEnabled: enabled },
  });

  await writePlatformAuditLog({
    productKey: "sales_os",
    action: enabled ? "crm.connection.sync_enabled" : "crm.connection.sync_disabled",
    platformOrganizationId: orgId,
    actorId: user.id,
    actorName: user.name ?? undefined,
    targetType: "CrmConnection",
    targetId: connectionId,
    targetLabel: existing.label ?? undefined,
  });
}

// ─── List data ───

export async function listCrmConnections(organizationId: string) {
  const user = await getCurrentUser();
  const orgId = await requireOrg(organizationId);
  return orchestratorList(orgId);
}

export async function getCrmConnection(
  organizationId: string,
  connectionId: string,
) {
  const user = await getCurrentUser();
  const orgId = await requireOrg(organizationId);

  const connection = await prisma.crmConnection.findFirst({
    where: { id: connectionId, organizationId: orgId },
    select: {
      id: true,
      provider: true,
      label: true,
      apiEndpoint: true,
      apiVersion: true,
      syncEnabled: true,
      syncIntervalMin: true,
      lastSyncAt: true,
      lastSyncStatus: true,
      lastSyncError: true,
      conflictPolicy: true,
      fieldMapping: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!connection) throw new Error("CRM connection not found");
  return connection;
}

export async function listSyncLogs(
  organizationId: string,
  connectionId: string,
  limit?: number,
) {
  const user = await getCurrentUser();
  const orgId = await requireOrg(organizationId);
  return orchestratorListLogs(connectionId, orgId, limit);
}
