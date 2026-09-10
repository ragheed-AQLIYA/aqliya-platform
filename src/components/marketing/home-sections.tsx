import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal } from "./reveal";

/* ─── Types ───────────────────────────────────── */

export type ProblemData = {
  title: string;
  subtitle: string;
  tools: readonly { readonly name: string; readonly line: string }[];
  pathLabel: string;
  pathSteps: readonly string[];
  pathCta: string;
  pathHref: string;
};

export type PlatformLayer = {
  num: string;
  title: string;
  desc: string;
};

export type SystemCard = {
  title: string;
  note: string;
  status: string;
  href: string;
};

export type ProofItem = {
  readonly title: string;
  readonly body: string;
  readonly href: string;
};

export type ProofData = {
  title: string;
  subtitle: string;
  items: readonly ProofItem[];
  ctaFull: string;
  ctaHref: string;
};

type HeroCta = { label: string; href: string };
type PersonaChip = { label: string; href: string };
type TrustSignal = { label: string };

/* ─── HeroSection ─────────────────────────────── */

type HeroSectionProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
  personaChips: PersonaChip[];
  /** Optional conceptual architecture visual rendered beside the copy on desktop. */
  visual?: ReactNode;
  /** Optional short trust signals (localized) shown under the CTAs. */
  trustSignals?: TrustSignal[];
  personaLabel?: string;
};

export function HomeHeroSection({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  personaChips,
  visual,
  trustSignals,
  personaLabel,
}: HeroSectionProps) {
  return (
    <section className="hero-gradient relative overflow-hidden">
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-aqliya-cyan/40 to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Copy column */}
          <div className={visual ? "text-center lg:text-start" : "mx-auto max-w-4xl text-center"}>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
                <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" aria-hidden />
                {eyebrow}
              </span>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="mt-6 text-4xl font-black leading-[1.08] text-white sm:text-5xl">
                {title}
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p
                className={
                  visual
                    ? "mt-5 text-lg leading-8 text-white/65"
                    : "mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/65"
                }
              >
                {subtitle}
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div
                className={
                  visual
                    ? "mt-8 flex flex-wrap justify-center gap-3 lg:justify-start"
                    : "mt-8 flex flex-wrap justify-center gap-3"
                }
              >
                <Link href={primaryCta.href} className="btn-primary h-12 px-8 text-base font-bold">
                  {primaryCta.label}
                </Link>
                <Link
                  href={secondaryCta.href}
                  className="btn-secondary h-12 px-8 text-base"
                >
                  {secondaryCta.label}
                </Link>
              </div>
            </Reveal>

            {trustSignals && trustSignals.length > 0 && (
              <Reveal delay={220}>
                <ul
                  className={
                    visual
                      ? "mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 lg:justify-start"
                      : "mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2"
                  }
                >
                  {trustSignals.map((signal) => (
                    <li
                      key={signal.label}
                      className="flex items-center gap-1.5 text-xs font-medium text-white/55"
                    >
                      <CheckIcon />
                      {signal.label}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            <Reveal delay={260}>
              <div
                className={
                  visual
                    ? "mt-7 flex flex-wrap items-center justify-center gap-2 lg:justify-start"
                    : "mt-7 flex flex-wrap items-center justify-center gap-2"
                }
              >
                {personaLabel && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    {personaLabel}
                  </span>
                )}
                {personaChips.map((chip) => (
                  <Link
                    key={chip.href}
                    href={chip.href}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/55 transition-colors hover:border-aqliya-cyan/30 hover:text-white/80"
                  >
                    {chip.label}
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Visual column */}
          {visual && (
            <Reveal delay={140} className="hidden lg:block">
              {visual}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="shrink-0 text-aqliya-cyan" aria-hidden>
      <path
        d="M16.5 5.5L8 14l-4.5-4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── ProblemSection ──────────────────────────── */

type ProblemSectionProps = { data: ProblemData; arrow: string };

export function ProblemSection({ data, arrow }: ProblemSectionProps) {
  return (
    <section className="border-t bg-muted/10">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-black text-foreground sm:text-3xl">{data.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{data.subtitle}</p>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Reveal delay={60}>
            <ul className="h-full space-y-3 rounded-2xl border border-border/60 bg-background p-6">
              {data.tools.map((t) => (
                <li key={t.name} className="flex items-start gap-3 text-sm">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/30" aria-hidden />
                  <span>
                    <span className="font-semibold text-foreground">{t.name}</span>
                    <span className="text-muted-foreground">  {t.line}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120}>
            <div className="h-full rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.05] to-aqliya-cyan/[0.03] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                {data.pathLabel}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {data.pathSteps.map((step, i) => (
                  <span key={step} className="flex items-center gap-2 text-sm font-medium">
                    {i > 0 && <span className="text-muted-foreground/40" aria-hidden>{arrow}</span>}
                    <span className="rounded-lg border border-border/50 bg-background px-3 py-1.5">
                      {step}
                    </span>
                  </span>
                ))}
              </div>
              <Link
                href={data.pathHref}
                className="mt-5 inline-block text-sm font-medium text-primary hover:underline"
              >
                {data.pathCta} {arrow}
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─── ComparisonSection ───────────────────────── */

type ComparisonSide = { title: string; items: string[]; color: "red" | "emerald" };
type ComparisonSectionProps = {
  eyebrow: string;
  heading: string;
  sides: [ComparisonSide, ComparisonSide];
};

const colorStyles = {
  red: {
    border: "border-red-500/20",
    bg: "bg-gradient-to-br from-background to-red-500/[0.03]",
    label: "text-red-600/80",
    dot: "bg-red-500/50",
  },
  emerald: {
    border: "border-emerald-500/25",
    bg: "bg-gradient-to-br from-background to-emerald-500/[0.05]",
    label: "text-emerald-600/80",
    dot: "bg-emerald-500/60",
  },
} as const;

export function ComparisonSection({ eyebrow, heading, sides }: ComparisonSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              {eyebrow}
            </span>
            <h2 className="mt-6 text-2xl font-black text-foreground sm:text-3xl">{heading}</h2>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {sides.map((side, i) => {
            const style = colorStyles[side.color];
            return (
              <Reveal key={side.title} delay={i * 80}>
                <div className={`h-full rounded-2xl border ${style.border} ${style.bg} p-6`}>
                  <p className={`mb-3 text-[10px] font-bold uppercase tracking-wider ${style.label}`}>
                    {side.title}
                  </p>
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    {side.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── PlatformLayersSection ───────────────────── */

type PlatformLayersSectionProps = {
  heading: string;
  subtitle: string;
  layers: PlatformLayer[];
  ctaLabel: string;
  ctaHref: string;
};

export function PlatformLayersSection({
  heading,
  subtitle,
  layers,
  ctaLabel,
  ctaHref,
}: PlatformLayersSectionProps) {
  return (
    <section className="section-gradient-light border-t">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-black text-foreground sm:text-3xl">{heading}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{subtitle}</p>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {layers.map((layer, i) => (
            <Reveal key={layer.num} delay={i * 70}>
              <div className="group relative h-full overflow-hidden rounded-xl border border-border/60 bg-background p-5 text-center transition-all duration-300 hover:border-primary/30 hover:shadow-[0_8px_24px_-12px_rgba(37,99,235,0.25)]">
                <span
                  className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/0 via-aqliya-cyan/60 to-primary/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden
                />
                <span className="font-mono text-[11px] font-bold text-primary tabular-nums">{layer.num}</span>
                <h3 className="mt-1 text-sm font-black text-foreground">{layer.title}</h3>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">{layer.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href={ctaHref} className="text-sm font-medium text-primary hover:underline">
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── SystemCardGrid ──────────────────────────── */

type SystemCardGridProps = {
  heading: string;
  subtitle: string;
  systems: SystemCard[];
  ctaAll: string;
  ctaHref: string;
};

export function SystemCardGrid({ heading, subtitle, systems, ctaAll, ctaHref }: SystemCardGridProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
      <Reveal>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-black text-foreground sm:text-3xl">{heading}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </Reveal>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {systems.map((sys, i) => (
          <Reveal key={sys.title} delay={i * 70}>
            <Link
              href={sys.href}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-background p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_10px_30px_-14px_rgba(37,99,235,0.3)]"
            >
              <span
                className="absolute inset-y-0 start-0 w-0.5 scale-y-0 bg-gradient-to-b from-primary to-aqliya-cyan transition-transform duration-300 group-hover:scale-y-100"
                aria-hidden
              />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{sys.status}</p>
              <h3 className="mt-2 text-lg font-black transition-colors group-hover:text-primary">
                {sys.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{sys.note}</p>
            </Link>
          </Reveal>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link href={ctaHref} className="btn-outline h-10 px-6 text-sm">
          {ctaAll}
        </Link>
      </div>
    </section>
  );
}

/* ─── TrustSection ────────────────────────────── */

export type TrustPillar = {
  title: string;
  desc: string;
};

type TrustSectionProps = {
  eyebrow: string;
  heading: string;
  subtitle: string;
  pillars: TrustPillar[];
  principleLabel: string;
  principle: string;
};

export function TrustSection({
  eyebrow,
  heading,
  subtitle,
  pillars,
  principleLabel,
  principle,
}: TrustSectionProps) {
  return (
    <section className="section-gradient-dark relative overflow-hidden border-t border-white/5">
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" aria-hidden />
              {eyebrow}
            </span>
            <h2 className="mt-6 text-2xl font-black text-white sm:text-3xl">{heading}</h2>
            <p className="mt-3 text-sm leading-7 text-white/55">{subtitle}</p>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 70}>
              <div className="h-full rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-colors hover:border-aqliya-cyan/25">
                <h3 className="text-sm font-bold text-white">{pillar.title}</h3>
                <p className="mt-2 text-xs leading-6 text-white/55">{pillar.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120}>
          <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-aqliya-cyan/20 bg-aqliya-cyan/[0.04] p-6 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-aqliya-cyan/80">
              {principleLabel}
            </p>
            <p className="mt-2 text-base font-medium leading-8 text-white">{principle}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── ProofSection ────────────────────────────── */

type ProofSectionProps = {
  data: ProofData;
};

export function ProofSection({ data }: ProofSectionProps) {
  return (
    <section className="border-t bg-muted/10">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-black text-foreground sm:text-3xl">{data.title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{data.subtitle}</p>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {data.items.map((item, i) => (
            <Reveal key={item.href} delay={i * 70}>
              <Link
                href={item.href}
                className="group flex h-full flex-col rounded-2xl border border-border/60 bg-background p-5 transition-all duration-300 hover:border-primary/25 hover:shadow-[0_8px_24px_-14px_rgba(37,99,235,0.25)]"
              >
                <h3 className="text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">{item.body}</p>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href={data.ctaHref} className="text-sm font-medium text-primary hover:underline">
            {data.ctaFull}
          </Link>
        </div>
      </div>
    </section>
  );
}
