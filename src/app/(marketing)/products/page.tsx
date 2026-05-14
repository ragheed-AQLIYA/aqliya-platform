import Link from "next/link"
import type { Metadata } from "next"
import { cn } from "@/lib/utils"
import { CustomWorkflowBuilderVisual, DecisionMatrixVisual, SimulationScenarioVisual, SalesPipelineVisual, AuditTraceVisual, LocalContentMapVisual } from "@/components/visuals"

export const metadata: Metadata = {
  title: "خطوط أنظمة عقلية | AQLIYA",
  description: "خطوط أنظمة متخصصة مبنية على AQLIYA Intelligence Core، تربط البيانات، سير العمل، الأدلة، والمخرجات داخل مسارات مؤسسية قابلة للمراجعة والاعتماد.",
}

const solutions = [
  {
    title: "Custom Systems — أنظمة مؤسسية مخصصة",
    problem: "إجراءات متكررة، ملفات متفرقة، صلاحيات غير واضحة، ومخرجات لا تُدار من مكان واحد.",
    system: "خط نظام مؤسسي يُفعّل فوق AQLIYA Intelligence Core لربط سير العمل، الصلاحيات، البيانات، والمخرجات داخل منطق حوكمة واحد.",
    output: "نظام تشغيلي خاص بالمؤسسة، قابل للمراجعة، التتبع، والتطوير ضمن نطاقها التشغيلي.",
    flow: ["فهم العمل", "تصميم النظام", "ربط البيانات", "تشغيل المخرجات"],
    href: "/custom-product",
    visual: <CustomWorkflowBuilderVisual />,
    line: "يُفعّل حسب نطاق المؤسسة",
  },
  {
    title: "DecisionOS — نظام حوكمة القرارات",
    problem: "قرارات مهمة تُبنى على نقاشات متفرقة، ملفات متعددة، ومعايير غير موحدة.",
    system: "خط نظام مبني على AQLIYA Intelligence Core يحوّل القرار إلى مسار محكوم: بدائل، معايير، مخاطر، أدلة، توصية، واعتماد.",
    output: "مذكرة قرار موثقة يمكن مراجعتها وفهم أسبابها قبل الاعتماد.",
    flow: ["مشكلة", "بدائل", "معايير", "مخاطر", "توصية"],
    href: "/products/decision",
    visual: <DecisionMatrixVisual />,
    line: "خط نظام ضمن عقلية",
  },
  {
    title: "SimulationOS — نظام محاكاة السيناريوهات",
    problem: "قرارات تُنفذ قبل اختبار أثرها على التكلفة، المخاطر، الأداء، أو النتائج.",
    system: "خط نظام يبنى على AQLIYA Intelligence Core لربط المدخلات بالافتراضات، السيناريوهات، المقارنة، ودعم القرار قبل التنفيذ.",
    output: "تقرير مقارنة يساعد الإدارة على فهم الخيارات قبل التنفيذ.",
    flow: ["مدخلات", "افتراضات", "سيناريوهات", "أثر", "مقارنة"],
    href: "/products/simulation",
    visual: <SimulationScenarioVisual />,
    line: "نظام قابل للتفعيل",
  },
  {
    title: "SalesOS — نظام الذاكرة التجارية والمبيعات",
    problem: "فرص غير مؤهلة، أولويات غير واضحة، متابعة عشوائية، وتعلم ضعيف من الحملات.",
    system: "خط نظام مبني على AQLIYA Intelligence Core ينظم التأهيل، الترتيب، المتابعة، والتعلم المؤسسي داخل ذاكرة تجارية محكومة.",
    output: "مسار مبيعات واضح يربط العملاء المحتملين بالأولوية، الرسالة، والمتابعة.",
    flow: ["ICP", "تأهيل", "ترتيب", "تواصل", "متابعة", "تعلم"],
    href: "/products/sales",
    visual: <SalesPipelineVisual />,
    line: "خط متخصص ضمن عقلية",
  },
  {
    title: "AuditOS — نظام التدقيق والذكاء المالي",
    problem: "بيانات مالية متفرقة، تصنيفات يدوية، أدلة غير مرتبطة، ومراجعة يصعب تتبعها.",
    system: "أول تطبيق مُثبت على AQLIYA Intelligence Core، يربط البيانات المالية بالتصنيف، القوائم، الأدلة، الملاحظات، ومسار المراجعة والاعتماد.",
    output: "مخرجات مراجعة منظمة وقابلة للتتبع من المصدر إلى القرار البشري النهائي.",
    flow: ["بيانات", "تصنيف", "مخرجات", "أدلة", "مراجعة"],
    href: "/products/audit",
    visual: <AuditTraceVisual />,
    line: "أول تطبيق مُثبت على عقلية",
  },
  {
    title: "LocalContentOS — نظام المحتوى المحلي",
    problem: "بيانات موردين، إنفاق، التزام، وتصنيفات موزعة بين فرق ومصادر مختلفة.",
    system: "الخط الثاني ضمن عائلة الأنظمة تحت عقلية، يبنى على AQLIYA Intelligence Core لربط الموردين بالإنفاق، التصنيف، نسب الالتزام، والفجوات.",
    output: "رؤية واضحة لمؤشرات المحتوى المحلي وأثر القرارات الشرائية.",
    flow: ["موردون", "إنفاق", "تصنيف", "فجوات", "مؤشرات"],
    href: "/products/local-content",
    visual: <LocalContentMapVisual />,
    line: "الخط الثاني ضمن عقلية",
  },
]

const coreItems = [
  "تنسيق الذكاء",
  "الحوكمة",
  "سير العمل",
  "ربط الأدلة",
  "الصلاحيات",
  "سجل التدقيق",
  "التقارير",
]

export default function ProductsPage() {
  return (
    <div className="flex flex-col">
      {/* Hero — Dark */}
      <section className="bg-[#0B1728] border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Product Family
            </span>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
              خطوط أنظمة مبنية على AQLIYA Intelligence Core
            </h1>
            <p className="mt-4 text-base leading-7 text-white/50">
              هذه المنتجات ليست صفحات منفصلة تحت شركة عامة، بل عائلة أنظمة متخصصة داخل عقلية. كل خط نظام هنا يربط البيانات، سير العمل، الأدلة، المراجعة، والاعتماد داخل بيئة واحدة قابلة للتتبع.
            </p>
            <p className="mt-3 text-sm leading-7 text-white/35">
              بعضها يظهر كأول تطبيق واضح، وبعضها يُفعّل حسب نطاق المؤسسة، لكن جميعها تنتمي إلى منطق منصة واحدة ونواة حوكمة واحدة.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-b">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-black text-foreground">نواة واحدة. خطوط أنظمة متعددة.</h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            AQLIYA Intelligence Core تجمع طبقة الذكاء، الحوكمة، سير العمل، ربط الأدلة، الصلاحيات، سجل التدقيق، والتقارير في بنية واحدة. ومن هذه النواة تُفعّل خطوط الأنظمة بحسب طبيعة المؤسسة ونطاقها.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {coreItems.map((item) => (
            <div key={item} className="rounded-xl border bg-muted/20 p-4 text-center shadow-sm">
              <p className="text-sm font-bold text-foreground">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solution Blocks — Alternating with Visuals */}
      {solutions.map((solution, i) => (
        <section key={solution.href} className={cn("border-t", i % 2 === 0 ? "bg-background" : "bg-[#0B1728] border-white/5")}>
          <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Text Content */}
              <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3">
                <h2 className={cn("text-xl font-black sm:text-2xl", i % 2 === 0 ? "text-foreground" : "text-white")}>
                  {solution.title}
                </h2>
                <span className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-semibold tracking-wider",
                  i % 2 === 0 ? "bg-primary/10 text-primary" : "bg-white/10 text-white/70"
                )}>
                  {solution.line}
                </span>
              </div>
                <div className="mt-6 space-y-4">
                  <div>
                    <span className={cn("text-[10px] font-semibold uppercase tracking-wider", i % 2 === 0 ? "text-destructive/70" : "text-red-400/70")}>المشكلة</span>
                    <p className={cn("mt-1 text-sm leading-6", i % 2 === 0 ? "text-muted-foreground" : "text-white/60")}>{solution.problem}</p>
                  </div>
                  <div>
                    <span className={cn("text-[10px] font-semibold uppercase tracking-wider", i % 2 === 0 ? "text-primary/70" : "text-primary/70")}>النظام</span>
                    <p className={cn("mt-1 text-sm leading-6", i % 2 === 0 ? "text-foreground" : "text-white/70")}>{solution.system}</p>
                  </div>
                  <div>
                    <span className={cn("text-[10px] font-semibold uppercase tracking-wider", i % 2 === 0 ? "text-emerald-600/70" : "text-emerald-400/70")}>المخرج</span>
                    <p className={cn("mt-1 text-sm leading-6", i % 2 === 0 ? "text-foreground" : "text-white/70")}>{solution.output}</p>
                  </div>
                  <div>
                    <span className={cn("text-[10px] font-semibold uppercase tracking-wider", i % 2 === 0 ? "text-muted-foreground" : "text-white/40")}>المسار</span>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {solution.flow.map((step, j) => (
                        <div key={j} className="flex items-center gap-1">
                          <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", i % 2 === 0 ? "bg-muted/60 text-muted-foreground" : "bg-white/5 text-white/50")}>
                            {step}
                          </span>
                          {j < solution.flow.length - 1 && (
                            <svg className={cn("h-2 w-2 rtl:rotate-180", i % 2 === 0 ? "text-muted-foreground/40" : "text-white/20")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-dashed">
                  <Link
                    href={solution.href}
                    className={cn(
                      "inline-flex h-10 items-center justify-center rounded-md px-6 text-sm font-medium text-white transition-colors",
                      i % 2 === 0
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-primary hover:bg-primary/90"
                      )}
                  >
                    ناقش تفعيل النظام
                  </Link>
                </div>
              </div>

              {/* Visual */}
              <div className="flex items-center">
                {solution.visual}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* AuditOS Note */}
      <section className="border-t bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            يظهر <Link href="/auditos" className="text-primary underline-offset-4 hover:underline">AuditOS</Link> كأول تطبيق مُثبت على عقلية، بينما تُفعّل بقية الخطوط فوق النواة نفسها بحسب نطاق المؤسسة.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#0B1728] border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl rounded-xl border border-white/10 bg-white/[0.03] p-8 sm:p-12 text-center">
            <h2 className="text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
              حدد خط النظام المناسب أو ابدأ من نطاق مؤسستك
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/custom-product" className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                صمّم نظامك المؤسسي
              </Link>
              <Link href="/contact" className="inline-flex h-12 items-center justify-center rounded-md border border-white/15 bg-white/5 px-8 text-base font-medium text-white/80 transition-colors hover:bg-white/10">
                ناقش تفعيل النظام
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
