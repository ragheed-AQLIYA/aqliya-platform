import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "خطوط حلول عقلية | AQLIYA",
  description: "تطوّر عقلية خطوط حلول جاهزة يمكن تشغيلها أو تخصيصها حسب طبيعة عمل المؤسسة.",
}

const productLines = [
  {
    title: "اتخاذ القرار",
    desc: "أنظمة تساعد المؤسسات على تنظيم القرارات المعقدة من مرحلة تحديد المشكلة إلى مقارنة البدائل، تقييم المخاطر، توثيق المبررات، وإصدار توصية قابلة للمراجعة والاعتماد.",
    href: "/products/decision",
  },
  {
    title: "المحاكاة",
    desc: "أنظمة تساعد المؤسسات على اختبار السيناريوهات قبل التنفيذ، ومقارنة أثر الخيارات على النتائج، التكاليف، المخاطر، الإيرادات، أو مؤشرات الأداء.",
    href: "/products/simulation",
  },
  {
    title: "المبيعات",
    desc: "أنظمة تساعد فرق B2B على تنظيم المبيعات من تعريف العميل المثالي إلى تأهيل العملاء، ترتيب الأولويات، تنفيذ الحملات، المتابعة، وتحسين الأداء.",
    href: "/products/sales",
  },
  {
    title: "المراجعة والتدقيق",
    desc: "أنظمة تساعد مكاتب الأوديت والفرق المالية على تنظيم أعمال المراجعة، الأدلة، الملاحظات، المخرجات، ومسارات الاعتماد.",
    href: "/products/audit",
  },
  {
    title: "المحتوى المحلي",
    desc: "أنظمة تساعد المؤسسات على إدارة وتحليل بيانات الموردين، الإنفاق، الالتزام، ومؤشرات المحتوى المحلي بطريقة أوضح وقابلة للتتبع.",
    href: "/products/local-content",
  },
]

export default function ProductsPage() {
  return (
    <>
      <section className="border-b py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-3xl font-black sm:text-4xl">خطوط حلول عقلية</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            تطوّر عقلية خطوط حلول جاهزة يمكن تشغيلها أو تخصيصها حسب طبيعة عمل المؤسسة.
          </p>
          <p className="mt-4 text-base text-muted-foreground/80">
            هذه المنتجات ليست حدود عقلية، بل نماذج من قدرتها على بناء أنظمة متخصصة في مجالات تشغيلية عالية الأثر.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {productLines.map((product) => (
              <Link
                key={product.href}
                href={product.href}
                className="group rounded-xl border bg-background p-6 transition-colors hover:border-primary/30 hover:bg-primary/[0.02]"
              >
                <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                  {product.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {product.desc}
                </p>
                <span className="mt-4 inline-block text-sm font-medium text-primary">
                  اقرأ المزيد ←
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
