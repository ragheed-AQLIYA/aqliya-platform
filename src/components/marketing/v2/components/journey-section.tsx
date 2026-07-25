"use client";

import Link from "next/link";
import type { BuyerJourney } from "@/lib/marketing/buyer-journeys";

type JourneySectionProps = {
  journeys: BuyerJourney[];
  title: string;
  hint: string;
};

export function JourneySection({ journeys, title, hint }: JourneySectionProps) {
  return (
    <section className="border-t bg-muted/10 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-black sm:text-3xl">{title}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{hint}</p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {journeys.map((journey) => (
            <div
              key={journey.id}
              id={journey.id}
              className="scroll-mt-28 rounded-2xl border border-border/60 bg-background p-6 sm:p-8"
            >
              <h3 className="text-lg font-black">{journey.label}</h3>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                {journey.subtitle}
              </p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{journey.hook}</p>
              <ol className="mt-6 space-y-3">
                {journey.steps.map((step, i) => (
                  <li key={step.href} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={step.href}
                        className="text-sm font-semibold hover:text-primary"
                      >
                        {step.label}
                      </Link>
                      <span className="mr-2 text-xs text-muted-foreground">· {step.time}</span>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={journey.primaryCta.href} className="btn-primary h-10 px-5 text-sm">
                  {journey.primaryCta.label}
                </Link>
                {journey.secondaryCta && (
                  <Link href={journey.secondaryCta.href} className="btn-outline h-10 px-5 text-sm">
                    {journey.secondaryCta.label}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
