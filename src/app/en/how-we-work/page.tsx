import Link from "next/link";
import type { Metadata } from "next";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";

export const metadata: Metadata = {
  title: "How We Work | AQLIYA",
  description:
    "From diagnostic to institutional operation — governed methodology. AI assists. Humans decide. Evidence governs.",
};

const principles = [
  {
    title: "AI assists — humans decide",
    body: "All AI outputs are drafts for review and approval. No final decision is made autonomously.",
  },
  {
    title: "Evidence governs",
    body: "Every recommendation links to sources: files, data, classification rules, or approved references.",
  },
  {
    title: "Governance is built in",
    body: "Permissions, approvals, and audit trails are part of every operating path — not add-ons.",
  },
  {
    title: "Institution-first",
    body: "We start from your roles, workflows, bottlenecks, and constraints — not generic templates.",
  },
];

const phases = [
  {
    step: "1",
    title: "Diagnostic",
    body: "Structured session on context and fit — not a sales presentation.",
  },
  {
    step: "2",
    title: "Operational evaluation",
    body: "Full workflow on real data with pre-agreed success criteria.",
  },
  {
    step: "3",
    title: "Operational rollout",
    body: "Activate the agreed path with permissions, integrations, and training.",
  },
  {
    step: "4",
    title: "Institutional expansion",
    body: "Add operating systems and users while preserving governance and auditability.",
  },
];

export default function EnglishHowWeWorkPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-black text-white sm:text-5xl">
            How we work
          </h1>
          <p className="mt-6 text-lg text-white/60">
            A governed path from first conversation to institutional operation.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <p className="text-xl font-semibold text-primary">
          AI assists. Humans decide. Evidence governs.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-16">
        <h2 className="text-2xl font-black text-foreground">Principles</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {principles.map((p) => (
            <div
              key={p.title}
              className="rounded-xl border border-border/60 p-5"
            >
              <h3 className="font-bold text-foreground">{p.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl border-t px-6 py-16">
        <h2 className="text-2xl font-black text-foreground">Phases</h2>
        <div className="mt-8 space-y-4">
          {phases.map((p) => (
            <div
              key={p.step}
              className="flex gap-4 rounded-xl border border-border/60 p-5"
            >
              <span className="text-sm font-black text-primary">{p.step}</span>
              <div>
                <h3 className="font-bold text-foreground">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          <Link href="/en/engagement-models" className="text-primary underline">
            Engagement models
          </Link>
          {" · "}
          <Link href="/en/proof" className="text-primary underline">
            Proof center
          </Link>
        </p>
        <div className="mt-8 text-center">
          <ScheduleDiagnosticCta locale="en" />
        </div>
      </section>
    </div>
  );
}
