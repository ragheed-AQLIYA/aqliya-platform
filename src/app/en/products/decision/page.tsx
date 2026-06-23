import Link from "next/link";
import type { Metadata } from "next";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";
import { publicOsStatusEn } from "@/lib/marketing/public-status";

export const metadata: Metadata = {
  title: "DecisionOS — Governed Decision Operating System | AQLIYA",
  description:
    "Institutional decision operating system — alternatives, risks, evidence, recommendation, and approval in one governed path.",
};

const journey = [
  {
    step: "01",
    title: "Problem framing",
    detail: "Define the decision context, stakeholders, and constraints.",
  },
  {
    step: "02",
    title: "Alternatives & criteria",
    detail: "Structured options with measurable evaluation criteria.",
  },
  {
    step: "03",
    title: "Risk assessment",
    detail: "Risk register linked to each alternative — not ad-hoc debate.",
  },
  {
    step: "04",
    title: "Evidence & recommendation",
    detail: "AI-assisted drafts; every claim traceable to sources.",
  },
  {
    step: "05",
    title: "Review & approval",
    detail: "Human gates, approval log, exportable decision memo.",
  },
];

const outputs = [
  "Decision brief",
  "Decision memo",
  "Comparison matrix",
  "Risk summary",
  "Recommendation report",
  "Approval log",
];

export default function EnglishDecisionProductPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-4xl px-6">
          <Link
            href="/en/platform#capabilities"
            className="text-sm text-white/45 hover:text-white/70"
          >
            ← Operating systems
          </Link>
          <div className="mt-8 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-aqliya-cyan">
              {publicOsStatusEn.decisionOS.label}
            </span>
            <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">
              DecisionOS
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/65">
              {publicOsStatusEn.decisionOS.capabilityNote}. Your institution
              needs a decision operating system — not scattered memos and
              meetings with no trail.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <ScheduleDiagnosticCta locale="en" />
              <Link href="/en/proof" className="btn-outline px-6 py-3">
                Proof center
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-2xl font-black text-foreground">Workflow journey</h2>
        <div className="mt-8 space-y-4">
          {journey.map((j) => (
            <div
              key={j.step}
              className="flex gap-4 rounded-xl border border-border/60 p-5"
            >
              <span className="text-sm font-black text-primary">{j.step}</span>
              <div>
                <h3 className="font-bold text-foreground">{j.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{j.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl border-t px-6 py-16">
        <h2 className="text-2xl font-black text-foreground">Outputs</h2>
        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {outputs.map((item) => (
            <li
              key={item}
              className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm text-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          AI assists. Humans decide. Evidence governs.
        </p>
      </section>
    </div>
  );
}
