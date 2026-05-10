import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "أنظمة المراجعة والتدقيق | AQLIYA",
  description: "نظام يساعد مكاتب الأوديت والفرق المالية على تنظيم أعمال المراجعة.",
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
    <>
      <section className="border-b py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-6">
          <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← العودة إلى خطوط الحلول
          </Link>
          <h1 className="mt-4 text-3xl font-black sm:text-4xl">أنظمة المراجعة والتدقيق</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            نظام يساعد مكاتب الأوديت والفرق المالية على تنظيم أعمال المراجعة، الأدلة، الملاحظات، المخرجات، ومسارات الاعتماد.
          </p>
          <p className="mt-4 text-base text-muted-foreground/80">
            لا يستبدل النظام المحاسب أو المراجع. بل يساعد على تجهيز وتنظيم المخرجات، ربطها بالأدلة، وتسهيل المراجعة البشرية.
          </p>
        </div>
      </section>

      <section className="border-b py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-xl font-bold">لمن هذا النظام؟</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {["مكاتب المراجعة", "مكاتب المحاسبة", "الفرق المالية", "فرق التقارير المالية", "فرق الفحص الداخلي", "فرق الامتثال المالي"].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-lg border bg-background p-4">
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-xl font-bold">ما المشكلة التي يحلها؟</h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            تتطلب أعمال المراجعة والتقارير المالية دقة، تتبع، أدلة، ومراجعة. وعندما تكون البيانات متفرقة، تصبح عملية التحضير والمراجعة أكثر بطئًا وعرضة للأخطاء. النظام يساعد على تنظيم سير العمل:
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-4 text-sm font-medium">
            <span className="rounded-md bg-primary/10 px-3 py-1.5 text-primary">بيانات</span>
            <span className="text-muted-foreground">→</span>
            <span className="rounded-md bg-primary/10 px-3 py-1.5 text-primary">تصنيف</span>
            <span className="text-muted-foreground">→</span>
            <span className="rounded-md bg-primary/10 px-3 py-1.5 text-primary">مراجعة</span>
            <span className="text-muted-foreground">→</span>
            <span className="rounded-md bg-primary/10 px-3 py-1.5 text-primary">مخرجات</span>
            <span className="text-muted-foreground">→</span>
            <span className="rounded-md bg-primary/10 px-3 py-1.5 text-primary">أدلة</span>
            <span className="text-muted-foreground">→</span>
            <span className="rounded-md bg-primary/10 px-3 py-1.5 text-primary">ملاحظات</span>
            <span className="text-muted-foreground">→</span>
            <span className="rounded-md bg-primary/10 px-3 py-1.5 text-primary">اعتماد</span>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-xl font-bold">المخرجات</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {outputs.map((item) => (
              <div key={item} className="rounded-lg border bg-background px-4 py-3 text-sm">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              اطلب النظام
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
