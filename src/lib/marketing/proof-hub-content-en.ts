/**
 * English proof hub content — R2 mirror
 */

export const executiveBriefLayersEn = [
  {
    name: "AQLIYA Intelligence Core",
    description: "AI orchestration, governance, evidence graph, RBAC, audit trail.",
  },
  {
    name: "AuditOS",
    description: "Full audit path from source to approval.",
  },
  {
    name: "DecisionOS",
    description: "Governed decision memos with human review.",
  },
  {
    name: "LocalContentOS",
    description: "Suppliers, spend, compliance, regulatory reports.",
  },
];

export const governancePrinciplesEn = [
  { title: "AI assists", detail: "Every AI output is a draft — no autonomous final decision." },
  { title: "Humans decide", detail: "Approval gates block publish until human conditions are met." },
  { title: "Evidence governs", detail: "Every decision links to source — full audit trail." },
];

export const deploymentOptionsEn = [
  { name: "Cloud Managed", status: "Available — default", note: "Audit firms and private sector" },
  { name: "Private Cloud", status: "Institution scope", note: "Higher privacy — contact for scope" },
  { name: "On-Prem / Air-Gapped", status: "Strategic — not a ready package", note: "Discuss in diagnostic session" },
];

export const proofDimensionsEn = [
  { dimension: "Workflow clarity", question: "Are steps clear and executable on the platform?" },
  { dimension: "Data readiness", question: "Is data available in the required quality and format?" },
  { dimension: "Evidence traceability", question: "Can every output be linked to its source?" },
  { dimension: "Human review quality", question: "Could the team review outputs and decide?" },
  { dimension: "Output usefulness", question: "Do outputs serve the real workflow?" },
  { dimension: "Decision confidence", question: "Can you decide with evidence after the evaluation?" },
];

export const outcomesFutureMetricsEn = [
  "Cycle time (before ↔ after — measured)",
  "Evidence chain completeness (% linked items)",
  "Review gates — passed vs blocked",
  "Approver confidence (qualitative survey)",
  "Evidence-based decision (proceed / revise / stop)",
];

export const evidenceSamplesEn = [
  {
    id: "tb",
    title: "Trial balance validation result",
    category: "Trial balance processing",
    highlight: "147 accounts — instant balance — IFRS mapping suggestions for human review",
  },
  {
    id: "statements",
    title: "Statement of financial position draft",
    category: "Financial statements",
    highlight: "Draft for human review — 89% material lines linked to evidence",
  },
  {
    id: "trail",
    title: "Audit trail — engagement log",
    category: "Audit trail",
    highlight: "247+ events — 4 users — immutable",
  },
];

export const pilotDecisionOutcomesEn = [
  { outcome: "Proceed — expand", detail: "Evaluation proved value — move to institutional activation." },
  { outcome: "Revise scope", detail: "Gap in path or data — adjust and re-evaluate." },
  { outcome: "Stop", detail: "Path not suitable — recommend alternative or close file." },
];

export const proofScenariosEn = [
  {
    title: "Evidence chain",
    verifiable: "Upload a trial balance and trace any figure to source in the demo.",
  },
  {
    title: "Immutable audit trail",
    verifiable: "Run a step and review the live log — 18+ event types.",
  },
  {
    title: "Human approval gate",
    verifiable: "Try to publish before 5 conditions are met — system blocks.",
  },
  {
    title: "RBAC — role separation",
    verifiable: "Try different roles in the demo and observe permissions.",
  },
];
