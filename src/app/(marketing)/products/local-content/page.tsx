import Link from "next/link"
import type { Metadata } from "next"

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
    <>
      <section className="border-b py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-6">
          <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← العودة إلى خطوط الحلول
          </Link>
          <h1 className="mt-4 text-3xl font-black sm:text-4xl">أنظمة المحتوى المحلي</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            نظام يساعد المؤسسات على إدارة وتحليل بيانات الموردين، الإنفاق، الالتزام، ومؤشرات المحتوى المحلي بطريقة أوضح وقابلة للتتبع.
          </p>
        </div>
      </section>

      <section className="border-b py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-xl font-bold">لمن هذا النظام؟</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {["فرق المشتريات", "فرق المحتوى المحلي", "فرق الامتثال", "الجهات الحكومية وشبه الحكومية", "الشركات الكبيرة", "الشركات التي تتعامل مع متطلبات محتوى محلي"].map((item) => (
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
            إدارة المحتوى المحلي تحتاج بيانات واضحة عن الموردين، الإنفاق، التصنيف، الالتزام، والأثر المتوقع للقرارات الشرائية. النظام يساعد على تحويل هذه البيانات إلى رؤية قابلة للاستخدام.
          </p>
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
