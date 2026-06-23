import type { ProductPageContent } from "./product-pages-content";

export const auditProductContentEn: ProductPageContent = {
  metadata: {
    title: "AuditOS — Governed Audit Operating System | AQLIYA",
    description:
      "Governed audit path from client acceptance to engagement pack — evidence, human review, immutable audit trail.",
  },
  eyebrow: "AuditOS",
  productName: "Audit & compliance operating system",
  statusLabel: "Available to deploy",
  problemLine:
    "Spreadsheets and email — audit work that is hard to defend to partners or regulators.",
  outcomeLine:
    "One path from source to approval — every figure linked to evidence, every decision logged.",
  before: [
    "Client acceptance in scattered files",
    "Manual TB mapping without standards link",
    "Working papers as disconnected files",
    "Review notes in email and chat",
    "Export without clear approval gates",
  ],
  after: [
    "Governed acceptance with measured risk",
    "TB → IFRS with AI suggestions for human review",
    "Integrated working paper file",
    "Review notes with SLA and escalation",
    "Five-condition gate before any export",
  ],
  flowSteps: ["Accept", "TB", "Statements", "Evidence", "Review", "Approve"],
  highlights: [
    "Full evidence chain",
    "Mandatory human approval",
    "Immutable audit trail",
  ],
  demoHref: "/auditos",
  demoLabel: "AuditOS demo",
  primaryCta: { label: "Book a call", href: "/en/contact" },
  secondaryCta: { label: "Proof materials", href: "/en/proof" },
};

export const decisionProductContentEn: ProductPageContent = {
  metadata: {
    title: "DecisionOS — Governed Decision Operating System | AQLIYA",
    description:
      "Governed decision path — alternatives, criteria, risks, AI recommendation, human approval.",
  },
  eyebrow: "DecisionOS",
  productName: "Institutional decision operating system",
  statusLabel: "Integrated into platform",
  problemLine: "Decisions in meetings and files — no shared criteria or approval trail.",
  outcomeLine: "Documented decision memo — reviewable and auditable at any time.",
  before: [
    "Decisions driven by discussion only",
    "Undocumented rationale",
    "Ad-hoc risk assessment",
    "Hard to trace why a decision was made",
    "Unclear approvals",
  ],
  after: [
    "Documented decision path",
    "Measurable evaluation criteria",
    "Risk summary linked to alternatives",
    "Evidence-backed recommendation",
    "Full approval log",
  ],
  flowSteps: ["Problem", "Options", "Criteria", "Risks", "Recommend", "Approve"],
  highlights: [
    "AI recommendation with rationale",
    "Every decision linked to evidence",
    "No edits after approval",
  ],
  demoHref: "/en/demo",
  demoLabel: "Interactive demo",
  primaryCta: { label: "Talk to us", href: "/en/contact" },
  secondaryCta: { label: "Use cases", href: "/en/use-cases" },
};

export const localContentProductContentEn: ProductPageContent = {
  metadata: {
    title: "LocalContentOS — Local Content & Compliance | AQLIYA",
    description:
      "Suppliers, spend, classification, compliance gaps, and regulatory reports — one governed path for Saudi market.",
  },
  eyebrow: "LocalContentOS",
  productName: "Local content & supply chain operating system",
  statusLabel: "Available by agreed scope",
  problemLine:
    "Fragmented supplier and spend data — delayed local content reports that are hard to defend.",
  outcomeLine:
    "Compliance and local content as an operational path — not ad-hoc spreadsheet reports.",
  before: [
    "Unclassified suppliers",
    "Manual spend analysis",
    "Hidden compliance gaps",
    "Unclear indicators",
    "Procurement without impact simulation",
  ],
  after: [
    "Governed supplier classification",
    "Spend linked to actual suppliers",
    "Visible compliance gaps",
    "Accurate local content indicators",
    "Reports ready for regulators",
  ],
  flowSteps: ["Suppliers", "Spend", "Classify", "Gaps", "Indicators", "Reports"],
  highlights: [
    "Supplier–spend–compliance path",
    "ERP integration when activated",
    "LCGPA-ready reports",
  ],
  demoHref: "/en/proof#evidence-samples",
  demoLabel: "Sample outputs",
  primaryCta: { label: "Talk to us", href: "/en/contact" },
  secondaryCta: { label: "Government sector", href: "/en/industries#government" },
};
