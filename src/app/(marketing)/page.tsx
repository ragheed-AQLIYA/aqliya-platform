import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AQLIYA | منصة تشغيل مؤسسية للقرارات والعمليات والامتثال",
  description:
    "تربط البيانات والإجراءات والقرارات والأدلة في نظام واحد قابل للحوكمة والتتبع. أربعة منتجات تعمل فوق منصة موحدة: DecisionOS، SalesOS، AuditOS، LocalContentOS.",
};

const chainSteps = [
  { ar: "البيانات", en: "Data" },
  { ar: "سير العمل", en: "Workflow" },
  { ar: "القرار", en: "Decision" },
  { ar: "الدليل", en: "Evidence" },
  { ar: "الحوكمة", en: "Governance" },
  { ar: "سجل التدقيق", en: "Audit Trail" },
  { ar: "المعرفة", en: "Knowledge" },
];

const products = [
  {
    id: "decisionos",
    name: "DecisionOS",
    tagline: "نظام تشغيل القرارات المؤسسية",
    maturity: "L4 — نشط",
    description:
      "تحليل البدائل والمخاطر والتوصيات والاعتمادات داخل إطار حوكمة واضح. يحول القرارات المعقدة من اجتماعات وملفات متفرقة إلى مسار مؤسسي موثق.",
    capabilities: ["تحليل البدائل", "تقييم المخاطر", "توصية مدعومة", "مسار اعتماد", "سجل قرارات"],
    href: "/products/decision",
  },
  {
    id: "salesos",
    name: "SalesOS",
    tagline: "نظام تشغيل تطوير الأعمال والمبيعات",
    maturity: "L4 — نشط",
    description:
      "إدارة الحسابات والفرص والاجتماعات والعروض والعقود والذاكرة البيعية. يحول المبيعات من جهد فردي إلى عملية مؤسسية منظمة مع حوكمة وتقارير ذكاء.",
    capabilities: ["إدارة الحسابات", "الفرص والصفقات", "ذكاء المبيعات", "المراجعة والاعتماد", "تقارير الأداء"],
    href: "/products/sales",
  },
  {
    id: "auditos",
    name: "AuditOS",
    tagline: "نظام تشغيل المراجعة والالتزام",
    maturity: "L5 — جاهز للتجربة",
    description:
      "من قبول العميل إلى إصدار التقرير وإدارة الجودة والمعرفة المهنية. ١٢ محطة مترابطة تغطي دورة المراجعة بالكامل مع حوكمة وأدلة واعتماد بشري.",
    capabilities: ["قبول العميل", "ميزان المراجعة", "القوائم المالية", "الأدلة والنتائج", "التقرير والنشر"],
    href: "/products/audit",
    demoHref: "/auditos",
  },
  {
    id: "localcontentos",
    name: "LocalContentOS",
    tagline: "نظام تشغيل المحتوى المحلي وسلاسل التوريد والامتثال",
    maturity: "L5 — متاح بشروط",
    description:
      "إدارة الموردين والإنفاق والعقود والأدلة والتقارير. يقيس المحتوى المحلي ويدير سلاسل التوريد داخل مسار حوكمة واحد مع مؤشرات التزام دقيقة.",
    capabilities: ["إدارة الموردين", "تتبع الإنفاق", "تصنيف الالتزام", "الأدلة والمستندات", "التقارير والتصدير"],
    href: "/products/local-content",
  },
];

const platformLayers = [
  { title: "AQLIYA Intelligence Core", body: "القلب الذكي للمنصة. يوحد البيانات والعمليات والقرارات والمعرفة في طبقة تشغيل واحدة." },
  { title: "Workflow Engine", body: "محرك سير العمل. يدير حالات العمل ومراحله من المسودة إلى الاعتماد النهائي." },
  { title: "Governance", body: "طبقة الحوكمة. الصلاحيات والاعتمادات والفصل بين المهام والرقابة المؤسسية." },
  { title: "Integration Layer", body: "طبقة التكاملات. ربط الأنظمة والمزودين والخدمات الخارجية." },
  { title: "Evidence Graph", body: "شبكة الأدلة المؤسسية. ربط العمليات والقرارات والمستندات ضمن سياق واحد قابل للتتبع." },
  { title: "Audit Trail", body: "سجل التدقيق المركزي. توثيق كامل لكل عملية أو قرار أو تغيير داخل المنصة." },
];

const trustPillars = [
  {
    icon: "🔗",
    title: "سلسلة أدلة كاملة",
    body: "كل مخرج مربوط بمصدر بياناته، خطوات معالجته، ومن راجعه واعتمده.",
  },
  {
    icon: "📋",
    title: "سجل تدقيق لا يُعدَّل",
    body: "كل حدث، تغيير، وقرار مسجل بالهوية والوقت والسياق — لا يمكن حذفه.",
  },
  {
    icon: "👁",
    title: "مراجعة بشرية إلزامية",
    body: "الذكاء لا يُصدر مخرجًا نهائيًا — كل مخرج يمر عبر مراجعة وموافقة إنسانية.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ════════════════════════════════════════════
          § 1 — HERO
          المحور: منصة تشغيل مؤسسية، لا منتج AI
          ════════════════════════════════════════════ */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-26 lg:py-30">
          <div className="mx-auto max-w-4xl text-center">
            {/* Platform Identity */}
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              منصة تشغيل مؤسسية
            </span>

            <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
              منصة تشغيل مؤسسية
              <span className="block mt-2 text-white/80">
                للقرارات والعمليات والامتثال
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/65">
              تربط البيانات والإجراءات والقرارات والأدلة في نظام واحد قابل للحوكمة والتتبع.
              أربعة منتجات تعمل فوق منصة موحدة — كل منتج يحل تحدياً تشغيلياً محدداً داخل المؤسسة.
            </p>

            {/* NOT — concise */}
            <p className="mt-3 text-sm text-white/45">
              ليست أداة ذكاء اصطناعي، ولا نظام حوكمة تقليدي، ولا حزمة SaaS. —{" "}
              <strong className="text-white/65">منصة تشغيل مؤسسية متكاملة.</strong>
            </p>

            {/* Product maturity indicators */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-white/50">
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                AuditOS L5
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-white/55">
                DecisionOS L4
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-white/55">
                SalesOS L4
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-white/55">
                LocalContentOS L5
              </span>
            </div>

            {/* Trust Principle */}
            <div className="mx-auto mt-6 max-w-md rounded-2xl border border-aqliya-cyan/18 bg-aqliya-cyan/[0.05] px-5 py-4 backdrop-blur-sm">
              <p className="text-lg font-black text-white">
                الذكاء يساعد.{" "}
                <span className="text-aqliya-cyan">الإنسان يقرر.</span>{" "}
                الدليل يحكم.
              </p>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/products"
                className="btn-primary h-12 px-8 text-base font-bold"
              >
                استعرض المنتجات
              </Link>
              <Link
                href="/contact"
                className="btn-outline border-white/15 text-white/70 hover:bg-white/5 h-12 px-8 text-base"
              >
                طلب تجربة
              </Link>
              <Link
                href="/auditos"
                className="btn-secondary h-12 px-8 text-base"
              >
                جرب AuditOS — ديمو تفاعلي
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          § 2 — AQLIYA CHAIN
          Data → Workflow → Decision → Evidence → Governance → Audit Trail → Knowledge
          ════════════════════════════════════════════ */}
      <section className="section-gradient-light border-t">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              AQLIYA — ليست مجموعة تطبيقات منفصلة
            </span>
            <h2 className="mt-5 text-3xl font-black text-foreground sm:text-4xl">
              كل منتج يعمل فوق منصة موحدة
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Data ← Workflow ← Decision ← Evidence ← Governance ← Audit Trail ← Knowledge
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {chainSteps.map((step, i) => (
              <div key={step.en} className="flex items-center gap-2">
                <div className="rounded-xl border border-border/60 bg-background px-4 py-2.5 text-center shadow-sm">
                  <p className="text-sm font-bold text-foreground">{step.ar}</p>
                  <p className="text-[10px] text-muted-foreground">{step.en}</p>
                </div>
                {i < chainSteps.length - 1 && (
                  <span className="text-muted-foreground/30 text-lg">←</span>
                )}
              </div>
            ))}
          </div>

          <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-primary/15 bg-primary/[0.04] p-6 text-center">
            <p className="text-sm leading-7 text-foreground">
              <strong>AQLIYA ليست مجموعة تطبيقات منفصلة.</strong> كل منتج أو تطبيق داخل عقلية يعمل فوق منصة موحدة تجمع البيانات وسير العمل والقرارات والأدلة والحوكمة وسجل التدقيق والمعرفة — لتحويل المؤسسات من العمل المعتمد على الأفراد والأدوات المتفرقة إلى العمل المعتمد على الحوكمة والمعرفة والذكاء المؤسسي.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          § 3 — PRODUCTS
          أربعة منتجات، كلها حقيقية
          ════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            أنظمة أعمال متخصصة
          </span>
          <h2 className="mt-5 text-3xl font-black text-foreground sm:text-4xl">
            أربعة منتجات. منصة واحدة.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            كل منتج يحل تحدياً تشغيلياً محدداً داخل المؤسسة. جميعها تعمل فوق AQLIYA Intelligence Core وتشترك في نفس بنية الحوكمة والأدلة وسجل التدقيق.
          </p>
        </div>

        <div className="mt-12 space-y-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl border border-border/70 bg-gradient-to-br from-background to-muted/20 p-6 transition-all hover:shadow-sm sm:p-7"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h3 className="text-lg font-black text-foreground">
                      {product.name}
                    </h3>
                    <span className="text-sm font-medium text-muted-foreground">
                      — {product.tagline}
                    </span>
                    <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary border border-primary/15">
                      {product.maturity}
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground max-w-2xl">
                    {product.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.capabilities.map((cap) => (
                      <span key={cap} className="rounded-lg border border-border/40 bg-background/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Link href={product.href} className="btn-outline h-9 px-5 text-sm">
                    تفاصيل النظام
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/products" className="btn-primary h-12 px-8 text-base">
            استعرض جميع المنتجات
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          § 4 — PLATFORM
          البنية الأساسية المشتركة
          ════════════════════════════════════════════ */}
      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-aqliya-cyan">
              البنية الأساسية المشتركة
            </span>
            <h2 className="mt-5 text-3xl font-black text-white sm:text-4xl">
              منصة موحدة — تستفيد منها كل المنتجات
            </h2>
            <p className="mt-4 text-base leading-7 text-white/60">
              DecisionOS، SalesOS، AuditOS، LocalContentOS — جميعها تعمل فوق نفس المنصة. لا إعادة بناء الحوكمة لكل منتج. لا تكرار في الصلاحيات أو الأدلة.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {platformLayers.map((layer) => (
              <div
                key={layer.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm"
              >
                <h3 className="text-sm font-bold text-white">{layer.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">{layer.body}</p>
              </div>
            ))}
          </div>

          {/* Office AI Assistant mention */}
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-center">
            <p className="text-sm font-semibold text-aqliya-cyan">Office AI Assistant</p>
            <p className="mt-1 text-sm leading-6 text-white/50">
              مساعد مؤسسي ذكي يعمل ضمن حدود الحوكمة والصلاحيات والأدلة المؤسسية. قدرة مشتركة في جميع منتجات عقلية — يساعد الموظفين على الوصول للمعلومات وإعداد التقارير وإنجاز الأعمال اليومية.
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link href="/platform" className="btn-secondary h-12 px-8 text-base">
              استكشف المنصة
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          § 5 — TRUST PILLARS
          ════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            بنية الثقة المؤسسية
          </span>
          <h2 className="mt-5 text-3xl font-black text-foreground sm:text-4xl">
            الحوكمة ليست طبقة تُضاف — هي الأساس
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            كل نظام في عقلية مبني فوق نفس بنية الثقة. هذه القدرات ليست ادعاءات — هي مُنفَّذة ومُدمجة في كل مسار عمل.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {trustPillars.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/20 p-6"
            >
              <div className="text-xl mb-3">{pillar.icon}</div>
              <h3 className="text-sm font-bold text-foreground">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{pillar.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/governance" className="btn-outline h-10 px-6 text-sm">
            اطلع على بنية الحوكمة
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          § 6 — FINAL CTA
          ════════════════════════════════════════════ */}
      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-8 text-center backdrop-blur-xl sm:p-12">
            <h2 className="text-2xl font-black text-white sm:text-3xl">
              ابدأ بخطوة واحدة محددة
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/60">
              لا نبدأ بعقود ضخمة. نبدأ بنطاق محدد: نختار المنتج المناسب، نحمّل البيانات في بيئة معزولة، نقيّم النتائج معاً. الشفافية مضمونة منذ اليوم الأول.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="btn-primary h-12 px-10 text-base font-bold">
                طلب تجربة
              </Link>
              <Link href="/demo" className="btn-secondary h-12 px-10 text-base">
                جرب AuditOS — ديمو تفاعلي
              </Link>
              <Link href="/executive-brief" className="btn-outline h-12 px-10 text-base">
                قراءة سريعة — الملخص التنفيذي
              </Link>
            </div>

            {/* Supporting links */}
            <div className="mt-8 grid gap-3 text-sm sm:grid-cols-3 border-t border-white/10 pt-8">
              <Link href="/engagement-models" className="rounded-xl border border-white/8 p-4 text-center text-white/45 transition-colors hover:border-white/20 hover:text-white/70">
                <p className="font-semibold text-white/70">نماذج التعاون</p>
                <p className="mt-1 text-xs text-white/40">من تشخيص مجاني إلى نشر كامل</p>
              </Link>
              <Link href="/products" className="rounded-xl border border-white/8 p-4 text-center text-white/45 transition-colors hover:border-white/20 hover:text-white/70">
                <p className="font-semibold text-white/70">المنتجات</p>
                <p className="mt-1 text-xs text-white/40">أربعة أنظمة تشغيل مؤسسية</p>
              </Link>
              <Link href="/about" className="rounded-xl border border-white/8 p-4 text-center text-white/45 transition-colors hover:border-white/20 hover:text-white/70">
                <p className="font-semibold text-white/70">من نحن</p>
                <p className="mt-1 text-xs text-white/40">لماذا وُجدت عقلية</p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
