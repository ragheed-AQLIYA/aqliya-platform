"use client";

import Link from "next/link";
import type { BuyerJourneyStep } from "@/lib/marketing/buyer-journeys";
import type { ProcessPhase } from "@/lib/marketing/start-hub-content";

type ProcessSectionProps = {
  phases: ProcessPhase[];
  principles: string[];
  universalSteps: BuyerJourneyStep[];
  title: string;
  hint: string;
};

export function ProcessSection({ phases, principles, universalSteps, title, hint }: ProcessSectionProps) {
  return (
    <section id="process" className="scroll-mt-28 border-t bg-muted/10 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-2xl font-black sm:text-3xl">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {phases.map((phase) => (
            <div key={phase.num} className="rounded-xl border border-border/60 bg-background p-5">
              <span className="text-xs font-black text-primary">{phase.num}</span>
              <h3 className="mt-2 font-bold">{phase.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{phase.desc}</p>
            </div>
          ))}
        </div>
        <ul className="mt-8 flex flex-wrap gap-2">
          {principles.map((p) => (
            <li
              key={p}
              className="rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted-foreground"
            >
              {p}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          {universalSteps.map((step, i) => (
            <Link
              key={step.label}
              href={step.href}
              className="rounded-lg border border-border/60 bg-background px-3 py-2 text-xs hover:border-primary/30"
            >
              <span className="text-muted-foreground">{i + 1}. </span>
              {step.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
