import Link from "next/link";
import type { Metadata } from "next";
import { SectionEyebrow } from "@/components/enterprise";
import { OperatingSystemMapVisual } from "@/components/visuals";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";
import {
  publicOsStatusEn,
  publicEngagementGateEn,
} from "@/lib/marketing/public-status";

export const metadata: Metadata = {
  title: "Platform | AQLIYA Intelligence Core",
  description:
    "Shared governance core for institutional operating systems — intelligence coordination, workflow, evidence, RBAC, and audit trail in one foundation.",
};

const deploymentModels = [
  {
    id: "cloud",
    title: "AQLIYA Cloud",
    status: "available",
    statusLabel: "Available now",
    description:
      "Fully managed cloud deployment with continuous operational updates. For institutions that do not need to run infrastructure internally.",
    points: [
      "Deploy without standing up infrastructure",
      "Automatic updates and improvements",
      "Strict tenant isolation",
      "Managed backup and high availability",
    ],
  },
  {
    id: "private",
    title: "AQLIYA Private",
    status: "planned",
    statusLabel: "Private deployment",
    description:
      "Deploy inside your infrastructure with local data control — for institutions with sovereignty and security requirements.",
    points: [
      "Data stays inside your environment",
      "Full control over databases and storage",
      "Builds on the cloud model",
      "Available to selected clients during rollout",
    ],
  },
  {
    id: "airgapped",
    title: "AQLIYA Air-Gapped",
    status: "strategic",
    statusLabel: "Strategic",
    description:
      "Fully isolated deployment with no internet connectivity and local processing — for maximum-security environments.",
    points: [
      "Processing entirely inside the internal network",
      "No connection to external services",
      "Builds on the private deployment model",
      "Expected for government and security-sensitive institutions",
    ],
  },
];

const operatingSystems = [
  {
    useCase: "Audit engagement management",
    system: "AuditOS",
    description:
      "From client acceptance to report — a complete governed audit path.",
    statusLabel: publicOsStatusEn.auditOS.label,
    capabilityNote: publicOsStatusEn.auditOS.capabilityNote,
    href: "/en/products/audit",
  },
  {
    useCase: "Institutional decision documentation",
    system: "DecisionOS",
    description:
      "Alternatives, risks, evidence, recommendation, and approval — one path.",
    statusLabel: publicOsStatusEn.decisionOS.label,
    capabilityNote: publicOsStatusEn.decisionOS.capabilityNote,
    href: "/products/decision",
  },
  {
    useCase: "Local content programs",
    system: "LocalContentOS",
    description:
      "Suppliers, spend, contracts, compliance, and reports — for the Saudi market.",
    statusLabel: publicOsStatusEn.localContentOS.label,
    capabilityNote: publicOsStatusEn.localContentOS.capabilityNote,
    href: "/products/local-content",
  },
];

const platformComponents = [
  {
    title: "AQLIYA Intelligence Core",
    body: "Shared AI coordination layer across all operating systems. Every call is bounded by permission and context; every output passes human review before use. No call without traceability, no output without audit.",
    boundary: "AI suggests and assists — it does not decide or approve",
  },
  {
    title: "Workflow Engine",
    body: "Manages work states from draft to final approval. Supports parallelism, conditional transitions, and approval gates. Mandatory stages cannot be skipped; every transition is logged.",
    boundary: "No bypass of mandatory approval gates",
  },
  {
    title: "Governance Layer",
    body: "Applies governance rules to every process: who has authority, which approval gates apply, and how exceptions are managed. Multi-layer permissions at organization, project, and action level.",
    boundary: "Least privilege in every context",
  },
  {
    title: "Integration Layer",
    body: "Connects the platform to ERP, HR systems, internal databases, and storage. Every integration uses unified adapters with logging for every request, response, and data transfer.",
    boundary: "Every integration is logged and monitored",
  },
  {
    title: "Evidence Graph",
    body: "Builds and maintains linked evidence chains: every output — report, decision, note — traces back to original sources: files, records, data, or comments. No output without a complete evidence chain.",
    boundary: "No output without a complete evidence chain",
  },
  {
    title: "Audit Trail",
    body: "Every event, change, and decision is recorded in an immutable log: identity, time, context, and before/after values. Full accountability and traceability for reviewers.",
    boundary: "Non-deletable — including by administrators",
  },
];

export default function EnglishPlatformPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="relative mx-auto max-w-5xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              AQLIYA Intelligence Core
            </span>
            <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              The shared foundation behind every AQLIYA operating system
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/62 sm:text-lg">
              AQLIYA Intelligence Core is not just technical infrastructure. It is
              a governed foundation so every operating system inherits bounded
              intelligence, workflow, permissions, evidence, and audit trail —
              without rebuilding from scratch.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <ScheduleDiagnosticCta locale="en" />
              <Link
                href="/en/security"
                className="btn-secondary h-12 px-8 text-base"
              >
                Governance &amp; security
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-gradient-light border-t">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <SectionEyebrow
            label="Architecture map"
            title="From foundation to operating systems"
            description="AQLIYA Intelligence Core sits between infrastructure and institutional operating systems — every system reuses the same shared components."
          />
          <div className="mt-12">
            <div className="gradient-border rounded-[24px] bg-white/[0.01] p-4 shadow-sm">
              <OperatingSystemMapVisual className="w-full rounded-[18px]" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <SectionEyebrow
          label="Core components"
          title="Six components — each with a defined role"
          description="Every platform component has clear boundaries that prevent misuse of permissions and AI, and ensure every action is reviewable and accountable."
        />
        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {platformComponents.map((comp, i) => (
            <div
              key={comp.title}
              className="rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/10 p-6 transition-all hover:border-primary/20 hover:shadow-sm"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-black text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <h3 className="mb-2 text-sm font-black text-foreground">
                    {comp.title}
                  </h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {comp.body}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-primary/15 bg-primary/[0.04] px-3 py-1.5">
                    <span className="h-1 w-1 rounded-full bg-primary/60" />
                    <span className="text-[11px] font-semibold text-primary/80">
                      {comp.boundary}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="capabilities"
        className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20 scroll-mt-20"
      >
        <SectionEyebrow
          label="Operating systems"
          title="The platform is applied through operational paths — not separate products"
          description="Every operating system inherits governance, evidence, workflow, and permissions from the same core."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {operatingSystems.map((sys) => (
            <Link
              key={sys.system}
              href={sys.href}
              className="group rounded-2xl border border-border/70 bg-gradient-to-br from-background to-muted/15 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="text-base font-black text-foreground group-hover:text-primary">
                  {sys.useCase}
                </h3>
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-[9px] font-bold text-primary">
                  {sys.statusLabel}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{sys.description}</p>
              <p className="mt-2 text-[10px] text-muted-foreground/70">
                {sys.capabilityNote}
              </p>
              <p className="mt-3 text-[10px] font-medium text-muted-foreground/60">
                Operating system: {sys.system}
              </p>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Office AI Assistant is a shared capability across the platform — a
          governed institutional assistant within permissions and evidence.{" "}
          <Link
            href="/products/office-ai"
            className="text-primary underline underline-offset-4"
          >
            Details
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-muted-foreground/70">
          SalesOS and SimulationOS are on the platform roadmap —{" "}
          <Link
            href="/products#roadmap"
            className="text-primary underline underline-offset-4"
          >
            explore upcoming lines
          </Link>
          .
        </p>
      </section>

      <section className="section-gradient-light border-t">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <SectionEyebrow
            label="Deployment models"
            title="Deployment defines who controls data and infrastructure"
            description="Every deployment model keeps the same platform components — the difference is where it runs and how much data sovereignty you retain."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {deploymentModels.map((model) => (
              <div
                key={model.id}
                className={`rounded-2xl border p-6 ${
                  model.status === "available"
                    ? "border-status-success/25 bg-gradient-to-br from-status-success/[0.05] to-background"
                    : model.status === "planned"
                      ? "border-amber-500/20 bg-gradient-to-br from-amber-500/[0.04] to-background"
                      : "border-border/40 bg-muted/10"
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-black text-foreground">
                    {model.title}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                      model.status === "available"
                        ? "bg-status-success/15 text-status-success"
                        : model.status === "planned"
                          ? "bg-amber-500/15 text-amber-600"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {model.statusLabel}
                  </span>
                </div>
                <p className="mb-4 text-xs leading-6 text-muted-foreground">
                  {model.description}
                </p>
                <ul className="space-y-2">
                  {model.points.map((point, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl rounded-[24px] border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              Start with AQLIYA
            </p>
            <h2 className="text-2xl font-black text-white sm:text-3xl">
              Ready to build your institutional systems on AQLIYA?
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/55">
              {publicEngagementGateEn}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-4">
              <ScheduleDiagnosticCta locale="en" />
              <Link href="/en/proof" className="btn-secondary h-11 px-8">
                Proof center
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
