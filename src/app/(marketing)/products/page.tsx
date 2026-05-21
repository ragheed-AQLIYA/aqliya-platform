import Link from "next/link";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import {
  CustomWorkflowBuilderVisual,
  DecisionMatrixVisual,
  SimulationScenarioVisual,
  SalesPipelineVisual,
  AuditTraceVisual,
  LocalContentMapVisual,
} from "@/components/visuals";

export const metadata: Metadata = {
  title: "خطوط أنظمة عقلية | AQLIYA",
  description:
    "خطوط أنظمة متخصصة مبنية على AQLIYA Intelligence Core، تربط البيانات، سير العمل، الأدلة، والمخرجات داخل مسارات مؤسسية قابلة للمراجعة والاعتماد.",
};

const solutions = [
  {
    title: "AuditOS — نظام التدقيق والذكاء المالي",
    problem:
      "بيانات مالية متفرقة، تصنيفات يدوية، أدلة غير مرتبطة، ومراجعة يصعب تتبعها.",
    system:
      "أول تطبيق مُثبت على AQLIYA Intelligence Core، يربط البيانات المالية بالتصنيف، القوائم، الأدلة، الملاحظات، ومسار المراجعة والاعتماد.",
    output:
      "مخرجات مراجعة منظمة وقابلة للتتبع من المصدر إلى القرار البشري النهائي.",
    flow: ["بيانات", "تصنيف", "مخرجات", "أدلة", "مراجعة"],
    href: "/products/audit",
    visual: <AuditTraceVisual />,
    line: "أول تطبيق مُثبت",
    status: "active" as const,
  },
  {
    title: "DecisionOS — نظام حوكمة القرارات",
    problem:
      "قرارات مهمة تُبنى على نقاشات متفرقة، ملفات متعددة، ومعايير غير موحدة.",
    system:
      "خط نظام مبني على AQLIYA Intelligence Core يحوّل القرار إلى مسار محكوم: بدائل، معايير، مخاطر، أدلة، توصية، واعتماد.",
    output: "مذكرة قرار موثقة يمكن مراجعتها وفهم أسبابها قبل الاعتماد.",
    flow: ["مشكلة", "بدائل", "معايير", "مخاطر", "توصية"],
    href: "/products/decision",
    visual: <DecisionMatrixVisual />,
    line: "نظام مجاور — نشط",
    status: "active" as const,
  },
  {
    title: "LocalContentOS — نظام المحتوى المحلي",
    problem:
      "بيانات موردين، إنفاق، التزام، وتصنيفات موزعة بين فرق ومصادر مختلفة.",
    system:
      "مسار منتج استراتيجي يبنى على AQLIYA Intelligence Core لربط الموردين بالإنفاق، التصنيف، نسب الالتزام، والفجوات. يبحث عن شركاء تصميم للتحقق من الاحتياج وتحديد نطاق بايلوت مستقبلي.",
    output: "رؤية واضحة لمؤشرات المحتوى المحلي وأثر القرارات الشرائية.",
    flow: ["موردون", "إنفاق", "تصنيف", "فجوات", "مؤشرات"],
    href: "/products/local-content",
    visual: <LocalContentMapVisual />,
    line: "استراتيجي — مرحلة التخطيط",
    status: "strategic" as const,
  },
  {
    title: "SimulationOS — نظام محاكاة السيناريوهات",
    problem:
      "قرارات تُنفذ قبل اختبار أثرها على التكلفة، المخاطر، الأداء، أو النتائج.",
    system:
      "خط نظام مستقبلي يهدف إلى ربط المدخلات بالافتراضات، السيناريوهات، المقارنة، ودعم القرار قبل التنفيذ.",
    output: "تقرير مقارنة يساعد الإدارة على فهم الخيارات قبل التنفيذ.",
    flow: ["مدخلات", "افتراضات", "سيناريوهات", "أثر", "مقارنة"],
    href: "/products/simulation",
    visual: <SimulationScenarioVisual />,
    line: "مفهوم — مستقبلي",
    status: "future" as const,
  },
  {
    title: "SalesOS — نظام الذاكرة التجارية والمبيعات",
    problem:
      "فرص غير مؤهلة، أولويات غير واضحة، متابعة عشوائية، وتعلم ضعيف من الحملات.",
    system:
      "نموذج أولي لنظام ذاكرة تجارية محكومة يستكشف كيفية تنظيم التأهيل، الترتيب، المتابعة، والتعلم المؤسسي.",
    output:
      "مسار مبيعات واضح يربط العملاء المحتملين بالأولوية، الرسالة، والمتابعة.",
    flow: ["ICP", "تأهيل", "ترتيب", "تواصل", "متابعة", "تعلم"],
    href: "/products/sales",
    visual: <SalesPipelineVisual />,
    line: "نموذج أولي — مستقبلي",
    status: "prototype" as const,
  },
  {
    title: "Custom Systems — أنظمة مؤسسية مخصصة",
    problem:
      "إجراءات متكررة، ملفات متفرقة، صلاحيات غير واضحة، ومخرجات لا تُدار من مكان واحد.",
    system:
      "خط نظام مؤسسي يُفعّل فوق AQLIYA Intelligence Core لربط سير العمل، الصلاحيات، البيانات، والمخرجات داخل منطق حوكمة واحد.",
    output:
      "نظام تشغيلي خاص بالمؤسسة، قابل للمراجعة، التتبع، والتطوير ضمن نطاقها التشغيلي.",
    flow: ["فهم العمل", "تصميم النظام", "ربط البيانات", "تشغيل المخرجات"],
    href: "/custom-product",
    visual: <CustomWorkflowBuilderVisual />,
    line: "يُفعّل حسب نطاق المؤسسة",
    status: "available" as const,
  },
];

const coreItems = [
  "تنسيق الذكاء",
  "الحوكمة",
  "سير العمل",
  "ربط الأدلة",
  "الصلاحيات",
  "سجل التدقيق",
  "التقارير",
];

const productPrinciples = [
  "كل خط نظام يبدأ من فجوة تشغيلية محددة لا من وصف عام للذكاء الاصطناعي.",
  "كل منتج يبقى مربوطًا بنفس منطق الحوكمة والتتبع والمراجعة داخل النواة المشتركة.",
  "كل مخرج نهائي يجب أن يكون قابلًا للفهم، لا مجرد نتيجة آلية يصعب تفسيرها لاحقًا.",
];

export default function ProductsPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="relative mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              عائلة الأنظمة
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              خطوط أنظمة تعالج مسارات مؤسسية فعلية
            </h1>
            <p className="mt-5 text-base leading-8 text-white/62 sm:text-lg">
              المنتجات تحت عقلية ليست تجميعًا لخدمات عامة، بل خطوط تشغيل متخصصة
              مبنية على نواة واحدة. كل خط نظام يبدأ من مشكلة حقيقية داخل
              المؤسسة، ثم يحولها إلى مسار محكوم يمكن تشغيله ومراجعته والتوسع
              فيه.
            </p>
            <p className="mt-3 text-sm leading-7 text-white/42">
              بعضها قائم كأول تطبيق واضح مثل AuditOS، وبعضها يُفعّل بحسب نطاق
              المؤسسة، لكن جميعها تنتمي إلى نفس منطق البناء المؤسسي داخل AQLIYA
              Intelligence Core.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-b">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              لماذا عائلة أنظمة؟
            </p>
            <h2 className="mt-4 text-3xl font-black text-foreground">
              نواة واحدة، لكن تطبيقات متعددة بحسب مجال العمل
            </h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              بدل بناء نظام مستقل بالكامل لكل فريق أو نطاق، تجمع عقلية طبقة
              الذكاء، الحوكمة، سير العمل، ربط الأدلة، الصلاحيات، سجل التدقيق،
              والتقارير في بنية واحدة. هذا يجعل كل خط نظام امتدادًا لقدرة مؤسسية
              مشتركة، لا مشروعًا منفصلًا جديدًا.
            </p>
            <div className="mt-6 space-y-3">
              {productPrinciples.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-aqliya-cyan" />
                  <p className="text-sm leading-7 text-muted-foreground">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {coreItems.map((item) => (
              <div key={item} className="glass-card-light p-4 text-center">
                <p className="text-sm font-bold text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Blocks — Alternating with Visuals */}
      {solutions.map((solution, i) => {
        const statusColors = {
          active: {
            border: "border-emerald-500/30",
            bg: "bg-emerald-500/10",
            text: "text-emerald-400",
          },
          strategic: {
            border: "border-amber-500/30",
            bg: "bg-amber-500/10",
            text: "text-amber-400",
          },
          future: {
            border: "border-white/10",
            bg: "bg-white/5",
            text: "text-white/60",
          },
          prototype: {
            border: "border-amber-500/30",
            bg: "bg-amber-500/10",
            text: "text-amber-400",
          },
          available: {
            border: "border-primary/15",
            bg: "bg-primary/5",
            text: "text-primary",
          },
        };
        const sc = statusColors[solution.status] || statusColors.available;
        return (
          <section
            key={solution.href}
            className={cn(
              "border-t",
              i % 2 === 0
                ? "bg-background"
                : "section-gradient-dark border-white/5",
            )}
          >
            <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
              <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
                <div className="flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2
                      className={cn(
                        "text-2xl font-black leading-tight sm:text-3xl",
                        i % 2 === 0 ? "text-foreground" : "text-white",
                      )}
                    >
                      {solution.title}
                    </h2>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase",
                        i % 2 === 0
                          ? "border-primary/15 bg-primary/5 text-primary"
                          : sc.border + " " + sc.bg + " " + sc.text,
                      )}
                    >
                      {solution.status === "active" && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      )}
                      {solution.status === "prototype" && (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      )}
                      {solution.status === "strategic" && (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      )}
                      {solution.status === "future" && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                      )}
                      {solution.line}
                    </span>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div>
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-[0.18em]",
                          i % 2 === 0
                            ? "text-destructive/75"
                            : "text-red-300/75",
                        )}
                      >
                        الفجوة الحالية
                      </span>
                      <p
                        className={cn(
                          "mt-1.5 text-sm leading-7",
                          i % 2 === 0
                            ? "text-muted-foreground"
                            : "text-white/62",
                        )}
                      >
                        {solution.problem}
                      </p>
                    </div>
                    <div>
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-[0.18em]",
                          i % 2 === 0
                            ? "text-primary/75"
                            : "text-aqliya-cyan/80",
                        )}
                      >
                        كيف يعمل النظام
                      </span>
                      <p
                        className={cn(
                          "mt-1.5 text-sm leading-7",
                          i % 2 === 0 ? "text-foreground" : "text-white/74",
                        )}
                      >
                        {solution.system}
                      </p>
                    </div>
                    <div>
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-[0.18em]",
                          i % 2 === 0
                            ? "text-emerald-600/75"
                            : "text-emerald-300/75",
                        )}
                      >
                        القيمة الناتجة
                      </span>
                      <p
                        className={cn(
                          "mt-1.5 text-sm leading-7",
                          i % 2 === 0 ? "text-foreground" : "text-white/74",
                        )}
                      >
                        {solution.output}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "rounded-2xl border p-4",
                        i % 2 === 0
                          ? "border-border/60 bg-muted/20"
                          : "border-white/10 bg-white/[0.03]",
                      )}
                    >
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-[0.18em]",
                          i % 2 === 0
                            ? "text-muted-foreground"
                            : "text-white/45",
                        )}
                      >
                        المسار التشغيلي
                      </span>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {solution.flow.map((step, j) => (
                          <div key={j} className="flex items-center gap-1">
                            <span
                              className={cn(
                                "rounded-md px-2 py-1 text-[10px] font-medium",
                                i % 2 === 0
                                  ? "bg-background text-muted-foreground shadow-sm"
                                  : "bg-white/6 text-white/62",
                              )}
                            >
                              {step}
                            </span>
                            {j < solution.flow.length - 1 && (
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
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3 border-t border-dashed pt-5">
                    <Link
                      href={solution.href}
                      className={cn(
                        i % 2 === 0 ? "btn-primary" : "btn-primary",
                        "px-6",
                      )}
                    >
                      استكشف خط النظام
                    </Link>
                    <Link
                      href="/contact"
                      className={cn(
                        i % 2 === 0 ? "btn-outline" : "btn-secondary",
                        "px-6",
                      )}
                    >
                      تحدث إلى متخصص
                    </Link>
                  </div>
                </div>

                <div className="flex items-center">
                  <div
                    className={cn(
                      "w-full rounded-[28px] p-3",
                      i % 2 === 0
                        ? "gradient-border bg-gradient-to-br from-primary/[0.04] via-background to-aqliya-cyan/[0.04]"
                        : "gradient-border bg-white/[0.03]",
                    )}
                  >
                    {solution.visual}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* AuditOS Note */}
      <section className="border-t bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 py-10 text-center">
          <p className="text-sm leading-7 text-muted-foreground">
            <Link
              href="/auditos"
              className="text-primary underline-offset-4 hover:underline"
            >
              AuditOS
            </Link>{" "}
            هو أول تطبيق مُثبت على AQLIYA Intelligence Core، ويمكن تجربته كعرض
            تفاعلي.{" "}
            <Link
              href="/products/local-content"
              className="text-primary underline-offset-4 hover:underline"
            >
              LocalContentOS
            </Link>{" "}
            هو المنتج الاستراتيجي الثاني، وبقية الخطوط تُفعّل فوق النواة نفسها
            بحسب نطاق المؤسسة وجاهزيتها.
          </p>
        </div>
      </section>

      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-8 text-center backdrop-blur-xl sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              اختر الخط المناسب
            </p>
            <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
              حدّد خط النظام الأقرب إلى نطاقك أو ابدأ من جلسة تصميم مؤسسية
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/58">
              إذا كانت لديك فجوة تشغيلية واضحة، نساعدك على ربطها بخط النظام
              المناسب. وإذا كان نطاقك مختلفًا، يمكن تصميم مسار خاص فوق نواة
              عقلية نفسها.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/custom-product"
                className="btn-primary h-12 px-8 text-base"
              >
                صمّم نظامك المؤسسي
              </Link>
              <Link
                href="/contact"
                className="btn-secondary h-12 px-8 text-base"
              >
                تحدث إلى متخصص
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
