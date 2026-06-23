/**
 * Plain customer-facing copy (Vision layer) — EN mirror, R6
 */

export const homeCopyEn = {
  metadata: {
    title: "AQLIYA | Audit, decisions, and compliance in one path",
    description:
      "AQLIYA helps your institution connect review, decisions, and compliance with clear files. Try the demo or book an intro call.",
  },
  hero: {
    eyebrow: "AQLIYA",
    title: "From trial balance to a file ready for sign-off — without Excel and email chaos",
    subtitle:
      "One platform for audit, decisions, and local content. AI suggests, your team reviews and approves — with a log for every step.",
  },
  ctas: {
    start: "Where to start",
    demo: "Watch the demo",
    contact: "Book a call",
  },
  problem: {
    title: "The gap is not the tool — it is what gets lost between tools",
    subtitle:
      "Decisions made in meetings but not documented, figures with no source, knowledge that leaves with people.",
    tools: [
      { name: "Excel", line: "Calculates numbers but does not show who reviewed or link figures to source." },
      { name: "Email and chat", line: "Carries the message but does not build a file that stands up to review." },
      { name: "Generic AI", line: "Fast answers without a clear review and approval path." },
    ],
    pathLabel: "What we offer",
    pathSteps: ["Upload data", "Review", "Approval", "Final file"],
    pathCta: "Real-world examples",
  },
  systems: {
    title: "Three solutions — one platform",
    subtitle: "Audit, decisions, and local content with shared permissions and audit log.",
    ctaAll: "See all solutions",
  },
  proof: {
    title: "Try before you commit",
    subtitle: "Interactive demo, leadership summary, and procurement-ready files.",
    items: [
      { title: "Demo", body: "Full audit path on sample data — no login.", href: "/en/demo" },
      { title: "Leadership summary", body: "One page on the platform and how we work together.", href: "/en/proof#executive-brief" },
      { title: "Procurement pack", body: "Security, scope, and SOW template — PDF for your committee.", href: "/en/procurement-pack" },
    ],
    ctaFull: "All proof materials",
  },
  personaChips: [
    { label: "Executive", href: "/en/start#executive" },
    { label: "Finance", href: "/en/start#cfo" },
    { label: "Contracting", href: "/en/start#contracting" },
    { label: "Audit", href: "/en/start#audit" },
    { label: "Procurement", href: "/en/start#procurement" },
    { label: "Government", href: "/en/start#government" },
  ],
  conversion: {
    title: "We start by understanding your context",
    body: "Free intro call — we explain the platform and suggest a sensible next step. No sales pitch.",
    primaryLabel: "Book a call",
    secondaryLabel: "Review proof",
  },
} as const;

export const startCopyEn = {
  metadata: {
    title: "Get Started | AQLIYA",
    description:
      "Pick your role — we point you to the right reading, demo, or procurement files.",
  },
  hero: {
    eyebrow: "Start here",
    title: "Where do you start with AQLIYA?",
    subtitle:
      "Choose your role below. We suggest a short reading path — then contact us when you are ready.",
  },
  chooseRole: "Choose your role",
  chooseRoleHint: "Three suggested reads — then a call when it makes sense.",
  engagementTitle: "How we work together",
  engagementHint: "From a free call to a trial on your data — no long contract before you see results.",
  pricingTitle: "Rough cost range (planning only)",
  pricingHint: "Not a formal quote. Trial on your data is free when scope is agreed.",
  processTitle: "Steps",
  processHint: "Same path for every client — kept simple.",
  proof: "Proof materials",
  useCases: "Use cases",
} as const;
