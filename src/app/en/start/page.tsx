import type { Metadata } from "next";
import { StartHubPage } from "@/components/marketing/v2/start-hub-page";
import {
  buyerJourneysEn,
  universalJourneyStepsEn,
} from "@/lib/marketing/buyer-journeys-en";
import {
  engagementModelsEn,
  engagementPricingEn,
  processPhasesEn,
  processPrinciplesEn,
} from "@/lib/marketing/start-hub-content-en";

export const metadata: Metadata = {
  title: "Get Started | AQLIYA",
  description:
    "Choose your role — executive, finance, technology, audit, procurement, or government — and get a clear path to proof and contact.",
};

export default function EnglishStartPage() {
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
        heroEyebrow: "Buyer journey",
        heroTitle: "Where do you start with AQLIYA?",
        heroSubtitle:
          "We don't ask for faith in slides. Pick your role — we route you to the right proof in minutes.",
        chooseRole: "Choose your role",
        chooseRoleHint: "Each path: 3 content steps → then a diagnostic session when ready.",
        engagementTitle: "Engagement models",
        engagementHint: "From free diagnostic to institutional activation — no wide contract before proof.",
        pricingTitle: "Approximate investment range",
        pricingHint: "Not a binding quote — for procurement planning only. Operational evaluation is free when scope is agreed.",
        processTitle: "How we work",
        processHint: "Same methodology for every role — diagnostic through expansion.",
        proof: "Proof center",
        useCases: "Use cases",
        contactHref: "/en/contact",
      }}
    />
  );
}
