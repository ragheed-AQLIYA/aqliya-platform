/**
 * Shared Session 1 ingestion builders — Wave 1 & Wave 2
 */
export const COMMON = {
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

export function ifrsUrl(slug) {
  return `https://www.ifrs.org/issued-standards/list-of-standards/${slug}/`;
}

export function buildAsset(std, wave) {
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
      wave,
      attribution: ["© IFRS Foundation"],
      disclaimer:
        "Structured rule extracts for governance admission. Requires KNOWLEDGE_REVIEWER approval before production use. Not a substitute for the authoritative standard text.",
    },
    ontology: {
      domain: "accounting",
      subdomain: "ifrs-standards",
      entity: std.entityType ?? "standard",
      relationship: "implements",
      authority: "ifrs-foundation",
      usage: "tb-intelligence",
    },
    engines: ["tb-intelligence", "mapping-engine", "disclosure-engine", "accounting-intelligence"],
    lineage: {
      lineageId: null,
      lineageParentId: null,
      upstreamAssetIds: std.upstreamAssetIds ?? [],
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

export function buildRules(std, wave) {
  return {
    meta: {
      ...COMMON,
      assetId: `${std.assetId}-rules`,
      assetType: "A",
      parentAssetId: std.assetId,
      standardCode: std.standardCode,
      versionLabel: std.versionLabel,
      wave,
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
        entity: std.entityType ?? "standard",
        relationship: "implements",
        authority: "ifrs-foundation",
        usage: r.usage ?? "mapping-engine",
      },
    })),
  };
}

export function buildGuidance(std, wave) {
  const guidance = std.guidance ?? [];
  return {
    meta: {
      ...COMMON,
      assetId: `${std.assetId}-guidance`,
      assetType: "B",
      parentAssetId: std.assetId,
      standardCode: std.standardCode,
      versionLabel: std.versionLabel,
      wave,
      guidanceCount: guidance.length,
      executableRules: false,
    },
    guidance: guidance.map((g) => ({
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

export function buildAdmissionRecord(std, wave) {
  return {
    catalogId: `kf-acct-ifrs-${std.slug}`,
    standardCode: std.standardCode,
    wave,
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
      ingestion: {
        status: "complete",
        timestamp: "2026-06-09",
        stagingPath: `knowledge-foundation/domains/ifrs/${std.slug}/`,
      },
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

export function ingestStandard(std, wave, baseDir, fs) {
  const dir = `${baseDir}/${std.slug}`;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(`${dir}/asset.json`, JSON.stringify(buildAsset(std, wave), null, 2) + "\n");
  fs.writeFileSync(`${dir}/rules.json`, JSON.stringify(buildRules(std, wave), null, 2) + "\n");
  fs.writeFileSync(`${dir}/guidance.json`, JSON.stringify(buildGuidance(std, wave), null, 2) + "\n");
  fs.writeFileSync(`${dir}/admission-record.json`, JSON.stringify(buildAdmissionRecord(std, wave), null, 2) + "\n");
  return {
    slug: std.slug,
    catalogId: `kf-acct-ifrs-${std.slug}`,
    standardCode: std.standardCode,
    ruleCount: std.rules.length,
    guidanceCount: (std.guidance ?? []).length,
  };
}
