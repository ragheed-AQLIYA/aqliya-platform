import Link from "next/link";
import type { Metadata } from "next";
import { PrintToolbar } from "@/components/marketing/print-toolbar";
import { BOOKING_EMAIL } from "@/lib/marketing/booking";

export const metadata: Metadata = {
  title: "Executive Brief (EN) — PDF | AQLIYA",
  description: "Printable five-minute executive summary in English.",
};

export default function PrintExecutiveBriefEnPage() {
  const generated = new Date().toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <PrintToolbar title="Print / Save PDF" />
      <article className="print-doc" dir="ltr">
        <p className="print-meta">AQLIYA — Executive Brief · {generated}</p>
        <h1>Private Governed Institutional Intelligence Platform</h1>
        <p className="text-base font-semibold text-slate-700">
          AI assists. Humans decide. Evidence governs.
        </p>

        <h2>What AQLIYA is</h2>
        <p>
          A governed institutional operating platform. AQLIYA Intelligence Core
          hosts specialized operating systems — AuditOS, DecisionOS,
          LocalContentOS — with shared RBAC, evidence graph, workflow gates, and
          immutable audit trail.
        </p>

        <h2>What AQLIYA is not</h2>
        <ul>
          <li>Not a generic chatbot or CRM</li>
          <li>Not AuditOS-only — the platform is broader than one product</li>
          <li>No autonomous final decisions — AI outputs are drafts</li>
        </ul>

        <h2>Operating systems (public status)</h2>
        <ul>
          <li>AuditOS — Pilot-ready commercial wedge</li>
          <li>DecisionOS — Active</li>
          <li>LocalContentOS — Coordinated pilot</li>
        </ul>

        <h2>Deployment</h2>
        <ul>
          <li>Cloud Managed — available (default)</li>
          <li>Private / On-Prem — strategic, not a production package today</li>
          <li>Air-Gapped — strategic only</li>
        </ul>

        <h2>Readiness</h2>
        <p>Pilot evaluation environment — scale after written Go/No-Go.</p>
        <p>
          Not claimed: SOC2/ISO certification, ERP integrations as turnkey
          product, On-Prem production package.
        </p>

        <h2>Next step</h2>
        <p>
          Diagnostic session → bounded pilot → Go/No-Go report. No wide contract
          before evidence.
        </p>
        <p>
          {BOOKING_EMAIL} ·{" "}
          <Link href="https://aqliya.com/en/contact">aqliya.com/en/contact</Link>
        </p>

        <footer className="print-footer">
          Informational document — not a binding offer or compliance certificate.
        </footer>
      </article>
    </>
  );
}
