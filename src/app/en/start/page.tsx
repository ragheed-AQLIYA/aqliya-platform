import type { Metadata } from "next";
import { StartHubPage } from "@/components/marketing/v2/start-hub-page";
import {
  buyerJourneysEn,
  universalJourneyStepsEn,
} from "@/lib/marketing/buyer-journeys-en";
import { startCopyEn } from "@/lib/marketing/copy-plain-en";
import {
  engagementModelsEn,
  engagementPricingEn,
  processPhasesEn,
  processPrinciplesEn,
} from "@/lib/marketing/start-hub-content-en";

export const metadata: Metadata = {
  title: startCopyEn.metadata.title,
  description: startCopyEn.metadata.description,
};

export default function EnglishStartPage() {
  const c = startCopyEn;

  return (
    <StartHubPage
      locale="en"
      journeys={buyerJourneysEn}
      universalSteps={universalJourneyStepsEn}
      engagementModels={engagementModelsEn}
      engagementPricing={engagementPricingEn}
      processPhases={processPhasesEn}
      processPrinciples={processPrinciplesEn}
      copy={{
        heroEyebrow: c.hero.eyebrow,
        heroTitle: c.hero.title,
        heroSubtitle: c.hero.subtitle,
        chooseRole: c.chooseRole,
        chooseRoleHint: c.chooseRoleHint,
        engagementTitle: c.engagementTitle,
        engagementHint: c.engagementHint,
        pricingTitle: c.pricingTitle,
        pricingHint: c.pricingHint,
        processTitle: c.processTitle,
        processHint: c.processHint,
        proof: c.proof,
        useCases: c.useCases,
        contactHref: "/en/contact",
      }}
    />
  );
}
