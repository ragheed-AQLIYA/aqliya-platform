import Link from "next/link";
import type { Metadata } from "next";
import { buyerJourneys } from "@/lib/marketing/buyer-journeys";
import { DemoVideoSection } from "@/components/marketing/demo-video-section";
import { ConversionBand } from "@/components/marketing/v2/marketing-shell";
import {
  deploymentOptions,
  evidenceSamples,
  executiveBriefLayers,
  governancePrinciples,
  outcomesFutureMetrics,
  pilotDecisionOutcomes,
  proofDimensions,
  proofScenarios,
} from "@/lib/marketing/proof-hub-content";
import { publicEngagementGate } from "@/lib/marketing/public-status";

export const metadata: Metadata = {
  title: "الإثبات | AQLIYA",
  description:
    "مركز إثبات موحّد: ديمو، ملخص تنفيذي، إطار تقييم تشغيلي، مكتبة مخرجات، وأمن — قبل أي التزام.",
};

const anchorNav = [
  { id: "demo", label: "الديمو" },
  { id: "executive-brief", label: "ملخص تنفيذي" },
  { id: "evaluation-framework", label: "إطار التقييم" },
  { id: "evidence-samples", label: "مكتبة الأدلة" },
  { id: "outcomes", label: "النتائج" },
  { id: "procurement", label: "المشتريات" },
];

const externalLinks = [
  { label: "حزمة المشتريات", href: "/procurement-pack" },
  { label: "الأمن والنشر", href: "/security" },
  { label: "دراسات الحالة", href: "/case-studies" },
  { label: "من أين تبدأ", href: "/start" },
];

export default function ProofCenterPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              Proof Center
            </span>
            <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">
              مركز الإثبات
            </h1>
            <p className="mt-4 text-lg leading-8 text-white/60">
              كل ما تحتاجه لتقييم عقلية في مكان واحد — ديمو، وثائق، معايير،
              ومخرجات تجريبية. {publicEngagementGate}
            </p>
            <p className="mt-2 text-sm text-white/40">
              بيانات تجريبية فقط — لا بيانات عملاء حقيقيين.
            </p>
          </div>
        </div>
      </section>

      <section className="sticky top-14 z-40 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-2 px-6 py-3">
          {anchorNav.map((a) => (
            <a
              key={a.id}
              href={`#${a.id}`}
              className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:border-primary/40 hover:text-primary"
            >
              {a.label}
            </a>
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/10 py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap justify-center gap-2">
            {buyerJourneys.map((j) => (
              <Link
                key={j.id}
                href={`/start#${j.id}`}
                className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs hover:border-primary/30"
              >
                {j.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Demo */}
      <section id="demo" className="scroll-mt-28 border-t">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="text-2xl font-black">الديمو التفاعلي</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            مسار تشغيلي كامل ١٠–١٣ دقيقة على بيانات تجريبية — بدون تسجيل.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/demo" className="btn-primary h-10 px-6 text-sm">
              ابدأ الديمو
            </Link>
            <Link href="/auditos" className="btn-outline h-10 px-6 text-sm">
              مسار AuditOS المباشر
            </Link>
          </div>
        </div>
        <DemoVideoSection locale="ar" />
      </section>

      {/* Executive brief */}
      <section id="executive-brief" className="scroll-mt-28 border-t bg-muted/10">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="text-2xl font-black">الملخص التنفيذي</h2>
          <p className="mt-2 text-sm text-muted-foreground">٥ دقائق للقيادة</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {executiveBriefLayers.map((layer) => (
              <div key={layer.name} className="rounded-xl border border-border/60 bg-background p-5">
                <h3 className="font-bold">{layer.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{layer.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {governancePrinciples.map((p) => (
              <div key={p.title} className="rounded-xl border border-primary/15 bg-primary/[0.03] p-5">
                <h3 className="text-sm font-bold text-primary">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 space-y-3">
            {deploymentOptions.map((d) => (
              <div
                key={d.name}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-border/50 px-4 py-3 text-sm"
              >
                <span className="font-semibold">{d.name}</span>
                <span className="text-muted-foreground">{d.status}</span>
                <span className="w-full text-xs text-muted-foreground/80">{d.note}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/print/executive-brief" target="_blank" className="btn-outline h-10 px-5 text-sm">
              PDF للطباعة
            </Link>
            <Link href="/en/proof#executive-brief" className="btn-outline h-10 px-5 text-sm">
              English brief
            </Link>
          </div>
        </div>
      </section>

      {/* Evaluation framework */}
      <section id="evaluation-framework" className="scroll-mt-28 border-t">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="text-2xl font-black">إطار التقييم التشغيلي</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            ستة أبعاد + سيناريوهات قابلة للتحقق في الديمو
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {proofDimensions.map((d) => (
              <div key={d.dimension} className="rounded-xl border border-border/60 p-4">
                <h3 className="text-sm font-bold">{d.dimension}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d.question}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 space-y-3">
            {proofScenarios.map((s) => (
              <div key={s.title} className="rounded-xl border border-border/60 p-4">
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-primary">{s.verifiable}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {pilotDecisionOutcomes.map((o) => (
              <div key={o.outcome} className="rounded-xl border border-border/60 p-4 text-sm">
                <p className="font-bold">{o.outcome}</p>
                <p className="mt-1 text-muted-foreground">{o.detail}</p>
              </div>
            ))}
          </div>
          <Link href="/start#engagement" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
            نماذج التعاون والتقييم المجاني ←
          </Link>
        </div>
      </section>

      {/* Evidence samples */}
      <section id="evidence-samples" className="scroll-mt-28 border-t bg-muted/10">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="text-2xl font-black">مكتبة الأدلة</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            نماذج مخرجات على بيانات تجريبية — للمراجعة لا للاعتماد النهائي
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {evidenceSamples.map((sample) => (
              <div key={sample.id} className="rounded-xl border border-border/60 bg-background p-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {sample.category}
                </p>
                <h3 className="mt-1 font-bold">{sample.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{sample.highlight}</p>
                <span className="mt-3 inline-block text-[10px] text-amber-600">بيانات تجريبية</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section id="outcomes" className="scroll-mt-28 border-t">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="text-2xl font-black text-center">نتائج التقييم التشغيلي</h2>
          <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 text-center">
            <p className="text-sm font-semibold text-amber-700">الحالة الحالية</p>
            <p className="mt-2 text-xl font-black">مراجع مؤسسية قيد الإعداد للنشر</p>
            <p className="mt-3 text-sm text-muted-foreground">
              لا أرقام وهمية. النتائج المقاسة تُنشر هنا عند اكتمال أول تقييم تشغيلي مع قرار بالأدلة.
            </p>
          </div>
          <ul className="mt-8 space-y-2">
            {outcomesFutureMetrics.map((m) => (
              <li key={m} className="rounded-lg border border-border/60 px-4 py-3 text-sm text-muted-foreground">
                {m}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Procurement + external */}
      <section id="procurement" className="scroll-mt-28 border-t bg-muted/10">
        <div className="mx-auto max-w-7xl px-6 py-14 text-center">
          <h2 className="text-xl font-black">موارد إضافية</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {externalLinks.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="rounded-full border border-border/60 bg-background px-4 py-2 text-sm hover:border-primary/30"
              >
                {r.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ConversionBand />
    </div>
  );
}
