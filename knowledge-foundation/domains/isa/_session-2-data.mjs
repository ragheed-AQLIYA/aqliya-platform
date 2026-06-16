/**
 * Session 2 — ISA / ISQM governed rule extracts (17 standards)
 */
import { iaasbUrl } from "./_session-shared-audit.mjs";

function def(cfg) {
  const slug = cfg.slug;
  const code = cfg.code;
  const rules = cfg.rules.map((r, i) => ({
    ruleId: `${slug}-r${String(i + 1).padStart(3, "0")}`,
    paragraphReference: r[0],
    ruleText: r[1],
    topic: r[2],
    usage: r[3] ?? "audit-intelligence",
  }));
  const procedures = (cfg.procedures ?? []).map((p, i) => ({
    procedureId: `${slug}-p${String(i + 1).padStart(3, "0")}`,
    title: p[0],
    description: p[1],
    evidenceType: p[2],
    paragraphReference: p[3],
  }));
  const catalogSuffix = slug.replace("isa-", "isa-").replace("isqm-", "isqm-");
  return {
    slug,
    catalogId: `kf-audit-${slug}`,
    standardCode: code,
    standardName: cfg.name,
    sourceUrl: iaasbUrl(code),
    versionLabel: `${code}:2024`,
    issueDate: cfg.issue ?? "2009-01-01",
    effectiveDate: cfg.effective ?? "2010-01-01",
    assetId: `kf-audit-a-${slug}`,
    subdomain: cfg.subdomain ?? "isa-standards",
    domainPath: cfg.domainPath,
    crossDomainLinks: cfg.crossDomainLinks ?? [],
    engines: cfg.engines,
    rules,
    procedures,
  };
}

export const SESSION2_STANDARDS = [
  def({
    slug: "isa-315",
    code: "ISA 315",
    name: "Identifying and Assessing the Risks of Material Misstatement",
    effective: "2021-12-15",
    rules: [
      ["ISA 315.1", "The auditor shall identify and assess the risks of material misstatement at the financial statement and assertion levels through understanding the entity and its environment, including internal control.", "risk-assessment", "risk-library"],
      ["ISA 315.25", "The auditor shall obtain an understanding of the entity and its environment, including its internal control, to identify and assess risks of material misstatement.", "understanding-entity", "audit-intelligence"],
      ["ISA 315.28", "The auditor shall identify risks of material misstatement at the financial statement level and at the assertion level for classes of transactions, account balances and disclosures.", "identify-risks", "risk-library"],
      ["ISA 315.32", "The auditor shall assess whether identified risks relate pervasively to the financial statements and may affect many assertions.", "pervasive-risks", "risk-library"],
    ],
    procedures: [
      ["Risk assessment planning", "Document understanding of entity industry, regulation, and applicable financial reporting framework.", "planning-memo", "ISA 315.A1"],
      ["Internal control walkthrough", "Perform walkthroughs for significant classes of transactions to understand control design and implementation.", "walkthrough-evidence", "ISA 315.29"],
    ],
  }),
  def({
    slug: "isa-330",
    code: "ISA 330",
    name: "The Auditor's Responses to Assessed Risks",
    effective: "2009-12-15",
    rules: [
      ["ISA 330.6", "The auditor shall design and implement overall responses to address assessed risks of material misstatement at the financial statement level.", "overall-responses", "audit-intelligence"],
      ["ISA 330.8", "The auditor shall design and perform further audit procedures whose nature, timing and extent are responsive to assessed risks at the assertion level.", "further-procedures", "evidence-catalog"],
      ["ISA 330.18", "For significant risks, the auditor shall perform substantive procedures that are specifically responsive to the risk.", "significant-risks", "findings-library"],
      ["ISA 330.26", "The auditor shall determine whether sufficient appropriate audit evidence has been obtained from the auditor's overall responses and further audit procedures.", "sufficient-evidence", "evidence-catalog"],
    ],
    procedures: [
      ["Substantive test design", "Design substantive procedures responsive to assessed risks for each significant account balance.", "procedure-design", "ISA 330.18"],
    ],
  }),
  def({
    slug: "isa-500",
    code: "ISA 500",
    name: "Audit Evidence",
    effective: "2009-12-15",
    rules: [
      ["ISA 500.6", "The auditor shall obtain sufficient appropriate audit evidence to reduce audit risk to an acceptably low level and draw reasonable conclusions.", "sufficient-appropriate", "evidence-catalog"],
      ["ISA 500.8", "Audit evidence is more reliable when it is obtained from independent sources outside the entity and when it consists of documentary evidence.", "reliability-factors", "evidence-catalog"],
      ["ISA 500.11", "In assessing the sufficiency and appropriateness of audit evidence, the auditor shall consider the relevance and reliability of information to be used as audit evidence.", "assess-evidence", "evidence-catalog"],
      ["ISA 500.17", "The auditor shall design and perform substantive procedures for each material class of transactions, account balance and disclosure.", "substantive-procedures", "audit-intelligence"],
    ],
    procedures: [
      ["Evidence reliability assessment", "Evaluate source, nature, and circumstances of evidence obtained for key assertions.", "evidence-evaluation", "ISA 500.A1"],
      ["Vouching sample", "Inspect supporting documents for sample of transactions to verify occurrence and accuracy.", "vouching", "ISA 500.6"],
    ],
  }),
  def({
    slug: "isa-540",
    code: "ISA 540",
    name: "Auditing Accounting Estimates and Related Disclosures",
    effective: "2019-12-15",
    crossDomainLinks: [
      { standardCode: "IAS 36", catalogId: "kf-acct-ifrs-ias-36", relationship: "informs-audit-of" },
      { standardCode: "IFRS 9", catalogId: "kf-acct-ifrs-ifrs-9", relationship: "informs-audit-of" },
    ],
    rules: [
      ["ISA 540.6", "The auditor shall obtain sufficient appropriate audit evidence about whether accounting estimates and related disclosures in the financial statements are reasonable.", "scope", "audit-intelligence"],
      ["ISA 540.13", "The auditor shall obtain an understanding of how management identifies the need for accounting estimates and how estimation uncertainty is addressed.", "understanding-estimates", "risk-library"],
      ["ISA 540.17", "The auditor shall assess the risks of material misstatement related to accounting estimates, including estimation uncertainty and management bias.", "assess-estimate-risk", "risk-library"],
      ["ISA 540.33", "For accounting estimates with higher estimation uncertainty, the auditor shall design and perform further audit procedures to address the assessed risks.", "higher-uncertainty", "evidence-catalog"],
    ],
    procedures: [
      ["Estimate reasonableness review", "Evaluate management's assumptions, methods, and data used in significant accounting estimates.", "estimate-workpaper", "ISA 540.33"],
    ],
  }),
  def({
    slug: "isa-700",
    code: "ISA 700",
    name: "Forming an Opinion and Reporting on Financial Statements",
    effective: "2016-12-15",
    rules: [
      ["ISA 700.11", "The auditor shall form an opinion on whether the financial statements are prepared, in all material respects, in accordance with the applicable financial reporting framework.", "form-opinion", "audit-intelligence"],
      ["ISA 700.14", "The auditor shall evaluate whether the financial statements achieve fair presentation, including considering the overall presentation, structure and content.", "fair-presentation", "findings-library"],
      ["ISA 700.36", "The auditor's report shall include an opinion section with a clear written expression of opinion on the financial statements.", "opinion-section", "findings-library"],
      ["ISA 700.41", "When the auditor expresses an unmodified opinion, the opinion section shall use the heading 'Opinion' and state that the financial statements present fairly.", "unmodified-opinion", "findings-library"],
    ],
    procedures: [
      ["Final analytical review", "Perform analytical procedures near the end of the audit to identify unusual or unexpected relationships.", "analytical-review", "ISA 700.A1"],
    ],
  }),
  def({
    slug: "isqm-1",
    code: "ISQM 1",
    name: "International Standard on Quality Management 1",
    effective: "2022-12-15",
    subdomain: "isqm",
    domainPath: "knowledge-foundation/domains/isqm/isqm-1/",
    engines: ["audit-intelligence", "risk-library"],
    rules: [
      ["ISQM 1.27", "The firm shall design, implement and operate a system of quality management for audits or reviews of financial statements or other assurance engagements.", "sqm-system", "audit-intelligence"],
      ["ISQM 1.33", "The firm shall establish quality objectives that address each of the quality management components in this Standard.", "quality-objectives", "risk-library"],
      ["ISQM 1.41", "The firm shall establish policies or procedures that address acceptance and continuance of client relationships and specific engagements.", "acceptance-continuance", "audit-intelligence"],
      ["ISQM 1.56", "The individual assigned ultimate responsibility for the system of quality management shall design and implement monitoring activities and take appropriate remedial actions.", "monitoring", "risk-library"],
    ],
    procedures: [
      ["Engagement acceptance checklist", "Evaluate integrity of client, firm competence, independence, and ethical requirements before acceptance.", "acceptance-checklist", "ISQM 1.41"],
    ],
  }),
  def({
    slug: "isa-200",
    code: "ISA 200",
    name: "Overall Objectives of the Independent Auditor",
    effective: "2009-12-15",
    rules: [
      ["ISA 200.11", "The auditor shall obtain reasonable assurance about whether the financial statements as a whole are free from material misstatement, whether due to fraud or error.", "overall-objective", "audit-intelligence"],
      ["ISA 200.13", "Professional scepticism includes being alert to conditions that may indicate possible misstatement due to fraud or error.", "professional-scepticism", "audit-intelligence"],
      ["ISA 200.15", "The auditor shall comply with all ISAs relevant to the audit and plan and perform the audit with professional scepticism.", "comply-isas", "audit-intelligence"],
      ["ISA 200.18", "The auditor shall exercise professional judgment in planning and performing an audit of financial statements.", "professional-judgment", "audit-intelligence"],
    ],
  }),
  def({
    slug: "isa-210",
    code: "ISA 210",
    name: "Agreeing the Terms of Audit Engagements",
    effective: "2009-12-15",
    rules: [
      ["ISA 210.9", "The auditor shall establish whether the preconditions for an audit are present before accepting the engagement.", "preconditions", "audit-intelligence"],
      ["ISA 210.10", "Financial statements are prepared in accordance with an applicable financial reporting framework and management acknowledges its responsibility for internal control.", "precondition-framework", "audit-intelligence"],
      ["ISA 210.13", "The auditor shall agree the terms of the audit engagement with management or those charged with governance in an audit engagement letter.", "engagement-letter", "audit-intelligence"],
      ["ISA 210.25", "On recurring audits, the auditor shall assess whether circumstances require revision of the engagement letter.", "recurring-audit", "audit-intelligence"],
    ],
  }),
  def({
    slug: "isa-220",
    code: "ISA 220",
    name: "Quality Management for an Audit of Financial Statements",
    effective: "2022-12-15",
    rules: [
      ["ISA 220.9", "The engagement partner shall take responsibility for the overall quality of the audit engagement performed.", "engagement-partner", "audit-intelligence"],
      ["ISA 220.12", "The engagement partner shall be satisfied that the engagement team and any auditor's experts collectively have appropriate competence and capabilities.", "competence", "audit-intelligence"],
      ["ISA 220.17", "The engagement partner shall take responsibility for direction, supervision and performance of the audit engagement.", "direction-supervision", "audit-intelligence"],
      ["ISA 220.21", "The engagement partner shall take responsibility for the auditor's report being appropriate in the circumstances.", "report-responsibility", "findings-library"],
    ],
  }),
  def({
    slug: "isa-240",
    code: "ISA 240",
    name: "The Auditor's Responsibilities Relating to Fraud",
    effective: "2009-12-15",
    rules: [
      ["ISA 240.11", "The auditor shall maintain professional scepticism throughout the audit, recognizing that fraud may exist notwithstanding past integrity.", "scepticism-fraud", "risk-library"],
      ["ISA 240.25", "The auditor shall discuss the susceptibility of the entity's financial statements to material misstatement due to fraud among the engagement team.", "fraud-discussion", "risk-library"],
      ["ISA 240.28", "The auditor shall inquire of management and others within the entity about risks of fraud and how fraud is addressed.", "fraud-inquiry", "evidence-catalog"],
      ["ISA 240.32", "When the auditor identifies a fraud risk factor, the auditor shall assess whether a risk of material misstatement due to fraud exists.", "fraud-risk-factors", "risk-library"],
    ],
    procedures: [
      ["Fraud brainstorming", "Document team discussion of fraud risks including incentives, opportunities, and rationalization.", "fraud-brainstorm-memo", "ISA 240.25"],
    ],
  }),
  def({
    slug: "isa-250",
    code: "ISA 250",
    name: "Consideration of Laws and Regulations",
    effective: "2009-12-15",
    rules: [
      ["ISA 250.13", "The auditor shall obtain a general understanding of the legal and regulatory framework applicable to the entity and how the entity complies.", "understand-laws", "audit-intelligence"],
      ["ISA 250.17", "The auditor shall perform procedures to identify instances of non-compliance with laws and regulations that may have a material effect on the financial statements.", "identify-noncompliance", "findings-library"],
      ["ISA 250.20", "If the auditor becomes aware of information concerning an instance of non-compliance, the auditor shall obtain further information and consult within the firm.", "respond-noncompliance", "findings-library"],
      ["ISA 250.23", "The auditor shall request management to disclose identified or suspected non-compliance to those charged with governance unless prohibited by law.", "communicate-tcg", "findings-library"],
    ],
  }),
  def({
    slug: "isa-260",
    code: "ISA 260",
    name: "Communication with Those Charged with Governance",
    effective: "2009-12-15",
    rules: [
      ["ISA 260.13", "The auditor shall determine the appropriate person(s) within the entity's governance structure with whom to communicate.", "identify-tcg", "audit-intelligence"],
      ["ISA 260.16", "The auditor shall communicate with those charged with governance the responsibilities of the auditor and an overview of the planned scope and timing of the audit.", "communicate-scope", "audit-intelligence"],
      ["ISA 260.19", "The auditor shall communicate significant findings from the audit with those charged with governance.", "significant-findings", "findings-library"],
      ["ISA 260.21", "The auditor shall communicate deficiencies in internal control of sufficient importance with those charged with governance.", "control-deficiencies", "findings-library"],
    ],
  }),
  def({
    slug: "isa-570",
    code: "ISA 570",
    name: "Going Concern",
    effective: "2009-12-15",
    crossDomainLinks: [
      { standardCode: "IAS 1", catalogId: "kf-acct-ifrs-ias-1", relationship: "informs-audit-of" },
    ],
    rules: [
      ["ISA 570.10", "The auditor shall obtain sufficient appropriate audit evidence regarding, and conclude on, the appropriateness of management's use of the going concern assumption.", "going-concern-evidence", "audit-intelligence"],
      ["ISA 570.12", "The auditor shall evaluate whether there are events or conditions that may cast significant doubt on the entity's ability to continue as a going concern.", "significant-doubt", "risk-library"],
      ["ISA 570.22", "If events or conditions have been identified that may cast significant doubt, the auditor shall obtain sufficient appropriate audit evidence to determine whether a material uncertainty exists.", "material-uncertainty", "findings-library"],
      ["ISA 570.24", "Based on the audit evidence obtained, the auditor shall conclude whether a material uncertainty exists related to going concern.", "conclusion", "findings-library"],
    ],
  }),
  def({
    slug: "isa-580",
    code: "ISA 580",
    name: "Written Representations",
    effective: "2009-12-15",
    rules: [
      ["ISA 580.9", "The auditor shall request written representations from management and, where appropriate, those charged with governance.", "request-representations", "evidence-catalog"],
      ["ISA 580.10", "Written representations shall cover the financial statements, completeness of information, recognition of responsibilities, and other matters required by ISAs.", "representation-content", "evidence-catalog"],
      ["ISA 580.14", "The date of written representations shall be as near as practicable to the date of the auditor's report but not after.", "representation-date", "evidence-catalog"],
      ["ISA 580.20", "If management does not provide requested written representations, the auditor shall discuss the matter with management and re-evaluate the integrity of management.", "refusal", "findings-library"],
    ],
  }),
  def({
    slug: "isa-705",
    code: "ISA 705",
    name: "Modifications to the Opinion in the Independent Auditor's Report",
    effective: "2016-12-15",
    rules: [
      ["ISA 705.6", "The auditor shall modify the opinion in the auditor's report when the auditor concludes that the financial statements are materially misstated or unable to obtain sufficient appropriate evidence.", "modify-opinion", "findings-library"],
      ["ISA 705.8", "A qualified opinion shall be expressed when misstatements are material but not pervasive, or when unable to obtain sufficient evidence regarding material but not pervasive matters.", "qualified", "findings-library"],
      ["ISA 705.9", "An adverse opinion shall be expressed when misstatements are material and pervasive.", "adverse", "findings-library"],
      ["ISA 705.10", "A disclaimer of opinion shall be expressed when unable to obtain sufficient appropriate evidence about material and pervasive matters.", "disclaimer", "findings-library"],
    ],
  }),
  def({
    slug: "isa-706",
    code: "ISA 706",
    name: "Emphasis of Matter Paragraphs and Other Matter Paragraphs",
    effective: "2016-12-15",
    rules: [
      ["ISA 706.6", "The auditor shall include an Emphasis of Matter paragraph in the auditor's report when the auditor considers it necessary to draw users' attention to a matter presented or disclosed in the financial statements.", "emphasis-of-matter", "findings-library"],
      ["ISA 706.7", "The Emphasis of Matter paragraph shall refer to the matter and indicate that the auditor's opinion is not modified in respect of that matter.", "eom-wording", "findings-library"],
      ["ISA 706.10", "The auditor shall include an Other Matter paragraph when it is necessary to communicate a matter other than those presented or disclosed in the financial statements.", "other-matter", "findings-library"],
      ["ISA 706.11", "The Other Matter paragraph shall be presented in a separate section with an appropriate heading.", "other-matter-presentation", "findings-library"],
    ],
  }),
];
