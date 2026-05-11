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
    <div className="flex flex-col gap-20 sm:gap-28">
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <SectionEyebrow
            label="منهجية العمل"
            title="كيف تبني عقلية الأنظمة؟"
            description="عقلية لا تبدأ من الواجهة. تبدأ من فهم طريقة العمل. نحلل البيانات، الإجراءات، المستخدمين، الصلاحيات، المخرجات، ثم نصمم النظام المناسب."
          />
        </div>
      </section>

      {/* Workflow Overview */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="rounded-xl border bg-muted/30 p-6">
          <WorkflowChain
            steps={phases.map((p) => p.title)}
            className="justify-center"
          />
        </div>
      </section>

      {/* Detailed Phases */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="space-y-6">
          {phases.map((phase) => (
            <div key={phase.num} className="rounded-xl border bg-background p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{phase.num}</span>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{phase.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{phase.desc}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
                    <div><span className="text-muted-foreground">المخرج:</span> <span className="font-medium">{phase.output}</span></div>
                    <div><span className="text-muted-foreground">المشاركون:</span> <span className="font-medium">{phase.participants}</span></div>
                    <div><span className="text-muted-foreground">القرار التالي:</span> <span className="font-medium">{phase.next}</span></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
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
