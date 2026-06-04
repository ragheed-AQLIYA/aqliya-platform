import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkEdgeRateLimit } from "@/lib/rate-limit-edge";

export async function rateLimitMiddleware(request: NextRequest): Promise<NextResponse | null> {
  if (!request.nextUrl.pathname.startsWith("/api/")) return null;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous";

  const key = `${ip}:${request.nextUrl.pathname}`;
  const result = await checkEdgeRateLimit(key);

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
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  return null;
}
