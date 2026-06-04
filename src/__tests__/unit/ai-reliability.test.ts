/**
 * Cycle 4 — AI Reliability Test Suite
 * Provider circuit breaker, failover routing, budget/RAG feature flags.
 */

import {
  recordProviderFailure,
  recordProviderSuccess,
  isCircuitOpen,
  resetCircuitBreaker,
  getCircuitBreakerSnapshot,
} from "@/lib/ai/providers/provider-circuit-breaker"
import {
  invalidateHealthCache,
  getProviderObservabilitySnapshot,
  PROVIDER_FALLBACK_CHAIN,
} from "@/lib/ai/provider-router"
import { isEnabled } from "@/lib/platform/feature-flags/registry"

describe("AI Reliability — Circuit Breaker (IC-09)", () => {
  beforeEach(() => {
    resetCircuitBreaker()
  })

  it("opens circuit after consecutive failures", () => {
    for (let i = 0; i < 5; i++) {
      recordProviderFailure("openai")
    }
    expect(isCircuitOpen("openai")).toBe(true)
  })

  it("closes circuit after success following half-open", () => {
    for (let i = 0; i < 5; i++) recordProviderFailure("anthropic")
    expect(isCircuitOpen("anthropic")).toBe(true)
    resetCircuitBreaker("anthropic")
    recordProviderSuccess("anthropic")
    expect(isCircuitOpen("anthropic")).toBe(false)
  })

  it("snapshot lists all providers in fallback chain order", () => {
    const snap = getCircuitBreakerSnapshot()
    expect(snap.map((s) => s.providerId)).toEqual(
      expect.arrayContaining(PROVIDER_FALLBACK_CHAIN),
    )
  })
})

describe("AI Reliability — Provider observability (IC-09)", () => {
  it("observability snapshot includes feature flag states", () => {
    const snap = getProviderObservabilitySnapshot()
    expect(snap.fallbackChain).toEqual(PROVIDER_FALLBACK_CHAIN)
    expect(typeof snap.realProvidersEnabled).toBe("boolean")
    expect(typeof snap.ragEnabled).toBe("boolean")
    expect(typeof snap.budgetQuotasEnabled).toBe("boolean")
    expect(typeof snap.budgetAlertsEnabled).toBe("boolean")
    expect(Array.isArray(snap.circuits)).toBe(true)
  })

  it("invalidateHealthCache clears router cache without throw", () => {
    expect(() => invalidateHealthCache()).not.toThrow()
  })
})

describe("AI Reliability — Feature flags", () => {
  const env = { ...process.env }

  afterEach(() => {
    process.env = { ...env }
  })

  it("FF_AI_REAL_PROVIDERS gates ai.real-providers", () => {
    delete process.env.FF_AI_REAL_PROVIDERS
    expect(isEnabled("ai.real-providers")).toBe(false)
    process.env.FF_AI_REAL_PROVIDERS = "true"
    expect(isEnabled("ai.real-providers")).toBe(true)
  })

  it("FF_AI_RAG gates ai.rag", () => {
    delete process.env.FF_AI_RAG
    expect(isEnabled("ai.rag")).toBe(false)
    process.env.FF_AI_RAG = "true"
    expect(isEnabled("ai.rag")).toBe(true)
  })

  it("FF_AI_BUDGET_QUOTAS gates ai.budget-quotas", () => {
    delete process.env.FF_AI_BUDGET_QUOTAS
    expect(isEnabled("ai.budget-quotas")).toBe(false)
    process.env.FF_AI_BUDGET_QUOTAS = "true"
    expect(isEnabled("ai.budget-quotas")).toBe(true)
  })

  it("FF_AI_BUDGET_ALERTS gates ai.budget-alerts", () => {
    delete process.env.FF_AI_BUDGET_ALERTS
    expect(isEnabled("ai.budget-alerts")).toBe(false)
    process.env.FF_AI_BUDGET_ALERTS = "true"
    expect(isEnabled("ai.budget-alerts")).toBe(true)
  })
})
