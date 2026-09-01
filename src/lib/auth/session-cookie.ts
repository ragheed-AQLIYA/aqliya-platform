/**
 * NextAuth / Auth.js session cookie name and salt must match.
 * Production uses the __Secure- prefix; the salt is the cookie name.
 */

export function sessionMaxAgeSeconds(): number {
  const raw = Number(process.env.SESSION_MAX_AGE_SECONDS);
  if (Number.isFinite(raw) && raw >= 300 && raw <= 30 * 24 * 60 * 60) {
    return Math.floor(raw);
  }
  return 12 * 60 * 60;
}

export function sessionAuthzRefreshMs(): number {
  const raw = Number(process.env.SESSION_AUTHZ_REFRESH_SECONDS);
  if (Number.isFinite(raw) && raw >= 60 && raw <= 24 * 60 * 60) {
    return Math.floor(raw) * 1000;
  }
  return 60 * 60 * 1000;
}

export function sessionCookieName(
  isProduction = process.env.NODE_ENV === "production",
): string {
  return isProduction
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";
}

/** Auth.js encode/decode salt equals the cookie name. */
export function sessionCookieSalt(
  isProduction = process.env.NODE_ENV === "production",
): string {
  return sessionCookieName(isProduction);
}

export function resolveSessionCookieName(cookieStore: {
  has: (name: string) => boolean;
}): string {
  if (cookieStore.has("__Secure-authjs.session-token")) {
    return "__Secure-authjs.session-token";
  }
  if (cookieStore.has("__Host-authjs.session-token")) {
    return "__Host-authjs.session-token";
  }
  return "authjs.session-token";
}
