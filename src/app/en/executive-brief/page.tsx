import Link from "next/link";
import type { Metadata } from "next";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";

export const metadata: Metadata = {
  title: "Executive Brief | AQLIYA",
  description:
    "Five-minute executive summary: what AQLIYA is, governance model, deployment options, and pilot readiness.",
};

export default function EnglishExecutiveBriefPage() {
  return (
    <div className="min-h-screen bg-aqliya-deep" dir="ltr">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Executive Brief
          </p>
          <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
            AQLIYA — Governed Institutional Intelligence Platform
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-300">
            AI assists. Humans decide. Evidence governs.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/print/executive-brief"
              target="_blank"
              className="btn-primary px-6 py-3"
            >
              Download PDF (print)
            </Link>
            <Link
              href="/print/executive-brief-en"
              target="_blank"
              className="btn-outline px-6 py-3"
            >
              Download PDF (EN)
            </Link>
            <ScheduleDiagnosticCta locale="en" variant="outline" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 space-y-10 text-slate-300">
        <div>
          <h2 className="text-xl font-bold text-white">What AQLIYA is</h2>
          <p className="mt-3 leading-7">
            A private governed institutional intelligence platform. One core
            (AQLIYA Intelligence Core) hosts specialized operating systems —
            AuditOS, DecisionOS, LocalContentOS — with shared RBAC, evidence
            graph, workflow gates, and immutable audit trail.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">Commercial wedge</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>• AuditOS — Pilot-ready</li>
            <li>• DecisionOS — Active</li>
            <li>• LocalContentOS — Coordinated pilot</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">Deployment</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>• Cloud Managed — available now (default)</li>
            <li>• Private / On-Prem — strategic, not production package</li>
            <li>• Air-Gapped — strategic only</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">Readiness</h2>
          <p className="mt-3 text-sm text-slate-300">
            Pilot evaluation environment — scale after Go/No-Go.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Not claimed: SOC2/ISO certification, ERP integrations, On-Prem
            production package.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
          <Link href="/en/demo" className="text-cyan-400 underline">
            Interactive demo →
          </Link>
          <Link href="/procurement-pack" className="text-cyan-400 underline">
            Procurement pack →
          </Link>
        </div>
      </section>
    </div>
  );
}
