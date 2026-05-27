import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { setSecurityHeaders } from "@/middleware-security";
import { rateLimitMiddleware } from "@/middleware-rate-limit";

const secret = process.env.AUTH_SECRET;

function isApiPath(pathname: string): boolean {
  return (
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/auth/") &&
    pathname !== "/api/health"
  );
}

const publicExact = new Set([
  "/",
  "/about",
  "/contact",
  "/custom-product",
  "/demo",
  "/deployment",
  "/engagement-models",
  "/executive-brief",
  "/executive-briefing",
  "/governance",
  "/how-we-work",
  "/insights",
  "/login",
  "/access-denied",
  "/pilot-proof",
  "/platform",
  "/privacy",
  "/proof-library",
  "/products",
  "/security",
  "/terms",
  "/use-cases",
  "/case-studies",
  "/auditos",
]);

const publicPrefixes = [
  "/_next",
  "/api/auth",
  "/api/health",
  "/auditos/",
  "/products/",
  "/buyers/",
  "/insights/",
];

function isPublicPath(pathname: string): boolean {
  if (publicExact.has(pathname)) return true;
  if (publicPrefixes.some((p) => pathname.startsWith(p))) return true;
  if (
    [
      "/favicon.ico",
      "/robots.txt",
      "/sitemap.xml",
      "/manifest.webmanifest",
    ].includes(pathname)
  )
    return true;
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rateLimitResponse = rateLimitMiddleware(request);
  if (rateLimitResponse) {
    return setSecurityHeaders(rateLimitResponse);
  }

  if (isPublicPath(pathname)) {
    return setSecurityHeaders(NextResponse.next());
  }

  try {
    const token = await getToken({ req: request, secret });
    if (!token) {
      if (isApiPath(pathname) || pathname.startsWith("/api/")) {
        return setSecurityHeaders(
          NextResponse.json(
            { error: "Authentication required", code: "UNAUTHENTICATED" },
            { status: 401 },
          ),
        );
      }
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      const returnUrl = request.nextUrl.pathname + request.nextUrl.search;
      url.searchParams.set("callbackUrl", returnUrl);
      return setSecurityHeaders(NextResponse.redirect(url));
    }
  } catch {
    if (isApiPath(pathname) || pathname.startsWith("/api/")) {
      return setSecurityHeaders(
        NextResponse.json(
          { error: "Authentication required", code: "UNAUTHENTICATED" },
          { status: 401 },
        ),
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return setSecurityHeaders(NextResponse.redirect(url));
  }

  return setSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/audit",
    "/audit/:path*",
    "/decisions",
    "/decisions/:path*",
    "/local-content",
    "/local-content/:path*",
    "/assistant",
    "/assistant/:path*",
    "/sales",
    "/sales/:path*",
    "/sunbul",
    "/sunbul/:path*",
    "/workflowos",
    "/workflowos/:path*",
    "/organizations",
    "/organizations/:path*",
    "/intelligence",
    "/intelligence/:path*",
    "/monitoring",
    "/monitoring/:path*",
    "/published/recommendation",
    "/published/recommendation/:path*",
    "/settings",
    "/settings/:path*",
    "/api/audit/:path*",
    "/api/office-ai/:path*",
    "/api/local-content/:path*",
    "/api/sunbul/:path*",
    "/api/metrics",
  ],
};
