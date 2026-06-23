import Link from "next/link";
import type { Metadata } from "next";
import { SectionEyebrow, WorkflowChain } from "@/components/enterprise";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";

export const metadata: Metadata = {
  title: "Governance | AQLIYA",
  description:
    "Complete evidence chains, multi-level RBAC, immutable audit trail, and strict AI governance — built into the platform foundation.",
};

const evidenceLevels = [
  {
    step: "01",
    title: "Source data",
    desc: "Every input is logged with identity, time, and source — uploaded file, manual entry, or external call.",
  },
  {
    step: "02",
    title: "Processing & transformation",
    desc: "Every transformation, classification, or analysis links to the action, version, and parameters used.",
  },
  {
    step: "03",
    title: "AI output",
    desc: "Every AI output is clearly labeled AI-assisted, with model, inputs, and confidence where applicable.",
  },
  {
    step: "04",
    title: "Human review",
    desc: "Every output passes explicit human review — who reviewed, what they reviewed, and what action they took.",
  },
  {
    step: "05",
    title: "Formal approval",
    desc: "Approval requires the right authority. Time, identity, state, and comments are logged — no implicit approval.",
  },
  {
    step: "06",
    title: "Final output & export",
    desc: "Every export or release includes approval status, approver, and timestamp — linked to the full chain.",
  },
];

const rbacLevels = [
  {
    level: "Organization",
    desc: "Full isolation between organizations. No shared data, permissions, or logs across tenants.",
    critical: true,
  },
  {
    level: "Workspace",
    desc: "Inside the organization: independent projects or workspaces with separate permissions.",
    critical: false,
  },
  {
    level: "Role",
    desc: "Predefined roles: reader, reviewer, approver, admin — no implicit permissions.",
    critical: false,
  },
  {
    level: "Action",
    desc: "Every sensitive action requires explicit permission: export, approve, edit, delete.",
    critical: false,
  },
  {
    level: "Field",
    desc: "In sensitive contexts: some fields visible only to specific roles.",
    critical: false,
  },
];

const auditTrailProps = [
  {
    prop: "Events logged",
    value:
      "Every event: create, edit, approve, reject, export, login, file upload",
  },
  {
    prop: "Data per event",
    value:
      "User identity, precise time, IP address, previous state, new state, context",
  },
  {
    prop: "Mutability",
    value: "Immutable — including by administrators",
  },
  {
    prop: "Retention",
    value: "Defined by institutional and compliance requirements",
  },
  {
    prop: "Export",
    value: "Exportable for compliance and external audit",
  },
  {
    prop: "Search & filter",
    value:
      "Search by event, user, entity, time period, or approval status",
  },
];

const aiRules = [
  {
    rule: "AI suggests — humans decide",
    detail:
      "Every AI output is a draft or suggestion — mandatory human review before any approval.",
  },
  {
    rule: "Every call is logged",
    detail:
      "Every AI request, with inputs and outputs, is recorded in the audit trail.",
  },
  {
    rule: "Clear data boundaries",
    detail: "AI cannot access data outside the user's granted permissions.",
  },
  {
    rule: "No automatic financial or legal decisions",
    detail:
      "Any output with financial or legal impact is flagged as requiring human review.",
  },
  {
    rule: "Confidence labeling",
    detail:
      "Where applicable: outputs include confidence indicators or known limitations.",
  },
  {
    rule: "Transparency",
    detail:
      "Users always know: this is AI output, which model, and with what inputs.",
  },
];

export default function EnglishGovernancePage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="relative mx-auto max-w-5xl">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              Institutional governance &amp; security
            </span>
            <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              Governance is not an add-on —
              <span className="mt-1 block text-white/72">
                it is the foundation
              </span>
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/62 sm:text-lg">
              In AQLIYA, governance is implemented at platform level — not
              bolted on later or enabled optionally. Every system built on
              AQLIYA Intelligence Core inherits evidence chains, permissions, and
              audit trail automatically.
            </p>
            <div className="mt-7 max-w-xl rounded-2xl border border-aqliya-cyan/18 bg-aqliya-cyan/[0.05] px-5 py-4 backdrop-blur">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan/80">
                Governing principle
              </p>
              <p className="text-base font-black text-white">
                AI assists. Humans decide. Evidence governs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <SectionEyebrow
          label="Evidence chain"
          title="Every output has a complete traceable history"
          description="From data entry to final export — every step documented and linked. No gaps in the chain."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {evidenceLevels.map((level) => (
            <div
              key={level.step}
              className="rounded-2xl border border-border/60 p-5 transition-all hover:border-primary/20 hover:shadow-sm"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-black text-primary">
                  {level.step}
                </span>
                <p className="text-sm font-bold text-foreground">
                  {level.title}
                </p>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {level.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-primary/15 bg-primary/[0.04] p-5">
          <p className="mb-3 text-xs font-bold text-primary">Evidence path</p>
          <WorkflowChain
            steps={[
              "Source",
              "Processing",
              "AI output",
              "Review",
              "Approval",
              "Export",
            ]}
            className="justify-start"
          />
        </div>
      </section>

      <section className="section-gradient-light border-t">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <SectionEyebrow
            label="AI governance"
            title="AI assists — it does not replace or bypass governance"
            description="In AQLIYA, AI is not a black box. Every use is governed by published rules that prevent autonomous action and keep humans at the center of decisions."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {aiRules.map((rule) => (
              <div
                key={rule.rule}
                className="rounded-2xl border border-border/60 bg-background p-5"
              >
                <div className="mb-3 flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-aqliya-cyan" />
                  <p className="text-sm font-bold text-foreground">
                    {rule.rule}
                  </p>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {rule.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <SectionEyebrow
            label="Permissions & roles"
            title="Multi-layer RBAC with no implicit access"
            description="No implicit access in AQLIYA. Every permission is explicit at organization, workspace, role, and action level."
          />
          <div className="mt-10 space-y-3">
            {rbacLevels.map((level) => (
              <div
                key={level.level}
                className={`rounded-2xl border p-5 ${
                  level.critical
                    ? "border-primary/20 bg-primary/[0.04]"
                    : "border-border/60 bg-background"
                }`}
              >
                <div className="flex items-start gap-4">
                  <p className="shrink-0 text-sm font-black text-foreground">
                    {level.level}
                  </p>
                  <p className="flex-1 text-sm leading-6 text-muted-foreground">
                    {level.desc}
                  </p>
                  {level.critical && (
                    <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-bold text-primary">
                      Core
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <SectionEyebrow
          label="Audit trail"
          title="Immutable log of every platform event"
          description="Every action inside AQLIYA is recorded. No event leaves memory; no log is deleted."
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {auditTrailProps.map((item) => (
            <div
              key={item.prop}
              className="flex gap-4 rounded-2xl border border-border/60 p-5"
            >
              <p className="w-40 shrink-0 text-xs font-bold text-foreground">
                {item.prop}
              </p>
              <p className="flex-1 text-sm leading-6 text-muted-foreground">
                {item.value}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5">
          <p className="mb-2 text-xs font-bold text-amber-700">
            Note for institutions
          </p>
          <p className="text-sm leading-6 text-amber-700/80">
            AQLIYA&apos;s audit trail is designed as institutional evidence —
            usable in external reviews, investigations, or disputes. That is why
            it cannot be deleted or modified, even by platform administrators.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <SectionEyebrow
          label="Tenant isolation"
          title="Every organization in a fully independent environment"
          description="In a multi-tenant environment, data isolation between organizations is non-negotiable."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Data isolation",
              body: "No shared data between organizations at any level.",
            },
            {
              title: "Permission isolation",
              body: "A user in one organization cannot see or access another's data.",
            },
            {
              title: "Audit isolation",
              body: "Each organization's audit log is separate and protected.",
            },
            {
              title: "Config isolation",
              body: "Governance settings, roles, and configuration are per organization.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border/60 bg-muted/10 p-5"
            >
              <p className="mb-2 text-sm font-black text-foreground">
                {item.title}
              </p>
              <p className="text-xs leading-6 text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-black text-foreground sm:text-3xl">
            For your security or technical lead
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            PDF security summary covering RBAC, audit trail, data isolation,
            encryption, and deployment models — ready for initial technical
            review.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/print/security-summary"
              target="_blank"
              className="btn-outline h-11 px-8"
            >
              Security summary PDF
            </Link>
            <Link href="/en/security" className="btn-outline h-11 px-8">
              Security page
            </Link>
          </div>
        </div>
      </section>

      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl rounded-[24px] border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-xl">
            <h2 className="text-2xl font-black text-white sm:text-3xl">
              Specific security or compliance requirements?
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/55">
              We discuss your governance and security requirements and map how
              AQLIYA&apos;s architecture aligns with them.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-4">
              <ScheduleDiagnosticCta locale="en" />
              <Link href="/en/platform" className="btn-secondary h-11 px-8">
                Platform architecture
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
