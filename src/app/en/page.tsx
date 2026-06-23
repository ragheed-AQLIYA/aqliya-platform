import Link from "next/link";
import type { Metadata } from "next";
import { publicOsStatusEn } from "@/lib/marketing/public-status";
import { ConversionBand } from "@/components/marketing/v2/marketing-shell";

export const metadata: Metadata = {
  title: "AQLIYA | Institutional Operating Platform",
  description:
    "Governed paths for audit, decisions, and compliance — AI assists. Humans decide. Evidence governs.",
};

const problemTools = [
  { name: "Excel", line: "Calculates. Doesn't govern." },
  { name: "Email / chat", line: "Delivers. Doesn't document." },
  { name: "Generic AI", line: "Produces. Doesn't get reviewed." },
];

const systems = [
  {
    title: "AuditOS",
    note: publicOsStatusEn.auditOS.capabilityNote,
    status: publicOsStatusEn.auditOS.label,
    href: "/en/products/audit",
  },
  {
    title: "DecisionOS",
    note: publicOsStatusEn.decisionOS.capabilityNote,
    status: publicOsStatusEn.decisionOS.label,
    href: "/en/products/decision",
  },
  {
    title: "LocalContentOS",
    note: publicOsStatusEn.localContentOS.capabilityNote,
    status: publicOsStatusEn.localContentOS.label,
    href: "/en/products/local-content",
  },
];

const proofQuick = [
  { title: "Interactive demo", body: "Full path in 10–13 min — no login.", href: "/en/demo" },
  { title: "Executive brief", body: "5 min for leadership.", href: "/en/proof#executive-brief" },
  { title: "Procurement pack", body: "Brief, security, SOW — PDF ready.", href: "/en/procurement-pack" },
];

const personaChips = [
  { label: "Executive", href: "/en/start#executive" },
  { label: "CFO", href: "/en/start#cfo" },
  { label: "Contracting / LC", href: "/en/start#contracting" },
  { label: "Audit", href: "/en/start#audit" },
  { label: "Procurement", href: "/en/start#procurement" },
  { label: "Government", href: "/en/start#government" },
];

export default function EnglishHomePage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto max-w-7xl px-6 py-18 sm:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              Institutional Operating Platform
            </span>
            <h1 className="mt-6 text-4xl font-black leading-[1.08] text-white sm:text-5xl">
              Audit, decision, and compliance paths — not lost in Excel and email
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/65">
              Not a chatbot. Not an ERP. One governed operating platform linking
              data, review, and approval.
            </p>
            <p className="mt-4 text-sm font-bold text-aqliya-cyan">
              AI assists. Humans decide. Evidence governs.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/en/start" className="btn-primary h-12 px-8 text-base font-bold">
                Where to start
              </Link>
              <Link href="/en/demo" className="btn-outline border-white/15 text-white/70 h-12 px-8 hover:bg-white/5">
                Watch demo
              </Link>
              <Link href="/en/contact" className="btn-outline border-white/15 text-white/70 h-12 px-8 hover:bg-white/5">
                Book diagnostic
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {personaChips.map((chip) => (
                <Link
                  key={chip.href}
                  href={chip.href}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/55 hover:border-aqliya-cyan/30"
                >
                  {chip.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/10 py-14">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-xl font-black">Tools vs platform</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {problemTools.map((t) => (
              <div key={t.name} className="rounded-xl border border-border/60 bg-background p-5 text-center">
                <p className="font-bold">{t.name}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t.line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t py-14">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-xl font-black">Operating systems</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {systems.map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className="rounded-xl border border-border/60 p-5 transition hover:border-primary/30"
              >
                <span className="text-[10px] font-semibold text-emerald-700">{s.status}</span>
                <h3 className="mt-1 text-lg font-black">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.note}</p>
              </Link>
            ))}
          </div>
          <p className="mt-6 text-center">
            <Link href="/en/products" className="text-sm font-medium text-primary hover:underline">
              All operating systems →
            </Link>
          </p>
        </div>
      </section>

      <section className="border-t bg-muted/10 py-14">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-xl font-black">Validate before you commit</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {proofQuick.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="rounded-xl border border-border/60 bg-background p-5 hover:border-primary/30"
              >
                <h3 className="font-bold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ConversionBand
        title="Start with a diagnostic session — free"
        body="We map your institution's context and recommend the next step — no sales pitch."
        primaryHref="/en/contact"
        primaryLabel="Book diagnostic session"
        secondaryHref="/en/start"
        secondaryLabel="Choose your role"
      />
    </div>
  );
}
