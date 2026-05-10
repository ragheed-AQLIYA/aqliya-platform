import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "كيف نعمل | AQLIYA",
  description: "عقلية لا تبدأ من الواجهة. تبدأ من فهم طريقة العمل.",
}

const phases = [
  { num: "01", title: "فهم العمل", desc: "نبدأ بفهم طبيعة عمل المؤسسة: العمليات، المستخدمين، الصلاحيات، البيانات، والمخرجات المطلوبة." },
  { num: "02", title: "تحليل البيانات", desc: "نحلل البيانات المتاحة، الهيكل التنظيمي، مسارات العمل الحالية، ونقاط الضعف والفرص." },
  { num: "03", title: "تصميم سير العمل", desc: "نصمم مسار العمل الجديد بطريقة واضحة: من الإدخال إلى المعالجة إلى المخرجات." },
  { num: "04", title: "تصميم المنتج", desc: "نحوّل سير العمل إلى واجهات، صلاحيات، تقارير، ومسارات اعتماد." },
  { num: "05", title: "بناء النظام", desc: "نبني النظام باستخدام تقنيات حديثة، مع تركيز على قابلية التوسع والتعديل." },
  { num: "06", title: "اختبار المخرجات", desc: "نختبر النظام مع بيانات حقيقية ونتأكد من صحة المخرجات قبل التسليم." },
  { num: "07", title: "الإطلاق", desc: "نطلق النظام مع فريق المؤسسة وندرب المستخدمين على التشغيل." },
  { num: "08", title: "التحسين المستمر", desc: "ندعم النظام ونطوره بناءً على استخدام المؤسسة واحتياجاتها المتغيرة." },
]

export default function HowWeWorkPage() {
  return (
    <>
      <section className="border-b py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-3xl font-black sm:text-4xl">كيف تبني عقلية الأنظمة؟</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            عقلية لا تبدأ من الواجهة. تبدأ من فهم طريقة العمل.
          </p>
          <p className="mt-4 text-base text-muted-foreground/80">
            نحلل البيانات، الإجراءات، المستخدمين، الصلاحيات، المخرجات، ثم نصمم النظام المناسب.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {phases.map((phase) => (
              <div key={phase.num} className="relative rounded-xl border bg-background p-6">
                <span className="text-3xl font-black text-primary/15">{phase.num}</span>
                <h2 className="mt-3 text-lg font-semibold">{phase.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{phase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-bold">هل تحتاج نظامًا مصممًا لطبيعة عملك؟</h2>
          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              ابدأ مشروعك مع عقلية
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
