// ─── AuditOS Rate Limiter ───
// Uses the shared rate limiter provider from src/lib/platform/rate-limit/.
// Production: set RATE_LIMITER=redis + REDIS_URL for distributed rate limiting.
// Default: in-memory (safe for single-instance dev/staging).

import "server-only";
import type { AuditActor } from "./actor-context";
import { getRateLimiterProvider } from "@/lib/platform/rate-limit";

const WINDOW_MS = 60_000; // 1 minute

const LIMITS: Record<string, number> = {
  default: 60,
  upload: 10,
  download: 30,
  ai_generate: 10,
  export: 20,
  mutation: 30,
};

export type RateLimitCategory = keyof typeof LIMITS;

function key(actor: AuditActor, actionName: string): string {
  return `${actor.organizationId}:${actor.actorId}:${actionName}`;
}

/**
 * Enforce a rate limit for the given actor + action.
 * Throws if the limit is exceeded.
 */
export async function enforceAuditRateLimit(
  actor: AuditActor,
  actionName: string,
  category: RateLimitCategory = "default",
): Promise<void> {
  const provider = getRateLimiterProvider();
  const limit = LIMITS[category] ?? LIMITS.default;
  const result = await provider.increment(key(actor, actionName), WINDOW_MS, limit);

  if (!result.allowed) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }
}

/**
 * Reset the rate limit counter for an actor + action.
 */
export async function resetRateLimit(
  actor: AuditActor,
  actionName: string,
): Promise<void> {
  const provider = getRateLimiterProvider();
  await provider.reset(key(actor, actionName));
}
