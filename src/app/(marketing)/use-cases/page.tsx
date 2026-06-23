import Link from "next/link";
import type { Metadata } from "next";
import { tier1InstitutionalUseCases } from "@/lib/marketing/institutional-use-cases";
import { ConversionBand, MarketingPageShell } from "@/components/marketing/v2/marketing-shell";

export const metadata: Metadata = {
  title: "حالات الاستخدام المؤسسية | AQLIYA",
  description:
    "أربعة مسارات تشغيلية رئيسية: التدقيق، القرارات، المحتوى المحلي، والجاهزية التنظيمية — المشكلة، الوضع التقليدي، ومسار عقلية.",
};

export default function UseCasesPage() {
  return (
    <div className="flex flex-col">
      <MarketingPageShell
        eyebrow="حالات الاستخدام"
        title="أين يُحدث عقلية فارقاً فعلياً؟"
        subtitle="أربعة مسارات Tier-1 — ليست قائمة ميزات. كل حالة: مشكلة، وضع تقليدي، ومسار محكوم بأدلة."
        actions={
          <>
            <Link href="/start" className="btn-primary h-11 px-6">
              من أين تبدأ؟
            </Link>
            <Link href="/products" className="btn-outline h-11 px-6">
              أنظمة التشغيل
            </Link>
          </>
        }
      />

      <section className="border-t bg-muted/10 py-14">
        <div className="mx-auto max-w-4xl space-y-6 px-6">
          {tier1InstitutionalUseCases.map((uc) => (
            <article
              key={uc.id}
              className={`rounded-2xl border ${uc.categoryBorder} ${uc.categoryBg} p-6 sm:p-8`}
            >
              <p className={`text-[10px] font-semibold uppercase tracking-wider ${uc.categoryColor}`}>
                {uc.category}
              </p>
              <h2 className="mt-1 text-xl font-black">{uc.title}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-red-500/15 bg-red-500/5 p-3">
                  <p className="text-[9px] font-semibold uppercase text-red-400">المشكلة</p>
                  <p className="mt-1 text-sm leading-7 text-muted-foreground">{uc.problem}</p>
                </div>
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-[9px] font-semibold uppercase text-muted-foreground">
                    الوضع التقليدي
                  </p>
                  <p className="mt-1 text-sm leading-7 text-muted-foreground">
                    {uc.traditionalState}
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-3">
                  <p className="text-[9px] font-semibold uppercase text-emerald-600">
                    مسار عقلية
                  </p>
                  <p className="mt-1 text-sm leading-7 text-muted-foreground">
                    {uc.aqliyaApproach}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm font-medium">{uc.outcome}</p>
              <Link href={uc.systemLink} className="btn-outline mt-4 inline-flex h-10 px-5 text-sm">
                {uc.systemLabel}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <ConversionBand
        secondaryHref="/proof"
        secondaryLabel="مركز الإثبات"
      />
    </div>
  );
}
