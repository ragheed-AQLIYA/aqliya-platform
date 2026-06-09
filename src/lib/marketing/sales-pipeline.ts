/** RevOps pipeline stages — aligned with Enterprise Launch Plan. */
export const salesPipelineStages = [
  {
    stage: "Lead",
    definition: "Inbound/outbound interest",
    owner: "Commercial",
    sla: "48h response",
    exit: "ICP fit confirmed",
  },
  {
    stage: "Qualified",
    definition: "Pain + authority + sector fit",
    owner: "Commercial",
    sla: "Post-diagnostic",
    exit: "Diagnostic scheduled",
  },
  {
    stage: "Diagnostic",
    definition: "45–90 min session",
    owner: "Founder",
    sla: "Within 7 days of request",
    exit: "Written fit + recommended OS",
  },
  {
    stage: "Pilot scoped",
    definition: "SOW + success criteria signed",
    owner: "Commercial + Delivery",
    sla: "5 days post-diagnostic",
    exit: "Kickoff date set",
  },
  {
    stage: "Pilot active",
    definition: "Weekly checkpoint",
    owner: "Delivery",
    sla: "2–4 weeks",
    exit: "Go/No-Go scheduled",
  },
  {
    stage: "Go/No-Go",
    definition: "Written report",
    owner: "Delivery + Founder",
    sla: "5 days after pilot end",
    exit: "Proceed | Revise | Stop",
  },
  {
    stage: "Closed won",
    definition: "Paid deployment",
    owner: "Founder",
    sla: "Per engagement model",
    exit: "Reference permission ask",
  },
  {
    stage: "Reference",
    definition: "Case study / quote",
    owner: "Marketing + Customer",
    sla: "30 days post-win",
    exit: "Publishable asset",
  },
] as const;

export const salesKpiTargets90Day = [
  { metric: "Diagnostic sessions", target: "12" },
  { metric: "Pilots started", target: "4" },
  { metric: "Pilots completed (Go/No-Go)", target: "3" },
  { metric: "Proceed decisions", target: "≥1" },
  { metric: "Paid or reference LOI", target: "1" },
  { metric: "Publishable reference", target: "1" },
] as const;
