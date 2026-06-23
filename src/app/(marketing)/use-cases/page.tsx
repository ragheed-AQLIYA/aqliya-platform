import Link from "next/link";
import type { Metadata } from "next";
import { institutionalUseCases } from "@/lib/marketing/institutional-use-cases";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";

export const metadata: Metadata = {
  title: "حالات الاستخدام المؤسسية | AQLIYA",
  description:
    "سبعة مسارات تشغيلية حقيقية: التدقيق، القرارات، المحتوى المحلي، الامتثال، والمعرفة المؤسسية — المشكلة، الوضع التقليدي، ومسار عقلية.",
};

export default function UseCasesPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-22">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              حالات الاستخدام
            </span>
            <h1 className="mt-5 text-4xl font-black text-white sm:text-5xl">
              أين يُحدث عقلية فارقاً فعلياً؟
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/60">
              ليست قائمة ميزات — مسارات تشغيلية تُفعَّل فوق منصة واحدة. كل
              حالة: المشكلة كما هي، الوضع التقليدي بصدق، وما يتغيّر مع مسار
              محكوم بأدلة.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/start" className="btn-primary h-11 px-6">
                من أين تبدأ؟
              </Link>
              <Link
                href="/products"
                className="btn-outline border-white/15 text-white/70 h-11 px-6"
              >
                أنظمة التشغيل
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-gradient-dark border-t border-white/5 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mt-4 max-w-6xl space-y-6">
            {institutionalUseCases.map((uc) => (
              <div
                key={uc.id}
                className={`rounded-[24px] border ${uc.categoryBorder} ${uc.categoryBg} p-6 sm:p-8`}
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${uc.categoryColor}`}
                    >
                      {uc.category}
                    </span>
                    <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">
                      {uc.title}
                    </h2>
                  </div>
                  <span className="text-2xl text-white/10">{uc.icon}</span>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-4">
                    <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-red-400">
                      المشكلة
                    </p>
                    <p className="text-sm leading-7 text-white/65">{uc.problem}</p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                    <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/40">
                      الوضع التقليدي
                    </p>
                    <p className="text-sm leading-7 text-white/55">
                      {uc.traditionalState}
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4">
                    <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
                      مسار عقلية
                    </p>
                    <p className="text-sm leading-7 text-white/65">
                      {uc.aqliyaApproach}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.025] p-4">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-aqliya-cyan">
                      الأثر المؤسسي
                    </p>
                    <p className="mt-1 text-sm text-white/70">{uc.outcome}</p>
                  </div>
                  <Link
                    href={uc.systemLink}
                    className="btn-outline shrink-0 px-4 py-2 text-sm"
                  >
                    {uc.systemLabel}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-4xl rounded-2xl border border-white/8 bg-white/[0.025] p-8 text-center">
            <p className="text-sm font-semibold text-white/60">
              تحفظ مؤسسي ثابت
            </p>
            <p className="mt-2 text-base font-black text-white">
              الذكاء يساعد. الإنسان يقرر. الدليل يحكم.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ScheduleDiagnosticCta locale="ar" />
              <Link href="/proof" className="btn-outline h-11 px-6">
                مركز الإثبات
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
