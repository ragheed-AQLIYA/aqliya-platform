import Link from "next/link"
import type { Metadata } from "next"
import { SectionEyebrow, BeforeAfterBlock, ProductWorkflowVisual, OutputCard, EnterpriseCTA } from "@/components/enterprise"

export const metadata: Metadata = {
  title: "أنظمة المبيعات | AQLIYA",
  description: "نظام يساعد فرق B2B على تنظيم المبيعات من تأهيل العملاء إلى تحسين الأداء.",
}

const outputs = [
  "ICP Profiles",
  "Lead Score",
  "Opportunity List",
  "Campaign Logic",
  "Follow-up Tracker",
  "Sales Learning Report",
]

export default function SalesProductPage() {
  return (
    <div className="flex flex-col gap-20 sm:gap-28">
      {/* 1. Product Hero */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← العودة إلى خطوط الحلول
          </Link>
          <h1 className="mt-6 text-3xl font-black sm:text-4xl">أنظمة المبيعات</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            نظام يساعد فرق B2B على تنظيم المبيعات من تعريف العميل المثالي إلى تأهيل العملاء، ترتيب الأولويات، تنفيذ الحملات، المتابعة، وتحسين الأداء.
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
          title="لماذا تحتاج فرق المبيعات نظامًا واضحًا؟"
        />
        <div className="mt-10">
          <BeforeAfterBlock
            before={["عملاء غير مؤهلين", "رسائل عامة وغير مخصصة", "متابعة ضعيفة أو عشوائية", "غياب منطق الأولوية", "تقارير أداء غير دقيقة"]}
            after={["ملف عميل مثالي واضح (ICP)", "تأهيل وترتيب منهجي", "حملات ومتابعة منظمة", "أولويات مبنية على البيانات", "تقارير تعلم وتحسين مستمر"]}
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
            title="من التأهيل إلى التعلم"
            steps={["ICP", "التأهيل", "الفلترة", "التواصل", "المتابعة", "التعلم"]}
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
          <OutputCard title="تقارير المبيعات والأداء" items={outputs} />
        </div>
      </section>

      {/* 5. Customization */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="التخصيص"
          title="كيف يتكيف النظام مع مؤسستك؟"
          description="يمكن تخصيص معايير التأهيل، منطق الترتيب، قنوات التواصل، تقارير الأداء، ولوحات المتابعة حسب طبيعة عملك."
        />
      </section>

      {/* 6. Use Scenario */}
      <section className="mx-auto max-w-7xl px-6">
          <SectionEyebrow
            label="سيناريو تطبيقي"
            title="فريق مبيعات B2B في شركة خدمات"
          />
          <div className="mt-10 rounded-xl border bg-muted/30 p-6 sm:p-8">
          <p className="text-base leading-8 text-muted-foreground">
            <strong className="text-foreground">قبل:</strong> الفريق يتواصل مع أي عميل محتمل، بدون تأهيل واضح، والمتابعة تعتمد على الذاكرة والاجتهاد الشخصي.
          </p>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            <strong className="text-foreground">بعد:</strong> كل عميل يمر بمسار تأهيل واضح، يتم ترتيبه بناءً على معايير محددة، والمتابعة تتم تلقائيًا وفقًا لمنطق محدد.
          </p>
        </div>
      </section>

      {/* 7. CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <EnterpriseCTA
          title="هل تحتاج نظام مبيعات واضح لفريقك؟"
          primaryLabel="اطلب تخصيص هذا النظام"
          primaryHref="/custom-product"
          secondaryLabel="تواصل معنا"
          secondaryHref="/contact"
        />
      </section>
    </div>
  )
}
