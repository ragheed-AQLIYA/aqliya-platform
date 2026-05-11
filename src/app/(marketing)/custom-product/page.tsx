import type { Metadata } from "next"
import { CustomProductForm } from "@/components/forms/custom-product-form"

export const metadata: Metadata = {
  title: "صمّم منتجك الخاص | AQLIYA",
  description: "صمّم نظامًا برمجيًا خاصًا بطبيعة عمل مؤسستك. املأ الطلب وسيتواصل معك فريق عقلية.",
}

export default function CustomProductPage() {
  return (
    <>
      <section className="border-b py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-3xl font-black sm:text-4xl">
            صمّم نظامًا برمجيًا خاصًا بطبيعة عمل مؤسستك
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            املأ النموذج أدناه وسيتواصل معك فريق عقلية لمناقشة احتياجك التشغيلي وتصميم النظام المناسب.
          </p>
        </div>
      </section>

      <section className="py-6">
        <CustomProductForm />
      </section>
    </>
  )
}
