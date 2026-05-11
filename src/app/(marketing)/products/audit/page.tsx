import Link from "next/link"
import type { Metadata } from "next"
import { SectionEyebrow, BeforeAfterBlock, ProductWorkflowVisual, OutputCard, MetricCard, EnterpriseCTA, InsightCallout } from "@/components/enterprise"

export const metadata: Metadata = {
  title: "AQLIYA AuditOS — نظام المراجعة والتدقيق من عقلية",
  description: "نظام يساعد مكاتب الأوديت والفرق المالية على تنظيم أعمال المراجعة، الأدلة، الملاحظات، المخرجات، ومسارات الاعتماد.",
}

const outputs = [
  "Account Mapping",
  "Trial Balance Review",
  "Financial Statements Draft",
  "Notes Draft",
  "Missing Information Checklist",
  "Reclassification Recommendations",
  "Review Points",
  "Evidence Requirements",
  "Approval Trail",
]

export default function AuditProductPage() {
  return (
    <div className="flex flex-col gap-20 sm:gap-28">
      {/* 1. Product Hero */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← العودة إلى خطوط الحلول
          </Link>
          <h1 className="mt-6 text-3xl font-black sm:text-4xl">AQLIYA AuditOS — نظام المراجعة والتدقيق من عقلية</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            نظام يساعد مكاتب الأوديت والفرق المالية على تنظيم أعمال المراجعة، الأدلة، الملاحظات، المخرجات، ومسارات الاعتماد.
          </p>
          <InsightCallout
            text="AuditOS ليس هو عقلية كلها. هو أحد أنظمة عقلية المتخصصة في مجال المراجعة والتدقيق والذكاء المالي."
            type="info"
            className="mt-6 max-w-2xl"
          />
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/auditos" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              استعرض AuditOS
            </Link>
            <Link href="/custom-product" className="inline-flex h-11 items-center justify-center rounded-md border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              اطلب تخصيص هذا النظام
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Before / After */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="المشكلة والحل"
          title="لماذا تحتاج المؤسسات AuditOS؟"
        />
        <div className="mt-10">
          <BeforeAfterBlock
            before={["ملفات Excel متفرقة", "تصنيف يدوي للحسابات", "أدلة وملاحظات غير مرتبطة", "مراجعات يدوية بطيئة", "صعوبة تتبع المخرجات"]}
            after={["ميزان مراجعة منظم", "تصنيف واضح وقابل للمراجعة", "أدلة وملاحظات مرتبطة بالحسابات", "مخرجات جاهزة للفحص", "تتبع كامل لكل قرار"]}
          />
        </div>
      </section>

      {/* 3. Proof Metrics */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="مؤشرات الثقة"
          title="أرقام تثبت جدية النظام"
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <MetricCard label="حساب في ميزان المراجعة" value={22} />
          <MetricCard label="حساب مؤكد التصنيف" value={21} />
          <MetricCard label="إيضاحات" value={7} />
          <MetricCard label="أدلة" value={6} />
          <MetricCard label="حدث تتبع" value={16} />
        </div>
      </section>

      {/* 4. Workflow Visual */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="سير العمل"
          title="كيف يعمل AuditOS؟"
        />
        <div className="mt-10">
          <ProductWorkflowVisual
            title="من ميزان المراجعة إلى التتبع"
            steps={["ميزان المراجعة", "التصنيف", "القوائم المالية", "الإيضاحات", "الأدلة", "التتبع"]}
          />
        </div>
      </section>

      {/* 5. Outputs */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="المخرجات"
          title="ماذا ينتج النظام؟"
        />
        <div className="mt-10">
          <OutputCard title="تقارير وسجلات المراجعة" items={outputs} />
        </div>
      </section>

      {/* 6. Customization */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="التخصيص"
          title="كيف يتكيف النظام مع مؤسستك؟"
          description="يمكن تخصيص معايير التصنيف، قوالب الإيضاحات، متطلبات الأدلة، صلاحيات المراجعة، والتقارير حسب طبيعة عملك ومعاييرك."
        />
      </section>

      {/* 7. Use Scenario */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="سيناريو تطبيقي"
          title="مكتب مراجعة — شركة متوسطة"
        />
        <div className="mt-10 rounded-xl border bg-muted/30 p-6 sm:p-8">
          <p className="text-base leading-8 text-muted-foreground">
            <strong className="text-foreground">قبل:</strong> ملفات Excel متفرقة، تصنيف يدوي للحسابات، وأدلة وملاحظات غير مرتبطة بشكل واضح.
          </p>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            <strong className="text-foreground">بعد:</strong> ميزان مراجعة → تصنيف → قوائم مالية → إيضاحات → أدلة → تتبع. كل مخرج مرتبط بمصدره، وكل قرار قابل للمراجعة.
          </p>
        </div>
      </section>

      {/* 8. CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <EnterpriseCTA
          title="هل تريد تجربة AuditOS على بيانات مؤسستك؟"
          primaryLabel="استعرض AuditOS"
          primaryHref="/auditos"
          secondaryLabel="اطلب Pilot"
          secondaryHref="/custom-product"
        />
      </section>
    </div>
  )
}
