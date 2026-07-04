import type { Metadata } from "next";
import { ConversionBand } from "@/components/marketing/v2/marketing-shell";
import {
  HomeHeroSection,
  ProblemSection,
  ComparisonSection,
  PlatformLayersSection,
  SystemCardGrid,
  ProofSection,
} from "@/components/marketing/home-sections";
import { homeCopyEn } from "@/lib/marketing/copy-plain-en";
import { publicOsStatusEn } from "@/lib/marketing/public-status";

export const metadata: Metadata = {
  title: homeCopyEn.metadata.title,
  description: homeCopyEn.metadata.description,
};

const systems = [
  { title: "AuditOS", note: publicOsStatusEn.auditOS.capabilityNote, status: publicOsStatusEn.auditOS.label, href: "/en/products/audit" },
  { title: "LocalContentOS", note: publicOsStatusEn.localContentOS.capabilityNote, status: publicOsStatusEn.localContentOS.label, href: "/en/products/local-content" },
  { title: "DecisionOS", note: "Documented decisions: context, alternatives, and approvals", status: publicOsStatusEn.decisionOS.label, href: "/en/products/decision" },
  { title: "SalesOS", note: publicOsStatusEn.salesOS.capabilityNote, status: publicOsStatusEn.salesOS.label, href: "/en/products/sales" },
];

const platformLayers = [
  { num: "01", title: "Governance", desc: "Permissions, audit trail, approval gates — every event is logged" },
  { num: "02", title: "Knowledge Foundation", desc: "Every output linked to its source — unbreakable evidence chain" },
  { num: "03", title: "Intelligence Operators", desc: "AI assists and suggests — never decides or approves without humans" },
  { num: "04", title: "Operating Systems", desc: "Each system inherits governance and intelligence — no rebuild" },
];

export default function EnglishHomePage() {
  const c = homeCopyEn;

  return (
    <div className="flex flex-col">
      <HomeHeroSection
        eyebrow={c.hero.eyebrow}
        title={c.hero.title}
        subtitle={c.hero.subtitle}
        primaryCta={{ label: c.ctas.contact, href: "/en/contact" }}
        secondaryCta={{ label: c.ctas.demo, href: "/en/platform" }}
        personaChips={c.personaChips.map((p) => ({ ...p }))}
      />

      <ProblemSection
        data={{ ...c.problem, pathHref: "/en/use-cases" }}
        arrow="→"
      />

      <ComparisonSection
        eyebrow="Why platform not tool?"
        heading="A tool solves one problem — a platform runs the institution"
        sides={[
          {
            title: "Standalone AI tool",
            color: "red",
            items: [
              "Outputs without review or approval path",
              "Each new domain needs a new tool from scratch",
              "Permissions and evidence managed outside — or not at all",
            ],
          },
          {
            title: "AQLIYA Platform",
            color: "emerald",
            items: [
              "Every output passes through governance and evidence before approval",
              "Every system inherits governance and intelligence from one platform",
              "Permissions and evidence are part of the platform architecture — no separate management",
            ],
          },
        ]}
      />

      <PlatformLayersSection
        heading="Platform architecture — four stacked layers"
        subtitle="Each layer serves the one above. Every operating system inherits the three layers beneath without duplication."
        layers={platformLayers}
        ctaLabel="Explore the platform architecture →"
        ctaHref="/en/platform"
      />

      <SystemCardGrid
        heading={c.systems.title}
        subtitle={c.systems.subtitle}
        systems={systems}
        ctaAll={c.systems.ctaAll}
        ctaHref="/en/products"
      />

      <ProofSection
        data={{ ...c.proof, ctaHref: "/en/proof" }}
      />

      <ConversionBand
        title={c.conversion.title}
        body={c.conversion.body}
        primaryLabel={c.conversion.primaryLabel}
        secondaryLabel={c.conversion.secondaryLabel}
      />
    </div>
  );
}
