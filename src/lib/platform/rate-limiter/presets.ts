import type { RateLimitConfig } from "./types"

export const RATE_LIMIT_PRESETS = {
  STANDARD_API: { maxRequests: 100, windowMs: 60_000 } as RateLimitConfig,
  AUTH_ENDPOINTS: { maxRequests: 10, windowMs: 60_000 } as RateLimitConfig,
  EXPORT_ENDPOINTS: { maxRequests: 20, windowMs: 60_000 } as RateLimitConfig,
  AI_ENDPOINTS: { maxRequests: 30, windowMs: 60_000 } as RateLimitConfig,
  /** SCIM provisioning — strict: provisioning is not high-frequency */
  SCIM_ENDPOINTS: { maxRequests: 15, windowMs: 60_000 } as RateLimitConfig,
  /** Health check — lenient: monitoring systems poll frequently */
  HEALTH_ENDPOINTS: { maxRequests: 300, windowMs: 60_000 } as RateLimitConfig,
  /** SSO OAuth callback — moderate: human-driven but burstable */
  SSO_CALLBACK: { maxRequests: 20, windowMs: 60_000 } as RateLimitConfig,
  /** LCOS evidence file download — strict: large files, bandwidth-intensive */
  LCOS_EVIDENCE_DOWNLOAD: { maxRequests: 15, windowMs: 60_000 } as RateLimitConfig,
  /** LCOS report/audit export — strict: CPU-intensive PDF/XLSX generation */
  LCOS_EXPORT: { maxRequests: 10, windowMs: 60_000 } as RateLimitConfig,
  /** Public proof-of-work challenge — abuse surface */
  POW_ENDPOINTS: { maxRequests: 20, windowMs: 60_000 } as RateLimitConfig,
} as const

export interface RateLimitHeaders {
  "X-RateLimit-Limit": number
  "X-RateLimit-Remaining": number
  "X-RateLimit-Reset": number
}

export function rateLimitHeaders(
  config: RateLimitConfig,
  remaining: number,
  resetAt: number,
): RateLimitHeaders {
  return {
    "X-RateLimit-Limit": config.maxRequests,
    "X-RateLimit-Remaining": remaining,
    "X-RateLimit-Reset": resetAt,
  }
}
