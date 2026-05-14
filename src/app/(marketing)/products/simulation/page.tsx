import Link from "next/link"
import type { Metadata } from "next"
import { SectionEyebrow, BeforeAfterBlock, ProductWorkflowVisual, OutputCard, EnterpriseCTA } from "@/components/enterprise"

export const metadata: Metadata = {
  title: "أنظمة المحاكاة | AQLIYA",
  description: "SimulationOS خط نظام لمحاكاة السيناريوهات مبني على AQLIYA Intelligence Core، يدعم المقارنة والتقدير قبل التنفيذ داخل مسار قابل للمراجعة والاعتماد.",
}

const outputs = [
  "Scenario Report",
  "Impact Comparison",
  "Risk View",
  "Cost/Benefit Simulation",
  "Recommendation Input",
]

export default function SimulationProductPage() {
  return (
    <div className="flex flex-col gap-20 sm:gap-28">
      {/* 1. Product Hero */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← العودة إلى خطوط عقلية
          </Link>
          <h1 className="mt-6 text-3xl font-black sm:text-4xl">SimulationOS — نظام محاكاة السيناريوهات</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            خط نظام تحت عقلية يساعد المؤسسات على اختبار السيناريوهات قبل التنفيذ ومقارنة أثر الخيارات على النتائج والتكلفة والمخاطر، ضمن مسار محاكاة مبني على AQLIYA Intelligence Core.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              نظام قابل للتفعيل حسب نطاق المؤسسة
            </span>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/custom-product" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              ناقش تفعيل النظام
            </Link>
            <Link href="/products" className="inline-flex h-11 items-center justify-center rounded-md border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              استكشف خطوط عقلية
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Before / After */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="المشكلة والحل"
          title="لماذا تحتاج المؤسسات محاكاة قبل التنفيذ؟"
          description="SimulationOS يربط الافتراضات والمدخلات والمقارنة داخل خط نظام محكوم، بحيث تصبح المحاكاة أداة قرار قابلة للمراجعة لا مجرد تصور منفصل."
        />
        <div className="mt-10">
          <BeforeAfterBlock
            before={["قرارات تتخذ دون اختبار الأثر", "توقعات غير مدعومة ببيانات", "صعوبة مقارنة السيناريوهات", "مخاطر غير محسوبة", "تكاليف غير متوقعة"]}
            after={["سيناريوهات مدروسة وقابلة للمقارنة", "أثر واضح على التكلفة والإيرادات", "تقييم مخاطر منهجي", "دعم القرار بالبيانات", "توقعات واقعية وموثقة"]}
          />
        </div>
      </section>

      {/* 3. Workflow Visual */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="سير العمل"
          title="كيف يعمل النظام؟"
        />
        <div className="mt-10">
          <ProductWorkflowVisual
            title="من المدخلات إلى دعم القرار"
            steps={["المدخلات", "نموذج السيناريو", "الافتراضات", "الأثر", "المقارنة", "دعم القرار"]}
          />
        </div>
      </section>

      {/* 4. Outputs */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="المخرجات"
          title="ماذا ينتج النظام؟"
        />
        <div className="mt-10">
          <OutputCard title="تقارير المحاكاة والمقارنات" items={outputs} />
        </div>
      </section>

      {/* 5. Customization */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="التخصيص"
          title="كيف يتكيف النظام مع مؤسستك؟"
          description="يُفعّل SimulationOS حسب نطاق المؤسسة عبر النماذج، المتغيرات، معايير المقارنة، التقارير، ولوحات العرض، مع بقاء منطق التتبع والمراجعة ثابتًا فوق AQLIYA Intelligence Core."
        />
      </section>

      {/* 6. Use Scenario */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="سيناريو تطبيقي"
          title="محاكاة أثر تغيير الموردين"
        />
        <div className="mt-10 rounded-xl border bg-muted/30 p-6 sm:p-8">
          <p className="text-base leading-8 text-muted-foreground">
            <strong className="text-foreground">قبل:</strong> اختيار الموردين يعتمد على السعر فقط، دون فهم الأثر الكلي على الجودة، الالتزام، والمحتوى المحلي.
          </p>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            <strong className="text-foreground">بعد:</strong> محاكاة شاملة تقارن بين الموردين بناءً على السعر، الجودة، الالتزام، المحتوى المحلي، والمخاطر التشغيلية.
          </p>
        </div>
      </section>

      {/* 7. CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <EnterpriseCTA
          title="هل تحتاج نظام محاكاة لمؤسستك؟"
          primaryLabel="ناقش تفعيل النظام"
          primaryHref="/custom-product"
          secondaryLabel="استكشف خطوط عقلية"
          secondaryHref="/contact"
        />
      </section>
    </div>
  )
}
