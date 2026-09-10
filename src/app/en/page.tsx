import type { Metadata } from "next";
import { ConversionBand } from "@/components/marketing/v2/marketing-shell";
import {
  HomeHeroSection,
  ProblemSection,
  ComparisonSection,
  PlatformLayersSection,
  SystemCardGrid,
  ProofSection,
  TrustSection,
} from "@/components/marketing/home-sections";
import { homeCopyEn } from "@/lib/marketing/copy-plain-en";
import { publicOsStatusEn } from "@/lib/marketing/public-status";
import { PlatformArchitecture } from "@/components/marketing/platform-architecture";
import { buildAlternates } from "@/lib/marketing/seo";

const heroArchitectureEn = {
  topLabel: "The institution",
  topDesc: "Documents, systems, regulations, and expertise  fragmented today",
  layers: [
    { num: "04", title: "Operating systems", desc: "Audit, local content, decisions  inherit governance and intelligence" },
    { num: "03", title: "Intelligence operators", desc: "AI suggests and analyzes  inside evidence and permissions" },
    { num: "02", title: "Knowledge foundation", desc: "Every output linked to its source  a coherent evidence chain" },
    { num: "01", title: "Governance", desc: "Permissions, review, approval, and audit trail" },
  ],
  bottomLabel: "Institutional outcome",
  bottomDesc: "Decisions and outputs defensible under every review",
};

const heroTrustSignalsEn = [
  { label: "Source-linked evidence" },
  { label: "Human review & approval" },
  { label: "Full audit trail" },
];

export const metadata: Metadata = {
  title: homeCopyEn.metadata.title,
  description: homeCopyEn.metadata.description,
  alternates: buildAlternates("/en"),
};

const systems = [
  { title: "AuditOS", note: publicOsStatusEn.auditOS.capabilityNote, status: publicOsStatusEn.auditOS.label, href: "/en/products/audit" },
  { title: "LocalContentOS", note: publicOsStatusEn.localContentOS.capabilityNote, status: publicOsStatusEn.localContentOS.label, href: "/en/products/local-content" },
  { title: "DecisionOS", note: "Documented decisions: context, alternatives, and approvals", status: publicOsStatusEn.decisionOS.label, href: "/en/products/decision" },
  { title: "SalesOS", note: publicOsStatusEn.salesOS.capabilityNote, status: publicOsStatusEn.salesOS.label, href: "/en/products/sales" },
];

const platformLayers = [
  { num: "01", title: "Governance", desc: "Permissions, audit trail, approval gates  every event is logged" },
  { num: "02", title: "Knowledge Foundation", desc: "Every output linked to its source  unbreakable evidence chain" },
  { num: "03", title: "Intelligence Operators", desc: "AI assists and suggests  never decides or approves without humans" },
  { num: "04", title: "Operating Systems", desc: "Each system inherits governance and intelligence  no rebuild" },
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
        personaLabel="For whom?"
        trustSignals={heroTrustSignalsEn}
        visual={
          <PlatformArchitecture
            topLabel={heroArchitectureEn.topLabel}
            topDesc={heroArchitectureEn.topDesc}
            layers={heroArchitectureEn.layers}
            bottomLabel={heroArchitectureEn.bottomLabel}
            bottomDesc={heroArchitectureEn.bottomDesc}
          />
        }
      />

      <ProblemSection
        data={{ ...c.problem, pathHref: "/en/use-cases" }}
        arrow="→"
      />

      <ComparisonSection
        eyebrow="Why platform not tool?"
        heading="A tool solves one problem  a platform runs the institution"
        sides={[
          {
            title: "Standalone AI tool",
            color: "red",
            items: [
              "Outputs without review or approval path",
              "Each new domain needs a new tool from scratch",
              "Permissions and evidence managed outside  or not at all",
            ],
          },
          {
            title: "AQLIYA Platform",
            color: "emerald",
            items: [
              "Every output passes through governance and evidence before approval",
              "Every system inherits governance and intelligence from one platform",
              "Permissions and evidence are part of the platform architecture  no separate management",
            ],
          },
        ]}
      />

      <PlatformLayersSection
        heading="Platform architecture  four stacked layers"
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

      <TrustSection
        eyebrow="Trust by architecture, not promise"
        heading="Why governed institutions trust AQLIYA"
        subtitle="Privacy, permissions, evidence, and traceability are core design principles  not afterthoughts."
        pillars={[
          { title: "Private, governed AI", desc: "AI runs inside your institution's environment and permissions  never a black box." },
          { title: "Permissions & tenant isolation", desc: "Each user sees only what belongs to them  full isolation between entities." },
          { title: "Traceable evidence", desc: "Every output links to its source and stands up to review." },
          { title: "Full audit trail", desc: "Every event logged with identity and timestamp  reviewable later." },
        ]}
        principleLabel="Institutional principle"
        principle="AI assists. Humans decide. Evidence governs."
      />

      <ProofSection
        data={{ ...c.proof, ctaHref: "/en/proof" }}
      />

      <ConversionBand
        title={c.conversion.title}
        body={c.conversion.body}
        primaryHref="/en/contact"
        primaryLabel={c.conversion.primaryLabel}
        secondaryHref="/en/proof"
        secondaryLabel={c.conversion.secondaryLabel}
      />
    </div>
  );
}
