import Link from "next/link"
import type { Metadata } from "next"
import { SectionEyebrow, BeforeAfterBlock, ProductWorkflowVisual, OutputCard, EnterpriseCTA } from "@/components/enterprise"

export const metadata: Metadata = {
  title: "أنظمة اتخاذ القرار | AQLIYA",
  description: "نظام يساعد المؤسسات على تنظيم القرارات المعقدة من المشكلة إلى التوصية والاعتماد.",
}

const outputs = [
  "Decision Brief",
  "Decision Memo",
  "Comparison Matrix",
  "Risk Summary",
  "Recommendation Report",
  "Approval Log",
]

export default function DecisionProductPage() {
  return (
    <div className="flex flex-col gap-20 sm:gap-28">
      {/* 1. Product Hero */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← العودة إلى خطوط الحلول
          </Link>
          <h1 className="mt-6 text-3xl font-black sm:text-4xl">أنظمة اتخاذ القرار</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            نظام يساعد المؤسسات على تنظيم القرارات المعقدة من مرحلة تحديد المشكلة إلى مقارنة البدائل، تقييم المخاطر، توثيق المبررات، وإصدار توصية قابلة للمراجعة والاعتماد.
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
          title="لماذا تحتاج المؤسسات نظام قرار واضح؟"
        />
        <div className="mt-10">
          <BeforeAfterBlock
            before={["قرارات تعتمد على النقاشات فقط", "ملفات ومبررات غير موثقة", "تقييم مخاطر غير منهجي", "صعوبة تتبع سبب القرار", "اعتمادات غير واضحة"]}
            after={["مسار قرار موثق ومنهجي", "معايير تقييم واضحة وقابلة للقياس", "ملخص مخاطر مرتبط بالبدائل", "توصية مدعومة بالأدلة", "سجل اعتماد كامل"]}
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
            title="من المشكلة إلى الاعتماد"
            steps={["المشكلة", "البدائل", "المعايير", "المخاطر", "الأدلة", "التوصية", "الاعتماد"]}
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
          <OutputCard title="تقارير وسجلات القرار" items={outputs} />
        </div>
      </section>

      {/* 5. Customization */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="التخصيص"
          title="كيف يتكيف النظام مع مؤسستك؟"
          description="يمكن تخصيص النظام ليناسب بياناتك، صلاحيات فرقك، إجراءات الاعتماد، معايير التقييم، والتقارير المطلوبة."
        />
      </section>

      {/* 6. Use Scenario */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="سيناريو تطبيقي"
          title="لجنة المشتريات في مؤسسة كبيرة"
        />
        <div className="mt-10 rounded-xl border bg-muted/30 p-6 sm:p-8">
          <p className="text-base leading-8 text-muted-foreground">
            <strong className="text-foreground">قبل:</strong> قرارات الشراء تتم عبر اجتماعات متفرقة، عروض أسعار غير مقارنة بمنهجية واضحة، ومبررات غير موثقة.
          </p>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            <strong className="text-foreground">بعد:</strong> كل قرار يمر بمسار واضح: تحديد الحاجة → مقارنة البدائل → تقييم المخاطر → توثيق المبررات → إصدار التوصية → الاعتماد الرسمي.
          </p>
        </div>
      </section>

      {/* 7. CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <EnterpriseCTA
          title="هل تحتاج نظام قرار واضح لمؤسستك؟"
          primaryLabel="اطلب تخصيص هذا النظام"
          primaryHref="/custom-product"
          secondaryLabel="تواصل معنا"
          secondaryHref="/contact"
        />
      </section>
    </div>
  )
}
