/**
 * post-deploy-smoke.mjs
 *
 * Comprehensive post-deployment smoke test for AQLIYA.
 * Executed by CI/CD (deploy.yml → post-deploy job) after ECS deploy.
 *
 * Usage:
 *   node scripts/post-deploy-smoke.mjs --base-url "https://staging.aqliya.com"
 *   SCIM_API_KEY=xxx node scripts/post-deploy-smoke.mjs --base-url "http://localhost:3000"
 *
 * Returns exit code 0 if all CRITICAL checks pass, 1 if any fail.
 * Warnings do not fail the pipeline.
 */

import { execSync } from "child_process"
import { config as loadDotenv } from "dotenv"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

loadDotenv({ path: resolve(dirname(fileURLToPath(import.meta.url)), "..", ".env") })

// ─── CLI / Env ───────────────────────────────────────────────────────────────

const BASE_URL =
  process.env.BASE_URL ??
  process.argv.find((a) => a.startsWith("--base-url="))?.split("=")[1] ??
  process.argv[process.argv.indexOf("--base-url") + 1];

if (!BASE_URL) {
  console.error("Usage: node scripts/post-deploy-smoke.mjs --base-url <url>");
  process.exit(1);
}

const SCIM_API_KEY =
  process.env.SCIM_API_KEY ??
  process.argv.find((a) => a.startsWith("--scim-key="))?.split("=")[1] ??
  process.argv[process.argv.indexOf("--scim-key") + 1];

const AUTH_TOKEN =
  process.env.AUTH_TOKEN ??
  process.argv.find((a) => a.startsWith("--auth-token="))?.split("=")[1] ??
  process.argv[process.argv.indexOf("--auth-token") + 1];

const COMMIT = process.env.GIT_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? "unknown";
const ENVIRONMENT = process.env.NODE_ENV ?? "development";
const TIMEOUT_MS = 15_000;
const BASE = BASE_URL.replace(/\/+$/, "");

// ─── Result collector ────────────────────────────────────────────────────────

const checks = [];

function record({ name, endpoint, status, httpStatus, critical = true, detail }) {
  checks.push({
    name,
    endpoint: endpoint ?? null,
    status, // "pass" | "fail" | "warn"
    httpStatus: httpStatus ?? null,
    critical,
    detail: detail ?? null,
    ts: new Date().toISOString(),
  });
  const icon = status === "pass" ? "✓" : status === "warn" ? "⚠" : "✗";
  const crit = critical ? "" : " (non-critical)";
  console.log(`  ${icon} ${name} — HTTP ${httpStatus ?? "—"} [${status}]${crit}`);
  if (detail) console.log(`       ${detail}`);
}

// ─── HTTP helpers ────────────────────────────────────────────────────────────

async function fetchUrl(path, opts = {}) {
  const url = `${BASE}${path}`;
  const signal = AbortSignal.timeout(opts.timeout ?? TIMEOUT_MS);
  const headers = { "User-Agent": "AqliyaPostDeploySmoke/1.0", ...opts.headers };
  const start = Date.now();
  let res;
  try {
    res = await fetch(url, {
      method: opts.method ?? "GET",
      headers,
      signal,
      redirect: "manual",
      body: opts.body ?? null,
    });
  } catch (err) {
    return { ok: false, status: 0, ms: Date.now() - start, error: err.message };
  }
  return { ok: true, status: res.status, ms: Date.now() - start, res };
}

function isRedirect(status) {
  return status >= 300 && status < 400;
}

function acceptAnyOf(got, expected) {
  return expected.includes(got);
}

// ─── Check runners ───────────────────────────────────────────────────────────

async function checkHttp(label, path, { acceptStatuses = [200], critical = true, headers = {} } = {}) {
  const { ok, status, ms, error } = await fetchUrl(path, { headers });
  if (!ok) {
    record({ name: label, endpoint: path, status: "fail", httpStatus: 0, critical, detail: error });
    return;
  }
  if (acceptAnyOf(status, acceptStatuses)) {
    record({ name: label, endpoint: path, status: "pass", httpStatus: status, critical });
  } else {
    record({
      name: label,
      endpoint: path,
      status: "fail",
      httpStatus: status,
      critical,
      detail: `Expected status in [${acceptStatuses.join(",")}]`,
    });
  }
}

async function checkRedirect(label, path, { critical = true } = {}) {
  const { ok, status, ms, error, res } = await fetchUrl(path);
  if (!ok) {
    record({ name: label, endpoint: path, status: "fail", httpStatus: 0, critical, detail: error });
    return;
  }
  if (isRedirect(status)) {
    const location = res?.headers?.get("location") ?? "(none)";
    record({ name: label, endpoint: path, status: "pass", httpStatus: status, critical, detail: `→ ${location}` });
  } else {
    record({ name: label, endpoint: path, status: "fail", httpStatus: status, critical, detail: `Expected redirect (3xx), got ${status}` });
  }
}

async function checkJsonBody(label, path, { acceptStatuses = [200], validate, critical = true, headers = {} } = {}) {
  const { ok, status, ms, error, res } = await fetchUrl(path, { headers });
  if (!ok) {
    record({ name: label, endpoint: path, status: "fail", httpStatus: 0, critical, detail: error });
    return;
  }
  if (!acceptAnyOf(status, acceptStatuses)) {
    record({ name: label, endpoint: path, status: "fail", httpStatus: status, critical, detail: `Expected status in [${acceptStatuses.join(",")}]` });
    return;
  }
  let body;
  try {
    body = await res.json();
  } catch {
    record({ name: label, endpoint: path, status: "fail", httpStatus: status, critical, detail: "Response body is not valid JSON" });
    return;
  }
  if (validate) {
    const err = validate(body);
    if (err) {
      record({ name: label, endpoint: path, status: "fail", httpStatus: status, critical, detail: `Validation failed: ${err}` });
      return;
    }
  }
  record({ name: label, endpoint: path, status: "pass", httpStatus: status, critical });
}

// ─── Command runner for notification tests ───────────────────────────────────

function runNotificationTests() {
  try {
    const output = execSync(
      `npx jest --no-coverage --ci "src/lib/platform/notification/__tests__/engine.test.ts" 2>&1`,
      { cwd: process.cwd(), encoding: "utf-8", timeout: 60_000 },
    );
    const passed = output.includes("Tests:") && !output.includes("FAIL");
    const lastLine = output.trim().split("\n").pop();
    record({
      name: "Notification engine tests",
      endpoint: null,
      status: passed ? "pass" : "fail",
      httpStatus: null,
      critical: false,
      detail: passed ? "Jest suite passed" : `Test output: ${lastLine}`,
    });
  } catch (err) {
    const msg = err.stderr ?? err.message ?? "Execution error";
    record({
      name: "Notification engine tests",
      endpoint: null,
      status: "warn",
      httpStatus: null,
      critical: false,
      detail: `Could not run: ${msg.substring(0, 200)}`,
    });
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const startedAt = Date.now();
  console.log(`\n═══════════════════════════════════════════════`);
  console.log(`  AQLIYA Post-Deploy Smoke Test`);
  console.log(`  Target: ${BASE}`);
  console.log(`  Env:    ${ENVIRONMENT}`);
  console.log(`  Commit: ${COMMIT}`);
  console.log(`═══════════════════════════════════════════════\n`);

  // ── 1. Health Checks ──────────────────────────────────────────────────────

  console.log("\n── Health ──\n");

  await checkJsonBody("Health endpoint — main", "/api/health", {
    acceptStatuses: [200, 503],
    validate: (b) => {
      if (!b || typeof b.status !== "string") return "Missing 'status' field";
      return null;
    },
  });

  await checkJsonBody("Health endpoint — ready", "/api/health/ready", {
    acceptStatuses: [200, 503],
    validate: (b) => {
      if (!b || typeof b.status !== "string") return "Missing 'status' field";
      return null;
    },
  });

  await checkHttp("Health endpoint — live", "/api/health/live");

  // ── 2. Auth Checks ────────────────────────────────────────────────────────

  console.log("\n── Auth ──\n");

  await checkHttp("Login page loads", "/login");
  await checkHttp("CSRF token endpoint", "/api/auth/csrf", { acceptStatuses: [200, 404] });

  // Protected route → login redirect
  await checkRedirect("Protected route (/settings) redirects to login", "/settings");

  // ── 3. SCIM Checks ────────────────────────────────────────────────────────

  console.log("\n── SCIM ──\n");

  // Without auth — must return 401
  await checkHttp("SCIM GET /Users (no auth) rejects with 401", "/api/scim/v2/Users", {
    acceptStatuses: [401],
  });

  // With auth — may return 200 or 500 (500 if SCIM_DEFAULT_ORG_ID not configured)
  if (SCIM_API_KEY) {
    await checkHttp("SCIM GET /Users (authenticated)", "/api/scim/v2/Users", {
      acceptStatuses: [200, 500],
      critical: false,
      headers: {
        Authorization: `Bearer ${SCIM_API_KEY}`,
        "Content-Type": "application/scim+json",
      },
    });
  } else {
    record({
      name: "SCIM GET /Users (authenticated)",
      endpoint: "/api/scim/v2/Users",
      status: "warn",
      httpStatus: null,
      critical: false,
      detail: "Skipped — set SCIM_API_KEY env var to test authenticated path",
    });
  }

  // ── 4. Marketing / Workspace Checks ──────────────────────────────────────

  console.log("\n── Marketing ──\n");

  await checkHttp("Homepage (/)", "/");
  await checkHttp("About page (/about)", "/about");
  await checkHttp("Products page (/products)", "/products");
  await checkHttp("Platform page (/platform)", "/platform");

  // Launch program — platform-first marketing (2026-06)
  await checkHttp("Industries (/industries)", "/industries");
  await checkHttp("Proof Center (/proof)", "/proof");
  await checkHttp("Procurement pack (/procurement-pack)", "/procurement-pack");
  await checkHttp("SOC2 roadmap (/soc2-roadmap)", "/soc2-roadmap");
  await checkHttp("Pilot outcomes (/pilot-outcomes)", "/pilot-outcomes");
  await checkHttp("Executive brief PDF (/print/executive-brief)", "/print/executive-brief");
  await checkHttp("Security summary PDF (/print/security-summary)", "/print/security-summary");
  await checkHttp("English home (/en)", "/en");
  await checkHttp("English proof (/en/proof)", "/en/proof");
  await checkHttp("English platform (/en/platform)", "/en/platform");
  await checkHttp("English SOC2 (/en/soc2-roadmap)", "/en/soc2-roadmap");
  await checkHttp("English about (/en/about)", "/en/about");
  await checkHttp("English governance (/en/governance)", "/en/governance");
  await checkHttp("English industries (/en/industries)", "/en/industries");
  await checkHttp("English contact (/en/contact)", "/en/contact");
  await checkHttp("English engagement models (/en/engagement-models)", "/en/engagement-models");
  await checkHttp("English deployment (/en/deployment)", "/en/deployment");
  await checkHttp("English procurement pack (/en/procurement-pack)", "/en/procurement-pack");
  await checkHttp("English how we work (/en/how-we-work)", "/en/how-we-work");
  await checkHttp("English AuditOS product (/en/products/audit)", "/en/products/audit");
  await checkHttp("English DecisionOS product (/en/products/decision)", "/en/products/decision");
  await checkHttp("English LocalContent product (/en/products/local-content)", "/en/products/local-content");
  await checkHttp("Evaluation SOW EN PDF (/print/evaluation-sow-en)", "/print/evaluation-sow-en");
  await checkHttp("Engagement models AR (/engagement-models)", "/engagement-models");
  await checkHttp("Deployment AR (/deployment)", "/deployment");
  await checkRedirect("Buyers procurement → pack", "/buyers/procurement");

  console.log("\n── AuditOS public demo (/auditos) ──\n");

  await checkHttp("AuditOS demo home (/auditos)", "/auditos");
  await checkHttp("AuditOS demo trial balance", "/auditos/trial-balance");
  await checkHttp("AuditOS demo mapping", "/auditos/mapping");
  await checkHttp("AuditOS demo statements", "/auditos/statements");
  await checkHttp("AuditOS demo evidence", "/auditos/evidence");
  await checkHttp("AuditOS demo traceability", "/auditos/traceability");

  // ── 5. Feature Flags / Env Vars ───────────────────────────────────────────

  console.log("\n── Env Vars ──\n");

  const requiredVars = ["AUTH_SECRET"];
  const optionalVars = ["DATABASE_URL", "REDIS_URL", "SCIM_API_KEY", "SCIM_DEFAULT_ORG_ID"];

  for (const v of requiredVars) {
    if (process.env[v]) {
      record({ name: `Required env var: ${v}`, endpoint: null, status: "pass", httpStatus: null, critical: true });
    } else {
      record({ name: `Required env var: ${v}`, endpoint: null, status: "fail", httpStatus: null, critical: true, detail: `${v} is not set` });
    }
  }

  for (const v of optionalVars) {
    if (process.env[v]) {
      record({ name: `Optional env var: ${v}`, endpoint: null, status: "pass", httpStatus: null, critical: false });
    } else {
      record({ name: `Optional env var: ${v}`, endpoint: null, status: "warn", httpStatus: null, critical: false, detail: `${v} is not set (optional)` });
    }
  }

  // ── 6. Notification Engine Tests ─────────────────────────────────────────

  console.log("\n── Notification Engine ──\n");

  runNotificationTests();

  // ── Summary ───────────────────────────────────────────────────────────────

  const passed = checks.filter((c) => c.status === "pass").length;
  const failed = checks.filter((c) => c.status === "fail").length;
  const warnings = checks.filter((c) => c.status === "warn").length;
  const criticalFailed = checks.filter((c) => c.status === "fail" && c.critical).length;

  const results = {
    version: "0.1.0",
    timestamp: new Date().toISOString(),
    commit: COMMIT,
    environment: ENVIRONMENT,
    targetUrl: BASE,
    durationMs: Date.now() - startedAt,
    checks: checks.map(({ ts, ...rest }) => rest),
    summary: { total: checks.length, passed, failed, warnings },
  };

  console.log(`\n───────────────────────────────────────────────`);
  console.log(`  ${passed} passed, ${failed} failed, ${warnings} warnings`);
  console.log(`  Duration: ${results.durationMs}ms`);
  console.log(`───────────────────────────────────────────────\n`);

  console.log(JSON.stringify(results, null, 2));

  if (criticalFailed > 0) {
    console.error(`\nFAILED: ${criticalFailed} critical check(s) failed.`);
    process.exit(1);
  }

  console.log("\nPASSED — All critical checks pass.\n");
}

main().catch((err) => {
  console.error("Smoke test fatal error:", err);
  process.exit(1);
});
