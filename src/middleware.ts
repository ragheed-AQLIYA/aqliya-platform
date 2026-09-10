import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { setSecurityHeaders, setCorsHeaders } from "@/middleware-security";
import { rateLimitMiddleware } from "@/middleware-rate-limit";
import { resolveMfaGateState } from "@/lib/auth/mfa-gate";
import { isPublicPath } from "@/lib/auth/public-paths";
import { resolveSessionCookieName } from "@/lib/auth/session-cookie";

const secret = process.env.AUTH_SECRET;

function isApiPath(pathname: string): boolean {
  return (
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/auth/") &&
    pathname !== "/api/health"
  );
}

const mfaExemptPrefixes = [
  "/login",
  "/settings/mfa",
  "/api/auth",
];

// Edge-compatible first gate. Detailed permission checks happen server-side.
const routeMinRoles: Record<string, string> = {
  "/audit": "viewer",
  "/decisions": "viewer",
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
  "/api/sales/intel": "viewer",
  "/api/notifications": "viewer",
  "/api/knowledge-mining": "viewer",
  "/institutional-memory": "viewer",
  "/knowledge-foundation": "viewer",
  "/governance-hub": "viewer",
  "/operator": "admin",
  "/overview": "viewer",
  "/notifications": "viewer",
  "/knowledge-review": "viewer",
  "/api/integration": "viewer",
  "/api/sunbul": "viewer",
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

export async function middleware(request: NextRequest) {
  const start = Date.now();

  const withTiming = (response: NextResponse): NextResponse => {
    response.headers.set("X-Response-Time", `${Date.now() - start}ms`);
    return setCorsHeaders(request, response);
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
    const salt = resolveSessionCookieName(request.cookies);
    token = await getToken({ req: request, secret, salt });
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

/**
 * Default-deny matcher: every path except static assets runs through middleware.
 * Public routes are skipped inside isPublicPath(), not by omitting them here.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/webpack-hmr|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
