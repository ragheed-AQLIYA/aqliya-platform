import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkEdgeRateLimit } from "@/lib/rate-limit-edge";
import { RATE_LIMIT_PRESETS } from "@/lib/platform/rate-limiter/presets";
import type { RateLimitConfig } from "@/lib/platform/rate-limiter/types";

function getRateLimitConfig(pathname: string): RateLimitConfig {
  if (pathname.startsWith("/api/scim/")) return RATE_LIMIT_PRESETS.SCIM_ENDPOINTS;
  if (pathname.startsWith("/api/health")) return RATE_LIMIT_PRESETS.HEALTH_ENDPOINTS;
  if (pathname.startsWith("/api/auth/callback/")) return RATE_LIMIT_PRESETS.SSO_CALLBACK;
  if (pathname.startsWith("/api/auth/session")) return RATE_LIMIT_PRESETS.STANDARD_API;
  if (pathname.startsWith("/api/auth/")) return RATE_LIMIT_PRESETS.AUTH_ENDPOINTS;
  if (pathname.startsWith("/api/ai/")) return RATE_LIMIT_PRESETS.AI_ENDPOINTS;
  return RATE_LIMIT_PRESETS.STANDARD_API;
}

export async function rateLimitMiddleware(request: NextRequest): Promise<NextResponse | null> {
  if (!request.nextUrl.pathname.startsWith("/api/")) return null;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous";

  const config = getRateLimitConfig(request.nextUrl.pathname);
  const key = `${ip}:${request.nextUrl.pathname}`;
  const result = await checkEdgeRateLimit(key, config);

  if (!result.allowed) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests. Please try again later.",
        },
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(
            Math.ceil((result.resetAt - Date.now()) / 1000),
          ),
          "X-RateLimit-Limit": String(config.maxRequests),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  return null;
}
