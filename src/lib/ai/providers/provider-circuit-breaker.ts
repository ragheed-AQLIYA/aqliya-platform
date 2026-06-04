import type { AIProviderId } from "../types"

export type CircuitState = "closed" | "open" | "half-open"

export interface CircuitBreakerConfig {
  failureThreshold: number
  openDurationMs: number
  halfOpenProbeSuccesses: number
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  openDurationMs: 30_000,
  halfOpenProbeSuccesses: 1,
}

interface CircuitRecord {
  state: CircuitState
  consecutiveFailures: number
  openedAt: number | null
  halfOpenSuccesses: number
}

const circuits = new Map<AIProviderId, CircuitRecord>()

function getRecord(providerId: AIProviderId): CircuitRecord {
  let record = circuits.get(providerId)
  if (!record) {
    record = { state: "closed", consecutiveFailures: 0, openedAt: null, halfOpenSuccesses: 0 }
    circuits.set(providerId, record)
  }
  return record
}

export function getCircuitState(providerId: AIProviderId): CircuitState {
  const record = getRecord(providerId)
  if (record.state === "open" && record.openedAt) {
    if (Date.now() - record.openedAt >= DEFAULT_CONFIG.openDurationMs) {
      record.state = "half-open"
      record.halfOpenSuccesses = 0
    }
  }
  return record.state
}

export function isCircuitOpen(providerId: AIProviderId): boolean {
  const state = getCircuitState(providerId)
  return state === "open"
}

export function recordProviderSuccess(providerId: AIProviderId): void {
  const record = getRecord(providerId)
  record.consecutiveFailures = 0
  record.openedAt = null
  if (record.state === "half-open") {
    record.halfOpenSuccesses += 1
    if (record.halfOpenSuccesses >= DEFAULT_CONFIG.halfOpenProbeSuccesses) {
      record.state = "closed"
    }
  } else {
    record.state = "closed"
  }
}

export function recordProviderFailure(providerId: AIProviderId): void {
  const record = getRecord(providerId)
  if (record.state === "half-open") {
    record.state = "open"
    record.openedAt = Date.now()
    record.consecutiveFailures = DEFAULT_CONFIG.failureThreshold
    return
  }

  record.consecutiveFailures += 1
  if (record.consecutiveFailures >= DEFAULT_CONFIG.failureThreshold) {
    record.state = "open"
    record.openedAt = Date.now()
  }
}

export function resetCircuitBreaker(providerId?: AIProviderId): void {
  if (providerId) {
    circuits.delete(providerId)
    return
  }
  circuits.clear()
}

export function getCircuitBreakerSnapshot(): Array<{
  providerId: AIProviderId
  state: CircuitState
  consecutiveFailures: number
}> {
  const ids: AIProviderId[] = ["openai", "anthropic", "cloud", "deterministic"]
  return ids.map((providerId) => {
    const record = getRecord(providerId)
    return {
      providerId,
      state: getCircuitState(providerId),
      consecutiveFailures: record.consecutiveFailures,
    }
  })
}
