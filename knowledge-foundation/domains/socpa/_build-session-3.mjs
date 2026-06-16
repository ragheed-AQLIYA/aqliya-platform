/**
 * Session 3 — ingest SOCPA via admission workflow (no RAG).
 * Run: node knowledge-foundation/domains/socpa/_build-session-3.mjs
 */
import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { SESSION3_STANDARDS } from "./_session-3-data.mjs";
import { ingestSocpa } from "./_session-shared-socpa.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const GOV = join(__dirname, "../../governance");
const fs = { mkdirSync, writeFileSync };

const ingested = SESSION3_STANDARDS.map((std) => ingestSocpa(std, __dirname, fs));
const ingestedIds = new Set(ingested.map((i) => i.catalogId));

const backlog = JSON.parse(readFileSync(join(GOV, "priority-ingestion-backlog.json"), "utf8"));
for (const item of backlog.priority1.items) {
  if (ingestedIds.has(item.backlogId)) {
    item.status = "ingested-staging";
    item.admissionWorkflowStage = "ingestion";
    item.ingestedAt = "2026-06-09";
    item.session = "3";
  }
}
backlog.meta.session3 = { completedAt: "2026-06-09", ingestedCount: ingested.length };
backlog.meta.priority1IngestionComplete = true;
backlog.meta.programPausePoint = "sessions-1-3-complete";
writeFileSync(join(GOV, "priority-ingestion-backlog.json"), JSON.stringify(backlog, null, 2) + "\n");

const catalog = JSON.parse(readFileSync(join(GOV, "master-knowledge-catalog.json"), "utf8"));
for (const entry of catalog.entries) {
  if (ingestedIds.has(entry.catalogId)) entry.status = "ingested-staging";
}
catalog.meta.session3 = { status: "complete-staging", ingestedStandards: ingested.length, date: "2026-06-09" };
catalog.meta.sessions1to3 = { status: "complete-staging", totalStandards: 32 + 16 + ingested.length };
writeFileSync(join(GOV, "master-knowledge-catalog.json"), JSON.stringify(catalog, null, 2) + "\n");

const manifest = {
  meta: {
    session: "3",
    date: "2026-06-09",
    status: "ingested-staging",
    jurisdiction: "saudi-arabia",
    ragUsed: false,
    programPause: "Sessions 1–3 complete — Priority 2 blocked",
  },
  standards: ingested,
  totals: { standards: ingested.length, rules: ingested.reduce((s, i) => s + i.ruleCount, 0), overlays: ingested.filter((i) => i.hasOverlay).length },
  sessions1to3Summary: { session1: 32, session2: 16, session3: ingested.length, total: 32 + 16 + ingested.length },
};
writeFileSync(join(GOV, "session-3-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

console.log(`Session 3: ingested ${ingested.length} SOCPA assets`);
manifest.totals.rules && console.log(`  Rules: ${manifest.totals.rules} | Overlays: ${manifest.totals.overlays}`);
console.log(`Sessions 1–3 TOTAL: ${manifest.sessions1to3Summary.total} standards in staging`);
