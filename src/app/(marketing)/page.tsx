import Link from "next/link"
import { SectionEyebrow, BeforeAfterBlock, WorkflowChain, ProductProofCard, ExecutiveSurface } from "@/components/enterprise"
import { OperatingSystemMapVisual, ProofChainVisual } from "@/components/visuals"

const products = [
  {
    title: "AuditOS | أول تطبيق مُثبت على عقلية",
    problem: "بيانات مالية متفرقة، تصنيفات يدوية، أدلة غير مرتبطة، ومراجعة يصعب تتبعها.",
    system: "يبني مسار مراجعة وتدقيق محكوم يربط البيانات المالية بالتصنيف، الأدلة، الملاحظات، المراجعة، والاعتماد.",
    output: "مخرجات مراجعة منظمة وقابلة للتتبع من المصدر إلى القرار البشري النهائي.",
    flow: ["بيانات", "تصنيف", "مخرجات", "أدلة", "مراجعة"],
    href: "/products/audit",
    note: "أول تطبيق مُثبت على AQLIYA Intelligence Core، ويُظهر كيف يتحول الذكاء المالي إلى مسار محكوم وقابل للمراجعة.",
  },
  {
    title: "LocalContentOS | نظام المحتوى المحلي تحت عقلية",
    problem: "بيانات موردين، إنفاق، التزام، وتصنيفات موزعة بين فرق ومصادر مختلفة.",
    system: "يوحّد قياس المحتوى المحلي عبر ربط الموردين بالإنفاق، التصنيف، نسب الالتزام، الفجوات، ومسارات التتبع.",
    output: "رؤية مؤسسية أوضح لمؤشرات المحتوى المحلي وجاهزية القرارات الشرائية.",
    flow: ["موردون", "إنفاق", "تصنيف", "فجوات", "مؤشرات"],
    href: "/products/local-content",
    note: "خط نظام تحت عقلية، قابل للتفعيل حسب نطاق المؤسسة، ويبنى على AQLIYA Intelligence Core.",
  },
  {
    title: "DecisionOS | حوكمة القرار التنفيذي",
    problem: "قرارات مهمة تُبنى على نقاشات متفرقة، ملفات متعددة، ومعايير غير موحدة.",
    system: "يحوّل القرار التنفيذي إلى مسار محكوم: بدائل، معايير، مخاطر، أدلة، توصية، واعتماد.",
    output: "مذكرة قرار موثقة يمكن مراجعتها وفهم أسبابها قبل الاعتماد.",
    flow: ["مشكلة", "بدائل", "معايير", "مخاطر", "توصية"],
    href: "/products/decision",
    note: "خط نظام لحوكمة القرار التنفيذي، يُفعّل ضمن نطاق المؤسسة ويبنى على AQLIYA Intelligence Core.",
  },
  {
    title: "SalesOS | خط نظام الذاكرة التجارية والمبيعات",
    problem: "فرص غير مؤهلة، أولويات غير واضحة، متابعة عشوائية، وتعلم ضعيف من الحملات.",
    system: "ينظم تأهيل الفرص، ترتيبها، وضبط المتابعة داخل مسار مبيعات محكوم ومبني على الذاكرة المؤسسية.",
    output: "مسار مبيعات أوضح يربط العملاء المحتملين بالأولوية، المتابعة، والتعلم المؤسسي.",
    flow: ["ICP", "تأهيل", "ترتيب", "تواصل", "متابعة", "تعلم"],
    href: "/products/sales",
    note: "خط نظام قابل للتفعيل حسب نطاق المؤسسة ويبنى على AQLIYA Intelligence Core لإدارة الذاكرة التجارية والمبيعات.",
  },
  {
    title: "SimulationOS | خط نظام محاكاة السيناريوهات",
    problem: "قرارات تُنفذ قبل اختبار أثرها على التكلفة، المخاطر، الأداء، أو النتائج.",
    system: "يربط المدخلات بالافتراضات والسيناريوهات والمقارنات قبل التنفيذ داخل مسار محاكاة قابل للمراجعة.",
    output: "رؤية مقارنة تساعد الإدارة على فهم البدائل قبل اعتماد القرار أو تنفيذ الأثر.",
    flow: ["مدخلات", "افتراضات", "سيناريوهات", "أثر", "مقارنة"],
    href: "/products/simulation",
    note: "خط نظام قابل للتفعيل حسب نطاق المؤسسة ويبنى على AQLIYA Intelligence Core لدعم المقارنة والمحاكاة قبل التنفيذ.",
  },
]

const coreItems = [
  { title: "تنسيق الذكاء", english: "AI Orchestration" },
  { title: "الحوكمة", english: "Governance Engine" },
  { title: "سير العمل", english: "Workflow Engine" },
  { title: "ربط الأدلة", english: "Evidence Graph" },
  { title: "الصلاحيات", english: "RBAC / Permissions" },
  { title: "سجل التدقيق", english: "Audit Logs" },
  { title: "التقارير", english: "Reporting Engine" },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* 1. Hero — Dark Command Center */}
      <section className="relative overflow-hidden bg-[#0B1728]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(19,125,197,0.15),transparent_70%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
            {/* Right: Text */}
            <div className="flex flex-col justify-center">
              <span className="inline-block w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-primary mb-6">
                Private Governed Institutional Intelligence Platform
              </span>
              <h1 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                منصة ذكاء مؤسسي خاص ومحكوم
              </h1>
              <p className="mt-5 text-base leading-7 text-white/60 sm:text-lg">
                عقلية تمنح المؤسسات ذكاءً خاصًا يعمل على بياناتها، داخل بيئتها، وتحت حوكمتها.
              </p>
              <p className="mt-3 text-sm leading-6 text-white/40">
                نحوّل البيانات، الإجراءات، المراجعات، والمخرجات إلى أنظمة تشغيل مؤسسية قابلة للتتبع، مرتبطة بالأدلة، وخاضعة للمراجعة البشرية.
              </p>
              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row">
                <Link
                  href="/products"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  استكشف خطوط عقلية
                </Link>
                <Link
                  href="/auditos"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-white/15 bg-white/5 px-8 text-base font-medium text-white/80 transition-colors hover:bg-white/10"
                >
                  شاهد AuditOS كأول تطبيق
                </Link>
              </div>
              <p className="mt-5 text-sm font-medium text-white/70">
                الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.
              </p>
            </div>

            {/* Left: Operating System Map Visual */}
            <div className="flex items-center">
              <OperatingSystemMapVisual className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Problem — Before / After — Light */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <SectionEyebrow
          label="المخاطر المؤسسية"
          title="الذكاء بلا حوكمة ينتج مخرجات عمياء لا يمكن الاعتماد عليها"
          description="حين تتحرك البيانات، الإجراءات، المراجعات، والاعتمادات خارج مسار واحد، تصبح المخرجات أسرع من أن تكون موثوقة. عقلية تبني طبقة تشغيل تربط الذكاء بسير العمل، والأدلة، والمراجعة البشرية قبل القرار النهائي."
        />
        <div className="mt-10">
          <BeforeAfterBlock
            before={["مخرجات ذكاء غير مرتبطة بسياق العمل", "اعتماد عبر البريد والذاكرة", "موافقات غير موثقة", "أدلة منفصلة عن القرار", "صلاحيات لا تحكم المسار كاملًا"]}
            after={["سير عمل محكوم", "مخرجات قابلة للتتبع", "قرارات موثقة", "أدلة مربوطة بكل خطوة", "وضوح تشغيلي قابل للمراجعة"]}
          />
        </div>
      </section>

      {/* 3. AQLIYA Intelligence Core — Light */}
      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <SectionEyebrow
          label="AQLIYA Intelligence Core"
          title="كل منتج يُبنى على نواة ذكاء واحدة"
          description="AQLIYA Intelligence Core تجمع محرك تنسيق الذكاء، الحوكمة، سير العمل، ربط الأدلة، الصلاحيات، سجل التدقيق، وطبقة التقارير في بنية واحدة تُستخدم لبناء منتجات وأنظمة مؤسسية متعددة."
        />
        <div className="mt-10">
          <ExecutiveSurface>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {coreItems.map((item) => (
                <div key={item.english} className="rounded-xl border border-border/60 bg-background/80 p-4 text-right shadow-sm">
                  <p className="text-sm font-bold text-foreground">{item.title}</p>
                  <p className="mt-2 text-xs leading-6 text-muted-foreground">{item.english}</p>
                </div>
              ))}
            </div>
          </ExecutiveSurface>
        </div>
      </section>

      {/* 4. Methodology — Light */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-t">
        <SectionEyebrow
          label="سلسلة التشغيل"
          title="البيانات ← سير العمل ← الأدلة ← المراجعة ← الاعتماد ← المخرجات"
          description="AQLIYA لا تضيف طبقة ذكاء فوق الفوضى. بل تنظّم انتقال المؤسسة من البيانات الخام إلى المخرجات النهائية داخل مسار واحد قابل للمراجعة والاعتماد."
        />
        <div className="mt-10">
          <ExecutiveSurface>
            <WorkflowChain
              steps={["البيانات", "سير العمل", "الأدلة", "المراجعة", "الاعتماد", "المخرجات"]}
              className="justify-center"
            />
          </ExecutiveSurface>
        </div>
      </section>

      {/* 5. Custom Product — Light */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-t">
        <SectionEyebrow
          label="التفعيل المؤسسي"
          title="وعند الحاجة، يمكن تفعيل نظام مؤسسي خاص فوق النواة نفسها"
          description="إلى جانب خطوط الأنظمة الجاهزة، يمكن تفعيل مسارات مؤسسية مخصصة فوق نفس منطق الحوكمة، الأدلة، الصلاحيات، وسير العمل عندما يتطلب نطاق المؤسسة ذلك."
        />
        <div className="mt-8 text-center">
          <Link
            href="/custom-product"
            className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            صمّم نظامك المؤسسي
          </Link>
        </div>
      </section>

      {/* 6. Product Lines — Light */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-t">
        <SectionEyebrow
          label="عائلة المنتجات"
          title="منتجات متعددة فوق نواة واحدة"
          description="AQLIYA ليست منتجًا واحدًا. هذه خطوط أنظمة متخصصة تُبنى على AQLIYA Intelligence Core وتُفعّل حسب نطاق المؤسسة، مع بقاء AuditOS أول تطبيق مُثبت وLocalContentOS أحد خطوط الأنظمة الرئيسية تحت عقلية."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductProofCard
              key={product.href}
              title={product.title}
              problem={product.problem}
              system={product.system}
              output={product.output}
              flow={product.flow}
              href={product.href}
              note={product.note}
            />
          ))}
        </div>
      </section>

      {/* 7. Trust / Proof — Dark */}
      <section className="bg-[#0B1728] border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center mb-10">
            <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Trust & Proof
            </span>
            <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
              الثقة في عقلية لا تأتي من الذكاء الاصطناعي. تأتي من التتبع.
            </h2>
            <p className="mt-4 text-sm font-medium text-white/60">
              الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.
            </p>
          </div>
          <ProofChainVisual />
        </div>
      </section>

      {/* 8. Final CTA — Dark */}
      <section className="bg-[#0B1728] border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl rounded-xl border border-white/10 bg-white/[0.03] p-8 sm:p-12 text-center">
            <h2 className="text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
              هل تريد تفعيل خط نظام أو تصميم نظام مؤسسي محكوم؟
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
