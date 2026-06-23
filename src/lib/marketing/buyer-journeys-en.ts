/**
 * English buyer journey paths — @see docs/marketing/MARKETING_ROADMAP.md
 */

import type { BuyerJourney, BuyerJourneyStep } from "./buyer-journeys";

export const buyerJourneysEn: BuyerJourney[] = [
  {
    id: "executive",
    label: "Executive leadership",
    subtitle: "CEO · Board · Managing Director",
    hook: "Five-minute investment read — then proof before any wide commitment.",
    steps: [
      { label: "Executive brief", href: "/en/proof#executive-brief", time: "5 min" },
      { label: "Proof center", href: "/en/proof", time: "15 min" },
      { label: "Interactive demo", href: "/en/demo", time: "10 min" },
    ],
    primaryCta: { label: "Book diagnostic session", href: "/en/contact" },
    secondaryCta: { label: "How we work", href: "/en/start#process" },
  },
  {
    id: "cfo",
    label: "Chief Financial Officer",
    subtitle: "CFO · Internal audit",
    hook: "Every figure linked to source — from trial balance to engagement pack.",
    steps: [
      { label: "CFO buyer guide", href: "/en/start#cfo", time: "10 min" },
      { label: "AuditOS", href: "/en/products/audit", time: "8 min" },
      { label: "Evidence library", href: "/en/proof#evidence-samples", time: "15 min" },
    ],
    primaryCta: { label: "Request executive session", href: "/en/contact" },
    secondaryCta: { label: "Watch demo", href: "/en/demo" },
  },
  {
    id: "contracting",
    label: "Contracting & local content",
    subtitle: "Construction · procurement · compliance",
    hook: "Suppliers, spend, local content, and regulatory reports in one governed path.",
    steps: [
      { label: "LocalContentOS", href: "/en/products/local-content", time: "8 min" },
      { label: "Use cases", href: "/en/use-cases", time: "12 min" },
      { label: "Proof center", href: "/en/proof", time: "15 min" },
    ],
    primaryCta: { label: "Discuss institutional activation", href: "/en/contact" },
    secondaryCta: { label: "Government sector", href: "/en/industries#government" },
  },
  {
    id: "cio",
    label: "Technology leadership",
    subtitle: "CIO · CISO · Information security",
    hook: "Full technical transparency — deployment, isolation, RBAC, AI boundaries.",
    steps: [
      { label: "Security summary", href: "/en/security", time: "10 min" },
      { label: "Deployment options", href: "/en/deployment", time: "8 min" },
      { label: "CIO buyer guide", href: "/en/start#cio", time: "12 min" },
    ],
    primaryCta: { label: "Request technical session", href: "/en/contact" },
    secondaryCta: { label: "Procurement pack", href: "/en/procurement-pack" },
  },
  {
    id: "audit",
    label: "Audit partner",
    subtitle: "Audit firms · engagement delivery",
    hook: "Your sign-off protects your reputation — immutable evidence chain after approval.",
    steps: [
      { label: "Audit partner guide", href: "/en/start#audit", time: "10 min" },
      { label: "AuditOS demo", href: "/auditos", time: "13 min" },
      { label: "Evaluation framework", href: "/en/proof#evaluation-framework", time: "10 min" },
    ],
    primaryCta: { label: "Book diagnostic session", href: "/en/contact" },
    secondaryCta: { label: "Audit sector", href: "/en/industries#audit-firms" },
  },
  {
    id: "procurement",
    label: "Procurement",
    subtitle: "Vendor evaluation · award committee",
    hook: "Ready PDF pack: brief, security, SOW, and comparison with current tools.",
    steps: [
      { label: "Procurement pack", href: "/en/procurement-pack", time: "20 min" },
      { label: "Engagement models", href: "/en/start#engagement", time: "10 min" },
      { label: "Evaluation framework", href: "/en/proof#evaluation-framework", time: "10 min" },
    ],
    primaryCta: { label: "Request evaluation pack", href: "/en/contact" },
    secondaryCta: { label: "Proof center", href: "/en/proof" },
  },
  {
    id: "government",
    label: "Government entity",
    subtitle: "Compliance · local content · accountability",
    hook: "Local content and compliance paths with reports ready for regulators.",
    steps: [
      { label: "Government buyer guide", href: "/en/start#government", time: "12 min" },
      { label: "LocalContentOS", href: "/en/products/local-content", time: "8 min" },
      { label: "Governance architecture", href: "/en/governance", time: "10 min" },
    ],
    primaryCta: { label: "Discuss institutional activation", href: "/en/contact" },
    secondaryCta: { label: "Government sector", href: "/en/industries#government" },
  },
];

export const universalJourneyStepsEn: BuyerJourneyStep[] = [
  { label: "Diagnostic", href: "/en/contact", time: "45 min" },
  { label: "Operational evaluation", href: "/en/proof#evaluation-framework", time: "2–4 weeks" },
  { label: "Evidence-based decision", href: "/en/start#engagement", time: "One session" },
  { label: "Activation", href: "/en/start#process", time: "Scope-dependent" },
];
