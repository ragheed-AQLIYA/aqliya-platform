import Link from "next/link";
import type { Metadata } from "next";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";

export const metadata: Metadata = {
  title: "نتائج التقييم التشغيلي | AQLIYA",
  description:
    "مقاييس مجمّعة من تقييمات تشغيلية مؤسسية — تُنشر عند اكتمال مراجع موثقة. لا أرقام وهمية.",
};

const futureMetrics = [
  "وقت الإغلاق / cycle time (قبل ↔ بعد — مقاس)",
  "اكتمال سلسلة الأدلة (% بنود مرتبطة)",
  "بوابات المراجعة البشرية — مكتملة مقابل محجوبة",
  "ثقة المعتمد في القرار (استبيان نوعي)",
  "قرار بالأدلة (متابعة / مراجعة / إيقاف)",
];

export default function PilotOutcomesPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-4xl font-black text-white sm:text-5xl">
            نتائج التقييم التشغيلي
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/60">
            لا ننشر مقاييس مجمّعة قبل أن تكون{" "}
            <strong className="text-white">مقاسة</strong> من تقييمات تشغيلية
            مؤسسية مكتملة مع قرار بالأدلة.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 text-center">
          <p className="text-sm font-semibold text-amber-200">الحالة الحالية</p>
          <p className="mt-3 text-2xl font-black text-foreground">
            مراجع مؤسسية قيد الإعداد للنشر
          </p>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            لا شعارات عملاء وهمية. لا نسب توفير غير موثقة. المراجع المؤسسية
            المكتملة تظهر هنا أو في{" "}
            <Link href="/case-studies" className="text-primary underline">
              دراسات الحالة
            </Link>
            .
          </p>
        </div>

        <h2 className="mt-12 text-lg font-black text-foreground">
          ما سنقيس وننشره
        </h2>
        <ul className="mt-4 space-y-2">
          {futureMetrics.map((m) => (
            <li
              key={m}
              className="rounded-lg border border-border/60 px-4 py-3 text-sm text-muted-foreground"
            >
              {m}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/pilot-proof" className="btn-outline h-11 px-6">
            إطار التقييم التشغيلي
          </Link>
          <Link
            href="/print/pilot-weekly-metrics"
            target="_blank"
            className="btn-outline h-11 px-6"
          >
            قالب مقاييس أسبوعية (PDF)
          </Link>
          <Link
            href="/print/reference-case-template"
            target="_blank"
            className="btn-outline h-11 px-6"
          >
            قالب مرجع مؤسسي (PDF)
          </Link>
          <ScheduleDiagnosticCta />
        </div>
      </section>
    </div>
  );
}
