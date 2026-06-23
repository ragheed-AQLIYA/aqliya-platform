import Link from "next/link";
import type { Metadata } from "next";
import { ConversionBand } from "@/components/marketing/v2/marketing-shell";
import { homeCopyAr } from "@/lib/marketing/copy-plain";
import { publicCapabilityNote, publicOsStatus } from "@/lib/marketing/public-status";

export const metadata: Metadata = {
  title: homeCopyAr.metadata.title,
  description: homeCopyAr.metadata.description,
};

const systems = [
  {
    title: "AuditOS",
    note: publicCapabilityNote.auditOS,
    status: publicOsStatus.auditOS.label,
    href: "/products/audit",
  },
  {
    title: "DecisionOS",
    note: publicCapabilityNote.decisionOS,
    status: publicOsStatus.decisionOS.label,
    href: "/products/decision",
  },
  {
    title: "LocalContentOS",
    note: publicCapabilityNote.localContentOS,
    status: publicOsStatus.localContentOS.label,
    href: "/products/local-content",
  },
];

export default function HomePage() {
  const c = homeCopyAr;

  return (
    <div className="flex flex-col">
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
              <Link href="/start" className="btn-primary h-12 px-8 text-base font-bold">
                {c.ctas.start}
              </Link>
              <Link
                href="/demo"
                className="btn-outline border-white/15 text-white/70 h-12 px-8 text-base hover:bg-white/5"
              >
                {c.ctas.demo}
              </Link>
              <Link
                href="/contact"
                className="btn-outline border-white/15 text-white/70 h-12 px-8 text-base hover:bg-white/5"
              >
                {c.ctas.contact}
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {c.personaChips.map((chip) => (
                <Link
                  key={chip.href}
                  href={chip.href}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/55 hover:border-aqliya-cyan/30 hover:text-white/80"
                >
                  {chip.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/10">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-18">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-black text-foreground sm:text-3xl">
              {c.problem.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {c.problem.subtitle}
            </p>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <ul className="space-y-3 rounded-2xl border border-border/60 bg-background p-6">
              {c.problem.tools.map((t) => (
                <li key={t.name} className="text-sm">
                  <span className="font-semibold text-foreground">{t.name}</span>
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
                    {i > 0 && <span className="text-muted-foreground/40">←</span>}
                    {step}
                  </span>
                ))}
              </div>
              <Link href="/use-cases" className="mt-5 inline-block text-sm font-medium text-primary hover:underline">
                {c.problem.pathCta} ←
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-gradient-light border-t">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-18">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-black text-foreground sm:text-3xl">
              {c.systems.title}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">{c.systems.subtitle}</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {systems.map((sys) => (
              <Link
                key={sys.title}
                href={sys.href}
                className="group rounded-2xl border border-border/60 bg-background p-6 transition-colors hover:border-primary/30"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {sys.status}
                </p>
                <h3 className="mt-2 text-lg font-black group-hover:text-primary">
                  {sys.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{sys.note}</p>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/products" className="btn-outline h-10 px-6 text-sm">
              {c.systems.ctaAll}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t px-6 py-14 sm:py-18">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-black text-foreground sm:text-3xl">
            {c.proof.title}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">{c.proof.subtitle}</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {c.proof.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-border/60 p-5 transition-colors hover:border-primary/25"
            >
              <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">{item.body}</p>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/proof" className="text-sm font-medium text-primary hover:underline">
            {c.proof.ctaFull} ←
          </Link>
        </div>
      </section>

      <ConversionBand
        title={c.conversion.title}
        body={c.conversion.body}
        primaryLabel={c.conversion.primaryLabel}
        secondaryLabel={c.conversion.secondaryLabel}
      />
    </div>
  );
}
