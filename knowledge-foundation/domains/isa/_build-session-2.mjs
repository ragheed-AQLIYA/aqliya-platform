/**
 * Session 2 — ingest ISA / ISQM via admission workflow (no RAG).
 * Run: node knowledge-foundation/domains/isa/_build-session-2.mjs
 */
import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { SESSION2_STANDARDS } from "./_session-2-data.mjs";
import { ingestAuditStandard } from "./_session-shared-audit.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ISQM_DIR = join(__dirname, "../isqm");
const ISA_DIR = __dirname;
const GOV = join(__dirname, "../../governance");

const fs = { mkdirSync, writeFileSync };

const ingested = SESSION2_STANDARDS.map((std) => {
  const baseDir = std.subdomain === "isqm" ? ISQM_DIR : ISA_DIR;
  return ingestAuditStandard(std, baseDir, fs, "2");
});

const ingestedIds = new Set(ingested.map((i) => i.catalogId));

// Update backlog
const backlogPath = join(GOV, "priority-ingestion-backlog.json");
const backlog = JSON.parse(readFileSync(backlogPath, "utf8"));
for (const item of backlog.priority1.items) {
  if (ingestedIds.has(item.backlogId)) {
    item.status = "ingested-staging";
    item.admissionWorkflowStage = "ingestion";
    item.ingestedAt = "2026-06-09";
    item.session = "2";
  }
}
backlog.meta.session2 = {
  completedAt: "2026-06-09",
  ingestedCount: ingested.length,
  slugs: ingested.map((i) => i.slug),
};
writeFileSync(backlogPath, JSON.stringify(backlog, null, 2) + "\n");

// Update catalog
const catalogPath = join(GOV, "master-knowledge-catalog.json");
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
for (const entry of catalog.entries) {
  if (ingestedIds.has(entry.catalogId)) {
    entry.status = "ingested-staging";
    entry.sessionIngested = "2";
  }
}
catalog.meta.session2 = {
  status: "complete-staging",
  ingestedStandards: ingested.length,
  date: "2026-06-09",
};
writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n");

const manifest = {
  meta: {
    session: "2",
    date: "2026-06-09",
    status: "ingested-staging",
    ragUsed: false,
    vectorDbUsed: false,
    productionAdmission: false,
    reviewerApprovalRequired: true,
  },
  standards: ingested,
  totals: {
    standards: ingested.length,
    rules: ingested.reduce((s, i) => s + i.ruleCount, 0),
    procedures: ingested.reduce((s, i) => s + i.procedureCount, 0),
  },
  crossDomainLinks: [
    { from: "ISA 540", to: ["IAS 36", "IFRS 9"] },
    { from: "ISA 570", to: ["IAS 1"] },
  ],
  admissionWorkflowRef: "knowledge-foundation/governance/knowledge-admission-workflow.json",
};
writeFileSync(join(GOV, "session-2-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

console.log(`Session 2: ingested ${ingested.length} standards (ISA + ISQM)`);
console.log(`  Rules: ${manifest.totals.rules} | Procedures: ${manifest.totals.procedures}`);
ingested.forEach((i) =>
  console.log(`  - ${i.standardCode}: ${i.ruleCount} rules, ${i.procedureCount} procedures`),
);
