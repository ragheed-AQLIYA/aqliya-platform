/**
 * In-memory rate limiter for RAG API calls.
 *
 * Purpose-scoped budgets per organization:
 * - "interactive" (default): human-triggered searches (dashboard test box,
 *   API route). Tight budget — 10 requests/minute.
 * - "enrich": machine-triggered enrichment (rule engine batches, finding
 *   citation lookups). Wider budget — 120 requests/minute — so a full
 *   48-rule engine run (plus concurrent finding views) never starves.
 *
 * Buckets are independent: exhausting one purpose never blocks the other.
 */

export type RagRateLimitPurpose = "interactive" | "enrich"

interface RateLimitEntry {
  count: number
  resetAt: number
}

const limits = new Map<string, RateLimitEntry>()

const BUDGETS_PER_MINUTE: Record<RagRateLimitPurpose, number> = {
  interactive: 10,
  enrich: 120,
}

const WINDOW_MS = 60_000

function bucketKey(
  organizationId: string,
  purpose: RagRateLimitPurpose,
): string {
  return `${purpose}:${organizationId}`
}

/**
 * Check if a request is allowed under the rate limit for its purpose.
 * Returns true if allowed, false if rate limited.
 */
export function checkRateLimit(
  organizationId: string,
  purpose: RagRateLimitPurpose = "interactive",
): boolean {
  const now = Date.now()
  const key = bucketKey(organizationId, purpose)
  const entry = limits.get(key)

  if (!entry || now > entry.resetAt) {
    limits.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }

  if (entry.count >= BUDGETS_PER_MINUTE[purpose]) {
    return false
  }

  entry.count++
  return true
}

/**
 * Get remaining requests for an organization and purpose.
 */
export function getRemainingRequests(
  organizationId: string,
  purpose: RagRateLimitPurpose = "interactive",
): number {
  const entry = limits.get(bucketKey(organizationId, purpose))
  if (!entry || Date.now() > entry.resetAt) {
    return BUDGETS_PER_MINUTE[purpose]
  }
  return Math.max(0, BUDGETS_PER_MINUTE[purpose] - entry.count)
}

/**
 * Reset rate limit for an organization (admin use).
 * Omits purpose to clear every bucket for the organization.
 */
export function resetRateLimit(
  organizationId: string,
  purpose?: RagRateLimitPurpose,
): void {
  if (purpose) {
    limits.delete(bucketKey(organizationId, purpose))
    return
  }
  limits.delete(bucketKey(organizationId, "interactive"))
  limits.delete(bucketKey(organizationId, "enrich"))
}
