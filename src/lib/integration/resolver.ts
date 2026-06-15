// ─── IntegrationResolver — Compatibility Layer (Sprint 1) ───
// Reads from TenantIntegration (new) with fallback to legacy connections.
// During migration, OLD tables are read-only. All NEW writes go to TenantIntegration.

import "server-only";
import { prisma } from "@/lib/prisma";
import type { HealthCheckResult, IntegrationType } from "./types";
import type { TenantIntegration, CrmConnection, ErpConnection } from "@prisma/client";

// ─── Source type for audit/logging ───

export type IntegrationSource =
  | "tenant-integration"
  | "legacy-crm"
  | "legacy-erp"
  | "env-var"
  | "none";

export interface IntegrationRecord {
  id: string;
  organizationId: string;
  type: string;
  provider: string;
  displayName: string;
  status: string;
  priority: number;
  vaultSecretId?: string;
  configMetadata?: Record<string, unknown>;
  lastHealthCheckAt?: Date;
  lastSuccessAt?: Date;
  lastFailureAt?: Date;
  failureReason?: string;
  failureCount: number;
  createdById?: string;
  source: IntegrationSource;
}

export interface ResolvedIntegration {
  record: IntegrationRecord;
}

// ═══════════════════════════════════════════════════
//  PUBLIC API
// ═══════════════════════════════════════════════════

/**
 * Resolve all integrations for an organization + type.
 * Checks TenantIntegration first, then falls back to legacy connections.
 */
export async function resolveIntegrations(
  organizationId: string,
  type: string,
): Promise<IntegrationRecord[]> {
  const results: IntegrationRecord[] = [];

  // 1. Try TenantIntegration (new path)
  const tiRecords = await prisma.tenantIntegration.findMany({
    where: { organizationId, type: type as IntegrationType },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
  });

  for (const ti of tiRecords) {
    results.push(mapToRecord(ti, "tenant-integration"));
  }

  // 2. Fall back to legacy connections for CRM / ERP
  if (type === "CRM" || type === "crm") {
    const crmRecords = await prisma.crmConnection.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
    for (const crm of crmRecords) {
      if (!results.some((r) => r.provider === crm.provider)) {
        results.push(mapLegacyCrmToRecord(crm));
      }
    }
  }

  if (type === "ERP" || type === "erp") {
    const erpRecords = await prisma.erpConnection.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
    for (const erp of erpRecords) {
      if (!results.some((r) => r.provider === erp.provider)) {
        results.push(mapLegacyErpToRecord(erp));
      }
    }
  }

  return results;
}

/**
 * Resolve the BEST single integration for an org + type.
 * Priority: ACTIVE TenantIntegration → PENDING → legacy → env-var heuristic
 */
export async function resolveBestIntegration(
  organizationId: string,
  type: string,
): Promise<ResolvedIntegration | null> {
  const integrations = await resolveIntegrations(organizationId, type);

  // Filter ACTIVE first, sorted by priority
  const active = integrations
    .filter((r) => r.status === "ACTIVE")
    .sort((a, b) => a.priority - b.priority);

  if (active.length > 0) {
    return { record: active[0] };
  }

  // Fall back to any non-DISABLED integration
  const available = integrations
    .filter((r) => r.status !== "DISABLED")
    .sort((a, b) => a.priority - b.priority);

  if (available.length > 0) {
    return { record: available[0] };
  }

  // No integration found for this type
  return null;
}

/**
 * Resolve a specific integration by ID.
 */
export async function resolveIntegrationById(
  integrationId: string,
): Promise<ResolvedIntegration | null> {
  const ti = await prisma.tenantIntegration.findUnique({
    where: { id: integrationId },
  });

  if (!ti) return null;

  const record = mapToRecord(ti, "tenant-integration");
  return { record };
}

/**
 * Perform health check for an integration.
 * Returns a HealthCheckResult without actually calling the provider (Sprint 1).
 * Actual health check logic will be added when providers are registered.
 */
export async function checkIntegrationHealth(
  organizationId: string,
  integrationId: string,
): Promise<HealthCheckResult> {
  const integration = await prisma.tenantIntegration.findUnique({
    where: { id: integrationId },
  });

  if (!integration) {
    throw new Error(`Integration "${integrationId}" not found`);
  }

  if (integration.organizationId !== organizationId) {
    throw new Error("Integration does not belong to this organization");
  }

  return {
    integrationId: integration.id,
    organizationId: integration.organizationId,
    type: integration.type as IntegrationType,
    provider: integration.provider,
    healthy: integration.status === "ACTIVE",
    latencyMs: 0,
    lastCheckAt: integration.lastHealthCheckAt ?? new Date(),
  };
}

// ═══════════════════════════════════════════════════
//  INTERNAL HELPERS
// ═══════════════════════════════════════════════════

function mapToRecord(
  ti: TenantIntegration,
  source: IntegrationSource,
): IntegrationRecord {
  return {
    id: ti.id,
    organizationId: ti.organizationId,
    type: ti.type,
    provider: ti.provider,
    displayName: ti.displayName ?? "",
    status: ti.status,
    priority: ti.priority,
    vaultSecretId: ti.vaultSecretId ?? undefined,
    configMetadata: (ti.configMetadata as Record<string, unknown>) ?? undefined,
    lastHealthCheckAt: ti.lastHealthCheckAt ?? undefined,
    lastSuccessAt: ti.lastSuccessAt ?? undefined,
    lastFailureAt: ti.lastFailureAt ?? undefined,
    failureReason: ti.failureReason ?? undefined,
    failureCount: ti.failureCount,
    createdById: ti.createdById ?? undefined,
    source,
  };
}

function mapLegacyCrmToRecord(crm: CrmConnection): IntegrationRecord {
  return {
    id: crm.id,
    organizationId: crm.organizationId,
    type: "CRM",
    provider: crm.provider,
    displayName: crm.label,
    status: crm.syncEnabled ? "ACTIVE" : "DISABLED",
    priority: 100, // legacy connections get lower priority
    configMetadata: {
      apiEndpoint: crm.apiEndpoint,
      fieldMapping: crm.fieldMapping,
      conflictPolicy: crm.conflictPolicy,
      metadata: crm.metadata,
    } as Record<string, unknown>,
    lastSuccessAt: crm.lastSyncAt ?? undefined,
    lastFailureAt: undefined,
    failureReason: crm.lastSyncError ?? undefined,
    failureCount: 0,
    createdById: crm.createdById ?? undefined,
    source: "legacy-crm",
  };
}

function mapLegacyErpToRecord(erp: ErpConnection): IntegrationRecord {
  return {
    id: erp.id,
    organizationId: erp.organizationId,
    type: "ERP",
    provider: erp.provider,
    displayName: erp.label,
    status: erp.syncEnabled ? "ACTIVE" : "DISABLED",
    priority: 100,
    configMetadata: {
      apiEndpoint: erp.apiEndpoint,
      connectionType: erp.connectionType,
      sourceSystem: erp.sourceSystem,
      defaultCurrency: erp.defaultCurrency,
      fieldMapping: erp.fieldMapping,
    } as Record<string, unknown>,
    lastSuccessAt: erp.lastSyncAt ?? undefined,
    lastFailureAt: undefined,
    failureReason: undefined,
    failureCount: 0,
    createdById: erp.createdById ?? undefined,
    source: "legacy-erp",
  };
}
