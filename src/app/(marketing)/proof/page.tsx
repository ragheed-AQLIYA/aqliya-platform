import Link from "next/link";
import type { Metadata } from "next";
import { buyerJourneys } from "@/lib/marketing/buyer-journeys";

export const metadata: Metadata = {
  title: "الإثبات | AQLIYA",
  description:
    "ديمو تفاعلي، إطار تقييم تشغيلي، مكتبة مخرجات، وملخص أمن — كل ما تحتاجه لتقييم عقلية قبل أي قرار.",
};

const proofSections = [
  {
    id: "demo",
    title: "الديمو التفاعلي",
    subtitle: "شاهد — لا تقرأ فقط",
    body: "رحلة تشغيلية كاملة على بيانات تجريبية. ١٠–١٣ دقيقة، بدون تسجيل، كل خطوة قابلة للتحقق.",
    href: "/demo",
    cta: "ابدأ الديمو",
    secondaryHref: "/auditos",
    secondaryCta: "مسار AuditOS المباشر",
  },
  {
    id: "executive-brief",
    title: "الملخص التنفيذي",
    subtitle: "٥ دقائق للقيادة",
    body: "ما هي عقلية، لماذا تهم مؤسستك، وكيف نثبت القيمة قبل أي التزام واسع.",
    href: "/executive-brief",
    cta: "اقرأ الملخص",
  },
  {
    id: "pilot-framework",
    title: "إطار التقييم التشغيلي",
    subtitle: "كيف نثبت القيمة",
    body: "ستة أبعاد تقييم، معايير قرار بالأدلة، وأمثلة أدلة تُلتقط أثناء التجربة — قبل أي التزام.",
    href: "/pilot-proof",
    cta: "إطار التقييم التشغيلي",
  },
  {
    id: "evidence-library",
    title: "مكتبة الأدلة",
    subtitle: "مخرجات قابلة للمراجعة",
    body: "نماذج ميزان مراجعة، قوائم مالية، سجل تدقيق، وحزم إغلاق — على بيانات تجريبية موثقة.",
    href: "/proof-library",
    cta: "مكتبة الإثبات",
  },
  {
    id: "pilot-outcomes",
    title: "نتائج التقييم التشغيلي",
    subtitle: "مقاييس موثقة — عند الاكتمال",
    body: "لا أرقام وهمية. مراجع مؤسسية تُنشر عند اكتمال تقييمات تشغيلية مع قرار بالأدلة.",
    href: "/pilot-outcomes",
    cta: "نتائج التقييم",
  },
  {
    id: "procurement-pack",
    title: "حزمة المشتريات",
    subtitle: "PDF + وثائق التقييم",
    body: "ملخص تنفيذي، ملخص أمن، إطار تقييم تشغيلي، ونماذج تعاون — لفريق المشتريات.",
    href: "/procurement-pack",
    cta: "حزمة التقييم",
  },
  {
    id: "security",
    title: "ملخص الأمن",
    subtitle: "شفافية للمسؤول التقني",
    body: "الصلاحيات، العزل بين المستأجرين، ملكية البيانات، نماذج النشر، وحدود الذكاء الاصطناعي.",
    href: "/security",
    cta: "الأمن المؤسسي",
    secondaryHref: "/deployment",
    secondaryCta: "بيئات النشر",
  },
];

const supportingResources = [
  { label: "حزمة المشتريات (PDF)", href: "/procurement-pack" },
  { label: "دراسات الحالة (سيناريوهات تجريبية)", href: "/case-studies" },
  { label: "دليل المشتري حسب الدور", href: "/buyers" },
  { label: "نماذج التعاون", href: "/engagement-models" },
  { label: "بنية الحوكمة", href: "/governance" },
];

export default function ProofCenterPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-22">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              Proof Center
            </span>
            <h1 className="mt-5 text-4xl font-black text-white sm:text-5xl">
              مركز الإثبات
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/60">
              لا نطلب منك الإيمان بالكلام. كل ما تحتاجه لتقييم عقلية — ديمو،
              وثائق، معايير تقييم تشغيلي، وأمن — في مكان واحد.
            </p>
            <p className="mt-3 text-sm text-white/40">
              جميع الأمثلة على بيانات تجريبية. لا بيانات عملاء حقيقيين.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/start" className="btn-primary h-11 px-6">
                من أين تبدأ؟
              </Link>
              <Link href="/demo" className="btn-outline border-white/15 text-white/70 h-11 px-6">
                ابدأ الديمو
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/10 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-lg font-black text-foreground">
              اختر مسارك حسب الدور
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              كل دور له ترتيب محتوى مقترح — قبل جلسة التشخيص.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {buyerJourneys.map((j) => (
              <Link
                key={j.id}
                href={`/start#${j.id}`}
                className="rounded-full border border-border/60 bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:text-primary"
              >
                {j.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="space-y-6">
          {proofSections.map((section) => (
            <article
              key={section.id}
              id={section.id}
              className="rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/15 p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                    {section.subtitle}
                  </p>
                  <h2 className="mt-2 text-xl font-black text-foreground sm:text-2xl">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {section.body}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <Link href={section.href} className="btn-primary h-10 px-6 text-sm">
                    {section.cta}
                  </Link>
                  {section.secondaryHref && (
                    <Link
                      href={section.secondaryHref}
                      className="btn-outline h-10 px-6 text-sm text-center"
                    >
                      {section.secondaryCta}
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-gradient-light border-t">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-16">
          <h2 className="text-center text-lg font-black text-foreground">
            موارد داعمة
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {supportingResources.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="rounded-full border border-border/60 bg-background px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              >
                {r.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-black text-white">
              جاهز للخطوة التالية؟
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/55">
              بعد مراجعة الإثبات، احجز جلسة تشخيص مجانية — نحدد معاً إذا كانت
              عقلية مناسبة لسياقك وما المسار التشغيلي الأنسب.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="btn-primary h-11 px-8">
                احجز جلسة تشخيص
              </Link>
              <Link href="/platform" className="btn-secondary h-11 px-8">
                المنصة
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
