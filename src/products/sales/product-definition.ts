import { defineProduct, type ProductDefinition } from "@/core/product-runtime"

export const SALESOS_PRODUCT_KEY = "sales"

/** Runtime manifest for SalesOS — mirrors V1 registry; adoption detail in core-adoption docs. */
export const SALESOS_PRODUCT_DEFINITION: ProductDefinition = {
  key: SALESOS_PRODUCT_KEY,
  name: "SalesOS",
  description:
    "Institutional Commercial Brain — governed revenue intelligence, commercial memory, ICP learning, proof linkage, and draft NBA (not a CRM replacement)",
  status: "usable",
  version: "0.2.0",
  routePrefix: "/sales",
  requiresWorkspace: true,
  requiresTenant: true,
  requiredPermissions: [
    "sales.account.read",
    "sales.account.create",
    "sales.opportunity.read",
    "sales.opportunity.create",
    "sales.opportunity.review",
    "sales.opportunity.approve",
    "sales.evidence.manage",
    "sales.export",
    "sales.intelligence.read",
  ],
  supportedLanguages: ["ar", "en"],
  capabilities: [
    {
      key: "salesos.account",
      name: "Account management",
      description: "Commercial accounts, profiles, and intelligence summaries",
      version: "0.2.0",
      requiredPermissions: ["sales.account.read", "sales.account.create"],
      metadata: { resourceType: "SalesAccount" },
    },
    {
      key: "salesos.opportunity",
      name: "Opportunity pipeline",
      description: "Stage tracking, review/approval, and opportunity intelligence",
      version: "0.2.0",
      requiredPermissions: [
        "sales.opportunity.read",
        "sales.opportunity.create",
        "sales.opportunity.review",
        "sales.opportunity.approve",
      ],
      metadata: { resourceType: "SalesOpportunity" },
    },
    {
      key: "salesos.evidence",
      name: "Commercial evidence",
      description: "Link registry and proof coverage (link-only until Core files adopted)",
      version: "0.2.0",
      requiredPermissions: ["sales.evidence.manage"],
      metadata: {
        resourceType: "SalesEvidenceLink",
        evidenceTypes: ["proposal", "interaction_log", "qualification_note"],
      },
    },
    {
      key: "salesos.workflow",
      name: "Commercial workflow",
      description: "Opportunity lifecycle and governed review/approval",
      version: "0.2.0",
      requiredPermissions: ["sales.opportunity.review", "sales.opportunity.approve"],
      metadata: { workflowTemplateId: "sales-opportunity-lifecycle" },
    },
    {
      key: "salesos.output",
      name: "Commercial outputs",
      description: "Account brief and export gates via Output Core catalog",
      version: "0.2.0",
      requiredPermissions: ["sales.export"],
      metadata: {
        exportTypes: [
          "account_brief",
          "opportunity_brief",
          "commercial_intelligence_report",
          "revenue_intelligence_report",
          "icp_learning_report",
          "proof_effectiveness_report",
          "executive_commercial_report",
          "knowledge_graph_snapshot",
        ],
      },
    },
    {
      key: "salesos.intelligence",
      name: "Commercial intelligence",
      description: "Memory, ICP, market intelligence, NBA, proof effectiveness — draft-governed",
      version: "0.2.0",
      requiredPermissions: ["sales.intelligence.read"],
      metadata: {
        generationType: "deterministic_draft",
        layers: ["commercial_memory", "icp", "market", "nba", "proof", "revenue"],
      },
    },
    {
      key: "salesos.signals",
      name: "Runtime signals",
      description: "Platform signal/metric producer participation",
      version: "0.2.0",
      requiredPermissions: ["sales.intelligence.read"],
      metadata: { producer: "sales-signal-producer" },
    },
    {
      key: "salesos.ai",
      name: "Governed AI",
      description: "Commercial claim review scaffold — human decides, draft outputs",
      version: "0.2.0",
      requiredPermissions: ["sales.intelligence.read"],
      metadata: {
        aiTaskTypes: ["commercial_claim_review"],
        policyTags: ["human_review_required"],
      },
    },
    {
      key: "salesos.audit",
      name: "Audit trail",
      description: "Platform audit events and product-local audit buffer on commercial mutations",
      version: "0.2.0",
      requiredPermissions: ["sales.opportunity.read"],
      metadata: {
        categories: ["workflow_transition", "evidence", "review", "approval", "output"],
      },
    },
    {
      key: "salesos.tasks",
      name: "Commercial tasks",
      description: "Review, approval, and NBA items surfaced via unified task runtime (signal-backed)",
      version: "0.2.0",
      requiredPermissions: ["sales.opportunity.read"],
      metadata: { runtime: "unified-task-runtime", persistence: "signal_only" },
    },
    {
      key: "salesos.memory",
      name: "Institutional commercial memory",
      description: "Objections, signals, ICP, learning — OrgStore/file; Prisma intelligence pending",
      version: "0.2.0",
      requiredPermissions: ["sales.intelligence.read"],
      metadata: {
        layers: ["commercial_memory", "institutional_learning", "knowledge_graph"],
        persistence: "org_store_ephemeral_on_prisma",
      },
    },
  ],
}

export const SALESOS_MANIFEST = defineProduct(SALESOS_PRODUCT_DEFINITION)
