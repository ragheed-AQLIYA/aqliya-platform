import "server-only"

import type { AIProviderId } from "@/lib/ai/types"
import { isEnabled } from "@/lib/platform/feature-flags/registry"
import { PROVIDER_FALLBACK_CHAIN } from "@/lib/ai/provider-router-constants"
import {
  getCircuitBreakerSnapshot,
  isCircuitOpen,
} from "./providers/provider-circuit-breaker"

export { PROVIDER_FALLBACK_CHAIN } from "@/lib/ai/provider-router-constants"

export interface ProviderRoutingDecision {
  selected: AIProviderId
  reason: string
  costEstimate: number
}

export interface ProviderHealthEntry {
  providerId: AIProviderId
  healthy: boolean
  circuitOpen: boolean
  lastCheck: string
}

let healthCache: ProviderHealthEntry[] | null = null
let healthCacheAt = 0
const HEALTH_CACHE_MS = 60_000

export function invalidateHealthCache(): void {
  healthCache = null
  healthCacheAt = 0
}

function buildHealthSnapshot(): ProviderHealthEntry[] {
  const now = new Date().toISOString()
  return PROVIDER_FALLBACK_CHAIN.map((providerId) => ({
    providerId,
    healthy: providerId === "deterministic" || !isCircuitOpen(providerId),
    circuitOpen: isCircuitOpen(providerId),
    lastCheck: now,
  }))
}

export async function getAllProviderHealth(): Promise<ProviderHealthEntry[]> {
  const now = Date.now()
  if (healthCache && now - healthCacheAt < HEALTH_CACHE_MS) {
    return healthCache
  }
  healthCache = buildHealthSnapshot()
  healthCacheAt = now
  return healthCache
}

export async function selectOptimalProvider(
  _taskType: string,
  preferred?: AIProviderId,
): Promise<ProviderRoutingDecision> {
  if (!isEnabled("ai.real-providers")) {
    return {
      selected: "deterministic",
      reason: "feature flag is off",
      costEstimate: 0,
    }
  }

  const chain = preferred
    ? [preferred, ...PROVIDER_FALLBACK_CHAIN.filter((id) => id !== preferred)]
    : PROVIDER_FALLBACK_CHAIN

  for (const providerId of chain) {
    if (!isCircuitOpen(providerId)) {
      return {
        selected: providerId,
        reason: preferred && providerId === preferred ? "preferred_provider" : "fallback_chain",
        costEstimate: providerId === "deterministic" ? 0 : 0.01,
      }
    }
  }

  return {
    selected: "deterministic",
    reason: "all_providers_circuit_open",
    costEstimate: 0,
  }
}

export function getProviderObservabilitySnapshot() {
  return {
    fallbackChain: PROVIDER_FALLBACK_CHAIN,
    realProvidersEnabled: isEnabled("ai.real-providers"),
    ragEnabled: isEnabled("ai.rag"),
    budgetQuotasEnabled: isEnabled("ai.budget-quotas"),
    budgetAlertsEnabled: isEnabled("ai.budget-alerts"),
    circuits: getCircuitBreakerSnapshot(),
  }
}

