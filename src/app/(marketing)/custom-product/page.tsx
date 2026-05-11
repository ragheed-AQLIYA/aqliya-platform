import type { Metadata } from "next"
import { CustomProductForm } from "@/components/forms/custom-product-form"
import { SectionEyebrow } from "@/components/enterprise"

export const metadata: Metadata = {
  title: "صمّم نظامك مع عقلية | AQLIYA",
  description: "صمّم نظامًا برمجيًا خاصًا بطبيعة عمل مؤسستك. املأ الطلب وسيتواصل معك فريق عقلية.",
}

export default function CustomProductPage() {
  return (
    <div className="flex flex-col gap-16 sm:gap-20">
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <SectionEyebrow
            label="طلب نظام مؤسسي"
            title="صمّم نظامك مع عقلية"
            description="هذه الصفحة مخصصة للمؤسسات التي تحتاج نظامًا مبنيًا حول طريقة عملها، وليس منتجًا جاهزًا فقط. املأ النموذج أدناه وسيتواصل معك فريق عقلية لمناقشة احتياجك التشغيلي وتصميم النظام المناسب."
          />
          {/* Progress Indicator */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">المؤسسة</span>
            <span>→</span>
            <span className="rounded-full bg-muted px-3 py-1">النظام</span>
            <span>→</span>
            <span className="rounded-full bg-muted px-3 py-1">التحديات</span>
            <span>→</span>
            <span className="rounded-full bg-muted px-3 py-1">البيئة</span>
            <span>→</span>
            <span className="rounded-full bg-muted px-3 py-1">المخرجات</span>
            <span>→</span>
            <span className="rounded-full bg-muted px-3 py-1">الهدف</span>
            <span>→</span>
            <span className="rounded-full bg-muted px-3 py-1">التواصل</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <CustomProductForm />
      </section>
    </div>
  )
}
