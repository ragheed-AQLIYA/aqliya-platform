import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "تواصل معنا | AQLIYA",
  description: "ابدأ مشروعك مع عقلية — تصميم منتج خاص، تخصيص حلول جاهزة، أو مناقشة احتياج تشغيلي.",
}

const requestTypes = [
  "تصميم منتج خاص",
  "تخصيص منتج جاهز",
  "استشارة حول نظام داخلي",
  "بناء منصة SaaS",
  "تطوير نظام بيانات أو تقارير",
  "نظام محتوى محلي",
  "نظام مبيعات",
  "نظام مراجعة وتدقيق",
  "نظام محاكاة",
  "نظام اتخاذ قرار",
]

export default function ContactPage() {
  return (
    <>
      <section className="border-b py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-3xl font-black sm:text-4xl">ابدأ مشروعك مع عقلية</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            سواء كنت تريد تصميم منتج خاص، تخصيص أحد حلول عقلية، أو مناقشة احتياج تشغيلي داخل مؤسستك، يمكننا مساعدتك على تحويل الفكرة إلى نظام قابل للتشغيل.
          </p>
          <div className="mt-6">
            <a
              href="mailto:ragheed@aqliya.com"
              className="text-xl font-semibold text-primary underline-offset-4 hover:underline"
            >
              ragheed@aqliya.com
            </a>
          </div>
        </div>
      </section>

      <section className="border-b py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-center">أنواع الطلب</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {requestTypes.map((item) => (
              <div
                key={item}
                className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-foreground"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-bold">أرسل طلبك الآن</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            يمكنك التواصل مباشرة عبر البريد الإلكتروني وسنرد عليك في أقرب وقت.
          </p>
          <div className="mt-8">
            <a
              href="mailto:ragheed@aqliya.com"
              className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              أرسل طلبك
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
