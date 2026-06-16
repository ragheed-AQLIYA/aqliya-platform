/**
 * Shared Session 4 (LCGPA / Local Content) ingestion builders
 */
export const COMMON_LC = {
  charterVersion: "1.0",
  authorityId: "lcgpa",
  authorityLevel: "A",
  licenseId: "lcgpa-standard",
  jurisdiction: "saudi-arabia",
  producedBy: "session-4-ingestion",
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
      ...COMMON_LC,
      assetId: std.assetId,
      assetType: std.assetType ?? "A",
      domain: std.domain ?? "local-content",
      subdomain: std.subdomain,
      standardCode: std.standardCode,
      standardName: std.standardName,
      versionLabel: std.versionLabel,
      issueDate: std.issueDate,
      effectiveDate: std.effectiveDate,
      status: "current",
      sourceUrl: std.sourceUrl ?? "https://lcgpa.gov.sa/",
      sourceOwner: "LCGPA",
      catalogId: std.catalogId,
      session: "4",
      attribution: ["© LCGPA"],
      disclaimer:
        "Structured rule extracts for governance admission. Requires KNOWLEDGE_REVIEWER approval. Local content conclusions require human review.",
      regulationReference: std.regulationReference,
    },
    ontology: {
      domain: std.domain ?? "local-content",
      subdomain: std.subdomain,
      entity: std.assetType === "D" ? "verification-procedure" : "regulation",
      relationship: std.assetType === "D" ? "requires-evidence" : "governs",
      authority: "lcgpa",
      usage: std.primaryEngine ?? "local-content-intelligence",
    },
    engines: std.engines ?? ["local-content-intelligence", "supplier-classification", "spend-analysis"],
    lineage: {
      upstreamAssetIds: std.upstreamAssetIds ?? [],
      crossReferences: std.crossReferences ?? [],
      note: std.lineageNote ?? "LCGPA rules govern local content measurement — overlay on audited financial inputs",
    },
    confidence: {
      authorityLevel: "A",
      validationStatus: "pending-review",
      confidenceScore: 69,
    },
    licensing: {
      licenseId: "lcgpa-standard",
      embedding: "restricted-review-required",
      redistribution: "prohibited",
    },
  };
}

export function buildRules(std) {
  return {
    meta: {
      ...COMMON_LC,
      domain: std.domain ?? "local-content",
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
      assetType: "A",
      lineageParentId: std.assetId,
      confidenceScore: 69,
      validationStatus: "pending-review",
      jurisdiction: "saudi-arabia",
    })),
  };
}

export function buildProcedures(std) {
  return {
    meta: {
      ...COMMON_LC,
      domain: std.domain ?? "local-content",
      subdomain: std.subdomain,
      assetId: `${std.assetId}-procedures`,
      assetType: "D",
      parentAssetId: std.assetId,
      standardCode: std.standardCode,
      versionLabel: std.versionLabel,
      session: "4",
      procedureCount: std.procedures.length,
      executableRules: false,
      humanApprovalRequired: true,
      note: "Type D verification procedures — AUP steps for facility-level LC compliance",
      sourceArtifact: std.sourceArtifact,
    },
    procedures: std.procedures.map((p) => ({
      ...p,
      assetType: "D",
      lineageParentId: std.assetId,
      confidenceScore: 69,
      validationStatus: "pending-review",
      ontology: {
        domain: "local-content",
        subdomain: std.subdomain,
        entity: "verification-procedure",
        relationship: "requires-evidence",
        authority: "lcgpa",
        usage: "evidence-catalog",
      },
    })),
  };
}

export function buildAdmissionRecord(std) {
  return {
    catalogId: std.catalogId,
    standardCode: std.standardCode,
    session: "4",
    currentStage: "ingestion",
    stageResults: {
      source: { status: "pass", timestamp: "2026-06-09" },
      ingestion: {
        status: "complete",
        stagingPath: `knowledge-foundation/domains/local-content/${std.slug}/`,
      },
      productionAdmission: { status: "blocked", reason: "pending-review" },
    },
    blockedTechnologies: ["RAG", "Ollama", "Fine-tuning", "Vector DB"],
  };
}

export function ingestLocalContent(std, baseDir, fs) {
  const dir = `${baseDir}/${std.slug}`;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(`${dir}/asset.json`, JSON.stringify(buildAsset(std), null, 2) + "\n");
  if (std.rules?.length) {
    fs.writeFileSync(`${dir}/rules.json`, JSON.stringify(buildRules(std), null, 2) + "\n");
  }
  if (std.procedures?.length) {
    fs.writeFileSync(`${dir}/procedures.json`, JSON.stringify(buildProcedures(std), null, 2) + "\n");
  }
  fs.writeFileSync(`${dir}/admission-record.json`, JSON.stringify(buildAdmissionRecord(std), null, 2) + "\n");
  return {
    slug: std.slug,
    catalogId: std.catalogId,
    standardCode: std.standardCode,
    ruleCount: std.rules?.length ?? 0,
    procedureCount: std.procedures?.length ?? 0,
    assetType: std.assetType ?? "A",
  };
}
