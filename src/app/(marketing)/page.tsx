import Link from "next/link"
import { SectionEyebrow, CommandCenterPanel, BrandArchitecturePanel, BeforeAfterBlock, WorkflowChain, ProductProofCard, ProofChain, EnterpriseCTA, ExecutiveSurface } from "@/components/enterprise"

const products = [
  {
    title: "Custom Enterprise Systems",
    problem: "إجراءات متكررة، ملفات متفرقة، قرارات غير موثقة، مخرجات بلا تتبع.",
    system: "نحوّل طريقة عمل مؤسستك إلى نظام رقمي واضح: صفحات، صلاحيات، مسارات عمل، تقارير.",
    output: "نظام تشغيل داخلي قابل للتتبع والمراجعة والتطوير.",
    flow: ["فهم العمل", "تصميم النظام", "ربط البيانات", "تشغيل المخرجات"],
    href: "/custom-product",
  },
  {
    title: "Decision Systems",
    problem: "قرارات مهمة تُبنى على نقاشات وملفات متفرقة بلا توثيق.",
    system: "بدائل، معايير، مخاطر، أدلة، توصية قابلة للمراجعة والاعتماد.",
    output: "Decision Memo موثق وقابل للتتبع من المشكلة إلى القرار.",
    flow: ["Problem", "Criteria", "Evidence", "Recommendation"],
    href: "/products/decision",
  },
  {
    title: "Simulation Systems",
    problem: "قرارات كبرى تُتخذ قبل اختبار أثرها على التكلفة والأداء.",
    system: "مدخلات، نموذج سيناريو، افتراضات، أثر، مقارنة، دعم قرار.",
    output: "تقرير محاكاة يقارن السيناريوهات قبل التنفيذ.",
    flow: ["Inputs", "Scenario", "Impact", "Comparison"],
    href: "/products/simulation",
  },
  {
    title: "Sales Systems",
    problem: "فرص غير مؤهلة، رسائل عامة، متابعة عشوائية، أولويات غير واضحة.",
    system: "ICP، تأهيل، فلترة، تواصل، متابعة، تعلم مستمر.",
    output: "مسار مبيعات واضح من التأهيل إلى التحسين.",
    flow: ["ICP", "Scoring", "Outreach", "Learning"],
    href: "/products/sales",
  },
  {
    title: "AQLIYA AuditOS",
    problem: "ميزان مراجعة، تصنيف يدوي، أدلة متفرقة، مراجعة بطيئة.",
    system: "Mapping، قوائم مالية، إيضاحات، أدلة، ملاحظات، تتبع.",
    output: "ملف مراجعة قابل للتتبع من الحساب إلى الدليل.",
    flow: ["TB", "Mapping", "Statement", "Evidence"],
    href: "/auditos",
  },
  {
    title: "Local Content Systems",
    problem: "بيانات موردين غير مصنفة، إنفاق غير محلل، التزام غير واضح.",
    system: "موردون، إنفاق، تصنيف، فجوة التزام، محاكاة، تقارير.",
    output: "نظام محتوى محلي يربط الموردين بالالتزام والمؤشرات.",
    flow: ["Suppliers", "Spend", "Compliance", "Report"],
    href: "/products/local-content",
  },
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
              <span className="inline-block w-fit rounded-full border border-[#137dc5]/30 bg-[#137dc5]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#137dc5] mb-6">
                Enterprise Operating Systems
              </span>
              <h1 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                أنظمة مؤسسية تُبنى حول طريقة عملك
              </h1>
              <p className="mt-5 text-base leading-7 text-white/60 sm:text-lg">
                نحوّل البيانات، الإجراءات، القرارات، والمراجعات إلى أنظمة تشغيل رقمية واضحة، قابلة للتتبع، وجاهزة للتطوير.
              </p>
              <p className="mt-3 text-sm leading-6 text-white/40">
                عقلية لا تقدم قالبًا عامًا ولا منتجًا واحدًا لكل المؤسسات. نبدأ من واقع العمل داخل مؤسستك، ثم نصمم النظام الذي يربط البيانات بالمخرجات، والمخرجات بالأدلة، والأدلة بالقرار.
              </p>
              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row">
                <Link
                  href="/custom-product"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-[#137dc5] px-8 text-base font-medium text-white transition-colors hover:bg-[#137dc5]/90"
                >
                  صمّم نظامك
                </Link>
                <Link
                  href="/auditos"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-white/15 bg-white/5 px-8 text-base font-medium text-white/80 transition-colors hover:bg-white/10"
                >
                  استعرض AuditOS
                </Link>
              </div>
              <p className="mt-5 text-xs text-white/30">
                Custom Systems · Traceable Outputs · Human Review · Enterprise Workflows
              </p>
            </div>

            {/* Left: Command Center Panel */}
            <div className="flex items-center">
              <CommandCenterPanel className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Brand Architecture — Dark */}
      <section className="bg-[#0B1728] border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center mb-10">
            <span className="inline-block rounded-full border border-[#137dc5]/20 bg-[#137dc5]/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#137dc5]">
              Brand Architecture
            </span>
            <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
              AQLIYA هي الشركة. AuditOS أحد منتجاتها.
            </h2>
            <p className="mt-4 text-base leading-7 text-white/50">
              عقلية تبني أنظمة مؤسسية قابلة للتخصيص حسب طبيعة عمل المؤسسة. AuditOS هو أحد تطبيقات عقلية في المراجعة والتدقيق، لكنه لا يحد نطاق الشركة ولا يعرّفها وحده.
            </p>
          </div>
          <BrandArchitecturePanel />
        </div>
      </section>

      {/* 3. Problem — Before / After — Light */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <SectionEyebrow
          label="المشكلة والحل"
          title="المؤسسات لا تحتاج أدوات أكثر. تحتاج أنظمة أوضح."
        />
        <div className="mt-10">
          <BeforeAfterBlock
            before={["ملفات Excel متفرقة", "اعتماد عبر البريد", "موافقات غير موثقة", "أنظمة غير مترابطة", "صلاحيات غير واضحة"]}
            after={["سير عمل موحد", "مخرجات قابلة للتتبع", "قرارات موثقة", "وضوح تشغيلي", "تقارير وأدلة جاهزة"]}
          />
        </div>
      </section>

      {/* 4. Methodology — Light */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-t">
        <SectionEyebrow
          label="منهجية العمل"
          title="من طبيعة العمل إلى نظام قابل للتشغيل"
        />
        <div className="mt-10">
          <ExecutiveSurface>
            <WorkflowChain
              steps={["فهم العمل", "رسم العمليات", "تصميم النظام", "ربط البيانات", "تشغيل المخرجات", "التتبع", "التطوير"]}
              className="justify-center"
            />
          </ExecutiveSurface>
        </div>
      </section>

      {/* 5. Custom Product — Light */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-t">
        <SectionEyebrow
          label="العرض الأساسي"
          title="صمّم نظامًا خاصًا بطبيعة عمل مؤسستك"
          description="إذا كانت مؤسستك تعتمد على إجراءات متكررة، ملفات متفرقة، قرارات غير موثقة، أو مخرجات تحتاج مراجعة واعتماد، نحوّل ذلك إلى نظام رقمي واضح وقابل للتشغيل."
        />
        <div className="mt-8 text-center">
          <Link
            href="/custom-product"
            className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            ابدأ طلب تصميم النظام
          </Link>
        </div>
      </section>

      {/* 6. Product Lines — Light */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-t">
        <SectionEyebrow
          label="خطوط الحلول"
          title="خطوط حلول جاهزة وقابلة للتخصيص"
          description="هذه الخطوط لا تحد نطاق عقلية، بل تمثل نماذج من قدرتها على بناء أنظمة متخصصة حسب الحاجة."
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
            />
          ))}
        </div>
      </section>

      {/* 7. Trust / Proof — Dark */}
      <section className="bg-[#0B1728] border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center mb-10">
            <span className="inline-block rounded-full border border-[#137dc5]/20 bg-[#137dc5]/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#137dc5]">
              Trust & Proof
            </span>
            <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
              الثقة في عقلية لا تأتي من الذكاء الاصطناعي. تأتي من التتبع.
            </h2>
          </div>
          <ProofChain />
        </div>
      </section>

      {/* 8. AuditOS Example — Light */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-t">
        <SectionEyebrow
          label="مثال تطبيقي"
          title="AuditOS: مثال على أنظمة عقلية المتخصصة"
          description="AuditOS هو أحد منتجات عقلية، مصمم للمراجعة والتدقيق والذكاء المالي. يوضح كيف نحوّل سير عمل مهني معقد إلى نظام واضح، قابل للتتبع، وجاهز للمراجعة."
        />
        <div className="mt-10">
          <ExecutiveSurface>
            <WorkflowChain
              steps={["ميزان المراجعة", "التصنيف", "القوائم المالية", "الإيضاحات", "الأدلة", "التتبع"]}
              className="justify-center"
            />
          </ExecutiveSurface>
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/auditos"
            className="inline-flex h-12 items-center justify-center rounded-md border bg-background px-8 text-base font-medium text-foreground transition-colors hover:bg-muted"
          >
            استعرض AuditOS
          </Link>
        </div>
      </section>

      {/* 9. Final CTA — Dark */}
      <section className="bg-[#0B1728] border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl rounded-xl border border-white/10 bg-white/[0.03] p-8 sm:p-12 text-center">
            <h2 className="text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
              هل تحتاج نظامًا مصممًا لطريقة عمل مؤسستك؟
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/custom-product" className="inline-flex h-12 items-center justify-center rounded-md bg-[#137dc5] px-8 text-base font-medium text-white transition-colors hover:bg-[#137dc5]/90">
                صمّم نظامك الآن
              </Link>
              <Link href="/contact" className="inline-flex h-12 items-center justify-center rounded-md border border-white/15 bg-white/5 px-8 text-base font-medium text-white/80 transition-colors hover:bg-white/10">
                تواصل معنا
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
