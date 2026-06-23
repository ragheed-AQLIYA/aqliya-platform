import Link from "next/link";
import type { Metadata } from "next";
import {
  buyerJourneysEn,
  universalJourneyStepsEn,
} from "@/lib/marketing/buyer-journeys-en";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";

export const metadata: Metadata = {
  title: "Get Started | AQLIYA",
  description:
    "Choose your role — executive, finance, technology, audit, procurement, or government — and get a clear path to proof and contact.",
};

export default function EnglishStartPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-4xl font-black text-white sm:text-5xl">
            Where do you start with AQLIYA?
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/60">
            We don&apos;t ask for faith in slides. Pick your role — we route you
            to the right proof in minutes, then you decide with evidence.
          </p>
          <p className="mt-3 text-sm font-medium text-aqliya-cyan/90">
            Diagnostic → operational evaluation → evidence-based decision
          </p>
        </div>
      </section>

      <section className="border-t bg-muted/10 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {buyerJourneysEn.map((journey) => (
              <div
                key={journey.id}
                id={journey.id}
                className="rounded-2xl border border-border/60 bg-background p-6 sm:p-8"
              >
                <h2 className="text-lg font-black">{journey.label}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {journey.subtitle}
                </p>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {journey.hook}
                </p>
                <ol className="mt-6 space-y-3">
                  {journey.steps.map((step, i) => (
                    <li key={step.href} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <div>
                        <Link
                          href={step.href}
                          className="text-sm font-semibold hover:text-primary"
                        >
                          {step.label}
                        </Link>
                        <span className="ml-2 text-xs text-muted-foreground">
                          · {step.time}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={journey.primaryCta.href}
                    className="btn-primary h-10 px-5 text-sm"
                  >
                    {journey.primaryCta.label}
                  </Link>
                  {journey.secondaryCta && (
                    <Link
                      href={journey.secondaryCta.href}
                      className="btn-outline h-10 px-5 text-sm"
                    >
                      {journey.secondaryCta.label}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-2xl font-black">Unified engagement path</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {universalJourneyStepsEn.map((step, i) => (
              <Link
                key={step.label}
                href={step.href}
                className="rounded-xl border border-border/60 px-4 py-3 text-center hover:border-primary/30"
              >
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                  {i + 1}
                </p>
                <p className="mt-1 text-sm font-bold">{step.label}</p>
                <p className="text-[10px] text-muted-foreground">{step.time}</p>
              </Link>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <ScheduleDiagnosticCta locale="en" />
            <Link href="/en/proof" className="btn-outline h-11 px-6">
              Proof center
            </Link>
            <Link href="/en/use-cases" className="btn-outline h-11 px-6">
              Use cases
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
