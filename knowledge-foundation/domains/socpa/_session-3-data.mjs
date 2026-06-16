/**
 * Session 3 — SOCPA jurisdiction knowledge (8 assets)
 */
function def(cfg) {
  const rules = cfg.rules.map((r, i) => ({
    ruleId: `${cfg.slug}-r${String(i + 1).padStart(3, "0")}`,
    paragraphReference: r[0],
    ruleText: r[1],
    topic: r[2],
  }));
  return {
    slug: cfg.slug,
    catalogId: `kf-socpa-${cfg.slug}`,
    standardCode: cfg.code,
    standardName: cfg.name,
    assetId: `kf-socpa-a-${cfg.slug}`,
    assetType: cfg.assetType ?? "A",
    domain: cfg.domain,
    subdomain: cfg.subdomain,
    versionLabel: `${cfg.code}:2024`,
    issueDate: "2010-01-01",
    effectiveDate: cfg.effective ?? "2017-01-01",
    upstreamAssetIds: cfg.upstream ?? [],
    jurisdictionOverlay: cfg.overlay != null,
    overlay: cfg.overlay,
    engines: cfg.engines,
    rules,
  };
}

export const SESSION3_STANDARDS = [
  def({
    slug: "socpa-accounting-framework",
    code: "SOCPA-ACCOUNTING-FRAMEWORK",
    name: "SOCPA Accounting Framework",
    domain: "accounting",
    subdomain: "socpa-accounting",
    rules: [
      ["SOCPA-AF-1", "Entities in Saudi Arabia shall apply SOCPA-approved accounting standards including IFRS adoption requirements as mandated for their entity category.", "framework-scope", "tb-intelligence"],
      ["SOCPA-AF-2", "Financial statements shall present fairly the financial position and performance in accordance with the adopted reporting framework.", "fair-presentation", "disclosure-engine"],
      ["SOCPA-AF-3", "Entities shall disclose the applicable financial reporting framework in the notes to the financial statements.", "framework-disclosure", "disclosure-engine"],
      ["SOCPA-AF-4", "First-time adoption of IFRS in KSA shall follow SOCPA transition requirements without destroying prior framework version history.", "transition", "mapping-engine"],
    ],
    overlay: {
      baseStandards: [{ catalogId: "kf-acct-ifrs-ias-1", standardCode: "IAS 1" }],
      rules: [{ topic: "presentation-overlay", jurisdiction: "saudi-arabia" }],
    },
  }),
  def({
    slug: "socpa-ifrs-adoption",
    code: "SOCPA-IFRS-ADOPTION",
    name: "SOCPA IFRS Adoption Requirements",
    domain: "accounting",
    subdomain: "socpa-accounting",
    upstream: ["kf-accounting-a-ifrs-15", "kf-accounting-a-ias-1"],
    rules: [
      ["SOCPA-IFRS-1", "Listed companies and certain regulated entities shall apply full IFRS as adopted in Saudi Arabia.", "full-ifrs", "tb-intelligence"],
      ["SOCPA-IFRS-2", "Qualifying non-public entities may apply IFRS for SMEs subject to SOCPA eligibility criteria.", "ifrs-smes-eligibility", "tb-intelligence"],
      ["SOCPA-IFRS-3", "IFRS adoption does not eliminate SOCPA supplementary disclosure requirements for zakat and tax.", "supplementary-disclosure", "disclosure-engine"],
      ["SOCPA-IFRS-4", "Jurisdiction overlay shall link to base IFRS assets without replacing IFRS version history.", "overlay-lineage", "mapping-engine"],
    ],
    overlay: {
      baseStandards: [
        { catalogId: "kf-acct-ifrs-ifrs-for-smes", standardCode: "IFRS for SMEs" },
        { catalogId: "kf-acct-ifrs-ifrs-15", standardCode: "IFRS 15" },
      ],
    },
  }),
  def({
    slug: "socpa-zakat-tax",
    code: "SOCPA-ZAKAT-TAX",
    name: "SOCPA Zakat and Tax Presentation",
    domain: "accounting",
    subdomain: "socpa-accounting",
    rules: [
      ["SOCPA-ZT-1", "Entities subject to zakat shall present zakat obligations in accordance with SOCPA guidance alongside IFRS financial statements.", "zakat-presentation", "disclosure-engine"],
      ["SOCPA-ZT-2", "Income tax and zakat charges shall be disclosed separately where material to users of the financial statements.", "separate-disclosure", "disclosure-engine"],
      ["SOCPA-ZT-3", "Deferred tax and zakat bases may differ — reconciliation disclosures required where applicable.", "reconciliation", "mapping-engine"],
      ["SOCPA-ZT-4", "Zakat and tax accounting shall maintain lineage to IAS 12 base rules with SOCPA jurisdiction overlay.", "ias12-overlay", "tb-intelligence"],
    ],
    overlay: { baseStandards: [{ catalogId: "kf-acct-ifrs-ias-12", standardCode: "IAS 12" }] },
  }),
  def({
    slug: "socpa-auditing-standards",
    code: "SOCPA-AUDITING-STANDARDS",
    name: "SOCPA Auditing Standards",
    domain: "audit",
    subdomain: "socpa-audit",
    engines: ["audit-intelligence", "evidence-catalog"],
    rules: [
      ["SOCPA-AUD-1", "Audit engagements in Saudi Arabia shall be conducted in accordance with SOCPA-adopted ISA standards.", "isa-adoption", "audit-intelligence"],
      ["SOCPA-AUD-2", "The auditor shall comply with SOCPA regulatory registration and quality requirements applicable in KSA.", "regulatory-compliance", "audit-intelligence"],
      ["SOCPA-AUD-3", "Audit documentation shall support the auditor's report and comply with SOCPA retention requirements.", "documentation", "evidence-catalog"],
      ["SOCPA-AUD-4", "Auditor reporting in KSA shall follow SOCPA formats while maintaining ISA opinion requirements.", "reporting-format", "findings-library"],
    ],
    overlay: { baseStandards: [{ catalogId: "kf-audit-isa-700", standardCode: "ISA 700" }] },
  }),
  def({
    slug: "socpa-isa-alignment",
    code: "SOCPA-ISA-ALIGNMENT",
    name: "SOCPA ISA Alignment",
    domain: "audit",
    subdomain: "socpa-audit",
    upstream: ["kf-audit-isa-315", "kf-audit-isa-500"],
    rules: [
      ["SOCPA-ISA-1", "SOCPA auditing standards are aligned with ISA — ISA base assets govern audit methodology in KSA.", "isa-alignment", "audit-intelligence"],
      ["SOCPA-ISA-2", "Where SOCPA issues KSA-specific audit guidance, it applies as jurisdiction overlay to the relevant ISA standard.", "ksa-guidance", "risk-library"],
      ["SOCPA-ISA-3", "Risk assessment and evidence requirements follow ISA 315 and ISA 500 unless SOCPA overlay specifies additional procedures.", "risk-evidence", "evidence-catalog"],
      ["SOCPA-ISA-4", "Lineage from audit conclusions shall reference both ISA base rule and SOCPA overlay when applicable.", "dual-lineage", "findings-library"],
    ],
    overlay: {
      baseStandards: [
        { catalogId: "kf-audit-isa-315", standardCode: "ISA 315" },
        { catalogId: "kf-audit-isa-500", standardCode: "ISA 500" },
      ],
    },
  }),
  def({
    slug: "socpa-circulars",
    code: "SOCPA-CIRCULARS",
    name: "SOCPA Regulatory Circulars",
    domain: "accounting",
    subdomain: "socpa-accounting",
    rules: [
      ["SOCPA-CIR-1", "SOCPA circulars with effective regulatory force shall be admitted as Authority A rules with version and effective date.", "circular-admission", "tb-intelligence"],
      ["SOCPA-CIR-2", "Each circular must reference its issue date, effective date, and superseded circulars without destroying version history.", "circular-versioning", "mapping-engine"],
      ["SOCPA-CIR-3", "Circulars affecting IFRS application shall be linked as jurisdiction overlay to the affected IFRS/IAS asset.", "circular-overlay", "mapping-engine"],
      ["SOCPA-CIR-4", "Entities shall monitor SOCPA circular updates and assess impact on financial reporting and audit procedures.", "monitoring", "audit-intelligence"],
    ],
  }),
  def({
    slug: "socpa-professional-conduct",
    code: "SOCPA-PROFESSIONAL-CONDUCT",
    name: "SOCPA Professional Conduct and Ethics",
    domain: "audit",
    subdomain: "socpa-audit",
    rules: [
      ["SOCPA-PC-1", "Licensed accounting professionals shall comply with SOCPA code of professional conduct and ethics.", "code-compliance", "audit-intelligence"],
      ["SOCPA-PC-2", "Independence requirements for audit engagements shall follow SOCPA and ISA 220 requirements in KSA.", "independence", "audit-intelligence"],
      ["SOCPA-PC-3", "Conflicts of interest shall be identified, evaluated and addressed before acceptance or continuance of engagements.", "conflicts", "audit-intelligence"],
      ["SOCPA-PC-4", "Breaches of professional conduct shall be documented and reported per SOCPA disciplinary framework.", "breach-reporting", "findings-library"],
    ],
    overlay: { baseStandards: [{ catalogId: "kf-audit-isa-220", standardCode: "ISA 220" }] },
  }),
  def({
    slug: "socpa-jurisdiction-overlay",
    code: "SOCPA-JURISDICTION-OVERLAY",
    name: "SOCPA Jurisdiction Overlay Model",
    assetType: "B",
    domain: "accounting",
    subdomain: "socpa-accounting",
    rules: [
      ["SOCPA-JO-1", "SOCPA jurisdiction overlays supplement but do not replace IFRS Foundation or IAASB base standards.", "overlay-principle", "mapping-engine"],
      ["SOCPA-JO-2", "Every overlay asset shall maintain lineageParentId linking to the base IFRS or ISA asset.", "lineage-required", "mapping-engine"],
      ["SOCPA-JO-3", "Base standard version history must never be destroyed when admitting SOCPA overlays.", "version-preservation", "mapping-engine"],
      ["SOCPA-JO-4", "TB Intelligence and Mapping Engine shall apply SOCPA overlay only when engagement jurisdiction is saudi-arabia.", "routing-gate", "tb-intelligence"],
    ],
    overlay: {
      baseStandards: [
        { catalogId: "kf-acct-ifrs-ifrs-15", standardCode: "IFRS 15" },
        { catalogId: "kf-audit-isa-700", standardCode: "ISA 700" },
      ],
      rules: [{ topic: "master-overlay-gate", jurisdiction: "saudi-arabia" }],
    },
  }),
];
