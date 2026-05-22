import Link from "next/link";
import type { Metadata } from "next";
import {
  SectionEyebrow,
  WorkflowChain,
  ExecutiveSurface,
  BeforeAfterBlock,
} from "@/components/enterprise";
import {
  OperatingSystemMapVisual,
  ProofChainVisual,
} from "@/components/visuals";

export const metadata: Metadata = {
  title: "AQLIYA | منصة ذكاء مؤسسي خاص ومحكوم",
  description:
    "عقلية منصة ذكاء مؤسسي خاص ومحكوم: تجمع الذكاء الاصطناعي مع الحوكمة، الأدلة، المراجعة البشرية، وسجل التدقيق داخل بيئة مؤسسية مضبوطة. الذكاء يساعد. الإنسان يقرر. الدليل يحكم.",
};

// ─── Governance Trust Pillars ────────────────────────────────────────────────
// هذه ليست ادعاءات تسويقية — هي قدرات مُبنية داخل المنصة فعلاً
const trustPillars = [
  {
    icon: "🔗",
    title: "سلسلة الأدلة",
    en: "Evidence Chain",
    body: "كل مخرج مربوط بمصدر بياناته، خطوات معالجته، ومن راجعه واعتمده.",
  },
  {
    icon: "🔐",
    title: "صلاحيات محكومة",
    en: "Role-Based Access",
    body: "RBAC على مستوى كل عملية: من يقرأ، من يراجع، من يعتمد، ومن يُصدر.",
  },
  {
    icon: "📋",
    title: "سجل تدقيق كامل",
    en: "Full Audit Trail",
    body: "كل حدث، تغيير، وقرار مسجل بالهوية والوقت والسياق — لا يمكن حذفه.",
  },
  {
    icon: "👁",
    title: "مراجعة بشرية إلزامية",
    en: "Human Review Gates",
    body: "الذكاء لا يُصدر مخرجًا نهائيًا — كل مخرج يمر عبر مراجعة وموافقة إنسانية.",
  },
  {
    icon: "🏛",
    title: "عزل تام بين المؤسسات",
    en: "Tenant Isolation",
    body: "كل مؤسسة في بيئتها المستقلة — لا تشارك بيانات، لا تداخل صلاحيات.",
  },
  {
    icon: "🛡",
    title: "حدود واضحة للذكاء",
    en: "AI Boundary Rules",
    body: "الذكاء مُقيَّد بدور المساعد: يقترح، يلخص، يصنف — لا يقرر ولا يعتمد.",
  },
];

// ─── Active Systems (real, implemented) ─────────────────────────────────────
const activeSystems = [
  {
    id: "auditos",
    name: "AuditOS",
    tagline: "نظام التدقيق والذكاء المالي",
    status: "proven" as const,
    statusLabel: "مُثبت — L5 Pilot-ready",
    description:
      "مسار مراجعة مالية محكوم بالكامل: من ميزان المراجعة إلى القوائم المالية والإيضاحات والأدلة والمراجعة والاعتماد والتصدير.",
    capabilities: [
      "رفع ميزان المراجعة",
      "ربط الحسابات والتصنيف",
      "القوائم المالية",
      "إدارة الأدلة",
      "مراجعة واعتماد محكومة",
      "تصدير النتائج",
    ],
    href: "/products/audit",
    demoHref: "/auditos",
    hasDemoButton: true,
  },
  {
    id: "decisionos",
    name: "DecisionOS",
    tagline: "حوكمة القرار التنفيذي",
    status: "active" as const,
    statusLabel: "نشط — L4 Usable v0.1",
    description:
      "يحوّل القرار التنفيذي إلى مسار موثق: مشكلة، بدائل، معايير، مخاطر، أدلة، توصية، اعتماد، وسجل مراجعة.",
    capabilities: [
      "تحديد المشكلة والسياق",
      "البدائل والمعايير",
      "تقييم المخاطر",
      "توصية مدعومة بالأدلة",
      "مسار الاعتماد",
      "تصدير مذكرة القرار",
    ],
    href: "/products/decision",
    hasDemoButton: false,
  },
  {
    id: "localcontentos",
    name: "LocalContentOS",
    tagline: "قياس المحتوى المحلي والمنتجات السعودية",
    status: "active" as const,
    statusLabel: "نشط — L4 Usable v0.1",
    description:
      "يوحّد قياس المحتوى المحلي: الموردون، الإنفاق، التصنيف، نسب الالتزام، الفجوات، ومؤشرات الامتثال — داخل مسار حوكمة واحد.",
    capabilities: [
      "سجل الموردين والتصنيف",
      "تتبع الإنفاق والشراء",
      "قياس نسبة المحتوى المحلي",
      "تحديد الفجوات",
      "رفع الأدلة والمستندات",
      "التقارير والتصدير",
    ],
    href: "/products/local-content",
    hasDemoButton: false,
    note: "متاح مع قيود معلنة — راجع صفحة النظام للتفاصيل",
  },
];

// ─── Core Architecture Items ──────────────────────────────────────────────────
const coreCapabilities = [
  { ar: "تنسيق الذكاء", en: "AI Orchestration" },
  { ar: "محرك الحوكمة", en: "Governance Engine" },
  { ar: "محرك سير العمل", en: "Workflow Engine" },
  { ar: "رسم الأدلة", en: "Evidence Graph" },
  { ar: "الصلاحيات والأدوار", en: "RBAC / Permissions" },
  { ar: "سجل التدقيق", en: "Audit Logs" },
  { ar: "ذكاء المستندات", en: "Document Intelligence" },
  { ar: "محرك التقارير", en: "Reporting Engine" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ════════════════════════════════════════════
          § 1 — HERO
          القرار: headline يُعبّر عن قيمة المنصة المؤسسية لا وصف تقني
          CTA: اثنان فقط — executive session (primary) + AuditOS demo (secondary)
          Trust metrics: 3 إشارات مؤسسية حقيقية بدلاً من أرقام مجردة
          ════════════════════════════════════════════ */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/5 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-26 lg:py-30">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
            <div className="flex flex-col justify-center animate-fade-in-up">

              {/* Platform Identity Badge */}
              <div className="mb-7 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/85 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
                  منصة ذكاء مؤسسي خاص ومحكوم
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-status-success/30 bg-status-success/10 px-3 py-1 text-[10px] font-medium text-status-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-success animate-pulse" />
                  AuditOS جاهز للتجربة
                </span>
              </div>

              <p className="text-sm font-bold tracking-[0.24em] text-aqliya-cyan uppercase mb-3">
                AQLIYA — عقلية
              </p>

              {/* Hero Headline — executive framing */}
              <h1 className="text-4xl font-black leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-[3.2rem]">
                حين يعمل الذكاء
                <span className="block mt-1 text-white/75">
                  داخل حوكمة المؤسسة، لا فوقها
                </span>
              </h1>

              {/* Trust Principle — architectural, not marketing */}
              <div className="mt-5 rounded-2xl border border-aqliya-cyan/18 bg-aqliya-cyan/[0.05] px-5 py-4 backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan/80 mb-2">
                  المبدأ المعماري الأساسي
                </p>
                <p className="text-lg font-black text-white">
                  الذكاء يساعد.{"  "}
                  <span className="text-aqliya-cyan">الإنسان يقرر.</span>{"  "}
                  الدليل يحكم.
                </p>
                <p className="mt-1.5 text-[11px] text-white/50">
                  AI assists. Humans decide. Evidence governs.
                </p>
              </div>

              <p className="mt-6 max-w-xl text-base leading-8 text-white/68 sm:text-lg">
                عقلية تبني مسارات تشغيل مؤسسية تربط البيانات، القواعد، الصلاحيات، الأدلة، والمراجعة البشرية داخل بنية واحدة يمكن الوثوق بها — لا أداة ذكاء اصطناعي معزولة.
              </p>

              {/* CTA Pair — two only, clear hierarchy */}
              <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="btn-primary h-12 px-8 text-base font-bold"
                >
                  طلب جلسة تنفيذية
                </Link>
                <Link
                  href="/auditos"
                  className="btn-secondary h-12 px-8 text-base"
                >
                  استكشف AuditOS — عرض مباشر
                </Link>
              </div>

              {/* Trust Signals Row — real system capabilities */}
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: "🔗",
                    title: "سلسلة أدلة كاملة",
                    detail: "كل مخرج مربوط بمصدره، مراجعه، ومعتمده",
                  },
                  {
                    icon: "📋",
                    title: "سجل تدقيق غير قابل للحذف",
                    detail: "كل حدث موثق بالهوية والوقت والسياق",
                  },
                  {
                    icon: "👁",
                    title: "مراجعة بشرية إلزامية",
                    detail: "الذكاء لا يعتمد — الإنسان يعتمد",
                  },
                ].map((sig) => (
                  <div
                    key={sig.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur"
                  >
                    <div className="text-xl mb-2">{sig.icon}</div>
                    <div className="text-sm font-bold text-white">{sig.title}</div>
                    <p className="mt-1.5 text-xs leading-5 text-white/50">{sig.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="animate-scale-in stagger-2">
              <div className="gradient-border rounded-[28px] bg-white/[0.02] p-3 shadow-[0_28px_90px_-36px_rgba(0,0,0,0.7)] backdrop-blur-xl">
                <OperatingSystemMapVisual className="w-full rounded-[22px] glow-accent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          § 2 — THE INSTITUTIONAL GAP
          القرار: سرد المشكلة الحقيقية قبل تقديم الحل
          ════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <SectionEyebrow
          label="الفجوة التشغيلية"
          title="المشكلة ليست في غياب الذكاء — بل في غياب النظام الذي يحكمه"
          description="حين تعمل البيانات في مكان، والموافقات في آخر، والمراجعة في ثالث — تصبح المخرجات سريعة لكنها ضعيفة الثقة. الأثر: قرارات لا يمكن تفسيرها أو مراجعتها أو الدفاع عنها."
        />
        <div className="mt-12">
          <BeforeAfterBlock
            before={[
              "مخرجات ذكاء منفصلة عن سياق العمل",
              "اعتمادات تسير عبر البريد والذاكرة",
              "موافقات غير موثقة بالهوية أو الوقت",
              "أدلة منفصلة عن القرار الذي استندت إليه",
              "لا يمكن مساءلة أي خطوة بعد مرورها",
            ]}
            after={[
              "مسار عمل محكوم بقواعد وصلاحيات",
              "مخرجات مرتبطة بسلسلة أدلة كاملة",
              "اعتمادات موثقة بالهوية والوقت والسياق",
              "سجل تدقيق غير قابل للتعديل أو الحذف",
              "كل خطوة قابلة للمراجعة والتفسير",
            ]}
          />
        </div>
      </section>

      {/* ════════════════════════════════════════════
          § 3 — AQLIYA INTELLIGENCE CORE
          القرار: تقديم المنصة كبنية مؤسسية، لا كمجموعة أدوات
          ════════════════════════════════════════════ */}
      <section className="section-gradient-light border-t">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <SectionEyebrow
            label="AQLIYA Intelligence Core"
            title="نواة مشتركة واحدة — تبني عليها كل الأنظمة"
            description="بدلاً من شراء أدوات منفصلة لكل نطاق، AQLIYA Intelligence Core يوفر المنطق الحوكمي الموحد: الصلاحيات، الأدلة، سير العمل، والمراجعة — يُعاد استخدامه في كل نظام جديد دون بناء من الصفر."
          />

          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-start">
            {/* Core Capabilities Grid */}
            <ExecutiveSurface>
              <div className="mb-5 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
                  AQLIYA Intelligence Core
                </p>
                <Link
                  href="/platform"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  استكشف المنصة ←
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {coreCapabilities.map((cap) => (
                  <div
                    key={cap.en}
                    className="glass-card-light p-4 text-right"
                  >
                    <p className="text-sm font-bold text-foreground">{cap.ar}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{cap.en}</p>
                  </div>
                ))}
              </div>
            </ExecutiveSurface>

            {/* Core Value Proposition */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.05] to-background p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  الأثر الاستراتيجي
                </p>
                <h3 className="mt-3 text-xl font-black text-foreground leading-snug">
                  كل نظام جديد يُبنى فوق نفس منطق الحوكمة
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  هذا يعني أن إضافة نطاق تشغيلي جديد لا يتطلب إعادة بناء حوكمة من الصفر — بل ربط النطاق الجديد بالنواة المشتركة.
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  طبقة النشر
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">سحابة عقلية</span>
                    <span className="rounded-full bg-status-success/15 px-2 py-0.5 text-[10px] font-bold text-status-success">متاح الآن</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">خوادم خاصة</span>
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600">قيد التطوير</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">بيئة معزولة</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">استراتيجي</span>
                  </div>
                </div>
                <Link href="/governance" className="mt-4 block text-xs font-semibold text-primary hover:underline">
                  اطلع على بنية الحوكمة والأمان ←
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          § 4 — ACTIVE SYSTEMS
          القرار: عرض الأنظمة الحقيقية فقط بالـ tier الصحيح لكل نظام
          SalesOS/SimulationOS تُحذف من هذا القسم — تظهر في /products فقط
          ════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <SectionEyebrow
          label="الأنظمة النشطة"
          title="أنظمة مؤسسية تعمل الآن فوق AQLIYA Intelligence Core"
          description="ثلاثة أنظمة مُبنية ومُشغَّلة. كل نظام يشارك نفس منطق الحوكمة، الأدلة، والمراجعة — ويُضاف إليها باستمرار."
        />

        <div className="mt-12 space-y-6">
          {activeSystems.map((system) => (
            <div
              key={system.id}
              className={`rounded-2xl border p-6 transition-all duration-200 hover:shadow-sm sm:p-7 ${
                system.status === "proven"
                  ? "border-aqliya-cyan/25 bg-gradient-to-br from-aqliya-cyan/[0.04] to-background"
                  : "border-border/70 bg-gradient-to-br from-muted/20 to-background"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h3 className="text-lg font-black text-foreground">
                      {system.name}
                    </h3>
                    <span className="text-sm font-medium text-muted-foreground">
                      — {system.tagline}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        system.status === "proven"
                          ? "bg-aqliya-cyan/15 text-aqliya-cyan border border-aqliya-cyan/20"
                          : "bg-primary/10 text-primary border border-primary/15"
                      }`}
                    >
                      {system.statusLabel}
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground max-w-2xl">
                    {system.description}
                  </p>
                  {system.note && (
                    <p className="mt-2 text-xs text-amber-600/80 font-medium">
                      ⚠ {system.note}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {system.hasDemoButton && system.demoHref && (
                    <Link
                      href={system.demoHref}
                      className="btn-primary h-9 px-5 text-sm"
                    >
                      عرض تفاعلي
                    </Link>
                  )}
                  <Link
                    href={system.href}
                    className="btn-outline h-9 px-5 text-sm"
                  >
                    تفاصيل النظام
                  </Link>
                </div>
              </div>

              {/* Capabilities Grid */}
              <div className="mt-5 grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                {system.capabilities.map((cap, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border/40 bg-background/60 px-3 py-2 text-center"
                  >
                    <p className="text-[11px] font-medium text-muted-foreground leading-5">{cap}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between rounded-2xl border border-border/50 bg-muted/20 p-5">
          <div>
            <p className="text-sm font-bold text-foreground">خطوط أنظمة إضافية قيد التطوير</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              SalesOS، SimulationOS — قيد التطوير والتخطيط الاستراتيجي
            </p>
          </div>
          <Link href="/products" className="btn-outline h-9 px-5 text-sm shrink-0">
            عرض كل الأنظمة
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          § 5 — AUDITOS PROOF PRODUCT
          القرار: AuditOS هو "إثبات المنصة" — يُعرض بعمق لأنه الدليل الحقيقي
          ════════════════════════════════════════════ */}
      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-aqliya-cyan/30 bg-aqliya-cyan/10 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-aqliya-cyan">
                <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
                Proof Product — AuditOS
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-status-success/30 bg-status-success/10 px-3 py-1 text-[10px] font-medium text-status-success">
                <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
                جاهز للعرض الآن
              </span>
            </div>

            <h2 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
              AuditOS — كيف تبدو المنصة المؤسسية حين تعمل فعلاً
            </h2>
            <p className="mt-4 text-base leading-8 text-white/62 max-w-3xl">
              AuditOS ليس مجرد منتج تدقيق مالي — هو الإثبات الحي أن AQLIYA Intelligence Core يمكنه تحويل عملية مؤسسية كاملة إلى مسار محكوم. من ميزان المراجعة الخام إلى الاعتماد النهائي، كل خطوة موثقة، مرتبطة بالأدلة، وقابلة للمراجعة.
            </p>

            {/* Workflow Chain */}
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-aqliya-cyan/70 mb-4">
                مسار العمل الكامل
              </p>
              <WorkflowChain
                steps={[
                  "ميزان المراجعة",
                  "ربط الحسابات",
                  "القوائم المالية",
                  "الإيضاحات",
                  "الأدلة",
                  "المراجعة",
                  "الاعتماد",
                  "التصدير",
                ]}
                className="justify-start"
              />
            </div>

            {/* Proof Points */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "سلسلة التتبع",
                  body: "كل مخرج مالي مربوط بالبيانات الأصلية، خطوات المعالجة، ومسار الاعتماد الكامل.",
                },
                {
                  label: "الحوكمة الفعلية",
                  body: "مراجعة بشرية إلزامية قبل أي تصدير. الذكاء يقترح، المراجع يقرر، الاعتماد موثق.",
                },
                {
                  label: "المخرجات المؤسسية",
                  body: "قوائم مالية، إيضاحات، توصيات إعادة تصنيف، تقارير الأدلة، سجل المراجعة الكامل.",
                },
              ].map((pt) => (
                <div
                  key={pt.label}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 backdrop-blur"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-aqliya-cyan/75 mb-2">
                    {pt.label}
                  </p>
                  <p className="text-sm leading-6 text-white/65">{pt.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-4">
              <Link href="/auditos" className="btn-primary px-7">
                شاهد AuditOS — عرض تفاعلي
              </Link>
              <Link href="/products/audit" className="btn-secondary px-7">
                تفاصيل النظام الكاملة
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          § 6 — ENTERPRISE GOVERNANCE LAYER
          القرار: إظهار بنية الثقة بشكل مرئي — هذا ما يحسم قرار Enterprise buyer
          ════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <SectionEyebrow
          label="بنية الثقة المؤسسية"
          title="الحوكمة ليست طبقة تُضاف — هي البنية الأساسية"
          description="كل نظام تحت عقلية مبني فوق نفس بنية الثقة. هذه القدرات ليست ادعاءات — هي مُنفَّذة ومُدمجة في كل مسار عمل."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trustPillars.map((pillar) => (
            <div
              key={pillar.en}
              className="rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/20 p-6 transition-all duration-200 hover:border-primary/20 hover:shadow-sm"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-lg">
                  {pillar.icon}
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">{pillar.title}</p>
                  <p className="text-[10px] text-muted-foreground">{pillar.en}</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{pillar.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between rounded-2xl border border-primary/15 bg-primary/[0.04] p-5">
          <div>
            <p className="text-sm font-bold text-foreground">بنية الحوكمة والأمان الكاملة</p>
            <p className="text-xs text-muted-foreground mt-0.5">RBAC، Tenant Isolation، Evidence Graph، AI Boundaries</p>
          </div>
          <Link href="/governance" className="btn-outline h-9 px-5 text-sm shrink-0">
            اطلع على بنية الحوكمة
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          § 7 — PROOF CHAIN VISUAL
          ════════════════════════════════════════════ */}
      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              من البيانات إلى القرار
            </span>
            <h2 className="mt-5 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
              كل مخرج يمكن إرجاعه إلى أصله
            </h2>
            <p className="mt-4 text-base leading-7 text-white/55">
              حين يسأل المدير أو المدقق أو المراجع الخارجي: &ldquo;كيف وصلنا إلى هذا القرار؟&rdquo; — الإجابة داخل النظام، لا في الذاكرة ولا في سلاسل البريد.
            </p>
          </div>
          <ProofChainVisual />
        </div>
      </section>

      {/* ════════════════════════════════════════════
          § 8 — EXECUTIVE CTA
          القرار: CTA واحد قوي — لا منافسة، لا تشتت
          ════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-border/60 bg-gradient-to-br from-primary/[0.04] via-background to-aqliya-cyan/[0.03] p-8 text-center shadow-sm sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
            ابدأ من نطاقك المؤسسي
          </p>
          <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight text-foreground sm:text-3xl">
            إذا كانت لديك عملية مؤسسية تحتاج حوكمة وأدلة وتتبعاً —
            <span className="block text-primary mt-1">
              عقلية تحوّلها إلى نظام قابل للمساءلة
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
            ابدأ بجلسة تنفيذية: نفهم النطاق، نحدد الأنظمة المناسبة، ونضع مسارًا واضحًا وواقعيًا.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn-primary h-12 px-10 text-base font-bold">
              طلب جلسة تنفيذية
            </Link>
            <Link href="/demo" className="btn-secondary h-12 px-10 text-base">
              مشاهدة الديمو
            </Link>
            <Link href="/platform" className="btn-outline h-12 px-10 text-base">
              استكشف المنصة
            </Link>
          </div>

          {/* Supporting CTAs */}
          <div className="mt-8 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4 border-t border-border/40 pt-8">
            {[
              { label: "دراسات الحالة", sub: "سيناريوهات موثقة وأدلة", href: "/case-studies" },
              { label: "نماذج التعاون", sub: "من تشخيص مجاني إلى نشر كامل", href: "/engagement-models" },
              { label: "حالات الاستخدام", sub: "كيف تستفيد مؤسستك من المنصة", href: "/use-cases" },
              { label: "للمشترين", sub: "CFO · CIO · شريك التدقيق · حكومة", href: "/buyers/cfo" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-border/50 p-4 text-center transition-colors hover:border-primary/25 hover:bg-muted/30"
              >
                <p className="font-semibold text-foreground">{link.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{link.sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
