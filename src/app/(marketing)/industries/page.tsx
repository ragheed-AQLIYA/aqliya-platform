import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "القطاعات | AQLIYA",
  description:
    "مبنية لمكاتب المراجعة، الجهات الحكومية، المؤسسات الكبرى، وشركات الخدمات المهنية. كل قطاع له مسار مخصص على منصة تشغيل مؤسسية واحدة.",
};

const sectors = [
  {
    id: "audit-firms",
    title: "مكاتب المراجعة",
    challenge:
      "ارتباطات متزامنة، أدلة مبعثرة، ملاحظات عبر قنوات متعددة، ومعرفة تضيع بتغير الفريق.",
    platformValue:
      "مسار مراجعة موحد من قبول العميل إلى التقرير — كل رقم مربوط بمصدره وكل اعتماد موثق.",
    useCases: [
      "إدارة ارتباطات المراجعة",
      "ميزان المراجعة والقوائم المالية",
      "الأدلة وملاحظات المراجعة",
      "الجودة وإدارة الاستقلالية",
    ],
    proofHref: "/demo",
  },
  {
    id: "government",
    title: "الجهات الحكومية",
    challenge:
      "متطلبات مساءلة، سيادة بيانات، برامج محتوى محلي، ومراجعات تنظيمية تتطلب توثيقاً مستمراً.",
    platformValue:
      "قرار بشري موثق، أدلة قابلة للتدقيق، ونماذج نشر تناسب متطلبات القطاع الحكومي.",
    useCases: [
      "برامج المحتوى المحلي وسلاسل التوريد",
      "المراجعة الداخلية والامتثال",
      "توثيق قرارات المشتريات والترسية",
      "الجاهزية التنظيمية",
    ],
    proofHref: "/executive-brief",
  },
  {
    id: "enterprise",
    title: "الشركات الكبرى",
    challenge:
      "قرارات متعددة المستويات، فرق متفرقة، ومخرجات يصعب الدفاع عنها أمام الإدارة أو المراجع الخارجي.",
    platformValue:
      "حوكمة قرار موحدة، ذاكرة مؤسسية، ومسارات اعتماد واضحة عبر الإدارات.",
    useCases: [
      "توثيق القرارات المؤسسية",
      "المراجعة الداخلية",
      "حوكمة مالية واعتمادات",
      "ذاكرة مؤسسية ومعرفة تشغيلية",
    ],
    proofHref: "/buyers",
  },
  {
    id: "professional-services",
    title: "شركات الخدمات المهنية",
    challenge:
      "جودة المخرجات تعتمد على أفراد، المعرفة غير موثقة، وصعوبة إثبات المنهجية أمام العملاء.",
    platformValue:
      "منهجية مدمجة في سير العمل — ليست في رؤوس الأفراد. كل مخرج قابل للمراجعة والتسليم.",
    useCases: [
      "إدارة المشاريع والارتباطات",
      "توثيق التوصيات والاعتمادات",
      "تطوير الأعمال المؤسسي",
      "مسارات جودة ومراجعة داخلية",
    ],
    proofHref: "/case-studies",
  },
];

export default function IndustriesPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-22">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-black text-white sm:text-5xl">
              القطاعات التي نخدمها
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/60">
              منصة تشغيل واحدة — مسارات مختلفة حسب طبيعة عمل مؤسستك. لا حلول
              عامة، بل أنظمة تشغيل تُفعَّل فوق نفس بنية الحوكمة والأدلة.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="space-y-16">
          {sectors.map((sector) => (
            <article
              key={sector.id}
              id={sector.id}
              className="scroll-mt-24 rounded-2xl border border-border/60 bg-background p-6 sm:p-10"
            >
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">
                {sector.title}
              </h2>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-destructive/10 bg-destructive/[0.02] p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    التحدي
                  </p>
                  <p className="mt-2 text-sm leading-7 text-foreground">
                    {sector.challenge}
                  </p>
                </div>
                <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                    قيمة المنصة
                  </p>
                  <p className="mt-2 text-sm leading-7 text-foreground">
                    {sector.platformValue}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  مسارات تشغيلية نموذجية
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {sector.useCases.map((uc) => (
                    <li
                      key={uc}
                      className="rounded-lg border border-border/50 bg-muted/20 px-3 py-1.5 text-xs text-foreground"
                    >
                      {uc}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={sector.proofHref} className="btn-outline h-10 px-6 text-sm">
                  اطلع على الإثبات
                </Link>
                {sector.id === "audit-firms" && (
                  <Link
                    href="/print/industry-audit-firms"
                    target="_blank"
                    className="btn-outline h-10 px-6 text-sm"
                  >
                    ملخص القطاع (PDF)
                  </Link>
                )}
                <Link href="/contact" className="btn-primary h-10 px-6 text-sm">
                  احجز جلسة تشخيص
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <p className="text-sm text-white/55">
            كل قطاع يعمل فوق نفس المنصة —{" "}
            <Link href="/platform" className="text-aqliya-cyan underline underline-offset-4">
              اكتشف كيف تعمل عقلية
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
