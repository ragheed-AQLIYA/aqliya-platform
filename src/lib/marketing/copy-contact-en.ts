/**
 * Contact / convert layer copy — EN mirror, R6.5
 */

export const contactPageCopyEn = {
  metadata: {
    title: "Contact us | AQLIYA",
    description:
      "Intro call or trial on your data — limited scope and clear criteria before any long commitment.",
  },
  hero: {
    eyebrow: "Contact",
    title: "Book a call or request a trial on your data",
    subtitle: "One path, limited data, clear success criteria — before any wide commitment.",
    bullets: [
      "We match the right solution to your need",
      "We understand your current workflow",
      "Outputs linked to clear files",
    ],
  },
  howItWorks: {
    eyebrow: "How we start",
    title: "Not a sales pitch — we understand your context first",
    body: "No long contracts upfront. We agree workflow, data, review team, and success criteria. In 2–4 weeks you get a realistic read: does AQLIYA fit, and what is the next step.",
    steps: [
      { num: "1", text: "Pick the right solution and path" },
      { num: "2", text: "Work on your data within agreed scope" },
      { num: "3", text: "Review results and suggest next step" },
    ],
  },
  products: {
    eyebrow: "Pick a starting point",
    title: "Which solution fits your need?",
    subtitle: "Every solution shares the same platform — permissions, activity log, human review.",
    exploreLink: "Explore solution",
  },
  review: {
    eyebrow: "What we discuss",
    title: "What we align on before a trial",
    subtitle: "Five topics — so the trial measures what actually matters.",
  },
  boundaries: {
    eyebrow: "Clear boundaries",
    title: "What we will not promise",
    subtitle: "Trust starts with honesty about limits.",
    items: [
      "No compliance guarantee — outputs assist; professional responsibility stays with your team.",
      "No replacement for professional teams — the system supports, not replaces judgment.",
      "No full automation without review — every output is reviewed before sign-off.",
      "No rollout commitment before you see results — a trial does not bind a wide contract.",
      "No sensitive data without arrangements — we align security and privacy before start.",
    ],
  },
  finalCta: {
    title: "Start small — then decide",
    body: "One trial does not decide your institution's future — but it clarifies if the path is right.",
    proofLink: "Trial criteria",
    emailLink: "Email us directly",
  },
} as const;

export const contactFormCopyEn = {
  sidebar: {
    eyebrow: "Get in touch",
    title: "Book a call or send a request",
    body: "Five fields are enough to start — we reply within 2–3 business days.",
    hints: [
      "We assess fit before any commitment.",
      "If scope is unclear, we start with a short call.",
      "ragheed@aqliya.com for urgent requests.",
    ],
    directEmailTitle: "Email us directly",
  },
  form: {
    title: "Contact request",
    subtitle: "Core fields are enough — extra details optional.",
    submit: "Send request",
    submitting: "Sending...",
    successTitle: "Request received",
    successBody: "We will review within 2–3 business days and reply to your email.",
    defaultGoal: "To discuss on intro call",
  },
  interestOptions: [
    "Intro call",
    "Trial on our data",
    "Demo — watch full path",
    "General inquiry",
  ],
} as const;
