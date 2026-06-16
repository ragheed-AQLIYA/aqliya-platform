/**
 * Session 1 Wave 2 — ingest remaining Priority 1 IFRS/IAS/IFRIC (no RAG).
 * Run: node knowledge-foundation/domains/ifrs/_build-session-1-wave2.mjs
 */
import { mkdirSync, writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { WAVE2_STANDARDS } from "./_session-1-wave2-data.mjs";
import { ingestStandard } from "./_session-1-shared.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const GOV = join(__dirname, "../../governance");
const WAVE = 2;

const fs = { mkdirSync, writeFileSync };
const ingested = WAVE2_STANDARDS.map((std) => ingestStandard(std, WAVE, __dirname, fs));

const wave2Ids = new Set(ingested.map((i) => i.catalogId));

// Update backlog
const backlogPath = join(GOV, "priority-ingestion-backlog.json");
const backlog = JSON.parse(readFileSync(backlogPath, "utf8"));
for (const item of backlog.priority1.items) {
  if (wave2Ids.has(item.backlogId)) {
    item.status = "ingested-staging";
    item.admissionWorkflowStage = "ingestion";
    item.ingestedAt = "2026-06-09";
    item.wave = WAVE;
  }
}
backlog.meta.session1Wave2 = {
  completedAt: "2026-06-09",
  ingestedCount: ingested.length,
  slugs: ingested.map((i) => i.slug),
};
writeFileSync(backlogPath, JSON.stringify(backlog, null, 2) + "\n");

// Update catalog
const catalogPath = join(GOV, "master-knowledge-catalog.json");
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
for (const entry of catalog.entries) {
  if (wave2Ids.has(entry.catalogId)) {
    entry.status = "ingested-staging";
    entry.wave = WAVE;
  }
}
const wave1Count = catalog.meta.session1Wave1?.ingestedStandards ?? 6;
catalog.meta.session1 = {
  status: "wave2-complete-staging",
  wave1Standards: wave1Count,
  wave2Standards: ingested.length,
  totalIngested: wave1Count + ingested.length,
  date: "2026-06-09",
};
writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n");

// Wave 2 manifest
const manifest = {
  meta: {
    session: "1",
    wave: WAVE,
    date: "2026-06-09",
    status: "ingested-staging",
    ragUsed: false,
    vectorDbUsed: false,
    productionAdmission: false,
    reviewerApprovalRequired: true,
    remediationRequired: false,
  },
  standards: ingested,
  totals: {
    standards: ingested.length,
    rules: ingested.reduce((s, i) => s + i.ruleCount, 0),
    guidance: ingested.reduce((s, i) => s + i.guidanceCount, 0),
  },
  session1Complete: {
    accountingPriority1: true,
    note: "All Session 1 Priority 1 IFRS/IAS/IFRIC ingested to staging. Sessions 2–3 (ISA/ISQM/SOCPA) remain.",
  },
  admissionWorkflowRef: "knowledge-foundation/governance/knowledge-admission-workflow.json",
};
writeFileSync(join(GOV, "session-1-wave2-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

console.log(`Session 1 Wave 2: ingested ${ingested.length} standards to staging`);
console.log(`  Rules: ${manifest.totals.rules} | Guidance: ${manifest.totals.guidance}`);
ingested.forEach((i) => console.log(`  - ${i.standardCode}: ${i.ruleCount} rules`));
