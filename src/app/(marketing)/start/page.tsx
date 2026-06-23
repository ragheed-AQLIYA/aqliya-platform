import Link from "next/link";
import type { Metadata } from "next";
import {
  buyerJourneys,
  universalJourneySteps,
} from "@/lib/marketing/buyer-journeys";
import { publicEngagementGate } from "@/lib/marketing/public-status";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";

export const metadata: Metadata = {
  title: "من أين تبدأ؟ | AQLIYA",
  description:
    "اختر دورك — قيادة، مالية، تقنية، تدقيق، مشتريات، أو حكومة — واحصل على مسار واضح للإثبات والتواصل.",
};

export default function StartPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-22">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              مسار المشتري
            </span>
            <h1 className="mt-5 text-4xl font-black text-white sm:text-5xl">
              من أين تبدأ مع عقلية؟
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/60">
              لا نطلب الإيمان بالكلام. اختر دورك — نرشدك إلى المحتوى المناسب
              خلال دقائق، ثم تقرر بالأدلة.
            </p>
            <p className="mt-3 text-sm font-medium text-aqliya-cyan/90">
              {publicEngagementGate}
            </p>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/10 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-black text-foreground sm:text-3xl">
              اختر دورك
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              كل مسار: ٣ خطوات محتوى → ثم جلسة تشخيص عند الجاهزية.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {buyerJourneys.map((journey) => (
              <div
                key={journey.id}
                id={journey.id}
                className="rounded-2xl border border-border/60 bg-background p-6 sm:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-black text-foreground">
                      {journey.label}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      {journey.subtitle}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {journey.hook}
                </p>

                <ol className="mt-6 space-y-3">
                  {journey.steps.map((step, i) => (
                    <li key={step.href} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={step.href}
                          className="text-sm font-semibold text-foreground hover:text-primary"
                        >
                          {step.label}
                        </Link>
                        <span className="mr-2 text-xs text-muted-foreground">
                          · {step.time}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={journey.primaryCta.href}
                    className="btn-primary h-10 px-5 text-sm"
                  >
                    {journey.primaryCta.label}
                  </Link>
                  {journey.secondaryCta && (
                    <Link
                      href={journey.secondaryCta.href}
                      className="btn-outline h-10 px-5 text-sm"
                    >
                      {journey.secondaryCta.label}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-gradient-light border-t py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-black text-foreground sm:text-3xl">
              رحلة التعاون الموحّدة
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              نفس المنهجية لكل دور — من التشخيص إلى التوسع.
            </p>
          </div>

          <div className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-4">
            {universalJourneySteps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <Link
                  href={step.href}
                  className="rounded-xl border border-border/60 bg-background px-4 py-3 text-center transition-colors hover:border-primary/30"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {i + 1}
                  </p>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {step.time}
                  </p>
                </Link>
                {i < universalJourneySteps.length - 1 && (
                  <span className="hidden text-muted-foreground/40 sm:inline">
                    ←
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <ScheduleDiagnosticCta locale="ar" />
            <Link href="/proof" className="btn-outline h-11 px-6">
              مركز الإثبات
            </Link>
            <Link href="/use-cases" className="btn-outline h-11 px-6">
              حالات الاستخدام
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
