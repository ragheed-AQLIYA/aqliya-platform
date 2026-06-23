import Link from "next/link";
import type { Metadata } from "next";
import { PrintToolbar } from "@/components/marketing/print-toolbar";
import {
  publicOsStatusEn,
  publicEngagementGateEn,
} from "@/lib/marketing/public-status";

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
          <li>Not AuditOS-only — the platform is broader than one system</li>
          <li>No autonomous final decisions — AI outputs are drafts</li>
        </ul>

        <h2>Operating systems</h2>
        <ul>
          <li>AuditOS — {publicOsStatusEn.auditOS.label}</li>
          <li>DecisionOS — {publicOsStatusEn.decisionOS.label}</li>
          <li>LocalContentOS — {publicOsStatusEn.localContentOS.label}</li>
        </ul>

        <h2>Deployment</h2>
        <ul>
          <li>AQLIYA Cloud — available (default)</li>
          <li>AQLIYA Private — on platform roadmap</li>
          <li>AQLIYA Air-Gapped — strategic direction</li>
        </ul>

        <h2>Engagement path</h2>
        <p>{publicEngagementGateEn}</p>
        <p>
          Not claimed: SOC2/ISO certification, turnkey ERP integrations, or a
          production On-Prem package.
        </p>

        <h2>Next step</h2>
        <p>
          Diagnostic session → bounded operational evaluation → evidence-based
          decision report. No wide contract before proof.
        </p>
        <p>
          <Link href="https://aqliya.com/en/contact">aqliya.com/en/contact</Link>
        </p>

        <footer className="print-footer">
          Informational document — not a binding offer or compliance certificate.
        </footer>
      </article>
    </>
  );
}
