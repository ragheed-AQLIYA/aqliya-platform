import Link from "next/link";
import type { Metadata } from "next";
import { BOOKING_EMAIL } from "@/lib/marketing/booking";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";

export const metadata: Metadata = {
  title: "كيف نعمل | AQLIYA",
  description:
    "منهجية عمل عقلية: من التشخيص إلى التشغيل المؤسسي الحوكمي. الذكاء يساعد — الإنسان يقرر — الدليل يحكم.",
};

const principles = [
  {
    title: "الذكاء يساعد — الإنسان يقرر",
    desc: "جميع مخرجات الذكاء الاصطناعي في عقلية هي مسودة قابلة للمراجعة والاعتماد. لا يوجد قرار نهائي يُتخذ آليًا دون تدخل بشري.",
    icon: "🤝",
  },
  {
    title: "الدليل يحكم",
    desc: "كل توصية أو تحليل يرتبط بمصدره: ملف، بيان، قاعدة تصنيف، أو مرجع معتمد. لا مخرجات بلا أدلة.",
    icon: "📋",
  },
  {
    title: "الحوكمة مضمنة — لا تُضاف لاحقًا",
    desc: "الصلاحيات، الموافقات، وسجل التدقيق ليست إضافات بل جزء من تصميم كل مسار تشغيلي.",
    icon: "🛡️",
  },
  {
    title: "المؤسسة هي نقطة البداية",
    desc: "نبدأ من واقع المؤسسة التشغيلي: الأدوار، الصلاحيات، سير العمل الحالي، والاختناقات. لا حلول افتراضية.",
    icon: "🏢",
  },
];

const workPhases = [
  {
    num: "١",
    title: "التشخيص",
    desc: "جلسة عمل منظمة نفهم فيها سياق المؤسسة وتحدياتها ونحدد مدى ملاءمة عقلية. لا عرض مبيعات — تشخيص فعلي.",
  },
  {
    num: "٢",
    title: "التقييم التشغيلي",
    desc: "تشغيل سير عمل كامل على بيانات فعلية في بيئة محكومة. نقيس القيمة بناءً على معايير متفق عليها مسبقًا.",
  },
  {
    num: "٣",
    title: "النشر التشغيلي",
    desc: "تفعيل المسار التشغيلي المتفق عليه مع ربط الأنظمة الداخلية وتهيئة الصلاحيات وسير العمل.",
  },
  {
    num: "٤",
    title: "التوسع المؤسسي",
    desc: "إضافة خطوط أنظمة جديدة، توسيع نطاق المستخدمين، وتمكين فرق العمل مع استمرار الحوكمة والتدقيق.",
  },
];

const productSystems = [
  { name: "AuditOS", desc: "نظام التدقيق والذكاء المالي" },
  { name: "DecisionOS", desc: "نظام حوكمة القرارات" },
  { name: "LocalContentOS", desc: "نظام المحتوى المحلي" },
  { name: "SalesOS", desc: "نظام الذاكرة التجارية" },
];

export default function HowWeWorkPage() {
  return (
    <main className="min-h-screen bg-background" dir="rtl">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b py-24">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">
            كيف نعمل
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            منهجية متكاملة لبناء وتشغيل أنظمة مؤسسية ذكية ومحكومة — من التشخيص إلى
            التشغيل المؤسسي الكامل
          </p>
        </div>
      </section>

      {/* Trust Principle Banner */}
      <section className="border-b py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-8 text-2xl font-bold">مبدأ الثقة</h2>
          <div className="rounded-xl bg-primary/5 p-8">
            <p className="text-xl font-semibold text-primary md:text-2xl">
              الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.
            </p>
            <p className="mt-4 text-muted-foreground">
              هذا المبدأ هو أساس كل ما نبنيه. أي مخرج من عقلية قابل للتتبع والمراجعة والاعتماد
              — وليس مجرد خرج ذكاء اصطناعي أسود الصندوق.
            </p>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="border-b py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-2xl font-bold">مبادئ العمل</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {principles.map((p) => (
              <div
                key={p.title}
                className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 text-3xl">{p.icon}</div>
                <h3 className="mb-2 text-lg font-semibold">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work Phases */}
      <section className="border-b py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-2xl font-bold">
            مراحل العمل
          </h2>
          <div className="grid gap-6 md:grid-cols-4">
            {workPhases.map((phase, i) => (
              <div key={phase.num} className="relative rounded-lg border p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  {phase.num}
                </div>
                <h3 className="mb-2 font-semibold">{phase.title}</h3>
                <p className="text-sm text-muted-foreground">{phase.desc}</p>
                {i < workPhases.length - 1 && (
                  <div
                    className="hidden h-0.5 w-full bg-primary/20 md:absolute md:-right-3 md:top-1/2 md:block"
                    style={{ width: "calc(100% + 1.5rem)" }}
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform vs Product */}
      <section className="border-b py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold">
            منصة — لا منتجًا واحدًا
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
            عقلية ليست تطبيقًا واحدًا. هي منصة تشغيل ذكاء مؤسسي تعمل فوقها أنظمة تشغيلية متخصصة
            لكل نطاق عمل.
          </p>
          <div className="grid gap-4 md:grid-cols-4">
            {productSystems.map((ps) => (
              <div
                key={ps.name}
                className="rounded-lg border bg-card p-4 text-center"
              >
                <div className="mb-1 font-semibold">{ps.name}</div>
                <div className="text-xs text-muted-foreground">{ps.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="border-b py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold">
            الذكاء الاصطناعي في عقلية
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="mb-1 font-semibold">مصدر مفتوح للتفسير</h3>
              <p className="text-sm text-muted-foreground">
                كل مخرج ذكاء اصطناعي في عقلية يُعرِض درجة الثقة والمصدر والمنطق
                — ليس مجرد إجابة سوداء الصندوق.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="mb-1 font-semibold">مراجعة بشرية إلزامية</h3>
              <p className="text-sm text-muted-foreground">
                لا يُنشر أي مخرج ذكاء اصطناعي بشكل نهائي دون مراجعة واعتماد من
                إنسان مسؤول. الذكاء يساعد فقط.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="mb-1 font-semibold">سجل تدقيقي لكل عملية</h3>
              <p className="text-sm text-muted-foreground">
                كل طلب ذكاء اصطناعي، كل مخرج، وكل مراجعة تُوثَّق في سجل التدقيق
                مع هوية الطالب والمراجع.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold">
            هل عقلية مناسبة لمؤسستك؟
          </h2>
          <p className="mb-8 text-muted-foreground">
            نحن لا نبيع بشكل مباشر دون فهم السياق. احجز جلسة تشخيص مجانية
            لنحدد معًا إذا كانت عقلية الخيار المناسب لك
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/contact"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              احجز جلسة تشخيص
            </Link>
            <Link
              href="/engagement-models"
              className="inline-flex h-11 items-center justify-center rounded-md border bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
            >
              اقرأ عن نماذج التعاون
            </Link>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            أو راسلنا على{" "}
            <a href={`mailto:${BOOKING_EMAIL}`} className="underline">
              {BOOKING_EMAIL}
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
