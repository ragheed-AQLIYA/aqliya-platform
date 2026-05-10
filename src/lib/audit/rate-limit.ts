// ─── AuditOS Rate Limiter ───
// In-memory rate limiter for audit server actions.
// Production deployment should replace with Redis or database-backed limiter.

import type { AuditActor } from "./actor-context"

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

const WINDOW_MS = 60_000 // 1 minute

const LIMITS: Record<string, number> = {
  default: 60,
  upload: 10,
  ai_generate: 10,
  export: 20,
  mutation: 30,
}

export type RateLimitCategory = keyof typeof LIMITS

function key(actor: AuditActor, actionName: string): string {
  return `${actor.organizationId}:${actor.actorId}:${actionName}`
}

export function enforceAuditRateLimit(
  actor: AuditActor,
  actionName: string,
  category: RateLimitCategory = "default"
): void {
  const now = Date.now()
  const k = key(actor, actionName)
  const entry = store.get(k)
  const limit = LIMITS[category] ?? LIMITS.default

  if (!entry || now > entry.resetAt) {
    store.set(k, { count: 1, resetAt: now + WINDOW_MS })
    return
  }

  if (entry.count >= limit) {
    throw new Error("Rate limit exceeded. Please try again later.")
  }

  entry.count++
}

export function resetRateLimit(actor: AuditActor, actionName: string): void {
  store.delete(key(actor, actionName))
}

// Periodic cleanup to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [k, v] of store) {
      if (now > v.resetAt) store.delete(k)
    }
  }, 60_000)
}
