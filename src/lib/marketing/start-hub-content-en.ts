import type { EngagementModelCard, ProcessPhase } from "./start-hub-content";

export const engagementModelsEn: EngagementModelCard[] = [
  {
    id: "diagnostic",
    name: "Executive diagnostic",
    tagline: "Understand context before commitment",
    duration: "45–90 min",
    cost: "Free",
    description: "Structured session — no sales pitch. Fit assessment and next step.",
  },
  {
    id: "pilot",
    name: "Operational evaluation",
    tagline: "Prove value on your data",
    duration: "2–4 weeks",
    cost: "Free",
    description:
      "One scoped path on real data — agreed criteria and evidence-based decision report.",
    featured: true,
  },
  {
    id: "deployment",
    name: "Institutional activation",
    tagline: "From evaluation to production",
    duration: "Scope-dependent",
    cost: "After evaluation",
    description: "Managed cloud with production auth, backups, and team training.",
  },
  {
    id: "private-assessment",
    name: "Private deployment assessment",
    tagline: "Data sovereignty requirements",
    duration: "4–8 weeks",
    cost: "Scope-dependent",
    description:
      "Joint technical assessment — On-Prem/Air-Gapped is strategic, not a ready package.",
  },
  {
    id: "custom",
    name: "Custom institutional system",
    tagline: "On Intelligence Core",
    duration: "Requirements-driven",
    cost: "Custom",
    description: "Workflow designed for your context — same governance and evidence chain.",
  },
];

export const processPhasesEn: ProcessPhase[] = [
  {
    num: "1",
    title: "Diagnostic",
    desc: "Structured session — institution context and fit. No sales pitch.",
  },
  {
    num: "2",
    title: "Operational evaluation",
    desc: "Full path on real data — criteria agreed upfront.",
  },
  {
    num: "3",
    title: "Evidence-based decision",
    desc: "Proceed · revise scope · or stop — based on measured outcomes.",
  },
  {
    num: "4",
    title: "Activation & expand",
    desc: "Institutional rollout — additional paths with governance preserved.",
  },
];

export const processPrinciplesEn = [
  "AI assists — humans decide",
  "Evidence governs — every output linked to source",
  "Governance built in — not bolted on later",
  "Start from institution reality — not generic templates",
];
