import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { setSecurityHeaders } from "./middleware-security";
import { rateLimitMiddleware } from "./middleware-rate-limit";

const protectedPaths = [
  "/audit",
  "/decisions",
  "/sales",
  "/sunbul",
  "/workflowos",
  "/organizations",
  "/intelligence",
  "/monitoring",
  "/settings",
  "/assistant",
  "/local-content",
];

function isProtectedPath(pathname: string): boolean {
  return protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const rateLimitResponse = rateLimitMiddleware(request);
  if (rateLimitResponse) return rateLimitResponse;

  if (isProtectedPath(pathname)) {
    try {
      const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
      });
      if (token?.sub) {
        return setSecurityHeaders(NextResponse.next());
      }
    } catch {
      // Token verification failed — fall through to redirect
    }
    const url = new URL("/login", request.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return setSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next|_static|_vercel|brand|.*\\..*).*)", "/api/:path*"],
};
