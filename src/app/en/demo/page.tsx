import Link from "next/link";
import type { Metadata } from "next";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";
import { DemoVideoSection } from "@/components/marketing/demo-video-section";

export const metadata: Metadata = {
  title: "Interactive Demo | AQLIYA",
  description:
    "10–13 minute guided AuditOS demo on sanitized data. See human gates, evidence chain, and audit trail in action.",
};

const steps = [
  "Upload trial balance — balance check in seconds",
  "Account mapping — AI suggests, you approve",
  "Financial statements — every number linked to source",
  "Evidence manifest — gaps surfaced before sign-off",
  "Findings workflow — create → assign → review → close",
  "Live audit trail — 18+ event types, immutable log",
  "Release gates — export blocked until conditions met",
  "Engagement pack — deliverable bundle with audit record",
];

export default function EnglishDemoPage() {
  return (
    <div className="min-h-screen bg-aqliya-deep" dir="ltr">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-black text-white sm:text-5xl">
            See the workflow — don&apos;t just read about it
          </h1>
          <p className="mt-6 text-lg text-slate-300">
            Sanitized data only. No account required. ~10 minutes end-to-end.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/auditos" className="btn-primary px-8 py-3">
              Start AuditOS demo
            </Link>
            <ScheduleDiagnosticCta locale="en" variant="outline" />
          </div>
        </div>
      </section>

      <DemoVideoSection locale="en" />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-xl font-bold text-white">What you will see</h2>
        <ul className="mt-6 space-y-3">
          {steps.map((s) => (
            <li key={s} className="flex gap-3 text-sm text-slate-300">
              <span className="text-cyan-400">✓</span>
              {s}
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-slate-400">
          AI assists. Humans decide. Evidence governs — enforced at every step.
        </p>
      </section>
    </div>
  );
}
