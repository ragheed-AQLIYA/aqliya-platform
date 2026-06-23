import Link from "next/link";
import type { Metadata } from "next";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";

export const metadata: Metadata = {
  title: "Industries | AQLIYA",
  description:
    "Built for audit firms, government entities, enterprises, and professional services. Each sector activates governed operating paths on one institutional platform.",
};

const sectors = [
  {
    id: "audit-firms",
    title: "Audit firms",
    challenge:
      "Concurrent engagements, scattered evidence, notes across channels, and knowledge lost when teams change.",
    outcomes: [
      "Unified audit path from acceptance to report",
      "Every figure linked to source; every approval documented",
      "Engagement pack defensible to external reviewers",
    ],
    systems: ["AuditOS", "Office AI Assistant"],
    platformValue:
      "Audit methodology embedded in workflow — not in scattered files or individual memory.",
    useCases: [
      "Audit engagement management",
      "Trial balance and financial statements",
      "Evidence and review notes",
      "Quality and independence management",
    ],
    proofHref: "/en/demo",
  },
  {
    id: "government",
    title: "Government entities",
    challenge:
      "Accountability requirements, data sovereignty, local content programs, and regulatory reviews needing continuous documentation.",
    outcomes: [
      "Decisions documented with rationale and reviewable evidence",
      "Local content and compliance in one governed path",
      "Deployment models aligned with sovereignty and security",
    ],
    systems: ["LocalContentOS", "DecisionOS", "AuditOS"],
    platformValue:
      "Decision accountability, auditable evidence, and deployment aligned with government sector needs.",
    useCases: [
      "Local content and supply chains",
      "Internal audit and compliance",
      "Procurement and award decision documentation",
      "Regulatory readiness",
    ],
    proofHref: "/en/proof#executive-brief",
  },
  {
    id: "enterprise",
    title: "Large enterprises",
    challenge:
      "Multi-level decisions, distributed teams, and outputs hard to defend to management or external reviewers.",
    outcomes: [
      "Unified decision governance across departments",
      "Governed institutional memory that survives staff turnover",
      "Documented internal review and approvals",
    ],
    systems: ["DecisionOS", "AuditOS", "SalesOS"],
    platformValue:
      "Human-documented decisions, clear approval paths, and operational knowledge tied to evidence.",
    useCases: [
      "Institutional decision documentation",
      "Internal audit",
      "Financial governance and approvals",
      "Institutional memory and operational knowledge",
    ],
    proofHref: "/en/start",
  },
  {
    id: "professional-services",
    title: "Professional services",
    challenge:
      "Output quality depends on individuals, knowledge is undocumented, and methodology is hard to prove to clients.",
    outcomes: [
      "Methodology embedded in workflow — not in individuals' heads",
      "Every output reviewable and deliverable to clients",
      "Governed commercial and operational memory",
    ],
    systems: ["AuditOS", "DecisionOS", "SalesOS"],
    platformValue:
      "Knowledge continuity, output quality, and clear approval paths for clients.",
    useCases: [
      "Project and engagement management",
      "Recommendation and approval documentation",
      "Institutional business development",
      "Quality and internal review paths",
    ],
    proofHref: "/case-studies",
  },
  {
    id: "compliance",
    title: "Compliance & local content",
    challenge:
      "Fragmented supplier and spend data, hidden compliance gaps, and reports prepared late for regulators.",
    outcomes: [
      "Clear view of local content and compliance indicators",
      "Supplier linked to actual spend in one path",
      "Reports ready for regulatory bodies",
    ],
    systems: ["LocalContentOS"],
    platformValue:
      "Compliance and local content as an operational path — not ad-hoc reports from scattered spreadsheets.",
    useCases: [
      "Supplier and spend classification",
      "Compliance gaps and indicators",
      "Local content reports",
      "Impact of procurement decisions",
    ],
    proofHref: "/en/proof#evidence-samples",
  },
];

export default function EnglishIndustriesPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-22">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-black text-white sm:text-5xl">
              Industries we serve
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/60">
              One operating platform — different paths by institutional context.
              Not generic solutions, but operating systems activated on the same
              governance and evidence foundation.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="space-y-16">
          {sectors.map((sector) => (
            <article
              key={sector.id}
              id={sector.id}
              className="scroll-mt-24 rounded-2xl border border-border/60 bg-background p-6 sm:p-10"
            >
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">
                {sector.title}
              </h2>

              <div className="mt-8 rounded-xl border border-destructive/10 bg-destructive/[0.02] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Challenge
                </p>
                <p className="mt-2 text-sm leading-7 text-foreground">
                  {sector.challenge}
                </p>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.03] p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-600">
                    Outcomes
                  </p>
                  <ul className="mt-3 space-y-2">
                    {sector.outcomes.map((outcome) => (
                      <li
                        key={outcome}
                        className="flex gap-2 text-sm leading-7 text-foreground"
                      >
                        <span className="text-emerald-600">✓</span>
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-5 lg:col-span-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                    Related operating systems
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sector.systems.map((sys) => (
                      <span
                        key={sys}
                        className="rounded-lg border border-border/50 bg-background px-3 py-1.5 text-xs font-medium text-foreground"
                      >
                        {sys}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    {sector.platformValue}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Typical operational paths
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {sector.useCases.map((uc) => (
                    <li
                      key={uc}
                      className="rounded-lg border border-border/50 bg-muted/20 px-3 py-1.5 text-xs text-foreground"
                    >
                      {uc}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={sector.proofHref}
                  className="btn-outline h-10 px-6 text-sm"
                >
                  Review proof pack
                </Link>
                {sector.id === "audit-firms" && (
                  <Link
                    href="/print/industry-audit-firms"
                    target="_blank"
                    className="btn-outline h-10 px-6 text-sm"
                  >
                    Sector summary (PDF)
                  </Link>
                )}
                <ScheduleDiagnosticCta locale="en" className="h-10 px-6 text-sm" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <p className="text-sm text-white/55">
            Every sector runs on the same platform —{" "}
            <Link
              href="/en/platform"
              className="text-aqliya-cyan underline underline-offset-4"
            >
              discover how AQLIYA works
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
