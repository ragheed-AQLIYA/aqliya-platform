import Link from "next/link"
import { SectionEyebrow, AqliyaOperatingMap, CompanyProductMap, BeforeAfterBlock, WorkflowChain, ProductLineCard, ProofCard, EnterpriseCTA, ExecutiveSurface } from "@/components/enterprise"

const products = [
  {
    title: "الأنظمة المؤسسية المخصصة",
    desc: "نبني أنظمة رقمية من الصفر أو نخصص حلولاً موجودة لتتناسب تمامًا مع إجراءات مؤسستك، بياناتها، صلاحياتها، ومخرجاتها.",
    href: "/custom-product",
    workflow: ["فهم العمل", "تصميم النظام", "البناء", "التشغيل"],
    visualType: "workflow" as const,
  },
  {
    title: "أنظمة اتخاذ القرار",
    desc: "أنظمة تساعد المؤسسات على تنظيم القرارات المعقدة من البدائل والمعايير إلى التوصية والاعتماد.",
    href: "/products/decision",
    workflow: ["المشكلة", "البدائل", "المعايير", "التوصية"],
    visualType: "decision" as const,
  },
  {
    title: "أنظمة المحاكاة",
    desc: "أنظمة تساعد على اختبار السيناريوهات قبل التنفيذ لفهم الأثر، المخاطر، التكلفة، والنتائج المحتملة.",
    href: "/products/simulation",
    workflow: ["المدخلات", "السيناريو", "الافتراضات", "الأثر"],
    visualType: "simulation" as const,
  },
  {
    title: "أنظمة المبيعات",
    desc: "أنظمة تساعد فرق B2B على التأهيل، الترتيب، الفلترة، الحملات، المتابعة، وتحسين الأداء.",
    href: "/products/sales",
    workflow: ["ICP", "التأهيل", "المتابعة", "التحسين"],
    visualType: "sales" as const,
  },
  {
    title: "AQLIYA AuditOS",
    desc: "نظام المراجعة والتدقيق والذكاء المالي. يوضح كيف يمكن لعقلية تحويل سير عمل مهني معقد إلى نظام واضح وقابل للتتبع.",
    href: "/auditos",
    workflow: ["ميزان المراجعة", "التصنيف", "القوائم", "الأدلة"],
    visualType: "audit" as const,
  },
  {
    title: "أنظمة المحتوى المحلي",
    desc: "أنظمة تساعد المؤسسات على إدارة وتحليل الموردين، الإنفاق، الالتزام، ومؤشرات المحتوى المحلي.",
    href: "/products/local-content",
    workflow: ["الموردين", "الإنفاق", "الالتزام", "التقارير"],
    visualType: "local-content" as const,
  },
]

const proofPrinciples = [
  {
    title: "التتبع",
    description: "كل مخرج مرتبط بمصدره، وكل قرار يمكن تتبعه إلى البيانات التي بُني عليها.",
    flow: ["المصدر", "المعالجة", "المخرج", "الدليل"],
    metric: { value: "100%", label: "قابل للتتبع" },
  },
  {
    title: "المراجعة",
    description: "كل نتيجة قابلة للفحص والمراجعة قبل الاعتماد النهائي، مما يضمن جودة المخرجات.",
    flow: ["النتيجة", "الفحص", "المراجعة", "الاعتماد"],
    metric: { value: "3", label: "نقاط مراجعة" },
  },
  {
    title: "التخصيص",
    description: "النظام يُبنى حسب طبيعة المؤسسة، لا نفرض قالبًا واحدًا على جميع العملاء.",
    flow: ["العمل", "القواعد", "النظام"],
    metric: { value: "6", label: "خطوط حلول" },
  },
  {
    title: "التطوير",
    description: "النظام قابل للتحسين والتوسع بعد التشغيل لينمو مع نمو المؤسسة.",
    flow: ["الاستخدام", "الملاحظات", "التحسين"],
    metric: { value: "∞", label: "قابل للتوسع" },
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* 1. Hero — Split Layout Command Center */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--brand-blue)/6,transparent_70%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
            {/* Right: Text Content */}
            <div className="flex flex-col justify-center">
              <span className="inline-block w-fit rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold tracking-wider text-primary uppercase mb-6">
                Enterprise Operating Systems
              </span>
              <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                أنظمة برمجية مصممة حول طريقة عمل مؤسستك
              </h1>
              <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
                نصنع ونعدّ أنظمة رقمية وذكاء مؤسسي تساعد المؤسسات على تنظيم أعمالها، تشغيل بياناتها، تحسين مخرجاتها، وربط إجراءاتها بمنطق واضح قابل للتتبع والمراجعة.
              </p>
              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row">
                <Link
                  href="/custom-product"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  صمّم نظامك
                </Link>
                <Link
                  href="/auditos"
                  className="inline-flex h-12 items-center justify-center rounded-md border bg-background px-8 text-base font-medium text-foreground transition-colors hover:bg-muted"
                >
                  استعرض AuditOS
                </Link>
              </div>
              <p className="mt-5 text-sm text-muted-foreground/70">
                أنظمة مخصصة  ·  مخرجات قابلة للتتبع  ·  ديمو AuditOS جاهز
              </p>
            </div>

            {/* Left: Operating Map Visual */}
            <div className="flex items-center">
              <AqliyaOperatingMap className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Brand Architecture */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <SectionEyebrow
          label="هيكلية العلامة التجارية"
          title="عقلية ليست منتجًا واحدًا"
          description="عقلية هي الشركة التي تبني الأنظمة. منتجات مثل AuditOS تمثل أحد تطبيقات عقلية في مجال محدد، لكنها لا تحد نطاق الشركة."
        />
        <div className="mt-10">
          <CompanyProductMap />
        </div>
      </section>

      {/* 3. Problem — Before / After */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24 border-t">
        <SectionEyebrow
          label="المشكلة والحل"
          title="المؤسسات لا تحتاج أدوات أكثر. تحتاج أنظمة أوضح."
        />
        <div className="mt-10">
          <BeforeAfterBlock
            before={["ملفات Excel متفرقة", "اعتماد عبر البريد الإلكتروني", "موافقات يدوية غير موثقة", "أنظمة غير مترابطة", "صلاحيات ومسؤوليات غير واضحة"]}
            after={["سير عمل موحد ومترابط", "مخرجات قابلة للتتبع والمراجعة", "قرارات موثقة ومنطقية", "وضوح تشغيلي كامل", "تقارير وأدلة جاهزة"]}
          />
        </div>
      </section>

      {/* 4. Methodology */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24 border-t">
        <SectionEyebrow
          label="منهجية العمل"
          title="من طبيعة العمل إلى نظام قابل للتشغيل"
        />
        <div className="mt-10">
          <ExecutiveSurface>
            <WorkflowChain
              steps={["فهم العمل", "رسم سير العمليات", "تصميم النظام", "ربط البيانات", "تشغيل المخرجات", "التتبع والمراجعة", "التطوير"]}
              className="justify-center"
            />
          </ExecutiveSurface>
        </div>
      </section>

      {/* 5. Custom Product */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24 border-t">
        <SectionEyebrow
          label="العرض الأساسي"
          title="صمّم نظامًا خاصًا بطبيعة عمل مؤسستك"
          description="إذا كانت مؤسستك تعتمد على إجراءات متكررة، ملفات متفرقة، قرارات غير موثقة، أو مخرجات تحتاج مراجعة واعتماد، يمكن لعقلية تحويل ذلك إلى نظام رقمي واضح وقابل للتشغيل."
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

      {/* 6. Product Lines */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24 border-t">
        <SectionEyebrow
          label="خطوط الحلول"
          title="خطوط حلول جاهزة وقابلة للتخصيص"
          description="هذه الخطوط لا تحد نطاق عقلية، بل تمثل نماذج من قدرتها على بناء أنظمة متخصصة حسب الحاجة."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductLineCard
              key={product.href}
              title={product.title}
              description={product.desc}
              href={product.href}
              workflow={product.workflow}
              visualType={product.visualType}
            />
          ))}
        </div>
      </section>

      {/* 7. Proof Layer */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24 border-t">
        <SectionEyebrow
          label="الثقة البصرية"
          title="كيف تتحول البيانات إلى نظام قابل للثقة؟"
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {proofPrinciples.map((principle) => (
            <ProofCard
              key={principle.title}
              title={principle.title}
              description={principle.description}
              flow={principle.flow}
              metric={principle.metric}
            />
          ))}
        </div>
      </section>

      {/* 8. AuditOS Example */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24 border-t">
        <SectionEyebrow
          label="مثال تطبيقي"
          title="AuditOS: مثال على أنظمة عقلية المتخصصة"
          description="AuditOS هو أحد منتجات عقلية، مصمم للمراجعة والتدقيق والذكاء المالي. يوضح كيف يمكن لعقلية تحويل سير عمل مهني معقد إلى نظام واضح، قابل للتتبع، وجاهز للمراجعة."
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

      {/* 9. Executive CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24 border-t">
        <EnterpriseCTA
          title="هل تحتاج نظامًا مصممًا لطريقة عمل مؤسستك؟"
          primaryLabel="صمّم نظامك الآن"
          primaryHref="/custom-product"
          secondaryLabel="تواصل معنا"
          secondaryHref="/contact"
        />
      </section>
    </div>
  )
}
