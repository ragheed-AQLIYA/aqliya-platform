import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | AQLIYA",
  description:
    "Institutional privacy policy for the AQLIYA platform — covering data ownership, data residency, AI processing, and enterprise customer rights.",
};

const sections = [
  {
    id: "overview",
    title: "Overview",
    content: "AQLIYA is an institutional intelligence platform built for organizations that handle sensitive data and high-stakes decisions. This policy describes how we collect, store, process, and protect data — with full transparency and without overstated claims.",
  },
  {
    id: "data-we-collect",
    title: "Data We Collect",
    items: [
      {
        label: "Platform Operations Data",
        detail:
          "Documents and data that your organization uploads for processing within AQLIYA systems (AuditOS, DecisionOS, LocalContentOS). This data is your organization's property and is processed exclusively within your isolated tenant environment.",
      },
      {
        label: "Account and User Data",
        detail:
          "User names, institutional email addresses, job roles, and session records — to enable RBAC and identity verification.",
      },
      {
        label: "Audit and Activity Logs",
        detail:
          "Every action within the platform is recorded in an immutable audit log. These logs are your organization's property and are available for export at any time.",
      },
      {
        label: "Diagnostic Usage Data",
        detail:
          "Anonymized data about platform performance and technical errors — to improve service stability. Contains no business content or personal data.",
      },
    ],
  },
  {
    id: "data-we-dont",
    title: "What We Do Not Do",
    items: [
      {
        label: "No Training on Your Data",
        detail:
          "Your organization's data is never used in any form to train AI models — whether our internal models or third-party models.",
      },
      {
        label: "No Cross-Tenant Sharing",
        detail:
          "Your organization's data is fully isolated. No other tenant can access or benefit from it in any way.",
      },
      {
        label: "No Data Sale",
        detail:
          "We do not sell, rent, or trade customer data to any third party under any circumstances.",
      },
      {
        label: "No Commercial Analysis of Customer Data",
        detail:
          "We do not use your document content or decision data for our own commercial analytics or marketing purposes.",
      },
    ],
  },
  {
    id: "ai-processing",
    title: "AI Processing",
    content: "When your data is sent to an AI model (whether internal or external), it is processed instantly and in real time. Model providers do not retain this data for training purposes under active enterprise service contracts. We treat AI models as real-time analytical tools — not as permanent data repositories.",
  },
  {
    id: "data-residency",
    title: "Data Residency and Hosting",
    content: "AQLIYA hosts data by default in a Saudi or Gulf cloud region. Data is not transferred outside the agreed region without explicit written consent from the customer. We are committed to local data residency requirements and work with your team to verify compliance.",
  },
  {
    id: "your-rights",
    title: "Your Organization's Rights",
    items: [
      {
        label: "Full Access Right",
        detail: "You may request a complete report of all data we hold about your organization at any time.",
      },
      {
        label: "Right to Correction",
        detail: "You may request correction of any inaccurate data related to your organization.",
      },
      {
        label: "Right to Full Deletion",
        detail: "Upon contract termination, you may request deletion of all your organization's data, with written proof of execution provided within 30 days.",
      },
      {
        label: "Right to Data Portability",
        detail: "You may request a full export of your data in machine-readable formats at any time.",
      },
    ],
  },
  {
    id: "retention",
    title: "Data Retention Policy",
    content: "Data retention periods are defined by agreement with each customer in the service contract. Audit logs are retained for a minimum of 7 years for institutional compliance purposes unless the customer requests otherwise. Upon expiry of the agreed retention period, data is securely deleted with a deletion certificate provided.",
  },
  {
    id: "security-measures",
    title: "Security Measures",
    content: "We enforce TLS 1.3 for all communications and encryption for data at rest. Access to customer data is restricted to authorized personnel on a need-to-access basis, and all access is logged. For further details on the complete security architecture, refer to our Enterprise Security page.",
  },
  {
    id: "updates",
    title: "Policy Updates",
    content: "Any material change to this policy will be communicated to customers in writing at least 30 days before it takes effect. Changes will not retroactively affect existing data without customer consent.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              Privacy Policy
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              Clear Institutional Privacy
            </h1>
            <p className="mt-5 text-base leading-8 text-white/62">
              No vague promises. No overstated claims. This is a privacy policy written
              for organizations that handle sensitive data and need clear answers.
            </p>
            <p className="mt-4 text-xs text-white/35">
              Last updated: May 2025 — This policy applies to the AQLIYA platform and all its systems
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="space-y-12">
            {sections.map((section) => (
              <div key={section.id} className="border-b border-white/5 pb-12 last:border-0">
                <h2 className="text-xl font-black text-foreground">{section.title}</h2>

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
              Questions about privacy or data?
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Our technical team is ready to answer any institutional questions about how we handle
              your organization's data — before or after signing.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
              <Link href="/en/contact" className="btn-primary px-6">
                Contact Technical Team
              </Link>
              <Link href="/en/security" className="btn-outline px-6">
                Security Architecture
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
