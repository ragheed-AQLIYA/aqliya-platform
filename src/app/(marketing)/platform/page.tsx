import Link from "next/link";
import type { Metadata } from "next";
import { SectionEyebrow } from "@/components/enterprise";
import { OperatingSystemMapVisual } from "@/components/visuals";

export const metadata: Metadata = {
  title: "المنصة | AQLIYA Intelligence Core",
  description:
    "البنية الأساسية المشتركة التي تعتمد عليها جميع أنظمة عقلية — حوكمة، سير عمل، أدلة، وسجل تدقيق في نواة واحدة.",
};

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
    statusLabel: "قيد التطوير",
    description:
      "نشر داخل بنية تحتية المؤسسة مع قاعدة بيانات محلية وتحكم كامل في البيانات. قيد التطوير للمؤسسات ذات المتطلبات الأمنية العالية.",
    points: [
      "بيانات تبقى داخل بنية المؤسسة",
      "تحكم كامل في قواعد البيانات والتخزين",
      "يعتمد على اكتمال نموذج السحابة",
      "متاح لعملاء منتقَين خلال مرحلة التطوير",
    ],
  },
  {
    id: "airgapped",
    title: "AQLIYA Air-Gapped",
    titleAr: "بيئة معزولة",
    status: "strategic",
    statusLabel: "استراتيجي",
    description:
      "نشر كامل داخل بيئة معزولة بدون اتصال بالإنترنت مع معالجة محلية كاملة. مخصص للمؤسسات ذات المتطلبات الأمنية القصوى — يتطلب تعاوناً هندسياً مسبقاً.",
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
    description: "من قبول العميل إلى التقرير — دورة مراجعة كاملة محكومة.",
    status: "pilot-ready",
    statusLabel: "جاهز للبايلوت",
    href: "/products/audit",
  },
  {
    useCase: "توثيق القرارات المؤسسية",
    system: "DecisionOS",
    description: "بدائل، مخاطر، أدلة، توصية، واعتماد — في مسار واحد.",
    status: "active",
    statusLabel: "نشط",
    href: "/products/decision",
  },
  {
    useCase: "برامج المحتوى المحلي",
    system: "LocalContentOS",
    description: "موردون، إنفاق، عقود، امتثال، وتقارير — للسوق السعودي.",
    status: "pilot-ready",
    statusLabel: "بايلوت منسّق",
    href: "/products/local-content",
  },
];

const platformComponents = [
  {
    title: "AQLIYA Intelligence Core",
    ar: "القلب الذكي للمنصة",
    body: "نواة الذكاء الاصطناعي المشتركة التي تُنسّق طلبات الذكاء عبر جميع الأنظمة. كل استدعاء مُقيّد بحدود صلاحية وسياق، وكل مخرج يمر عبر مراجعة قبل الاستخدام. لا استدعاء بدون تتبع ولا مخرجات بدون تدقيق.",
    boundary: "الذكاء يقترح ويساعد — لا يقرر ولا يعتمد",
  },
  {
    title: "Workflow Engine",
    ar: "محرك سير العمل",
    body: "يدير حالات العمل ومراحله من المسودة إلى الاعتماد النهائي. يدعم التوازي والانتقالات الشرطية وبوابات الموافقة. لا يُمكن تجاوز أي مرحلة إلزامية، وكل انتقال يُسجّل في سجل التدقيق.",
    boundary: "لا تجاوز لبوابات الاعتماد الإلزامية",
  },
  {
    title: "Governance Layer",
    ar: "طبقة الحوكمة",
    body: "تُطبّق قواعد الحوكمة على كل عملية: من يملك الصلاحية، ما هي بوابات الموافقة، وكيف تُدار حالات الاستثناء. نموذج صلاحيات متعدد الطبقات على مستوى المؤسسة والمشروع والإجراء الفردي.",
    boundary: "مبدأ الحد الأدنى من الصلاحيات في كل سياق",
  },
  {
    title: "Integration Layer",
    ar: "طبقة التكاملات",
    body: "تربط المنصة مع الأنظمة الخارجية — ERP، أنظمة الموارد البشرية، قواعد البيانات الداخلية، ومنصات التخزين. كل تكامل يمر عبر فتحات موحَّدة مع تسجيل لكل طلب واستجابة وتدقيق للبيانات المنقولة.",
    boundary: "كل تكامل مُسجَّل ومراقَب — لا نقل بيانات بدون تتبع",
  },
  {
    title: "Evidence Graph",
    ar: "شبكة الأدلة المؤسسية",
    body: "يُنشئ ويُحافظ على شجرة أدلة مترابطة: كل مخرج — تقرير، قرار، ملاحظة — مرتبط بسلسلة أدلة تصل إلى المصادر الأصلية: الملفات، السجلات، البيانات، أو التعليقات. لا مخرج بدون سلسلة أدلة مكتملة.",
    boundary: "لا مخرج بدون سلسلة أدلة مكتملة",
  },
  {
    title: "Audit Trail",
    ar: "سجل التدقيق المركزي",
    body: "كل حدث وتغيير وقرار يُسجَّل في سجل غير قابل للتعديل أو الحذف: الهوية، الوقت، السياق، والقيمة السابقة والجديدة لكل كيان. يضمن المساءلة الكاملة ويمكّن المراجعين من تتبع أي إجراء.",
    boundary: "غير قابل للحذف — بما في ذلك من قِبل المسؤولين",
  },
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
              البنية الأساسية المشتركة التي تعتمد عليها
              <span className="block text-white/72 mt-1">
                جميع منتجات وتطبيقات عقلية
              </span>
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/62 sm:text-lg">
              AQLIYA Intelligence Core ليست مجرد منصة تقنية. هي بنية حوكمية
              مشتركة تجعل كل منتج يُبنى عليها يرث تلقائياً منطق الذكاء المقيد،
              سير العمل، الصلاحيات، الأدلة، وسجل التدقيق — بدون إعادة بناء من
              الصفر.
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
            title="بنية المنصة من الأساس إلى المنتجات"
            description="AQLIYA Intelligence Core يُشكّل الطبقة الوسطى بين البنية التحتية والمنتجات المؤسسية — كل منتج يستفيد من نفس المكونات المشتركة دون تكرار."
          />
          <div className="mt-12">
            <div className="gradient-border rounded-[24px] bg-white/[0.01] p-4 shadow-sm">
              <OperatingSystemMapVisual className="w-full rounded-[18px]" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <SectionEyebrow
          label="مكونات المنصة الأساسية"
          title="ستة مكونات — كل منها يؤدي دوراً محدّداً"
          description="كل مكوّن في المنصة مُصمَّم بحدود واضحة تمنع إساءة استخدام الصلاحيات والذكاء، وتضمن أن كل إجراء قابل للمراجعة والمساءلة."
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {platformComponents.map((comp, i) => (
            <div
              key={comp.title}
              className="rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/10 p-6 transition-all hover:border-primary/20 hover:shadow-sm"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-black text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-2 mb-2">
                    <h3 className="text-sm font-black text-foreground">
                      {comp.ar}
                    </h3>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {comp.title}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {comp.body}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-primary/15 bg-primary/[0.04] px-3 py-1.5">
                    <span className="h-1 w-1 rounded-full bg-primary/60" />
                    <span className="text-[11px] font-semibold text-primary/80">
                      {comp.boundary}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-gradient-light border-t">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <SectionEyebrow
            label="قدرة مشتركة"
            title="Office AI Assistant — مساعد ذكي يعمل عبر المنصة"
            description="Office AI Assistant ليس منتجاً مستقلاً. هو تطبيق ذكي مشترك يعمل فوق مكونات المنصة، متاح داخل كل نظام عند الحاجة إلى مساعدة ذكية ضمن سياق العمل."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/10 p-6">
              <h3 className="text-sm font-black text-foreground">
                مهام ذكية ضمن سياق محكوم
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                تلخيص مستندات، اقتراح صياغات، تحليل بيانات، وإعداد مسودات —
                كلها ضمن حدود صلاحية المستخدم ومرحلة سير العمل.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/10 p-6">
              <h3 className="text-sm font-black text-foreground">
                مخرجات قابلة للمراجعة
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                أي مخرج من المساعد يُعرض كمسودة مقترحة. المستخدم يراجع ويعدّل
                قبل الاعتماد. كل خطوة مسجلة في سجل التدقيق.
              </p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/products/office-ai"
              className="text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
            >
              اقرأ المزيد عن Office AI Assistant →
            </Link>
          </div>
        </div>
      </section>

      <section
        id="capabilities"
        className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20 scroll-mt-20"
      >
        <SectionEyebrow
          label="أنظمة التشغيل المتخصصة"
          title="المنصة تُطبَّق عبر مسارات تشغيلية — لا منتجات منفصلة"
          description="كل نظام تشغيل يرث تلقائياً الحوكمة، الأدلة، سير العمل، والصلاحيات من نفس المنصة — دون إعادة بناء."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {operatingSystems.map((sys) => (
            <Link
              key={sys.system}
              href={sys.href}
              className="group rounded-2xl border border-border/70 bg-gradient-to-br from-background to-muted/15 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-base font-black text-foreground group-hover:text-primary">
                  {sys.useCase}
                </h3>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                    sys.status === "pilot-ready"
                      ? "bg-status-success/15 text-status-success"
                      : sys.status === "active"
                        ? "bg-primary/10 text-primary"
                        : "bg-amber-500/15 text-amber-600"
                  }`}
                >
                  {sys.statusLabel}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{sys.description}</p>
              <p className="mt-3 text-[10px] font-medium text-muted-foreground/60">
                نظام التشغيل: {sys.system}
              </p>
            </Link>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Office AI Assistant قدرة مشتركة عبر المنصة — مساعد مؤسسي محكوم ضمن
          الصلاحيات والأدلة.{" "}
          <Link
            href="/products/office-ai"
            className="text-primary underline underline-offset-4"
          >
            التفاصيل
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-muted-foreground/70">
          SalesOS و SimulationOS في خارطة التطوير —{" "}
          <span className="text-muted-foreground">
            غير متاحين للشراء أو البايلوت حاليًا
          </span>
          .{" "}
          <Link
            href="/products#strategic"
            className="text-primary underline underline-offset-4"
          >
            الخطوط الاستراتيجية
          </Link>
        </p>
      </section>

      <section className="section-gradient-light border-t">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <SectionEyebrow
            label="نماذج النشر"
            title="نموذج النشر يُحدد من يتحكم في البيانات والبنية"
            description="كل نموذج نشر يُحافظ على نفس مكونات المنصة — الفرق هو موقع التشغيل ودرجة السيادة على البيانات."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {deploymentModels.map((model) => (
              <div
                key={model.id}
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
              </div>
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
              جلسة تنفيذية لفهم نطاق مؤسستك وتحديد المنتجات المناسبة ووضع مسار
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
