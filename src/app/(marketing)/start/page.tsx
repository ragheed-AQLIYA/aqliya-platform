import type { Metadata } from "next";
import { buildAlternates } from "@/lib/marketing/seo";
import { StartHubPage } from "@/components/marketing/v2/start-hub-page";
import { buyerJourneys, universalJourneySteps } from "@/lib/marketing/buyer-journeys";
import { startCopyAr } from "@/lib/marketing/copy-plain";
import {
  engagementModelsAr,
  engagementPricingAr,
  processPhasesAr,
  processPrinciplesAr,
} from "@/lib/marketing/start-hub-content";

export function generateMetadata(): Metadata {
  const title = startCopyAr.metadata.title;
  const description = startCopyAr.metadata.description;
  return {
    title,
    description,
    alternates: buildAlternates("/start"),
  };
}

export default function StartPage() {
  const c = startCopyAr;

  return (
    <StartHubPage
      locale="ar"
      journeys={buyerJourneys}
      universalSteps={universalJourneySteps}
      engagementModels={engagementModelsAr}
      engagementPricing={engagementPricingAr}
      processPhases={processPhasesAr}
      processPrinciples={processPrinciplesAr}
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
        contactHref: "/contact",
      }}
    />
  );
}
