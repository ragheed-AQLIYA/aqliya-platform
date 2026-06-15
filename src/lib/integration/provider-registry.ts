// ─── Provider Registry — Concrete Implementation (Sprint 2B) ───
// Implements the ProviderRegistry interface with Prisma-backed resolution,
// parallel provider construction, and health-aware selection.
//
// Pattern: register(type, providerId, factory) → resolve<T>(orgId, type) → built provider

import "server-only";
import { prisma } from "@/lib/prisma";
import { resolveIntegrations } from "./resolver";
import {
  IntegrationType,
  IntegrationStatus,
} from "./types";
import type {
  ProviderRegistry,
  ProviderFactory,
  ProviderConfig,
  ResolvedProvider,
  HealthCheckResult,
  TenantIntegrationData,
  AIProvider,
  CRMProvider,
  ERPProvider,
  StorageProvider,
  EmailProvider,
  WebhookProvider,
} from "./types";

// ═══════════════════════════════════════════════════
//  FACTORY REGISTRATION
// ═══════════════════════════════════════════════════

type FactoryEntry = {
  type: IntegrationType;
  providerId: string;
  factory: ProviderFactory;
  registeredAt: Date;
};

const globalForRegistry = globalThis as unknown as {
  providerFactories: FactoryEntry[] | undefined;
};

function getFactories(): FactoryEntry[] {
  if (!globalForRegistry.providerFactories) {
    globalForRegistry.providerFactories = [];
  }
  return globalForRegistry.providerFactories;
}

// ═══════════════════════════════════════════════════
//  IMPLEMENTATION
// ═══════════════════════════════════════════════════

class ProviderRegistryImpl implements ProviderRegistry {
  // ─── Registration ───

  register(type: IntegrationType, providerId: string, factory: ProviderFactory): void {
    const factories = getFactories();
    // Replace existing registration for same type+providerId
    const existingIdx = factories.findIndex(
      (e) => e.type === type && e.providerId === providerId,
    );
    const entry: FactoryEntry = { type, providerId, factory, registeredAt: new Date() };
    if (existingIdx >= 0) {
      factories[existingIdx] = entry;
    } else {
      factories.push(entry);
    }
  }

  // ─── Resolve by Type (chooses best ACTIVE integration) ───

  async resolve<T>(
    organizationId: string,
    type: IntegrationType,
  ): Promise<ResolvedProvider<T>> {
    const integrations = await resolveIntegrations(organizationId, type);

    // Pick highest-priority ACTIVE integration
    const active = integrations
      .filter((r) => r.status === "ACTIVE")
      .sort((a, b) => a.priority - b.priority);

    if (active.length === 0) {
      throw new Error(
        `No ACTIVE integration for type "${type}" in organization "${organizationId}"`,
      );
    }

    const best = active[0];
    return this.buildFromRecord<T>(best, organizationId);
  }

  // ─── Resolve with Fallback (preferred → next available) ───

  async resolveWithFallback<T>(
    organizationId: string,
    type: IntegrationType,
  ): Promise<ResolvedProvider<T>> {
    const integrations = await resolveIntegrations(organizationId, type);

    const sorted = integrations
      .filter((r) => r.status !== "DISABLED")
      .sort((a, b) => a.priority - b.priority);

    if (sorted.length === 0) {
      throw new Error(
        `No integration available for type "${type}" in organization "${organizationId}"`,
      );
    }

    // Try each integration in priority order until one succeeds
    const errors: string[] = [];
    for (const record of sorted) {
      try {
        return await this.buildFromRecord<T>(record, organizationId);
      } catch (err) {
        errors.push(`${record.provider}: ${err instanceof Error ? err.message : String(err)}`);
        // Continue to next provider
      }
    }

    throw new Error(
      `All providers failed for type "${type}" in organization "${organizationId}": ${errors.join("; ")}`,
    );
  }

  // ─── Health Check ───

  async healthCheck(
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

    const startMs = Date.now();

    // Try calling the provider's built-in health method
    let healthy = integration.status === "ACTIVE";
    let error: string | undefined;

    try {
      const provider = await this.buildFromRecord<any>(
        {
          id: integration.id,
          organizationId: integration.organizationId,
          type: integration.type,
          provider: integration.provider,
          displayName: integration.displayName ?? undefined,
          status: integration.status,
          priority: integration.priority,
          vaultSecretId: integration.vaultSecretId ?? undefined,
          configMetadata: (integration.configMetadata as Record<string, unknown>) ?? undefined,
          lastHealthCheckAt: integration.lastHealthCheckAt ?? undefined,
          lastSuccessAt: integration.lastSuccessAt ?? undefined,
          lastFailureAt: integration.lastFailureAt ?? undefined,
          failureReason: integration.failureReason ?? undefined,
          failureCount: integration.failureCount,
          createdById: (integration.createdById ?? undefined) as string | undefined,
          createdAt: integration.createdAt,
          updatedAt: integration.updatedAt,
          source: "tenant-integration",
        },
        organizationId,
      );

      const resolvedProvider = provider as ResolvedProvider<any>;
      if (
        resolvedProvider.provider &&
        typeof resolvedProvider.provider.health === "function"
      ) {
        const healthResult = await resolvedProvider.provider.health();
        healthy = healthResult.healthy;
        error = healthResult.error;
      }
    } catch (err) {
      healthy = false;
      error = err instanceof Error ? err.message : "Health check failed";
    }

    const latencyMs = Date.now() - startMs;

    // Persist health result
    await prisma.tenantIntegration.update({
      where: { id: integrationId },
      data: {
        lastHealthCheckAt: new Date(),
        ...(healthy
          ? { lastSuccessAt: new Date(), failureCount: 0, failureReason: null }
          : {
              lastFailureAt: new Date(),
              failureCount: { increment: 1 },
              failureReason: error ?? "Unknown",
            }),
      },
    });

    return {
      integrationId,
      organizationId,
      type: integration.type as IntegrationType,
      provider: integration.provider,
      healthy,
      latencyMs,
      error,
      lastCheckAt: new Date(),
    };
  }

  // ─── List Providers ───

  async listProviders(
    organizationId: string,
    type?: IntegrationType,
  ): Promise<TenantIntegrationData[]> {
    const records = await resolveIntegrations(
      organizationId,
      type ?? "CRM", // resolveIntegrations accepts strings; pass as needed
    );
    return records.map((r) => ({
      id: r.id,
      organizationId: r.organizationId,
      type: r.type as IntegrationType,
      provider: r.provider,
      displayName: r.displayName,
      status: r.status as IntegrationStatus,
      priority: r.priority,
      vaultSecretId: r.vaultSecretId,
      configMetadata: r.configMetadata,
      lastHealthCheckAt: r.lastHealthCheckAt,
      lastSuccessAt: r.lastSuccessAt,
      lastFailureAt: r.lastFailureAt,
      failureReason: r.failureReason,
      failureCount: r.failureCount,
      createdById: r.createdById,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    }));
  }

  // ─── Private Builder ───

  private async buildFromRecord<T>(
    record: {
      id: string;
      organizationId: string;
      type: string;
      provider: string;
      vaultSecretId?: string;
      configMetadata?: Record<string, unknown>;
      displayName?: string;
      status?: string;
      priority?: number;
      lastHealthCheckAt?: Date;
      lastSuccessAt?: Date;
      lastFailureAt?: Date;
      failureReason?: string;
      failureCount?: number;
      createdById?: string;
      createdAt?: Date;
      updatedAt?: Date;
      source?: string;
    },
    _orgId: string,
  ): Promise<ResolvedProvider<T>> {
    const type = record.type as IntegrationType;
    const factories = getFactories().filter(
      (e) => e.type === type && e.providerId === record.provider,
    );

    if (factories.length === 0) {
      throw new Error(
        `No factory registered for "${type}/${record.provider}"`,
      );
    }

    const config: ProviderConfig = {
      type,
      provider: record.provider,
      organizationId: record.organizationId,
      configMetadata: record.configMetadata,
    };

    // Resolve vault secret if present
    let vaultSecret: { value: string; version: number } | undefined;
    if (record.vaultSecretId) {
      try {
        const { getSecret } = await import(
          "@/lib/platform/secrets/vault-service"
        );
        const secret = await getSecret(
          record.vaultSecretId,
          "system",
          record.organizationId,
        );
        vaultSecret = { value: secret.value, version: secret.version };
        config.credentials = { value: secret.value };
      } catch {
        // Vault unavailable — proceed without vault secret
      }
    }

    // Use the first matching factory
    const factory = factories[0];
    const provider = await factory.factory.create(config);

    return {
      provider: provider as T,
      integration: record as TenantIntegrationData,
      vaultSecret,
    };
  }
}

// ═══════════════════════════════════════════════════
//  SINGLETON EXPORT
// ═══════════════════════════════════════════════════

const globalForReg = globalThis as unknown as {
  providerRegistry: ProviderRegistryImpl | undefined;
};

export function getProviderRegistry(): ProviderRegistryImpl {
  if (!globalForReg.providerRegistry) {
    globalForReg.providerRegistry = new ProviderRegistryImpl();
  }
  return globalForReg.providerRegistry;
}

/** Singleton ProviderRegistry instance */
export const providerRegistry: ProviderRegistry = getProviderRegistry();
