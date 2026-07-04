import Link from "next/link";
import type { Metadata } from "next";
import { ConversionBand } from "@/components/marketing/v2/marketing-shell";
import { homeCopyEn } from "@/lib/marketing/copy-plain-en";
import { publicOsStatusEn } from "@/lib/marketing/public-status";

export const metadata: Metadata = {
  title: homeCopyEn.metadata.title,
  description: homeCopyEn.metadata.description,
};

const systems = [
  {
    title: "AuditOS",
    note: publicOsStatusEn.auditOS.capabilityNote,
    status: publicOsStatusEn.auditOS.label,
    href: "/en/products/audit",
  },
  {
    title: "LocalContentOS",
    note: publicOsStatusEn.localContentOS.capabilityNote,
    status: publicOsStatusEn.localContentOS.label,
    href: "/en/products/local-content",
  },
  {
    title: "DecisionOS",
    note: "Documented decisions: context, alternatives, and approvals",
    status: publicOsStatusEn.decisionOS.label,
    href: "/en/products/decision",
  },
  {
    title: "SalesOS",
    note: publicOsStatusEn.salesOS.capabilityNote,
    status: publicOsStatusEn.salesOS.label,
    href: "/en/products/sales",
  },
];

const platformLayersEn = [
  {
    num: "01",
    title: "Governance",
    desc: "Permissions, audit trail, approval gates — every event is logged",
  },
  {
    num: "02",
    title: "Knowledge Foundation",
    desc: "Every output linked to its source — unbreakable evidence chain",
  },
  {
    num: "03",
    title: "Intelligence Operators",
    desc: "AI assists and suggests — never decides or approves without humans",
  },
  {
    num: "04",
    title: "Operating Systems",
    desc: "Each system inherits governance and intelligence — no rebuild",
  },
];

export default function EnglishHomePage() {
  const c = homeCopyEn;

  return (
    <div className="flex flex-col">
      {/* ─── Hero ────────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto max-w-7xl px-6 py-18 sm:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              {c.hero.eyebrow}
            </span>
            <h1 className="mt-6 text-4xl font-black leading-[1.08] text-white sm:text-5xl">
              {c.hero.title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/65">
              {c.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/en/contact" className="btn-primary h-12 px-8 text-base font-bold">
                {c.ctas.contact}
              </Link>
              <Link href="/en/platform" className="btn-outline border-white/15 text-white/70 h-12 px-8 hover:bg-white/5">
                {c.ctas.demo}
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {c.personaChips.map((chip) => (
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

      {/* ─── Problem ──────────────────────────────── */}
      <section className="border-t bg-muted/10 py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-xl font-black sm:text-2xl">{c.problem.title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{c.problem.subtitle}</p>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <ul className="space-y-3 rounded-2xl border border-border/60 bg-background p-6">
              {c.problem.tools.map((t) => (
                <li key={t.name} className="text-sm">
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-muted-foreground"> — {t.line}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl border border-primary/15 bg-primary/[0.03] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                {c.problem.pathLabel}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {c.problem.pathSteps.map((step, i) => (
                  <span key={step} className="flex items-center gap-2 text-sm font-medium">
                    {i > 0 && <span className="text-muted-foreground/40">→</span>}
                    {step}
                  </span>
                ))}
              </div>
              <Link href="/en/use-cases" className="mt-5 inline-block text-sm font-medium text-primary hover:underline">
                {c.problem.pathCta} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Why Platform ─────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Why platform not tool?
            </span>
            <h2 className="mt-6 text-xl font-black sm:text-2xl">
              A tool solves one problem — a platform runs the institution
            </h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-background to-red-500/[0.03] p-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-red-600/80">Standalone AI tool</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-500/50" />Outputs without review or approval path</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-500/50" />Each new domain needs a new tool from scratch</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-500/50" />Permissions and evidence managed outside — or not at all</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-background to-emerald-500/[0.04] p-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600/80">AQLIYA Platform</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/50" />Every output passes through governance and evidence before approval</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/50" />Every system inherits governance and intelligence from one platform</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/50" />Permissions and evidence are part of the platform architecture — no separate management</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── The 4 Layers ──────────────────────────── */}
      <section className="border-t bg-muted/10 py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-xl font-black sm:text-2xl">
              Platform architecture — four stacked layers
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Each layer serves the one above. Every operating system inherits the three layers beneath without duplication.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            {platformLayersEn.map((layer, i) => (
              <div key={layer.num} className="rounded-xl border border-border/60 bg-background p-5 text-center">
                <span className="text-[10px] font-bold text-primary">{layer.num}</span>
                <h3 className="mt-1 text-sm font-black">{layer.title}</h3>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">{layer.desc}</p>
                {i < platformLayersEn.length - 1 && (
                  <div className="mt-3 text-[10px] text-muted-foreground/50" aria-hidden>↑</div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/en/platform" className="text-sm font-medium text-primary hover:underline">
              Explore the platform architecture →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Operating Systems ─────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl font-black sm:text-2xl">{c.systems.title}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{c.systems.subtitle}</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            {c.systems.ctaAll} →
          </Link>
        </p>
      </section>

      {/* ─── Proof ──────────────────────────────────── */}
      <section className="border-t bg-muted/10 py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-xl font-black sm:text-2xl">{c.proof.title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{c.proof.subtitle}</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {c.proof.items.map((p) => (
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
          <p className="mt-6 text-center">
            <Link href="/en/proof" className="text-sm font-medium text-primary hover:underline">
              {c.proof.ctaFull} →
            </Link>
          </p>
        </div>
      </section>

      <ConversionBand
        title={c.conversion.title}
        body={c.conversion.body}
        primaryHref="/en/contact"
        primaryLabel={c.conversion.primaryLabel}
        secondaryHref="/en/proof"
        secondaryLabel={c.conversion.secondaryLabel}
      />
    </div>
  );
}
