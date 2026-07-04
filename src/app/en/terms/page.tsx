import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | AQLIYA",
  description:
    "Institutional terms of service for the AQLIYA platform  covering mandatory AI limitations, human approval requirements, and institutional use responsibilities.",
};

const termsSections = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    content:
      "Using the AQLIYA platform constitutes full acceptance of these terms. These terms are written exclusively for institutional use. AQLIYA does not offer its services to individuals outside an institutional context.",
  },
  {
    id: "service-description",
    title: "Service Description",
    content:
      "AQLIYA is a governed institutional intelligence platform that provides specialized operational systems (AuditOS, DecisionOS, LocalContentOS, and custom systems) built on the AQLIYA Intelligence Core. The service is offered as managed SaaS, with private deployment options under planning.",
  },
  {
    id: "ai-limitations",
    title: "AI Limitations  Mandatory",
    highlight: true,
    items: [
      {
        label: "AI is a Decision Support Tool  Not a Decision Maker",
        detail:
          "All AI outputs within AQLIYA are recommendations and supporting analyses. The final decision on any institutional matter rests with an authorized human within your organization. The platform is architecturally designed to enforce this principle.",
      },
      {
        label: "No Automatic Approval for Any Critical Action",
        detail:
          "Any action with institutional impact  exporting a report, closing a case, issuing an official recommendation  requires explicit human approval within the platform. This requirement cannot be disabled through normal settings.",
      },
      {
        label: "No Full Reliance on AI Outputs",
        detail:
          "Your organization is responsible for reviewing and verifying all AI outputs before taking any action based on them. AQLIYA assumes no liability for decisions made based on outputs that were not subject to human review.",
      },
      {
        label: "AI Accuracy Limitations",
        detail:
          "AI models make errors. AQLIYA links every output to its sources to enable verification, but we do not guarantee 100% accuracy in any analysis. Human review is mandatory  not optional.",
      },
    ],
  },
  {
    id: "institutional-use",
    title: "Permitted Institutional Use",
    items: [
      {
        label: "Permitted Uses",
        detail:
          "Analysis of institutional documents, compliance decision support, local content project management, internal and financial auditing, and building governed institutional workflow systems.",
      },
      {
        label: "Prohibited Uses",
        detail:
          "Using the platform to produce binding final decisions without human review, processing personal data outside the scope of the institutional contract, attempting to breach tenant isolation boundaries, or reselling the service to third parties without written authorization.",
      },
    ],
  },
  {
    id: "data-ownership",
    title: "Data Ownership",
    content:
      "All data uploaded by your organization or generated within the platform is exclusively owned by your organization. AQLIYA claims no rights to your data or your systems' outputs. Audit logs produced by your organization are your property and are available for full export.",
  },
  {
    id: "uptime-sla",
    title: "Service Level and Continuity",
    content:
      "We target 99.5% monthly uptime for the managed cloud environment. Scheduled maintenance incidents are communicated in advance. In the event of service interruption, refer to the SLA agreed upon in your organization's service contract.",
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    content:
      "AQLIYA's liability is limited to the value of fees paid in the last 3 months of service. AQLIYA is not liable for any decisions made based on AI outputs without human review, or for any indirect losses resulting from the use of the service.",
  },
  {
    id: "termination",
    title: "Termination of Agreement",
    content:
      "Either party may terminate the agreement by written notice in accordance with the notice period specified in the service contract. Upon termination, your organization is granted a 30-day window to export all its data. After that, data is permanently deleted with a written deletion certificate provided.",
  },
  {
    id: "governing-law",
    title: "Governing Law",
    content:
      "These terms are governed by the applicable laws of the Kingdom of Saudi Arabia. Any dispute shall first be resolved through direct negotiation, then through commercial arbitration if necessary.",
  },
  {
    id: "updates",
    title: "Amendments to Terms",
    content:
      "Any material amendment will be communicated to clients in writing 30 days in advance. Amendments do not apply retroactively to existing contracts unless explicitly agreed upon.",
  },
];

export default function TermsPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              Terms of Service
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              Clear Institutional Terms of Service
            </h1>
            <p className="mt-5 text-base leading-8 text-white/62">
              No vague legal language to hide weaknesses. Our terms are written
              to be understood by both your legal and technical teams  with
              explicit AI limitations that protect your organization.
            </p>
            <p className="mt-4 text-xs text-white/35">
              Last updated: May 2025  These terms are exclusively for
              institutional use
            </p>
          </div>
        </div>
      </section>

      {/* AI Limitations Callout */}
      <section className="border-b border-rose-500/20 bg-rose-500/5 py-6">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex items-start gap-4">
            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-400" />
            <div>
              <p className="font-bold text-white">
                AI Limitations  A Non-Negotiable Principle
              </p>
              <p className="mt-1 text-sm text-white/60">
                AI within AQLIYA is a decision support tool  not a decision
                maker. The final decision always rests with an authorized human
                in your organization. This is not a settings option  it is an
                architectural constraint.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="space-y-12">
            {termsSections.map((section) => (
              <div
                key={section.id}
                className={`border-b border-white/5 pb-12 last:border-0 ${
                  section.highlight
                    ? "rounded-2xl border border-rose-500/15 bg-rose-500/[0.03] p-6"
                    : ""
                }`}
              >
                <h2 className="text-xl font-black text-foreground">
                  {section.title}
                  {section.highlight && (
                    <span className="mr-3 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400">
                      Mandatory
                    </span>
                  )}
                </h2>

                {section.content && (
                  <p className="mt-4 text-base leading-8 text-muted-foreground">
                    {section.content}
                  </p>
                )}

                {section.items && (
                  <div className="mt-5 space-y-4">
                    {section.items.map((item) => (
                      <div key={item.label} className="glass-card-light rounded-xl p-5">
                        <p className="font-bold text-foreground">{item.label}</p>
                        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                          {item.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Block */}
          <div className="mt-16 rounded-2xl border border-border bg-muted/30 p-8 text-center">
            <h2 className="text-xl font-black text-foreground">
              Legal or Contractual Questions?
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Your legal team can contact us directly to review the terms,
              request a customized contract, or discuss compliance requirements
              specific to your sector.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
              <Link href="/en/contact" className="btn-primary px-6">
                Contact the Team
              </Link>
              <Link href="/en/security" className="btn-outline px-6">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
