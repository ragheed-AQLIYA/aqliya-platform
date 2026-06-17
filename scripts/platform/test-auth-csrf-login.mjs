#!/usr/bin/env node
/** Quick probe: NextAuth credentials + CSRF against local server */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });

const base = process.env.TEST_BASE_URL || "http://localhost:3000";

const jar = new Map();

function storeCookies(res) {
  const raw = res.headers.getSetCookie?.() ?? [];
  for (const c of raw) {
    jar.set(c.split("=")[0], c.split(";")[0]);
  }
}

function cookieHeader() {
  return [...jar.values()].join("; ");
}

async function main() {
  const csrfRes = await fetch(`${base}/api/auth/csrf`, {
    headers: { Cookie: cookieHeader() },
  });
  storeCookies(csrfRes);
  const { csrfToken } = await csrfRes.json();
  console.log("csrf:", csrfToken ? "ok" : "missing");

  const body = new URLSearchParams({
    csrfToken,
    email: "admin@aqliya.com",
    password: "admin123",
    redirect: "false",
    json: "true",
  });

  const loginRes = await fetch(`${base}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookieHeader(),
    },
    body,
    redirect: "manual",
  });
  storeCookies(loginRes);
  console.log("login status:", loginRes.status);

  const sessionRes = await fetch(`${base}/api/auth/session`, {
    headers: { Cookie: cookieHeader() },
  });
  const session = await sessionRes.json();
  console.log("session user:", session?.user?.email ?? "none");
  process.exit(session?.user?.email ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
