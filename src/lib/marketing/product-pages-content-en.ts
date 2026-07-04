import type { ProductPageContent } from "./product-pages-content";

export const auditProductContentEn: ProductPageContent = {
  metadata: {
    title: "AuditOS  Governed Audit Operating System | AQLIYA",
    description:
      "Governed audit path from client acceptance to engagement pack  evidence, human review, immutable audit trail.",
  },
  eyebrow: "AuditOS",
  productName: "Audit & compliance operating system",
  statusLabel: "Available to deploy",
  problemLine:
    "Spreadsheets and email  audit work that is hard to defend to partners or regulators.",
  outcomeLine:
    "One path from source to approval  every figure linked to evidence, every decision logged.",
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
  primaryCta: { label: "Book a Diagnostic Session", href: "/en/contact" },
  secondaryCta: { label: "Proof materials", href: "/en/proof" },
  governanceItems: [
    { icon: "evidence", title: "Every figure linked to its source", detail: "Every number in the financial statements is traced back to its origin in the trial balance  invoice, contract, or journal entry. No assertion without evidence." },
    { icon: "approval", title: "Partner sign-off before any export", detail: "Five-condition approval gate before export: partner review, evidence completeness, quality sign-off, error-free check, and electronic signature." },
    { icon: "permissions", title: "Engagement team only", detail: "Only users assigned to the engagement see its working papers. No implicit access, no permissions beyond the team." },
    { icon: "audit", title: "ISA 230-compliant audit trail", detail: "Every event  create, edit, review, approve  is logged with timestamp and identity. The log is immutable and quality-review ready." },
  ],
};
export const decisionProductContentEn: ProductPageContent = {
  metadata: {
    title: "DecisionOS  Governed Decision Operating System | AQLIYA",
    description:
      "Governed decision path  alternatives, criteria, risks, AI recommendation, human approval.",
  },
  eyebrow: "DecisionOS",
  productName: "Institutional decision operating system",
  statusLabel: "Integrated into platform",
  problemLine: "Decisions in meetings and files  no shared criteria or approval trail.",
  outcomeLine: "Documented decision memo  reviewable and auditable at any time.",
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
  primaryCta: { label: "Book a Diagnostic Session", href: "/en/contact" },
  secondaryCta: { label: "Proof materials", href: "/en/proof" },
  governanceItems: [
    { icon: "evidence", title: "Every decision grounded in data", detail: "Options, criteria, risk assessments  all linked to their sources (reports, studies, figures). No decision without a foundation." },
    { icon: "approval", title: "Multi-level approval by policy", detail: "Decisions flow through manager, committee, then board depending on value and impact. Each level records approval or requests revision." },
    { icon: "permissions", title: "Role-gated proposal and approval", detail: "Who proposes, who reviews, who approves  pre-configured paths. The proposer cannot self-approve." },
    { icon: "audit", title: "Decision frozen after approval", detail: "Once a decision is approved, the record is frozen. Any subsequent change requires a new decision linked to the original." },
  ],
};

export const localContentProductContentEn: ProductPageContent = {
  metadata: {
    title: "LocalContentOS  Local Content & Compliance | AQLIYA",
    description:
      "Suppliers, spend, classification, compliance gaps, and regulatory reports  one governed path for Saudi market.",
  },
  eyebrow: "LocalContentOS",
  productName: "Local content & supply chain operating system",
  statusLabel: "Available by agreed scope",
  problemLine:
    "Fragmented supplier and spend data  delayed local content reports that are hard to defend.",
  outcomeLine:
    "Compliance and local content as an operational path  not ad-hoc spreadsheet reports.",
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
  primaryCta: { label: "Book a Diagnostic Session", href: "/en/contact" },
  secondaryCta: { label: "Proof materials", href: "/en/proof" },
  governanceItems: [
    { icon: "evidence", title: "Supplier declarations as evidence", detail: "Each supplier's local content percentage is backed by declarations and invoices. No figure without documentation." },
    { icon: "approval", title: "Classification and report approval", detail: "Supplier classification and local content reports pass through review and approval before submission to regulatory bodies." },
    { icon: "permissions", title: "Protected supplier data", detail: "Access to supplier and spend data is restricted by user role within the organization. No visibility without permission." },
    { icon: "audit", title: "Regulatory-grade audit trail", detail: "Every change in supplier classification, spend allocation, or report content is fully logged and ready for regulatory review." },
  ],
};

export type ProductIndexCardEn = {
  id: string;
  title: string;
  subtitle: string;
  statusLabel: string;
  problem: string;
  href: string;
  muted?: boolean;
};

export const roadmapProductCardsEn: ProductIndexCardEn[] = [
  {
    id: "sales",
    title: "SalesOS",
    subtitle: "Commercial intelligence",
    statusLabel: "Coming on platform roadmap",
    problem: "Qualification, pipeline, and sales memory  on the platform roadmap.",
    href: "/en/products/sales",
    muted: true,
  },
  {
    id: "office-ai",
    title: "Office AI Assistant",
    subtitle: "Shared institutional assistant",
    statusLabel: "Shared service",
    problem: "Institutional assistant across platform solutions  summarization, editing, analysis.",
    href: "/en/products/office-ai",
    muted: true,
  },
];
