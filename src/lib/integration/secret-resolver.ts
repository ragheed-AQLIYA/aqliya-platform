// ─── SecretResolver — Sole Authorized Secret Read Path (Sprint 2A) ───
// All integration credentials MUST be resolved through SecretResolver,
// never read directly from process.env or Vault by connector code.

import "server-only";
import { prisma } from "@/lib/prisma";
import { getSecret, getSecretMetadata } from "@/lib/platform/secrets/vault-service";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { incrementCounter } from "./metrics";
import type { IntegrationType } from "./types";

// ═══════════════════════════════════════════════════
//  ENUMS & TYPES
// ═══════════════════════════════════════════════════

/** Purpose of secret resolution — enables observability, cost tracking, and audit provenance */
export enum SecretPurpose {
  CRM_SYNC      = "CRM_SYNC",
  ERP_SYNC      = "ERP_SYNC",
  EMAIL_SEND    = "EMAIL_SEND",
  AI_INFERENCE  = "AI_INFERENCE",
  AI_EMBED      = "AI_EMBED",
  AI_EVALUATE   = "AI_EVALUATE",
  HEALTH_CHECK  = "HEALTH_CHECK",
  STORAGE_READ  = "STORAGE_READ",
  STORAGE_WRITE = "STORAGE_WRITE",
  WEBHOOK_SEND  = "WEBHOOK_SEND",
}

/** Where the resolved credentials originated */
export type SecretSource = "vault" | "cache" | "legacy-crm" | "legacy-erp" | "legacy-env";

/** Result of a successful secret resolution */
export interface SecretResult {
  credentials: Record<string, string>;
  source: SecretSource;
  vaultEntryId?: string;
  version: number;
  resolvedAt: Date;
  rotatedAt?: Date;
  cacheHit: boolean;
}

/** Event types for governance audit trail */
export type GovernanceSecretEvent =
  | "SECRET_CREATED"
  | "SECRET_ROTATED"
  | "SECRET_REVOKED"
  | "SECRET_VIEWED";

/** Event types for operational telemetry */
export type OperationalSecretEvent =
  | "SECRET_USED"
  | "SECRET_FAILED";

// ═══════════════════════════════════════════════════
//  SECRET RESOLVER INTERFACE
// ═══════════════════════════════════════════════════

export interface SecretResolver {
  /** Resolve credentials for a specific integration by ID.
   *  `purpose` enables provenance tracking in audit events and telemetry.
   *  Throws if integration not found or secret resolution fails. */
  getIntegrationSecret(
    organizationId: string,
    integrationId: string,
    purpose: SecretPurpose,
    actorId?: string,
  ): Promise<SecretResult>;

  /** Resolve by type+provider for factories that don't have integrationId yet.
   *  Falls back to legacy CrmConnection/ErpConnection for backward compat. */
  getIntegrationSecretByType(
    organizationId: string,
    type: string,
    provider: string,
    purpose: SecretPurpose,
    actorId?: string,
  ): Promise<SecretResult>;
}

// ═══════════════════════════════════════════════════
//  CACHE
// ═══════════════════════════════════════════════════

interface CacheEntry {
  result: SecretResult;
  expiresAt: number; // timestamp ms
}

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

class SecretCache {
  private store = new Map<string, CacheEntry>();

  makeKey(organizationId: string, integrationId: string): string {
    return `${organizationId}:${integrationId}`;
  }

  get(key: string): SecretResult | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.result;
  }

  set(key: string, result: SecretResult, ttlMs: number = DEFAULT_TTL_MS): void {
    this.store.set(key, {
      result: { ...result, source: "cache", cacheHit: true },
      expiresAt: Date.now() + ttlMs,
    });
  }

  /** Invalidate cache for a specific integration.
   *  Called on SECRET_ROTATED and SECRET_REVOKED events. */
  invalidate(organizationId: string, integrationId: string): void {
    const key = this.makeKey(organizationId, integrationId);
    this.store.delete(key);
  }

  /** Get current cache size (for diagnostics). */
  get size(): number {
    return this.store.size;
  }

  /** Clear entire cache (for test isolation). */
  clear(): void {
    this.store.clear();
  }
}

// ═══════════════════════════════════════════════════
//  GOVERNANCE & TELEMETRY HELPERS
// ═══════════════════════════════════════════════════

const GOVERNANCE_PRODUCT_KEY = "integration-layer";

/**
 * Emit a governance audit event for secret lifecycle operations.
 * These go to PlatformAuditLog — the official audit trail.
 * No secret values are ever written to audit logs.
 */
async function recordGovernanceEvent(
  event: GovernanceSecretEvent,
  params: {
    organizationId: string;
    integrationId?: string;
    provider?: string;
    type?: string;
    vaultEntryKey?: string;
    version?: number;
    performedById?: string;
    purpose?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  await writePlatformAuditLog({
    productKey: GOVERNANCE_PRODUCT_KEY,
    action: event,
    actorId: params.performedById,
    targetType: "TenantIntegration",
    targetId: params.integrationId ?? params.vaultEntryKey,
    targetLabel: `${params.type ?? "unknown"}/${params.provider ?? "unknown"}`,
    severity: event === "SECRET_REVOKED" ? "warning" : "info",
    metadata: {
      organizationId: params.organizationId,
      integrationId: params.integrationId,
      provider: params.provider,
      type: params.type,
      vaultEntryKey: params.vaultEntryKey,
      version: params.version,
      purpose: params.purpose,
      ...params.metadata,
    },
  });
}

/**
 * Emit an operational telemetry counter for secret access.
 * These are metrics counters — NOT audit trail events.
 */
function emitTelemetryEvent(
  event: OperationalSecretEvent,
  labels: {
    organizationId: string;
    integrationType?: string;
    provider?: string;
    purpose?: string;
    result: string;
    source?: string;
  },
): void {
  incrementCounter(event, {
    organizationId: labels.organizationId,
    integrationType: labels.integrationType,
    provider: labels.provider,
    purpose: labels.purpose,
    result: labels.result,
    source: labels.source,
  });
}

// ═══════════════════════════════════════════════════
//  CACHE EVICTION HOOKS (for SECRET_ROTATED / REVOKED)
// ═══════════════════════════════════════════════════

/**
 * Invalidate the cached secret for a given integration.
 * Called when SECRET_ROTATED or SECRET_REVOKED governance events fire.
 * Call this from VaultService's rotateSecret / deleteSecret flows
 * (or intercept via audit event listener in future sprints).
 */
export function invalidateSecretCache(
  organizationId: string,
  integrationId: string,
): void {
  getCache().invalidate(organizationId, integrationId);
}

// ═══════════════════════════════════════════════════
//  IMPLEMENTATION
// ═══════════════════════════════════════════════════

const globalForCache = globalThis as unknown as {
  secretResolverCache: SecretCache | undefined;
};

function getCache(): SecretCache {
  if (typeof globalForCache.secretResolverCache === "undefined") {
    globalForCache.secretResolverCache = new SecretCache();
  }
  return globalForCache.secretResolverCache;
}

class SecretResolverImpl implements SecretResolver {
  async getIntegrationSecret(
    organizationId: string,
    integrationId: string,
    purpose: SecretPurpose,
    actorId?: string,
  ): Promise<SecretResult> {
    const cacheKey = getCache().makeKey(organizationId, integrationId);
    const cached = getCache().get(cacheKey);

    if (cached) {
      emitTelemetryEvent("SECRET_USED", {
        organizationId,
        purpose,
        result: "cache_hit",
        source: "cache",
      });
      return cached;
    }

    // Look up TenantIntegration
    const integration = await prisma.tenantIntegration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      emitTelemetryEvent("SECRET_FAILED", {
        organizationId,
        purpose,
        result: "failure",
        source: "none",
      });
      throw new Error(
        `Integration "${integrationId}" not found for organization "${organizationId}"`,
      );
    }

    if (integration.organizationId !== organizationId) {
      throw new Error(
        `Integration "${integrationId}" does not belong to organization "${organizationId}"`,
      );
    }

    // Resolve via Vault if vaultSecretId exists
    if (integration.vaultSecretId) {
      return this.resolveFromVault(
        integration.vaultSecretId,
        integration,
        purpose,
        actorId,
        cacheKey,
      );
    }

    // No vault secret — try legacy fallback
    return this.resolveLegacyFallback(
      integration,
      purpose,
      actorId,
      cacheKey,
    );
  }

  async getIntegrationSecretByType(
    organizationId: string,
    type: string,
    provider: string,
    purpose: SecretPurpose,
    actorId?: string,
  ): Promise<SecretResult> {
    // Try TenantIntegration first
    const integration = await prisma.tenantIntegration.findFirst({
      where: {
        organizationId,
        type: type as IntegrationType,
        provider,
      },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });

    if (integration) {
      const cacheKey = getCache().makeKey(organizationId, integration.id);
      const cached = getCache().get(cacheKey);

      if (cached) {
        emitTelemetryEvent("SECRET_USED", {
          organizationId,
          integrationType: type,
          provider,
          purpose,
          result: "cache_hit",
          source: "cache",
        });
        return cached;
      }

      if (integration.vaultSecretId) {
        return this.resolveFromVault(
          integration.vaultSecretId,
          integration,
          purpose,
          actorId,
          cacheKey,
        );
      }

      return this.resolveLegacyFallback(
        integration,
        purpose,
        actorId,
        cacheKey,
      );
    }

    // Fall back to legacy connections
    if (type === "CRM") {
      const crmRecord = await prisma.crmConnection.findFirst({
        where: { organizationId, provider },
      });
      if (crmRecord) {
        return this.buildLegacyResult(
          crmRecord.id,
          organizationId,
          type,
          provider,
          "legacy-crm" as SecretSource,
          crmRecord.accessToken
            ? { accessToken: crmRecord.accessToken }
            : undefined,
          crmRecord.apiEndpoint
            ? { apiEndpoint: crmRecord.apiEndpoint }
            : undefined,
          purpose,
          actorId,
        );
      }
    }

    if (type === "ERP") {
      const erpRecord = await prisma.erpConnection.findFirst({
        where: { organizationId, provider },
      });
      if (erpRecord) {
        return this.buildLegacyResult(
          erpRecord.id,
          organizationId,
          type,
          provider,
          "legacy-erp" as SecretSource,
          erpRecord.apiKey
            ? { apiKey: erpRecord.apiKey }
            : undefined,
          erpRecord.apiEndpoint
            ? { apiEndpoint: erpRecord.apiEndpoint }
            : undefined,
          purpose,
          actorId,
        );
      }
    }

    emitTelemetryEvent("SECRET_FAILED", {
      organizationId,
      integrationType: type,
      provider,
      purpose,
      result: "failure",
      source: "none",
    });

    throw new Error(
      `No integration found for organization "${organizationId}" type "${type}" provider "${provider}"`,
    );
  }

  // ─── Private Helpers ───

  private async resolveFromVault(
    vaultSecretKey: string,
    integration: { id: string; organizationId: string; type: string; provider: string },
    purpose: SecretPurpose,
    actorId: string | undefined,
    cacheKey: string,
  ): Promise<SecretResult> {
    try {
      const vaultResult = await getSecret(
        vaultSecretKey,
        actorId ?? "system",
        integration.organizationId,
      );

      const result: SecretResult = {
        credentials: { value: vaultResult.value },
        source: "vault",
        vaultEntryId: vaultResult.id,
        version: vaultResult.version,
        resolvedAt: new Date(),
        rotatedAt: vaultResult.metadata?.lastRotatedAt as Date | undefined,
        cacheHit: false,
      };

      // Store in cache
      getCache().set(cacheKey, result);

      // Emit telemetry (operational)
      emitTelemetryEvent("SECRET_USED", {
        organizationId: integration.organizationId,
        integrationType: integration.type,
        provider: integration.provider,
        purpose,
        result: "success",
        source: "vault",
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      emitTelemetryEvent("SECRET_FAILED", {
        organizationId: integration.organizationId,
        integrationType: integration.type,
        provider: integration.provider,
        purpose,
        result: "failure",
        source: "vault",
      });

      throw new Error(
        `Failed to resolve secret for "${integration.type}/${integration.provider}": ${errorMessage}`,
      );
    }
  }

  private async resolveLegacyFallback(
    integration: {
      id: string;
      organizationId: string;
      type: string;
      provider: string;
    },
    purpose: SecretPurpose,
    actorId: string | undefined,
    cacheKey: string,
  ): Promise<SecretResult> {
    // For CRM, try legacy CrmConnection
    if (integration.type === "CRM") {
      const crmRecord = await prisma.crmConnection.findFirst({
        where: {
          organizationId: integration.organizationId,
          provider: integration.provider,
        },
      });
      if (crmRecord) {
        const result = await this.buildLegacyResult(
          crmRecord.id,
          integration.organizationId,
          integration.type,
          integration.provider,
          "legacy-crm",
          crmRecord.accessToken
            ? { accessToken: crmRecord.accessToken }
            : undefined,
          crmRecord.apiEndpoint
            ? { apiEndpoint: crmRecord.apiEndpoint }
            : undefined,
          purpose,
          actorId,
        );
        getCache().set(cacheKey, result);
        return result;
      }
    }

    // For AI, try configMetadata from TenantIntegration (apiKey stored in metadata)
    if (integration.type === "AI") {
      const meta = (integration as unknown as { configMetadata?: Record<string, unknown> }).configMetadata;
      if (meta?.apiKey || meta?.credentials) {
        const credentials = typeof meta.credentials === "object" && meta.credentials
          ? (meta.credentials as Record<string, string>)
          : { apiKey: String(meta.apiKey) };
        const result = await this.buildLegacyResult(
          integration.id,
          integration.organizationId,
          integration.type,
          integration.provider,
          "legacy-env",
          credentials,
          undefined,
          purpose,
          actorId,
        );
        getCache().set(cacheKey, result);
        return result;
      }
    }

    // For STORAGE, try configMetadata for S3/Minio credentials
    if (integration.type === "STORAGE") {
      const meta = (integration as unknown as { configMetadata?: Record<string, unknown> }).configMetadata;
      if (meta?.credentials || meta?.endpoint) {
        const credentials = typeof meta.credentials === "object" && meta.credentials
          ? (meta.credentials as Record<string, string>)
          : { endpoint: String(meta.endpoint ?? ""), accessKey: String(meta.accessKey ?? "") };
        const result = await this.buildLegacyResult(
          integration.id,
          integration.organizationId,
          integration.type,
          integration.provider,
          "legacy-env",
          credentials,
          undefined,
          purpose,
          actorId,
        );
        getCache().set(cacheKey, result);
        return result;
      }
    }

    // For EMAIL, try configMetadata for SMTP credentials
    if (integration.type === "EMAIL") {
      const meta = (integration as unknown as { configMetadata?: Record<string, unknown> }).configMetadata;
      if (meta?.credentials || meta?.host) {
        const credentials = typeof meta.credentials === "object" && meta.credentials
          ? (meta.credentials as Record<string, string>)
          : { host: String(meta.host ?? ""), user: String(meta.user ?? ""), pass: String(meta.pass ?? "") };
        const result = await this.buildLegacyResult(
          integration.id,
          integration.organizationId,
          integration.type,
          integration.provider,
          "legacy-env",
          credentials,
          undefined,
          purpose,
          actorId,
        );
        getCache().set(cacheKey, result);
        return result;
      }
    }

    // For ERP, try legacy ErpConnection
    if (integration.type === "ERP") {
      const erpRecord = await prisma.erpConnection.findFirst({
        where: {
          organizationId: integration.organizationId,
          provider: integration.provider,
        },
      });
      if (erpRecord) {
        const result = await this.buildLegacyResult(
          erpRecord.id,
          integration.organizationId,
          integration.type,
          integration.provider,
          "legacy-erp",
          erpRecord.apiKey
            ? { apiKey: erpRecord.apiKey }
            : undefined,
          erpRecord.apiEndpoint
            ? { apiEndpoint: erpRecord.apiEndpoint }
            : undefined,
          purpose,
          actorId,
        );
        getCache().set(cacheKey, result);
        return result;
      }
    }

    emitTelemetryEvent("SECRET_FAILED", {
      organizationId: integration.organizationId,
      integrationType: integration.type,
      provider: integration.provider,
      purpose,
      result: "failure",
      source: "none",
    });

    throw new Error(
      `No legacy fallback found for "${integration.type}/${integration.provider}" in organization "${integration.organizationId}"`,
    );
  }

  private async buildLegacyResult(
    id: string,
    organizationId: string,
    type: string,
    provider: string,
    source: SecretSource,
    credentials: Record<string, string> | undefined,
    extraConfig: Record<string, string> | undefined,
    purpose: SecretPurpose,
    actorId: string | undefined,
  ): Promise<SecretResult> {
    const allCredentials = { ...extraConfig, ...credentials };

    emitTelemetryEvent("SECRET_USED", {
      organizationId,
      integrationType: type,
      provider,
      purpose,
      result: "success",
      source,
    });

    return {
      credentials: allCredentials,
      source,
      vaultEntryId: undefined,
      version: 0, // legacy sources don't have version tracking
      resolvedAt: new Date(),
      cacheHit: false,
    };
  }
}

// ═══════════════════════════════════════════════════
//  SINGLETON EXPORT
// ═══════════════════════════════════════════════════

const globalForResolver = globalThis as unknown as {
  secretResolver: SecretResolverImpl | undefined;
};

function getResolverInstance(): SecretResolverImpl {
  if (typeof globalForResolver.secretResolver === "undefined") {
    globalForResolver.secretResolver = new SecretResolverImpl();
  }
  return globalForResolver.secretResolver;
}

/** Singleton SecretResolver instance. All integration credential reads flow through this. */
export const secretResolver: SecretResolver = getResolverInstance();

// ═══════════════════════════════════════════════════
//  CONVENIENCE: Cache inspection (for diagnostics / tests)
// ═══════════════════════════════════════════════════

/** Get the current cache size. Useful for test assertions. */
export function getSecretCacheSize(): number {
  return getCache().size;
}

/** Clear the entire secret cache. For test isolation — never call in production. */
export function clearSecretCache(): void {
  getCache().clear();
}
