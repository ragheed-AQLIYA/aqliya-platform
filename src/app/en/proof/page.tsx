import Link from "next/link";
import type { Metadata } from "next";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";

export const metadata: Metadata = {
  title: "Proof Center | AQLIYA",
  description:
    "Interactive demo, executive brief, operational evaluation framework, security summary, and procurement pack — everything to evaluate AQLIYA honestly.",
};

const sections = [
  {
    title: "Interactive demo",
    body: "Full operational journey on sanitized data. 10–13 minutes, no login.",
    href: "/en/demo",
    cta: "Start demo",
  },
  {
    title: "Executive brief",
    body: "Five-minute leadership summary — platform vision and engagement path.",
    href: "/en/executive-brief",
    cta: "Read brief",
  },
  {
    title: "Operational evaluation framework",
    body: "Six evaluation dimensions, evidence-based decision criteria, and captured proof examples.",
    href: "/pilot-proof",
    cta: "Evaluation framework",
  },
  {
    title: "Security summary",
    body: "RBAC, audit trail, evidence, tenant isolation, AI boundaries.",
    href: "/en/security",
    cta: "Security",
  },
  {
    title: "Procurement pack",
    body: "PDF briefs, DPA summary, evaluation SOW, data residency — one hub.",
    href: "/en/procurement-pack",
    cta: "Procurement pack",
  },
  {
    title: "Engagement models",
    body: "Diagnostic → operational evaluation → institutional activation.",
    href: "/en/engagement-models",
    cta: "Engagement models",
  },
  {
    title: "Deployment options",
    body: "Managed cloud, private (planned), air-gapped (strategic).",
    href: "/en/deployment",
    cta: "Deployment",
  },
  {
    title: "Industry brief (audit firms)",
    body: "Sector summary PDF for audit firm buyers.",
    href: "/print/industry-audit-firms",
    cta: "Audit sector PDF",
  },
];

export default function EnglishProofPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-4xl font-black text-white sm:text-5xl">
            Proof Center
          </h1>
          <p className="mt-6 text-lg text-white/60">
            We don&apos;t ask for faith in slides. Demo, documents, operational
            evaluation criteria, and security — in one place.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-5 px-6 py-16">
        {sections.map((s) => (
          <article
            key={s.title}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 p-6"
          >
            <div>
              <h2 className="text-lg font-black">{s.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
            <Link href={s.href} className="btn-primary h-10 px-6 text-sm">
              {s.cta}
            </Link>
          </article>
        ))}

        <div className="pt-8 text-center">
          <ScheduleDiagnosticCta locale="en" />
        </div>
      </section>
    </div>
  );
}
