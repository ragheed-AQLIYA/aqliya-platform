/**
 * English buyer journeys — plain language (R6)
 */

import type { BuyerJourney, BuyerJourneyStep } from "./buyer-journeys";

export const buyerJourneysEn: BuyerJourney[] = [
  {
    id: "executive",
    label: "Executive leadership",
    subtitle: "CEO · Board · Managing director",
    hook: "Read the summary, watch the demo, then decide if it is worth your team's time.",
    steps: [
      { label: "Leadership summary", href: "/en/proof#executive-brief", time: "Short read" },
      { label: "Proof materials", href: "/en/proof", time: "Read" },
      { label: "Demo", href: "/en/demo", time: "Try it" },
    ],
    primaryCta: { label: "Book a call", href: "/en/contact" },
    secondaryCta: { label: "How we work", href: "/en/start#process" },
  },
  {
    id: "cfo",
    label: "Chief Financial Officer",
    subtitle: "Finance · Internal audit",
    hook: "From trial balance to a ready file — every figure opens its source.",
    steps: [
      { label: "AuditOS", href: "/en/products/audit", time: "Read" },
      { label: "Sample outputs", href: "/en/proof#evidence-samples", time: "Read" },
      { label: "Demo", href: "/en/demo", time: "Try it" },
    ],
    primaryCta: { label: "Talk to us", href: "/en/contact" },
    secondaryCta: { label: "Watch demo", href: "/en/demo" },
  },
  {
    id: "contracting",
    label: "Contracting & local content",
    subtitle: "Construction · Procurement · Compliance",
    hook: "Suppliers, spend, and local content in one place instead of scattered spreadsheets.",
    steps: [
      { label: "Local content solution", href: "/en/products/local-content", time: "Read" },
      { label: "Use cases", href: "/en/use-cases", time: "Read" },
      { label: "Proof materials", href: "/en/proof", time: "Read" },
    ],
    primaryCta: { label: "Book a call", href: "/en/contact" },
    secondaryCta: { label: "Government sector", href: "/en/industries#government" },
  },
  {
    id: "cio",
    label: "Technology leadership",
    subtitle: "IT · Information security",
    hook: "Managed cloud is ready today. Private or air-gapped — we discuss honestly if you need it.",
    steps: [
      { label: "Security", href: "/en/security", time: "Read" },
      { label: "Deployment options", href: "/en/deployment", time: "Read" },
      { label: "Procurement pack", href: "/en/procurement-pack", time: "Read" },
    ],
    primaryCta: { label: "Technical session", href: "/en/contact" },
    secondaryCta: { label: "Procurement pack", href: "/en/procurement-pack" },
  },
  {
    id: "audit",
    label: "Audit partner",
    subtitle: "Audit firms · Engagements",
    hook: "A complete engagement file — unchanged after partner sign-off.",
    steps: [
      { label: "AuditOS", href: "/en/products/audit", time: "Read" },
      { label: "AuditOS demo", href: "/auditos", time: "Try it" },
      { label: "Trial criteria", href: "/en/proof#evaluation-framework", time: "Read" },
    ],
    primaryCta: { label: "Book a call", href: "/en/contact" },
    secondaryCta: { label: "Audit sector", href: "/en/industries#audit-firms" },
  },
  {
    id: "procurement",
    label: "Procurement",
    subtitle: "Vendor evaluation · Award committee",
    hook: "Ready PDF: security, scope, and criteria for your committee.",
    steps: [
      { label: "Procurement pack", href: "/en/procurement-pack", time: "Read" },
      { label: "Ways to work together", href: "/en/start#engagement", time: "Read" },
      { label: "Trial criteria", href: "/en/proof#evaluation-framework", time: "Read" },
    ],
    primaryCta: { label: "Request pack", href: "/en/contact" },
    secondaryCta: { label: "Proof materials", href: "/en/proof" },
  },
  {
    id: "government",
    label: "Government entity",
    subtitle: "Compliance · Local content",
    hook: "Local content and compliance reports ready for regulatory review.",
    steps: [
      { label: "Local content solution", href: "/en/products/local-content", time: "Read" },
      { label: "Governance", href: "/en/governance", time: "Read" },
      { label: "Proof materials", href: "/en/proof", time: "Read" },
    ],
    primaryCta: { label: "Book a call", href: "/en/contact" },
    secondaryCta: { label: "Government sector", href: "/en/industries#government" },
  },
];

export const universalJourneyStepsEn: BuyerJourneyStep[] = [
  { label: "Intro call", href: "/en/contact", time: "Free" },
  { label: "Trial on your data", href: "/en/proof#evaluation-framework", time: "Weeks" },
  { label: "Your decision", href: "/en/start#engagement", time: "After results" },
  { label: "Rollout", href: "/en/start#process", time: "By agreement" },
];
