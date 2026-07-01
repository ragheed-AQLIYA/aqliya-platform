/**
 * Lightweight trace context for LCOS operations.
 * Provides correlation ID propagation without requiring OpenTelemetry SDK.
 * Ready for future OpenTelemetry integration.
 */

const traceContext = new Map<string, string>();

export function getCorrelationId(): string {
  const existing = traceContext.get("correlationId");
  if (existing) return existing;
  const newId = generateId();
  traceContext.set("correlationId", newId);
  return newId;
}

export function setCorrelationId(id: string): void {
  traceContext.set("correlationId", id);
}

export function clearCorrelationId(): void {
  traceContext.delete("correlationId");
}

export function withTrace<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  const cid = getCorrelationId();

  return fn().finally(() => {
    const duration = Date.now() - start;
    if (typeof console !== "undefined") {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        message: `trace:${name}`,
        module: "lcostracing",
        correlationId: cid,
        duration,
      }));
    }
  });
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
