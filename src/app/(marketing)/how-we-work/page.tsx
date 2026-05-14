import Link from "next/link"
import type { Metadata } from "next"
import { WorkflowChain } from "@/components/enterprise"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "كيف نعمل | AQLIYA",
  description: "عقلية لا تبدأ من بناء واجهة أو أداة منفصلة، بل من تفعيل مسار مؤسسي محكوم يربط البيانات وسير العمل والأدلة والمراجعة والاعتماد.",
}

const phases = [
  { num: "01", title: "فهم الواقع التشغيلي", desc: "نبدأ من طريقة عمل المؤسسة كما هي: القرارات، الملفات، الأدوار، الصلاحيات، والاختناقات التي تمنع وضوح التشغيل.", output: "خريطة الواقع التشغيلي", participants: "فريق عقلية + أصحاب العلاقة", next: "هيكلة البيانات" },
  { num: "02", title: "هيكلة البيانات", desc: "نحدد البيانات الحرجة، مصادرها، علاقتها بالمخرجات، وما الذي يجب أن يبقى قابلًا للتتبع والمراجعة داخل النظام.", output: "نموذج البيانات التشغيلي", participants: "فريق عقلية", next: "تصميم سير العمل" },
  { num: "03", title: "تصميم سير العمل", desc: "نحوّل الإجراءات الحالية إلى مسار واضح يربط الإدخال، المعالجة، المراجعة، والاعتماد بدل الاعتماد على الذاكرة والتتبع اليدوي.", output: "خريطة سير العمل المحكوم", participants: "فريق عقلية + أصحاب العلاقة", next: "ربط الأدلة والصلاحيات" },
  { num: "04", title: "ربط الأدلة والصلاحيات", desc: "نعرّف من يراجع، من يعتمد، ما الأدلة المطلوبة، وكيف تُحكم الصلاحيات حتى لا تنفصل المخرجات عن المسؤولية المؤسسية.", output: "نموذج الحوكمة والأدلة", participants: "فريق عقلية", next: "إضافة طبقة الذكاء" },
  { num: "05", title: "إضافة طبقة الذكاء", desc: "نفعّل الذكاء الاصطناعي كمساعد داخل المسار، لا كصاحب قرار: اقتراحات، تصنيفات، تلخيصات، وتنبيهات تخضع للمراجعة البشرية.", output: "طبقة مساعدة محكومة", participants: "فريق عقلية", next: "المراجعة والاعتماد" },
  { num: "06", title: "المراجعة والاعتماد", desc: "نربط كل مخرج بالمراجعة البشرية والاعتماد الرسمي حتى تصبح القرارات والمخرجات قابلة للفحص قبل اعتمادها أو نشرها.", output: "بوابات مراجعة واعتماد", participants: "فريق عقلية + المستخدمون", next: "التفعيل التشغيلي" },
  { num: "07", title: "التفعيل التشغيلي", desc: "نفعّل خط النظام أو المسار المؤسسي داخل بيئة العمل الفعلية مع تدريب الفرق على التشغيل ضمن منطق حوكمة واضح.", output: "نظام مؤسسي مفعل", participants: "فريق عقلية + فريق المؤسسة", next: "التحسين المستمر" },
  { num: "08", title: "التحسين المستمر", desc: "نقيس ما تغير في التشغيل ونطوّر المسار بناءً على الاستخدام الحقيقي، والأثر، والملاحظات، ومتطلبات المراجعة المستمرة.", output: "تحسينات وتوسعات دورية", participants: "فريق عقلية + فريق المؤسسة", next: "—" },
]

export default function HowWeWorkPage() {
  return (
    <div className="flex flex-col">
      {/* Hero — Dark */}
      <section className="bg-[#0B1728] border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full border border-[#137dc5]/20 bg-[#137dc5]/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#137dc5]">
              Methodology
            </span>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
              كيف يتحول الواقع التشغيلي إلى مسار مؤسسي محكوم؟
            </h1>
            <p className="mt-4 text-base leading-7 text-white/50">
              عقلية لا تبدأ من بناء أداة أو واجهة. تبدأ من فهم الواقع التشغيلي، ثم تنظيم البيانات، وسير العمل، والأدلة، والصلاحيات، والمراجعة داخل منطق واحد مبني على AQLIYA Intelligence Core.
            </p>
          </div>
        </div>
      </section>

      {/* Process Map */}
      <section className="mx-auto max-w-7xl px-6 py-12 border-t">
        <div className="rounded-xl border bg-muted/20 p-5">
          <WorkflowChain
            steps={phases.map((p) => p.title)}
            className="justify-center"
          />
        </div>
      </section>

      {/* Process Steps — Alternating */}
      {phases.map((phase, i) => (
        <section key={phase.num} className={cn("border-t", i % 2 === 0 ? "bg-background" : "bg-[#0B1728] border-white/5")}>
          <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
            <div className="flex items-start gap-6">
              {/* Step Number */}
              <div className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-black",
                i % 2 === 0
                  ? "bg-primary/10 text-primary"
                  : "bg-[#137dc5]/20 text-[#137dc5]"
              )}>
                {phase.num}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h2 className={cn("text-xl font-black", i % 2 === 0 ? "text-foreground" : "text-white")}>
                  {phase.title}
                </h2>
                <p className={cn("mt-2 text-base leading-7", i % 2 === 0 ? "text-muted-foreground" : "text-white/50")}>
                  {phase.desc}
                </p>

                {/* Details Grid */}
                <div className={cn("mt-6 grid gap-4 sm:grid-cols-3 text-sm", i % 2 === 0 ? "" : "")}>
                  <div className={cn("rounded-lg border p-4", i % 2 === 0 ? "bg-muted/20 border-border" : "bg-white/[0.03] border-white/10")}>
                    <span className={cn("text-[10px] font-semibold uppercase tracking-wider", i % 2 === 0 ? "text-muted-foreground" : "text-white/40")}>المخرج</span>
                    <div className={cn("mt-1 font-medium", i % 2 === 0 ? "text-foreground" : "text-white/70")}>{phase.output}</div>
                  </div>
                  <div className={cn("rounded-lg border p-4", i % 2 === 0 ? "bg-muted/20 border-border" : "bg-white/[0.03] border-white/10")}>
                    <span className={cn("text-[10px] font-semibold uppercase tracking-wider", i % 2 === 0 ? "text-muted-foreground" : "text-white/40")}>المشاركون</span>
                    <div className={cn("mt-1 font-medium", i % 2 === 0 ? "text-foreground" : "text-white/70")}>{phase.participants}</div>
                  </div>
                  <div className={cn("rounded-lg border p-4", i % 2 === 0 ? "bg-muted/20 border-border" : "bg-white/[0.03] border-white/10")}>
                    <span className={cn("text-[10px] font-semibold uppercase tracking-wider", i % 2 === 0 ? "text-muted-foreground" : "text-white/40")}>القرار التالي</span>
                    <div className={cn("mt-1 font-medium", i % 2 === 0 ? "text-foreground" : "text-white/70")}>{phase.next}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA — Dark */}
      <section className="bg-[#0B1728] border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl rounded-xl border border-white/10 bg-white/[0.03] p-8 sm:p-12 text-center">
            <h2 className="text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
              هل تريد تفعيل خط نظام أو تصميم مسار مؤسسي محكوم؟
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/custom-product" className="inline-flex h-12 items-center justify-center rounded-md bg-[#137dc5] px-8 text-base font-medium text-white transition-colors hover:bg-[#137dc5]/90">
                صمّم نظامك المؤسسي
              </Link>
              <Link href="/contact" className="inline-flex h-12 items-center justify-center rounded-md border border-white/15 bg-white/5 px-8 text-base font-medium text-white/80 transition-colors hover:bg-white/10">
                ناقش تفعيل النظام
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
