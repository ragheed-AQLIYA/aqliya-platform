import Link from "next/link"
import type { Metadata } from "next"
import { SectionEyebrow, EnterpriseCTA, WorkflowChain } from "@/components/enterprise"

export const metadata: Metadata = {
  title: "كيف نعمل | AQLIYA",
  description: "عقلية لا تبدأ من الواجهة. تبدأ من فهم طريقة العمل.",
}

const phases = [
  { num: "01", title: "فهم العمل", desc: "نبدأ بفهم طبيعة عمل المؤسسة: العمليات، المستخدمين، الصلاحيات، البيانات، والمخرجات المطلوبة.", output: "ملخص فهم العمل", participants: "فريق العقلية + أصحاب العلاقة", next: "تحليل البيانات" },
  { num: "02", title: "تحليل البيانات", desc: "نحلل البيانات المتاحة، الهيكل التنظيمي، مسارات العمل الحالية، ونقاط الضعف والفرص.", output: "تقرير تحليل البيانات", participants: "فريق العقلية", next: "تصميم سير العمل" },
  { num: "03", title: "تصميم سير العمل", desc: "نصمم مسار العمل الجديد بطريقة واضحة: من الإدخال إلى المعالجة إلى المخرجات.", output: "خريطة سير العمل", participants: "فريق العقلية + أصحاب العلاقة", next: "تصميم المنتج" },
  { num: "04", title: "تصميم المنتج", desc: "نحوّل سير العمل إلى واجهات، صلاحيات، تقارير، ومسارات اعتماد.", output: "نموذج أولي", participants: "فريق العقلية", next: "بناء النظام" },
  { num: "05", title: "بناء النظام", desc: "نبني النظام باستخدام تقنيات حديثة، مع تركيز على قابلية التوسع والتعديل.", output: "نظام قابل للتشغيل", participants: "فريق العقلية", next: "اختبار المخرجات" },
  { num: "06", title: "اختبار المخرجات", desc: "نختبر النظام مع بيانات حقيقية ونتأكد من صحة المخرجات قبل التسليم.", output: "تقرير الاختبار", participants: "فريق العقلية + المستخدمين", next: "الإطلاق" },
  { num: "07", title: "الإطلاق", desc: "نطلق النظام مع فريق المؤسسة وندرب المستخدمين على التشغيل.", output: "نظام حي", participants: "فريق العقلية + فريق المؤسسة", next: "التحسين المستمر" },
  { num: "08", title: "التحسين المستمر", desc: "ندعم النظام ونطوره بناءً على استخدام المؤسسة واحتياجاتها المتغيرة.", output: "تحديثات دورية", participants: "فريق العقلية + فريق المؤسسة", next: "—" },
]

export default function HowWeWorkPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <SectionEyebrow
            label="منهجية العمل"
            title="كيف تبني عقلية الأنظمة؟"
            description="عقلية لا تبدأ من الواجهة. تبدأ من فهم طريقة العمل. نحلل البيانات، الإجراءات، المستخدمين، الصلاحيات، المخرجات، ثم نصمم النظام المناسب."
          />
        </div>
      </section>

      {/* Workflow Overview */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-t">
        <div className="rounded-xl border bg-muted/20 p-6 sm:p-8">
          <WorkflowChain
            steps={phases.map((p) => p.title)}
            className="justify-center"
          />
        </div>
      </section>

      {/* Detailed Phases — Wide Layout */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="space-y-4">
          {phases.map((phase) => (
            <div key={phase.num} className="group rounded-xl border bg-background p-6 shadow-sm transition-all hover:border-primary/20 hover:shadow-md">
              <div className="flex items-start gap-5">
                {/* Step Number */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-primary/15 to-primary/5 text-base font-black text-primary border border-primary/20">
                  {phase.num}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h2 className="text-lg font-bold">{phase.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{phase.desc}</p>

                  {/* Details Grid */}
                  <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
                    <div className="rounded-lg border bg-muted/20 px-4 py-2.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">المخرج</span>
                      <div className="mt-1 font-medium">{phase.output}</div>
                    </div>
                    <div className="rounded-lg border bg-muted/20 px-4 py-2.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">المشاركون</span>
                      <div className="mt-1 font-medium">{phase.participants}</div>
                    </div>
                    <div className="rounded-lg border bg-muted/20 px-4 py-2.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">القرار التالي</span>
                      <div className="mt-1 font-medium">{phase.next}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20 border-t pt-20">
        <EnterpriseCTA
          title="هل تحتاج نظامًا مصممًا لطبيعة عملك؟"
          primaryLabel="ابدأ مشروعك مع عقلية"
          primaryHref="/custom-product"
          secondaryLabel="تواصل معنا"
          secondaryHref="/contact"
        />
      </section>
    </div>
  )
}
