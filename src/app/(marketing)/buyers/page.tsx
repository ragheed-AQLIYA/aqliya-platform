import Link from "next/link";
import type { Metadata } from "next";
import { SectionEyebrow, EnterpriseCTA } from "@/components/enterprise";

export const metadata: Metadata = {
  title: "دليل المشتري | AQLIYA",
  description:
    "دليل شامل لصانع القرار: كيف تساعد AQLIYA المؤسسات في بناء أنظمة ذكية محكومة — للمدير المالي، مدير التقنية، شريك التدقيق، الجهات الحكومية، والمشتريات.",
};

const personas = [
  {
    id: "cfo",
    label: "المدير المالي",
    subtitle: "CFO",
    badgeColor: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
    accent: "cyan",
    summary:
      "حوكمة مالية قابلة للدفاع عنها — لا قوائم جميلة فقط. كل قرار مالي مسجّل بالمستخدم والوقت والسبب.",
    questions: [
      "قرارات مالية بلا أثر موثق — كيف أثبت من وافق على ماذا ومتى؟",
      "إعداد القوائم المالية يستغرق أسابيع — هل يمكن تقليص المدة؟",
      "كيف أدافع عن القوائم أمام المراجع الخارجي؟",
      "ماذا لو غادر الشخص الرئيسي — كيف أحافظ على استمرارية المعرفة؟",
    ],
    answers: [
      "كل قرار مالي في AuditOS مسجّل بالمستخدم والوقت والسبب — سجل غير قابل للتعديل.",
      "بعد اعتماد توجيه الحسابات، مسودة القوائم المالية تُولَّد خلال دقائق — للمراجعة البشرية الإلزامية.",
      "كل رقم في القوائم مرتبط بمصدره: الحساب ← القرار ← الدليل ← المعتمد. حزمة ارتباط كاملة.",
      "المنهجية مدمجة في سير العمل — لا تعتمد على ذاكرة فرد. الارتباط يبقى موثقًا بالكامل.",
    ],
    outputs: [
      "مسودة القوائم المالية (مركز مالي، دخل شامل، تدفقات نقدية)",
      "سجل قرارات التوجيه — كل حساب: من وجّهه، متى، وبأي سلطة",
      "تقرير الاعتماد — سلسلة موافقات كاملة",
      "Evidence Manifest — ربط كل بند مادي بدليله الداعم",
      "Audit Trail الكامل — 247+ حدث مسجّل",
    ],
    ctas: [
      { label: "طلب جلسة تنفيذية", href: "/contact", primary: true },
      { label: "مشاهدة الديمو", href: "/demo", primary: false },
    ],
  },
  {
    id: "cio",
    label: "مدير تقنية المعلومات",
    subtitle: "CIO",
    badgeColor: "text-violet-400 border-violet-500/20 bg-violet-500/10",
    accent: "violet",
    summary:
      "معلومات تقنية دقيقة — لا تسويق. نشر النظام، أمن البيانات، متطلبات التكامل، ومسار التوسع نحو الإنتاج بشفافية كاملة.",
    questions: [
      "كيف يُعالج الذكاء الاصطناعي بيانات عملائنا — هل تُستخدم للتدريب؟",
      "ما هي متطلبات التكامل مع أنظمتنا الحالية؟",
      "هل النظام يعمل On-Premises أم Cloud فقط؟",
      "المصادقة والصلاحيات — هل تتوافق مع بنيتنا الأمنية؟",
    ],
    answers: [
      "البيانات لا تُستخدم لتدريب نماذج خارجية. معالجة LLM على الجلسة فقط — لا تخزين في نماذج خارجية.",
      "التقييم التشغيلي يعمل مستقلًا — استيراد CSV/XLSX، تصدير JSON/XLSX. API خارجي وتكامل ERP في خارطة ما بعد الإنتاج.",
      "النموذج الحالي: Cloud Managed Deployment. نموذج Private Cloud في خارطة النشر. التقييم التشغيلي في بيئة محكومة متفق عليها.",
      "NextAuth مع RBAC على مستوى الدور والارتباط. دعم SSO/LDAP في خارطة ما قبل الإنتاج.",
    ],
    outputs: [],
    ctas: [
      { label: "طلب جلسة تقنية", href: "/contact", primary: true },
      { label: "وثيقة الأمن", href: "/security", primary: false },
      { label: "نماذج النشر", href: "/deployment", primary: false },
    ],
  },
  {
    id: "audit-partner",
    label: "شريك التدقيق",
    subtitle: "Audit Partner",
    badgeColor: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    accent: "emerald",
    summary:
      "اعتمادك يحمي سمعتك — النظام يحمي اعتمادك. بوابة اعتماد رسمية، سجل قرارات غير قابل للتعديل، وحزمة ارتباط كاملة.",
    questions: [
      "المراجع الخارجي سيطلب الأدلة — كيف أقدمها بشكل منظم؟",
      "الموظفون يتغيرون — كيف أحافظ على استمرارية المعرفة التدقيقية؟",
      "اقتراحات الذكاء الاصطناعي — هل أُساءل عنها أمام الجهات الرقابية؟",
      "هل النظام يناسب معايير التدقيق المتبعة في المملكة؟",
    ],
    answers: [
      "كل بند في القوائم مرتبط بالحساب المصدر والدليل الداعم والمدقق المعتمد. Evidence Manifest كامل قابل للتصدير.",
      "المنهجية مدمجة في سير العمل. لا تعتمد على ذاكرة فرد. كل ارتباط سابق موثق ومرجعيته متاحة.",
      "جميع مخرجات الذكاء الاصطناعي مسودات لا تصبح نهائية إلا بموافقتك. النظام لا يُصدر رأيًا.",
      "AuditOS مبني على IFRS framework لتوجيه الحسابات. المنهجية قابلة للتخصيص حسب معايير مكتبك.",
    ],
    outputs: [],
    ctas: [
      { label: "شاهد بوابة الاعتماد", href: "/demo", primary: true },
      { label: "طلب جلسة تنفيذية", href: "/contact", primary: false },
    ],
  },
  {
    id: "government",
    label: "الجهات الحكومية",
    subtitle: "Government",
    badgeColor: "text-amber-400 border-amber-500/20 bg-amber-500/10",
    accent: "amber",
    summary:
      "حوكمة مؤسسية لمتطلبات القطاع الحكومي. سيادة البيانات، توثيق المساءلة، وسير عمل مراجعة موثوق.",
    questions: [
      "بياناتنا حساسة — أين تُخزَّن وهل تخرج من البنية التحتية؟",
      "هل هناك شهادات أمنية — SOC2 أو ISO؟",
      "كيف يتوافق النظام مع رؤية 2030 ومتطلبات التحول الرقمي؟",
      "هل النظام مرخّص ومصادق عليه في السعودية؟",
    ],
    answers: [
      "في Cloud Managed Deployment، البيانات على خوادم محددة بمواصفات متفق عليها. Private Cloud قيد التخطيط.",
      "نماذج نشر سحابية وخاصة. المراجعة الأمنية الخارجية جزء من مسار التفعيل المؤسسي. نوفر الوثائق للمراجعة.",
      "AQLIYA تعزز القرار البشري لا تستبدله. توثيق المساءلة والحوكمة متوافق مع متطلبات التحول الرقمي الحكومي.",
      "AQLIYA شركة سعودية — العمليات في المملكة. متطلبات الترخيص تُحدَّد حسب طبيعة كل جهة.",
    ],
    outputs: [],
    ctas: [
      { label: "طلب جلسة استشارية", href: "/contact", primary: true },
      { label: "الإحاطة التنفيذية", href: "/proof#executive-brief", primary: false },
    ],
  },
  {
    id: "procurement",
    label: "المشتريات والعقود",
    subtitle: "Procurement",
    badgeColor: "text-rose-400 border-rose-500/20 bg-rose-500/10",
    accent: "rose",
    summary:
      "كل ما تحتاجه لعملية التقييم والمشتريات — وثائق التقييم، نماذج التعاون، متطلبات التشغيل، ومسار الحصول على عرض رسمي.",
    questions: [
      "ما هي وثائق التقييم المتاحة لمراجعة فريق المشتريات؟",
      "ما هي نماذج التعاون — من التشخيص إلى النظام المؤسسي؟",
      "ما هي معايير التقييم المقترحة لقياس نجاح التقييم التشغيلي؟",
      "كيف أحصل على عرض رسمي مع نطاق وتسعيرة واضحة؟",
    ],
    answers: [
      "حزمة التقييم الكاملة: brief، أمن، DPA، residency، SOW، SOC2 roadmap — عبر /procurement-pack.",
      "4 نماذج: التشخيص التنفيذي (مجاني)، تقييم تشغيلي (مجاني)، تفعيل مؤسسي، نظام مؤسسي مخصص.",
      "28 معيار قابل للقياس — معايير قرار بالأدلة واضحة وآلية تقييم مستقل قبل أي التزام اشتراك.",
      "بعد تقييم ناجح: عرض مكتوب بنطاق وتسعير — راجع /engagement-models.",
    ],
    outputs: [],
    ctas: [
      { label: "حزمة التقييم", href: "/procurement-pack", primary: true },
      { label: "نماذج التعاون", href: "/engagement-models", primary: false },
    ],
  },
];

function PersonaSection({
  persona,
  index,
}: {
  persona: (typeof personas)[number];
  index: number;
}) {
  const borderAccent =
    {
      cyan: "border-cyan-500/10",
      violet: "border-violet-500/10",
      emerald: "border-emerald-500/10",
      amber: "border-amber-500/10",
      rose: "border-rose-500/10",
    }[persona.accent] ?? "border-white/10";

  const bgAccent =
    {
      cyan: "bg-cyan-500/[0.02]",
      violet: "bg-violet-500/[0.02]",
      emerald: "bg-emerald-500/[0.02]",
      amber: "bg-amber-500/[0.02]",
      rose: "bg-rose-500/[0.02]",
    }[persona.accent] ?? "bg-white/[0.02]";

  const dotAccent =
    {
      cyan: "bg-cyan-400",
      violet: "bg-violet-400",
      emerald: "bg-emerald-400",
      amber: "bg-amber-400",
      rose: "bg-rose-400",
    }[persona.accent] ?? "bg-white/40";

  const glowAccent =
    {
      cyan: "bg-cyan-500/20",
      violet: "bg-violet-500/20",
      emerald: "bg-emerald-500/20",
      amber: "bg-amber-500/20",
      rose: "bg-rose-500/20",
    }[persona.accent] ?? "bg-white/10";

  return (
    <section id={persona.id} className="scroll-mt-24">
      <div
        className={`relative overflow-hidden rounded-3xl border ${borderAccent} ${bgAccent} p-8 sm:p-12`}
      >
        {/* Glow */}
        <div
          className={`pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full opacity-20 blur-3xl ${glowAccent}`}
        />

        {/* Header */}
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span
              className={`inline-flex items-center gap-2 rounded-full border ${persona.badgeColor} px-4 py-1.5 text-xs font-semibold`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${dotAccent}`} />
              {persona.label} — {persona.subtitle}
            </span>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/70">
              {persona.summary}
            </p>
          </div>

          {/* Quick nav to other personas */}
          <div className="hidden shrink-0 sm:block">
            <div className="flex flex-wrap gap-2">
              {personas.map((p) =>
                p.id !== persona.id ? (
                  <Link
                    key={p.id}
                    href={`#${p.id}`}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/50 transition-colors hover:border-white/20 hover:text-white/80"
                  >
                    {p.label}
                  </Link>
                ) : null,
              )}
            </div>
          </div>
        </div>

        {/* Q&A Grid */}
        <div className="relative mt-10 grid gap-4 sm:grid-cols-2">
          {persona.questions.map((q, i) => (
            <div
              key={i}
              className="group rounded-xl border border-white/5 bg-white/[0.03] p-5 transition-all hover:border-white/10"
            >
              <div className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-amber-400/80 text-sm">؟</span>
                <p className="text-sm font-medium leading-relaxed text-white">
                  {q}
                </p>
              </div>
              <div className="mt-3 flex gap-3 border-t border-white/5 pt-3">
                <span className="mt-0.5 shrink-0 text-white/20 text-sm">◈</span>
                <p className="text-sm leading-relaxed text-white/50">
                  {persona.answers[i]}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Outputs (if any) */}
        {persona.outputs.length > 0 && (
          <div className="relative mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/30 mb-3">
              المخرجات
            </p>
            <div className="flex flex-wrap gap-2">
              {persona.outputs.map((o) => (
                <span
                  key={o}
                  className="inline-flex items-center rounded-full border border-white/5 bg-white/[0.04] px-3 py-1.5 text-xs text-white/50"
                >
                  {o}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Persona-specific CTA */}
        <div className="relative mt-8 flex flex-wrap gap-3">
          {persona.ctas.map((cta) =>
            cta.primary ? (
              <Link
                key={cta.label}
                href={cta.href}
                className="btn-primary inline-flex h-11 items-center gap-2 px-6 text-sm"
              >
                {cta.label}
              </Link>
            ) : (
              <Link
                key={cta.label}
                href={cta.href}
                className="btn-outline inline-flex h-11 items-center gap-2 px-6 text-sm"
              >
                {cta.label}
              </Link>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

export default function BuyersGuidePage() {
  return (
    <div className="flex flex-col gap-20 sm:gap-28" dir="rtl">
      {/* ===== HERO ===== */}
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <div className="relative max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              دليل المشتري / Buyer Guide
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              دليلك لاتخاذ قرار<br />
              <span className="text-aqliya-cyan">ذكي ومحكوم</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              AQLIYA ليست أداة ذكاء اصطناعي عادية. هي منصة ذكاء مؤسسي محكوم —
              تساعد المؤسسات على بناء وتشغيل أنظمة ذكية داخل بيئة مضبوطة، مع
              حوكمة، أدلة، صلاحيات، وسجل تدقيقي. هذا الدليل يوضح كيف تناسب كل
              دور في مؤسستك.
            </p>
          </div>
        </div>
      </section>

      {/* ===== NAV ===== */}
      <section className="mx-auto max-w-7xl px-6 -mt-8 sm:-mt-16">
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30 mb-4 text-center">
            اختر دورك
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <Link
              href="#cfo"
              className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-500/20"
            >
              المدير المالي
            </Link>
            <Link
              href="#cio"
              className="rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-400 transition-colors hover:bg-violet-500/20"
            >
              مدير التقنية
            </Link>
            <Link
              href="#audit-partner"
              className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
            >
              شريك التدقيق
            </Link>
            <Link
              href="#government"
              className="rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
            >
              الجهات الحكومية
            </Link>
            <Link
              href="#procurement"
              className="rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/20"
            >
              المشتريات والعقود
            </Link>
          </div>
        </div>
      </section>

      {/* ===== PRINCIPLE ===== */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="مبدأنا الأساسي"
          title="الذكاء يساعد. الإنسان يقرر. الدليل يحكم."
          description="كل اقتراح ذكاء اصطناعي يمر بمراجعة وموافقة بشرية قبل أن يصبح قرارًا. لا قرارات آلية — لا مخرجات بدون مراجعة."
        />
      </section>

      {/* ===== PERSONA SECTIONS ===== */}
      <section className="mx-auto max-w-7xl px-6 space-y-12 sm:space-y-16">
        {personas.map((persona, i) => (
          <PersonaSection
            key={persona.id}
            persona={persona}
            index={i}
          />
        ))}
      </section>

      {/* ===== GLOBAL CTA ===== */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <EnterpriseCTA
          title="بدأ الرحلة"
          description="اختر مسارك: جلسة تنفيذية لفريقك القيادي، ديمو موجّه لمدة ٤ دقائق، أو تقييم تشغيلي مجاني لمدة ٢-٤ أسابيع."
          primaryLabel="طلب جلسة تنفيذية"
          primaryHref="/contact"
          secondaryLabel="مشاهدة الديمو"
          secondaryHref="/demo"
        />
      </section>
    </div>
  );
}
