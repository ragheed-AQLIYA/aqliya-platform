import Link from "next/link";
import type { Metadata } from "next";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";
import {
  publicOsStatusEn,
  publicEngagementGateEn,
} from "@/lib/marketing/public-status";

export const metadata: Metadata = {
  title: "Executive Brief | AQLIYA",
  description:
    "Five-minute executive summary: governed institutional platform, operating systems, deployment models, and operational evaluation path.",
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

      <section className="mx-auto max-w-3xl space-y-10 px-6 py-16 text-slate-300">
        <div>
          <h2 className="text-xl font-bold text-white">What AQLIYA is</h2>
          <p className="mt-3 leading-7">
            A private governed institutional intelligence platform. One core
            (AQLIYA Intelligence Core) hosts specialized operating systems with
            shared RBAC, evidence graph, workflow gates, and immutable audit
            trail.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">Operating systems</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>• AuditOS — {publicOsStatusEn.auditOS.label}</li>
            <li>• DecisionOS — {publicOsStatusEn.decisionOS.label}</li>
            <li>• LocalContentOS — {publicOsStatusEn.localContentOS.label}</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">Deployment</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>• AQLIYA Cloud — available now (default)</li>
            <li>• AQLIYA Private — on platform roadmap</li>
            <li>• AQLIYA Air-Gapped — strategic direction</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">How we engage</h2>
          <p className="mt-3 text-sm text-slate-300">{publicEngagementGateEn}</p>
          <p className="mt-2 text-sm text-slate-400">
            Not claimed: SOC2/ISO certification, ERP integrations, or a
            production On-Prem package.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
          <Link href="/en/demo" className="text-cyan-400 underline">
            Interactive demo →
          </Link>
          <Link href="/procurement-pack" className="text-cyan-400 underline">
            Procurement pack →
          </Link>
          <Link href="/pilot-proof" className="text-cyan-400 underline">
            Operational evaluation framework →
          </Link>
        </div>
      </section>
    </div>
  );
}
