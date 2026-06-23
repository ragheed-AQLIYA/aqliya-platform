import Link from "next/link";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { BOOKING_EMAIL } from "@/lib/marketing/booking";
import { WorkflowChain } from "@/components/enterprise";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";

export const metadata: Metadata = {
  title: "About AQLIYA",
  description:
    "AQLIYA exists because institutions need intelligence they can trust and hold accountable — not just faster outputs. A governed institutional operating platform.",
};

const whyAqliyaExists = [
  "The problem is not only a lack of AI tools — it is outputs without evidence and paths without accountability.",
  "Institutions need intelligence that works inside governance, not outside it.",
  "The real risk is not slow automation — it is decisions that cannot be traced, reviewed, or explained after the fact.",
];

const coreItems = [
  "Intelligence coordination",
  "Governance",
  "Workflow",
  "Evidence linking",
  "Permissions",
  "Audit trail",
  "Reporting",
];

const operatingSystems = [
  {
    name: "AuditOS",
    desc: "Audit and financial intelligence — engagement path from source to approval",
  },
  {
    name: "DecisionOS",
    desc: "Decision governance — governed decision memos",
  },
  {
    name: "LocalContentOS",
    desc: "Local content — suppliers, spend, compliance, and reports",
  },
];

const roadmapSystems = [
  {
    name: "SalesOS",
    desc: "Commercial memory — qualification, opportunities, institutional follow-up",
  },
  {
    name: "SimulationOS",
    desc: "Scenario simulation — test impact before decisions",
  },
  {
    name: "Custom Systems",
    desc: "Institutional custom systems — activated by scope",
  },
];

const whatAqliyaIs = [
  "A platform, not a single product — multiple operating lines on one governance core",
  "Private and governed — runs on your data, inside your environment, under your rules",
  "Humans own final decisions — AI assists, it does not decide",
  "Traceable and reviewable — every step documented and linked to evidence and permissions",
  "Built to scale — activated by institutional scope, from one line to a full path",
  "Cloud + Private — deployment models for sovereignty and security requirements",
];

const operatingBeliefs = [
  "We do not start from a screen — we start from institutional reality: who decides, who reviews, and what must remain explainable.",
  "We do not sell intelligence detached from responsibility. Every output in AQLIYA must reach review and approval.",
  "We do not build a fully separate system for every scope; we build reusable operational capability on one core.",
];

const phases = [
  {
    num: "01",
    title: "Understand operational reality",
    desc: "Start from how the institution works today: decisions, files, roles, permissions, and bottlenecks that block operational clarity.",
    output: "Operational reality map",
    participants: "AQLIYA team + stakeholders",
  },
  {
    num: "02",
    title: "Structure data",
    desc: "Define critical data, sources, links to outputs, and what must remain traceable and reviewable inside the system.",
    output: "Operational data model",
    participants: "AQLIYA team",
  },
  {
    num: "03",
    title: "Design workflow",
    desc: "Turn current procedures into a clear path linking input, processing, review, and approval — instead of memory and manual tracking.",
    output: "Governed workflow map",
    participants: "AQLIYA team + stakeholders",
  },
  {
    num: "04",
    title: "Link evidence and permissions",
    desc: "Define who reviews, who approves, required evidence, and how permissions are enforced so outputs stay tied to institutional responsibility.",
    output: "Governance and evidence model",
    participants: "AQLIYA team",
  },
  {
    num: "05",
    title: "Add the intelligence layer",
    desc: "Activate AI as an assistant inside the path, not as the decision owner: suggestions, classifications, summaries, and alerts subject to human review.",
    output: "Governed assistant layer",
    participants: "AQLIYA team",
  },
  {
    num: "06",
    title: "Review and approval",
    desc: "Connect every output to human review and formal approval so decisions and deliverables can be inspected before release.",
    output: "Review and approval gates",
    participants: "AQLIYA team + users",
  },
  {
    num: "07",
    title: "Operational activation",
    desc: "Activate the operating line or institutional path in the real work environment with team training under clear governance.",
    output: "Activated institutional system",
    participants: "AQLIYA team + institution team",
  },
  {
    num: "08",
    title: "Continuous improvement",
    desc: "Measure what changed in operations and evolve the path based on real usage, impact, feedback, and ongoing review requirements.",
    output: "Periodic improvements and expansion",
    participants: "AQLIYA team + institution team",
  },
];

export default function EnglishAboutPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="relative mx-auto max-w-5xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              About AQLIYA
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              AQLIYA exists because institutions need more than faster
              intelligence — they need intelligence they can trust
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
              Institutional decisions are not enough when they are merely correct.
              They must be understandable, documented, and reviewable.
            </p>
            <p className="mx-auto max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
              AQLIYA started from a simple and difficult question: how can an
              institution use AI without losing the ability to review, explain, and
              trace every decision to its full path? The answer is a platform
              that builds not only outputs, but an institutional way to produce
              them.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-black text-foreground">
            Why AQLIYA exists
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Most AI initiatives inside institutions start from a tool, while the
            real problem starts from operations. If data is unclear, permissions
            unknown, and evidence disconnected from outputs, fast intelligence
            becomes a new burden instead of new value.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {whyAqliyaExists.map((item) => (
              <div key={item} className="glass-card-light p-5">
                <p className="text-sm leading-7 text-foreground">{item}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-base leading-8 text-muted-foreground">
            AQLIYA is an institutional operating layer: it connects intelligence
            to data, workflow, evidence, and human review — so the question after
            an output is not &ldquo;who said this?&rdquo; but &ldquo;what led us
            here, who approved it, and on what basis?&rdquo;
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Operating principles
            </p>
            <h2 className="mt-4 text-3xl font-black text-foreground">
              How AQLIYA thinks before building any system
            </h2>
          </div>
          <div className="space-y-4">
            {operatingBeliefs.map((item, index) => (
              <div
                key={item}
                className="rounded-2xl border border-border/70 bg-gradient-to-br from-background to-muted/30 p-6 shadow-sm"
              >
                <div className="text-sm font-black text-primary">
                  0{index + 1}
                </div>
                <p className="mt-2 text-base leading-8 text-foreground">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-black text-white">
              What AQLIYA Intelligence Core means in practice
            </h2>
            <p className="mt-4 text-base leading-8 text-white/58">
              Institutions do not start from zero every time they activate a new
              scope. One unified core brings intelligence coordination,
              governance, workflow, evidence linking, permissions, audit trail,
              and reporting into one reusable foundation.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {coreItems.map((item) => (
              <div key={item} className="glass-card p-5 text-center">
                <p className="text-sm font-bold text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-black text-foreground">
            Operating lines are real operational domains — not marketing sections
          </h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            Each line under AQLIYA addresses a recurring institutional pattern:
            audit, local content, decisions, sales, simulation, or a custom path.
            The goal is not to multiply products, but to unify how governed
            institutional systems are built.
          </p>
          <div className="mt-8 space-y-6">
            <div>
              <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Operating systems
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {operatingSystems.map((item) => (
                  <div
                    key={item.name}
                    className="glass-card-light rounded-2xl p-5"
                  >
                    <p className="text-sm font-black text-foreground">
                      {item.name}
                    </p>
                    <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                Platform roadmap
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {roadmapSystems.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-2xl border border-border/40 bg-muted/10 p-5"
                  >
                    <p className="text-sm font-black text-foreground/60">
                      {item.name}
                    </p>
                    <p className="mt-1.5 text-xs leading-6 text-muted-foreground/60">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-black text-white">
              What makes AQLIYA different
            </h2>
            <p className="mt-4 text-base leading-8 text-white/58">
              The difference is not using AI itself — it is how AI enters the
              institution: as a governed assistant, not as a replacement for
              human judgment or governance paths.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
            {whatAqliyaIs.map((item) => (
              <div key={item} className="glass-card flex items-start gap-3 p-5">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-aqliya-cyan/70" />
                <p className="text-sm leading-7 text-white/75">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              How we work
            </p>
            <h2 className="mt-4 text-3xl font-black text-white">
              How operational reality becomes a governed system
            </h2>
            <p className="mt-4 text-base leading-8 text-white/58">
              AQLIYA does not start from a UI. It starts from understanding
              operational reality, then rebuilds it as a clear institutional path
              on AQLIYA Intelligence Core.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-5xl">
            <div className="mb-10 rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <WorkflowChain
                steps={phases.map((p) => p.title)}
                className="justify-center"
              />
            </div>
            <div className="space-y-4">
              {phases.map((phase, i) => (
                <div
                  key={phase.num}
                  className={cn(
                    "flex items-start gap-5 rounded-2xl border p-6",
                    i % 2 === 0
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-aqliya-cyan/10 bg-aqliya-cyan/[0.02]",
                  )}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-aqliya-cyan/20 text-lg font-black text-aqliya-cyan shadow-sm">
                    {phase.num}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-white">
                      {phase.title}
                    </h3>
                    <p className="mt-1 text-sm leading-7 text-white/58">
                      {phase.desc}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40">
                      <span>Output: {phase.output}</span>
                      <span>Participants: {phase.participants}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Team
          </p>
          <h2 className="mt-4 text-3xl font-black text-foreground">
            The people behind AQLIYA
          </h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            AQLIYA is not built with code alone — it is built by people who
            believe institutional decisions deserve to be documented and preserved.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/20 p-6 transition-all hover:border-primary/25">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-black text-primary">
              R
            </div>
            <h3 className="mt-4 text-base font-black text-foreground">
              Ragheed Al-Hakeem
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Founder — building AQLIYA as an institutional operating platform
              that unites intelligence, governance, and evidence in one path.
            </p>
            <a
              href={`mailto:${BOOKING_EMAIL}`}
              className="mt-3 inline-block text-xs font-medium text-primary underline"
            >
              {BOOKING_EMAIL}
            </a>
          </div>
          <div className="group rounded-2xl border border-dashed border-border/40 bg-muted/10 p-6 transition-all hover:border-border/60">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-lg font-black text-muted-foreground/50">
              +
            </div>
            <h3 className="mt-4 text-base font-black text-muted-foreground/60">
              Join the team
            </h3>
            <p className="mt-1 text-xs text-muted-foreground/50">
              AQLIYA is looking for partners in technology, governance, and
              business development.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-border/70 bg-gradient-to-br from-muted/40 via-background to-primary/[0.03] p-8 text-center shadow-sm sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
            One Core. Multiple Systems.
          </p>
          <h2 className="mt-4 text-3xl font-black text-foreground">
            Start from your institutional scope — not a random tool
          </h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            If you have an operational problem that needs clarity, traceability,
            and review, start from the right operating line or a governed system
            design session on AQLIYA.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <ScheduleDiagnosticCta locale="en" />
            <Link
              href="/en/platform#capabilities"
              className="btn-outline h-12 px-8 text-base"
            >
              Operating systems
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
