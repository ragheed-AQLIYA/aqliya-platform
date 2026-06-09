import Link from "next/link";
import type { Metadata } from "next";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";

export const metadata: Metadata = {
  title: "AQLIYA | Institutional Operating Platform",
  description:
    "A governed institutional operating platform connecting operations, decisions, evidence, and audit trails. AI assists. Humans decide. Evidence governs.",
};

export default function EnglishHomePage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              Institutional Operating Platform
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight text-white sm:text-5xl">
              Governed operations for decisions, workflows, and evidence
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/65">
              AQLIYA helps institutions run critical workflows with human
              review, immutable audit trails, and evidence chains — not
              disconnected files and generic AI.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-sm font-semibold text-aqliya-cyan">
              AI assists. Humans decide. Evidence governs.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <ScheduleDiagnosticCta locale="en" />
              <Link
                href="/en/demo"
                className="btn-outline border-white/15 text-white/70 hover:bg-white/5 h-11 px-6"
              >
                Interactive demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-gradient-light border-t">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <h2 className="text-center text-3xl font-black text-foreground">
            One platform. Sector-specific operating paths.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Specialized operating systems inherit the same governance core —
            RBAC, evidence graph, workflow gates, and audit trail.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "AuditOS",
                body: "Trial balance to engagement pack — pilot-ready wedge for audit firms.",
                href: "/en/products/audit",
                tag: "Pilot-ready",
              },
              {
                title: "DecisionOS",
                body: "Structured decision memos with alternatives, risks, and approval.",
                href: "/executive-brief",
                tag: "Active",
              },
              {
                title: "LocalContentOS",
                body: "Local content, suppliers, spend — coordinated pilot for KSA.",
                href: "/contact",
                tag: "Coordinated pilot",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-2xl border border-border/60 bg-background p-6 transition hover:border-primary/25"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  {item.tag}
                </span>
                <h3 className="mt-2 text-lg font-black">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.body}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="rounded-[28px] border border-border/60 bg-gradient-to-br from-muted/30 to-background p-8 text-center sm:p-12">
          <h2 className="text-2xl font-black text-foreground">
            Start with proof, not a platform pitch
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
            Diagnostic session → bounded pilot → Go/No-Go report. No large
            contract before evidence.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/en/proof" className="btn-outline h-11 px-6">
              Proof Center
            </Link>
            <Link href="/print/executive-brief" className="btn-outline h-11 px-6">
              Executive brief (PDF)
            </Link>
            <ScheduleDiagnosticCta locale="en" variant="outline" />
          </div>
        </div>
      </section>
    </div>
  );
}
