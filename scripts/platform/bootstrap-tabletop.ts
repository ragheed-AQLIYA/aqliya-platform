#!/usr/bin/env tsx
/**
 * Phase 29 — Tabletop environment bootstrap.
 *
 * Prepares local DB for human tabletop exercise:
 * PROMOTED → BIND → APPROVE → RELEASE → VERIFY → ACTIVATE
 *
 * Usage:
 *   tsx -r ./scripts/mock-server-only.cjs -r ./scripts/platform/bootstrap-auth-mock.cjs scripts/platform/bootstrap-tabletop.ts
 */
import { resolve, join } from "path";
import { writeFileSync, mkdirSync } from "fs";
import { execSync } from "child_process";
import "dotenv/config";
import { setBootstrapUser } from "./bootstrap-auth-mock.cjs";
import { prisma } from "../db-utils/prisma.mjs";
import { seedKnowledgeMining } from "../../prisma/seed-knowledge-mining";
import { CANONICAL_COA_ACCOUNTS } from "@/lib/audit/coa/canonical-coa";
import { batchPromoteCandidates } from "@/lib/tb-intelligence/knowledge-mining/promotion-service";
import {
  createVersion,
  approveVersion,
  activateVersion,
} from "@/lib/knowledge-foundation/kf-service";
import { generateReleasePackage } from "@/lib/knowledge-foundation/release-generator";
import { verifyReleaseIntegrity } from "@/lib/knowledge-foundation/release-integrity";
const VERSION_NUMBER = "1.0.0";
const REPORT_PATH = join(
  process.cwd(),
  "docs/deliverables/TABLETOP_BOOTSTRAP_REPORT.md",
);

const REQUIRED_TABLES = [
  "KnowledgeFoundationVersion",
  "KnowledgeFoundationRelease",
  "KnowledgeFoundationVersionCandidate",
  "KnowledgeCandidate",
];

const PENDING_MIGRATIONS = [
  "20260616234035_add_lc_v35_grounding_feedback",
  "20260618015723_add_institutional_memory",
  "20260621120430_r04_salesos_schema_alignment",
  "20260621120611_r04_salesdeal_extra_fields",
  "20260621150000_platform_outbox_event",
  "20260621180000_core_evidence_platform",
  "20260622000000_add_knowledge_candidate_createdById",
  "20270622100000_knowledge_foundation_versioning",
  "20270622110000_knowledge_foundation_version_candidate_bridge",
  "20270622120000_knowledge_foundation_release_provenance",
  "20270622130000_knowledge_foundation_release_artifact_status",
  "20270622140000_knowledge_foundation_release_trust_chain",
];

type BootstrapUser = {
  id: string;
  email: string;
  role: string;
  name: string | null;
};

type StepEvidence = {
  step: string;
  status: "PASS" | "FAIL" | "SKIP";
  detail: string;
};

const evidence: StepEvidence[] = [];
const blockers: string[] = [];

function record(step: string, status: StepEvidence["status"], detail: string) {
  evidence.push({ step, status, detail });
  console.log(`[${status}] ${step}: ${detail}`);
  if (status === "FAIL") blockers.push(`${step}: ${detail}`);
}

async function tableExists(name: string): Promise<boolean> {
  const rows = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = $1
    ) AS exists`,
    name,
  );
  return Boolean(rows[0]?.exists);
}

async function applyMinimalSchema() {
  execSync("npx prisma db execute --file scripts/platform/tabletop-minimal-schema.sql", {
    stdio: "inherit",
    cwd: process.cwd(),
  });
  record("schema.apply", "PASS", "tabletop-minimal-schema.sql executed");
}

async function resolvePendingMigrations() {
  for (const migration of PENDING_MIGRATIONS) {
    try {
      execSync(`npx prisma migrate resolve --applied ${migration}`, {
        stdio: "pipe",
        cwd: process.cwd(),
      });
      record("migration.resolve", "PASS", migration);
    } catch {
      record("migration.resolve", "SKIP", `${migration} (already applied or not pending)`);
    }
  }
}

async function ensureCanonicalAccounts() {
  const requiredCodes = ["CA-5020", "CA-5050", "CA-2050", "CA-2020", "CA-5060"];
  const existing = await prisma.auditCanonicalAccount.findMany({
    where: { code: { in: requiredCodes } },
    select: { code: true },
  });
  const have = new Set(existing.map((r) => r.code));
  const missing = requiredCodes.filter((c) => !have.has(c));

  if (missing.length === 0) {
    record("canonical.accounts", "SKIP", "required canonical accounts present");
    return;
  }

  for (const code of missing) {
    const row = CANONICAL_COA_ACCOUNTS.find((a) => a.code === code);
    if (!row) {
      record("canonical.accounts", "FAIL", `missing COA definition for ${code}`);
      return;
    }
    await prisma.auditCanonicalAccount.create({ data: row });
  }

  record(
    "canonical.accounts",
    "PASS",
    `created ${missing.length} canonical accounts (${missing.join(", ")})`,
  );
}

async function ensureMiningCandidates(platformOrgId: string) {
  const count = await prisma.knowledgeCandidate.count();
  if (count > 0) {
    record("seed.mining", "SKIP", `${count} candidates already present`);
    return;
  }

  await seedKnowledgeMining(prisma, platformOrgId);
  const after = await prisma.knowledgeCandidate.count();
  record("seed.mining", after > 0 ? "PASS" : "FAIL", `${after} candidates seeded`);
}

async function loadActors(): Promise<{
  admin: BootstrapUser;
  operator: BootstrapUser;
  platformOrgId: string;
}> {
  const [admin, operator, platformOrg] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { email: "admin@aqliya.com" },
      select: { id: true, email: true, role: true, name: true },
    }),
    prisma.user.findUniqueOrThrow({
      where: { email: "sara@aqliya.com" },
      select: { id: true, email: true, role: true, name: true },
    }),
    prisma.organization.findFirst({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!platformOrg) {
    throw new Error("No organization found — seed users/org first");
  }

  return { admin, operator, platformOrgId: platformOrg.id };
}

async function resetFailedBootstrapVersion() {
  const existing = await prisma.knowledgeFoundationVersion.findFirst({
    where: { versionNumber: VERSION_NUMBER },
    select: { id: true, status: true },
  });

  if (!existing) return { done: false, versionId: null };

  if (existing.status === "ACTIVE") {
    const integrity = await verifyReleaseIntegrity(existing.id, {
      actorId: "bootstrap",
      emitAudit: false,
      versionNumber: VERSION_NUMBER,
      forActivation: true,
    });
    if (integrity.valid) {
      record("lifecycle", "SKIP", `v${VERSION_NUMBER} already ACTIVE with valid integrity`);
      return { done: true, versionId: existing.id };
    }
  }

  await prisma.knowledgeFoundationRelease.deleteMany({
    where: { versionId: existing.id },
  });
  await prisma.knowledgeFoundationVersionCandidate.deleteMany({
    where: { versionId: existing.id },
  });
  await prisma.knowledgeFoundationVersion.delete({ where: { id: existing.id } });

  record("lifecycle.reset", "PASS", `removed incomplete v${VERSION_NUMBER}`);
  return { done: false, versionId: null };
}

async function runLifecycle(admin: BootstrapUser, operator: BootstrapUser) {
  let promoted = await prisma.knowledgeCandidate.findMany({
    where: { status: "PROMOTED" },
    select: { id: true },
    take: 10,
  });

  if (promoted.length < 2) {
    const approved = await prisma.knowledgeCandidate.findMany({
      where: { status: "APPROVED" },
      select: { id: true, candidatePhrase: true },
      take: 10,
    });

    if (approved.length < 2) {
      record(
        "promote",
        "FAIL",
        `need >=2 APPROVED or PROMOTED candidates; APPROVED=${approved.length}, PROMOTED=${promoted.length}`,
      );
      return null;
    }

    setBootstrapUser(operator);
    const promotion = await batchPromoteCandidates({
      promotedBy: operator.id,
      artifactType: "candidate-synonyms",
      notes: "Phase 29 tabletop bootstrap promotion",
    });

    promoted = await prisma.knowledgeCandidate.findMany({
      where: { status: "PROMOTED" },
      select: { id: true },
      take: 10,
    });

    record(
      "promote",
      promoted.length >= 2 ? "PASS" : "FAIL",
      `batch promoted ${promotion.promoted}; pool PROMOTED=${promoted.length}`,
    );
  } else {
    record(
      "promote",
      "SKIP",
      `${promoted.length} PROMOTED candidates already available`,
    );
  }

  const boundIds = await prisma.knowledgeFoundationVersionCandidate.findMany({
    select: { candidateId: true },
  });
  const boundSet = new Set(boundIds.map((b) => b.candidateId));
  const unboundPromoted = promoted.filter((p) => !boundSet.has(p.id));

  if (unboundPromoted.length < 2) {
    record(
      "promote",
      "FAIL",
      `need >=2 unbound PROMOTED candidates, found ${unboundPromoted.length}`,
    );
    return null;
  }

  promoted = unboundPromoted.slice(0, 2);

  setBootstrapUser(operator);
  const version = await createVersion({
    versionNumber: VERSION_NUMBER,
    notes: "Phase 29 tabletop bootstrap v1.0.0",
    createdById: operator.id,
    candidateIds: promoted.map((p) => p.id),
  });
  record("bind", "PASS", `v${VERSION_NUMBER} created (${version.id}) with 2 PROMOTED bindings`);

  setBootstrapUser(admin);
  await approveVersion({
    versionId: version.id,
    approvedById: admin.id,
    notes: "Tabletop bootstrap approval",
  });
  record("approve", "PASS", `v${VERSION_NUMBER} APPROVED`);

  setBootstrapUser(operator);
  await generateReleasePackage({
    versionId: version.id,
    versionNumber: VERSION_NUMBER,
    actorId: operator.id,
    releaseNotes: "Tabletop bootstrap release package",
  });
  record("release", "PASS", `v${VERSION_NUMBER} RELEASED with artifacts`);

  const integrity = await verifyReleaseIntegrity(version.id, {
    actorId: admin.id,
    emitAudit: true,
    versionNumber: VERSION_NUMBER,
    forActivation: true,
  });

  record(
    "verify",
    integrity.valid ? "PASS" : "FAIL",
    integrity.valid
      ? `integrity OK (releaseId=${integrity.releaseId})`
      : integrity.blockers.join("; "),
  );

  if (!integrity.valid) return null;

  setBootstrapUser(admin);
  const active = await activateVersion({ versionId: version.id });
  record(
    "activate",
    active.status === "ACTIVE" ? "PASS" : "FAIL",
    `status=${active.status}, activatedAt=${active.activatedAt?.toISOString() ?? "null"}`,
  );

  return version.id;
}

function writeReport(args: {
  tabletopReady: boolean;
  versionId: string | null;
  migrations: string[];
}) {
  mkdirSync(join(process.cwd(), "docs/deliverables"), { recursive: true });

  const lines = [
    "# Phase 29 — Tabletop Bootstrap Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Verdict",
    "",
    `\`\`\`text`,
    `TABLETOP_READY = ${args.tabletopReady ? "YES" : "NO"}`,
    `\`\`\``,
    "",
    args.tabletopReady
      ? "Local environment is ready for human tabletop execution."
      : "Bootstrap incomplete — resolve blockers before scheduling tabletop.",
    "",
    "## Environment",
    "",
    "- Database: local PostgreSQL (`DATABASE_URL` from `.env`)",
    "- Remote staging: **NOT VERIFIED** (DNS probe previously failed for staging.aqliya.com)",
    "- Schema path: `scripts/platform/tabletop-minimal-schema.sql` (drift recovery when full migrate deploy blocked)",
    "",
    "## Migrations",
    "",
    "Applied via minimal schema SQL + migrate resolve for pending history:",
    "",
    ...args.migrations.map((m) => `- \`${m}\``),
    "",
    "## Tables Verified",
    "",
    ...REQUIRED_TABLES.map((t) => `- \`${t}\``),
    "",
    "## Lifecycle Evidence",
    "",
    "| Step | Status | Detail |",
    "|------|--------|--------|",
    ...evidence.map((e) => `| ${e.step} | ${e.status} | ${e.detail.replace(/\|/g, "\\|")} |`),
    "",
    "## Version",
    "",
    `- Version number: \`${VERSION_NUMBER}\``,
    `- Version id: \`${args.versionId ?? "n/a"}\``,
    "",
    "## Blockers",
    "",
    blockers.length === 0
      ? "_None_"
      : blockers.map((b) => `- ${b}`).join("\n"),
    "",
    "## Next Step",
    "",
    args.tabletopReady
      ? "Schedule human tabletop using `docs/operations/knowledge-foundation/TABLETOP_GOVERNANCE_EXERCISE.md` — do **not** skip Exit Gate record templates."
      : "Fix blockers, rerun `npm run platform:bootstrap-tabletop`, then re-verify with `node scripts/platform/tabletop-db-probe.mjs`.",
    "",
  ];

  writeFileSync(REPORT_PATH, lines.join("\n"), "utf8");
  console.log(`\nReport written: ${REPORT_PATH}`);
}

async function main() {
  console.log("\n=== Phase 29 Tabletop Bootstrap ===\n");

  for (const table of REQUIRED_TABLES) {
    const ok = await tableExists(table);
    if (!ok) {
      record("tables.verify", "FAIL", `${table} missing — applying minimal schema`);
      await applyMinimalSchema();
      break;
    }
  }

  const tablesOk = await Promise.all(REQUIRED_TABLES.map(tableExists));
  if (tablesOk.every(Boolean)) {
    record("tables.verify", "PASS", REQUIRED_TABLES.join(", "));
  } else {
    record(
      "tables.verify",
      "FAIL",
      `missing: ${REQUIRED_TABLES.filter((_, i) => !tablesOk[i]).join(", ")}`,
    );
  }

  await resolvePendingMigrations();

  const { admin, operator, platformOrgId } = await loadActors();
  record("actors", "PASS", `admin=${admin.email}, operator=${operator.email}`);

  await ensureCanonicalAccounts();
  await ensureMiningCandidates(platformOrgId);

  const reset = await resetFailedBootstrapVersion();
  let versionId: string | null = reset.versionId;

  if (!reset.done) {
    versionId = await runLifecycle(admin, operator);
  }

  const activeVersion = await prisma.knowledgeFoundationVersion.findFirst({
    where: { status: "ACTIVE", versionNumber: VERSION_NUMBER },
    select: { id: true, activatedAt: true },
  });

  const tabletopReady =
    blockers.length === 0 &&
    Boolean(activeVersion) &&
    Boolean(activeVersion?.activatedAt);

  writeReport({
    tabletopReady,
    versionId: versionId ?? activeVersion?.id ?? null,
    migrations: PENDING_MIGRATIONS,
  });

  console.log(`\nTABLETOP_READY = ${tabletopReady ? "YES" : "NO"}`);
  if (blockers.length > 0) {
    console.log("Blockers:");
    for (const b of blockers) console.log(`  - ${b}`);
    process.exit(1);
  }
}

main()
  .catch((err) => {
    record("bootstrap", "FAIL", err instanceof Error ? err.message : String(err));
    writeReport({ tabletopReady: false, versionId: null, migrations: PENDING_MIGRATIONS });
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
