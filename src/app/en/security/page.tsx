import Link from "next/link";
import type { Metadata } from "next";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";

export const metadata: Metadata = {
  title: "Enterprise Security | AQLIYA",
  description:
    "RBAC, immutable audit trail, evidence traceability, tenant isolation, and mandatory human-in-the-loop — governance by design.",
};

const pillars = [
  {
    title: "Role-Based Access Control",
    body: "Explicit permissions at organization, workspace, role, and action level. No implicit access.",
  },
  {
    title: "Immutable Audit Trail",
    body: "Every mutation logged with identity, timestamp, and context. Not deletable by admins.",
  },
  {
    title: "Evidence Traceability",
    body: "Outputs linked to source data and human review steps. No floating numbers or AI claims.",
  },
  {
    title: "Tenant Isolation",
    body: "Multi-tenant separation at data, permissions, and audit log boundaries.",
  },
  {
    title: "Human-in-the-Loop",
    body: "AI outputs are drafts. Export and approval require explicit human authorization.",
  },
  {
    title: "Data Ownership",
    body: "Customer data is not used to train external models. Deletion rights documented.",
  },
];

export default function EnglishSecurityPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-black text-white sm:text-5xl">
            Security is architecture — not an add-on
          </h1>
          <p className="mt-6 text-lg text-white/60">
            We do not claim SOC2 or ISO until earned. We provide transparent
            documentation and technical review sessions.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/print/security-summary"
              target="_blank"
              className="btn-primary px-6 py-3"
            >
              Security summary (PDF)
            </Link>
            <ScheduleDiagnosticCta locale="en" variant="outline" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-border/60 bg-background p-6"
            >
              <h2 className="text-base font-black text-foreground">{p.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {p.body}
              </p>
            </div>
          ))}
        </div>
          <p className="mt-10 text-center text-sm text-muted-foreground">
          <Link href="/procurement-pack" className="text-primary underline">
            Full procurement evaluation pack →
          </Link>
          {" · "}
          <Link href="/soc2-roadmap" className="text-primary underline">
            SOC2 roadmap →
          </Link>
        </p>
      </section>
    </div>
  );
}
