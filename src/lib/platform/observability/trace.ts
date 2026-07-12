import "server-only"

/**
 * Lightweight trace context for observability.
 * Future: replace with OpenTelemetry spans.
 */

const traceContext = new Map<string, string>()

export function startTrace(name: string): string {
  const traceId = `trace_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  traceContext.set(traceId, name)
  return traceId
}

export function endTrace(traceId: string): void {
  traceContext.delete(traceId)
}

export function getActiveTrace(): { traceId: string; name: string } | null {
  // Return the most recent trace
  const entries = Array.from(traceContext.entries())
  if (entries.length === 0) return null
  const [traceId, name] = entries[entries.length - 1]!
  return { traceId, name }
}

export function wrapWithTrace<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const traceId = startTrace(name)
  const startTime = Date.now()
  return fn()
    .then((result) => {
      endTrace(traceId)
      const duration = Date.now() - startTime
      // TODO: emit trace event to observability backend
      if (process.env.NODE_ENV === "development") {
        console.debug(`[trace] ${name} — ${duration}ms`)
      }
      return result
    })
    .catch((error) => {
      endTrace(traceId)
      const duration = Date.now() - startTime
      console.error(`[trace] ${name} FAILED after ${duration}ms:`, error instanceof Error ? error.message : error)
      throw error
    })
}
