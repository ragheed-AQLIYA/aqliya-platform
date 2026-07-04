import type { Metadata } from "next";
import Link from "next/link";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";

export const metadata: Metadata = {
  title: "Case Studies | AQLIYA",
  description:
    "Documented institutional scenarios showing how AQLIYA transforms scattered manual workflows into governed, auditable processes.",
};

const scenarios = [
  {
    id: "audit-firm-pilot",
    label: "Case Study: Regional Audit Firm",
    badge: "Simulated Scenario  Mock Data",
    badgeColor: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    context:
      "A regional audit firm managing 3–5 concurrent engagements. The team works on Excel and shared folders. Reviews happen over email and WhatsApp.",
    before: [
      "Trial balance processed manually in Excel  hours per engagement",
      "Account mapping relies on individual experience, not documented methodology",
      "Findings scattered across email, paper, and WhatsApp",
      "No unified record of who approved what and when",
      "Financial statements compiled manually with every rework cycle",
    ],
    after: [
      "Trial balance uploaded and verified in two minutes  imbalances detected automatically",
      "Account mapping suggestions built on IFRS standards  auditor reviews and adjusts",
      "Finding workflow within the platform: create → assign → review → partner approval",
      "Complete audit trail: every action logged with user, timestamp, and reason",
      "Financial statement drafts and notes auto-generated for human review",
    ],
    evidence: [
      "18+ event types recorded in the Audit Trail",
      "Approval gate: 5 conditions must be satisfied before publishing",
      "Every financial statement line item linked to its source evidence",
      "Full approval sequence preserved  who approved, when, and why",
    ],
    workflow: [
      {
        step: "1",
        label: "Upload Trial Balance",
        detail: "CSV/XLSX  instant imbalance verification",
      },
      {
        step: "2",
        label: "Account Mapping",
        detail: "Smart suggestions + auditor review",
      },
      {
        step: "3",
        label: "Financial Statements",
        detail: "Auto-generated draft + mandatory human review",
      },
      {
        step: "4",
        label: "Notes & Evidence",
        detail: "Gap identification + document linking",
      },
      {
        step: "5",
        label: "Findings & Recommendations",
        detail: "Auto-classified by severity",
      },
      { step: "6", label: "Partner Review", detail: "Approval gate + signed record" },
      { step: "7", label: "Publish", detail: "Complete engagement package with Audit Trail" },
    ],
    note: "A documented institutional scenario reflecting AuditOS capabilities in a governed audit workflow. Actual results depend on the nature of each engagement and data quality.",
  },
  {
    id: "gov-entity-pilot",
    label: "Case Study: Government Entity  Internal Audit",
    badge: "Simulated Scenario  Mock Data",
    badgeColor: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    context:
      "An internal audit unit within a government entity. Audits cover multi-department engagements. Key requirement: verifiable documentation and a clear approval chain.",
    before: [
      "Audit procedures documented in Word files  difficult to review and verify",
      "Supporting evidence scattered in shared folders with no systematic organization",
      "Audit decisions insufficiently documented for external verification",
      "Recreating findings from cycle to cycle relies on team memory",
      "No clear separation between who performed the work and who approved it",
    ],
    after: [
      "Every audit procedure recorded with user, role, and timestamp",
      "Evidence linked directly to audit line items  full traceability",
      "Complete separation between performer and approver roles  no authority bypass",
      "Full engagement package exportable for external auditors",
      "Non-editable audit trail  every action preserved",
    ],
    evidence: [
      "RBAC: role-level and engagement-level permissions",
      "Audit Trail: non-deletable log  18+ event types",
      "Evidence Graph: evidence linked to specific line items",
      "Human Gates: cannot publish without meeting approval conditions",
    ],
    workflow: [
      {
        step: "1",
        label: "Create Engagement",
        detail: "Define scope, team, and permissions",
      },
      {
        step: "2",
        label: "Upload Data",
        detail: "Engagement documents and financial data",
      },
      { step: "3", label: "Assign Work", detail: "Distribute tasks by role" },
      {
        step: "4",
        label: "Audit Procedures",
        detail: "Execute with real-time documentation",
      },
      {
        step: "5",
        label: "Supervisor Review",
        detail: "Quality check + revision guidance",
      },
      { step: "6", label: "Official Approval", detail: "Formal approval gate" },
      {
        step: "7",
        label: "Archive & Export",
        detail: "Complete package for official records",
      },
    ],
    note: "An institutional scenario reflecting the governance and audit trail capabilities of AuditOS. The workflow can be verified through the interactive demo or the evidence package.",
  },
];

const trustPoints = [
  {
    icon: "⊘",
    title: "No Fake Logos",
    body: "We do not display client logos without permission. All case studies presented are documented institutional scenarios using simulated data.",
  },
  {
    icon: "⊡",
    title: "Results Depend on Context",
    body: "Every institution is different. We focus on methodology and evidence  not generic numerical promises.",
  },
  {
    icon: "⊞",
    title: "Evidence First",
    body: "Every claim is linked to a platform capability  you can verify it in the demo or the evidence package.",
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-aqliya-deep">
      {/* Hero */}
      <section className="hero-gradient py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
            Case Studies
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            What Working with AuditOS Looks Like
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Documented scenarios showing the audit workflow transformation  from scattered manual
            processes to a unified, traceable, and approval-ready methodology.
          </p>
          <p className="mt-4 text-sm text-amber-400/80">
            Note: All scenarios presented are simulated with mock data. No real client audits are shown on this page.
          </p>
        </div>
      </section>

      {/* Institutional reference scenarios */}
      <section className="py-12 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Institutional Reference
            </p>
            <h2 className="mt-3 text-xl font-bold text-white">
              Saudi Contracting Scenario  Local Content Compliance
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              A major contracting company subject to the Local Content Program. Data is distributed
              across procurement, finance, and compliance. Reports are prepared manually ahead of
              regulatory deadlines.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm">
              <div>
                <p className="font-semibold text-white">The Challenge</p>
                <p className="mt-1 text-slate-400">
                  Spend and suppliers with no operational integration, and compliance gaps discovered too late.
                </p>
              </div>
              <div>
                <p className="font-semibold text-white">The Approach</p>
                <p className="mt-1 text-slate-400">
                  Deploy LocalContentOS to connect supplier–spend–classification–metrics in a single governed workflow.
                </p>
              </div>
              <div>
                <p className="font-semibold text-white">The Result</p>
                <p className="mt-1 text-slate-400">
                  Continuous compliance visibility and regulator-ready reports  every figure linked to its source.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/en/products/local-content"
                className="btn-outline px-5 py-2.5 text-sm"
              >
                Explore LocalContentOS
              </Link>
              <Link href="/en/proof#evidence-samples" className="btn-outline px-5 py-2.5 text-sm">
                View Evidence Package
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Points */}
      <section className="py-10 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {trustPoints.map((t) => (
            <div key={t.title} className="flex gap-4 items-start">
              <span className="text-cyan-400 text-xl mt-0.5">{t.icon}</span>
              <div>
                <p className="text-white font-medium text-sm">{t.title}</p>
                <p className="text-slate-400 text-sm mt-1">{t.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Scenarios */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6 space-y-20">
          {scenarios.map((s) => (
            <div key={s.id} className="glass-card rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="p-8 border-b border-white/5">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${s.badgeColor}`}
                  >
                    {s.badge}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  {s.label}
                </h2>
                <p className="text-slate-300 leading-relaxed">{s.context}</p>
              </div>

              {/* Before / After */}
              <div className="grid grid-cols-1 md:grid-cols-2 border-b border-white/5">
                <div className="p-8 border-b md:border-b-0 md:border-l border-white/5">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    Before  Current State
                  </h3>
                  <ul className="space-y-3">
                    {s.before.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-slate-300 text-sm leading-relaxed"
                      >
                        <span className="text-red-400 mt-0.5 shrink-0">✕</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-8">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    After  With AuditOS
                  </h3>
                  <ul className="space-y-3">
                    {s.after.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-slate-300 text-sm leading-relaxed"
                      >
                        <span className="text-emerald-400 mt-0.5 shrink-0">
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Workflow */}
              <div className="p-8 border-b border-white/5">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">
                  Workflow
                </h3>
                <div className="flex flex-wrap gap-3">
                  {s.workflow.map((w) => (
                    <div
                      key={w.step}
                      className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-2.5"
                    >
                      <span className="text-cyan-400 font-bold text-sm">
                        {w.step}
                      </span>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {w.label}
                        </p>
                        <p className="text-slate-400 text-xs">{w.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence Chain */}
              <div className="p-8 border-b border-white/5">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Evidence Chain  What the System Logs
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {s.evidence.map((e, i) => (
                    <div
                      key={i}
                      className="flex gap-3 items-center bg-cyan-500/5 border border-cyan-500/10 rounded-lg px-4 py-3"
                    >
                      <span className="text-cyan-400 text-sm shrink-0">◈</span>
                      <span className="text-slate-300 text-sm">{e}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="p-6 bg-amber-500/5">
                <p className="text-amber-300/70 text-sm leading-relaxed">
                  <span className="font-medium">Methodological Note: </span>
                  {s.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-gradient-dark py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            See the Full Workflow
          </h2>
          <p className="text-slate-300 mb-8 leading-relaxed">
            In the interactive demo, you will walk through every step  from trial balance upload
            to publishing the engagement package  on real simulated data.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/en/demo"
              className="btn-primary px-8 py-3 rounded-xl text-sm font-medium"
            >
              View Full Demo
            </Link>
            <ScheduleDiagnosticCta className="rounded-xl px-8 py-3 text-sm font-medium" />
          </div>
        </div>
      </section>
    </div>
  );
}
