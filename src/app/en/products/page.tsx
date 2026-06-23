import Link from "next/link";
import type { Metadata } from "next";
import { publicOsStatusEn } from "@/lib/marketing/public-status";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";

export const metadata: Metadata = {
  title: "Operating Systems | AQLIYA",
  description:
    "Governed operating systems on AQLIYA Intelligence Core — AuditOS, DecisionOS, and LocalContentOS.",
};

const systems = [
  {
    id: "audit",
    title: "AuditOS",
    subtitle: "Audit and financial intelligence",
    status: publicOsStatusEn.auditOS,
    href: "/en/products/audit",
  },
  {
    id: "decision",
    title: "DecisionOS",
    subtitle: "Decision governance",
    status: publicOsStatusEn.decisionOS,
    href: "/en/products/decision",
  },
  {
    id: "local-content",
    title: "LocalContentOS",
    subtitle: "Local content and compliance",
    status: publicOsStatusEn.localContentOS,
    href: "/en/products/local-content",
  },
];

export default function EnglishProductsPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-4xl font-black text-white sm:text-5xl">
            Operating systems on one core
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/60">
            Audit, decisions, and local content — shared governance, evidence
            chains, and human approval gates.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-5 px-6 py-16">
        {systems.map((sys) => (
          <article
            key={sys.id}
            className="rounded-2xl border border-border/60 p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {sys.status.label}
                </p>
                <h2 className="mt-1 text-2xl font-black">{sys.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {sys.subtitle}
                </p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {sys.status.capabilityNote}
                </p>
              </div>
              <Link href={sys.href} className="btn-primary h-10 px-6 text-sm">
                Explore {sys.title}
              </Link>
            </div>
          </article>
        ))}

        <div className="flex flex-wrap justify-center gap-4 pt-8">
          <ScheduleDiagnosticCta locale="en" />
          <Link href="/en/start" className="btn-outline h-11 px-6">
            Get started by role
          </Link>
        </div>
      </section>
    </div>
  );
}
