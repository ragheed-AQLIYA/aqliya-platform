import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "من نحن | AQLIYA",
  description: "عقلية شركة تقنية تبني وتخصص أنظمة برمجية وذكاء مؤسسي للمؤسسات.",
}

const principles = [
  "لا نبدأ من الأداة، بل من العمل.",
  "لا نبني مخرجات بلا تتبع.",
  "لا نستبدل الإنسان في القرار، بل ندعم قراره.",
  "لا نبيع قالبًا واحدًا لكل مؤسسة.",
  "نبني أنظمة قابلة للتطوير والتحسين.",
]

export default function AboutPage() {
  return (
    <>
      <section className="border-b py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-3xl font-black sm:text-4xl">من نحن</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            عقلية AQLIYA شركة تقنية تبني وتخصص أنظمة برمجية وذكاء مؤسسي للمؤسسات التي تحتاج إلى تشغيل أوضح، بيانات أكثر تنظيمًا، ومخرجات قابلة للتتبع والمراجعة.
          </p>
          <p className="mt-4 text-base text-muted-foreground/80">
            نؤمن أن كل مؤسسة لها طريقة عمل مختلفة. لذلك لا نفرض قالبًا واحدًا على الجميع. نبدأ من واقع المؤسسة، ثم نبني النظام الذي يناسبها.
          </p>
        </div>
      </section>

      <section className="border-b py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-center">فلسفتنا</h2>
          <div className="mt-8 grid gap-3">
            {principles.map((item) => (
              <div
                key={item}
                className="flex items-start gap-4 rounded-lg border bg-background p-5"
              >
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span className="text-base leading-7 text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-bold">هل تحتاج نظامًا مصممًا لطبيعة عملك؟</h2>
          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
