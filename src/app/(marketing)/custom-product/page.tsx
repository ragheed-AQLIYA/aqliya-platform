import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "صمّم منتجك الخاص | AQLIYA",
  description:
    "نساعدك على تحويل فكرتك أو احتياجك التشغيلي إلى نظام رقمي عملي، مصمم حول بياناتك وإجراءاتك ومستخدميك.",
}

const offerings = [
  "أنظمة تشغيل داخلية",
  "أنظمة إدارة ومراجعة",
  "أنظمة موافقات واعتماد",
  "أنظمة ذكاء وتحليل",
  "أنظمة محاكاة وسيناريوهات",
  "أنظمة مبيعات وتأهيل فرص",
  "أنظمة امتثال ومحتوى محلي",
  "بوابات عملاء وموردين",
  "منتجات SaaS مخصصة",
  "أنظمة تقارير ومؤشرات",
]

const methodology = [
  { step: "1", title: "جلسة فهم وتحليل" },
  { step: "2", title: "تحديد المشكلة والاحتياج" },
  { step: "3", title: "رسم سير العمل" },
  { step: "4", title: "تصميم تجربة النظام" },
  { step: "5", title: "تحديد الصلاحيات والمخرجات" },
  { step: "6", title: "بناء النظام" },
  { step: "7", title: "التجربة والتحسين" },
  { step: "8", title: "الإطلاق والتطوير المستمر" },
]

export default function CustomProductPage() {
  return (
    <>
      <section className="border-b py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-3xl font-black sm:text-4xl">صمّم نظامًا برمجيًا خاصًا بطبيعة عمل مؤسستك</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            نساعدك على تحويل فكرتك أو احتياجك التشغيلي إلى نظام رقمي عملي، مصمم حول بياناتك، إجراءاتك، مستخدميك، صلاحياتك، ومخرجاتك.
          </p>
          <p className="mt-4 text-base text-muted-foreground/80">
            سواء كنت تحتاج نظامًا داخليًا، منصة تشغيل، بوابة عملاء، نظام موافقات، منصة تحليل، أو منتج SaaS خاص، تبدأ عقلية من فهم الواقع التشغيلي ثم تبني النظام المناسب.
          </p>
          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              اطلب تصميم منتج خاص
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold">لمن هذه الخدمة؟</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "لديها إجراءات داخلية متكررة",
                "تعتمد على Excel وملفات متفرقة",
                "تحتاج تقارير وموافقات قابلة للتتبع",
                "تريد نظامًا خاصًا بدل شراء برنامج عام",
                "تريد تحويل فكرة منتج إلى نظام قابل للتشغيل",
                "تحتاج ربط البيانات بالمخرجات والقرارات",
                "تريد منتجًا داخليًا أو تجاريًا حسب نموذج عملها",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-lg border bg-background p-4">
                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span className="text-sm leading-6">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-2xl font-bold text-center">ماذا نبني؟</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {offerings.map((item) => (
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
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-center">منهجية العمل</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {methodology.map((item) => (
              <div key={item.step} className="rounded-xl border bg-background p-5">
                <span className="text-2xl font-black text-primary/30">{item.step}</span>
                <h3 className="mt-2 text-sm font-semibold">{item.title}</h3>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/contact"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              اطلب تصميم منتج خاص
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
