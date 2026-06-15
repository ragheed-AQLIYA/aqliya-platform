// ─── Cross-Provider Failover Engine (Sprint 2B) ───
// Health-based automatic failover across providers of the same type.
//
// Built on the existing AI circuit breaker pattern but generalized for
// ALL integration types (AI, CRM, ERP, STORAGE, EMAIL).
//
// Pattern: executeWithFailover<T>(orgId, type, fn) → try preferred →
//          health check → circuit check → try next → all failed → error

import "server-only";
import { providerRegistry, getProviderRegistry } from "./provider-registry";
import { incrementCounter } from "./metrics";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { IntegrationType } from "./types";
import type {
  ProviderRegistry,
  ResolvedProvider,
  ProviderHealth,
  HealthCheckResult,
  AIProvider,
  CRMProvider,
  ERPProvider,
  StorageProvider,
  EmailProvider,
} from "./types";

// ═══════════════════════════════════════════════════
//  CIRCUIT BREAKER (Generalized)
// ═══════════════════════════════════════════════════

export type CircuitState = "closed" | "open" | "half-open";

interface CircuitRecord {
  state: CircuitState;
  consecutiveFailures: number;
  openedAt: number | null;
  halfOpenSuccesses: number;
}

const circuits = new Map<string, CircuitRecord>();

export const FAILOVER_DEFAULTS = {
  failureThreshold: 5,
  openDurationMs: 30_000,
  halfOpenProbeSuccesses: 1,
};

function circuitKey(orgId: string, type: IntegrationType, provider: string): string {
  return `${orgId}:${type}:${provider}`;
}

function getCircuit(orgId: string, type: IntegrationType, provider: string): CircuitRecord {
  const key = circuitKey(orgId, type, provider);
  let record = circuits.get(key);
  if (!record) {
    record = {
      state: "closed",
      consecutiveFailures: 0,
      openedAt: null,
      halfOpenSuccesses: 0,
    };
    circuits.set(key, record);
  }
  return record;
}

/** Get current circuit state (auto-transitions open → half-open after duration). */
export function getCircuitState(
  orgId: string,
  type: IntegrationType,
  provider: string,
): CircuitState {
  const record = getCircuit(orgId, type, provider);
  if (record.state === "open" && record.openedAt) {
    if (Date.now() - record.openedAt >= FAILOVER_DEFAULTS.openDurationMs) {
      record.state = "half-open";
      record.halfOpenSuccesses = 0;
    }
  }
  return record.state;
}

/** Is the circuit open (blocking requests)? */
export function isCircuitOpen(
  orgId: string,
  type: IntegrationType,
  provider: string,
): boolean {
  return getCircuitState(orgId, type, provider) === "open";
}

// ═══════════════════════════════════════════════════
//  ALERT HOOKS (lazy-imported to avoid circular deps)
// ═══════════════════════════════════════════════════

async function fireCircuitOpenAlert(
  orgId: string,
  type: IntegrationType,
  provider: string,
  failures: number,
): Promise<void> {
  try {
    const { notifyCircuitOpen } = await import("./circuit-alerts");
    await notifyCircuitOpen(orgId, type, provider, failures, {
      emailEnabled: true,
      webhookEnabled: true,
    });
  } catch {
    // Alert failure must never break the circuit breaker
  }
}

async function fireCircuitRecoveredAlert(
  orgId: string,
  type: IntegrationType,
  provider: string,
): Promise<void> {
  try {
    const { notifyCircuitRecovered } = await import("./circuit-alerts");
    await notifyCircuitRecovered(orgId, type, provider);
  } catch {
    // Alert failure must never break the circuit breaker
  }
}

// ═══════════════════════════════════════════════════
//  CORE FUNCTIONS
// ═══════════════════════════════════════════════════

/** Record a successful provider call — resets circuit. */
export function recordSuccess(
  orgId: string,
  type: IntegrationType,
  provider: string,
): void {
  const record = getCircuit(orgId, type, provider);
  const wasOpen = record.state === "open";
  const wasHalfOpen = record.state === "half-open";

  record.consecutiveFailures = 0;
  record.openedAt = null;

  if (wasHalfOpen) {
    record.halfOpenSuccesses += 1;
    if (record.halfOpenSuccesses >= FAILOVER_DEFAULTS.halfOpenProbeSuccesses) {
      record.state = "closed";
      // Fire recovery alert asynchronously (fire-and-forget)
      fireCircuitRecoveredAlert(orgId, type, provider);
    }
  } else {
    record.state = "closed";
    if (wasOpen) {
      fireCircuitRecoveredAlert(orgId, type, provider);
    }
  }
}

/** Record a failed provider call — may open the circuit. */
export function recordFailure(
  orgId: string,
  type: IntegrationType,
  provider: string,
): void {
  const record = getCircuit(orgId, type, provider);
  const wasNotOpen = record.state !== "open";

  if (record.state === "half-open") {
    record.state = "open";
    record.openedAt = Date.now();
    record.consecutiveFailures = FAILOVER_DEFAULTS.failureThreshold;
    return;
  }

  record.consecutiveFailures += 1;
  if (record.consecutiveFailures >= FAILOVER_DEFAULTS.failureThreshold) {
    record.state = "open";
    record.openedAt = Date.now();

    // Fire alert when circuit transitions closed → open (not if already open)
    if (wasNotOpen) {
      fireCircuitOpenAlert(orgId, type, provider, record.consecutiveFailures);
    }
  }
}

/** Reset circuit breaker state (optionally for a specific provider). */
export function resetCircuit(
  orgId?: string,
  type?: IntegrationType,
  provider?: string,
): void {
  if (orgId && type && provider) {
    circuits.delete(circuitKey(orgId, type, provider));
    return;
  }
  if (orgId && type) {
    for (const key of circuits.keys()) {
      if (key.startsWith(`${orgId}:${type}:`)) {
        circuits.delete(key);
      }
    }
    return;
  }
  circuits.clear();
}

/** Snapshot of all circuit states (for diagnostics and dashboard). */
export function getCircuitSnapshot(): Array<{
  key: string;
  state: CircuitState;
  consecutiveFailures: number;
  openedAt: number | null;
}> {
  return Array.from(circuits.entries()).map(([key, record]) => ({
    key,
    state: record.state,
    consecutiveFailures: record.consecutiveFailures,
    openedAt: record.openedAt,
  }));
}

// ═══════════════════════════════════════════════════
//  FAILOVER EXECUTION
// ═══════════════════════════════════════════════════

export type ProviderOperation<T> = (
  provider: ResolvedProvider<any>,
) => Promise<T>;

export interface FailoverResult<T> {
  success: boolean;
  value?: T;
  provider: string;
  type: IntegrationType;
  organizationId: string;
  attempts: FailoverAttempt[];
  durationMs: number;
}

export interface FailoverAttempt {
  provider: string;
  healthy: boolean;
  circuitOpen: boolean;
  success: boolean;
  error?: string;
  latencyMs: number;
}

/**
 * Execute a provider operation with automatic failover.
 *
 * Tries each ACTIVE provider of the given type in priority order.
 * Skips providers with open circuits or known health failures.
 * On success: records success in circuit breaker.
 * On failure: records failure, tries next provider.
 * If all fail: throws with composite error.
 */
export async function executeWithFailover<T>(
  organizationId: string,
  type: IntegrationType,
  operation: ProviderOperation<T>,
): Promise<FailoverResult<T>> {
  const startMs = Date.now();
  const attempts: FailoverAttempt[] = [];

  // Get all integrations for this type
  const integrations = await providerRegistry.listProviders(organizationId, type);
  const sorted = integrations
    .filter((i) => i.status !== "DISABLED")
    .sort((a, b) => a.priority - b.priority);

  if (sorted.length === 0) {
    throw new Error(
      `No providers available for type "${type}" in organization "${organizationId}"`,
    );
  }

  for (const integration of sorted) {
    const circuitState = getCircuitState(organizationId, type, integration.provider);
    const circuitOpen = circuitState === "open";
    const attemptStart = Date.now();

    // Skip if circuit is open (only check health for half-open probes)
    if (circuitOpen) {
      attempts.push({
        provider: integration.provider,
        healthy: false,
        circuitOpen: true,
        success: false,
        error: "Circuit open — skipping",
        latencyMs: 0,
      });
      continue;
    }

    try {
      // Resolve the provider
      const resolved = await getProviderRegistry().resolveWithFallback<any>(
        organizationId,
        type,
      );

      // Execute the operation
      const value = await operation(resolved);

      // Record success
      recordSuccess(organizationId, type, integration.provider);

      const attemptLatency = Date.now() - attemptStart;
      attempts.push({
        provider: integration.provider,
        healthy: true,
        circuitOpen: false,
        success: true,
        latencyMs: attemptLatency,
      });

      incrementCounter("failover_execution", {
        integrationType: type,
        provider: integration.provider,
        organizationId,
        result: "success",
      });

      return {
        success: true,
        value,
        provider: integration.provider,
        type,
        organizationId,
        attempts,
        durationMs: Date.now() - startMs,
      };
    } catch (err) {
      // Record failure
      recordFailure(organizationId, type, integration.provider);

      const errorMsg = err instanceof Error ? err.message : String(err);
      const attemptLatency = Date.now() - attemptStart;

      attempts.push({
        provider: integration.provider,
        healthy: false,
        circuitOpen: false,
        success: false,
        error: errorMsg,
        latencyMs: attemptLatency,
      });

      incrementCounter("failover_execution", {
        integrationType: type,
        provider: integration.provider,
        organizationId,
        result: "failure",
        error: errorMsg.substring(0, 100),
      });

      // Log the failover event
      await writePlatformAuditLog({
        productKey: "integration-layer",
        action: "provider_failover",
        targetType: "TenantIntegration",
        targetId: integration.id,
        targetLabel: `${type}/${integration.provider}`,
        severity: "warning",
        metadata: {
          organizationId,
          error: errorMsg,
          remainingProviders: sorted.length - attempts.length,
          circuitOpened: getCircuitState(organizationId, type, integration.provider) === "open",
        } as Record<string, unknown>,
      }).catch(() => {});

      // Continue to next provider
    }
  }

  // All providers failed
  incrementCounter("failover_execution", {
    integrationType: type,
    organizationId,
    result: "all_failed",
  });

  throw new Error(
    `All providers failed for "${type}" in organization "${organizationId}": ` +
      attempts
        .filter((a) => a.error)
        .map((a) => `${a.provider}: ${a.error}`)
        .join("; "),
  );
}

// ═══════════════════════════════════════════════════
//  CONVENIENCE: Health-based provider selection
// ═══════════════════════════════════════════════════

/**
 * Get the best currently-healthy provider for a given integration type.
 * Returns null if no provider is healthy.
 */
export async function getHealthyProvider<T>(
  organizationId: string,
  type: IntegrationType,
): Promise<{ provider: ResolvedProvider<T>; providerId: string } | null> {
  const integrations = await providerRegistry.listProviders(organizationId, type);
  const sorted = integrations
    .filter((i) => i.status !== "DISABLED")
    .sort((a, b) => a.priority - b.priority);

  for (const integration of sorted) {
    const circuitState = getCircuitState(organizationId, type, integration.provider);
    if (circuitState === "open") continue;

    try {
      const resolved = await getProviderRegistry().resolve<any>(
        organizationId,
        type,
      );
      if (typeof resolved.provider?.health === "function") {
        const health = await resolved.provider.health();
        if (health.healthy) {
          return { provider: resolved, providerId: integration.provider };
        }
      }
    } catch {
      // Skip failed health checks
    }
  }

  return null;
}
