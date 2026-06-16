/**
 * Shared Session 3 (SOCPA) ingestion builders
 */
export const COMMON_SOCPA = {
  charterVersion: "1.0",
  authorityId: "socpa",
  authorityLevel: "A",
  licenseId: "socpa-standard",
  jurisdiction: "saudi-arabia",
  producedBy: "session-3-ingestion",
  ingestionMethod: "structured-json",
  validationStatus: "pending-review",
  reviewStatus: "pending",
  admissionWorkflowStage: "ingestion",
  storageTier: "ingestion-staging",
  ragIngest: false,
  vectorIndex: false,
};

export function buildAsset(std) {
  return {
    meta: {
      ...COMMON_SOCPA,
      assetId: std.assetId,
      assetType: std.assetType ?? "A",
      domain: std.domain,
      subdomain: std.subdomain,
      standardCode: std.standardCode,
      standardName: std.standardName,
      versionLabel: std.versionLabel,
      issueDate: std.issueDate,
      effectiveDate: std.effectiveDate,
      status: "current",
      sourceUrl: std.sourceUrl ?? "https://www.socpa.org.sa/",
      sourceOwner: "SOCPA",
      catalogId: std.catalogId,
      session: "3",
      attribution: ["© SOCPA"],
      disclaimer:
        "Structured rule extracts for governance admission. Requires KNOWLEDGE_REVIEWER approval. Jurisdiction overlay — does not replace IFRS/ISA base assets.",
    },
    ontology: {
      domain: std.domain,
      subdomain: std.subdomain,
      entity: std.assetType === "B" ? "interpretation" : "standard",
      relationship: std.assetType === "B" ? "jurisdiction-overlay" : "implements",
      authority: "socpa",
      usage: std.primaryEngine ?? "tb-intelligence",
    },
    engines: std.engines ?? ["tb-intelligence", "mapping-engine", "audit-intelligence"],
    lineage: {
      upstreamAssetIds: std.upstreamAssetIds ?? [],
      jurisdictionOverlay: std.jurisdictionOverlay ?? false,
      note: "Preserve IFRS/ISA base version history — overlay only",
    },
    confidence: {
      authorityLevel: "A",
      validationStatus: "pending-review",
      confidenceScore: 69,
    },
    licensing: {
      licenseId: "socpa-standard",
      embedding: "restricted-review-required",
      redistribution: "prohibited",
    },
  };
}

export function buildRules(std) {
  return {
    meta: {
      ...COMMON_SOCPA,
      domain: std.domain,
      subdomain: std.subdomain,
      assetId: `${std.assetId}-rules`,
      assetType: "A",
      parentAssetId: std.assetId,
      standardCode: std.standardCode,
      ruleCount: std.rules.length,
      humanApprovalRequired: true,
    },
    rules: std.rules.map((r) => ({
      ...r,
      assetType: std.assetType === "B" ? "B" : "A",
      lineageParentId: std.assetId,
      confidenceScore: 69,
      validationStatus: "pending-review",
      jurisdiction: "saudi-arabia",
    })),
  };
}

export function buildJurisdictionOverlay(std) {
  if (!std.overlay) return null;
  return {
    meta: {
      ...COMMON_SOCPA,
      assetId: `${std.assetId}-overlay`,
      assetType: "B",
      parentAssetId: std.assetId,
      standardCode: std.standardCode,
      overlayType: "jurisdiction-overlay",
    },
    overlay: {
      jurisdiction: "saudi-arabia",
      baseStandards: std.overlay.baseStandards,
      relationship: "jurisdiction-overlay",
      retainBaseVersionHistory: true,
      supersessionPolicy: "Do not replace IFRS/ISA assets — overlay applies in KSA context only",
      rules: std.overlay.rules ?? [],
    },
  };
}

export function buildAdmissionRecord(std) {
  return {
    catalogId: std.catalogId,
    standardCode: std.standardCode,
    session: "3",
    currentStage: "ingestion",
    stageResults: {
      source: { status: "pass", timestamp: "2026-06-09" },
      ingestion: {
        status: "complete",
        stagingPath: `knowledge-foundation/domains/socpa/${std.slug}/`,
      },
      productionAdmission: { status: "blocked", reason: "pending-review" },
    },
    blockedTechnologies: ["RAG", "Ollama", "Fine-tuning", "Vector DB"],
  };
}

export function ingestSocpa(std, baseDir, fs) {
  const dir = `${baseDir}/${std.slug}`;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(`${dir}/asset.json`, JSON.stringify(buildAsset(std), null, 2) + "\n");
  fs.writeFileSync(`${dir}/rules.json`, JSON.stringify(buildRules(std), null, 2) + "\n");
  const overlay = buildJurisdictionOverlay(std);
  if (overlay) {
    fs.writeFileSync(`${dir}/jurisdiction-overlay.json`, JSON.stringify(overlay, null, 2) + "\n");
  }
  fs.writeFileSync(`${dir}/admission-record.json`, JSON.stringify(buildAdmissionRecord(std), null, 2) + "\n");
  return {
    slug: std.slug,
    catalogId: std.catalogId,
    standardCode: std.standardCode,
    ruleCount: std.rules.length,
    hasOverlay: !!std.overlay,
  };
}
