import Link from "next/link";
import type { Metadata } from "next";
import { PrintToolbar } from "@/components/marketing/print-toolbar";

export const metadata: Metadata = {
  title: "Operational Evaluation SOW (EN) — PDF | AQLIYA",
  description: "Short SOW template for a governed AuditOS operational evaluation.",
};

export default function PrintEvaluationSowEnPage() {
  const generated = new Date().toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <PrintToolbar title="Print / Save PDF" />
      <article className="print-doc" dir="ltr">
        <p className="print-meta">AQLIYA — Evaluation SOW template · {generated}</p>
        <h1>Operational evaluation scope (SOW)</h1>
        <p>
          Discussion template — not a final contract. Customized with the client
          before kickoff.
        </p>

        <h2>1. Objective</h2>
        <p>
          Evaluate AuditOS value on <strong>one engagement</strong> (or one
          defined workflow) over 2–4 weeks — at no charge — with a written
          evidence-based decision report.
        </p>

        <h2>2. In scope</h2>
        <ul>
          <li>
            Workflow: trial balance → mapping → drafts → evidence → review →
            pack (as agreed)
          </li>
          <li>Users: up to [N] named users</li>
          <li>Environment: managed cloud — isolated tenant</li>
          <li>Support: kickoff + 30-minute weekly checkpoint</li>
        </ul>

        <h2>3. Out of scope</h2>
        <ul>
          <li>ERP / external system integration</li>
          <li>On-Prem or Air-Gapped deployment</li>
          <li>Multiple concurrent engagements without separate SOW</li>
          <li>Professional audit opinion — AQLIYA is an assistive tool only</li>
        </ul>

        <h2>4. Success criteria</h2>
        <p>
          Derived from{" "}
          <Link href="https://aqliya.com/pilot-proof">aqliya.com/pilot-proof</Link>{" "}
          — client and AQLIYA select 5–8 critical criteria before start.
        </p>

        <h2>5. Deliverables</h2>
        <ul>
          <li>Evidence-based decision report: proceed | revise scope | stop</li>
          <li>Evidence summary (screenshots / exports on client data)</li>
          <li>Institutional activation recommendation if proceed</li>
        </ul>

        <h2>6. Responsibility & AI</h2>
        <p>
          AI assists. Humans decide. Evidence governs. The client organization
          remains responsible for professional judgments and final approvals.
        </p>

        <footer className="print-footer">
          Request a diagnostic session to customize SOW: aqliya.com/en/contact
        </footer>
      </article>
    </>
  );
}
