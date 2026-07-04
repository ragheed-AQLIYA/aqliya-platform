import Link from "next/link";
import type { Metadata } from "next";
import { ConversionBand } from "@/components/marketing/v2/marketing-shell";
import { homeCopyAr } from "@/lib/marketing/copy-plain";
import { publicCapabilityNote, publicOsStatus } from "@/lib/marketing/public-status";

export const metadata: Metadata = {
  title: homeCopyAr.metadata.title,
  description: homeCopyAr.metadata.description,
};

const systems = [
  {
    title: "AuditOS",
    note: publicCapabilityNote.auditOS,
    status: publicOsStatus.auditOS.label,
    href: "/products/audit",
  },
  {
    title: "LocalContentOS",
    note: publicCapabilityNote.localContentOS,
    status: publicOsStatus.localContentOS.label,
    href: "/products/local-content",
  },
  {
    title: "DecisionOS",
    note: "بدائل، معايير، مخاطر، وتوصية — كل قرار موثّق.",
    status: publicOsStatus.decisionOS.label,
    href: "/products/decision",
  },
  {
    title: "SalesOS",
    note: publicCapabilityNote.salesOS,
    status: publicOsStatus.salesOS.label,
    href: "/products/sales",
  },
];

const platformLayers = [
  {
    num: "01",
    title: "الحوكمة",
    desc: "الصلاحيات، سجل التدقيق، بوابات الاعتماد — كل حدث مُوثَّق",
  },
  {
    num: "02",
    title: "قاعدة المعرفة",
    desc: "كل مخرج مرتبط بمصدره — شبكة أدلة غير قابلة للكسر",
  },
  {
    num: "03",
    title: "مشغّلات الذكاء",
    desc: "AI يُساعد ويقترح — لا يقرّر ولا يعتمد بدون الإنسان",
  },
  {
    num: "04",
    title: "أنظمة التشغيل",
    desc: "كل نظام يرث الحوكمة والذكاء — لا إعادة بناء من الصفر",
  },
];

export default function HomePage() {
  const c = homeCopyAr;

  return (
    <div className="flex flex-col">
      {/* ─── Hero ────────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto max-w-7xl px-6 py-18 sm:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              {c.hero.eyebrow}
            </span>
            <h1 className="mt-6 text-4xl font-black leading-[1.08] text-white sm:text-5xl">
              {c.hero.title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/65">
              {c.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="btn-primary h-12 px-8 text-base font-bold"
              >
                {c.ctas.contact}
              </Link>
              <Link
                href="/platform"
                className="btn-outline border-white/15 text-white/70 h-12 px-8 text-base hover:bg-white/5"
              >
                {c.ctas.demo}
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {c.personaChips.map((chip) => (
                <Link
                  key={chip.href}
                  href={chip.href}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/55 hover:border-aqliya-cyan/30 hover:text-white/80"
                >
                  {chip.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Problem ──────────────────────────────── */}
      <section className="border-t bg-muted/10">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-18">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-black text-foreground sm:text-3xl">
              {c.problem.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {c.problem.subtitle}
            </p>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <ul className="space-y-3 rounded-2xl border border-border/60 bg-background p-6">
              {c.problem.tools.map((t) => (
                <li key={t.name} className="text-sm">
                  <span className="font-semibold text-foreground">{t.name}</span>
                  <span className="text-muted-foreground"> — {t.line}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl border border-primary/15 bg-primary/[0.03] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                {c.problem.pathLabel}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {c.problem.pathSteps.map((step, i) => (
                  <span key={step} className="flex items-center gap-2 text-sm font-medium">
                    {i > 0 && <span className="text-muted-foreground/40">←</span>}
                    {step}
                  </span>
                ))}
              </div>
              <Link href="/use-cases" className="mt-5 inline-block text-sm font-medium text-primary hover:underline">
                {c.problem.pathCta} ←
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Why Platform ─────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-14 sm:py-18">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              لماذا منصة لا أداة؟
            </span>
            <h2 className="mt-6 text-2xl font-black text-foreground sm:text-3xl">
              الأداة تحل مشكلة — المنصة تُنظّم المؤسسة
            </h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-background to-red-500/[0.03] p-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-red-600/80">أداة ذكاء منفصلة</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-500/50" />مخرجات بدون مسار مراجعة أو اعتماد</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-500/50" />كل نطاق جديد يحتاج أداة جديدة من الصفر</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-500/50" />صلاحيات وأدلة تُدار خارج النظام أو لا تُدار</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-background to-emerald-500/[0.04] p-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600/80">منصة عقلية</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/50" />كل مخرج يمر بحوكمة وأدلة قبل الاعتماد</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/50" />كل نظام يرث الحوكمة والذكاء من منصة واحدة</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/50" />صلاحيات وأدلة جزء من بنية المنصة — لا إدارة منفصلة</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── The 4 Layers ──────────────────────────── */}
      <section className="section-gradient-light border-t">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-18">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-black text-foreground sm:text-3xl">
              بنية المنصة — أربع طبقات متراصة
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              كل طبقة تخدم التي تعلوها. كل نظام تشغيل يستفيد من الثلاث طبقات تحته دون تكرار.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            {platformLayers.map((layer, i) => (
              <div key={layer.num} className="rounded-xl border border-border/60 bg-background p-5 text-center">
                <span className="text-[10px] font-bold text-primary">{layer.num}</span>
                <h3 className="mt-1 text-sm font-black text-foreground">{layer.title}</h3>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">{layer.desc}</p>
                {i < platformLayers.length - 1 && (
                  <div className="mt-3 text-[10px] text-muted-foreground/50" aria-hidden>↑</div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/platform" className="text-sm font-medium text-primary hover:underline">
              تعمّق في بنية المنصة ←
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Operating Systems ─────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-14 sm:py-18">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-black text-foreground sm:text-3xl">
            {c.systems.title}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">{c.systems.subtitle}</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {systems.map((sys) => (
            <Link
              key={sys.title}
              href={sys.href}
              className="group rounded-2xl border border-border/60 bg-background p-5 transition-colors hover:border-primary/30"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                {sys.status}
              </p>
              <h3 className="mt-2 text-lg font-black group-hover:text-primary">
                {sys.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{sys.note}</p>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/products" className="btn-outline h-10 px-6 text-sm">
            {c.systems.ctaAll}
          </Link>
        </div>
      </section>

      {/* ─── Proof ──────────────────────────────────── */}
      <section className="border-t bg-muted/10">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-18">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-black text-foreground sm:text-3xl">
              {c.proof.title}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">{c.proof.subtitle}</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {c.proof.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-border/60 p-5 transition-colors hover:border-primary/25"
              >
                <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">{item.body}</p>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/proof" className="text-sm font-medium text-primary hover:underline">
              {c.proof.ctaFull} ←
            </Link>
          </div>
        </div>
      </section>

      <ConversionBand
        title={c.conversion.title}
        body={c.conversion.body}
        primaryLabel={c.conversion.primaryLabel}
        secondaryLabel={c.conversion.secondaryLabel}
      />
    </div>
  );
}
