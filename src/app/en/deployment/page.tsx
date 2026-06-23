import Link from "next/link";
import type { Metadata } from "next";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";

export const metadata: Metadata = {
  title: "Deployment Options | AQLIYA",
  description:
    "Honest deployment options: managed cloud (available now), private cloud (planned), air-gapped (strategic). Saudi data residency by default.",
};

const deploymentModels = [
  {
    id: "cloud",
    name: "Managed cloud",
    status: "Available now",
    statusColor: "text-emerald-500",
    dotColor: "bg-emerald-400 animate-pulse",
    description:
      "Production-ready for most institutions. AQLIYA operates infrastructure, updates, and continuity — your organization controls data and permissions.",
    features: [
      { label: "Data residency", value: "Saudi / GCC region by default" },
      { label: "Isolation", value: "Full tenant isolation at DB and app layer" },
      { label: "Target availability", value: "99.5% monthly" },
      { label: "Updates", value: "Managed with advance notice" },
      { label: "Backups", value: "Daily encrypted backups" },
    ],
    bestFor: [
      "Organizations that want to start quickly",
      "Limited internal platform teams",
      "Phased rollout programs",
    ],
    note: null as string | null,
  },
  {
    id: "private",
    name: "Private cloud",
    status: "Planned",
    statusColor: "text-amber-500",
    dotColor: "bg-amber-400/70",
    description:
      "Full platform deployment inside your cloud account. Maximum control over network, data, and update cadence — with direct engineering support from AQLIYA.",
    features: [
      { label: "Infrastructure", value: "AWS / Azure / GCP in your account" },
      { label: "Data residency", value: "Entirely inside your environment" },
      { label: "Network", value: "Your VPC policies" },
      { label: "Updates", value: "Your approval and test cycle" },
    ],
    bestFor: [
      "Strict data residency requirements",
      "Financial, government, and energy sectors",
      "Advanced internal security teams",
    ],
    note: "Requires joint engineering assessment and feasibility study before commitment.",
  },
  {
    id: "airgapped",
    name: "Air-gapped",
    status: "Strategic",
    statusColor: "text-muted-foreground",
    dotColor: "bg-muted-foreground/50",
    description:
      "Fully offline environment for the most sensitive contexts. Not a ready-to-activate product package today.",
    features: [
      { label: "Connectivity", value: "No internet — network isolated" },
      { label: "Models", value: "Local inference without cloud dependency" },
      { label: "Updates", value: "Via secure physical media" },
      { label: "Current availability", value: "Not available as turnkey activation" },
    ],
    bestFor: [
      "Highest-sensitivity government contexts",
      "Environments that prohibit external connectivity",
      "Long-horizon strategic programs",
    ],
    note: "We do not claim readiness for what is not ready. Air-gapped is a joint design program, not a standard SKU.",
  },
];

const dataResidency = [
  {
    title: "Saudi Arabia as default",
    body: "Data is stored in a Saudi or GCC cloud region by default — no special request required.",
  },
  {
    title: "No cross-region transfer without consent",
    body: "Any data movement outside the agreed geography requires explicit written approval.",
  },
  {
    title: "Local regulatory alignment",
    body: "We follow Saudi and GCC data protection requirements relevant to institutional workloads.",
  },
  {
    title: "Transparent cloud providers",
    body: "Infrastructure providers are disclosed clearly — no hidden sub-processor chains.",
  },
];

export default function EnglishDeploymentPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-black text-white sm:text-5xl">
            Deployment — honest and clear
          </h1>
          <p className="mt-6 text-lg text-white/60">
            Three deployment models at different readiness levels. What is live
            today, what is planned, and what is strategic — stated explicitly.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {deploymentModels.map((model) => (
            <article
              key={model.id}
              className="rounded-2xl border border-border/60 p-6"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-black text-foreground">
                  {model.name}
                </h2>
                <span
                  className={`flex items-center gap-1.5 text-xs font-semibold ${model.statusColor}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${model.dotColor}`} />
                  {model.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {model.description}
              </p>
              <dl className="mt-4 space-y-2">
                {model.features.map((f) => (
                  <div
                    key={f.label}
                    className="flex justify-between gap-3 text-xs"
                  >
                    <dt className="text-muted-foreground">{f.label}</dt>
                    <dd className="text-right font-medium text-foreground">
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>
              {model.note && (
                <p className="mt-4 rounded-lg bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
                  {model.note}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl border-t px-6 py-16">
        <h2 className="text-2xl font-black text-foreground">Data residency</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {dataResidency.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-border/60 p-5"
            >
              <h3 className="font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          <Link href="/print/data-residency" className="text-primary underline">
            Data residency PDF
          </Link>
          {" · "}
          <Link href="/en/security" className="text-primary underline">
            Security summary
          </Link>
        </p>
        <div className="mt-8 text-center">
          <ScheduleDiagnosticCta locale="en" />
        </div>
      </section>
    </div>
  );
}
