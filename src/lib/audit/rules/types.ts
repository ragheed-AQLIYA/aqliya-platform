/**
 * IFRS Rules Engine — types (AuditOS 2.0 Phase 6)
 */

export type IfrsRuleStatus =
  | "pass"
  | "fail"
  | "warning"
  | "advisory"
  | "skipped";

export interface IfrsKnowledgeRule {
  ruleId: string;
  paragraphReference: string;
  ruleText: string;
  topic: string;
  standardCode: string;
  versionLabel?: string;
  confidenceScore?: number;
}

export interface IfrsRagCitation {
  chunkId: string;
  documentId: string;
  standardCode: string;
  paragraphRef: string;
  contentPreview: string;
  relevance: number; // 0-1 similarity score
  sourceUrl?: string;
}

export interface IfrsRuleEvaluation {
  ruleId: string;
  standardCode: string;
  paragraphReference: string;
  topic: string;
  status: IfrsRuleStatus;
  messageAr: string;
  messageEn: string;
  linkedStatementTypes?: string[];
  ragCitations?: IfrsRagCitation[];
}

export interface DisclosureTrigger {
  suggestedTitle: string;
  suggestedNoteType: string;
  ruleId: string;
  standardCode: string;
  reasonAr: string;
  reasonEn: string;
  priority: "high" | "medium" | "low";
}

export interface IfrsRulesRunResult {
  engagementId: string;
  passed: boolean;
  ruleCount: number;
  failedCount: number;
  warningCount: number;
  evaluations: IfrsRuleEvaluation[];
  disclosureTriggers: DisclosureTrigger[];
  runAt: string;
}

/** Topics with deterministic runtime checks */
export const EXECUTABLE_IFRS_TOPICS = new Set([
  // IAS 1 — Presentation of Financial Statements
  "complete-set",
  "going-concern",
  "no-offsetting",
  "materiality-presentation",
  "note-disclosure",
  "oci-presentation",
  // IFRS 15 — Revenue from Contracts with Customers
  "five-step-model",
  "contract-identification",
  // IAS 16 — Property, Plant and Equipment
  "definition",
  "initial-measurement",
  "depreciation",
  // IFRS 16 — Leases
  "initial-recognition",
  "lease-liability-measurement",
  "rou-asset-measurement",
  "lease-definition",
  // IAS 7 — Statement of Cash Flows (also IFRS 9, IAS 32 classification)
  "classification",
  "operating-method",
  // IAS 2 — Inventories
  "measurement",
  "cost-components",
  "specific-identification",
  "cost-formulas",
  // IAS 12 — Income Taxes
  "current-tax-liability",
  "deferred-tax-liability",
  "deferred-tax-asset",
  "tax-expense-recognition",
  "tax-rate-measurement",
  "tax-offsetting",
  // IAS 36 — Impairment of Assets
  "indicator-assessment",
  "recoverable-amount",
  "impairment-loss",
  "reversal",
  // IFRS 3 — Business Combinations
  "acquisition-method",
  "identify-acquirer",
  "fair-value",
  "goodwill",
  // IFRS 13 — Fair Value Measurement
  "fair-value-definition",
  "valuation-techniques",
  "fair-value-hierarchy",
  "disclosure",
  // IAS 21 — The Effects of Changes in Foreign Exchange Rates
  "functional-currency",
  "transaction-rate",
  "reporting-rate",
  "exchange-differences",
  "fx-disclosure",
  // IAS 24 — Related Party Disclosures
  "rp-disclosure",
  "kmp-compensation",
  "rp-transactions",
  "arm-length",
  // IAS 40 — Investment Property
  "ip-definition",
  "ip-measurement",
  "ip-fair-value",
  "ip-disclosure",
  // IAS 33 — Earnings per Share
  "basic-eps",
  "diluted-eps",
  "eps-reconciliation",
  "eps-share-reconciliation",
  // IAS 27 — Separate Financial Statements
  "separate-fs-measurement",
  "separate-fs-consistency",
  "separate-fs-disclosure",
  "separate-fs-judgements",
  // IAS 20 — Government Grants
  "grant-recognition",
  "grant-compensation",
  "grant-presentation",
  "grant-disclosure",
  // IAS 28 — Investments in Associates and Joint Ventures
  "equity-method-application",
  "equity-method-initial-recognition",
  "equity-method-cessation",
  "equity-method-disclosure",
  // IFRS 18 — Presentation and Disclosure in Financial Statements
  "income-expense-categorisation",
  "operating-expense-classification",
  "mpm-disclosure",
  "expense-disaggregation",
  // IAS 10 — Events After the Reporting Period
  "adjusting-events",
  "non-adjusting-events",
  "dividends",
  // IFRS 9 — Financial Instruments
  "amortised-cost",
  "liability-measurement",
  "expected-credit-loss",
  "ecl-staging",
  "hedge-accounting",
  // IAS 32 — Financial Instruments Presentation
  "equity-instrument",
  "financial-liability",
  "treasury-shares",
  // IAS 38 — Intangible Assets
  "recognition",
  "expense-vs-capitalise",
  "amortisation",
  // IFRS 16 — Leases (remaining topics)
  "subsequent-lease-liability",
  "depreciation-interest",
  // IAS 16 — PPE (remaining topic)
  "derecognition",
  // IAS 7 — Cash Flows (remaining topics)
  "investing",
  "financing",
  // IFRS 15 — Revenue (remaining topics)
  "performance-obligations",
  "distinct-goods-services",
  "transaction-price-allocation",
  "revenue-recognition-timing",
  // IAS 34 — Interim Financial Reporting
  "interim-period-measurement",
  "interim-disclosure",
  "interim-tax-reconciliation",
  "interim-impairment-assessment",
  // IFRS 6 — Exploration for and Evaluation of Mineral Resources
  "exploration-evaluation-measurement",
  "exploration-evaluation-classification",
  "exploration-evaluation-impairment",
  "exploration-evaluation-disclosure",
  // IAS 41 — Agriculture
  "biological-asset-recognition",
  "biological-asset-measurement",
  "agricultural-produce-measurement",
  "agricultural-disclosure",
  // IFRS 19 — Subsidiaries without Public Accountability: Disclosures
  "subsidiary-scope-election",
  "subsidiary-election-disclosure",
  "subsidiary-eligibility-assessment",
  "subsidiary-effective-date",
  // IFRS 4 — Insurance Contracts (Phase I)
  "insurance-liability-recognition",
  "insurance-liability-adequacy-test",
  "insurance-liability-derecognition",
  "insurance-disclosure",
  // IFRS 14 — Regulatory Deferral Accounts
  "regulatory-deferral-classification",
  "regulatory-deferral-presentation",
  "regulatory-deferral-cash-flow",
  "regulatory-deferral-disclosure",
  // IAS 26 — Accounting and Reporting by Retirement Benefit Plans
  "retirement-plan-asset-measurement",
  "retirement-plan-obligation-measurement",
  "retirement-plan-contribution-recognition",
  "retirement-plan-disclosure",
  // IAS 29 — Financial Reporting in Hyperinflationary Economies
  "hyperinflation-restatement",
  "hyperinflation-comparative-restatement",
  "hyperinflation-non-monetary-items",
  "hyperinflation-disclosure",
  // IAS 19 — Employee Benefits
  "scope",
  "short-term",
  "defined-benefit",
  "puc-method",
  // IAS 23 — Borrowing Costs
  "capitalisation",
  "eligible-costs",
  "commencement",
  "cessation",
  // IAS 37 — Provisions, Contingent Liabilities and Contingent Assets
  "provision-definition",
  "recognition",
  "measurement",
  "contingent-liability",
  // IAS 8 — Accounting Policies, Changes in Accounting Estimates and Errors
  "policy-selection",
  "policy-change",
  "estimate-change",
  "error-correction",
  // IFRS 2 — Share-based Payment
  "equity-settled",
  "cash-settled",
  "vesting-period",
  // IFRS 5 — Non-current Assets Held for Sale and Discontinued Operations
  "held-for-sale",
  "discontinued-operations",
  "no-depreciation",
  // IFRS 7 — Financial Instruments: Disclosures
  "significance-disclosure",
  "carrying-amounts",
  "risk-disclosure",
  "ecl-disclosure",
  // IFRS 8 — Operating Segments
  "codm-basis",
  "segment-definition",
  "segment-measures",
  "reconciliation",
  // IFRS 10 — Consolidated Financial Statements
  "consolidation-requirement",
  "control-definition",
  "consolidation-procedure",
  "uniform-policies",
  // IFRS 11 — Joint Arrangements
  "joint-arrangement",
  "joint-operation",
  "joint-venture",
  "equity-method",
  // IFRS 12 — Disclosure of Interests in Other Entities
  "subsidiary-disclosure",
  "joint-associate-disclosure",
  "structured-entities",
  // IFRS 1 — First-time Adoption of IFRS
  "first-ifrs-statements",
  "opening-statement",
  "retrospective-application",
  // IFRS 17 — Insurance Contracts
  "general-model",
  "recognition",
  "revenue-separation",
  // IFRIC 10 — Interim Financial Reporting and Impairment
  "interim-impairment",
  "ias36-link",
  "testing-consistency",
  // IFRIC 12 — Service Concession Arrangements
  "financial-vs-intangible",
  "operation-services",
  "maintenance-obligation",
  // IFRIC 19 — Extinguishing Financial Liabilities with Equity Instruments
  "fallback-measurement",
  "gain-loss",
  // IFRIC 23 — Uncertainty Over Income Tax Treatments
  "unit-of-account",
  "examination-assumption",
  "probable-acceptance",
  "reflect-uncertainty",
  // IFRS for SMEs
  "fair-presentation",
  "revenue-goods",
  "ppe-measurement",
  "income-tax-smes",
  "consistency",
]);

/** SOCPA overlay — AuditOS 2.0 Phase 7 */
export type SocpaRuleStatus = IfrsRuleStatus;

export interface SocpaKnowledgeRule {
  ruleId: string;
  paragraphReference: string;
  ruleText: string;
  topic: string;
  standardCode: string;
  versionLabel?: string;
  confidenceScore?: number;
  jurisdiction?: string;
}

export interface SocpaRuleEvaluation {
  ruleId: string;
  standardCode: string;
  paragraphReference: string;
  topic: string;
  status: SocpaRuleStatus;
  messageAr: string;
  messageEn: string;
  linkedStatementTypes?: string[];
}

export interface SocpaDisclosureTrigger {
  suggestedTitle: string;
  suggestedNoteType: string;
  ruleId: string;
  standardCode: string;
  reasonAr: string;
  reasonEn: string;
  priority: "high" | "medium" | "low";
}

export interface SocpaRulesRunResult {
  engagementId: string;
  jurisdictionApplicable: boolean;
  passed: boolean;
  ruleCount: number;
  failedCount: number;
  warningCount: number;
  evaluations: SocpaRuleEvaluation[];
  disclosureTriggers: SocpaDisclosureTrigger[];
  runAt: string;
}

export const EXECUTABLE_SOCPA_TOPICS = new Set([
  "framework-scope",
  "fair-presentation",
  "framework-disclosure",
  "full-ifrs",
  "ifrs-smes-eligibility",
  "supplementary-disclosure",
  "zakat-presentation",
  "separate-disclosure",
  "reconciliation",
  "ias12-overlay",
  "overlay-principle",
  "routing-gate",
  "lineage-required",
]);

/** ISA knowledge runtime — Tier 2 IC-P3-02 */
export type IsaRuleStatus = IfrsRuleStatus;

export interface IsaKnowledgeRule {
  ruleId: string;
  paragraphReference: string;
  ruleText: string;
  topic: string;
  standardCode: string;
  versionLabel?: string;
  confidenceScore?: number;
}

export interface IsaRuleEvaluation {
  ruleId: string;
  standardCode: string;
  paragraphReference: string;
  topic: string;
  status: IsaRuleStatus;
  messageAr: string;
  messageEn: string;
}

export interface IsaRulesRunResult {
  engagementId: string;
  passed: boolean;
  ruleCount: number;
  failedCount: number;
  warningCount: number;
  evaluations: IsaRuleEvaluation[];
  runAt: string;
}

export const EXECUTABLE_ISA_TOPICS = new Set([
  "risk-assessment",
  "understanding-entity",
  "identify-risks",
  "pervasive-risks",
  "engagement-partner",
  "competence",
  "direction-supervision",
  "report-responsibility",
]);
