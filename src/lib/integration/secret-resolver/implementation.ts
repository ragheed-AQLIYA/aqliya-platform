import "server-only";
import { prisma } from "@/lib/prisma";
import { getSecret } from "@/lib/platform/secrets/vault-service";
import type { IntegrationType } from "../types";
import type { SecretPurpose, SecretResult, SecretResolver, SecretSource } from "./common";
import { getCache } from "./cache";
import { emitTelemetryEvent, recordGovernanceEvent } from "./governance";

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

const globalForResolver = globalThis as unknown as {
  secretResolver: SecretResolverImpl | undefined;
};

function getResolverInstance(): SecretResolverImpl {
  if (typeof globalForResolver.secretResolver === "undefined") {
    globalForResolver.secretResolver = new SecretResolverImpl();
  }
  return globalForResolver.secretResolver;
}

export { SecretResolverImpl, getResolverInstance };
