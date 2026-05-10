import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "أنظمة المحاكاة | AQLIYA",
  description: "نظام يساعد المؤسسات على اختبار السيناريوهات قبل التنفيذ.",
}

const useCases = [
  "محاكاة أثر تغيير الأسعار",
  "محاكاة تغير التكاليف",
  "محاكاة أثر اختيار مورد",
  "محاكاة سيناريوهات المبيعات",
  "محاكاة نسب المحتوى المحلي",
  "محاكاة المخاطر التشغيلية",
]

const outputs = [
  "Scenario Report",
  "Impact Comparison",
  "Risk View",
  "Cost/Benefit Simulation",
  "Recommendation Input",
]

export default function SimulationProductPage() {
  return (
    <>
      <section className="border-b py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-6">
          <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← العودة إلى خطوط الحلول
          </Link>
          <h1 className="mt-4 text-3xl font-black sm:text-4xl">أنظمة المحاكاة</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            نظام يساعد المؤسسات على اختبار السيناريوهات قبل التنفيذ، ومقارنة أثر الخيارات على النتائج، التكاليف، المخاطر، الإيرادات، أو مؤشرات الأداء.
          </p>
        </div>
      </section>

      <section className="border-b py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-xl font-bold">لمن هذا النظام؟</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {["فرق الإدارة", "فرق المالية", "فرق المبيعات", "فرق المشتريات", "فرق التخطيط", "فرق المحتوى المحلي والامتثال"].map((item) => (
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
            القرارات الكبرى غالبًا تُتخذ قبل اختبار أثرها بشكل كافٍ. المحاكاة تساعد المؤسسة على رؤية النتائج المحتملة قبل الالتزام بالتنفيذ.
          </p>
        </div>
      </section>

      <section className="border-b py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-xl font-bold">أمثلة استخدام</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {useCases.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-lg border bg-background p-4">
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
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
