"use client";

import type { BuyerJourney, BuyerJourneyStep } from "@/lib/marketing/buyer-journeys";
import type { EngagementModelCard, ProcessPhase, EngagementPricingBand } from "@/lib/marketing/start-hub-content";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";
import { MarketingPageShell } from "@/components/marketing/v2/marketing-shell";
import { useStartHub } from "@/components/marketing/v2/hooks/use-start-hub";
import { JourneySection } from "@/components/marketing/v2/components/journey-section";
import { EngagementSection } from "@/components/marketing/v2/components/engagement-section";
import { ProcessSection } from "@/components/marketing/v2/components/process-section";
import { BottomCtaSection } from "@/components/marketing/v2/components/bottom-cta-section";

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
  const { gate, proofHref, useCasesHref } = useStartHub(locale);

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
        actions={<ScheduleDiagnosticCta locale={locale} />}
      />

      <JourneySection
        journeys={journeys}
        title={copy.chooseRole}
        hint={copy.chooseRoleHint}
      />

      <EngagementSection
        locale={locale}
        models={engagementModels}
        pricing={engagementPricing}
        title={copy.engagementTitle}
        hint={copy.engagementHint}
        pricingTitle={copy.pricingTitle}
        pricingHint={copy.pricingHint}
        contactHref={copy.contactHref}
      />

      <ProcessSection
        phases={processPhases}
        principles={processPrinciples}
        universalSteps={universalSteps}
        title={copy.processTitle}
        hint={copy.processHint}
      />

      <BottomCtaSection
        proofHref={proofHref}
        useCasesHref={useCasesHref}
        contactHref={copy.contactHref}
        proofLabel={copy.proof}
        useCasesLabel={copy.useCases}
        locale={locale}
      />
    </div>
  );
}
