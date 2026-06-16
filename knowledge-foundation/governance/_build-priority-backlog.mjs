/**
 * Session 0.5 — builds priority-ingestion-backlog.json from master catalog
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG = JSON.parse(
  readFileSync(join(__dirname, "master-knowledge-catalog.json"), "utf8"),
);
const OUT = join(__dirname, "priority-ingestion-backlog.json");

function standardFamily(code) {
  if (!code) return null;
  const c = code.toUpperCase();
  if (c.startsWith("IFRS") || c.startsWith("IFRIC") || c.startsWith("SIC")) return "IFRS";
  if (c.startsWith("IAS")) return "IAS";
  if (c.startsWith("ISA")) return "ISA";
  if (c.startsWith("ISQM")) return "ISQM";
  if (c.startsWith("SOCPA")) return "SOCPA";
  return null;
}

const P1_FAMILIES = ["IFRS", "IAS", "IFRIC", "ISA", "ISQM", "SOCPA"];

const priority1Items = [];
const excludedFromP1 = [];

for (const e of CATALOG.entries) {
  const family =
    standardFamily(e.standardCode) ||
    (e.standardCode?.includes("IFRIC") ? "IFRIC" : null);
  const ifric = e.standardCode?.toUpperCase().startsWith("IFRIC") ? "IFRIC" : family;

  const resolvedFamily =
    e.standardCode?.toUpperCase().startsWith("IFRIC") ? "IFRIC" : family;

  if (resolvedFamily && P1_FAMILIES.includes(resolvedFamily)) {
    priority1Items.push({
      backlogId: e.catalogId,
      standardFamily: resolvedFamily,
      standardCode: e.standardCode,
      domain: e.domain,
      subdomain: e.subdomain,
      authority: e.authority,
      assetType: e.assetType,
      session: e.session,
      catalogPriority: e.priority,
      repositoryPath: e.repositoryPath,
      status: "authorized-for-ingestion",
      admissionWorkflowStage: "source",
    });
  } else if (e.session !== "0" && e.session !== "0.5") {
    excludedFromP1.push({
      backlogId: e.catalogId,
      standardCode: e.standardCode,
      reason: "outside-priority-1-family",
      blockedUntil: "sessions-1-3-complete",
    });
  }
}

// IFRIC entries from catalog use "IFRIC N" as standardCode — map to IFRIC family
for (const item of priority1Items) {
  if (item.standardCode?.toUpperCase().startsWith("IFRIC")) {
    item.standardFamily = "IFRIC";
  }
}

const priority2Items = [
  {
    backlogId: "kf-p2-lcgpa-rules",
    standardFamily: "LCGPA",
    standardCode: "LCGPA-RULES",
    domain: "local-content",
    subdomain: "lcgpa-rules",
    authority: "lcgpa",
    assetType: "A",
    session: "4+",
    repositoryPath: "knowledge-foundation/domains/local-content/lcgpa/",
    status: "blocked",
    blockedReason: "Priority 2 — not authorized until Sessions 1–3 complete",
    blockedUntil: "sessions-1-3-complete",
  },
  {
    backlogId: "kf-p2-financial-statements",
    standardFamily: "Financial Statements",
    standardCode: "FS-PREPARATION-GOVERNANCE",
    domain: "accounting",
    subdomain: "disclosure",
    authority: "ifrs-foundation",
    assetType: "A",
    session: "post-3",
    repositoryPath: "knowledge-foundation/domains/ifrs/disclosure/",
    status: "blocked",
    blockedReason: "Priority 2 — FS generation layer after authority rules admitted",
    blockedUntil: "sessions-1-3-complete",
    note: "AI Assisted FS Preparation only — never autonomous issuance",
  },
  {
    backlogId: "kf-p2-coa-canonical",
    standardFamily: "COA",
    standardCode: "COA-IFRS-SME",
    domain: "accounting",
    subdomain: "chart-of-accounts",
    authority: "ifrs-foundation",
    assetType: "C",
    session: "post-3",
    repositoryPath: "knowledge-foundation/domains/ifrs/structures/chart-of-accounts/",
    status: "blocked",
    blockedReason: "Priority 2 — structured objects after Priority 1 standards",
    blockedUntil: "sessions-1-3-complete",
    catalogCrossRef: "kf-acct-coa-canonical",
  },
  {
    backlogId: "kf-p2-erp-structures",
    standardFamily: "ERP Structures",
    standardCode: "ERP-MAPPING-LIBRARY",
    domain: "accounting",
    subdomain: "chart-of-accounts",
    authority: "ifrs-foundation",
    assetType: "C",
    session: "post-3",
    repositoryPath: "knowledge-foundation/domains/ifrs/structures/erp/",
    status: "blocked",
    blockedReason: "Priority 2 — ERP mapping libraries after canonical standards",
    blockedUntil: "sessions-1-3-complete",
  },
  {
    backlogId: "kf-p2-firm-memory-tb",
    standardFamily: "COA",
    standardCode: "FIRM-MEMORY-TB-MAPPING",
    domain: "accounting",
    subdomain: "chart-of-accounts",
    authority: "firm-internal",
    assetType: "E",
    session: "post-3",
    repositoryPath: "knowledge-foundation/domains/ifrs/memory/tb-mapping/",
    status: "blocked",
    blockedReason: "Priority 2 — firm memory after COA and Priority 1 standards",
    blockedUntil: "sessions-1-3-complete",
    catalogCrossRef: "kf-acct-firm-memory-mapping",
  },
  {
    backlogId: "kf-p2-audit-procedures",
    standardFamily: "Financial Statements",
    standardCode: "AUDIT-PROCEDURES",
    domain: "audit",
    subdomain: "audit-procedures",
    authority: "iaasb",
    assetType: "D",
    session: "post-3",
    repositoryPath: "knowledge-foundation/domains/isa/operational/procedures/",
    status: "blocked",
    blockedReason: "Priority 2 — operational templates after ISA rules admitted",
    blockedUntil: "sessions-1-3-complete",
    catalogCrossRef: "kf-audit-procedures-library",
  },
];

const backlog = {
  meta: {
    artifactId: "priority-ingestion-backlog",
    schemaVersion: "1.0",
    charterVersion: "1.0",
    session: "0.5",
    charterReference:
      "knowledge-foundation/charter/AQLIYA_KNOWLEDGE_FOUNDATION_CHARTER_v1.0.md",
    governingStatement:
      "This Foundation shall always privilege authoritative professional judgment over automated inference.",
    lastUpdated: "2026-06-09",
    status: "active",
  },
  ingestionGate: {
    activePriorityLevel: 1,
    rule: "Only Priority 1 standard families may be ingested during Sessions 1–3",
    blockPriority2UntilSessionsComplete: ["1", "2", "3"],
    blockNonPriority1DuringSessions1to3: true,
    enforcementStage: "validation",
    workflowRef: "knowledge-foundation/governance/knowledge-admission-workflow.json",
    rejectionOutcome: "reject-at-validation-stage",
  },
  blockedTechnologies: {
    untilFoundationV1Adopted: ["RAG", "Ollama", "Fine-tuning", "Vector DB"],
    note: "No runtime vector ingest until Foundation v1 fully adopted and legal sign-off complete",
  },
  priority1: {
    label: "Authorized for Sessions 1–3",
    standardFamilies: ["IFRS", "IAS", "IFRIC", "ISA", "ISQM", "SOCPA"],
    sessionMapping: {
      IFRS: "1",
      IAS: "1",
      IFRIC: "1",
      ISA: "2",
      ISQM: "2",
      SOCPA: "3",
    },
    itemCount: priority1Items.length,
    items: priority1Items.sort((a, b) => {
      const sessionOrder = { "1": 1, "2": 2, "3": 3 };
      return (sessionOrder[a.session] ?? 9) - (sessionOrder[b.session] ?? 9);
    }),
  },
  priority2: {
    label: "Blocked until Sessions 1–3 complete",
    standardFamilies: ["LCGPA", "Financial Statements", "COA", "ERP Structures"],
    admissionStatus: "blocked",
    blockedUntil: "sessions-1-3-complete",
    itemCount: priority2Items.length,
    items: priority2Items,
  },
  excludedFromActiveIngestion: {
    description: "Catalog entries outside Priority 1 families — blocked during Sessions 1–3",
    items: excludedFromP1,
  },
  summary: {
    priority1Count: priority1Items.length,
    priority2Count: priority2Items.length,
    excludedCount: excludedFromP1.length,
    byFamily: P1_FAMILIES.reduce((acc, f) => {
      acc[f] = priority1Items.filter((i) => i.standardFamily === f).length;
      return acc;
    }, {}),
  },
};

writeFileSync(OUT, JSON.stringify(backlog, null, 2) + "\n", "utf8");
console.log(
  `P1: ${priority1Items.length} | P2: ${priority2Items.length} | Excluded: ${excludedFromP1.length}`,
);
