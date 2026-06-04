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
    ["src/app/local-content/page.tsx", "LocalContentOS workspace"],
    ["src/app/auditos/page.tsx", "AuditOS public demo"],
    ["src/app/(dashboard)/decisions/page.tsx", "DecisionOS list"],
    ["docs/operations/customer-demo-runbook.md", "demo runbook"],
  ];

  for (const [path, label] of demoRoutes) {
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

  await mustExist("scripts/check-pgvector-health.mjs", "pgvector health check script");
  await mustExist("scripts/verify-pgvector-staging.ts", "pgvector verify script");

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
