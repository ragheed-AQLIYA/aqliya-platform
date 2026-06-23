import type {
  EngagementModelCard,
  EngagementPricingBand,
  ProcessPhase,
} from "./start-hub-content";

export const engagementPricingEn: EngagementPricingBand[] = [
  { model: "Intro call", from: "SAR 0", to: "SAR 0", note: "No commitment" },
  { model: "Trial on your data", from: "SAR 0", to: "SAR 0", note: "Limited scope agreed upfront" },
  { model: "Rollout (cloud)", from: "After trial", to: "By users and paths", note: "Quote after you see results" },
  { model: "Private or air-gapped", from: "Feasibility study", to: "Design project", note: "For exceptional requirements" },
];

export const engagementModelsEn: EngagementModelCard[] = [
  {
    id: "diagnostic",
    name: "Intro call",
    tagline: "Understand your context first",
    duration: "About one hour",
    cost: "Free",
    description: "We listen to your need and explain if AQLIYA fits — no sales pitch.",
  },
  {
    id: "pilot",
    name: "Trial on your data",
    tagline: "See results before the contract",
    duration: "2–4 weeks",
    cost: "Free",
    description: "One limited path on your files — clear criteria and a report at the end.",
    featured: true,
  },
  {
    id: "deployment",
    name: "Go live",
    tagline: "From trial to daily use",
    duration: "By agreement",
    cost: "After trial",
    description: "Accounts, permissions, backups, and team training on cloud.",
  },
  {
    id: "private-assessment",
    name: "Deploy in your environment",
    tagline: "When data must stay with you",
    duration: "4–8 weeks",
    cost: "By scope",
    description: "Joint study for private or air-gapped deployment — not an off-the-shelf order.",
  },
  {
    id: "custom",
    name: "Custom workflow",
    tagline: "When standard products are not enough",
    duration: "Requirements-driven",
    cost: "Custom",
    description: "A path designed for your context — same permissions and log.",
  },
];

export const processPhasesEn: ProcessPhase[] = [
  { num: "1", title: "Call", desc: "We understand the institution and suggest a next step." },
  { num: "2", title: "Trial", desc: "We work on your data within agreed scope." },
  { num: "3", title: "Your decision", desc: "Proceed, adjust scope, or stop — based on results." },
  { num: "4", title: "Rollout", desc: "Expand use while permissions and log stay in place." },
];

export const processPrinciplesEn = [
  "AI suggests — your team approves",
  "Every output links to a file or log",
  "We start from your reality — not a generic template",
];
