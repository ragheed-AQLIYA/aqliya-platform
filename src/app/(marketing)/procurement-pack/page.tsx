import Link from "next/link";
import type { Metadata } from "next";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";
import { BOOKING_EMAIL } from "@/lib/marketing/booking";
import { procurementPackItems } from "@/lib/marketing/procurement-pack-items";

export const metadata: Metadata = {
  title: "حزمة التقييم للمشتريات | AQLIYA",
  description:
    "وثائق جاهزة لفريق المشتريات والأمن: ملخص تنفيذي، أمن، DPA، إقامة بيانات، نموذج تجربة، ومواد الإثبات.",
};

export default function ProcurementPackPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
            Procurement Evaluation Pack
          </p>
          <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">
            حزمة التقييم للمشتريات
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/60">
            كل ما يحتاجه فريق المشتريات، الأمن، والتقنية لتقييم عقلية — في
            مكان واحد، بصدق كامل حول الجاهزية والحدود.
          </p>
          <p className="mt-4 text-sm text-white/45">
            جهة اتصال تجارية:{" "}
            <a href={`mailto:${BOOKING_EMAIL}`} className="text-aqliya-cyan underline">
              {BOOKING_EMAIL}
            </a>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {procurementPackItems.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-border/60 bg-background p-6"
            >
              <h2 className="text-base font-black text-foreground">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.body}
              </p>
              <Link
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="btn-outline mt-4 inline-flex h-10 items-center px-5 text-sm"
              >
                {item.cta}
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <h2 className="text-xl font-black text-foreground">
            تحتاج جلسة تقنية أو تشخيص؟
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            نرتب جلسة مع الفريق الهندسي أو جلسة تشخيص تنفيذية حسب سياقكم.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <ScheduleDiagnosticCta />
            <Link href="/contact" className="btn-outline h-11 px-6">
              نموذج التواصل
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
