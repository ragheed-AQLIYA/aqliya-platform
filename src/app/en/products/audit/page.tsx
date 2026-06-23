import Link from "next/link";
import type { Metadata } from "next";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";
import { publicOsStatusEn } from "@/lib/marketing/public-status";

export const metadata: Metadata = {
  title: "AuditOS — Governed Audit Operating System | AQLIYA",
  description:
    "From trial balance to engagement pack. Governed audit workflow with human gates, evidence vault, and immutable audit trail.",
};

const journey = [
  {
    step: "01",
    title: "Client acceptance",
    detail: "KYC, risk assessment, partner sign-off.",
  },
  {
    step: "02",
    title: "Trial balance & mapping",
    detail: "Upload, IFRS mapping with human review — no blind automation.",
  },
  {
    step: "03",
    title: "Statements & notes",
    detail: "AI-assisted drafts; every figure traceable to source.",
  },
  {
    step: "04",
    title: "Evidence & findings",
    detail: "Versioned vault, bidirectional links, finding lifecycle.",
  },
  {
    step: "05",
    title: "Review & release",
    detail: "Mandatory gates before export; full audit trail.",
  },
];

export default function EnglishAuditProductPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-aqliya-cyan">
            {publicOsStatusEn.auditOS.label}
          </span>
          <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">
            AuditOS
          </h1>
          <p className="mt-6 text-lg text-white/65">
            {publicOsStatusEn.auditOS.capabilityNote}. AI assists drafting;
            humans approve exports.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/auditos" className="btn-primary px-6 py-3">
              Interactive demo
            </Link>
            <ScheduleDiagnosticCta locale="en" variant="outline" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-2xl font-black text-foreground">Workflow journey</h2>
        <div className="mt-8 space-y-4">
          {journey.map((j) => (
            <div
              key={j.step}
              className="flex gap-4 rounded-xl border border-border/60 p-5"
            >
              <span className="text-sm font-black text-primary">{j.step}</span>
              <div>
                <h3 className="font-bold text-foreground">{j.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{j.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          <Link href="/en/proof" className="text-primary underline">
            Proof Center →
          </Link>
          {" · "}
          <Link href="/print/executive-brief" className="text-primary underline">
            Executive brief (PDF)
          </Link>
        </p>
      </section>
    </div>
  );
}
