"use client";

import Link from "next/link";
import { Reveal } from "@/components/marketing/reveal";
import type { EngagementModelCard, EngagementPricingBand } from "@/lib/marketing/start-hub-content";
import { cn } from "@/lib/utils";

type EngagementSectionProps = {
  locale: "ar" | "en";
  models: EngagementModelCard[];
  pricing: EngagementPricingBand[];
  title: string;
  hint: string;
  pricingTitle: string;
  pricingHint: string;
  contactHref: string;
};

export function EngagementSection({
  locale,
  models,
  pricing,
  title,
  hint,
  pricingTitle,
  pricingHint,
  contactHref,
}: EngagementSectionProps) {
  return (
    <section id="engagement" className="scroll-mt-28 border-t py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-2xl font-black sm:text-3xl">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((model, i) => (
            <Reveal
              key={model.id}
              delay={i * 70}
              className={cn(
                "rounded-xl border p-5",
                model.featured
                  ? "border-primary/30 bg-primary/[0.04]"
                  : "border-border/60 bg-background",
              )}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-bold">{model.name}</h3>
                <span className="text-xs font-semibold text-emerald-700">{model.cost}</span>
              </div>
              <p className="mt-1 text-xs text-primary">{model.tagline}</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{model.description}</p>
              <p className="mt-2 text-[10px] text-muted-foreground">{model.duration}</p>
            </Reveal>
          ))}
        </div>
        <h3 className="mt-10 text-lg font-black">{pricingTitle}</h3>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-start">
                <th className="px-4 py-3 font-semibold">
                  {locale === "en" ? "Model" : "النموذج"}
                </th>
                <th className="px-4 py-3 font-semibold">
                  {locale === "en" ? "From" : "من"}
                </th>
                <th className="px-4 py-3 font-semibold">
                  {locale === "en" ? "To" : "إلى"}
                </th>
                <th className="px-4 py-3 font-semibold">
                  {locale === "en" ? "Note" : "ملاحظة"}
                </th>
              </tr>
            </thead>
            <tbody>
              {pricing.map((row) => (
                <tr key={row.model} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 font-medium">{row.model}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.from}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.to}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">{pricingHint}</p>
        <Link
          href={contactHref}
          className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
        >
          {locale === "ar" ? "احجز جلسة تشخيص ←" : "Book a Diagnostic Session →"}
        </Link>
      </div>
    </section>
  );
}
