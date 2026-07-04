import type { InstitutionalUseCase } from "@/lib/marketing/institutional-use-cases";

export const institutionalUseCasesEn: InstitutionalUseCase[] = [
  {
    id: "audit-compliance",
    category: "AuditOS",
    categoryColor: "text-emerald-400",
    categoryBorder: "border-emerald-500/20",
    categoryBg: "bg-emerald-500/5",
    title: "Internal Audit & Compliance",
    icon: "◈",
    problem:
      "Audit teams spend 60–70% of their time manually collecting information from scattered documents across multiple systems — instead of actual analysis.",
    traditionalState:
      "An auditor reads hundreds of pages manually, annotates them, creates summaries in Excel, then repeats the process in the next cycle.",
    aqliyaApproach:
      "AuditOS processes hundreds of financial and operational documents, generates a risk map linked to specific evidence, and alerts the auditor on deviations — with a full audit trail for every result.",
    outcome:
      "Data collection cycle reduced from weeks to hours, while keeping human auditors as the final decision-makers.",
    systemLink: "/en/products/audit",
    systemLabel: "Explore AuditOS",
  },
  {
    id: "decision-governance",
    category: "DecisionOS",
    categoryColor: "text-violet-400",
    categoryBorder: "border-violet-500/20",
    categoryBg: "bg-violet-500/5",
    title: "Decision Governance",
    icon: "◉",
    problem:
      "Important decisions are made in meetings without documenting their context — who approved, what were the alternatives, why this path was chosen. Six months later, no one remembers.",
    traditionalState:
      "Generic meeting minutes, decisions scattered across emails, and no way to review the decision logic when needed.",
    aqliyaApproach:
      "DecisionOS creates a structured decision record: context, options considered, supporting evidence, approvers, and outcomes — with search and cross-linking between related decisions.",
    outcome:
      "An institution capable of presenting documented justification for any decision to the board or regulator — in clicks, not hours of searching.",
    systemLink: "/en/products/decision",
    systemLabel: "Explore DecisionOS",
  },
  {
    id: "local-content",
    category: "LocalContentOS",
    categoryColor: "text-sky-400",
    categoryBorder: "border-sky-500/20",
    categoryBg: "bg-sky-500/5",
    title: "Local Content Management & Regulatory Compliance",
    icon: "◎",
    problem:
      "Local content requirements in government contracts and regulated sectors demand continuous monitoring, periodic reporting, and documentation that is difficult to maintain manually as projects scale.",
    traditionalState:
      "Complex Excel sheets, scattered data, manual reports prepared just before deadlines with risks of human error.",
    aqliyaApproach:
      "LocalContentOS tracks local content metrics in real time, generates compliance reports automatically, and alerts on deviations before deadlines.",
    outcome:
      "Compliance reports ready in minutes, with a complete evidence trail that withstands regulatory reviews.",
    systemLink: "/en/products/local-content",
    systemLabel: "Explore LocalContentOS",
  },
  {
    id: "institutional-memory",
    category: "Custom / Intelligence Core",
    categoryColor: "text-amber-400",
    categoryBorder: "border-amber-500/20",
    categoryBg: "bg-amber-500/5",
    title: "Institutional Memory & Knowledge Management",
    icon: "◌",
    problem:
      "When an expert employee leaves, they take years of undocumented context and knowledge with them. The organization starts from scratch every cycle.",
    traditionalState:
      "Outdated procedure documents, abandoned file shares, and tacit knowledge distributed across individuals.",
    aqliyaApproach:
      "A custom system built on the Intelligence Core creates a living institutional knowledge base: policies, historical decisions, lessons learned, and best practices — searchable and cross-linked.",
    outcome:
      "Organizational knowledge becomes a productive asset, not individual memory — a new hire is productive in weeks, not months.",
    systemLink: "/en/custom-product",
    systemLabel: "Design Custom System",
  },
  {
    id: "contract-monitoring",
    category: "Custom / AuditOS",
    categoryColor: "text-amber-400",
    categoryBorder: "border-amber-500/20",
    categoryBg: "bg-amber-500/5",
    title: "Contract Monitoring & Obligation Management",
    icon: "◐",
    problem:
      "Organizations managing dozens or hundreds of contracts struggle to track obligations, due dates, and renewal terms — discovering violations after the fact.",
    traditionalState:
      "A contract list in spreadsheets, manual calendar reminders, and annual reviews that miss many critical details.",
    aqliyaApproach:
      "A system that processes contract texts and extracts obligations, dates, and terms, creates a live monitoring dashboard, and alerts officials before due dates.",
    outcome:
      "No obligation missed, every potential violation addressed in advance, and a full record of every amendment or renewal.",
    systemLink: "/en/custom-product",
    systemLabel: "Design Custom System",
  },
  {
    id: "regulatory-readiness",
    category: "Custom / DecisionOS",
    categoryColor: "text-amber-400",
    categoryBorder: "border-amber-500/20",
    categoryBg: "bg-amber-500/5",
    title: "Regulatory Readiness & Oversight",
    icon: "◑",
    problem:
      "Sudden regulatory inspection or disclosure requests disrupt organizations without systematic documentation practices — file preparation takes weeks.",
    traditionalState:
      "Intensive file preparation before every regulatory visit, delayed documentation, and inconsistent narratives.",
    aqliyaApproach:
      "Continuous, real-time documentation of every decision and action, with an Evidence Chain structure that enables extracting a complete compliance file at any time — not just when needed.",
    outcome:
      "Inspections become routine, not crises. The file is always ready, reliable, and linked to original evidence.",
    systemLink: "/en/governance",
    systemLabel: "Governance Framework",
  },
  {
    id: "procurement-intelligence",
    category: "Custom / Intelligence Core",
    categoryColor: "text-amber-400",
    categoryBorder: "border-amber-500/20",
    categoryBg: "bg-amber-500/5",
    title: "Procurement Intelligence & Award Decision Support",
    icon: "◒",
    problem:
      "Tender evaluation committees drown in hundreds of pages of technical and financial offers — evaluation takes weeks and critical details are missed.",
    traditionalState:
      "Manual reading, personal notes, and comparisons in spreadsheets built by each committee member in their own way.",
    aqliyaApproach:
      "A system that analyzes tender documents and extracts comparison points based on evaluation criteria, creates a documented comparison matrix, and alerts on deviations or gaps.",
    outcome:
      "An award decision supported by documented evidence, reviewable, and protected from challenges.",
    systemLink: "/en/custom-product",
    systemLabel: "Design Custom System",
  },
];
