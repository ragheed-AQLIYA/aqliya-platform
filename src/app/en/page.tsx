import Link from "next/link";
import type { Metadata } from "next";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";

export const metadata: Metadata = {
  title: "AQLIYA | Institutional Operating Platform",
  description:
    "A governed institutional operating platform for audit, decisions, compliance, and evidence-backed intelligence. AI assists. Humans decide. Evidence governs.",
};

const businessOutcomes = [
  {
    title: "Faster, clearer decisions",
    body: "Documented decision memos — context, alternatives, risks, and approval — instead of meetings with no trail.",
  },
  {
    title: "Stronger audit traceability",
    body: "Every figure linked to source. Every approval logged — from trial balance to engagement pack.",
  },
  {
    title: "Better compliance readiness",
    body: "Local content, suppliers, spend, and regulatory reporting in one governed path.",
  },
  {
    title: "Governed institutional knowledge",
    body: "Knowledge stays inside the institution — tied to evidence and permissions, not individual memory.",
  },
  {
    title: "Lower operational risk",
    body: "Review and approval gates prevent undocumented outputs from reaching final decisions.",
  },
];

export default function EnglishHomePage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              Institutional Operating Platform
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight text-white sm:text-5xl">
              Governed operations for audit, decisions, compliance, and
              institutional intelligence
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/65">
              AQLIYA helps institutions turn critical work — audit, decisions,
              local content, and compliance — into governed paths with human
              review, evidence chains, and accountability.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-sm font-semibold text-aqliya-cyan">
              AI assists. Humans decide. Evidence governs.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <ScheduleDiagnosticCta locale="en" />
              <Link
                href="/use-cases"
                className="btn-outline border-white/15 text-white/70 hover:bg-white/5 h-11 px-6"
              >
                Explore use cases
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-gradient-light border-t">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <h2 className="text-center text-3xl font-black text-foreground">
            What your institution gains
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            AQLIYA does not sell isolated AI — it builds institutional capability
            for decision, audit, and compliance with defensible evidence.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businessOutcomes.map((outcome) => (
              <div
                key={outcome.title}
                className="rounded-2xl border border-border/60 bg-background p-6"
              >
                <h3 className="text-base font-black text-foreground">
                  {outcome.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {outcome.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <h2 className="text-center text-3xl font-black text-foreground">
          Operating systems on one platform
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Specialized operating systems inherit the same governance core — RBAC,
          evidence graph, workflow gates, and audit trail.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "AuditOS",
              body: "Trial balance to engagement pack — full audit traceability.",
              href: "/en/products/audit",
              tag: "Audit & assurance",
            },
            {
              title: "DecisionOS",
              body: "Structured decision memos with alternatives, risks, and approval.",
              href: "/products/decision",
              tag: "Decision governance",
            },
            {
              title: "LocalContentOS",
              body: "Suppliers, spend, compliance — governed local content operations.",
              href: "/products/local-content",
              tag: "Compliance & local content",
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-2xl border border-border/60 bg-background p-6 transition hover:border-primary/25"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                {item.tag}
              </span>
              <h3 className="mt-2 text-lg font-black">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.body}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="rounded-[28px] border border-border/60 bg-gradient-to-br from-muted/30 to-background p-8 text-center sm:p-12">
          <h2 className="text-2xl font-black text-foreground">
            Validate before you commit
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
            Diagnostic session → operational evaluation → evidence-based
            decision. No large contract before proof.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/en/proof" className="btn-outline h-11 px-6">
              Review proof package
            </Link>
            <Link href="/en/executive-brief" className="btn-outline h-11 px-6">
              Request executive briefing
            </Link>
            <ScheduleDiagnosticCta locale="en" variant="outline" />
          </div>
        </div>
      </section>
    </div>
  );
}
