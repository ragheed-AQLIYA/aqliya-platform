/**
 * Session 4 — ingest LCGPA + verification matrix (no RAG).
 * Run: node knowledge-foundation/domains/local-content/_build-session-4.mjs
 */
import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { SESSION4_ASSETS } from "./_session-4-data.mjs";
import { ingestLocalContent } from "./_session-shared-local-content.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const GOV = join(__dirname, "../../governance");
const fs = { mkdirSync, writeFileSync };

const ingested = SESSION4_ASSETS.map((std) => ingestLocalContent(std, __dirname, fs));
const ingestedIds = new Set(ingested.map((i) => i.catalogId));

const backlog = JSON.parse(readFileSync(join(GOV, "priority-ingestion-backlog.json"), "utf8"));
backlog.priority2.admissionStatus = "partial";
backlog.priority2.unblockedAt = "2026-06-09";
backlog.priority2.unblockReason = "Sessions 1–3 complete + production admission batch";
for (const item of backlog.priority2.items) {
  if (ingestedIds.has(item.backlogId) || item.standardCode === "LCGPA-RULES" || item.standardCode === "LC-VERIFICATION-MATRIX") {
    if (item.standardCode === "LCGPA-RULES") {
      item.status = "ingested-staging";
      item.admissionWorkflowStage = "ingestion";
      item.ingestedAt = "2026-06-09";
      item.session = "4";
      delete item.blockedReason;
    }
  }
}
backlog.meta.session4 = { startedAt: "2026-06-09", ingestedCount: ingested.length, status: "ingested-staging" };
backlog.meta.programPausePoint = "session-4-lcgpa-staging";
writeFileSync(join(GOV, "priority-ingestion-backlog.json"), JSON.stringify(backlog, null, 2) + "\n");

const catalog = JSON.parse(readFileSync(join(GOV, "master-knowledge-catalog.json"), "utf8"));
const newEntries = [
  {
    catalogId: "kf-lc-lcgpa-rules",
    domain: "local-content",
    subdomain: "lcgpa-rules",
    authority: "lcgpa",
    authorityLevel: "A",
    assetType: "A",
    storageTier: "ingestion-staging",
    lineageRequirements: catalog.policyTemplates.lineageA,
    versionPolicy: catalog.policyTemplates.versionA ?? catalog.entries[2].versionPolicy,
    confidencePolicy: {
      artifactRef: "knowledge-foundation/artifacts/knowledge-confidence-model.json",
      authorityLevel: "A",
      indicativeRange: { min: 95, max: 100 },
      executableRuleMinimum: 95,
      llmGeneratedContentCap: 69,
    },
    licensingStatus: { licenseId: "lcgpa-standard", embedding: "restricted-review-required", redistribution: "prohibited" },
    repositoryPath: "knowledge-foundation/domains/local-content/lcgpa/",
    engines: ["local-content-intelligence", "supplier-classification", "spend-analysis"],
    priority: 2,
    session: "4",
    standardCode: "LCGPA-RULES",
    jurisdiction: "saudi-arabia",
    status: "ingested-staging",
    ontology: { entity: "regulation", relationship: "governs", usage: "local-content-intelligence" },
  },
  {
    catalogId: "kf-lc-verification-matrix",
    domain: "local-content",
    subdomain: "verification-procedures",
    authority: "lcgpa",
    authorityLevel: "A",
    assetType: "D",
    storageTier: "ingestion-staging",
    lineageRequirements: catalog.policyTemplates.lineageD,
    versionPolicy: catalog.entries[2].versionPolicy,
    confidencePolicy: catalog.entries[2].confidencePolicy,
    licensingStatus: { licenseId: "lcgpa-standard", embedding: "restricted-review-required", redistribution: "prohibited" },
    repositoryPath: "knowledge-foundation/domains/local-content/verification-matrix/",
    engines: ["local-content-intelligence", "evidence-catalog", "audit-intelligence"],
    priority: 2,
    session: "4",
    standardCode: "LC-VERIFICATION-MATRIX",
    jurisdiction: "saudi-arabia",
    status: "ingested-staging",
    ontology: { entity: "verification-procedure", relationship: "requires-evidence", usage: "evidence-catalog" },
  },
];
for (const entry of newEntries) {
  if (!catalog.entries.find((e) => e.catalogId === entry.catalogId)) {
    catalog.entries.push(entry);
  } else {
    const idx = catalog.entries.findIndex((e) => e.catalogId === entry.catalogId);
    catalog.entries[idx] = { ...catalog.entries[idx], ...entry, status: "ingested-staging" };
  }
}
catalog.meta.entryCount = catalog.entries.length;
catalog.meta.session4 = { status: "ingested-staging", ingestedAssets: ingested.length, date: "2026-06-09" };
writeFileSync(join(GOV, "master-knowledge-catalog.json"), JSON.stringify(catalog, null, 2) + "\n");

const manifest = {
  meta: {
    session: "4",
    date: "2026-06-09",
    status: "ingested-staging",
    jurisdiction: "saudi-arabia",
    ragUsed: false,
    programNote: "Priority 2 LCGPA wave — verification matrix sourced from Local_Content_Verification_Audit_Matrix_v1.xlsx",
  },
  assets: ingested,
  totals: {
    assets: ingested.length,
    rules: ingested.reduce((s, i) => s + i.ruleCount, 0),
    procedures: ingested.reduce((s, i) => s + i.procedureCount, 0),
  },
  crossReferences: {
    isrs4400: "agreed-upon-procedures-baseline",
    lcgpaRules: "1-4661-21",
    upstreamSocpa: "kf-socpa-socpa-ifrs-adoption",
  },
};
writeFileSync(join(GOV, "session-4-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

console.log(`Session 4: ingested ${ingested.length} local-content assets`);
console.log(`  Rules: ${manifest.totals.rules} | Procedures: ${manifest.totals.procedures}`);
