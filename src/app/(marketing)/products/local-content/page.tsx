import Link from "next/link"
import type { Metadata } from "next"
import { SectionEyebrow, BeforeAfterBlock, ProductWorkflowVisual, OutputCard, EnterpriseCTA } from "@/components/enterprise"

export const metadata: Metadata = {
  title: "أنظمة المحتوى المحلي | AQLIYA",
  description: "نظام يساعد المؤسسات على إدارة وتحليل بيانات الموردين والإنفاق والالتزام.",
}

const outputs = [
  "Supplier Classification",
  "Spend Analysis",
  "Local Content Indicators",
  "Compliance Gap View",
  "Procurement Impact Simulation",
  "Local Content Report",
  "Supplier Improvement Tracker",
]

export default function LocalContentProductPage() {
  return (
    <div className="flex flex-col gap-20 sm:gap-28">
      {/* 1. Product Hero */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← العودة إلى خطوط الحلول
          </Link>
          <h1 className="mt-6 text-3xl font-black sm:text-4xl">أنظمة المحتوى المحلي</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            نظام يساعد المؤسسات على إدارة وتحليل بيانات الموردين، الإنفاق، الالتزام، ومؤشرات المحتوى المحلي بطريقة أوضح وقابلة للتتبع.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/custom-product" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              اطلب تخصيص هذا النظام
            </Link>
            <Link href="/auditos" className="inline-flex h-11 items-center justify-center rounded-md border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              استعرض AuditOS
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Before / After */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="المشكلة والحل"
          title="لماذا تحتاج المؤسسات نظام محتوى محلي واضح؟"
        />
        <div className="mt-10">
          <BeforeAfterBlock
            before={["بيانات الموردين غير مصنفة", "تحليل إنفاق يدوي وغير دقيق", "صعوبة قياس الالتزام", "مؤشرات محتوى محلي غير واضحة", "قرارات شراء دون محاكاة الأثر"]}
            after={["تصنيف واضح للموردين", "تحليل إنفاق آلي وقابل للتتبع", "عرض فجوات الالتزام", "مؤشرات محتوى محلي دقيقة", "محاكاة أثر القرارات الشرائية"]}
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
            title="من الموردين إلى التقارير"
            steps={["الموردين", "الإنفاق", "التصنيف", "فجوة الالتزام", "المحاكاة", "التقارير"]}
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
          <OutputCard title="تقارير المحتوى المحلي والامتثال" items={outputs} />
        </div>
      </section>

      {/* 5. Customization */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="التخصيص"
          title="كيف يتكيف النظام مع مؤسستك؟"
          description="يمكن تخصيص معايير التصنيف، مؤشرات المحتوى المحلي، قوالب التقارير، ومتطلبات الامتثال حسب طبيعة عملك والجهة التنظيمية."
        />
      </section>

      {/* 6. Use Scenario */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="سيناريو تطبيقي"
          title="جهة حكومية — إدارة المشتريات"
        />
        <div className="mt-10 rounded-xl border bg-muted/30 p-6 sm:p-8">
          <p className="text-base leading-8 text-muted-foreground">
            <strong className="text-foreground">قبل:</strong> تحليل المحتوى المحلي يتم يدويًا، بيانات الموردين غير محدثة، وصعوبة في قياس أثر قرارات الشراء على الالتزام.
          </p>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            <strong className="text-foreground">بعد:</strong> نظام واضح يصنف الموردين، يحلل الإنفاق، يقيس الالتزام، ويحاكي أثر القرارات الشرائية على مؤشرات المحتوى المحلي.
          </p>
        </div>
      </section>

      {/* 7. CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <EnterpriseCTA
          title="هل تحتاج نظام محتوى محلي لمؤسستك؟"
          primaryLabel="اطلب تخصيص هذا النظام"
          primaryHref="/custom-product"
          secondaryLabel="تواصل معنا"
          secondaryHref="/contact"
        />
      </section>
    </div>
  )
}
