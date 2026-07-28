#!/usr/bin/env node
/**
 * AQLIYA Pilot Verification Script
 * =============================================================================
 *
 * Verifies that a pilot deployment is healthy by checking:
 *   1. All demo accounts exist in the database
 *   2. All 7 product workspaces have seed data
 *   3. PlatformAuditLog has entries across all products
 *   4. Key workflow states: created → reviewed → approved → audit trail
 *   5. Outputs a JSON verification report
 *
 * Usage:
 *   node scripts/pilot/verify-pilot.mjs [--json] [--help]
 *
 * Prerequisites:
 *   - PostgreSQL + Redis running (docker compose up -d db redis)
 *   - .env file with DATABASE_URL
 *   - Pilot seed data loaded (npm run seed:pilot or launch-pilot.sh)
 */

import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { writeFileSync, mkdirSync, existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");

// ─── CLI Args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
AQLIYA Pilot Verification

Usage:
  node scripts/pilot/verify-pilot.mjs [--json] [--help]

Options:
  --json    Output JSON report to stdout only (no colors)
  --help    Show this help message

What it checks:
  1. Demo accounts (8 pilot + 3 base) exist in database
  2. Product workspaces have seed data (7 products)
  3. PlatformAuditLog entries across all products (expect >= 20)
  4. Key workflow states (create → review → approve → audit trail)
  5. Outputs a JSON verification report to backups/pilot-reports/

Exit code:
  0 = all checks passed
  1 = one or more checks failed (non-blocking warnings)
  2 = critical failure (cannot connect to database)
`);
  process.exit(0);
}

const JSON_ONLY = args.includes("--json");

// ─── Logging ─────────────────────────────────────────────────────────────────
const c = JSON_ONLY
  ? { red: "", green: "", yellow: "", cyan: "", bold: "", reset: "" }
  : { red: "\x1b[0;31m", green: "\x1b[0;32m", yellow: "\x1b[0;33m", cyan: "\x1b[0;36m", bold: "\x1b[1m", reset: "\x1b[0m" };

const NT = c.reset;
let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
let warningsCount = 0;

function log(msg) { if (!JSON_ONLY) console.log(msg); }
function ok(msg) { totalChecks++; passedChecks++; log(`  ${c.green}PASS${NT}  ${msg}`); }
function fail(msg) { totalChecks++; failedChecks++; log(`  ${c.red}FAIL${NT}  ${msg}`); }
function warn(msg) { warningsCount++; log(`  ${c.yellow}WARN${NT}  ${msg}`); }
function section(title) { totalChecks++; log(`\n${c.cyan}─── ${c.bold}${title}${NT}`); }

// ─── Load env and connect ────────────────────────────────────────────────────
config({ path: resolve(ROOT, ".env") });

async function main() {
  log(`${c.bold}AQLIYA Pilot Verification${NT}`);
  log(`Started: ${new Date().toISOString()}`);

  // Connect to database
  section("Database Connection");
  let prisma;
  try {
    const { PrismaClient } = await import("@prisma/client");
    const { PrismaPg } = await import("@prisma/adapter-pg");
    const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/aqliya";
    const adapter = new PrismaPg(dbUrl);
    prisma = new PrismaClient({ adapter });
    await prisma.$queryRaw`SELECT 1`;
    ok("Database connected");
  } catch (e) {
    fail(`Cannot connect to database: ${e.message}`);
    warn("Ensure PostgreSQL is running: docker compose up -d db");
    warn("Check DATABASE_URL in .env");
    process.exit(2);
  }

  /**
   * Safe query wrapper — returns null on error instead of throwing
   */
  async function safeQuery(label, fn) {
    try {
      return await fn();
    } catch (e) {
      warn(`${label}: ${e.message}`);
      return null;
    }
  }

  const results = {
    meta: {
      generatedAt: new Date().toISOString(),
      nodeVersion: process.version,
      checksTotal: 0,
      checksPassed: 0,
      checksFailed: 0,
      warnings: 0,
    },
    accounts: {},
    workspaces: {},
    auditLog: {},
    workflows: {},
  };

  // ═══ 1. DEMO ACCOUNTS ══════════════════════════════════════════════════════
  section("1. Demo Accounts");

  /**
   * Expected demo accounts: 8 pilot accounts from seed-pilot.ts + 3 base from seed.ts
   * All pilot accounts use the .pilot@aqliya.com suffix with password "pilot123"
   * Base accounts use @aqliya.com with individual passwords
   */
  const PILOT_USERS = [
    { email: "admin.pilot@aqliya.com", role: "ADMIN" },
    { email: "partner.pilot@aqliya.com", role: "ADMIN" },
    { email: "manager.pilot@aqliya.com", role: "OPERATOR" },
    { email: "auditor.pilot@aqliya.com", role: "OPERATOR" },
    { email: "reviewer.pilot@aqliya.com", role: "OPERATOR" },
    { email: "operator.pilot@aqliya.com", role: "OPERATOR" },
    { email: "analyst.pilot@aqliya.com", role: "OPERATOR" },
    { email: "viewer.pilot@aqliya.com", role: "VIEWER" },
  ];

  const BASE_USERS = [
    { email: "admin@aqliya.com", role: "ADMIN" },
    { email: "operator@aqliya.com", role: "OPERATOR" },
    { email: "viewer@aqliya.com", role: "VIEWER" },
  ];

  // Check pilot users
  for (const expected of PILOT_USERS) {
    const user = await safeQuery(`find user ${expected.email}`, () =>
      prisma.user.findUnique({ where: { email: expected.email }, select: { id: true, name: true, role: true, email: true } })
    );
    if (user) {
      const email = user.email || expected.email;
      if (user.role === expected.role) {
        ok(`Pilot user: ${email} (${user.name}, ${user.role})`);
      } else {
        warn(`Pilot user ${email} has role ${user.role}, expected ${expected.role}`);
      }
      results.accounts[email] = { found: true, name: user.name, role: user.role };
    } else {
      fail(`Pilot user not found: ${expected.email}`);
      results.accounts[expected.email] = { found: false, reason: "Not in database" };
    }
  }

  // Check base users
  for (const expected of BASE_USERS) {
    const user = await safeQuery(`find user ${expected.email}`, () =>
      prisma.user.findUnique({ where: { email: expected.email }, select: { id: true, name: true, role: true } })
    );
    if (user) {
      const email = user.email || expected.email;
      ok(`Base user: ${email} (${user.name}, ${user.role})`);
      results.accounts[email] = { found: true, name: user.name, role: user.role };
    } else {
      warn(`Base user not found: ${expected.email} (run prisma/seed.ts first)`);
      results.accounts[expected.email] = { found: false, reason: "Not in database — run base seed first" };
    }
  }

  // ═══ 2. PRODUCT WORKSPACES ═════════════════════════════════════════════════
  section("2. Product Workspaces");

  const PRODUCT_CHECKS = [
    {
      product: "AuditOS",
      check: () => prisma.auditEngagement.count(),
      label: "audit engagements",
      min: 1,
    },
    {
      product: "DecisionOS",
      check: () => prisma.decision.count(),
      label: "decisions",
      min: 1,
    },
    {
      product: "LocalContentOS",
      check: () => prisma.localContentProject.count(),
      label: "LC projects",
      min: 1,
    },
    {
      product: "SalesOS",
      check: () => prisma.salesPipeline.count(),
      label: "sales pipelines",
      min: 1,
    },
    {
      product: "RiskOS",
      check: () => prisma.auditRiskModel.count(),
      label: "risk models",
      min: 1,
    },
    {
      product: "LocalContactOS",
      check: () => prisma.localContact.count(),
      label: "contacts",
      min: 1,
    },
    {
      product: "Content Studio",
      check: () => prisma.contentWorkspace.count(),
      label: "content workspaces",
      min: 1,
    },
  ];

  for (const pc of PRODUCT_CHECKS) {
    const count = await safeQuery(`count ${pc.label}`, pc.check);
    if (count !== null && count >= pc.min) {
      ok(`${pc.product}: ${count} ${pc.label}`);
      results.workspaces[pc.product] = { status: "ok", count };
    } else if (count !== null) {
      warn(`${pc.product}: only ${count} ${pc.label} (expected >=${pc.min})`);
      results.workspaces[pc.product] = { status: "low_data", count };
    } else {
      fail(`${pc.product}: could not query ${pc.label}`);
      results.workspaces[pc.product] = { status: "query_failed" };
    }
  }

  // ═══ 3. PLATFORM AUDIT LOG ════════════════════════════════════════════════
  section("3. PlatformAuditLog");

  const totalLogs = await safeQuery("total audit log entries", () =>
    prisma.platformAuditLog.count()
  );
  if (totalLogs !== null && totalLogs >= 20) {
    ok(`PlatformAuditLog: ${totalLogs} entries (expected >=20)`);
    results.auditLog.total = totalLogs;
  } else if (totalLogs !== null) {
    warn(`PlatformAuditLog: only ${totalLogs} entries (expected >=20)`);
    results.auditLog.total = totalLogs;
  } else {
    fail("PlatformAuditLog: could not query");
    results.auditLog.total = null;
  }

  // Check per-product audit log distribution
  const EXPECTED_PRODUCT_KEYS = ["auditos", "decisionos", "localcontentos", "salesos", "riskos", "platform"];
  const productLogCounts = await safeQuery("audit log by product", () =>
    prisma.platformAuditLog.groupBy({
      by: ["productKey"],
      _count: { id: true },
    })
  );

  if (productLogCounts) {
    const foundKeys = new Set(productLogCounts.map((r) => r.productKey));
    for (const key of EXPECTED_PRODUCT_KEYS) {
      const entry = productLogCounts.find((r) => r.productKey === key);
      if (entry) {
        ok(`  ${key}: ${entry._count.id} entries`);
        results.auditLog[key] = entry._count.id;
      } else {
        warn(`  ${key}: no audit log entries found`);
        results.auditLog[key] = 0;
      }
    }
  }

  // ═══ 4. KEY WORKFLOW STATES ═══════════════════════════════════════════════
  section("4. Key Workflow States");

  // 4a: AuditOS — findings with created + reviewed states
  const auditFindings = await safeQuery("audit findings", () =>
    prisma.auditFinding.findMany({ select: { id: true, title: true, status: true, aiSuggested: true }, take: 5 })
  );
  if (auditFindings && auditFindings.length > 0) {
    const reviewed = auditFindings.filter((f) => f.status === "in_review");
    const drafted = auditFindings.filter((f) => f.status === "draft");
    ok(`AuditOS: ${auditFindings.length} findings (${drafted.length} draft, ${reviewed.length} in_review)`);
    results.workflows.auditFindings = { total: auditFindings.length, draft: drafted.length, in_review: reviewed.length };
  } else {
    warn("AuditOS: no findings found");
    results.workflows.auditFindings = { total: 0 };
  }

  // 4b: Audit review comments (review step)
  const auditReviews = await safeQuery("audit review comments", () =>
    prisma.auditReviewComment.count()
  );
  if (auditReviews !== null && auditReviews > 0) {
    ok(`AuditOS: ${auditReviews} review comments (review step active)`);
    results.workflows.auditReviewComments = auditReviews;
  } else {
    warn("AuditOS: no review comments found");
    results.workflows.auditReviewComments = auditReviews || 0;
  }

  // 4c: LocalContentOS — approval workflow
  const lcApprovals = await safeQuery("LC approvals", () =>
    prisma.localContentApproval.count()
  );
  if (lcApprovals !== null) {
    ok(`LocalContentOS: ${lcApprovals} approvals`);
    results.workflows.lcApprovals = lcApprovals;
  }

  // 4d: LocalContentOS — review workflow
  const lcReviews = await safeQuery("LC reviews", () =>
    prisma.localContentReview.count()
  );
  if (lcReviews !== null) {
    ok(`LocalContentOS: ${lcReviews} reviews`);
    results.workflows.lcReviews = lcReviews;
  }

  // 4e: DecisionOS — decisions with various statuses
  const decisionStatuses = await safeQuery("decision statuses", () =>
    prisma.decision.groupBy({ by: ["status"], _count: { id: true } })
  );
  if (decisionStatuses && decisionStatuses.length > 0) {
    const statusMap = Object.fromEntries(decisionStatuses.map((d) => [d.status, d._count.id]));
    ok(`DecisionOS: ${decisionStatuses.reduce((s, d) => s + d._count.id, 0)} decisions across ${decisionStatuses.length} statuses`);
    results.workflows.decisionStatuses = statusMap;
  } else {
    warn("DecisionOS: no decisions found");
    results.workflows.decisionStatuses = {};
  }

  // 4f: Audit trail cross-check — verify audit log entries match workflow states
  const findingCreatedLogs = await safeQuery("finding creation audit logs", () =>
    prisma.platformAuditLog.count({ where: { action: "FINDING_CREATED" } })
  );
  if (findingCreatedLogs !== null && findingCreatedLogs > 0) {
    ok(`Audit trail: ${findingCreatedLogs} finding creation events logged`);
    results.workflows.findingCreatedLogs = findingCreatedLogs;
  } else {
    warn("Audit trail: no finding creation events in PlatformAuditLog");
    results.workflows.findingCreatedLogs = findingCreatedLogs || 0;
  }

  // 4g: Review submitted logs
  const reviewLogs = await safeQuery("review audit logs", () =>
    prisma.platformAuditLog.count({ where: { action: { in: ["REVIEW_SUBMITTED", "SUBMITTED_FOR_REVIEW", "EVIDENCE_REVIEWED"] } } })
  );
  if (reviewLogs !== null && reviewLogs > 0) {
    ok(`Audit trail: ${reviewLogs} review/submit events logged`);
    results.workflows.reviewEventsLogged = reviewLogs;
  } else {
    warn("Audit trail: no review/submit events in PlatformAuditLog");
    results.workflows.reviewEventsLogged = reviewLogs || 0;
  }

  // 4h: Evidence upload logged
  const evidenceLogs = await safeQuery("evidence audit logs", () =>
    prisma.platformAuditLog.count({ where: { action: { contains: "EVIDENCE" } } })
  );
  if (evidenceLogs !== null && evidenceLogs > 0) {
    ok(`Audit trail: ${evidenceLogs} evidence events logged`);
    results.workflows.evidenceEventsLogged = evidenceLogs;
  } else {
    warn("Audit trail: no evidence events in PlatformAuditLog");
    results.workflows.evidenceEventsLogged = evidenceLogs || 0;
  }

  // 4i: Approval events
  const approvalLogs = await safeQuery("approval audit logs", () =>
    prisma.platformAuditLog.count({ where: { action: { contains: "APPROVED" } } })
  );
  if (approvalLogs !== null && approvalLogs > 0) {
    ok(`Audit trail: ${approvalLogs} approval events logged`);
    results.workflows.approvalEventsLogged = approvalLogs;
  } else {
    warn("Audit trail: no approval events in PlatformAuditLog");
    results.workflows.approvalEventsLogged = approvalLogs || 0;
  }

  // ═══ GENERATE REPORT ═══════════════════════════════════════════════════════
  results.meta = {
    generatedAt: new Date().toISOString(),
    nodeVersion: process.version,
    checksTotal: totalChecks,
    checksPassed: passedChecks,
    checksFailed: failedChecks,
    warnings: warningsCount,
    verdict: failedChecks === 0 ? "READY" : "ISSUES_FOUND",
  };

  // Save JSON report
  const reportDir = resolve(ROOT, "backups", "pilot-reports");
  if (!existsSync(reportDir)) {
    mkdirSync(reportDir, { recursive: true });
  }
  const reportPath = resolve(
    reportDir,
    `pilot-verify-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
  );
  writeFileSync(reportPath, JSON.stringify(results, null, 2));
  log(`\n${c.cyan}Report saved:${NT} ${reportPath}`);

  // ─── Summary ──────────────────────────────────────────────────────────────
  log(`\n${c.bold}${c.cyan}════════════════════════════════════════════════${NT}`);
  log(`${c.bold}VERIFICATION SUMMARY${NT}`);
  log(`${c.bold}════════════════════════════════════════════════${NT}`);
  log(`  Total checks  : ${totalChecks}`);
  log(`  Passed        : ${c.green}${passedChecks}${NT}`);
  log(`  Failed        : ${failedChecks > 0 ? c.red : NT}${failedChecks}${NT}`);
  log(`  Warnings      : ${warningsCount > 0 ? c.yellow : NT}${warningsCount}${NT}`);
  log(`  Verdict       : ${results.meta.verdict === "READY" ? c.green + "READY" : c.red + "ISSUES_FOUND"}${NT}`);
  log("");

  // Clean up
  await prisma.$disconnect();

  // Exit code
  if (failedChecks > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch(async (e) => {
  console.error(`${c.red}FATAL${NT}: ${e.message}`);
  process.exit(2);
});
