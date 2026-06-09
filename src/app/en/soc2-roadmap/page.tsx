import Link from "next/link";
import type { Metadata } from "next";
import {
  soc2HonestDisclaimerEn,
  soc2RoadmapMilestones,
} from "@/lib/marketing/soc2-roadmap";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";

export const metadata: Metadata = {
  title: "SOC2 Roadmap | AQLIYA",
  description:
    "Target SOC2 Type I roadmap with honest status — not a certification claim.",
};

const statusLabel: Record<string, string> = {
  done: "Complete",
  in_progress: "In progress",
  planned: "Planned",
};

export default function EnglishSoc2RoadmapPage() {
  return (
    <div className="min-h-screen bg-aqliya-deep" dir="ltr">
      <section className="hero-gradient py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-black text-white sm:text-5xl">
            SOC2 Roadmap — Targets, not certificates
          </h1>
          <p className="mt-6 text-lg text-slate-300">{soc2HonestDisclaimerEn}</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 space-y-6">
        {soc2RoadmapMilestones.map((m) => (
          <article
            key={m.quarter}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          >
            <div className="flex justify-between gap-2">
              <span className="font-black text-white">{m.quarter}</span>
              <span className="text-xs font-semibold text-cyan-400">
                {statusLabel[m.status]}
              </span>
            </div>
            <h2 className="mt-2 text-lg font-bold text-white">{m.titleEn}</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {m.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </article>
        ))}

        <div className="flex flex-wrap justify-center gap-4 pt-6">
          <Link href="/procurement-pack" className="btn-outline px-6 py-3">
            Procurement pack
          </Link>
          <ScheduleDiagnosticCta locale="en" variant="outline" />
          <Link href="/soc2-roadmap" className="text-sm text-cyan-400 underline">
            العربية →
          </Link>
        </div>
      </section>
    </div>
  );
}
