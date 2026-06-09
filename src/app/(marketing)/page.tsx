import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AQLIYA | منصة تشغيل مؤسسية للقرارات والأدلة",
  description:
    "منصة تشغيل مؤسسية تحول العمليات الحرجة من ملفات متفرقة إلى مسارات محكومة. الذكاء يساعد. الإنسان يقرر. الدليل يحكم.",
};

const problemTools = [
  {
    name: "Excel",
    line: "يحسب. لا يحكم.",
    note: "لا سجل قرارات، لا صلاحيات، لا سلسلة أدلة.",
  },
  {
    name: "البريد الإلكتروني",
    line: "يوصّل. لا يوثّق.",
    note: "القرارات في صندوق البريد — وتختفي بمغادرة الشخص.",
  },
  {
    name: "واتساب",
    line: "يتواصل. لا يُثبت.",
    note: "اعتماد شفهي لا يصمد أمام مراجع خارجي.",
  },
  {
    name: "أدوات الذكاء الاصطناعي العامة",
    line: "تُنتج. لا تُراجَع.",
    note: "مخرجات بلا حوكمة ولا مسار اعتماد.",
  },
  {
    name: "الاجتماعات",
    line: "تقرر. لا تُحفَظ.",
    note: "المعرفة تختفي بمغادرة الأشخاص.",
  },
];

const problemOutcomes = [
  "قرارات بلا سجل موثق — يصعب الدفاع عنها أمام مراجع أو جهة رقابية",
  "مخرجات لا يمكن تتبع مصادرها — من قال هذا؟ على أي أساس؟",
  "معرفة مؤسسية تضيع بمغادرة الأشخاص أو تغيير الفريق",
  "مخاطر امتثال تتصاعد مع كل عملية غير موثقة في بيئة تنظيمية متزايدة",
];

const operatingChain = [
  "البيانات",
  "الإجراءات",
  "المراجعة",
  "الاعتماد",
  "الأدلة",
  "القرار",
];

const principles = [
  {
    title: "Evidence First",
    titleAr: "الأدلة أولاً",
    body: "كل مخرج مرتبط بمصدره — من الإدخال إلى التصدير.",
  },
  {
    title: "Human Governance",
    titleAr: "حوكمة بشرية",
    body: "الإنسان يراجع ويعتمد. الذكاء يقترح ولا يقرر.",
  },
  {
    title: "Institutional Memory",
    titleAr: "ذاكرة مؤسسية",
    body: "المعرفة تبقى داخل المؤسسة — لا تختفي بمغادرة الأفراد.",
  },
  {
    title: "Traceability",
    titleAr: "قابلية التتبع",
    body: "كل خطوة مسجلة: من فعل ماذا، ومتى، وعلى أي أساس.",
  },
];

const industries = [
  {
    title: "مكاتب المراجعة",
    body: "من قبول العميل إلى التقرير — مسار واحد قابل للتدقيق والاعتماد.",
    href: "/industries#audit-firms",
  },
  {
    title: "الجهات الحكومية",
    body: "مساءلة القرار، سيادة البيانات، وبرامج الامتثال والمحتوى المحلي.",
    href: "/industries#government",
  },
  {
    title: "الشركات الكبرى",
    body: "قرارات متعددة المستويات، حوكمة مالية، ومراجعة داخلية موثقة.",
    href: "/industries#enterprise",
  },
  {
    title: "شركات الخدمات المهنية",
    body: "جودة المخرجات، استمرارية المعرفة، ومسارات اعتماد واضحة.",
    href: "/industries#professional-services",
  },
];

const useCases = [
  {
    title: "إدارة ارتباطات المراجعة",
    problem:
      "ميزان مراجعة في Excel، ملاحظات في واتساب، اعتمادات عبر البريد الإلكتروني. لا سجل موحد. لا إمكانية دفاع أمام المراجع الخارجي.",
    outcome:
      "مسار موحد من رفع ميزان المراجعة إلى نشر حزمة الارتباط — مع Audit Trail كامل وسلسلة أدلة لكل رقم.",
    audience: "مكاتب التدقيق، المراجعة الداخلية، إدارات المالية",
  },
  {
    title: "توثيق القرارات المؤسسية",
    problem:
      "قرارات مهمة في اجتماعات بلا مسوّغات مكتوبة. لا سجل بالبدائل المدروسة. من قرر؟ على أي أساس؟",
    outcome:
      "مذكرة قرار كاملة: سياق، بدائل، مخاطر، توصية ذكاء اصطناعي، مراجعة، اعتماد — في وثيقة واحدة موثقة لا تضيع.",
    audience: "الإدارة التنفيذية، مجالس الإدارة، اللجان الاستراتيجية",
  },
  {
    title: "برامج المحتوى المحلي",
    problem:
      "بيانات موردين في جداول متفرقة، تصنيفات يدوية، فجوات امتثال مخفية، وتقارير تُعدّ لآخر لحظة.",
    outcome:
      "موردون، إنفاق، تصنيف، فجوات، ومؤشرات التزام — في مسار واحد متكامل مع تقارير جاهزة للجهات التنظيمية.",
    audience: "شركات المقاولات، الجهات الحكومية، المؤسسات الخاضعة لبرنامج المحتوى المحلي",
  },
  {
    title: "تطوير الأعمال المؤسسي",
    problem:
      "معلومات العملاء والفرص والعروض والعقود موزعة بين أشخاص وأدوات. تختفي بمغادرة الشخص.",
    outcome:
      "ذاكرة تجارية مؤسسية — حسابات، فرص، اجتماعات، عروض — في مسار واحد مع حوكمة وتقارير ذكاء.",
    audience: "شركات الخدمات المهنية، المؤسسات ذات دورات مبيعات طويلة",
  },
];

const trustReasons = [
  "الحوكمة مدمجة في البنية — ليست إعداداً اختيارياً",
  "سلسلة أدلة كاملة من المصدر إلى المخرج",
  "صلاحيات واعتمادات على مستوى الدور والإجراء",
  "نشر سحابي مُدار أو خاص حسب متطلبات المؤسسة",
  "تصميم عربي أولاً للمسارات المؤسسية الحرجة",
];

const journeySteps = [
  { label: "تشخيص", detail: "جلسة مجانية لفهم السياق والنطاق" },
  { label: "Pilot", detail: "تجربة محدودة على سير عمل واحد" },
  { label: "اعتماد", detail: "تقييم النتائج وقرار Go/No-Go" },
  { label: "نشر", detail: "تفعيل تشغيلي في بيئة الإنتاج" },
  { label: "توسع", detail: "مسارات إضافية فوق نفس المنصة" },
];

const proofAssets = [
  {
    title: "الديمو التفاعلي",
    body: "شاهد مساراً تشغيلياً كاملاً على بيانات تجريبية — بدون تسجيل.",
    href: "/demo",
  },
  {
    title: "الملخص التنفيذي",
    body: "قراءة ٥ دقائق للقيادة: ما هي عقلية ولماذا تهم مؤسستك.",
    href: "/executive-brief",
  },
  {
    title: "إطار البايلوت",
    body: "كيف نقيس النجاح: معايير، أدلة، ومخرجات Go/No-Go.",
    href: "/pilot-proof",
  },
  {
    title: "مكتبة الأدلة",
    body: "نماذج مخرجات وسلاسل إثبات — على بيانات تجريبية موثقة.",
    href: "/proof-library",
  },
  {
    title: "حزمة المشتريات",
    body: "PDFs: brief، أمن، DPA، SOC2 roadmap، SOW، ومقارنة Excel.",
    href: "/procurement-pack",
  },
  {
    title: "دراسات الحالة",
    body: "سيناريوهات موثقة + placeholder لمرجع بايلوت حقيقي.",
    href: "/case-studies",
  },
  {
    title: "ملخص الأمن",
    body: "الصلاحيات، العزل، البيانات، ونماذج النشر — بشفافية كاملة.",
    href: "/security",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* §1 — Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-26 lg:py-30">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              منصة تشغيل مؤسسية
            </span>

            <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
              منصة تشغيل مؤسسية للقرارات والعمليات والأدلة
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/65">
              تساعد عقلية المؤسسات على تحويل العمليات الحرجة من ملفات متفرقة
              واجتهادات فردية إلى مسارات تشغيلية محكومة وقابلة للمراجعة.
            </p>

            <div className="mx-auto mt-6 max-w-md rounded-2xl border border-aqliya-cyan/18 bg-aqliya-cyan/[0.05] px-5 py-4 backdrop-blur-sm">
              <p className="text-base font-bold text-white">
                الذكاء يساعد.{" "}
                <span className="text-aqliya-cyan">الإنسان يقرر.</span>{" "}
                الدليل يحكم.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="btn-primary h-12 px-8 text-base font-bold"
              >
                احجز جلسة تشخيص
              </Link>
              <Link
                href="/platform"
                className="btn-outline border-white/15 text-white/70 hover:bg-white/5 h-12 px-8 text-base"
              >
                شاهد كيف تعمل عقلية
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* §2 — المشكلة */}
      <section className="section-gradient-light border-t">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black text-foreground sm:text-4xl">
              المشكلة التي تواجهها أغلب المؤسسات
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              اليوم أغلب المؤسسات تعمل عبر أدوات متفرقة لا تتصل بمسار واحد
              للمساءلة.
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-background p-6 sm:p-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                الأدوات الحالية
              </p>
              <ul className="mt-4 space-y-4">
                {problemTools.map((tool) => (
                  <li
                    key={tool.name}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {tool.name}
                      </p>
                      <p className="text-xs leading-6 text-muted-foreground">
                        {tool.line}{" "}
                        <span className="text-muted-foreground/60">
                          {tool.note}
                        </span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-destructive/15 bg-destructive/[0.03] p-6 sm:p-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-destructive/70">
                النتيجة
              </p>
              <ul className="mt-4 space-y-3">
                {problemOutcomes.map((outcome) => (
                  <li
                    key={outcome}
                    className="flex items-center gap-3 text-sm font-medium text-foreground"
                  >
                    <span className="text-destructive/60">✕</span>
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* §3 — كيف تعمل عقلية */}
      <section id="how-it-works" className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black text-foreground sm:text-4xl">
            كيف تعمل عقلية
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            مسار تشغيلي واحد يربط البيانات بالقرار — عبر مراجعة واعتماد وأدلة
            موثقة.
          </p>
        </div>

        <div className="mt-12 flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
          {operatingChain.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="min-w-[7rem] rounded-xl border border-primary/20 bg-primary/[0.04] px-5 py-3 text-center">
                <p className="text-sm font-bold text-foreground">{step}</p>
              </div>
              {i < operatingChain.length - 1 && (
                <span className="hidden text-primary/30 sm:inline">↓</span>
              )}
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-7 text-muted-foreground">
          ليست أداة ذكاء اصطناعي منفصلة، ولا نظام حوكمة تقليدي — بل{" "}
          <strong className="text-foreground">منصة تشغيل</strong> تجمع
          الإجراءات والمراجعة والأدلة في بيئة واحدة.
        </p>
      </section>

      {/* §4 — المبادئ */}
      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              مبادئ التشغيل
            </h2>
            <p className="mt-4 text-base leading-7 text-white/55">
              أربعة مبادئ تحكم كل مسار في المنصة — بدون استثناء.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-aqliya-cyan">
                  {p.title}
                </p>
                <h3 className="mt-2 text-base font-bold text-white">
                  {p.titleAr}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/55">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* §5 — من نخدم */}
      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black text-foreground sm:text-4xl">
            من نخدم
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {industries.map((ind) => (
            <Link
              key={ind.title}
              href={ind.href}
              className="group rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/20 p-6 transition-all hover:border-primary/25 hover:shadow-sm"
            >
              <h3 className="text-lg font-black text-foreground group-hover:text-primary">
                {ind.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {ind.body}
              </p>
              <span className="mt-4 inline-block text-xs font-medium text-primary">
                اعرف المزيد ←
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* §6 — نماذج الاستخدام */}
      <section className="section-gradient-light border-t">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black text-foreground sm:text-4xl">
              نماذج الاستخدام
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              مسارات تشغيلية حقيقية تُفعَّل فوق المنصة — حسب تحدي مؤسستك.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {useCases.map((uc) => (
              <div
                key={uc.title}
                className="rounded-2xl border border-border/60 bg-background p-6 sm:p-7"
              >
                <h3 className="text-base font-black text-foreground">
                  {uc.title}
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      المشكلة
                    </p>
                    <p className="mt-1 text-sm leading-7 text-muted-foreground">
                      {uc.problem}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                      النتيجة
                    </p>
                    <p className="mt-1 text-sm leading-7 text-foreground">
                      {uc.outcome}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">
                      الجمهور
                    </p>
                    <p className="mt-1 text-xs leading-6 text-muted-foreground/70">
                      {uc.audience}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/platform#capabilities" className="btn-outline h-11 px-8">
              أنظمة التشغيل على المنصة
            </Link>
          </div>
        </div>
      </section>

      {/* §7 — لماذا يثق العملاء */}
      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black text-foreground sm:text-4xl">
            لماذا تثق المؤسسات بعقلية
          </h2>
        </div>

        <ul className="mx-auto mt-10 max-w-2xl space-y-4">
          {trustReasons.map((reason) => (
            <li
              key={reason}
              className="flex items-start gap-3 rounded-xl border border-border/50 bg-muted/20 px-5 py-4 text-sm leading-7 text-foreground"
            >
              <span className="mt-0.5 text-primary">◈</span>
              {reason}
            </li>
          ))}
        </ul>

        <div className="mt-8 text-center">
          <Link href="/governance" className="btn-outline h-10 px-6 text-sm">
            بنية الحوكمة الكاملة
          </Link>
        </div>
      </section>

      {/* §8 — رحلة العمل */}
      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              رحلة العمل مع عقلية
            </h2>
            <p className="mt-4 text-base leading-7 text-white/55">
              لا نبدأ بعقود ضخمة. نبدأ بتشخيص، نثبت القيمة، ثم نقرر بالأدلة.
            </p>
          </div>

          <div className="mt-12 flex flex-col items-stretch gap-3 sm:flex-row sm:items-start sm:justify-center">
            {journeySteps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-3 sm:flex-col sm:gap-2">
                <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 text-center sm:min-w-[8.5rem]">
                  <p className="text-sm font-bold text-white">{step.label}</p>
                  <p className="mt-1 text-[11px] leading-5 text-white/45">
                    {step.detail}
                  </p>
                </div>
                {i < journeySteps.length - 1 && (
                  <span className="hidden text-white/25 sm:block sm:py-6">↓</span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/engagement-models"
              className="text-sm font-medium text-aqliya-cyan underline underline-offset-4 hover:text-aqliya-cyan/80"
            >
              تفاصيل نماذج التعاون ←
            </Link>
          </div>
        </div>
      </section>

      {/* §9 — Proof Center */}
      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            مركز الإثبات
          </span>
          <h2 className="mt-5 text-3xl font-black text-foreground sm:text-4xl">
            لا تؤمن بالكلام — تحقق بنفسك
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            كل ما تحتاجه لتقييم عقلية قبل أي التزام — في مكان واحد.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {proofAssets.map((asset) => (
            <Link
              key={asset.href}
              href={asset.href}
              className="group rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/15 p-5 transition-all hover:border-primary/25 hover:shadow-sm"
            >
              <h3 className="text-sm font-bold text-foreground group-hover:text-primary">
                {asset.title}
              </h3>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                {asset.body}
              </p>
            </Link>
          ))}
          <Link
            href="/proof"
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-primary/[0.03] p-5 text-center transition-all hover:border-primary/50"
          >
            <p className="text-sm font-bold text-primary">مركز الإثبات الكامل</p>
            <p className="mt-1 text-xs text-muted-foreground">
              كل الموارد في صفحة واحدة
            </p>
          </Link>
        </div>

        <div className="mx-auto mt-12 max-w-4xl rounded-[28px] border border-border/60 bg-gradient-to-br from-muted/30 to-background p-8 text-center sm:p-10">
          <h3 className="text-xl font-black text-foreground sm:text-2xl">
            ابدأ بجلسة تشخيص — مجاناً
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
            نفهم سياق مؤسستك، نحدد المسار التشغيلي المناسب، ونوصي بالخطوة
            التالية — بدون عرض مبيعات.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn-primary h-12 px-10 text-base font-bold">
              احجز جلسة تشخيص
            </Link>
            <Link href="/proof" className="btn-secondary h-12 px-10 text-base">
              مركز الإثبات
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
