/**
 * Proof-layer copy — EN mirror, R6
 */

export const proofPageCopyEn = {
  metadata: {
    title: "Proof | AQLIYA",
    description:
      "Demo, leadership summary, trial criteria, and sample outputs — everything before a purchase decision.",
  },
  hero: {
    eyebrow: "Proof",
    title: "All evaluation materials in one place",
    subtitle:
      "Interactive demo, leadership summary, and clear criteria for a trial on your data. Intro call, limited trial, then you decide.",
    sampleNote: "Demo and samples use trial data — not real customer records.",
  },
  sections: {
    demo: {
      title: "Demo",
      subtitle: "Full audit path on sample data — no login.",
      primaryCta: "Open demo",
      secondaryCta: "AuditOS demo path",
    },
    brief: {
      title: "Leadership summary",
      subtitle: "Quick view of the platform, solutions, and deployment options.",
    },
    evaluation: {
      title: "How we evaluate a trial",
      subtitle: "Six questions we answer together during a trial on your data.",
      engagementLink: "Ways to work together and free trial",
    },
    evidence: {
      title: "Sample outputs",
      subtitle: "Examples of platform output — for review, not final sign-off.",
      sampleBadge: "Sample data",
    },
    outcomes: {
      title: "Customer outcomes",
      statusLabel: "Current status",
      statusTitle: "Preparing first real reviews for publication",
      statusBody:
        "We do not publish fake numbers. When we complete a first client trial with approval, results go here.",
    },
    procurement: {
      title: "Useful links",
    },
  },
  anchorNav: [
    { id: "demo", label: "Demo" },
    { id: "executive-brief", label: "Leadership summary" },
    { id: "evaluation-framework", label: "Trial criteria" },
    { id: "evidence-samples", label: "Sample outputs" },
    { id: "outcomes", label: "Outcomes" },
    { id: "procurement", label: "Procurement" },
  ],
  externalLinks: [
    { label: "Procurement pack", href: "/en/procurement-pack" },
    { label: "Security and deployment", href: "/en/security" },
    { label: "Case studies", href: "/case-studies" },
    { label: "Where to start", href: "/en/start" },
  ],
} as const;

export const executiveBriefLayersEn = [
  {
    name: "AQLIYA platform",
    description: "Permissions, activity log, and every output linked to source — shared foundation.",
  },
  {
    name: "AuditOS",
    description: "From trial balance upload to a sign-off ready file.",
  },
  {
    name: "DecisionOS",
    description: "Documented decisions: context, options, and approvals.",
  },
  {
    name: "LocalContentOS",
    description: "Suppliers, spend, local content, and regulatory reports.",
  },
];

export const governancePrinciplesEn = [
  { title: "AI suggests", detail: "System output is a draft — not an automatic final decision." },
  { title: "Your team approves", detail: "No file is issued without authorized sign-off." },
  { title: "Everything has a source", detail: "Any figure or decision can be traced to its file or log." },
];

export const deploymentOptionsEn = [
  { name: "Managed cloud", status: "Available today", note: "Default for most institutions" },
  { name: "Private cloud", status: "By agreement", note: "When you need data in your own account" },
  {
    name: "Air-gapped",
    status: "Custom project — not instant order",
    note: "For exceptional security needs — discuss on a call",
  },
];

export const proofDimensionsEn = [
  { dimension: "Is the path clear?", question: "Can your team run the steps without guessing?" },
  { dimension: "Is data ready?", question: "Do you have the files and formats needed for the trial?" },
  { dimension: "Is source visible?", question: "Can you open any figure or decision and reach its file?" },
  { dimension: "Is review practical?", question: "Could reviewers accept or reject outputs easily?" },
  { dimension: "Is output useful?", question: "Does it save time in daily work?" },
  { dimension: "Are you comfortable deciding?", question: "After the trial — enough to proceed, adjust, or stop honestly?" },
];

export const proofScenariosEn = [
  { title: "Figure to file", verifiable: "Upload a sample trial balance and open the source of any figure." },
  { title: "Immutable log", verifiable: "Run a step and see who changed what and when." },
  { title: "Approval before issue", verifiable: "Try to issue a file before conditions are met — platform blocks." },
  { title: "Role-based access", verifiable: "Try different roles and see who sees what." },
];

export const evidenceSamplesEn = [
  {
    id: "tb",
    title: "Trial balance check",
    category: "Trial balance",
    highlight: "147 accounts — instant balance — mapping suggestions for human review",
  },
  {
    id: "statements",
    title: "Statement of financial position draft",
    category: "Financial statements",
    highlight: "Draft for review — most material lines linked to files",
  },
  {
    id: "trail",
    title: "Activity log",
    category: "Audit log",
    highlight: "Hundreds of events — multiple users — cannot be edited after logging",
  },
];

export const outcomesFutureMetricsEn = [
  "Review close time (before and after)",
  "Share of lines linked to source files",
  "Review steps completed vs blocked",
  "Approver comfort with outputs",
  "Your decision: proceed · adjust scope · stop",
];

export const pilotDecisionOutcomesEn = [
  { outcome: "Proceed", detail: "Trial convinced you — move to broader rollout with clear terms." },
  { outcome: "Adjust scope", detail: "Gap in data or path — refine and run again." },
  { outcome: "Stop", detail: "Not the right fit now — close the file honestly." },
];
