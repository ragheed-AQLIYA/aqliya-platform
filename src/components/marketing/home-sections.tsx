import Link from "next/link";


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

/* ─── HeroSection ─────────────────────────────── */

type HeroSectionProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
  personaChips: PersonaChip[];
};

export function HomeHeroSection({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  personaChips,
}: HeroSectionProps) {
  return (
    <section className="hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
      <div className="relative mx-auto max-w-7xl px-6 py-18 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
            <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
            {eyebrow}
          </span>
          <h1 className="mt-6 text-4xl font-black leading-[1.08] text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/65">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={primaryCta.href} className="btn-primary h-12 px-8 text-base font-bold">
              {primaryCta.label}
            </Link>
            <Link
              href={secondaryCta.href}
              className="btn-outline border-white/15 text-white/70 h-12 px-8 text-base hover:bg-white/5"
            >
              {secondaryCta.label}
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {personaChips.map((chip) => (
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
  );
}

/* ─── ProblemSection ──────────────────────────── */

type ProblemSectionProps = { data: ProblemData; arrow: string };

export function ProblemSection({ data, arrow }: ProblemSectionProps) {
  return (
    <section className="border-t bg-muted/10">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:py-18">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-black text-foreground sm:text-3xl">{data.title}</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{data.subtitle}</p>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <ul className="space-y-3 rounded-2xl border border-border/60 bg-background p-6">
            {data.tools.map((t) => (
              <li key={t.name} className="text-sm">
                <span className="font-semibold text-foreground">{t.name}</span>
                <span className="text-muted-foreground"> — {t.line}</span>
              </li>
            ))}
          </ul>
          <div className="rounded-2xl border border-primary/15 bg-primary/[0.03] p-6">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{data.pathLabel}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.pathSteps.map((step, i) => (
                <span key={step} className="flex items-center gap-2 text-sm font-medium">
                  {i > 0 && <span className="text-muted-foreground/40">{arrow}</span>}
                  {step}
                </span>
              ))}
            </div>
            <Link href={data.pathHref} className="mt-5 inline-block text-sm font-medium text-primary hover:underline">
              {data.pathCta} {arrow}
            </Link>
          </div>
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
    border: "border-emerald-500/20",
    bg: "bg-gradient-to-br from-background to-emerald-500/[0.04]",
    label: "text-emerald-600/80",
    dot: "bg-emerald-500/50",
  },
} as const;

export function ComparisonSection({ eyebrow, heading, sides }: ComparisonSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14 sm:py-18">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {eyebrow}
          </span>
          <h2 className="mt-6 text-2xl font-black text-foreground sm:text-3xl">{heading}</h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {sides.map((side) => {
            const style = colorStyles[side.color];
            return (
              <div key={side.title} className={`rounded-2xl border ${style.border} ${style.bg} p-5`}>
                <p className={`mb-2 text-[10px] font-bold uppercase tracking-wider ${style.label}`}>{side.title}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {side.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${style.dot}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
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

export function PlatformLayersSection({ heading, subtitle, layers, ctaLabel, ctaHref }: PlatformLayersSectionProps) {
  return (
    <section className="section-gradient-light border-t">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:py-18">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-black text-foreground sm:text-3xl">{heading}</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{subtitle}</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          {layers.map((layer, i) => (
            <div key={layer.num} className="rounded-xl border border-border/60 bg-background p-5 text-center">
              <span className="text-[10px] font-bold text-primary">{layer.num}</span>
              <h3 className="mt-1 text-sm font-black text-foreground">{layer.title}</h3>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">{layer.desc}</p>
              {i < layers.length - 1 && (
                <div className="mt-3 text-[10px] text-muted-foreground/50" aria-hidden>↑</div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
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
    <section className="mx-auto max-w-7xl px-6 py-14 sm:py-18">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-black text-foreground sm:text-3xl">{heading}</h2>
        <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {systems.map((sys) => (
          <Link
            key={sys.title}
            href={sys.href}
            className="group rounded-2xl border border-border/60 bg-background p-5 transition-colors hover:border-primary/30"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{sys.status}</p>
            <h3 className="mt-2 text-lg font-black group-hover:text-primary">{sys.title}</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{sys.note}</p>
          </Link>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link href={ctaHref} className="btn-outline h-10 px-6 text-sm">
          {ctaAll}
        </Link>
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
      <div className="mx-auto max-w-7xl px-6 py-14 sm:py-18">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-black text-foreground sm:text-3xl">{data.title}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{data.subtitle}</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {data.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-border/60 bg-background p-5 transition-colors hover:border-primary/25"
            >
              <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">{item.body}</p>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href={data.ctaHref} className="text-sm font-medium text-primary hover:underline">
            {data.ctaFull}
          </Link>
        </div>
      </div>
    </section>
  );
}
