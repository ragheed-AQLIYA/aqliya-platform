/**
 * Session 1 Wave 1 — ingest priority IFRS/IAS standards via admission workflow (no RAG).
 * Run: node knowledge-foundation/domains/ifrs/_build-session-1-wave1.mjs
 */
import { mkdirSync, writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { WAVE1_STANDARDS } from "./_session-1-wave1-data.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const GOV = join(__dirname, "../../governance");

const COMMON = {
  charterVersion: "1.0",
  authorityId: "ifrs-foundation",
  authorityLevel: "A",
  licenseId: "ifrs-foundation-standard",
  domain: "accounting",
  subdomain: "ifrs-standards",
  jurisdiction: "global",
  producedBy: "session-1-ingestion",
  ingestionMethod: "structured-json",
  validationStatus: "pending-review",
  reviewStatus: "pending",
  admissionWorkflowStage: "ingestion",
  storageTier: "ingestion-staging",
  ragIngest: false,
  vectorIndex: false,
};

function buildAsset(std) {
  return {
    meta: {
      ...COMMON,
      assetId: std.assetId,
      assetType: "A",
      standardCode: std.standardCode,
      standardName: std.standardName,
      versionLabel: std.versionLabel,
      issueDate: std.issueDate,
      effectiveDate: std.effectiveDate,
      supersededDate: null,
      status: "current",
      sourceUrl: std.sourceUrl,
      sourceOwner: "IFRS Foundation",
      catalogId: `kf-acct-ifrs-${std.slug}`,
      session: "1",
      attribution: ["© IFRS Foundation"],
      disclaimer:
        "Structured rule extracts for governance admission. Requires KNOWLEDGE_REVIEWER approval before production use. Not a substitute for the authoritative standard text.",
    },
    ontology: {
      domain: "accounting",
      subdomain: "ifrs-standards",
      entity: "standard",
      relationship: "implements",
      authority: "ifrs-foundation",
      usage: "tb-intelligence",
    },
    engines: ["tb-intelligence", "mapping-engine", "disclosure-engine", "accounting-intelligence"],
    lineage: {
      lineageId: null,
      lineageParentId: null,
      upstreamAssetIds: [],
      note: "Lineage assigned at reviewer approval — source document is this asset",
    },
    confidence: {
      authorityLevel: "A",
      validationStatus: "pending-review",
      versionStatus: "current",
      reviewStatus: "pending",
      confidenceScore: 69,
      note: "Capped at 69 until KNOWLEDGE_REVIEWER validates paragraph citations",
    },
    licensing: {
      licenseId: "ifrs-foundation-standard",
      linking: "permitted",
      cataloging: "permitted-with-attribution",
      referencing: "permitted-with-attribution",
      embedding: "restricted-review-required",
      redistribution: "prohibited",
      commercialUse: "restricted-review-required",
    },
  };
}

function buildRules(std) {
  return {
    meta: {
      ...COMMON,
      assetId: `${std.assetId}-rules`,
      assetType: "A",
      parentAssetId: std.assetId,
      standardCode: std.standardCode,
      versionLabel: std.versionLabel,
      ruleCount: std.rules.length,
      executableRules: true,
      llmGenerated: false,
      humanApprovalRequired: true,
    },
    rules: std.rules.map((r) => ({
      ...r,
      assetType: "A",
      lineageParentId: std.assetId,
      confidenceScore: 69,
      validationStatus: "pending-review",
      ontology: {
        domain: "accounting",
        subdomain: "ifrs-standards",
        entity: "standard",
        relationship: "implements",
        authority: "ifrs-foundation",
        usage: "mapping-engine",
      },
    })),
  };
}

function buildGuidance(std) {
  return {
    meta: {
      ...COMMON,
      assetId: `${std.assetId}-guidance`,
      assetType: "B",
      parentAssetId: std.assetId,
      standardCode: std.standardCode,
      versionLabel: std.versionLabel,
      guidanceCount: std.guidance.length,
      executableRules: false,
    },
    guidance: std.guidance.map((g) => ({
      ...g,
      assetType: "B",
      lineageParentId: std.assetId,
      confidenceScore: 69,
      validationStatus: "pending-review",
      ontology: {
        domain: "accounting",
        subdomain: "ifrs-standards",
        entity: "interpretation",
        relationship: "implements",
        authority: "ifrs-foundation",
        usage: "disclosure-engine",
      },
    })),
  };
}

function buildAdmissionRecord(std) {
  return {
    catalogId: `kf-acct-ifrs-${std.slug}`,
    standardCode: std.standardCode,
    workflowSequence: [
      "source",
      "ingestion",
      "validation",
      "authorityCheck",
      "licensingCheck",
      "confidenceAssignment",
      "lineageAssignment",
      "reviewerApproval",
      "productionAdmission",
    ],
    currentStage: "ingestion",
    stageResults: {
      source: { status: "pass", timestamp: "2026-06-09" },
      ingestion: { status: "complete", timestamp: "2026-06-09", stagingPath: `knowledge-foundation/domains/ifrs/${std.slug}/` },
      validation: { status: "pending" },
      authorityCheck: { status: "pending", authorityLevel: "A", executableRulePermitted: true },
      licensingCheck: { status: "pending", licenseId: "ifrs-foundation-standard", embeddingPermitted: false },
      confidenceAssignment: { status: "pending", confidenceScore: 69, productionEligible: false },
      lineageAssignment: { status: "pending" },
      reviewerApproval: { status: "pending", requiredRole: "KNOWLEDGE_REVIEWER" },
      productionAdmission: { status: "blocked", reason: "pending-review" },
    },
    blockedTechnologies: ["RAG", "Ollama", "Fine-tuning", "Vector DB"],
  };
}

const ingested = [];

for (const std of WAVE1_STANDARDS) {
  const dir = join(__dirname, std.slug);
  mkdirSync(dir, { recursive: true });

  writeFileSync(join(dir, "asset.json"), JSON.stringify(buildAsset(std), null, 2) + "\n");
  writeFileSync(join(dir, "rules.json"), JSON.stringify(buildRules(std), null, 2) + "\n");
  writeFileSync(join(dir, "guidance.json"), JSON.stringify(buildGuidance(std), null, 2) + "\n");
  writeFileSync(join(dir, "admission-record.json"), JSON.stringify(buildAdmissionRecord(std), null, 2) + "\n");

  ingested.push({
    slug: std.slug,
    catalogId: `kf-acct-ifrs-${std.slug}`,
    standardCode: std.standardCode,
    ruleCount: std.rules.length,
    guidanceCount: std.guidance.length,
  });
}

// Update backlog statuses for wave 1
const backlogPath = join(GOV, "priority-ingestion-backlog.json");
const backlog = JSON.parse(readFileSync(backlogPath, "utf8"));
const wave1Ids = new Set(ingested.map((i) => i.catalogId));

for (const item of backlog.priority1.items) {
  if (wave1Ids.has(item.backlogId)) {
    item.status = "ingested-staging";
    item.admissionWorkflowStage = "ingestion";
    item.ingestedAt = "2026-06-09";
  }
}
backlog.meta.session1Wave1 = { completedAt: "2026-06-09", ingestedCount: ingested.length, slugs: ingested.map((i) => i.slug) };
writeFileSync(backlogPath, JSON.stringify(backlog, null, 2) + "\n");

// Update catalog statuses
const catalogPath = join(GOV, "master-knowledge-catalog.json");
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
for (const entry of catalog.entries) {
  if (wave1Ids.has(entry.catalogId)) {
    entry.status = "ingested-staging";
  }
}
catalog.meta.session1Wave1 = { status: "in-progress", ingestedStandards: ingested.length, date: "2026-06-09" };
writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n");

// Session 1 manifest
const manifest = {
  meta: {
    session: "1",
    wave: 1,
    date: "2026-06-09",
    status: "ingested-staging",
    ragUsed: false,
    vectorDbUsed: false,
    productionAdmission: false,
    reviewerApprovalRequired: true,
  },
  standards: ingested,
  nextWave: "Remaining Priority 1 IFRS/IAS/IFRIC catalog entries",
  admissionWorkflowRef: "knowledge-foundation/governance/knowledge-admission-workflow.json",
};
writeFileSync(join(GOV, "session-1-wave1-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

console.log(`Session 1 Wave 1: ingested ${ingested.length} standards to staging`);
ingested.forEach((i) => console.log(`  - ${i.standardCode}: ${i.ruleCount} rules, ${i.guidanceCount} guidance`));
