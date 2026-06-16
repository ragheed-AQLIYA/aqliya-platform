/**
 * Shared Session 2 (ISA/ISQM) ingestion builders
 */
export const COMMON_AUDIT = {
  charterVersion: "1.0",
  authorityId: "iaasb",
  authorityLevel: "A",
  licenseId: "iaasb-standard",
  domain: "audit",
  jurisdiction: "global",
  producedBy: "session-2-ingestion",
  ingestionMethod: "structured-json",
  validationStatus: "pending-review",
  reviewStatus: "pending",
  admissionWorkflowStage: "ingestion",
  storageTier: "ingestion-staging",
  ragIngest: false,
  vectorIndex: false,
};

export function iaasbUrl(code) {
  const slug = code.toLowerCase().replace(/\s+/g, "-");
  return `https://www.iaasb.org/publications/${slug}`;
}

export function buildAsset(std, session = "2") {
  return {
    meta: {
      ...COMMON_AUDIT,
      assetId: std.assetId,
      assetType: "A",
      subdomain: std.subdomain ?? "isa-standards",
      standardCode: std.standardCode,
      standardName: std.standardName,
      versionLabel: std.versionLabel,
      issueDate: std.issueDate,
      effectiveDate: std.effectiveDate,
      supersededDate: null,
      status: "current",
      sourceUrl: std.sourceUrl,
      sourceOwner: "IAASB",
      catalogId: std.catalogId,
      session,
      attribution: ["© IAASB / IFAC"],
      crossDomainLinks: std.crossDomainLinks ?? [],
      disclaimer:
        "Structured rule extracts for governance admission. Requires KNOWLEDGE_REVIEWER approval before production use.",
    },
    ontology: {
      domain: "audit",
      subdomain: std.subdomain ?? "isa-standards",
      entity: "standard",
      relationship: "implements",
      authority: "iaasb",
      usage: std.primaryEngine ?? "audit-intelligence",
    },
    engines: std.engines ?? [
      "audit-intelligence",
      "risk-library",
      "findings-library",
      "evidence-catalog",
    ],
    lineage: {
      lineageId: null,
      lineageParentId: null,
      upstreamAssetIds: std.upstreamAssetIds ?? [],
      note: "Lineage assigned at reviewer approval",
    },
    confidence: {
      authorityLevel: "A",
      validationStatus: "pending-review",
      versionStatus: "current",
      reviewStatus: "pending",
      confidenceScore: 69,
    },
    licensing: {
      licenseId: "iaasb-standard",
      linking: "permitted",
      cataloging: "permitted-with-attribution",
      referencing: "permitted-with-attribution",
      embedding: "restricted-review-required",
      redistribution: "prohibited",
      commercialUse: "restricted-review-required",
    },
  };
}

export function buildRules(std, session = "2") {
  return {
    meta: {
      ...COMMON_AUDIT,
      subdomain: std.subdomain ?? "isa-standards",
      assetId: `${std.assetId}-rules`,
      assetType: "A",
      parentAssetId: std.assetId,
      standardCode: std.standardCode,
      versionLabel: std.versionLabel,
      session,
      ruleCount: std.rules.length,
      executableRules: true,
      humanApprovalRequired: true,
    },
    rules: std.rules.map((r) => ({
      ...r,
      assetType: "A",
      lineageParentId: std.assetId,
      confidenceScore: 69,
      validationStatus: "pending-review",
      ontology: {
        domain: "audit",
        subdomain: std.subdomain ?? "isa-standards",
        entity: "standard",
        relationship: "implements",
        authority: "iaasb",
        usage: r.usage ?? "audit-intelligence",
      },
    })),
  };
}

export function buildProcedures(std, session = "2") {
  const procedures = std.procedures ?? [];
  return {
    meta: {
      ...COMMON_AUDIT,
      subdomain: std.subdomain ?? "isa-standards",
      assetId: `${std.assetId}-procedures`,
      assetType: "D",
      parentAssetId: std.assetId,
      standardCode: std.standardCode,
      versionLabel: std.versionLabel,
      session,
      procedureCount: procedures.length,
      executableRules: false,
      humanApprovalRequired: true,
      note: "Type D operational templates — reviewer approval required before use",
    },
    procedures: procedures.map((p) => ({
      ...p,
      assetType: "D",
      lineageParentId: std.assetId,
      confidenceScore: 69,
      validationStatus: "pending-review",
      ontology: {
        domain: "audit",
        subdomain: std.subdomain ?? "isa-standards",
        entity: "audit-procedure",
        relationship: "requires-evidence",
        authority: "iaasb",
        usage: "evidence-catalog",
      },
    })),
  };
}

export function buildAdmissionRecord(std, session = "2") {
  const basePath =
    std.domainPath ??
    (std.subdomain === "isqm"
      ? `knowledge-foundation/domains/isqm/${std.slug}/`
      : `knowledge-foundation/domains/isa/${std.slug}/`);
  return {
    catalogId: std.catalogId,
    standardCode: std.standardCode,
    session,
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
      ingestion: { status: "complete", timestamp: "2026-06-09", stagingPath: basePath },
      validation: { status: "pending" },
      authorityCheck: { status: "pending", authorityLevel: "A", executableRulePermitted: true },
      licensingCheck: { status: "pending", licenseId: "iaasb-standard", embeddingPermitted: false },
      confidenceAssignment: { status: "pending", confidenceScore: 69, productionEligible: false },
      lineageAssignment: { status: "pending" },
      reviewerApproval: { status: "pending", requiredRole: "KNOWLEDGE_REVIEWER" },
      productionAdmission: { status: "blocked", reason: "pending-review" },
    },
    blockedTechnologies: ["RAG", "Ollama", "Fine-tuning", "Vector DB"],
  };
}

export function ingestAuditStandard(std, baseDir, fs, session = "2") {
  const dir = `${baseDir}/${std.slug}`;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(`${dir}/asset.json`, JSON.stringify(buildAsset(std, session), null, 2) + "\n");
  fs.writeFileSync(`${dir}/rules.json`, JSON.stringify(buildRules(std, session), null, 2) + "\n");
  fs.writeFileSync(
    `${dir}/procedures.json`,
    JSON.stringify(buildProcedures(std, session), null, 2) + "\n",
  );
  fs.writeFileSync(
    `${dir}/admission-record.json`,
    JSON.stringify(buildAdmissionRecord(std, session), null, 2) + "\n",
  );
  return {
    slug: std.slug,
    catalogId: std.catalogId,
    standardCode: std.standardCode,
    ruleCount: std.rules.length,
    procedureCount: (std.procedures ?? []).length,
    domainPath: std.domainPath ?? dir,
  };
}
