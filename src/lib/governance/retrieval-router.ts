import { GovernanceTaskType, GovernanceContext } from "./runtime-types";

const GOVERNANCE_TASK_MAP: Record<GovernanceTaskType, GovernanceContext> = {
  trial_balance_upload: {
    taskType: "trial_balance_upload",
    doctrineReferences: [
      {
        documentId: "09.01",
        title: "Data Trust Theory",
        principle:
          "Data trust is the governed determination that a dataset is sufficiently reliable",
        relevance: "TB upload requires data trust assessment",
      },
      {
        documentId: "04.01",
        title: "Financial Intelligence Thesis",
        principle:
          "Financial Intelligence is the transformation of raw financial records into structured evidence",
        relevance: "TB is the foundational financial record",
      },
    ],
    governanceReferences: [
      {
        source: "09.01 Data Trust Theory",
        rule: "Data trust must be computed before downstream intelligence is relied upon",
        enforcement: "Trust gate blocks workflow if data is untrusted",
      },
      {
        source: "08.01 Governance & Trust Thesis",
        rule: "Evidence is the unit of trust",
        enforcement:
          "TB data must pass trust assessment before becoming evidence",
      },
    ],
    evidenceRequirements: [
      {
        description: "Trial balance balances (total debits = total credits)",
        status: "missing",
        requiredForApproval: true,
      },
      {
        description: "All account codes recognized",
        status: "missing",
        requiredForApproval: true,
      },
      {
        description: "File format validation passed",
        status: "missing",
        requiredForApproval: true,
      },
    ],
    humanApprovalRequired: false,
    escalationTriggers: ["missing_evidence", "governance_ambiguity"],
    outputBoundary: "draft_only",
    recommendedPromptLayers: [
      "system_doctrine",
      "product_doctrine",
      "governance",
      "evidence",
      "human_approval",
      "task_specific",
    ],
  },
  account_mapping: {
    taskType: "account_mapping",
    doctrineReferences: [
      {
        documentId: "04.07",
        title: "Chart of Accounts Mapping Theory",
        principle:
          "Account mapping translates client COA to canonical financial model",
        relevance: "Mapping is the critical intelligence layer",
      },
      {
        documentId: "04.03",
        title: "Canonical Financial Model Theory",
        principle: "The CFM is the single source of financial meaning",
        relevance: "Mapped data feeds the CFM",
      },
    ],
    governanceReferences: [
      {
        source: "04.07 Chart of Accounts Mapping",
        rule: "AI-suggested mappings are candidates — operator must confirm",
        enforcement: "Mapping requires human confirmation before acceptance",
      },
      {
        source: "10.01 Human + AI Thesis",
        rule: "AI assists. Humans decide.",
        enforcement: "Mapping suggestions require reviewer confirmation",
      },
    ],
    evidenceRequirements: [
      {
        description: "Low-confidence mappings reviewed and confirmed",
        status: "missing",
        requiredForApproval: true,
      },
      {
        description: "All accounts mapped to canonical categories",
        status: "missing",
        requiredForApproval: true,
      },
    ],
    humanApprovalRequired: true,
    escalationTriggers: [
      "low_mapping_confidence",
      "unsupported_accounting_treatment",
    ],
    outputBoundary: "draft_only",
    recommendedPromptLayers: [
      "system_doctrine",
      "product_doctrine",
      "governance",
      "evidence",
      "human_approval",
      "task_specific",
    ],
  },
  statement_drafting: {
    taskType: "statement_drafting",
    doctrineReferences: [
      {
        documentId: "04.01",
        title: "Financial Intelligence Thesis",
        principle: "Financial Intelligence is the first moat",
        relevance: "Statement drafting is core FI capability",
      },
      {
        documentId: "01.03",
        title: "What AQLIYA Is / Is Not",
        principle:
          "AQLIYA is the parent company/platform brand; AuditOS is the current primary product for governed financial workflows",
        relevance: "Draft boundaries must be clear",
      },
    ],
    governanceReferences: [
      {
        source: "05.01 AuditOS Thesis",
        rule: "Draft financial statements require professional review before use",
        enforcement:
          "All financial statement outputs are draft-only until human-approved",
      },
      {
        source: "15.01 Responsible Intelligence Doctrine",
        rule: "AI may recommend, signal, and link, but may not decide, conclude, or approve",
        enforcement:
          "Statement drafting is assistive and produces draft outputs — it does not produce final statements",
      },
    ],
    evidenceRequirements: [
      {
        description: "Trial balance validated and balanced",
        status: "missing",
        requiredForApproval: true,
      },
      {
        description: "Accounts fully mapped",
        status: "missing",
        requiredForApproval: true,
      },
      {
        description: "Mapping confirmed by reviewer",
        status: "missing",
        requiredForApproval: true,
      },
    ],
    humanApprovalRequired: true,
    escalationTriggers: [
      "unsupported_accounting_treatment",
      "high_materiality",
      "unusual_transaction",
    ],
    outputBoundary: "draft_only",
    recommendedPromptLayers: [
      "system_doctrine",
      "product_doctrine",
      "governance",
      "evidence",
      "human_approval",
      "task_specific",
    ],
  },
  notes_generation: {
    taskType: "notes_generation",
    doctrineReferences: [
      {
        documentId: "05.01",
        title: "AuditOS Thesis",
        principle: "AuditOS is a governed workflow and evidence infrastructure",
        relevance: "Notes require evidence methodology",
      },
    ],
    governanceReferences: [
      {
        source: "05.11 Audit Report Intelligence",
        rule: "Notes must be traceable to evidence",
        enforcement: "Missing note data flagged for reviewer",
      },
    ],
    evidenceRequirements: [
      {
        description: "All required note disclosures generated",
        status: "partial",
        requiredForApproval: true,
      },
      {
        description: "Missing note data flagged",
        status: "missing",
        requiredForApproval: false,
      },
    ],
    humanApprovalRequired: true,
    escalationTriggers: ["missing_evidence"],
    outputBoundary: "draft_only",
    recommendedPromptLayers: [
      "system_doctrine",
      "product_doctrine",
      "governance",
      "evidence",
      "human_approval",
      "task_specific",
    ],
  },
  disclosure_enrichment: {
    taskType: "disclosure_enrichment",
    doctrineReferences: [
      {
        documentId: "05.03",
        title: "AI-Assisted Audit Philosophy",
        principle: "AI assists. Humans decide. Evidence governs.",
        relevance: "Disclosure enrichment is assistive only",
      },
      {
        documentId: "05.01",
        title: "AuditOS Thesis",
        principle: "AuditOS is a governed workflow and evidence infrastructure",
        relevance: "Enrichment must cite rule evidence anchors",
      },
    ],
    governanceReferences: [
      {
        source: "05.03 AI-Assisted Audit Philosophy",
        rule: "AI outputs are suggestions — never final audit conclusions",
        enforcement: "Notes remain draft until human approval",
      },
      {
        source: "05.11 Audit Report Intelligence",
        rule: "Notes must be traceable to evidence and standards",
        enforcement: "Rule citations required as enrichment anchors",
      },
    ],
    evidenceRequirements: [
      {
        description: "Rule citations linked to disclosure note",
        status: "partial",
        requiredForApproval: true,
      },
      {
        description: "Human reviewer approval before export",
        status: "missing",
        requiredForApproval: true,
      },
    ],
    humanApprovalRequired: true,
    escalationTriggers: ["missing_evidence", "governance_ambiguity"],
    outputBoundary: "draft_only",
    recommendedPromptLayers: [
      "system_doctrine",
      "product_doctrine",
      "governance",
      "evidence",
      "human_approval",
      "task_specific",
    ],
  },
  evidence_review: {
    taskType: "evidence_review",
    doctrineReferences: [
      {
        documentId: "09.01",
        title: "Data Trust Theory",
        principle: "Evidence is the unit of trust",
        relevance: "Evidence review is the core governance mechanism",
      },
    ],
    governanceReferences: [
      {
        source: "09.01 Data Trust Theory",
        rule: "Evidence requires human verification",
        enforcement:
          "Evidence starts as candidate — requires reviewer verification",
      },
    ],
    evidenceRequirements: [
      {
        description: "Evidence verified by reviewer",
        status: "missing",
        requiredForApproval: true,
      },
    ],
    humanApprovalRequired: true,
    escalationTriggers: [
      "missing_evidence",
      "weak_evidence",
      "conflicting_evidence",
    ],
    outputBoundary: "draft_only",
    recommendedPromptLayers: [
      "system_doctrine",
      "product_doctrine",
      "governance",
      "evidence",
      "human_approval",
      "task_specific",
    ],
  },
  audit_findings: {
    taskType: "audit_findings",
    doctrineReferences: [
      {
        documentId: "05.06",
        title: "Findings Intelligence Theory",
        principle: "Findings are professional judgments",
        relevance: "Findings require evidence and human authority",
      },
    ],
    governanceReferences: [
      {
        source: "15.04 No-Autonomous-Audit Decision Rule",
        rule: "AI may not finalize audit findings",
        enforcement: "Findings require human review before publication",
      },
    ],
    evidenceRequirements: [
      {
        description: "Finding linked to verified evidence",
        status: "missing",
        requiredForApproval: true,
      },
      {
        description: "Severity classified correctly",
        status: "missing",
        requiredForApproval: true,
      },
    ],
    humanApprovalRequired: true,
    escalationTriggers: [
      "high_materiality",
      "unsupported_accounting_treatment",
      "policy_conflict",
    ],
    outputBoundary: "draft_only",
    recommendedPromptLayers: [
      "system_doctrine",
      "product_doctrine",
      "governance",
      "evidence",
      "human_approval",
      "task_specific",
    ],
  },
  commercial_claim_review: {
    taskType: "commercial_claim_review",
    doctrineReferences: [
      {
        documentId: "01.03",
        title: "What AQLIYA Is / Is Not",
        principle: "Do not sell as AI audit chatbot",
        relevance: "Commercial claims must respect positioning boundaries",
      },
    ],
    governanceReferences: [
      {
        source: "01.03 What AQLIYA Is / Is Not",
        rule: "Sales Boundary Rules apply",
        enforcement: "Commercial claims reviewed against positioning doctrine",
      },
    ],
    evidenceRequirements: [
      {
        description: "Claim supported by product capability",
        status: "partial",
        requiredForApproval: true,
      },
      {
        description: "Claim does not overstate maturity",
        status: "partial",
        requiredForApproval: true,
      },
    ],
    humanApprovalRequired: true,
    escalationTriggers: ["commercial_overclaim_risk", "governance_ambiguity"],
    outputBoundary: "review_required",
    recommendedPromptLayers: [
      "system_doctrine",
      "product_doctrine",
      "governance",
      "evidence",
      "human_approval",
      "task_specific",
    ],
  },
  pilot_decision: {
    taskType: "pilot_decision",
    doctrineReferences: [
      {
        documentId: "08.01",
        title: "Governance & Trust Thesis",
        principle: "Trust is produced by system structure",
        relevance: "Pilot decisions require governance confidence",
      },
    ],
    governanceReferences: [
      {
        source: "08.01 Governance & Trust Thesis",
        rule: "No trusted output without evidence trace",
        enforcement: "Pilot decisions must be evidence-backed",
      },
    ],
    evidenceRequirements: [
      {
        description: "Pilot readiness criteria met",
        status: "partial",
        requiredForApproval: true,
      },
      {
        description: "Evidence of pilot preparation exists",
        status: "partial",
        requiredForApproval: true,
      },
    ],
    humanApprovalRequired: true,
    escalationTriggers: ["governance_ambiguity", "commercial_overclaim_risk"],
    outputBoundary: "review_required",
    recommendedPromptLayers: [
      "system_doctrine",
      "product_doctrine",
      "governance",
      "evidence",
      "human_approval",
      "task_specific",
    ],
  },
  approval_review: {
    taskType: "approval_review",
    doctrineReferences: [
      {
        documentId: "10.01",
        title: "Human + AI Thesis",
        principle: "Human decision authority is non-negotiable",
        relevance: "Approval is a human governance act",
      },
    ],
    governanceReferences: [
      {
        source: "10.01 Human + AI Thesis",
        rule: "AI assists. Humans decide.",
        enforcement: "Approval authority is exclusively human",
      },
      {
        source: "08.01 Governance & Trust Thesis",
        rule: "Every approval attributable",
        enforcement: "Approval records require human identity and rationale",
      },
    ],
    evidenceRequirements: [
      {
        description: "Previous review steps completed",
        status: "missing",
        requiredForApproval: true,
      },
      {
        description: "Evidence chain complete",
        status: "missing",
        requiredForApproval: true,
      },
    ],
    humanApprovalRequired: true,
    escalationTriggers: ["approval_bypass_attempt", "governance_ambiguity"],
    outputBoundary: "approved",
    recommendedPromptLayers: [
      "system_doctrine",
      "product_doctrine",
      "governance",
      "evidence",
      "human_approval",
      "task_specific",
    ],
  },

  // ─── Skill Execution ───
  skill_execution: {
    taskType: "skill_execution",
    doctrineReferences: [
      {
        documentId: "aqliya-skill-os-v1.0",
        title: "AQLIYA Skill Operating System",
        principle: "AI-assisted skill execution with human oversight",
        relevance: "Skill execution is an AI-assisted operation",
      },
    ],
    governanceReferences: [
      {
        source: "AGENTS.md §12",
        rule: "AI features must be governed",
        enforcement: "Every skill execution is audited",
      },
    ],
    evidenceRequirements: [
      {
        description: "Skill execution result must be reviewed before use as operational input",
        status: "missing",
        requiredForApproval: true,
      },
    ],
    humanApprovalRequired: false,
    escalationTriggers: [],
    outputBoundary: "review_required",
    recommendedPromptLayers: [
      "system_doctrine",
      "product_doctrine",
      "governance",
      "evidence",
      "human_approval",
      "task_specific",
    ],
  },
  pattern_improvement: {
    taskType: "pattern_improvement",
    doctrineReferences: [
      {
        documentId: "aqliya-product-completion",
        title: "Product Completion Rules",
        principle: "AI features must produce suggestions, never final decisions",
        relevance: "Pattern improvement is an AI-assisted recommendation",
      },
      {
        documentId: "AQ-12.01",
        title: "Match Quality Theory",
        principle: "Pattern matching quality improves with verified outcome data",
        relevance: "Pattern improvement uses FP data to refine matching",
      },
    ],
    governanceReferences: [
      {
        source: "AGENTS.md §12",
        rule: "Every AI action must include source input references",
        enforcement: "Pattern suggestions include FP evidence and unmatched accounts",
      },
      {
        source: "AGENTS.md §12",
        rule: "AI must not approve outputs automatically",
        enforcement: "All pattern suggestions require human approval",
      },
    ],
    evidenceRequirements: [
      {
        description: "False positive accounts with confirmed reviews",
        status: "partial",
        requiredForApproval: true,
      },
      {
        description: "Unmatched account names for missed matches",
        status: "partial",
        requiredForApproval: true,
      },
    ],
    humanApprovalRequired: true,
    escalationTriggers: ["missing_evidence", "governance_ambiguity"],
    outputBoundary: "review_required",
    recommendedPromptLayers: [
      "system_doctrine",
      "product_doctrine",
      "governance",
      "evidence",
      "human_approval",
      "task_specific",
    ],
  },
};

export function getGovernanceContext(
  taskType: GovernanceTaskType,
): GovernanceContext {
  const context = GOVERNANCE_TASK_MAP[taskType];
  if (!context) {
    throw new Error(`Unknown governance task type: ${taskType}`);
  }
  return {
    ...context,
    doctrineReferences: [...context.doctrineReferences],
    governanceReferences: [...context.governanceReferences],
    evidenceRequirements: [...context.evidenceRequirements],
    escalationTriggers: [...context.escalationTriggers],
    recommendedPromptLayers: [...context.recommendedPromptLayers],
  };
}

export function listSupportedGovernanceTasks(): GovernanceTaskType[] {
  return Object.keys(GOVERNANCE_TASK_MAP) as GovernanceTaskType[];
}

export function requiresHumanApproval(taskType: GovernanceTaskType): boolean {
  const context = GOVERNANCE_TASK_MAP[taskType];
  return context?.humanApprovalRequired ?? true;
}
