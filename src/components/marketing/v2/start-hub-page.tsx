import Link from "next/link";
import type { BuyerJourney, BuyerJourneyStep } from "@/lib/marketing/buyer-journeys";
import type { EngagementModelCard, ProcessPhase, EngagementPricingBand } from "@/lib/marketing/start-hub-content";
import { publicEngagementGate, publicEngagementGateEn } from "@/lib/marketing/public-status";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";
import { ConversionBand, MarketingPageShell } from "@/components/marketing/v2/marketing-shell";
import { cn } from "@/lib/utils";

type StartHubCopy = {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  chooseRole: string;
  chooseRoleHint: string;
  engagementTitle: string;
  engagementHint: string;
  pricingTitle: string;
  pricingHint: string;
  processTitle: string;
  processHint: string;
  proof: string;
  useCases: string;
  contactHref: string;
};

type StartHubPageProps = {
  locale?: "ar" | "en";
  journeys: BuyerJourney[];
  universalSteps: BuyerJourneyStep[];
  engagementModels: EngagementModelCard[];
  engagementPricing: EngagementPricingBand[];
  processPhases: ProcessPhase[];
  processPrinciples: string[];
  copy: StartHubCopy;
};

export function StartHubPage({
  locale = "ar",
  journeys,
  universalSteps,
  engagementModels,
  engagementPricing,
  processPhases,
  processPrinciples,
  copy,
}: StartHubPageProps) {
  const gate = locale === "en" ? publicEngagementGateEn : publicEngagementGate;
  const proofHref = locale === "en" ? "/en/proof" : "/proof";
  const useCasesHref = locale === "en" ? "/en/use-cases" : "/use-cases";

  return (
    <div className="flex flex-col">
      <MarketingPageShell
        eyebrow={copy.heroEyebrow}
        title={copy.heroTitle}
        subtitle={
          <>
            {copy.heroSubtitle}
            <span className="mt-3 block text-sm font-medium text-aqliya-cyan/90">{gate}</span>
          </>
        }
        actions={
          <ScheduleDiagnosticCta locale={locale} />
        }
      />

      <section className="border-t bg-muted/10 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-black sm:text-3xl">{copy.chooseRole}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{copy.chooseRoleHint}</p>
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

      <section id="engagement" className="scroll-mt-28 border-t py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-2xl font-black sm:text-3xl">{copy.engagementTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{copy.engagementHint}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {engagementModels.map((model) => (
              <div
                key={model.id}
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
              </div>
            ))}
          </div>
          <h3 className="mt-10 text-lg font-black">{copy.pricingTitle}</h3>
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
                {engagementPricing.map((row) => (
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
          <p className="mt-3 text-[11px] text-muted-foreground">
            {copy.pricingHint}
          </p>
          <Link
            href={copy.contactHref}
            className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
          >
            {locale === "ar" ? "احجز جلسة تشخيص ←" : "Book diagnostic session →"}
          </Link>
        </div>
      </section>

      <section id="process" className="scroll-mt-28 border-t bg-muted/10 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-2xl font-black sm:text-3xl">{copy.processTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{copy.processHint}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {processPhases.map((phase) => (
              <div key={phase.num} className="rounded-xl border border-border/60 bg-background p-5">
                <span className="text-xs font-black text-primary">{phase.num}</span>
                <h3 className="mt-2 font-bold">{phase.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{phase.desc}</p>
              </div>
            ))}
          </div>
          <ul className="mt-8 flex flex-wrap gap-2">
            {processPrinciples.map((p) => (
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

      <section className="border-t py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-4 px-6">
          <Link href={proofHref} className="btn-outline h-11 px-6">
            {copy.proof}
          </Link>
          <Link href={useCasesHref} className="btn-outline h-11 px-6">
            {copy.useCases}
          </Link>
        </div>
      </section>

      <ConversionBand
        title={locale === "en" ? "Start with a diagnostic session — free" : undefined}
        body={locale === "en" ? "We map your context and recommend the next step." : undefined}
        primaryHref={copy.contactHref}
        primaryLabel={locale === "en" ? "Book diagnostic session" : undefined}
        secondaryHref={proofHref}
        secondaryLabel={copy.proof}
      />
    </div>
  );
}
