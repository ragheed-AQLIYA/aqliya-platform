import {
  resolveSessionCookieName,
  sessionCookieName,
  sessionCookieSalt,
  sessionMaxAgeSeconds,
} from "@/lib/auth/session-cookie";

describe("session cookie salt", () => {
  it("uses the Auth.js cookie name as salt", () => {
    expect(sessionCookieName(false)).toBe("authjs.session-token");
    expect(sessionCookieSalt(true)).toBe("__Secure-authjs.session-token");
    expect(sessionCookieSalt(true)).toBe(sessionCookieName(true));
  });

  it("prefers the secure cookie when present", () => {
    expect(
      resolveSessionCookieName({
        has: (name) => name === "__Secure-authjs.session-token",
      }),
    ).toBe("__Secure-authjs.session-token");
  });

  it("defaults session lifetime to 12 hours", () => {
    const previous = process.env.SESSION_MAX_AGE_SECONDS;
    delete process.env.SESSION_MAX_AGE_SECONDS;
    expect(sessionMaxAgeSeconds()).toBe(12 * 60 * 60);
    process.env.SESSION_MAX_AGE_SECONDS = previous;
  });
});
