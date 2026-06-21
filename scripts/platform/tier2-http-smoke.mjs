#!/usr/bin/env node
/**
 * Tier 2 HTTP smoke — authenticated platform operator APIs.
 *
 * Usage (server must be running):
 *   node scripts/platform/tier2-http-smoke.mjs --base-url http://localhost:3000
 */
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", ".env") });

const BASE =
  process.argv.find((a) => a.startsWith("--base-url="))?.split("=")[1] ??
  process.argv[process.argv.indexOf("--base-url") + 1] ??
  "http://localhost:3000";

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

const checks = [];

function record(name, status, detail) {
  checks.push({ name, status, detail });
  const icon = status === "pass" ? "✓" : status === "warn" ? "⚠" : "✗";
  console.log(`  ${icon} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function login() {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`, {
    headers: { Cookie: cookieHeader() },
  });
  storeCookies(csrfRes);
  const { csrfToken } = await csrfRes.json();

  const body = new URLSearchParams({
    csrfToken,
    email: "admin@aqliya.com",
    password: "admin123",
    redirect: "false",
    json: "true",
  });

  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookieHeader(),
    },
    body,
    redirect: "manual",
  });
  storeCookies(loginRes);

  const sessionRes = await fetch(`${BASE}/api/auth/session`, {
    headers: { Cookie: cookieHeader() },
  });
  const session = await sessionRes.json();
  return session?.user?.email ?? null;
}

async function fetchJson(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      Cookie: cookieHeader(),
      ...(opts.headers ?? {}),
    },
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, body };
}

async function main() {
  console.log("\n═══════════════════════════════════════════════");
  console.log(`  Tier 2 HTTP Smoke — ${BASE}`);
  console.log("═══════════════════════════════════════════════\n");

  const email = await login();
  if (!email) {
    record("Admin login", "fail", "no session — seed admin@aqliya.com / admin123");
    process.exit(1);
  }
  record("Admin login", "pass", email);

  const abac = await fetchJson("/api/platform/abac/shadow-report");
  record(
    "GET /api/platform/abac/shadow-report",
    abac.status === 200 && abac.body?.ok ? "pass" : "fail",
    `HTTP ${abac.status}`,
  );

  const registry = await fetchJson("/api/platform/events/registry");
  record(
    "GET /api/platform/events/registry",
    registry.status === 200 && registry.body?.count >= 3 ? "pass" : "fail",
    `HTTP ${registry.status}, count=${registry.body?.count ?? "?"}`,
  );

  const outbox = await fetchJson("/api/platform/outbox/process", { method: "POST" });
  record(
    "POST /api/platform/outbox/process",
    outbox.status === 200 && outbox.body?.ok !== false ? "pass" : "fail",
    `HTTP ${outbox.status}, processed=${outbox.body?.processed ?? "?"}`,
  );

  const outboxStatus = await fetchJson("/api/platform/outbox/status");
  record(
    "GET /api/platform/outbox/status",
    outboxStatus.status === 200 && outboxStatus.body?.ok ? "pass" : "fail",
    `HTTP ${outboxStatus.status}`,
  );

  const enterprise = await fetchJson("/api/platform/enterprise-health");
  record(
    "GET /api/platform/enterprise-health",
    enterprise.status === 200 && enterprise.body?.ok ? "pass" : "fail",
    `HTTP ${enterprise.status}, warnings=${enterprise.body?.summary?.warningAlerts ?? "?"}`,
  );

  const intel = await fetch(`${BASE}/intelligence`, {
    headers: { Cookie: cookieHeader() },
    redirect: "manual",
  });
  record(
    "GET /intelligence",
    intel.status === 200 ? "pass" : "fail",
    `HTTP ${intel.status}`,
  );

  const failed = checks.filter((c) => c.status === "fail").length;
  console.log(JSON.stringify({ checks }, null, 2));
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
