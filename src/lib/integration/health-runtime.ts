// ─── IntegrationHealth Runtime — Periodic Provider Health Monitoring ───
// Periodically checks the health of all registered providers per tenant,
// exposes aggregated health status, and triggers failover when thresholds are exceeded.
//
// Pattern: tick() → iterate all orgs → check each integration → aggregate results

import "server-only";
import { prisma } from "@/lib/prisma";
import { providerRegistry } from "./provider-registry";
import { incrementCounter } from "./metrics";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { IntegrationType, IntegrationStatus } from "./types";
import type { HealthCheckResult } from "./types";

// ═══════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════

export interface HealthRuntimeConfig {
  /** Interval between health check rounds (default: 60_000 ms = 1 min) */
  tickIntervalMs: number;
  /** Number of consecutive failures before auto-disabling (default: 3) */
  autoDisableAfterFailures: number;
  /** Whether to auto-disable integrations that exceed failure threshold */
  autoDisable: boolean;
}

const DEFAULT_CONFIG: HealthRuntimeConfig = {
  tickIntervalMs: 60_000,
  autoDisableAfterFailures: 3,
  autoDisable: true,
};

// ═══════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════

export interface AggregatedHealth {
  totalIntegrations: number;
  healthy: number;
  degraded: number;
  unhealthy: number;
  lastTickAt: Date | null;
  results: HealthCheckResult[];
}

export interface IntegrationHealthRuntime {
  /** Start the background tick loop */
  start(): void;
  /** Stop the background tick loop */
  stop(): void;
  /** Run a single health check round immediately */
  tick(): Promise<AggregatedHealth>;
  /** Get the latest aggregated health snapshot */
  getSnapshot(): AggregatedHealth;
  /** Whether the runtime is currently running */
  isRunning(): boolean;
}

// ═══════════════════════════════════════════════════
//  IMPLEMENTATION
// ═══════════════════════════════════════════════════

class HealthRuntimeImpl implements IntegrationHealthRuntime {
  private config: HealthRuntimeConfig;
  private timer: ReturnType<typeof setInterval> | null = null;
  private currentSnapshot: AggregatedHealth = {
    totalIntegrations: 0,
    healthy: 0,
    degraded: 0,
    unhealthy: 0,
    lastTickAt: null,
    results: [],
  };

  constructor(config?: Partial<HealthRuntimeConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  start(): void {
    if (this.timer) return; // already running
    // Run first tick immediately
    this.tick().catch((err) =>
      console.error("[HealthRuntime] Initial tick failed:", err),
    );
    this.timer = setInterval(() => {
      this.tick().catch((err) =>
        console.error("[HealthRuntime] Tick failed:", err),
      );
    }, this.config.tickIntervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  isRunning(): boolean {
    return this.timer !== null;
  }

  getSnapshot(): AggregatedHealth {
    return { ...this.currentSnapshot };
  }

  async tick(): Promise<AggregatedHealth> {
    const startMs = Date.now();
    const results: HealthCheckResult[] = [];

    // 1. Get all organizations that have integrations
    const orgs = await prisma.organization.findMany({
      where: {
        tenantIntegrations: { some: {} },
      },
      select: { id: true },
    });

    // 2. For each org, check each integration type
    const types = Object.values(IntegrationType);

    for (const org of orgs) {
      for (const type of types) {
        try {
          const integrations = await providerRegistry.listProviders(org.id, type);
          for (const integration of integrations) {
            try {
              const result = await providerRegistry.healthCheck(
                org.id,
                integration.id,
              );
              results.push(result);

              // Emit telemetry counter
              incrementCounter("integration_health_check", {
                integrationType: type,
                provider: integration.provider,
                organizationId: org.id,
                result: result.healthy ? "healthy" : "unhealthy",
              });

              // Auto-disable if failure threshold exceeded
              if (
                this.config.autoDisable &&
                !result.healthy &&
                integration.failureCount >= this.config.autoDisableAfterFailures
              ) {
                await prisma.tenantIntegration.update({
                  where: { id: integration.id },
                  data: {
                    status: IntegrationStatus.ERROR,
                    failureReason: result.error ?? "Auto-disabled: health check failures exceeded threshold",
                  },
                });

                await writePlatformAuditLog({
                  productKey: "integration-layer",
                  action: "integration_auto_disabled",
                  targetType: "TenantIntegration",
                  targetId: integration.id,
                  targetLabel: `${type}/${integration.provider}`,
                  severity: "warning",
                  metadata: {
                    organizationId: org.id,
                    failureCount: integration.failureCount,
                    failureReason: result.error,
                  } as Record<string, unknown>,
                });
              }
            } catch {
              // Individual check failure — skip this integration, continue
              results.push({
                integrationId: integration.id,
                organizationId: org.id,
                type,
                provider: integration.provider,
                healthy: false,
                latencyMs: Date.now() - startMs,
                error: "Health check threw",
                lastCheckAt: new Date(),
              });
            }
          }
        } catch {
          // No integrations for this type — skip
        }
      }
    }

    // 3. Aggregate results
    const healthy = results.filter((r) => r.healthy).length;
    const unhealthy = results.filter((r) => !r.healthy).length;
    const degraded = results.filter((r) => !r.healthy && r.latencyMs > 5000).length;

    this.currentSnapshot = {
      totalIntegrations: results.length,
      healthy,
      degraded,
      unhealthy,
      lastTickAt: new Date(),
      results,
    };

    return this.currentSnapshot;
  }
}

// ═══════════════════════════════════════════════════
//  SINGLETON
// ═══════════════════════════════════════════════════

const globalForHealth = globalThis as unknown as {
  healthRuntime: HealthRuntimeImpl | undefined;
};

export function getHealthRuntime(
  config?: Partial<HealthRuntimeConfig>,
): HealthRuntimeImpl {
  if (!globalForHealth.healthRuntime) {
    globalForHealth.healthRuntime = new HealthRuntimeImpl(config);
  }
  return globalForHealth.healthRuntime;
}

/** Singleton IntegrationHealthRuntime — not started by default. Call .start() to activate. */
export const healthRuntime: IntegrationHealthRuntime = getHealthRuntime();
