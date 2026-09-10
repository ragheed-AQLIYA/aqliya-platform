import Link from "next/link";
import type { Metadata } from "next";
import { SectionEyebrow } from "@/components/enterprise";
import { OperatingSystemMapVisual } from "@/components/visuals";
import { Reveal } from "@/components/marketing/reveal";
import { publicOsStatus } from "@/lib/marketing/public-status";
import { buildAlternates } from "@/lib/marketing/seo";

export function generateMetadata(): Metadata {
  const title = "المنصة — Intelligence Core";
  const description =
    "البنية الأساسية المشتركة التي تعتمد عليها جميع أنظمة عقلية  حوكمة، سير عمل، أدلة، وسجل تدقيق في نواة واحدة.";
  return {
    title,
    description,
    alternates: buildAlternates("/platform"),
  };
}

const deploymentModels = [
  {
    id: "cloud",
    title: "AQLIYA Cloud",
    titleAr: "سحابة عقلية",
    status: "available",
    statusLabel: "متاح الآن",
    description:
      "نسخة سحابية مُدارة بالكامل مع تحديثات تشغيلية مستمرة. مناسبة للمؤسسات التي لا تحتاج إدارة بنية تحتية داخلية.",
    points: [
      "نشر فوري دون إعداد بنية تحتية",
      "تحديثات وتحسينات تلقائية",
      "عزل تام بين المؤسسات (Tenant Isolation)",
      "النسخ الاحتياطي والتوافر العالي مُدارَان",
    ],
  },
  {
    id: "private",
    title: "AQLIYA Private",
    titleAr: "خوادم خاصة",
    status: "planned",
    statusLabel: "قيد التخطيط",
    description:
      "اتجاه استراتيجي لنشر داخل بنية المؤسسة مع تحكم محلي في البيانات. ليس حزمة إنتاج جاهزة، ويخضع لتقييم وتصميم مشترك.",
    points: [
      "الهدف: بقاء البيانات داخل بنية المؤسسة",
      "الهدف: تحكم كامل في قواعد البيانات والتخزين",
      "يعتمد على اكتمال نموذج السحابة أولًا",
      "مخطط فقط — ليس عرض شراء جاهزًا للتسليم",
    ],
  },
  {
    id: "airgapped",
    title: "AQLIYA Air-Gapped",
    titleAr: "بيئة معزولة",
    status: "strategic",
    statusLabel: "استراتيجي",
    description:
      "نشر كامل داخل بيئة معزولة بدون اتصال بالإنترنت مع معالجة محلية كاملة. مخصص للمؤسسات ذات المتطلبات الأمنية القصوى  يتطلب تعاوناً هندسياً مسبقاً.",
    points: [
      "معالجة كاملة داخل الشبكة الداخلية",
      "لا اتصال بأي خدمة خارجية",
      "يعتمد على اكتمال نموذج الخوادم الخاصة",
      "متوقع للمؤسسات الحكومية والأمنية",
    ],
  },
];

const operatingSystems = [
  {
    useCase: "إدارة ارتباطات المراجعة",
    system: "AuditOS",
    description: "من قبول العميل إلى التقرير  دورة مراجعة كاملة محكومة.",
    statusLabel: publicOsStatus.auditOS.label,
    href: "/products/audit",
  },
  {
    useCase: "برامج المحتوى المحلي",
    system: "LocalContentOS",
    description: "موردون، إنفاق، عقود، امتثال، وتقارير  للسوق السعودي.",
    statusLabel: publicOsStatus.localContentOS.label,
    href: "/products/local-content",
  },
  {
    useCase: "الذاكرة التجارية المؤسسية",
    system: "SalesOS",
    description: "تأهيل، فرص، ومتابعة  في خارطة المنصة.",
    statusLabel: publicOsStatus.salesOS.label,
    href: "/products/sales",
  },
];

const platformLayers = [
  {
    num: "01",
    title: "طبقة الحوكمة",
    en: "Governance Layer",
    contains: "الصلاحيات، سجل التدقيق، بوابات الاعتماد، عزل المؤسسات",
    body: "تُطبّق قواعد الحوكمة على كل عملية: من يملك الصلاحية، ما هي بوابات الموافقة، وكيف تُدار حالات الاستثناء. نموذج صلاحيات متعدد الطبقات على مستوى المؤسسة والمشروع والإجراء الفردي. كل حدث يُسجَّل في سجل غير قابل للتعديل أو الحذف.",
    boundary: "لا صلاحية ضمنيةكل وصول مُحدَّد صراحةً",
    for: "لمن تحتاج المؤسسة صلاحية الوصول؟ من يراجع قبل الاعتماد؟",
  },
  {
    num: "02",
    title: "قاعدة المعرفة",
    en: "Knowledge Foundation",
    contains: "شبكة الأدلة، نماذج البيانات، الذاكرة المؤسسية",
    body: "يُنشئ ويُحافظ على شجرة أدلة مترابطة: كل مخرج  تقرير، قرار، ملاحظة  مرتبط بسلسلة أدلة تصل إلى المصادر الأصلية: الملفات، السجلات، البيانات، أو التعليقات. لا مخرج بدون سلسلة أدلة مكتملة.",
    boundary: "لا مخرج بدون سلسلة أدلة مكتملة",
    for: "على أي أساس صدر هذا المخرج؟ ما مصدر كل رقم؟",
  },
  {
    num: "03",
    title: "مشغّلات الذكاء",
    en: "Intelligence Operators",
    contains: "تنسيق الذكاء، محرك سير العمل، طبقة التكاملات",
    body: "نواة الذكاء الاصطناعي المشتركة تُنسّق الطلبات عبر جميع الأنظمة  كل استدعاء مقيد بحدود صلاحية وسياق. محرك سير العمل يدير حالات العمل من المسودة إلى الاعتماد مع بوابات لا يمكن تجاوزها. طبقة التكاملات تربط المنصة مع الأنظمة الخارجية مع تسجيل لكل طلب واستجابة.",
    boundary: "الذكاء يقترح ويساعدلا يقرر ولا يعتمد",
    for: "كيف يتحرك العمل من الإدخال إلى المخرجات؟ بأي ترتيب؟",
  },
  {
    num: "04",
    title: "أنظمة التشغيل",
    en: "Operating Systems",
    contains: "AuditOS، LocalContentOS، SalesOS، وقدرات مشتركة",
    body: "كل نظام تشغيل يرث تلقائياً الطبقات الثلاث تحته  الحوكمة، قاعدة المعرفة، والمشغّلات  دون إعادة بناء. الفرق بين نظام وآخر هو المجال التطبيقي ومسارات العمل، وليس البنية الأساسية.",
    boundary: "كل نظام يرث المنصةلا إعادة اختراع",
    for: "كيف يُطبَّق هذا في مجالي: تدقيق، محتوى محلي، أو مبيعات؟",
  },
];

const governedWorkflow = [
  { step: "طلب إجراء", detail: "مستخدم داخل صلاحياته يبدأ طلباً", layer: "Governance" },
  { step: "التحقق من الصلاحية", detail: "المنصة تتأكد من هوية المستخدم ودوره وصلاحيته", layer: "Governance" },
  { step: "جلب السياق", detail: "سحب البيانات والأدلة المرتبطة من قاعدة المعرفة", layer: "Knowledge" },
  { step: "معالجة الذكاء", detail: "AI يُنتج مسودة ضمن حدود السياق  لا يتجاوزها", layer: "Operators" },
  { step: "مراجعة بشرية", detail: "المستخدم أو المراجع يراجع ويعدّل قبل الاعتماد", layer: "Governance" },
  { step: "اعتماد", detail: "اعتماد رسمي يُوثَّق في سجل التدقيق", layer: "Governance" },
  { step: "تسجيل + أرشفة", detail: "كل خطوة تُسجَّل  لا تعديل بعد الاعتماد", layer: "Governance" },
];

export default function PlatformPage() {
  return (
    <div className="flex flex-col">

      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="relative mx-auto max-w-5xl">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
                <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
                AQLIYA Intelligence Core
              </span>
            </div>
            <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              طبقة واحدة تربط الحوكمة والمعرفة والذكاء
              <span className="block text-white/72 mt-1">
                لتُنتج أنظمة تشغيل مؤسسية متخصصة
              </span>
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/62 sm:text-lg">
              AQLIYA ليست أداة ذكاء منفصلة ولا مجموعة منتجات. هي منصة حاكمة 
              أربع طبقات (حوكمة، معرفة، مشغّلات، أنظمة) تجعل كل نظام يُبنى
              عليها يرث تلقائياً الصلاحيات، الأدلة، سير العمل، وسجل التدقيق
               بدون إعادة بناء من الصفر.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <Link href="/contact" className="btn-primary h-12 px-8 text-base">
                طلب جلسة تنفيذية
              </Link>
              <Link href="/governance" className="btn-secondary h-12 px-8 text-base">
                بنية الحوكمة والأمان
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-gradient-light border-t">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <SectionEyebrow
            label="الخريطة المعمارية"
            title="بنية المنصة من الأساس إلى أنظمة التشغيل"
            description="AQLIYA Intelligence Core يُشكّل الطبقة الوسطى بين البنية التحتية وأنظمة التشغيل المؤسسية  كل نظام يستفيد من نفس المكونات المشتركة دون تكرار."
          />
          <div className="mt-12">
            <div className="gradient-border rounded-[24px] bg-white/[0.01] p-4 shadow-sm">
              <OperatingSystemMapVisual className="w-full rounded-[18px]" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Why Platform ──────────────────────────────── */}
      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            لماذا منصة لا أداة؟
          </span>
          <h2 className="mt-6 text-3xl font-black text-foreground sm:text-4xl leading-[1.12]">
            المؤسسة المنظَّمة تحتاج طبقة تشغيل  لا أداة تعزل الذكاء عن المسؤولية
          </h2>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            الأداة تحل مشكلة واحدة. المنصة تُنظّم تشغيل المؤسسة بالكامل.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-background to-red-500/[0.03] p-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-red-600/80">الأداة فقط</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-500/50" />مخرجات ذكاء بدون مسار مراجعة مؤسسي</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-500/50" />كل نطاق يحتاج أداة جديدة من الصفر</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-500/50" />الصلاحيات والأدلة تُدار خارج النظام</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-500/50" />التوسع يعني أداة جديدة ≠ توسع مؤسسي</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-background to-emerald-500/[0.04] p-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600/80">منصة عقلية</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/50" />كل مخرج يمر بحوكمة وأدلة قبل الاعتماد</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/50" />كل نظام يرث الحوكمة والذكاء من منصة واحدة</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/50" />صلاحيات وأدلة جزء من بنية المنصة  لا إدارة منفصلة</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/50" />التوسع بإضافة نظام تشغيل جديد فوق نفس المنصة</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── The 4 Layers ──────────────────────────────── */}
      <section className="section-gradient-light border-t">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <SectionEyebrow
            label="الطبقات الأربع"
            title="بنية المنصة من الحوكمة إلى أنظمة التشغيل"
            description="أربع طبقات متراصة  كل طبقة تخدم التي تعلوها. كل نظام تشغيل يستفيد من الثلاث طبقات تحته دون تكرار."
          />

          <div className="mt-12 relative">
            {/* Vertical connector line */}
            <div className="absolute right-[15px] top-8 bottom-8 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-border/40 hidden lg:block" />

            <div className="space-y-4">
              {[...platformLayers].reverse().map((layer, _i) => (
                <Reveal
                  key={layer.num}
                  delay={_i * 70}
                  className="relative rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/20 p-6 transition-all hover:border-primary/20 hover:shadow-sm"
                >
                  <div className="flex items-start gap-5">
                    <div className="hidden lg:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-black text-primary">
                      {layer.num}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
                        <h3 className="text-base font-black text-foreground">
                          {layer.title}
                        </h3>
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {layer.en}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50">
                           {layer.contains}
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {layer.body}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-primary/15 bg-primary/[0.04] px-3 py-1.5">
                          <span className="h-1 w-1 rounded-full bg-primary/60" />
                          <span className="text-[11px] font-semibold text-primary/80">
                            {layer.boundary}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground/60 italic">
                          {layer.for}
                        </span>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Governed Workflow ─────────────────────────── */}
      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <SectionEyebrow
          label="التدفق المحكوم"
          title="كيف يتدفّق العمل عبر طبقات المنصة في إجراء واحد"
          description="من لحظة بدء الطلب إلى التسجيل النهائي  كل خطوة تمر عبر طبقة محددة وبوابة صلاحية واضحة."
        />

        <div className="mt-10 relative">
          <div className="absolute right-[7px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary/30 via-primary/15 to-border/30 hidden sm:block" />
          <div className="space-y-3">
            {governedWorkflow.map((wf, i) => (
              <div key={wf.step} className="relative flex items-start gap-4 rounded-xl border border-border/50 bg-background p-4">
                <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <span className="text-[9px] font-black text-primary">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-bold text-foreground">{wf.step}</span>
                    <span className={`text-[9px] font-semibold uppercase tracking-wider ${
                      wf.layer === "Governance" ? "text-primary/70" : "text-aqliya-cyan/70"
                    }`}>
                      {wf.layer}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{wf.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5 text-center">
          <p className="text-sm text-amber-700/90">
            <span className="font-bold">النتيجة:</span> كل مخرج  تقرير، قرار، ملاحظة  له سجل كامل يمكن تتبعه
            من المصدر إلى الاعتماد. لا خطوة بدون توقيت، ولا مخرج بدون مصدر.
          </p>
        </div>
      </section>

      {/* ─── Systems on the Platform ───────────────────── */}
      <section
        id="capabilities"
        className="section-gradient-light border-t scroll-mt-20"
      >
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <SectionEyebrow
            label="الأنظمة كتجسيد للمنصة"
            title="المنصة تُطبَّق عبر أنظمة تشغيل  لا منتجات منفصلة"
            description="كل نظام تشغيل هو تجسيد للطبقات الأربع في مجال مؤسسي محدّد. الفرق هو التطبيق، وليس البنية."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {operatingSystems.map((sys, i) => (
              <Reveal key={sys.system} delay={i * 70}>
              <Link
                href={sys.href}
                className="group block rounded-2xl border border-border/70 bg-gradient-to-br from-background to-muted/15 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-base font-black text-foreground group-hover:text-primary">
                    {sys.useCase}
                  </h3>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-[9px] font-bold text-primary">
                    {sys.statusLabel}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{sys.description}</p>
                <p className="mt-3 text-[10px] font-medium text-muted-foreground/60">
                  نظام التشغيل: {sys.system}
                </p>
              </Link>
              </Reveal>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Office AI Assistant قدرة مشتركة عبر المنصة  مساعد مؤسسي محكوم ضمن
            الصلاحيات والأدلة.{" "}
            <Link
              href="/products/office-ai"
              className="text-primary underline underline-offset-4"
            >
              التفاصيل
            </Link>
          </p>
          <p className="mt-4 text-center text-xs text-muted-foreground/70">
            SalesOS في خارطة المنصة {" "}
            <Link
              href="/products/sales"
              className="text-primary underline underline-offset-4"
            >
              استكشف الخط القادم
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="section-gradient-light border-t">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <SectionEyebrow
            label="نماذج النشر"
            title="نموذج النشر يُحدد من يتحكم في البيانات والبنية"
            description="كل نموذج نشر يُحافظ على نفس مكونات المنصة  الفرق هو موقع التشغيل ودرجة السيادة على البيانات."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {deploymentModels.map((model, i) => (
              <Reveal
                key={model.id}
                delay={i * 70}
                className={`rounded-2xl border p-6 ${
                  model.status === "available"
                    ? "border-status-success/25 bg-gradient-to-br from-status-success/[0.05] to-background"
                    : model.status === "planned"
                    ? "border-amber-500/20 bg-gradient-to-br from-amber-500/[0.04] to-background"
                    : "border-border/40 bg-muted/10"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-black text-foreground">
                      {model.titleAr}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">{model.title}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                      model.status === "available"
                        ? "bg-status-success/15 text-status-success"
                        : model.status === "planned"
                        ? "bg-amber-500/15 text-amber-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {model.statusLabel}
                  </span>
                </div>
                <p className="text-xs leading-6 text-muted-foreground mb-4">
                  {model.description}
                </p>
                <ul className="space-y-2">
                  {model.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                      {point}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            تفاصيل الحوكمة والأمان لكل نموذج متاحة في{" "}
            <Link href="/governance" className="text-primary underline underline-offset-4">
              صفحة الحوكمة
            </Link>
          </p>
        </div>
      </section>

      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl rounded-[24px] border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-aqliya-cyan mb-4">
              ابدأ مع عقلية
            </p>
            <h2 className="text-2xl font-black text-white sm:text-3xl">
              جاهز لبناء أنظمتك المؤسسية فوق منصة عقلية؟
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/55">
              جلسة تنفيذية لفهم نطاق مؤسستك وتحديد أنظمة التشغيل المناسبة ووضع مسار
              تشغيلي واقعي.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="btn-primary h-11 px-8">
                احجز جلسة تشخيص
              </Link>
              <Link href="/proof" className="btn-secondary h-11 px-8">
                مركز الإثبات
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
