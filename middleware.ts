import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { setSecurityHeaders } from "./src/middleware-security";
import { rateLimitMiddleware } from "./src/middleware-rate-limit";

const intlMiddleware = createMiddleware({
  locales: ["ar", "en", "tr"],
  defaultLocale: "ar",
  localePrefix: "never",
});

export default function middleware(request: NextRequest) {
  const rateLimitResponse = rateLimitMiddleware(request);
  if (rateLimitResponse) return rateLimitResponse;

  if (!request.nextUrl.pathname.startsWith("/api/")) {
    const response = intlMiddleware(request);
    return setSecurityHeaders(response);
  }

  return setSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next|_static|_vercel|brand|.*\\..*).*)", "/api/:path*"],
};
