import Link from "next/link";
import type { Metadata } from "next";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";
import { publicOsStatusEn } from "@/lib/marketing/public-status";

export const metadata: Metadata = {
  title: "Engagement Models | AQLIYA",
  description:
    "Five engagement models from free diagnostic to institutional activation — honest scope, evidence-based decisions.",
};

const models = [
  {
    id: "diagnostic",
    name: "Executive diagnostic",
    tagline: "Understand context before any commitment",
    duration: "45–90 minutes",
    cost: "Free",
    description:
      "A structured working session on your context and constraints — not a sales deck. We determine fit and the right next step.",
    outputs: [
      "Fit assessment for your context",
      "Highest-value entry points",
      "Recommended next step",
      "Session summary document",
    ],
    cta: "Book diagnostic",
    href: "/en/contact",
    featured: false,
  },
  {
    id: "evaluation",
    name: "Operational evaluation",
    tagline: "Prove value on real data",
    duration: "2–4 weeks",
    cost: "Free",
    description:
      "One limited-scope workflow on your data in a governed tenant. Full path with pre-agreed success criteria and an evidence-based decision report.",
    outputs: [
      "End-to-end workflow on one engagement",
      "Documented evaluation criteria with measurable results",
      "Evidence-based decision report for next activation step",
      "Completed pack: statements + evidence + audit trail",
    ],
    cta: "Request evaluation",
    href: "/en/contact",
    featured: true,
  },
  {
    id: "activation",
    name: "Institutional activation",
    tagline: "From evaluation to production operation",
    duration: "Scoped after decision report",
    cost: "Scope-based — after evaluation",
    description:
      "After a successful operational evaluation, move to managed cloud activation with production gates: auth, backups, monitoring, and security review.",
    outputs: [
      "Production environment on managed cloud",
      "Production auth and user administration",
      "Automated backup and monitoring",
      "Team training and ongoing support",
    ],
    cta: "Discuss activation",
    href: "/en/contact",
    featured: false,
  },
  {
    id: "private",
    name: "Private deployment assessment",
    tagline: "For data sovereignty requirements",
    duration: "4–8 weeks — assessment & planning",
    cost: "Scope-based",
    description:
      "Joint technical assessment for private cloud or on-premises direction. Private packaging is planned — this model defines the implementation path together.",
    outputs: [
      "Joint infrastructure assessment",
      "Proposed private deployment plan",
      "Technical and regulatory requirements list",
      "Duration and effort estimate",
    ],
    cta: "Request technical assessment",
    href: "/en/contact",
    featured: false,
  },
  {
    id: "custom",
    name: "Custom institutional system",
    tagline: "Built on AQLIYA Intelligence Core",
    duration: "Requirements-driven",
    cost: "Custom — after diagnostic",
    description:
      "A governed system on AQLIYA Core — same RBAC, evidence, and audit trail — with workflow designed for your institutional context.",
    outputs: [
      "Custom workflow design",
      "Build on Intelligence Core",
      "Full governance: RBAC + audit trail + evidence",
      "Phased delivery with checkpoints",
    ],
    cta: "Start with diagnostic",
    href: "/en/contact",
    featured: false,
  },
];

const boundaries = [
  "We do not guarantee evaluation outcomes — the evaluation determines fit, not a final verdict.",
  "No full activation without scope evaluation — operational evaluation does not obligate production rollout.",
  "No sensitive data without agreed security arrangements.",
  "No replacement for professional judgment — the system supports human decisions.",
  "No unverified compliance claims — outputs are assistive; professional responsibility stays with your team.",
];

export default function EnglishEngagementModelsPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-black text-white sm:text-5xl">
            Engagement models
          </h1>
          <p className="mt-6 text-lg text-white/60">
            Five models for different stages of the buying decision — from free
            diagnostic to governed institutional operation.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-6 px-6 py-16">
        {models.map((m) => (
          <article
            key={m.id}
            className={`rounded-2xl border p-6 ${
              m.featured
                ? "border-primary/40 bg-primary/5"
                : "border-border/60"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-foreground">{m.name}</h2>
                <p className="text-sm text-primary">{m.tagline}</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{m.duration}</p>
                <p className="font-semibold text-foreground">{m.cost}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {m.description}
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {m.outputs.map((o) => (
                <li
                  key={o}
                  className="rounded-lg bg-muted/30 px-3 py-2 text-xs text-foreground"
                >
                  {o}
                </li>
              ))}
            </ul>
            <Link href={m.href} className="btn-outline mt-5 inline-flex h-10 px-5 text-sm">
              {m.cta}
            </Link>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-4xl border-t px-6 py-16">
        <h2 className="text-2xl font-black text-foreground">Operating systems</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Evaluation paths map to governed operating systems on one platform.
        </p>
        <ul className="mt-6 space-y-3 text-sm">
          <li>
            <Link href="/en/products/audit" className="text-primary underline">
              AuditOS
            </Link>
            {" — "}
            {publicOsStatusEn.auditOS.capabilityNote}
          </li>
          <li>
            <Link href="/en/products/decision" className="text-primary underline">
              DecisionOS
            </Link>
            {" — "}
            {publicOsStatusEn.decisionOS.capabilityNote}
          </li>
          <li>
            <Link
              href="/en/products/local-content"
              className="text-primary underline"
            >
              LocalContentOS
            </Link>
            {" — "}
            {publicOsStatusEn.localContentOS.capabilityNote}
          </li>
        </ul>
      </section>

      <section className="mx-auto max-w-4xl border-t px-6 py-16">
        <h2 className="text-2xl font-black text-foreground">Boundaries</h2>
        <ul className="mt-6 space-y-3">
          {boundaries.map((b) => (
            <li key={b} className="text-sm leading-7 text-muted-foreground">
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-10 text-center">
          <ScheduleDiagnosticCta locale="en" />
        </div>
      </section>
    </div>
  );
}
