/**
 * Client IP for rate limiting. X-Forwarded-For is only trusted when
 * TRUST_PROXY=true (ALB / CloudFront / reverse proxy).
 */

export function isTrustedProxy(): boolean {
  return process.env.TRUST_PROXY === "true";
}

export function getTrustedClientIp(headers: {
  get: (name: string) => string | null;
}): string {
  if (!isTrustedProxy()) {
    return "anonymous";
  }
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "anonymous";
}
