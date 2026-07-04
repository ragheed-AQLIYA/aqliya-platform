import Link from "next/link";
import { BeforeAfterBlock, WorkflowChain } from "@/components/enterprise";
import { ConversionBand, MarketingPageShell } from "@/components/marketing/v2/marketing-shell";
import type { ProductPageContent } from "@/lib/marketing/product-pages-content";

type GovernanceCard = {
  title: string;
  detail: string;
};

function defaultGovernance(locale: "ar" | "en"): GovernanceCard[] {
  return locale === "ar"
    ? [
        { title: "سلسلة أدلة كاملة", detail: "كل مخرج في هذا النظام مرتبط بمصدره الأصلي — ملف، سجل، أو إدخال. لا مخرج بدون سلسلة أدلة يمكن تتبّعها." },
        { title: "مراجعة واعتماد بشري", detail: "كل مخرج يمر بمراجعة بشرية قبل الاعتماد. لا قرار نهائي بدون توقيع المسؤول. كل اعتماد يُوثَّق في سجل التدقيق." },
        { title: "صلاحيات حسب الدور", detail: "كل مستخدم يرى فقط ما يسمح به دوره داخل مؤسسته. لا وصول ضمني، لا صلاحيات متجاوزة." },
        { title: "سجل تدقيق غير قابل للتعديل", detail: "كل حدث — إنشاء، تعديل، اعتماد، رفض — يُسجَّل مع هوية المستخدم والتوقيت. لا حذف، لا تعديل." },
      ]
    : [
        { title: "Full evidence chain", detail: "Every output in this system is linked to its original source — file, record, or entry. No output without a traceable evidence chain." },
        { title: "Human review & approval", detail: "Every output undergoes human review before approval. No final decision without the responsible person's sign-off. Every approval is logged in the audit trail." },
        { title: "Role-based permissions", detail: "Each user only sees what their role permits within their organization. No implicit access, no exceeded permissions." },
        { title: "Immutable audit trail", detail: "Every event — create, edit, approve, reject — is logged with user identity and timestamp. No deletion, no modification." },
      ];
}

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
    governance: "الحوكمة في السياق",
    outcomes: "ماذا يتغير",
    proof: "الإثبات والتجربة",
  },
  en: {
    back: "← Back to operating systems",
    beforeAfter: "Before & after",
    flow: "Operating flow",
    highlights: "Key capabilities",
    governance: "Governance in context",
    outcomes: "What changes",
    proof: "Evidence & demo",
  },
} as const;

export function ProductPageTemplate({
  content,
  locale = "ar",
  backHref,
}: ProductPageTemplateProps) {
  // eslint-disable-next-line security/detect-object-injection -- safe: copy is const, locale is "ar"|"en"
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

      {/* ─── Problem → Solution ──────────────── */}
      <section className="mx-auto w-full max-w-7xl px-6 py-14">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {locale === "ar" ? "المشكلة ← الحل" : "Problem → Solution"}
        </p>
        <div className="mt-1 mb-6">
          <p className="text-sm leading-7 text-muted-foreground">
            {content.problemLine}
          </p>
          <p className="mt-1 text-sm leading-7 text-primary">
            {content.outcomeLine}
          </p>
        </div>
        <BeforeAfterBlock before={content.before} after={content.after} />
      </section>

      {/* ─── Workflow ─────────────────────────── */}
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

      {/* ─── Highlights / Capabilities ─────────── */}
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
      </section>

      {/* ─── Governance in Context ─────────────── */}
      <section className="mx-auto max-w-7xl border-t px-6 py-14">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {t.governance}
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {(content.governanceItems ?? defaultGovernance(locale)).map((g) => (
            <div key={g.title} className="rounded-xl border border-border/60 bg-background p-5">
              <h4 className="mb-2 text-sm font-bold text-foreground">{g.title}</h4>
              <p className="text-sm leading-6 text-muted-foreground">{g.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Outcomes ──────────────────────────── */}
      <section className="section-gradient-light border-t">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t.outcomes}
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {content.after.slice(0, 4).map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.03] px-4 py-4"
              >
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500/60" />
                <span className="text-sm leading-6 text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Evidence / Proof ────────────────────── */}
      <section className="mx-auto max-w-7xl border-t px-6 py-14">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {t.proof}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
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
        title={locale === "en" ? "We start by understanding your context" : undefined}
        body={
          locale === "en"
            ? "Free intro call — we explain the platform and suggest a sensible next step."
            : undefined
        }
        primaryHref={locale === "en" ? "/en/contact" : "/contact"}
        primaryLabel={locale === "en" ? "Book a Diagnostic Session" : undefined}
        secondaryHref={locale === "en" ? "/en/proof" : "/proof"}
        secondaryLabel={locale === "en" ? "Proof materials" : undefined}
      />
    </div>
  );
}
