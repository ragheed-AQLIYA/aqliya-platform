import Link from "next/link";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import {
  AuditTraceVisual,
  DecisionMatrixVisual,
  LocalContentMapVisual,
  CustomWorkflowBuilderVisual,
} from "@/components/visuals";

export const metadata: Metadata = {
  title: "الأنظمة | AQLIYA",
  description:
    "أنظمة مؤسسية مبنية على AQLIYA Intelligence Core. ثلاثة أنظمة نشطة، خطوط استراتيجية مخططة، وقدرة مخصصة — كل شيء داخل منطق حوكمة واحد.",
};

// Tier 1: Operational systems — proven/active
const tier1Systems = [
  {
    id: "auditos",
    title: "AuditOS",
    subtitle: "نظام التدقيق والذكاء المالي",
    maturity: "L5 — Pilot-Ready",
    statusLabel: "نشط — جاهز للتجريب",
    problem:
      "بيانات مالية متفرقة، تصنيفات يدوية، أدلة غير مرتبطة، ومراجعة يصعب تتبعها.",
    system:
      "أول تطبيق مُثبت على AQLIYA Intelligence Core. يربط البيانات المالية بالتصنيف الذكي، القوائم، الأدلة، الملاحظات، ومسار المراجعة الكامل من المصدر حتى الاعتماد البشري.",
    output: "مخرجات مراجعة منظمة وقابلة للتتبع الكامل — كل قرار مرتبط بمصدره.",
    flow: ["بيانات", "تصنيف", "مخرجات", "أدلة", "مراجعة", "اعتماد"],
    highlights: [
      "مسار أدلة كامل",
      "اعتماد بشري إلزامي",
      "سجل تدقيق لا يُعدَّل",
    ],
    href: "/products/audit",
    visual: AuditTraceVisual,
    proofNote: "أول تطبيق مُثبت — قائم ومُختبر",
  },
  {
    id: "decisionos",
    title: "DecisionOS",
    subtitle: "نظام حوكمة القرارات",
    maturity: "L4 — Usable v0.1",
    statusLabel: "نشط — v0.1",
    problem:
      "قرارات مهمة تُبنى على نقاشات متفرقة، ملفات متعددة، ومعايير غير موحدة.",
    system:
      "يحوّل القرار المؤسسي إلى مسار محكوم: بدائل موثقة، معايير مقيّمة، مخاطر مُحللة، توصية ذكاء اصطناعي، واعتماد بشري نهائي.",
    output: "مذكرة قرار موثقة كاملة — قابلة للمراجعة والتدقيق في أي وقت.",
    flow: ["مشكلة", "بدائل", "معايير", "مخاطر", "توصية", "اعتماد"],
    highlights: [
      "توصية AI مع مسوّغات",
      "كل قرار مرتبط بأدلته",
      "مسار لا يقبل التعديل بعد الاعتماد",
    ],
    href: "/products/decision",
    visual: DecisionMatrixVisual,
    proofNote: "نشط — نظام مجاور في الإنتاج",
  },
  {
    id: "localcontentos",
    title: "LocalContentOS",
    subtitle: "نظام المحتوى المحلي",
    maturity: "L5 — Pilot-ready بشروط",
    statusLabel: "نشط — Pilot-ready (12 مسار)",
    problem:
      "بيانات موردين، إنفاق، التزام، وتصنيفات موزعة بين فرق ومصادر متعددة.",
    system:
      "يربط الموردين بالإنفاق، التصنيف، نسب الالتزام، والفجوات. 12 مسار تشغيلي جاهزة. يُنشر بالتنسيق مع الجهة لضمان جودة البيانات وتحديد نطاق البايلوت.",
    output: "رؤية واضحة لمؤشرات المحتوى المحلي وأثر القرارات الشرائية.",
    flow: ["موردون", "إنفاق", "تصنيف", "فجوات", "مؤشرات", "تقارير"],
    highlights: [
      "12 مسار تشغيلي جاهز",
      "ربط المورد بالإنفاق الفعلي",
      "مؤشرات الالتزام تلقائياً",
    ],
    href: "/products/local-content",
    visual: LocalContentMapVisual,
    proofNote: "v0.1 جاهز — النشر بالتنسيق مع الجهة",
  },
];

// Tier 2: Strategic systems — honest about development stage
const tier2Systems = [
  {
    id: "salesos",
    title: "SalesOS",
    subtitle: "نظام الذاكرة التجارية",
    maturity: "L4 — قيد التطوير",
    statusLabel: "قيد التطوير",
    problem:
      "فرص غير مؤهلة، أولويات غير واضحة، متابعة عشوائية، وتعلم ضعيف من الحملات.",
    outline:
      "نظام ذاكرة تجارية محكومة قيد التطوير، يستكشف التأهيل، الترتيب، المتابعة، والتعلم المؤسسي.",
    flow: ["ICP", "تأهيل", "ترتيب", "تواصل", "متابعة"],
  },
  {
    id: "simulatios",
    title: "SimulationOS",
    subtitle: "نظام محاكاة السيناريوهات",
    maturity: "L1 — Concept",
    statusLabel: "قيد التخطيط",
    problem:
      "قرارات تُنفذ قبل اختبار أثرها على التكلفة، المخاطر، الأداء، أو النتائج.",
    outline:
      "نظام قيد التخطيط يهدف إلى ربط المدخلات بالافتراضات، السيناريوهات، المقارنة، ودعم القرار قبل التنفيذ.",
    flow: ["مدخلات", "افتراضات", "سيناريوهات", "أثر", "مقارنة"],
  },
];

export default function ProductsPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="relative mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              عائلة الأنظمة
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              أنظمة مؤسسية مبنية على نواة واحدة
            </h1>
            <p className="mt-5 text-base leading-8 text-white/62 sm:text-lg">
              كل نظام من أنظمة عقلية يعالج مساراً مؤسسياً محدداً، لكن جميعها
              تشترك في نفس طبقة الحوكمة، سجل التدقيق، وآلية الاعتماد البشري.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-white/45">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>3 أنظمة نشطة</span>
              </span>
              <span className="text-white/20">|</span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span>2 خطوط استراتيجية</span>
              </span>
              <span className="text-white/20">|</span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary/80" />
                <span>قدرة مخصصة</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Tier 1 Header */}
      <section className="border-b border-emerald-500/20 bg-emerald-950/20">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-400">
                الأنظمة النشطة
              </p>
            </div>
            <p className="text-xs text-white/35">
              أنظمة قائمة ومُختبرة — جاهزة للتجريب المؤسسي أو النشر الفعلي
            </p>
          </div>
        </div>
      </section>

      {/* Tier 1 Systems */}
      {tier1Systems.map((system, i) => {
        const Visual = system.visual;
        return (
          <section
            key={system.id}
            className={cn(
              "border-b border-white/5",
              i % 2 === 0 ? "bg-background" : "section-gradient-dark",
            )}
          >
            <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
              <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                {/* Content */}
                <div className="flex flex-col justify-center">
                  {/* Title row */}
                  <div className="flex flex-wrap items-start gap-4">
                    <div>
                      <h2
                        className={cn(
                          "text-3xl font-black leading-tight tracking-tight",
                          i % 2 === 0 ? "text-foreground" : "text-white",
                        )}
                      >
                        {system.title}
                      </h2>
                      <p
                        className={cn(
                          "mt-0.5 text-sm font-medium",
                          i % 2 === 0
                            ? "text-muted-foreground"
                            : "text-white/50",
                        )}
                      >
                        {system.subtitle}
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-1.5 pt-0.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                        {system.statusLabel}
                      </span>
                      <span className="px-1 font-mono text-[9px] text-muted-foreground/50">
                        {system.maturity}
                      </span>
                    </div>
                  </div>

                  {/* Proof note */}
                  <div
                    className={cn(
                      "mt-5 rounded-lg border px-3 py-2 text-[11px] font-medium",
                      i % 2 === 0
                        ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-700"
                        : "border-emerald-500/20 bg-emerald-500/8 text-emerald-400",
                    )}
                  >
                    ✓ {system.proofNote}
                  </div>

                  {/* Problem / System / Output */}
                  <div className="mt-6 space-y-4">
                    <div>
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-[0.18em]",
                          i % 2 === 0
                            ? "text-destructive/70"
                            : "text-red-300/70",
                        )}
                      >
                        الفجوة التشغيلية
                      </span>
                      <p
                        className={cn(
                          "mt-1.5 text-sm leading-7",
                          i % 2 === 0
                            ? "text-muted-foreground"
                            : "text-white/60",
                        )}
                      >
                        {system.problem}
                      </p>
                    </div>
                    <div>
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-[0.18em]",
                          i % 2 === 0
                            ? "text-primary/70"
                            : "text-aqliya-cyan/75",
                        )}
                      >
                        كيف يعمل النظام
                      </span>
                      <p
                        className={cn(
                          "mt-1.5 text-sm leading-7",
                          i % 2 === 0 ? "text-foreground" : "text-white/75",
                        )}
                      >
                        {system.system}
                      </p>
                    </div>
                    <div>
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-[0.18em]",
                          i % 2 === 0
                            ? "text-emerald-600/70"
                            : "text-emerald-300/70",
                        )}
                      >
                        القيمة الناتجة
                      </span>
                      <p
                        className={cn(
                          "mt-1.5 text-sm leading-7",
                          i % 2 === 0 ? "text-foreground" : "text-white/75",
                        )}
                      >
                        {system.output}
                      </p>
                    </div>
                  </div>

                  {/* Flow */}
                  <div
                    className={cn(
                      "mt-5 rounded-2xl border p-4",
                      i % 2 === 0
                        ? "border-border/60 bg-muted/20"
                        : "border-white/10 bg-white/[0.03]",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-[0.18em]",
                        i % 2 === 0 ? "text-muted-foreground" : "text-white/45",
                      )}
                    >
                      المسار التشغيلي
                    </span>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {system.flow.map((step, j) => (
                        <div key={j} className="flex items-center gap-1">
                          <span
                            className={cn(
                              "rounded-md px-2.5 py-1 text-[10px] font-medium",
                              i % 2 === 0
                                ? "bg-background text-muted-foreground shadow-sm"
                                : "bg-white/6 text-white/62",
                            )}
                          >
                            {step}
                          </span>
                          {j < system.flow.length - 1 && (
                            <svg
                              className={cn(
                                "h-2 w-2 rtl:rotate-180",
                                i % 2 === 0
                                  ? "text-muted-foreground/40"
                                  : "text-white/20",
                              )}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12h14" />
                              <path d="m12 5 7 7-7 7" />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {system.highlights.map((h) => (
                      <span
                        key={h}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[10px] font-medium",
                          i % 2 === 0
                            ? "border-primary/10 bg-primary/5 text-primary/80"
                            : "border-white/10 bg-white/5 text-white/50",
                        )}
                      >
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* CTAs */}
                  <div className="mt-6 flex flex-wrap gap-3 border-t border-dashed pt-5">
                    <Link href={system.href} className="btn-primary px-6">
                      استكشف {system.title}
                    </Link>
                    <Link
                      href="/contact"
                      className={cn(
                        i % 2 === 0 ? "btn-outline" : "btn-secondary",
                        "px-6",
                      )}
                    >
                      طلب جلسة تقنية
                    </Link>
                  </div>
                </div>

                {/* Visual */}
                <div className="flex items-center">
                  <div
                    className={cn(
                      "w-full rounded-[28px] p-3",
                      i % 2 === 0
                        ? "gradient-border bg-gradient-to-br from-primary/[0.04] via-background to-aqliya-cyan/[0.04]"
                        : "gradient-border bg-white/[0.03]",
                    )}
                  >
                    <Visual />
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Governance Bridge */}
      <section className="border-y border-primary/15 bg-primary/[0.03]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-start">
            <div>
              <p className="text-sm font-bold text-foreground">
                كل نظام نشط يعمل داخل نفس بنية الحوكمة
              </p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">
                Evidence Chain · RBAC متعدد المستويات · Audit Trail لا يُعدَّل ·
                اعتماد بشري إلزامي
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link href="/governance" className="btn-outline px-5 text-sm">
                بنية الحوكمة
              </Link>
              <Link href="/platform" className="btn-outline px-5 text-sm">
                Intelligence Core
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tier 2 Header */}
      <section className="border-b border-amber-500/20 bg-amber-950/10">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-400/80">
                خطوط الخارطة الاستراتيجية
              </p>
            </div>
            <p className="text-xs text-white/30">
              مفاهيم ونماذج أولية — غير جاهزة للنشر الفعلي، تُبنى فوق نفس النواة
            </p>
          </div>
        </div>
      </section>

      {/* Tier 2 Systems — compact, visually demoted */}
      <section className="section-gradient-dark border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid gap-6 md:grid-cols-2">
            {tier2Systems.map((system) => (
              <div
                key={system.id}
                className="rounded-[20px] border border-white/8 bg-white/[0.025] p-7 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-white/80">
                      {system.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-white/40">
                      {system.subtitle}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-amber-500/25 bg-amber-500/8 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-amber-400/70">
                    {system.statusLabel}
                  </span>
                </div>
                <div className="mt-5 space-y-3">
                  <div>
                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-red-300/50">
                      الفجوة المستهدفة
                    </span>
                    <p className="mt-1 text-xs leading-6 text-white/45">
                      {system.problem}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">
                      النطاق المخطط
                    </span>
                    <p className="mt-1 text-xs leading-6 text-white/40">
                      {system.outline}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {system.flow.map((step, j) => (
                    <div key={j} className="flex items-center gap-1">
                      <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[9px] text-white/35">
                        {step}
                      </span>
                      {j < system.flow.length - 1 && (
                        <span className="text-[9px] text-white/15">›</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-5 border-t border-white/8 pt-4">
                  <p className="text-[10px] text-white/25">
                    {system.maturity} — لا يُعرض كنظام قائم
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Systems */}
      <section className="border-b border-white/5 bg-background">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                أنظمة مخصصة
              </span>
              <h2 className="mt-4 text-2xl font-black leading-tight text-foreground sm:text-3xl">
                نطاقك لا يناسب خطاً جاهزاً؟
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                يمكن بناء نظام مؤسسي خاص فوق AQLIYA Intelligence Core — يربط سير
                العمل، الصلاحيات، البيانات، والمخرجات داخل منطق الحوكمة نفسه.
                تبدأ بجلسة تصميم مؤسسية لتحديد النطاق والمتطلبات.
              </p>
              <div className="mt-5 space-y-2.5">
                {[
                  "يُبنى فوق نفس طبقة الحوكمة والحماية",
                  "ربط البيانات والمخرجات والاعتماد في مكان واحد",
                  "تُحدد نطاق المؤسسة أولاً — نبني بحسبه",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                    <p className="text-sm text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex gap-3">
                <Link href="/custom-product" className="btn-primary px-6">
                  صمّم نظامك المؤسسي
                </Link>
                <Link href="/contact" className="btn-outline px-6">
                  تحدث إلى متخصص
                </Link>
              </div>
            </div>
            <div className="gradient-border rounded-[28px] bg-gradient-to-br from-primary/[0.04] via-background to-aqliya-cyan/[0.04] p-3">
              <CustomWorkflowBuilderVisual />
            </div>
          </div>
        </div>
      </section>

      {/* Executive CTA */}
      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-8 text-center backdrop-blur-xl sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              الخطوة التالية
            </p>
            <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
              حدّد الخط الأقرب إلى نطاقك
              <br />
              أو ابدأ بجلسة تنفيذية
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-white/55">
              إذا كان لديك فجوة تشغيلية محددة، سنساعدك على ربطها بالنظام
              المناسب. إذا كان النطاق مختلفاً، يمكن تصميم مسار خاص فوق نفس
              النواة.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="btn-primary h-12 px-8 text-sm">
                طلب جلسة تنفيذية
              </Link>
              <Link
                href="/products/audit"
                className="btn-secondary h-12 px-8 text-sm"
              >
                ابدأ مع AuditOS
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-white/10 pt-6">
              {[
                { label: "Intelligence Core", href: "/platform" },
                { label: "بنية الحوكمة", href: "/governance" },
                { label: "من نحن", href: "/about" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-white/35 underline underline-offset-4 transition-colors hover:text-white/65"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
