import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { setSecurityHeaders } from "@/middleware-security";

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
];

function isProtectedPath(pathname: string): boolean {
  if (pathname === "/audit" || pathname.startsWith("/audit/")) return true;
  return protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

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
      // Token verification failed — redirect to login
    }
    const url = new URL("/login", request.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  try {
    return setSecurityHeaders(NextResponse.next());
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|auditos|login|access-denied).*)",
  ],
};
