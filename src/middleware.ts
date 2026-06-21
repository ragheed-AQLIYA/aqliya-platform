import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { setSecurityHeaders } from "@/middleware-security";
import { rateLimitMiddleware } from "@/middleware-rate-limit";
import { resolveMfaGateState } from "@/lib/auth/mfa-gate";

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
  "/industries",
  "/insights",
  "/login",
  "/procurement-pack",
  "/proof",
  "/en",
  "/signup",
  "/access-denied",
  "/pilot-outcomes",
  "/pilot-proof",
  "/soc2-roadmap",
  "/platform",
  "/privacy",
  "/proof-library",
  "/products",
  "/security",
  "/terms",
  "/use-cases",
  "/case-studies",
  "/auditos",
  "/api/custom-product-submit",
  "/api/pilot-review",
]);

const publicPrefixes = [
  "/_next",
  "/invite/",
  "/api/auth",
  "/api/auth/mfa/verify",
  "/api/scim",
  "/api/health",
  "/auditos/",
  "/en/",
  "/print/",
  "/products/",
  "/buyers/",
  "/insights/",
];

const mfaExemptPrefixes = [
  "/login",
  "/settings/mfa",
  "/api/auth",
];

// ── RBAC: Route-to-minimum-role mapping ──
// This is the Edge-compatible first gate. Detailed permission checks
// happen server-side in server-action-guard / CoreAccessControl.
const routeMinRoles: Record<string, string> = {
  "/audit": "viewer",
  "/decisions": "viewer",
  "/decision": "viewer",
  "/local-content": "viewer",
  "/assistant": "viewer",
  "/contacts": "viewer",
  "/content-studio": "viewer",
  "/risk": "viewer",
  "/office-ai": "viewer",
  "/sampling": "viewer",
  "/sales": "viewer",
  "/workflowos": "viewer",
  "/sunbul": "viewer",
  "/settings/sso": "admin",
  "/settings": "viewer",
  "/organizations": "admin",
  "/intelligence": "viewer",
  "/monitoring": "admin",
  "/api/scim": "admin",
  "/api/platform": "admin",
  "/api/audit": "viewer",
  "/api/decisions": "viewer",
  "/api/agent-memory": "viewer",
  "/api/local-content": "viewer",
  "/api/workflowos": "viewer",
  "/api/office-ai": "viewer",
  "/api/metrics": "viewer",
  "/api/ai": "viewer",
  "/api/monitoring": "admin",
  "/api/skills": "admin",
  "/api/sales": "viewer",
  "/api/notifications": "viewer",
  "/governance-hub": "viewer",
  "/operator": "admin",
};

const roleHierarchy: Record<string, number> = {
  viewer: 0,
  operator: 1,
  manager: 2,
  admin: 3,
};

function hasSufficientRole(userRole: string, requiredRole: string): boolean {
  const userLevel = roleHierarchy[userRole.toLowerCase()];
  const requiredLevel = roleHierarchy[requiredRole.toLowerCase()];
  if (userLevel === undefined || requiredLevel === undefined) return false;
  return userLevel >= requiredLevel;
}

function getRequiredRole(pathname: string): string | null {
  for (const [prefix, role] of Object.entries(routeMinRoles)) {
    if (pathname.startsWith(prefix)) return role;
  }
  return null;
}

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

export async function middleware(request: NextRequest) {
  const start = Date.now();

  const withTiming = (response: NextResponse): NextResponse => {
    response.headers.set("X-Response-Time", `${Date.now() - start}ms`);
    return response;
  };

  const { pathname } = request.nextUrl;

  const rateLimitResponse = await rateLimitMiddleware(request);
  if (rateLimitResponse) {
    return withTiming(setSecurityHeaders(rateLimitResponse));
  }

  if (isPublicPath(pathname)) {
    return withTiming(setSecurityHeaders(NextResponse.next()));
  }

  let token: unknown = null;
  try {
    token = await getToken({ req: request, secret, salt: "authjs.session-token" });
    if (!token) {
      if (isApiPath(pathname) || pathname.startsWith("/api/")) {
        return withTiming(
          setSecurityHeaders(
            NextResponse.json(
              { error: "Authentication required", code: "UNAUTHENTICATED" },
              { status: 401 },
            ),
          ),
        );
      }
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      const returnUrl = request.nextUrl.pathname + request.nextUrl.search;
      url.searchParams.set("callbackUrl", returnUrl);
      return withTiming(setSecurityHeaders(NextResponse.redirect(url)));
    }
  } catch {
    if (isApiPath(pathname) || pathname.startsWith("/api/")) {
      return withTiming(
        setSecurityHeaders(
          NextResponse.json(
            { error: "Authentication required", code: "UNAUTHENTICATED" },
            { status: 401 },
          ),
        ),
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return withTiming(setSecurityHeaders(NextResponse.redirect(url)));
  }

  const tok = token as Record<string, unknown> | null;
  if (tok) {
    const role = tok.role as string | undefined;
    const mfaEnabled = tok.mfaEnabled as boolean | undefined;
    const mfaVerified = tok.mfaVerified as boolean | undefined;
    const isMfaExempt = mfaExemptPrefixes.some((p) => pathname.startsWith(p));
    const mfaGate = resolveMfaGateState({
      role,
      mfaEnabled,
      mfaVerified,
      isExempt: isMfaExempt,
    });

    if (mfaGate !== "allow") {
      if (isApiPath(pathname) || pathname.startsWith("/api/")) {
        return withTiming(
          setSecurityHeaders(
            NextResponse.json(
              { error: "MFA_REQUIRED", code: "MFA_REQUIRED" },
              { status: 403 },
            ),
          ),
        );
      }
      const url = request.nextUrl.clone();
      if (mfaGate === "enroll") {
        url.pathname = "/settings/mfa";
      } else {
        url.pathname = "/login";
        url.searchParams.set("mfa", "true");
      }
      url.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search);
      return withTiming(setSecurityHeaders(NextResponse.redirect(url)));
    }
  }

  // ── RBAC: Role-based route access check ──
  if (tok) {
    const role = tok.role as string | undefined;
    const requiredRole = getRequiredRole(pathname);
    if (requiredRole && role && !hasSufficientRole(role, requiredRole)) {
      if (isApiPath(pathname) || pathname.startsWith("/api/")) {
        return withTiming(
          setSecurityHeaders(
            NextResponse.json(
              { error: "Insufficient permissions", code: "FORBIDDEN" },
              { status: 403 },
            ),
          ),
        );
      }
      return withTiming(
        setSecurityHeaders(
          NextResponse.redirect(new URL("/access-denied", request.url)),
        ),
      );
    }
  }

  return withTiming(setSecurityHeaders(NextResponse.next()));
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
    "/contacts",
    "/contacts/:path*",
    "/decision",
    "/decision/:path*",
    "/content-studio",
    "/content-studio/:path*",
    "/risk",
    "/risk/:path*",
    "/office-ai",
    "/office-ai/:path*",
    "/sampling",
    "/sampling/:path*",
    "/settings/audit-bridge",
    "/settings/audit-bridge/:path*",
    "/settings/organization",
    "/settings/organization/:path*",
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
    "/api/decisions/:path*",
    "/api/agent-memory",
    "/api/office-ai/:path*",
    "/api/local-content/:path*",
    "/api/sunbul/:path*",
    "/api/workflowos/:path*",
    "/api/metrics",
    "/api/monitoring/:path*",
    "/api/ai/:path*",
    "/api/scim/:path*",
    "/api/integration/:path*",
    "/api/custom-product-submit",
    "/api/pilot-review",
    "/api/platform/:path*",
    "/api/skills/:path*",
    "/api/sales/:path*",
    "/api/notifications/:path*",
    "/governance-hub",
    "/governance-hub/:path*",
    "/operator",
    "/operator/:path*",
  ],
};
