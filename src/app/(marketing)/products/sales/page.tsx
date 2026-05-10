import Link from "next/link"
import type { Metadata } from "next"

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
    <>
      <section className="border-b py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-6">
          <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← العودة إلى خطوط الحلول
          </Link>
          <h1 className="mt-4 text-3xl font-black sm:text-4xl">أنظمة المبيعات</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            نظام يساعد فرق B2B على تنظيم المبيعات من تعريف العميل المثالي إلى تأهيل العملاء، ترتيب الأولويات، تنفيذ الحملات، المتابعة، وتحسين الأداء.
          </p>
        </div>
      </section>

      <section className="border-b py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-xl font-bold">لمن هذا النظام؟</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {["فرق المبيعات B2B", "شركات الخدمات", "شركات التقنية", "فرق النمو", "فرق تطوير الأعمال", "الاستشاريون ومزودو الخدمات"].map((item) => (
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
            كثير من فرق المبيعات تعمل بعشوائية: عملاء غير مؤهلين، رسائل عامة، متابعة ضعيفة، وغياب واضح لمنطق الأولوية. النظام يساعد على بناء مسار مبيعات أوضح:
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-4 text-sm font-medium">
            <span className="rounded-md bg-primary/10 px-3 py-1.5 text-primary">ICP</span>
            <span className="text-muted-foreground">→</span>
            <span className="rounded-md bg-primary/10 px-3 py-1.5 text-primary">Scoring</span>
            <span className="text-muted-foreground">→</span>
            <span className="rounded-md bg-primary/10 px-3 py-1.5 text-primary">Filtering</span>
            <span className="text-muted-foreground">→</span>
            <span className="rounded-md bg-primary/10 px-3 py-1.5 text-primary">Prioritization</span>
            <span className="text-muted-foreground">→</span>
            <span className="rounded-md bg-primary/10 px-3 py-1.5 text-primary">Outreach</span>
            <span className="text-muted-foreground">→</span>
            <span className="rounded-md bg-primary/10 px-3 py-1.5 text-primary">Follow-up</span>
            <span className="text-muted-foreground">→</span>
            <span className="rounded-md bg-primary/10 px-3 py-1.5 text-primary">Learning</span>
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
