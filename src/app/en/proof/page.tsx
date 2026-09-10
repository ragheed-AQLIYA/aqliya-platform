import Link from "next/link";
import type { Metadata } from "next";
import { buyerJourneysEn } from "@/lib/marketing/buyer-journeys-en";
import { DemoVideoSection } from "@/components/marketing/demo-video-section";
import { ConversionBand } from "@/components/marketing/v2/marketing-shell";
import { Reveal } from "@/components/marketing/reveal";
import {
  deploymentOptionsEn,
  evidenceSamplesEn,
  executiveBriefLayersEn,
  governancePrinciplesEn,
  outcomesFutureMetricsEn,
  pilotDecisionOutcomesEn,
  proofDimensionsEn,
  proofPageCopyEn,
  proofScenariosEn,
} from "@/lib/marketing/copy-proof-en";
import { buildAlternates } from "@/lib/marketing/seo";

export const metadata: Metadata = {
  title: proofPageCopyEn.metadata.title,
  description: proofPageCopyEn.metadata.description,
  alternates: buildAlternates("/en/proof"),
};

export default function EnglishProofCenterPage() {
  const c = proofPageCopyEn;

  return (
    <div className="flex flex-col">
      <section className="hero-gradient relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              {c.hero.eyebrow}
            </span>
            <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">
              {c.hero.title}
            </h1>
            <p className="mt-4 text-lg leading-8 text-white/60">{c.hero.subtitle}</p>
            <p className="mt-2 text-sm text-white/40">{c.hero.sampleNote}</p>
          </div>
        </div>
      </section>

      <section className="sticky top-14 z-40 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-2 px-6 py-3">
          {c.anchorNav.map((a) => (
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
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <h2 className="text-2xl font-black">{c.sections.demo.title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {c.sections.demo.subtitle}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/en/demo" className="btn-primary h-10 px-6 text-sm">
              {c.sections.demo.primaryCta}
            </Link>
            <Link href="/auditos" className="btn-outline h-10 px-6 text-sm">
              {c.sections.demo.secondaryCta}
            </Link>
          </div>
        </div>
        <DemoVideoSection locale="en" />
      </section>

      <section id="executive-brief" className="scroll-mt-28 border-t bg-muted/10">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <h2 className="text-2xl font-black">{c.sections.brief.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{c.sections.brief.subtitle}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {executiveBriefLayersEn.map((layer, i) => (
              <Reveal key={layer.name} delay={i * 70} className="rounded-xl border border-border/60 bg-background p-5">
                <h3 className="font-bold">{layer.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{layer.description}</p>
              </Reveal>
            ))}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {governancePrinciplesEn.map((p, i) => (
              <Reveal key={p.title} delay={i * 70} className="rounded-xl border border-primary/15 bg-primary/[0.03] p-5">
                <h3 className="text-sm font-bold text-primary">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.detail}</p>
              </Reveal>
            ))}
          </div>
          <div className="mt-8 space-y-3">
            {deploymentOptionsEn.map((d, i) => (
              <Reveal
                key={d.name}
                delay={i * 70}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-border/50 px-4 py-3 text-sm"
              >
                <span className="font-semibold">{d.name}</span>
                <span className="text-muted-foreground">{d.status}</span>
                <span className="w-full text-xs text-muted-foreground/80">{d.note}</span>
              </Reveal>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/print/executive-brief-en" target="_blank" className="btn-outline h-10 px-5 text-sm">
              PDF for print
            </Link>
            <Link href="/en/proof#executive-brief" className="btn-outline h-10 px-5 text-sm">
              Arabic brief
            </Link>
          </div>
        </div>
      </section>

      <section id="evaluation-framework" className="scroll-mt-28 border-t">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <h2 className="text-2xl font-black">{c.sections.evaluation.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{c.sections.evaluation.subtitle}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {proofDimensionsEn.map((d, i) => (
              <Reveal key={d.dimension} delay={i * 70} className="rounded-xl border border-border/60 p-4">
                <h3 className="text-sm font-bold">{d.dimension}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d.question}</p>
              </Reveal>
            ))}
          </div>
          <div className="mt-8 space-y-3">
            {proofScenariosEn.map((s, i) => (
              <Reveal key={s.title} delay={i * 70} className="rounded-xl border border-border/60 p-4">
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-primary">{s.verifiable}</p>
              </Reveal>
            ))}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {pilotDecisionOutcomesEn.map((o, i) => (
              <Reveal key={o.outcome} delay={i * 70} className="rounded-xl border border-border/60 p-4 text-sm">
                <p className="font-bold">{o.outcome}</p>
                <p className="mt-1 text-muted-foreground">{o.detail}</p>
              </Reveal>
            ))}
          </div>
          <Link href="/en/start#engagement" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
            {c.sections.evaluation.engagementLink} →
          </Link>
        </div>
      </section>

      {/* ─── Pilot Framework ─────────────────────────── */}
      <section id="pilot" className="scroll-mt-28 border-t">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <h2 className="text-2xl font-black">{c.sections.pilot.title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{c.sections.pilot.subtitle}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {c.pilotPhases.map((p, i) => (
              <Reveal key={p.phase} delay={i * 70} className="relative rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/10 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-black text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{p.duration}</span>
                </div>
                <h3 className="text-base font-black text-foreground">{p.phase}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{p.detail}</p>
              </Reveal>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/en/contact" className="btn-primary h-10 px-6 text-sm">
              {c.sections.pilot.cta}
            </Link>
            <Link href="/en/start#engagement" className="btn-outline h-10 px-6 text-sm">
              {c.sections.evaluation.engagementLink} →
            </Link>
          </div>
        </div>
      </section>

      <section id="evidence-samples" className="scroll-mt-28 border-t bg-muted/10">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <h2 className="text-2xl font-black">{c.sections.evidence.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{c.sections.evidence.subtitle}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {evidenceSamplesEn.map((sample, i) => (
              <Reveal key={sample.id} delay={i * 70} className="rounded-xl border border-border/60 bg-background p-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {sample.category}
                </p>
                <h3 className="mt-1 font-bold">{sample.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{sample.highlight}</p>
                <span className="mt-3 inline-block text-[10px] text-amber-600">
                  {c.sections.evidence.sampleBadge}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="outcomes" className="scroll-mt-28 border-t">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <h2 className="text-center text-2xl font-black">{c.sections.outcomes.title}</h2>
          <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 text-center">
            <p className="text-sm font-semibold text-amber-700">{c.sections.outcomes.statusLabel}</p>
            <p className="mt-2 text-xl font-black">{c.sections.outcomes.statusTitle}</p>
            <p className="mt-3 text-sm text-muted-foreground">{c.sections.outcomes.statusBody}</p>
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
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 text-center">
          <h2 className="text-xl font-black">{c.sections.procurement.title}</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {c.externalLinks.map((r) => (
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
        title="We start by understanding your context"
        body="Free intro call  we explain the platform and suggest a sensible next step. No sales pitch."
        primaryHref="/en/contact"
        primaryLabel="Book a Diagnostic Session"
        secondaryHref="/en/proof"
        secondaryLabel="Proof materials"
      />
    </div>
  );
}
