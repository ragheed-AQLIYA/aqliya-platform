import Link from "next/link";
import type { Metadata } from "next";
import { WorkflowChain } from "@/components/enterprise";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "كيف نعمل | AQLIYA",
  description:
    "عقلية لا تبدأ من بناء واجهة أو أداة منفصلة، بل من تفعيل مسار مؤسسي محكوم يربط البيانات وسير العمل والأدلة والمراجعة والاعتماد.",
};

const phases = [
  {
    num: "01",
    title: "فهم الواقع التشغيلي",
    desc: "نبدأ من طريقة عمل المؤسسة كما هي: القرارات، الملفات، الأدوار، الصلاحيات، والاختناقات التي تمنع وضوح التشغيل.",
    output: "خريطة الواقع التشغيلي",
    participants: "فريق عقلية + أصحاب العلاقة",
    next: "هيكلة البيانات",
  },
  {
    num: "02",
    title: "هيكلة البيانات",
    desc: "نحدد البيانات الحرجة، مصادرها، علاقتها بالمخرجات، وما الذي يجب أن يبقى قابلًا للتتبع والمراجعة داخل النظام.",
    output: "نموذج البيانات التشغيلي",
    participants: "فريق عقلية",
    next: "تصميم سير العمل",
  },
  {
    num: "03",
    title: "تصميم سير العمل",
    desc: "نحوّل الإجراءات الحالية إلى مسار واضح يربط الإدخال، المعالجة، المراجعة، والاعتماد بدل الاعتماد على الذاكرة والتتبع اليدوي.",
    output: "خريطة سير العمل المحكوم",
    participants: "فريق عقلية + أصحاب العلاقة",
    next: "ربط الأدلة والصلاحيات",
  },
  {
    num: "04",
    title: "ربط الأدلة والصلاحيات",
    desc: "نعرّف من يراجع، من يعتمد، ما الأدلة المطلوبة، وكيف تُحكم الصلاحيات حتى لا تنفصل المخرجات عن المسؤولية المؤسسية.",
    output: "نموذج الحوكمة والأدلة",
    participants: "فريق عقلية",
    next: "إضافة طبقة الذكاء",
  },
  {
    num: "05",
    title: "إضافة طبقة الذكاء",
    desc: "نفعّل الذكاء الاصطناعي كمساعد داخل المسار، لا كصاحب قرار: اقتراحات، تصنيفات، تلخيصات، وتنبيهات تخضع للمراجعة البشرية.",
    output: "طبقة مساعدة محكومة",
    participants: "فريق عقلية",
    next: "المراجعة والاعتماد",
  },
  {
    num: "06",
    title: "المراجعة والاعتماد",
    desc: "نربط كل مخرج بالمراجعة البشرية والاعتماد الرسمي حتى تصبح القرارات والمخرجات قابلة للفحص قبل اعتمادها أو نشرها.",
    output: "بوابات مراجعة واعتماد",
    participants: "فريق عقلية + المستخدمون",
    next: "التفعيل التشغيلي",
  },
  {
    num: "07",
    title: "التفعيل التشغيلي",
    desc: "نفعّل خط النظام أو المسار المؤسسي داخل بيئة العمل الفعلية مع تدريب الفرق على التشغيل ضمن منطق حوكمة واضح.",
    output: "نظام مؤسسي مفعل",
    participants: "فريق عقلية + فريق المؤسسة",
    next: "التحسين المستمر",
  },
  {
    num: "08",
    title: "التحسين المستمر",
    desc: "نقيس ما تغير في التشغيل ونطوّر المسار بناءً على الاستخدام الحقيقي، والأثر، والملاحظات، ومتطلبات المراجعة المستمرة.",
    output: "تحسينات وتوسعات دورية",
    participants: "فريق عقلية + فريق المؤسسة",
    next: "—",
  },
];

export default function HowWeWorkPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="relative mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              منهجية العمل
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              كيف يتحول الواقع التشغيلي إلى نظام محكوم يمكن تشغيله والثقة به؟
            </h1>
            <p className="mt-5 text-base leading-8 text-white/62 sm:text-lg">
              عقلية لا تبدأ من واجهة ولا من نموذج ذكاء منفصل. تبدأ من فهم الواقع
              التشغيلي، ثم تعيد بناءه كمسار مؤسسي واضح: بيانات، صلاحيات، أدلة،
              مراجعة، واعتماد داخل منطق واحد مبني على AQLIYA Intelligence Core.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 border-t">
        <div className="rounded-[24px] border border-border/70 bg-gradient-to-br from-background to-muted/30 p-5 shadow-sm">
          <WorkflowChain
            steps={phases.map((p) => p.title)}
            className="justify-center"
          />
        </div>
      </section>

      {phases.map((phase, i) => (
        <section
          key={phase.num}
          className={cn(
            "border-t",
            i % 2 === 0
              ? "bg-background"
              : "section-gradient-dark border-white/5",
          )}
        >
          <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
            <div className="flex items-start gap-6">
              <div
                className={cn(
                  "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-lg font-black shadow-sm",
                  i % 2 === 0
                    ? "bg-primary/10 text-primary"
                    : "bg-aqliya-cyan/20 text-aqliya-cyan",
                )}
              >
                {phase.num}
              </div>

              <div className="flex-1">
                <h2
                  className={cn(
                    "text-2xl font-black",
                    i % 2 === 0 ? "text-foreground" : "text-white",
                  )}
                >
                  {phase.title}
                </h2>
                <p
                  className={cn(
                    "mt-3 text-base leading-8",
                    i % 2 === 0 ? "text-muted-foreground" : "text-white/58",
                  )}
                >
                  {phase.desc}
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3 text-sm">
                  <div
                    className={cn(
                      "rounded-2xl border p-4",
                      i % 2 === 0
                        ? "bg-muted/20 border-border"
                        : "bg-white/[0.03] border-white/10",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-[0.18em]",
                        i % 2 === 0 ? "text-muted-foreground" : "text-white/40",
                      )}
                    >
                      المخرج
                    </span>
                    <div
                      className={cn(
                        "mt-1 font-medium",
                        i % 2 === 0 ? "text-foreground" : "text-white/70",
                      )}
                    >
                      {phase.output}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl border p-4",
                      i % 2 === 0
                        ? "bg-muted/20 border-border"
                        : "bg-white/[0.03] border-white/10",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-[0.18em]",
                        i % 2 === 0 ? "text-muted-foreground" : "text-white/40",
                      )}
                    >
                      المشاركون
                    </span>
                    <div
                      className={cn(
                        "mt-1 font-medium",
                        i % 2 === 0 ? "text-foreground" : "text-white/70",
                      )}
                    >
                      {phase.participants}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl border p-4",
                      i % 2 === 0
                        ? "bg-muted/20 border-border"
                        : "bg-white/[0.03] border-white/10",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-[0.18em]",
                        i % 2 === 0 ? "text-muted-foreground" : "text-white/40",
                      )}
                    >
                      الخطوة التالية
                    </span>
                    <div
                      className={cn(
                        "mt-1 font-medium",
                        i % 2 === 0 ? "text-foreground" : "text-white/70",
                      )}
                    >
                      {phase.next}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-8 text-center backdrop-blur-xl sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              من الواقع إلى النظام
            </p>
            <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
              إذا كان لديك واقع تشغيلي معقد، يمكن تحويله إلى مسار محكوم قابل
              للتفعيل
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/58">
              نبدأ من الواقع كما هو، ثم نحوله إلى بنية تشغيلية واضحة يمكن
              توسيعها وربطها بالذكاء والمراجعة والاعتماد.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/custom-product"
                className="btn-primary h-12 px-8 text-base"
              >
                صمّم نظامك المؤسسي
              </Link>
              <Link
                href="/contact"
                className="btn-secondary h-12 px-8 text-base"
              >
                ناقش تفعيل النظام
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
