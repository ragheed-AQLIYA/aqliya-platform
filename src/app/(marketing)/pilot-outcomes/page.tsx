import Link from "next/link";
import type { Metadata } from "next";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";

export const metadata: Metadata = {
  title: "نتائج البايلوت | AQLIYA",
  description:
    "مقاييس مجمّعة من بايلوتات التقييم — تُنشر بصدق عند اكتمال بايلوتين أو أكثر. لا أرقام وهمية.",
};

const futureMetrics = [
  "وقت الإغلاق / cycle time (قبل ↔ بعد — مقاس)",
  "اكتمال سلسلة الأدلة (% بنود مرتبطة)",
  "بوابات Human Gate passed vs blocked",
  "ثقة الشريك في الاعتماد (استبيان نوعي)",
  "قرار Go/No-Go (Proceed / Revise / Stop)",
];

export default function PilotOutcomesPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-4xl font-black text-white sm:text-5xl">
            نتائج البايلوت
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/60">
            لا ننشر مقاييس مجمّعة قبل أن تكون <strong className="text-white">مقاسة</strong>{" "}
            من بايلوتات حقيقية. هذه الصفحة placeholder صادق — تُملأ عند ≥2 بايلوت
            مكتمل مع Go/No-Go.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 text-center">
          <p className="text-sm font-semibold text-amber-200">الحالة الحالية</p>
          <p className="mt-3 text-2xl font-black text-foreground">
            لا مقاييس مجمّعة منشورة بعد
          </p>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            لا شعارات عملاء وهمية. لا نسب توفير غير موثقة. عند أول مرجع بايلوت
            مكتوب — يظهر هنا أو في{" "}
            <Link href="/case-studies" className="text-primary underline">
              دراسات الحالة
            </Link>
            .
          </p>
        </div>

        <h2 className="mt-12 text-lg font-black text-foreground">
          ما سنقيس وننشره (عند الجاهزية)
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
            إطار البايلوت
          </Link>
          <Link
            href="/print/pilot-weekly-metrics"
            target="_blank"
            className="btn-outline h-11 px-6"
          >
            قالب metrics أسبوعي (PDF)
          </Link>
          <Link
            href="/print/reference-case-template"
            target="_blank"
            className="btn-outline h-11 px-6"
          >
            قالب مرجع بايلوت (PDF)
          </Link>
          <ScheduleDiagnosticCta />
        </div>
      </section>
    </div>
  );
}
