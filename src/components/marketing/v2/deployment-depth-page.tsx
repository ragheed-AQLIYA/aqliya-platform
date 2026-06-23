import Link from "next/link";
import type { DeploymentModel } from "@/lib/marketing/deployment-page-content";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";
import { ConversionBand, MarketingPageShell } from "@/components/marketing/v2/marketing-shell";
import { cn } from "@/lib/utils";

type DeploymentDepthPageProps = {
  locale?: "ar" | "en";
  models: DeploymentModel[];
};

const toneClass: Record<DeploymentModel["statusTone"], string> = {
  available: "text-emerald-500",
  planned: "text-amber-500",
  strategic: "text-muted-foreground",
};

export function DeploymentDepthPage({ locale = "ar", models }: DeploymentDepthPageProps) {
  const securityHref = locale === "en" ? "/en/security" : "/security";
  const startHref = locale === "en" ? "/en/start#engagement" : "/start#engagement";
  const residencyPdf = "/print/data-residency";

  return (
    <div className="flex flex-col">
      <MarketingPageShell
        eyebrow={locale === "en" ? "Deployment" : "بيئات النشر"}
        title={
          locale === "en"
            ? "Honest deployment options"
            : "خيارات نشر واضحة وصادقة"
        }
        subtitle={
          locale === "en"
            ? "Managed cloud is available today. Private and air-gapped are planned or strategic — we do not overclaim readiness."
            : "السحابة المُدارة متاحة اليوم. الخاص والمعزول قيد التخطيط أو استراتيجي — لا نبالغ في الجاهزية."
        }
        actions={
          <>
            <Link href={residencyPdf} className="btn-primary h-11 px-6">
              {locale === "en" ? "Data residency (PDF)" : "إقامة البيانات (PDF)"}
            </Link>
            <ScheduleDiagnosticCta locale={locale} variant="outline" />
          </>
        }
      />

      <section className="border-t py-14">
        <div className="mx-auto max-w-5xl space-y-5 px-6">
          {models.map((model) => (
            <article
              key={model.id}
              className="rounded-2xl border border-border/60 bg-background p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-black">{model.name}</h2>
                <span className={cn("text-xs font-semibold", toneClass[model.statusTone])}>
                  {model.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{model.summary}</p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {model.highlights.map((h) => (
                  <li key={h} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-primary">·</span>
                    {h}
                  </li>
                ))}
              </ul>
              {model.note && (
                <p className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs leading-6 text-muted-foreground">
                  {model.note}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/10 py-10">
        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-3 px-6">
          <Link href={securityHref} className="btn-outline h-11 px-6">
            {locale === "en" ? "Security overview" : "ملخص الأمن"}
          </Link>
          <Link href={startHref} className="btn-outline h-11 px-6">
            {locale === "en" ? "Engagement models" : "نماذج التعاون"}
          </Link>
        </div>
      </section>

      <ConversionBand
        title={
          locale === "en"
            ? "Discuss deployment scope"
            : "ناقش نطاق النشر"
        }
        primaryHref={locale === "en" ? "/en/contact" : "/contact"}
        secondaryHref={securityHref}
        secondaryLabel={locale === "en" ? "Security" : "الأمن"}
      />
    </div>
  );
}
