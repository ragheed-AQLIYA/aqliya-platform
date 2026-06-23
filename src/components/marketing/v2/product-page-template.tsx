import Link from "next/link";
import { BeforeAfterBlock, WorkflowChain } from "@/components/enterprise";
import { ConversionBand, MarketingPageShell } from "@/components/marketing/v2/marketing-shell";
import type { ProductPageContent } from "@/lib/marketing/product-pages-content";

type ProductPageTemplateProps = {
  content: ProductPageContent;
  locale?: "ar" | "en";
  backHref?: string;
};

const copy = {
  ar: {
    back: "← العودة إلى أنظمة التشغيل",
    beforeAfter: "قبل وبعد",
    flow: "المسار التشغيلي",
    highlights: "أبرز القدرات",
    proof: "الإثبات",
  },
  en: {
    back: "← Back to operating systems",
    beforeAfter: "Before & after",
    flow: "Operating flow",
    highlights: "Key capabilities",
    proof: "Proof",
  },
} as const;

export function ProductPageTemplate({
  content,
  locale = "ar",
  backHref,
}: ProductPageTemplateProps) {
  const t = copy[locale];
  const productsBack = backHref ?? (locale === "en" ? "/en/products" : "/products");

  return (
    <div className="flex flex-col">
      <MarketingPageShell
        eyebrow={content.eyebrow}
        title={content.productName}
        subtitle={
          <>
            <span className="block text-white/80">{content.problemLine}</span>
            <span className="mt-3 block text-aqliya-cyan/90">{content.outcomeLine}</span>
          </>
        }
        actions={
          <>
            <Link href={productsBack} className="w-full text-sm text-white/45 hover:text-white/70 sm:w-auto">
              {t.back}
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              {content.statusLabel}
            </span>
          </>
        }
      />

      <section className="mx-auto w-full max-w-7xl px-6 py-14">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {t.beforeAfter}
        </p>
        <div className="mt-6">
          <BeforeAfterBlock before={content.before} after={content.after} />
        </div>
      </section>

      <section className="border-t bg-muted/10">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t.flow}
          </p>
          <div className="mt-6">
            <WorkflowChain steps={content.flowSteps} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {t.highlights}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {content.highlights.map((h) => (
            <div
              key={h}
              className="rounded-xl border border-primary/15 bg-primary/[0.03] px-4 py-5 text-sm font-semibold text-foreground"
            >
              {h}
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {content.demoHref && (
            <Link href={content.demoHref} className="btn-primary h-11 px-6 text-sm">
              {content.demoLabel ?? t.proof}
            </Link>
          )}
          <Link href={content.primaryCta.href} className="btn-outline h-11 px-6 text-sm">
            {content.primaryCta.label}
          </Link>
          <Link href={content.secondaryCta.href} className="btn-outline h-11 px-6 text-sm">
            {content.secondaryCta.label}
          </Link>
        </div>
      </section>

      {content.technicalDetails && (
        <section className="border-t bg-muted/10">
          <div className="mx-auto max-w-7xl px-6 py-10">
            <details className="group rounded-xl border border-border/60 bg-background">
              <summary className="cursor-pointer list-none px-5 py-4 text-sm font-bold marker:content-none">
                <span className="text-primary group-open:text-foreground">
                  {content.technicalDetails.title}
                </span>
                <span className="mt-1 block text-xs font-normal text-muted-foreground">
                  {locale === "ar" ? "اضغط للتفاصيل التقنية" : "Expand for technical depth"}
                </span>
              </summary>
              <div className="space-y-3 border-t px-5 py-4">
                {content.technicalDetails.steps.map((step) => (
                  <div key={step.title} className="rounded-lg border border-border/50 px-4 py-3 text-sm">
                    <p className="font-semibold">{step.title}</p>
                    <p className="mt-1 text-muted-foreground">{step.detail}</p>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </section>
      )}

      <ConversionBand
        title={locale === "en" ? "Start with a diagnostic session — free" : undefined}
        body={
          locale === "en"
            ? "We map your institution's context and recommend the next step."
            : undefined
        }
        primaryHref={locale === "en" ? "/en/contact" : "/contact"}
        primaryLabel={locale === "en" ? "Book diagnostic session" : undefined}
        secondaryHref={locale === "en" ? "/en/proof" : "/proof"}
        secondaryLabel={locale === "en" ? "Proof center" : undefined}
      />
    </div>
  );
}
