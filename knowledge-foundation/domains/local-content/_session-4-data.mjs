/**
 * Session 4 — LCGPA rules + facility verification matrix (from Local_Content_Verification_Audit_Matrix_v1.xlsx)
 */
function def(cfg) {
  const rules = (cfg.rules ?? []).map((r, i) => ({
    ruleId: `${cfg.slug}-r${String(i + 1).padStart(3, "0")}`,
    paragraphReference: r[0],
    ruleText: r[1],
    topic: r[2],
    engine: r[3] ?? "local-content-intelligence",
  }));
  const procedures = (cfg.procedures ?? []).map((p) => ({
    procedureId: p.controlId,
    controlId: p.controlId,
    title: p.domain,
    description: p.aupSteps,
    regulatoryBaseline: p.baseline,
    verificationStatus: p.status ?? "pending",
    evidenceType: "aup-verification",
    paragraphReference: `LCGPA-AUP-${p.controlId}`,
    crossRef: p.crossRef ?? "",
  }));
  return {
    slug: cfg.slug,
    catalogId: cfg.catalogId,
    standardCode: cfg.code,
    standardName: cfg.name,
    assetId: cfg.assetId,
    assetType: cfg.assetType ?? "A",
    domain: "local-content",
    subdomain: cfg.subdomain,
    versionLabel: cfg.versionLabel,
    issueDate: cfg.issueDate ?? "2021-01-01",
    effectiveDate: cfg.effective ?? "2021-06-01",
    sourceUrl: cfg.sourceUrl,
    regulationReference: cfg.regulationReference,
    upstreamAssetIds: cfg.upstream ?? [],
    crossReferences: cfg.crossReferences ?? [],
    engines: cfg.engines,
    sourceArtifact: cfg.sourceArtifact,
    rules,
    procedures,
  };
}

/** GEN-01..GEN-08 from Local_Content_Verification_Audit_Matrix_v1.xlsx */
const VERIFICATION_CONTROLS = [
  ["GEN-01", "Reporting Currency", "Verify that all disclosed sums across all modules and sub-ledgers are uniformly expressed in Saudi Riyal.", "Strictly SAR"],
  ["GEN-02", "Fiscal Framework", "Cross-verify the facility's reporting horizon with the Audited Financial Statements. Check boundary constraints if non-standard.", "Between 6 and 18 months"],
  ["GEN-03", "Audit Opinion Test", "Review the independent auditor's report on financial statements. Assess the financial statement qualification impact on the LC metric calculation.", "No adverse impact on LC inputs; else LCGPA approval required"],
  ["GEN-04", "Special Purpose Financials", "If special-purpose accounts are utilized, confirm exact alignment with the primary statements uploaded to the 'Qawam' platform.", "100% Reconciliation to Qawam ledger"],
  ["GEN-05", "Consolidation Logic", "For unified corporate sub-models, confirm elimination of intra-group transactions and track completeness of Table 1.5 mapping.", "No multi-counting of intra-group spend"],
  ["GEN-06", "Management Accounts", "If sector or divisional management tools are applied, track LCGPA approval records and test accuracy vectors for Segment 'C'.", "Valid LCGPA Approval Date required"],
  ["GEN-07", "Foreign Exclusions", "Verify that no foreign operational hubs, cross-border branches, or external costs are intermingled with domestic reporting tables.", "0% Foreign branch expenses in baseline"],
  ["GEN-08", "Formula Integrity", "Validate that the original underlying math architecture, macro calculations, and cell definitions remain locked and unedited.", "No changes to core engine formulas"],
].map(([controlId, domain, aupSteps, baseline]) => ({
  controlId,
  domain,
  aupSteps,
  baseline,
  status: "pending",
}));

export const SESSION4_ASSETS = [
  def({
    slug: "lcgpa",
    catalogId: "kf-lc-lcgpa-rules",
    assetId: "kf-lc-a-lcgpa-rules",
    code: "LCGPA-RULES",
    name: "LCGPA Local Content Rules",
    subdomain: "lcgpa-rules",
    versionLabel: "LCGPA-RULES:1-4661-21",
    regulationReference: "LCGPA Rules No. 1-4661-21",
    upstream: ["kf-socpa-socpa-ifrs-adoption", "kf-acct-ifrs-ias-1"],
    crossReferences: [{ standard: "ISRS 4400", role: "agreed-upon-procedures-baseline" }],
    rules: [
      ["LCGPA-1", "Facilities subject to local content obligations shall measure and report local content in accordance with LCGPA Rules No. 1-4661-21 and applicable ministerial decisions.", "measurement-framework", "local-content-intelligence"],
      ["LCGPA-2", "All local content financial disclosures shall be expressed uniformly in Saudi Riyal (SAR) across modules, sub-ledgers, and reporting tables.", "reporting-currency", "spend-analysis"],
      ["LCGPA-3", "The facility reporting period shall align with audited financial statements and remain within LCGPA-permitted horizons (typically 6–18 months unless approved otherwise).", "reporting-period", "local-content-intelligence"],
      ["LCGPA-4", "Qualified or adverse audit opinions on financial statements that adversely affect LC inputs require documented LCGPA approval before metric submission.", "audit-opinion-gate", "local-content-intelligence"],
      ["LCGPA-5", "Data submitted to the Qawam platform shall reconcile 100% to primary financial statements or approved special-purpose accounts.", "qawam-reconciliation", "spend-analysis"],
      ["LCGPA-6", "Intra-group transactions shall be eliminated in consolidation; Table 1.5 mapping must be complete with no multi-counting of spend.", "consolidation", "supplier-classification"],
      ["LCGPA-7", "Use of management accounts or sectoral divisional tools requires valid LCGPA approval with documented approval date.", "management-accounts", "local-content-intelligence"],
      ["LCGPA-8", "Foreign branch expenses and cross-border operational costs shall be excluded from domestic local content baseline tables.", "foreign-exclusion", "spend-analysis"],
      ["LCGPA-9", "Core local content calculation formulas, macros, and cell definitions shall not be altered without LCGPA authorization.", "formula-integrity", "local-content-intelligence"],
      ["LCGPA-10", "Supplier and spend classification shall follow LCGPA vendor lists and localization categories with evidence linkage.", "supplier-classification", "supplier-classification"],
      ["LCGPA-11", "Local content conclusions are assistive outputs — human reviewer approval required before regulatory submission.", "human-review-gate", "local-content-intelligence"],
      ["LCGPA-12", "Lineage from LC conclusions shall reference LCGPA rule, source spend evidence, audited FS inputs, and reviewer attestation.", "lineage-requirement", "evidence-catalog"],
    ],
  }),
  def({
    slug: "verification-matrix",
    catalogId: "kf-lc-verification-matrix",
    assetId: "kf-lc-d-verification-matrix",
    assetType: "D",
    code: "LC-VERIFICATION-MATRIX",
    name: "Facility-Level Core Baseline Compliance Verification Matrix",
    subdomain: "verification-procedures",
    versionLabel: "LC-VERIFICATION-MATRIX:v1",
    regulationReference: "ISRS 4400 / LCGPA Rules No. 1-4661-21",
    sourceArtifact: "Local_Content_Verification_Audit_Matrix_v1.xlsx",
    upstream: ["kf-lc-a-lcgpa-rules"],
    crossReferences: [
      { standard: "ISRS 4400", role: "aup-framework" },
      { catalogId: "kf-audit-isa-500", role: "evidence-baseline" },
    ],
    engines: ["local-content-intelligence", "evidence-catalog", "audit-intelligence"],
    procedures: VERIFICATION_CONTROLS,
  }),
];
