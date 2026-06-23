import Link from "next/link";
import type { Metadata } from "next";
import { buyerJourneysEn } from "@/lib/marketing/buyer-journeys-en";
import { DemoVideoSection } from "@/components/marketing/demo-video-section";
import { ConversionBand } from "@/components/marketing/v2/marketing-shell";
import {
  deploymentOptionsEn,
  evidenceSamplesEn,
  executiveBriefLayersEn,
  governancePrinciplesEn,
  outcomesFutureMetricsEn,
  pilotDecisionOutcomesEn,
  proofDimensionsEn,
  proofScenariosEn,
} from "@/lib/marketing/proof-hub-content-en";
import { publicEngagementGateEn } from "@/lib/marketing/public-status";

export const metadata: Metadata = {
  title: "Proof Center | AQLIYA",
  description:
    "Unified proof hub: demo, executive brief, operational evaluation framework, evidence samples, and procurement — before any commitment.",
};

const anchorNav = [
  { id: "demo", label: "Demo" },
  { id: "executive-brief", label: "Executive brief" },
  { id: "evaluation-framework", label: "Evaluation" },
  { id: "evidence-samples", label: "Evidence library" },
  { id: "outcomes", label: "Outcomes" },
  { id: "procurement", label: "Procurement" },
];

const externalLinks = [
  { label: "Procurement pack", href: "/en/procurement-pack" },
  { label: "Security", href: "/en/security" },
  { label: "Case studies", href: "/case-studies" },
  { label: "Where to start", href: "/en/start" },
];

export default function EnglishProofCenterPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              Proof Center
            </span>
            <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">
              Proof Center
            </h1>
            <p className="mt-4 text-lg leading-8 text-white/60">
              Everything you need to evaluate AQLIYA in one place — demo, documents,
              criteria, and sample outputs. {publicEngagementGateEn}
            </p>
            <p className="mt-2 text-sm text-white/40">
              Sanitized data only — no real customer records.
            </p>
          </div>
        </div>
      </section>

      <section className="sticky top-14 z-40 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-2 px-6 py-3">
          {anchorNav.map((a) => (
            <a
              key={a.id}
              href={`#${a.id}`}
              className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:border-primary/40 hover:text-primary"
            >
              {a.label}
            </a>
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/10 py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap justify-center gap-2">
            {buyerJourneysEn.map((j) => (
              <Link
                key={j.id}
                href={`/en/start#${j.id}`}
                className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs hover:border-primary/30"
              >
                {j.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="scroll-mt-28 border-t">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="text-2xl font-black">Interactive demo</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Full operational path in 10–13 minutes on sanitized data — no login.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/en/demo" className="btn-primary h-10 px-6 text-sm">
              Start demo
            </Link>
            <Link href="/auditos" className="btn-outline h-10 px-6 text-sm">
              AuditOS guided path
            </Link>
          </div>
        </div>
        <DemoVideoSection locale="en" />
      </section>

      <section id="executive-brief" className="scroll-mt-28 border-t bg-muted/10">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="text-2xl font-black">Executive brief</h2>
          <p className="mt-2 text-sm text-muted-foreground">Five minutes for leadership</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {executiveBriefLayersEn.map((layer) => (
              <div key={layer.name} className="rounded-xl border border-border/60 bg-background p-5">
                <h3 className="font-bold">{layer.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{layer.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {governancePrinciplesEn.map((p) => (
              <div key={p.title} className="rounded-xl border border-primary/15 bg-primary/[0.03] p-5">
                <h3 className="text-sm font-bold text-primary">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 space-y-3">
            {deploymentOptionsEn.map((d) => (
              <div
                key={d.name}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-border/50 px-4 py-3 text-sm"
              >
                <span className="font-semibold">{d.name}</span>
                <span className="text-muted-foreground">{d.status}</span>
                <span className="w-full text-xs text-muted-foreground/80">{d.note}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/print/executive-brief-en" target="_blank" className="btn-outline h-10 px-5 text-sm">
              PDF for print
            </Link>
            <Link href="/proof#executive-brief" className="btn-outline h-10 px-5 text-sm">
              Arabic brief
            </Link>
          </div>
        </div>
      </section>

      <section id="evaluation-framework" className="scroll-mt-28 border-t">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="text-2xl font-black">Operational evaluation framework</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Six dimensions + verifiable scenarios in the demo
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {proofDimensionsEn.map((d) => (
              <div key={d.dimension} className="rounded-xl border border-border/60 p-4">
                <h3 className="text-sm font-bold">{d.dimension}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d.question}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 space-y-3">
            {proofScenariosEn.map((s) => (
              <div key={s.title} className="rounded-xl border border-border/60 p-4">
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-primary">{s.verifiable}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {pilotDecisionOutcomesEn.map((o) => (
              <div key={o.outcome} className="rounded-xl border border-border/60 p-4 text-sm">
                <p className="font-bold">{o.outcome}</p>
                <p className="mt-1 text-muted-foreground">{o.detail}</p>
              </div>
            ))}
          </div>
          <Link href="/en/engagement-models" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
            Engagement models & free evaluation →
          </Link>
        </div>
      </section>

      <section id="evidence-samples" className="scroll-mt-28 border-t bg-muted/10">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="text-2xl font-black">Evidence library</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sample outputs on trial data — for review, not final sign-off
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {evidenceSamplesEn.map((sample) => (
              <div key={sample.id} className="rounded-xl border border-border/60 bg-background p-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {sample.category}
                </p>
                <h3 className="mt-1 font-bold">{sample.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{sample.highlight}</p>
                <span className="mt-3 inline-block text-[10px] text-amber-600">Trial data</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="outcomes" className="scroll-mt-28 border-t">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="text-2xl font-black text-center">Operational evaluation outcomes</h2>
          <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 text-center">
            <p className="text-sm font-semibold text-amber-700">Current status</p>
            <p className="mt-2 text-xl font-black">Institutional references in preparation</p>
            <p className="mt-3 text-sm text-muted-foreground">
              No vanity metrics. Measured outcomes publish here after the first
              operational evaluation with an evidence-based decision.
            </p>
          </div>
          <ul className="mt-8 space-y-2">
            {outcomesFutureMetricsEn.map((m) => (
              <li key={m} className="rounded-lg border border-border/60 px-4 py-3 text-sm text-muted-foreground">
                {m}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="procurement" className="scroll-mt-28 border-t bg-muted/10">
        <div className="mx-auto max-w-7xl px-6 py-14 text-center">
          <h2 className="text-xl font-black">Additional resources</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {externalLinks.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="rounded-full border border-border/60 bg-background px-4 py-2 text-sm hover:border-primary/30"
              >
                {r.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ConversionBand
        title="Start with a diagnostic session — free"
        body="We understand your institution's context and recommend the next step — no sales pitch."
        primaryHref="/en/contact"
        primaryLabel="Book diagnostic session"
        secondaryHref="/en/proof"
        secondaryLabel="Proof center"
      />
    </div>
  );
}
