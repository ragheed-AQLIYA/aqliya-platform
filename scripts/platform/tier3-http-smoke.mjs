#!/usr/bin/env node
/**
 * Tier 3 HTTP smoke — extends Tier 2 with enterprise + ABAC pilot APIs.
 */
import { execSync } from "child_process";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
config({ path: resolve(root, ".env") });

const tier2Script = resolve(dirname(fileURLToPath(import.meta.url)), "tier2-http-smoke.mjs");
const extraArgs = process.argv.slice(2);

try {
  execSync(`node "${tier2Script}" ${extraArgs.map((a) => `"${a}"`).join(" ")}`, {
    stdio: "inherit",
    cwd: root,
  });
} catch {
  process.exit(1);
}

const BASE =
  process.argv.find((a) => a.startsWith("--base-url="))?.split("=")[1] ??
  process.argv[process.argv.indexOf("--base-url") + 1] ??
  "http://localhost:3000";

const jar = new Map();

function storeCookies(res) {
  for (const c of res.headers.getSetCookie?.() ?? []) {
    jar.set(c.split("=")[0], c.split(";")[0]);
  }
}

function cookieHeader() {
  return [...jar.values()].join("; ");
}

async function login() {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`, { headers: { Cookie: cookieHeader() } });
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
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: cookieHeader() },
    body,
    redirect: "manual",
  });
  storeCookies(loginRes);
}

async function fetchJson(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { Cookie: cookieHeader(), ...(opts.headers ?? {}) },
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
  console.log("\n── Tier 3 extensions ──\n");

  await login();

  const pilot = await fetchJson("/api/platform/abac/pilot-status");
  const pilotOk = pilot.status === 200 && pilot.body?.ok;
  console.log(
    pilotOk ? "  ✓" : "  ✗",
    "GET /api/platform/abac/pilot-status",
    `HTTP ${pilot.status}`,
  );

  const retry = await fetchJson("/api/platform/outbox/retry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const retryOk = retry.status === 200 && retry.body?.ok !== false;
  console.log(
    retryOk ? "  ✓" : "  ✗",
    "POST /api/platform/outbox/retry",
    `HTTP ${retry.status}, retried=${retry.body?.retried ?? "?"}`,
  );

  const monitoring = await fetch(`${BASE}/monitoring`, {
    headers: { Cookie: cookieHeader() },
    redirect: "manual",
  });
  const monitoringOk = monitoring.status === 200;
  console.log(monitoringOk ? "  ✓" : "  ✗", "GET /monitoring", `HTTP ${monitoring.status}`);

  const failed = [pilotOk, retryOk, monitoringOk].filter((ok) => !ok).length;
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
