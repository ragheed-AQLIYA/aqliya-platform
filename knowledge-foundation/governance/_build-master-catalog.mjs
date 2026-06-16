/**
 * One-time Session 0 generator — produces master-knowledge-catalog.json
 * Run: node knowledge-foundation/governance/_build-master-catalog.mjs
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "master-knowledge-catalog.json");

const POLICY = {
  lineageA: {
    artifactRef: "knowledge-foundation/artifacts/knowledge-lineage-model.json",
    minimumChain: ["decision", "rule", "authority", "sourceDocument", "reviewer"],
    humanReviewBeforeProduction: true,
    llmOnlyReasoningAllowed: false,
    blockAutonomousDecision: true,
  },
  lineageB: {
    artifactRef: "knowledge-foundation/artifacts/knowledge-lineage-model.json",
    minimumChain: ["decision", "rule", "authority", "sourceDocument", "reviewer"],
    humanReviewBeforeProduction: true,
    llmOnlyReasoningAllowed: false,
    note: "Type B — guidance only, not executable rules",
  },
  lineageD: {
    artifactRef: "knowledge-foundation/artifacts/knowledge-lineage-model.json",
    minimumChain: ["decision", "rule", "authority", "sourceDocument", "reviewer"],
    humanReviewBeforeProduction: true,
    templateRequired: true,
  },
  lineageE: {
    artifactRef: "knowledge-foundation/artifacts/knowledge-lineage-model.json",
    minimumChain: ["decision", "rule", "authority", "sourceDocument", "reviewer"],
    humanReviewBeforeProduction: true,
    repeatedApprovalBoost: true,
  },
  versionMandatory: {
    artifactRef: "knowledge-foundation/artifacts/knowledge-version-policy.json",
    policyStatement: "Version history must never be destroyed",
    requiredFields: [
      "assetId",
      "versionLabel",
      "issueDate",
      "effectiveDate",
      "jurisdiction",
      "status",
      "sourceUrl",
      "sourceOwner",
    ],
    noVersionlessAdmission: true,
  },
  confidenceA: {
    artifactRef: "knowledge-foundation/artifacts/knowledge-confidence-model.json",
    authorityLevel: "A",
    indicativeRange: { min: 95, max: 100 },
    conditions: "validated + current version",
    executableRuleMinimum: 95,
    llmGeneratedContentCap: 69,
    blockAutonomousDecision: true,
  },
  confidenceB: {
    artifactRef: "knowledge-foundation/artifacts/knowledge-confidence-model.json",
    authorityLevel: "B",
    indicativeRange: { min: 70, max: 90 },
    llmGeneratedContentCap: 69,
    executableRules: false,
  },
  confidenceE: {
    artifactRef: "knowledge-foundation/artifacts/knowledge-confidence-model.json",
    assetType: "E",
    indicativeRange: { min: 85, max: 99 },
    conditions: "repeated approval",
    approvalCountMin: 2,
  },
};

const LICENSE = {
  ifrs: "ifrs-foundation-standard",
  iaasb: "iaasb-standard",
  socpa: "socpa-standard",
  firm: "firm-institutional-memory",
};

function entry(base) {
  const assetType = base.assetType ?? "A";
  const lineageKey =
    assetType === "E"
      ? "lineageE"
      : assetType === "D"
        ? "lineageD"
        : assetType === "B"
          ? "lineageB"
          : "lineageA";
  const confKey =
    assetType === "E"
      ? "confidenceE"
      : assetType === "B"
        ? "confidenceB"
        : "confidenceA";

  return {
    catalogId: base.catalogId,
    domain: base.domain,
    subdomain: base.subdomain,
    authority: base.authority,
    authorityLevel: base.authorityLevel ?? "A",
    assetType,
    storageTier: base.storageTier ?? (assetType === "D" || assetType === "E" ? "operational" : "canonical"),
    lineageRequirements: { ...POLICY[lineageKey] },
    versionPolicy: { ...POLICY.versionMandatory },
    confidencePolicy: { ...POLICY[confKey] },
    licensingStatus: {
      licenseId: base.licenseId,
      artifactRef: "knowledge-foundation/artifacts/knowledge-licensing-matrix.json",
      ...(base.licensingOverride ?? {}),
    },
    repositoryPath: base.repositoryPath,
    engines: base.engines,
    priority: base.priority,
    session: base.session,
    standardCode: base.standardCode ?? null,
    jurisdiction: base.jurisdiction ?? "global",
    status: base.status ?? "planned",
    ontology: {
      entity: base.entity ?? "standard",
      relationship: base.relationship ?? "implements",
      usage: base.engines[0],
    },
  };
}

const entries = [];

// ── Session 0: Governance ──────────────────────────────────────────
entries.push(
  entry({
    catalogId: "kf-gov-master-catalog",
    domain: "governance",
    subdomain: "master-catalog",
    authority: "ifrs-foundation",
    authorityLevel: "A",
    assetType: "C",
    storageTier: "canonical",
    licenseId: LICENSE.ifrs,
    repositoryPath: "knowledge-foundation/governance/",
    engines: ["knowledge-catalog", "admission-gate"],
    priority: 0,
    session: "0",
    standardCode: "MASTER-CATALOG",
    status: "in-progress",
    entity: "catalog",
    relationship: "governs",
  }),
  entry({
    catalogId: "kf-gov-governance-model",
    domain: "governance",
    subdomain: "governance-model",
    authority: "ifrs-foundation",
    authorityLevel: "A",
    assetType: "C",
    storageTier: "canonical",
    licenseId: LICENSE.ifrs,
    repositoryPath: "knowledge-foundation/governance/",
    engines: ["admission-gate", "lineage-engine"],
    priority: 0,
    session: "0.5",
    standardCode: "GOVERNANCE-MODEL",
    status: "planned",
    entity: "governance-model",
    relationship: "governs",
  }),
);

// ── Session 1: IFRS priority ───────────────────────────────────────
const ifrsPriority1 = [
  "IFRS 15",
  "IFRS 16",
  "IFRS 9",
  "IAS 1",
  "IAS 12",
  "IFRS for SMEs",
];
const ifrsPriority2 = [
  "IFRS 1",
  "IFRS 2",
  "IFRS 3",
  "IFRS 5",
  "IFRS 7",
  "IFRS 8",
  "IFRS 10",
  "IFRS 11",
  "IFRS 12",
  "IFRS 13",
  "IFRS 17",
  "IAS 2",
  "IAS 7",
  "IAS 8",
  "IAS 10",
  "IAS 16",
  "IAS 19",
  "IAS 23",
  "IAS 32",
  "IAS 36",
  "IAS 37",
  "IAS 38",
  "IFRIC 10",
  "IFRIC 12",
  "IFRIC 19",
  "IFRIC 23",
];

for (const code of ifrsPriority1) {
  const slug = code.toLowerCase().replace(/\s+/g, "-");
  entries.push(
    entry({
      catalogId: `kf-acct-ifrs-${slug}`,
      domain: "accounting",
      subdomain: "ifrs-standards",
      authority: "ifrs-foundation",
      assetType: "A",
      licenseId: LICENSE.ifrs,
      repositoryPath: `knowledge-foundation/domains/ifrs/${slug}/`,
      engines: ["tb-intelligence", "mapping-engine", "disclosure-engine", "accounting-intelligence"],
      priority: 1,
      session: "1",
      standardCode: code,
      licensingOverride: { embedding: "restricted-review-required", redistribution: "prohibited" },
    }),
  );
}
for (const code of ifrsPriority2) {
  const slug = code.toLowerCase().replace(/\s+/g, "-");
  entries.push(
    entry({
      catalogId: `kf-acct-ifrs-${slug}`,
      domain: "accounting",
      subdomain: "ifrs-standards",
      authority: "ifrs-foundation",
      assetType: "A",
      licenseId: LICENSE.ifrs,
      repositoryPath: `knowledge-foundation/domains/ifrs/${slug}/`,
      engines: ["tb-intelligence", "mapping-engine", "disclosure-engine"],
      priority: 2,
      session: "1",
      standardCode: code,
    }),
  );
}

// Chart of accounts + disclosure (AuditOS TB flow)
entries.push(
  entry({
    catalogId: "kf-acct-coa-canonical",
    domain: "accounting",
    subdomain: "chart-of-accounts",
    authority: "ifrs-foundation",
    assetType: "C",
    licenseId: LICENSE.ifrs,
    repositoryPath: "knowledge-foundation/domains/ifrs/structures/chart-of-accounts/",
    engines: ["tb-intelligence", "mapping-engine"],
    priority: 1,
    session: "1",
    standardCode: "COA-IFRS-SME",
    entity: "chart-of-accounts",
    relationship: "maps-to-account",
  }),
  entry({
    catalogId: "kf-acct-disclosure-rules",
    domain: "accounting",
    subdomain: "disclosure",
    authority: "ifrs-foundation",
    assetType: "A",
    licenseId: LICENSE.ifrs,
    repositoryPath: "knowledge-foundation/domains/ifrs/disclosure/",
    engines: ["disclosure-engine", "accounting-intelligence"],
    priority: 2,
    session: "1",
    standardCode: "DISCLOSURE-IFRS",
    entity: "disclosure-rule",
    relationship: "requires-evidence",
  }),
  entry({
    catalogId: "kf-acct-firm-memory-mapping",
    domain: "accounting",
    subdomain: "chart-of-accounts",
    authority: "firm-internal",
    authorityLevel: "E",
    assetType: "E",
    storageTier: "operational",
    licenseId: LICENSE.firm,
    repositoryPath: "knowledge-foundation/domains/ifrs/memory/tb-mapping/",
    engines: ["tb-intelligence", "mapping-engine"],
    priority: 1,
    session: "1",
    standardCode: "FIRM-MEMORY-TB-MAPPING",
    jurisdiction: "organization-scoped",
    entity: "firm-decision",
    relationship: "approved-by",
    status: "planned",
  }),
);

// ── Session 2: ISA / ISQM ──────────────────────────────────────────
const isaPriority1 = ["ISA 315", "ISA 330", "ISA 500", "ISA 540", "ISA 700", "ISQM 1"];
const isaPriority2 = [
  "ISA 200",
  "ISA 210",
  "ISA 220",
  "ISA 240",
  "ISA 250",
  "ISA 260",
  "ISA 570",
  "ISA 580",
  "ISA 705",
  "ISA 706",
];

for (const code of isaPriority1) {
  const isIsqm = code.startsWith("ISQM");
  const slug = code.toLowerCase().replace(/\s+/g, "-");
  const domainPath = isIsqm ? "isqm" : "isa";
  const subdomain = isIsqm ? "isqm" : "isa-standards";
  entries.push(
    entry({
      catalogId: `kf-audit-${slug}`,
      domain: "audit",
      subdomain,
      authority: "iaasb",
      assetType: "A",
      licenseId: LICENSE.iaasb,
      repositoryPath: `knowledge-foundation/domains/${domainPath}/${slug}/`,
      engines: isIsqm
        ? ["audit-intelligence", "risk-library"]
        : ["audit-intelligence", "evidence-catalog", "findings-library"],
      priority: 1,
      session: "2",
      standardCode: code,
      licensingOverride: { embedding: "restricted-review-required" },
    }),
  );
}
for (const code of isaPriority2) {
  const slug = code.toLowerCase().replace(/\s+/g, "-");
  entries.push(
    entry({
      catalogId: `kf-audit-${slug}`,
      domain: "audit",
      subdomain: "isa-standards",
      authority: "iaasb",
      assetType: "A",
      licenseId: LICENSE.iaasb,
      repositoryPath: `knowledge-foundation/domains/isa/${slug}/`,
      engines: ["audit-intelligence", "evidence-catalog"],
      priority: 2,
      session: "2",
      standardCode: code,
    }),
  );
}

entries.push(
  entry({
    catalogId: "kf-audit-procedures-library",
    domain: "audit",
    subdomain: "audit-procedures",
    authority: "iaasb",
    assetType: "D",
    storageTier: "operational",
    licenseId: LICENSE.iaasb,
    repositoryPath: "knowledge-foundation/domains/isa/operational/procedures/",
    engines: ["audit-intelligence", "evidence-catalog"],
    priority: 2,
    session: "2",
    standardCode: "AUDIT-PROCEDURES",
    entity: "audit-procedure",
    relationship: "requires-evidence",
  }),
);

// ── Session 3: SOCPA ───────────────────────────────────────────────
const socpaEntries = [
  { code: "SOCPA-ACCOUNTING-FRAMEWORK", subdomain: "socpa-accounting", pri: 1 },
  { code: "SOCPA-IFRS-ADOPTION", subdomain: "socpa-accounting", pri: 1 },
  { code: "SOCPA-ZAKAT-TAX", subdomain: "socpa-accounting", pri: 1 },
  { code: "SOCPA-AUDITING-STANDARDS", subdomain: "socpa-audit", pri: 1 },
  { code: "SOCPA-ISA-ALIGNMENT", subdomain: "socpa-audit", pri: 2 },
  { code: "SOCPA-CIRCULARS", subdomain: "socpa-accounting", pri: 2 },
  { code: "SOCPA-PROFESSIONAL-CONDUCT", subdomain: "socpa-audit", pri: 2 },
  { code: "SOCPA-JURISDICTION-OVERLAY", subdomain: "socpa-accounting", pri: 1 },
];

for (const s of socpaEntries) {
  const slug = s.code.toLowerCase();
  entries.push(
    entry({
      catalogId: `kf-socpa-${slug}`,
      domain: s.subdomain.startsWith("socpa-audit") ? "audit" : "accounting",
      subdomain: s.subdomain,
      authority: "socpa",
      assetType: s.code.includes("OVERLAY") ? "B" : "A",
      licenseId: LICENSE.socpa,
      repositoryPath: `knowledge-foundation/domains/socpa/${slug}/`,
      engines:
        s.subdomain === "socpa-audit"
          ? ["audit-intelligence", "evidence-catalog"]
          : ["tb-intelligence", "mapping-engine", "disclosure-engine"],
      priority: s.pri,
      session: "3",
      standardCode: s.code,
      jurisdiction: "saudi-arabia",
      relationship: s.code.includes("OVERLAY") ? "jurisdiction-overlay" : "implements",
    }),
  );
}

const catalog = {
  meta: {
    artifactId: "master-knowledge-catalog",
    schemaVersion: "1.0",
    charterVersion: "1.0",
    charterReference: "knowledge-foundation/charter/AQLIYA_KNOWLEDGE_FOUNDATION_CHARTER_v1.0.md",
    governingStatement:
      "This Foundation shall always privilege authoritative professional judgment over automated inference.",
    session: "0",
    lastUpdated: "2026-06-09",
    status: "active",
    entryCount: entries.length,
    artifactCrossReferences: {
      authorityMatrix: "knowledge-foundation/artifacts/knowledge-authority-matrix.json",
      storageMatrix: "knowledge-foundation/artifacts/knowledge-storage-matrix.json",
      domainMap: "knowledge-foundation/artifacts/knowledge-domain-map.json",
      confidenceModel: "knowledge-foundation/artifacts/knowledge-confidence-model.json",
      lineageModel: "knowledge-foundation/artifacts/knowledge-lineage-model.json",
      versionPolicy: "knowledge-foundation/artifacts/knowledge-version-policy.json",
      ontology: "knowledge-foundation/artifacts/knowledge-ontology.json",
      licensingMatrix: "knowledge-foundation/artifacts/knowledge-licensing-matrix.json",
    },
  },
  policyTemplates: POLICY,
  auditOsFlow: {
    description: "AI Assisted Financial Statement Preparation — human approval required",
    sequence: [
      "TB Upload",
      "TB Intelligence",
      "Firm Memory",
      "Mapping Suggestions",
      "Reviewer Approval",
      "Financial Statements",
    ],
    charterCompliant: true,
    autonomousFsGeneration: false,
  },
  entries,
  validationSummary: {
    session0Complete: true,
    crossArtifactReview: "knowledge-foundation/governance/SESSION_0_CROSS_ARTIFACT_REVIEW.md",
    sessionsAuthorized: ["0", "0.5", "1", "2", "3"],
    session1BlockedUntilReview: true,
    minimumEntryCount: 50,
    actualEntryCount: entries.length,
  },
};

writeFileSync(OUT, JSON.stringify(catalog, null, 2) + "\n", "utf8");
console.log(`Wrote ${entries.length} entries to ${OUT}`);
