#!/usr/bin/env node
/**
 * Static demo-readiness checks (no running server required).
 * Aligns with docs/operations/customer-demo-runbook.md
 * Includes pgvector/RAG health checks for IC-01 readiness.
 */
import { access, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const errors = [];

async function mustExist(relPath, label) {
  try {
    await access(join(root, relPath));
  } catch {
    errors.push(`Missing ${label}: ${relPath}`);
  }
}

async function mustMatch(relPath, pattern, label) {
  const content = await readFile(join(root, relPath), "utf8");
  if (!pattern.test(content)) {
    errors.push(`${label}: expected pattern not found in ${relPath}`);
  }
}

async function main() {
  const demoRoutes = [
    ["src/app/(marketing)/page.tsx", "marketing home"],
    ["src/app/audit/page.tsx", "AuditOS workspace"],
    ["src/app/audit/engagements/[engagementId]/sampling/page.tsx", "AuditOS sampling"],
    ["src/components/audit/sampling/audit-sampling-form.tsx", "AuditOS sampling form"],
    ["src/app/local-content/page.tsx", "LocalContentOS workspace"],
    ["src/app/auditos/page.tsx", "AuditOS public demo"],
    ["src/app/auditos/trial-balance/page.tsx", "AuditOS demo trial balance"],
    ["src/app/auditos/mapping/page.tsx", "AuditOS demo mapping"],
    ["src/app/auditos/statements/page.tsx", "AuditOS demo statements"],
    ["src/app/auditos/evidence/page.tsx", "AuditOS demo evidence"],
    ["src/app/auditos/traceability/page.tsx", "AuditOS demo traceability"],
    ["src/app/auditos/demo-safety.ts", "AuditOS demo safety sanitizer"],
    ["src/app/auditos/layout.tsx", "AuditOS demo layout banner"],
    ["src/app/(dashboard)/decisions/page.tsx", "DecisionOS list"],
    ["docs/operations/customer-demo-runbook.md", "demo runbook"],
    ["docs/operations/audit-sampling-browser-smoke.md", "sampling browser smoke"],
  ];

  for (const [path, label] of demoRoutes) {
    await mustExist(path, label);
  }

  const marketingEnRoutes = [
    ["src/app/en/procurement-pack/page.tsx", "EN procurement pack"],
    ["src/app/en/start/page.tsx", "EN start hub"],
    ["src/app/en/deployment/page.tsx", "EN deployment"],
    ["src/app/en/products/decision/page.tsx", "EN DecisionOS product"],
    ["src/app/en/products/local-content/page.tsx", "EN LocalContentOS product"],
    ["src/app/print/evaluation-sow-en/page.tsx", "EN evaluation SOW print"],
  ];
  for (const [path, label] of marketingEnRoutes) {
    await mustExist(path, label);
  }

  await mustMatch(
    "src/app/auditos/layout.tsx",
    /Demo Only/,
    "AuditOS demo layout must show Demo Only banner",
  );

  const auditWorkflowRoutes = [
    ["src/app/audit/page.tsx", "AuditOS dashboard"],
    ["src/app/audit/engagements/[engagementId]/exports/page.tsx", "AuditOS exports tab"],
    ["src/app/audit/engagements/[engagementId]/approval/page.tsx", "AuditOS approval tab"],
    ["src/lib/audit/workflow-next-action.ts", "AuditOS workflow next action"],
    ["src/lib/audit/governance/approval-gates.ts", "AuditOS factory approval gates"],
  ];
  for (const [path, label] of auditWorkflowRoutes) {
    await mustExist(path, label);
  }

  const localContentRoutes = [
    ["src/app/local-content/page.tsx", "LocalContentOS dashboard"],
    ["src/app/local-content/projects/page.tsx", "LocalContentOS projects"],
    ["src/app/local-content/pilot-readiness/page.tsx", "LocalContentOS readiness"],
    ["src/app/local-content/projects/[projectId]/approval/page.tsx", "LC project approval"],
    ["src/lib/local-content/workflow-gating.ts", "LC workbook workflow gating"],
    ["src/lib/local-content/pilot-readiness.ts", "LC pilot readiness engine"],
  ];
  for (const [path, label] of localContentRoutes) {
    await mustExist(path, label);
  }

  const decisionRoutes = [
    ["src/app/(dashboard)/decisions/page.tsx", "DecisionOS list"],
    ["src/app/(dashboard)/decisions/[id]/governance/page.tsx", "DecisionOS governance tab"],
    ["src/app/(dashboard)/decisions/[id]/recommendation/page.tsx", "DecisionOS recommendation tab"],
    ["src/lib/decision/decision-engine.ts", "DecisionOS engine"],
  ];
  for (const [path, label] of decisionRoutes) {
    await mustExist(path, label);
  }

  const runbook = await readFile(
    join(root, "docs/operations/customer-demo-runbook.md"),
    "utf8",
  );
  if (runbook.includes("/organizations") && !/Do not include/i.test(runbook)) {
    errors.push(
      "Demo runbook should warn against /organizations in customer demos",
    );
  }
  if (!/Prisma-backed|prisma/i.test(runbook)) {
    errors.push(
      "Demo runbook should document SalesOS persistence truth (Prisma path)",
    );
  }

  const downloadRoutes = [
    "src/app/api/audit/evidence/[evidenceId]/download/route.ts",
    "src/app/api/local-content/projects/[projectId]/evidence/[evidenceId]/download/route.ts",
    "src/app/api/decisions/[decisionId]/evidence/[evidenceId]/download/route.ts",
  ];

  const authPatterns =
    /getCurrentUser|getAuditActor|requireUserContext|requireDecisionAccess|assertProjectAccess|assertEngagementAccess|auth\(/;

  for (const route of downloadRoutes) {
    const content = await readFile(join(root, route), "utf8");
    if (!authPatterns.test(content)) {
      errors.push(`Download route may lack auth: ${route}`);
    }
    if (!/auditLogger|logAudit|recordAudit|enforceAuditRateLimit/.test(content)) {
      errors.push(`Download route may lack audit log: ${route}`);
    }
  }

  // ── pgvector / RAG health checks ──

  await mustExist("scripts/platform/check-pgvector-health.mjs", "pgvector health check script");
  await mustExist("scripts/platform/verify-pgvector-staging.ts", "pgvector verify script");

  const ragLibFiles = [
    ["src/lib/rag/vector-store.ts", "vector-store module"],
    ["src/lib/rag/rag-retriever.ts", "RAG retriever module"],
    ["src/lib/rag/embedding-service.ts", "embedding service module"],
    ["src/lib/rag/chunking-engine.ts", "chunking engine module"],
    ["src/lib/rag/intelligence-core-rag.ts", "governed RAG module"],
    ["src/lib/rag/governed-rag-metrics.ts", "RAG governance metrics module"],
  ];
  for (const [path, label] of ragLibFiles) {
    await mustExist(path, label);
  }

  const ragTestFiles = [
    ["src/__tests__/unit/orchestrator-rag-inject.test.ts", "RAG orchestrator unit tests"],
    ["src/__tests__/unit/knowledge-api.test.ts", "knowledge API / RAG unit tests"],
    ["src/lib/audit/__tests__/audit-ai-bridge.test.ts", "AuditOS AI bridge tests"],
    ["src/lib/platform/__tests__/pgvector-compat.test.ts", "pgvector compat tests"],
    ["src/lib/governance/__tests__/retrieval-validation.test.ts", "governed retrieval tests"],
  ];
  for (const [path, label] of ragTestFiles) {
    await mustExist(path, label);
  }

  await mustExist(
    "src/__tests__/unit/middleware-rate-limit-l014.test.ts",
    "middleware rate-limit tests",
  );
  await mustExist(
    "src/__tests__/cross-tenant-isolation.test.ts",
    "cross-tenant isolation tests",
  );
  await mustExist(
    "src/__tests__/integration/org-scoping.test.ts",
    "org scoping integration tests",
  );

  const migrationsDir = join(root, "prisma/migrations");
  let foundVectorMigration = false;
  try {
    const dirs = await readdir(migrationsDir, { withFileTypes: true });
    for (const ent of dirs) {
      if (!ent.isDirectory()) continue;
      const migrationPath = join(migrationsDir, ent.name, "migration.sql");
      try {
        const sql = await readFile(migrationPath, "utf8");
        if (sql.includes("vector") && sql.includes("DocumentChunk")) {
          foundVectorMigration = true;
          break;
        }
      } catch {
        // skip
      }
    }
  } catch {
    errors.push("prisma/migrations directory missing");
  }
  if (!foundVectorMigration) {
    errors.push(
      "No migration found with pgvector/DocumentChunk (expected IC-01 migration)",
    );
  }

  await mustMatch(
    "src/lib/platform/feature-flags/registry.ts",
    /ai\.rag/,
    "Feature flag registry must have ai.rag entry",
  );

  await mustExist("src/lib/sales/prisma-repository.ts", "SalesOS Prisma repository");
  await mustExist(
    "src/lib/audit/__tests__/audit-sampling-action.test.ts",
    "audit sampling action tests",
  );
  await mustExist(
    "src/lib/audit/__tests__/sampling-engine.test.ts",
    "audit sampling engine tests",
  );
  await mustExist("src/app/api/scim/v2/Users/route.ts", "SCIM Users API");
  await mustExist("src/lib/auth/sso-service.ts", "SSO provider service");
  await mustExist(
    "prisma/migrations/20260608120000_l0_05_sso_scim/migration.sql",
    "L0-05 SSO/SCIM migration",
  );

  if (errors.length) {
    console.error("Demo smoke check FAILED:\n");
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(
    "Demo smoke check passed (static routes + governance patterns + pgvector/RAG checks).",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
