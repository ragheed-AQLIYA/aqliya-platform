import Link from "next/link";
import type { Metadata } from "next";
import {
  soc2HonestDisclaimerAr,
  soc2RoadmapMilestones,
} from "@/lib/marketing/soc2-roadmap";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";

export const metadata: Metadata = {
  title: "خارطة SOC2 | AQLIYA",
  description:
    "خارطة طريق SOC2 Type I بمواعيد مستهدفة — بدون ادعاء شهادة. شفافية للمشتريات والأمن.",
};

const statusLabel: Record<string, string> = {
  done: "مكتمل",
  in_progress: "قيد التنفيذ",
  planned: "مخطط",
};

const statusColor: Record<string, string> = {
  done: "text-emerald-400",
  in_progress: "text-cyan-400",
  planned: "text-slate-400",
};

export default function Soc2RoadmapPage() {
  return (
    <div className="min-h-screen bg-aqliya-deep" dir="rtl">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Trust Roadmap
          </p>
          <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">
            خارطة SOC2 — أهداف، لا شهادات
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            {soc2HonestDisclaimerAr}
          </p>
          <p className="mt-4 text-sm text-slate-500">
            آخر مراجعة: يونيو 2026 · نُحدّث عند تغيّر material milestones
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="space-y-6">
          {soc2RoadmapMilestones.map((m) => (
            <article
              key={m.quarter}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-black text-white">{m.quarter}</span>
                <span className={`text-xs font-semibold ${statusColor[m.status]}`}>
                  {statusLabel[m.status]}
                </span>
              </div>
              <h2 className="mt-2 text-lg font-bold text-white">{m.title}</h2>
              <ul className="mt-4 space-y-2">
                {m.items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-slate-300">
                    <span className="text-cyan-500 shrink-0">◦</span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
          <h2 className="text-base font-bold text-amber-200">ما هو متاح اليوم</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>• RBAC، سجل تدقيق، evidence graph، عزل المستأجرين — مُنفَّذ في المنصة</li>
            <li>• ملخص أمن PDF + جلسة تقنية مفتوحة</li>
            <li>• حزمة مشتريات كاملة —{" "}
              <Link href="/procurement-pack" className="text-cyan-400 underline">
                /procurement-pack
              </Link>
            </li>
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/print/security-summary" target="_blank" className="btn-outline px-6 py-3">
            ملخص الأمن (PDF)
          </Link>
          <ScheduleDiagnosticCta variant="outline" />
          <Link href="/en/soc2-roadmap" className="text-sm text-cyan-400 underline">
            English version →
          </Link>
        </div>
      </section>
    </div>
  );
}
