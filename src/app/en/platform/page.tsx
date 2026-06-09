import Link from "next/link";
import type { Metadata } from "next";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";

export const metadata: Metadata = {
  title: "Platform | AQLIYA Intelligence Core",
  description:
    "Shared governance core hosting specialized operating systems — AuditOS wedge first.",
};

const systems = [
  {
    name: "AuditOS",
    status: "Pilot-ready",
    href: "/en/products/audit",
    detail: "Trial balance to engagement pack — commercial wedge.",
  },
  {
    name: "DecisionOS",
    status: "Active",
    href: "/products/decision",
    detail: "Structured decision memos with evidence and approval.",
  },
  {
    name: "LocalContentOS",
    status: "Coordinated pilot",
    href: "/contact",
    detail: "KSA local content — second strategic door.",
  },
];

export default function EnglishPlatformPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-black text-white sm:text-5xl">
            AQLIYA Intelligence Core
          </h1>
          <p className="mt-6 text-lg text-white/65">
            One governed core — RBAC, evidence graph, workflow gates, immutable
            audit trail. Specialized operating systems activate by sector need.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-xl font-black">Operating systems</h2>
        <div className="mt-8 space-y-4">
          {systems.map((s) => (
            <Link
              key={s.name}
              href={s.href}
              className="block rounded-xl border border-border/60 p-5 transition hover:border-primary/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold">{s.name}</span>
                <span className="text-xs font-semibold text-primary">{s.status}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{s.detail}</p>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          SalesOS / SimulationOS — roadmap only, not launch SKUs.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/en/proof" className="btn-outline h-11 px-6">
            Proof Center
          </Link>
          <ScheduleDiagnosticCta locale="en" />
        </div>
      </section>
    </div>
  );
}
