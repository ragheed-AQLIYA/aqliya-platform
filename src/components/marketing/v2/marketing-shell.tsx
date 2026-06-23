import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MarketingPageShellProps = {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  dark?: boolean;
  className?: string;
};

/** Shared marketing hero — @see docs/marketing/MARKETING_REDESIGN_PLAN.md R1 */
export function MarketingPageShell({
  eyebrow,
  title,
  subtitle,
  children,
  actions,
  dark = true,
  className,
}: MarketingPageShellProps) {
  return (
    <section
      className={cn(
        dark ? "hero-gradient relative overflow-hidden" : "border-t bg-muted/10",
        className,
      )}
    >
      {dark && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
      )}
      <div
        className={cn(
          "relative mx-auto max-w-7xl px-6",
          dark ? "py-16 sm:py-22" : "py-14 sm:py-18",
        )}
      >
        <div className="mx-auto max-w-3xl text-center">
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              {dark && (
                <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              )}
              {eyebrow}
            </span>
          )}
          <h1
            className={cn(
              "mt-5 text-3xl font-black sm:text-4xl lg:text-[2.75rem] leading-[1.1]",
              dark ? "text-white" : "text-foreground",
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={cn(
                "mx-auto mt-5 max-w-2xl text-base leading-8 sm:text-lg",
                dark ? "text-white/60" : "text-muted-foreground",
              )}
            >
              {subtitle}
            </p>
          )}
          {actions && (
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {actions}
            </div>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

type ConversionBandProps = {
  title?: string;
  body?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function ConversionBand({
  title = "نفهم وضعكم أولاً",
  body = "مكالمة تعريفية مجانية — نشرح المنصة ونقترح الخطوة المناسبة. بدون عرض مبيعات.",
  primaryHref = "/contact",
  primaryLabel = "احجز مكالمة",
  secondaryHref = "/proof",
  secondaryLabel = "مواد الإثبات",
}: ConversionBandProps) {
  return (
    <section className="border-t bg-muted/20">
      <div className="mx-auto max-w-4xl px-6 py-14 text-center sm:py-16">
        <h2 className="text-xl font-black text-foreground sm:text-2xl">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
          {body}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link href={primaryHref} className="btn-primary h-12 px-10 text-base font-bold">
            {primaryLabel}
          </Link>
          {secondaryHref && (
            <Link href={secondaryHref} className="btn-outline h-12 px-10 text-base">
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
