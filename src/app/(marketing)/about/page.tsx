import Link from "next/link";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { BOOKING_EMAIL } from "@/lib/marketing/booking";
import { WorkflowChain } from "@/components/enterprise";

export const metadata: Metadata = {
  title: "عن عقلية | AQLIYA",
  description:
    "وُجدت عقلية لأن المؤسسة تحتاج ذكاءً يمكن الوثوق به ومساءلته — لا فقط ذكاءً أسرع. منصة تشغيل مؤسسية للقرارات والعمليات والأدلة.",
};

const whyAqliyaExists = [
  "المشكلة ليست نقص أدوات الذكاء الاصطناعي فقط، بل مخرجات بلا أدلة ومسارات بلا محاسبة.",
  "المؤسسات تحتاج ذكاءً يعمل داخل الحوكمة، لا خارجها.",
  "الخطر الحقيقي ليس بطء الأتمتة، بل قرارات لا يمكن تتبعها أو مراجعتها أو تفسيرها بعد صدورها.",
];

const coreItems = [
  "تنسيق الذكاء",
  "الحوكمة",
  "سير العمل",
  "ربط الأدلة",
  "الصلاحيات",
  "سجل التدقيق",
  "التقارير",
];

const activeSystems = [
  { name: "AuditOS", desc: "نظام التدقيق والذكاء المالي — جاهز للبايلوت" },
  { name: "DecisionOS", desc: "نظام حوكمة القرارات — نشط" },
  { name: "LocalContentOS", desc: "نظام المحتوى المحلي — بايلوت منسّق (12 مسار)" },
];

const strategicSystems = [
  { name: "SalesOS", desc: "نظام الذاكرة التجارية — قيد التطوير" },
  { name: "SimulationOS", desc: "نظام محاكاة السيناريوهات — قيد التخطيط" },
  { name: "Custom Systems", desc: "أنظمة مؤسسية مخصصة — يُفعّل حسب نطاق المؤسسة" },
];

const whatAqliyaIsNot = [
  "منصة متكاملة، لا منتج واحد — تشغّل خطوط أنظمة متعددة فوق نواة حوكمة واحدة",
  "خاصة ومحكومة — تعمل على بيانات المؤسسة، داخل بيئتها، وتحت حوكمتها",
  "الإنسان هو صاحب القرار النهائي — الذكاء يساعد، لا يقرر",
  "قابلة للتتبع والمراجعة — كل خطوة تُوثَّق وتُربط بالأدلة والصلاحيات",
  "جاهزة للتوسع — تُفعّل حسب نطاق المؤسسة، من خط نظام إلى مسار مؤسسي كامل",
  "Cloud + Private استراتيجيًا — قدرات On-Prem وAir-Gapped وLocal AI تُعرض كمسارات قيد التخطيط الاستراتيجي، ولا تُقدَّم كمنتجات إنتاجية منفذة إلا بعد اكتمالها واعتمادها",
];

const operatingBeliefs = [
  "لا نبدأ من الشاشة، بل من واقع المؤسسة: من يقرر، من يراجع، وما الذي يجب أن يبقى قابلًا للتفسير.",
  "لا نبيع ذكاءً معزولًا عن المسؤولية. كل مخرج في عقلية يجب أن يجد طريقه إلى المراجعة والاعتماد.",
  "لا نبني لكل نطاق نظامًا منفصلًا تمامًا؛ نبني قدرة تشغيلية يمكن تكرارها فوق نواة واحدة.",
];

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

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="relative mx-auto max-w-5xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              About AQLIYA
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              عقلية وُجدت لأن المؤسسة لا تحتاج ذكاءً أسرع فقط، بل ذكاءً يمكن
              الوثوق به
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
              وُجدت عقلية لأن المؤسسات لا تحتاج ذكاءً أسرع فقط.
            </p>
            <p className="mx-auto max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
              تحتاج ذكاءً يمكن مساءلته.
            </p>
            <p className="mx-auto max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
              القرار المؤسسي لا يكفي أن يكون صحيحًا.
            </p>
            <p className="mx-auto max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
              يجب أن يكون مفهومًا، موثقًا، وقابلًا للمراجعة.
            </p>
            <p className="mx-auto max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
              بدأ التصور من سؤال بسيط وصعب في الوقت نفسه: كيف تستفيد المؤسسة من
              الذكاء الاصطناعي من دون أن تفقد القدرة على المراجعة، والتفسير،
              وربط القرار بمساره الكامل؟ من هنا جاءت عقلية كمنصة لا تبني مخرجات
              فقط، بل تبني طريقة مؤسسية لإنتاجها.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-black text-foreground">
            لماذا وُجدت عقلية؟
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            لأن أغلب مبادرات الذكاء داخل المؤسسات تبدأ من أداة، بينما المشكلة
            الحقيقية تبدأ من التشغيل. إذا لم تكن البيانات واضحة، والصلاحيات
            معروفة، والأدلة مربوطة بالمخرج، فإن أي ذكاء سريع سيتحول إلى عبء جديد
            بدل أن يكون قيمة جديدة.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {whyAqliyaExists.map((item) => (
              <div key={item} className="glass-card-light p-5">
                <p className="text-sm leading-7 text-foreground">{item}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-base leading-8 text-muted-foreground">
            لذلك تأتي عقلية كطبقة تشغيل مؤسسي: تربط الذكاء بالبيانات، وسير
            العمل، والأدلة، والمراجعة البشرية، حتى لا يصبح السؤال بعد صدور
            المخرج: من قال هذا؟ بل: ما الذي أوصلنا إليه، ومن اعتمده، وعلى أي
            أساس؟
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              مبادئ التشغيل
            </p>
            <h2 className="mt-4 text-3xl font-black text-foreground">
              كيف تفكر عقلية قبل أن تبني أي نظام؟
            </h2>
          </div>
          <div className="space-y-4">
            {operatingBeliefs.map((item, index) => (
              <div
                key={item}
                className="rounded-2xl border border-border/70 bg-gradient-to-br from-background to-muted/30 p-6 shadow-sm"
              >
                <div className="text-sm font-black text-primary">
                  0{index + 1}
                </div>
                <p className="mt-2 text-base leading-8 text-foreground">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-black text-white">
              ماذا تعني AQLIYA Intelligence Core فعليًا؟
            </h2>
            <p className="mt-4 text-base leading-8 text-white/58">
              تعني أن المؤسسة لا تبدأ من الصفر كلما أرادت تفعيل نطاق جديد. هناك
              نواة موحدة تجمع تنسيق الذكاء، والحوكمة، وسير العمل، وربط الأدلة،
              والصلاحيات، وسجل التدقيق، والتقارير في بنية واحدة قابلة لإعادة
              الاستخدام.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {coreItems.map((item) => (
              <div key={item} className="glass-card p-5 text-center">
                <p className="text-sm font-bold text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-black text-foreground">
            خطوط الأنظمة ليست أقسامًا تسويقية، بل مجالات تشغيل فعلية
          </h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            كل خط نظام تحت عقلية يعالج نمطًا مؤسسيًا متكررًا: تدقيق، محتوى محلي،
            قرار، مبيعات، محاكاة، أو مسار خاص. الفكرة ليست تنويع المنتجات، بل
            توحيد طريقة بناء الأنظمة المؤسسية المحكومة.
          </p>
          <div className="mt-8 space-y-6">
            <div>
              <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                أنظمة نشطة
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {activeSystems.map((item) => (
                  <div key={item.name} className="glass-card-light rounded-2xl p-5">
                    <p className="text-sm font-black text-foreground">{item.name}</p>
                    <p className="mt-1.5 text-xs leading-6 text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                خطوط استراتيجية
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {strategicSystems.map((item) => (
                  <div key={item.name} className="rounded-2xl border border-border/40 bg-muted/10 p-5">
                    <p className="text-sm font-black text-foreground/60">{item.name}</p>
                    <p className="mt-1.5 text-xs leading-6 text-muted-foreground/60">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-black text-white">
              ما الذي يجعل عقلية مختلفة؟
            </h2>
            <p className="mt-4 text-base leading-8 text-white/58">
              الفارق ليس في استخدام الذكاء الاصطناعي بحد ذاته، بل في طريقة
              إدخاله داخل المؤسسة: كمساعد محكوم، لا كجهة تقرر بدل الإنسان أو
              تتجاوز مسار الحوكمة.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
            {whatAqliyaIsNot.map((item) => (
              <div key={item} className="glass-card flex items-start gap-3 p-5">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-aqliya-cyan/70" />
                <p className="text-sm leading-7 text-white/75">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              منهجية العمل
            </p>
            <h2 className="mt-4 text-3xl font-black text-white">
              كيف يتحول الواقع التشغيلي إلى نظام محكوم؟
            </h2>
            <p className="mt-4 text-base leading-8 text-white/58">
              عقلية لا تبدأ من واجهة. تبدأ من فهم الواقع التشغيلي، ثم تعيد
              بناءه كمسار مؤسسي واضح داخل منطق واحد مبني على AQLIYA
              Intelligence Core.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-5xl">
            <div className="mb-10 rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <WorkflowChain
                steps={phases.map((p) => p.title)}
                className="justify-center"
              />
            </div>

            <div className="space-y-4">
              {phases.map((phase, i) => (
                <div
                  key={phase.num}
                  className={cn(
                    "flex items-start gap-5 rounded-2xl border p-6",
                    i % 2 === 0
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-aqliya-cyan/10 bg-aqliya-cyan/[0.02]",
                  )}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-aqliya-cyan/20 text-lg font-black text-aqliya-cyan shadow-sm">
                    {phase.num}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-white">
                      {phase.title}
                    </h3>
                    <p className="mt-1 text-sm leading-7 text-white/58">
                      {phase.desc}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40">
                      <span>المخرج: {phase.output}</span>
                      <span>المشاركون: {phase.participants}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* § — الفريق */}
      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            الفريق
          </p>
          <h2 className="mt-4 text-3xl font-black text-foreground">
            الأشخاص وراء عقلية
          </h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            عقلية لا تُبنى بكود فقط — تُبنى بأشخاص يؤمنون أن القرار المؤسسي
            يستحق أن يُوثَّق ويُحفَظ.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/20 p-6 transition-all hover:border-primary/25">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-black text-primary">
              ر
            </div>
            <h3 className="mt-4 text-base font-black text-foreground">
              رغيد الحكيم
            </h3>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Ragheed Al-Hakeem
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              المؤسس — يعمل على بناء عقلية كمنصة تشغيل مؤسسية تجمع الذكاء
              والحوكمة والأدلة في مسار واحد.
            </p>
            <a
              href={`mailto:${BOOKING_EMAIL}`}
              className="mt-3 inline-block text-xs font-medium text-primary underline"
            >
              {BOOKING_EMAIL}
            </a>
          </div>

          <div className="group rounded-2xl border border-dashed border-border/40 bg-muted/10 p-6 transition-all hover:border-border/60">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-lg font-black text-muted-foreground/50">
              +
            </div>
            <h3 className="mt-4 text-base font-black text-muted-foreground/60">
              انضم إلى الفريق
            </h3>
            <p className="mt-1 text-xs text-muted-foreground/50">
              عقلية تبحث عن شركاء مؤسسين في التقنية والحوكمة وتطوير الأعمال.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-border/70 bg-gradient-to-br from-muted/40 via-background to-primary/[0.03] p-8 text-center shadow-sm sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
            One Core. Multiple Systems.
          </p>
          <h2 className="mt-4 text-3xl font-black text-foreground">
            ابدأ من نطاق مؤسستك، لا من أداة عشوائية
          </h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            إذا كانت لديك مشكلة تشغيلية تحتاج وضوحًا، وتتبعًا، ومراجعة، فابدأ من
            خط النظام المناسب أو من جلسة تصميم نظام مؤسسي محكوم فوق عقلية.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn-primary h-12 px-8 text-base">
              طلب جلسة تنفيذية
            </Link>
            <Link href="/platform#capabilities" className="btn-outline h-12 px-8 text-base">
              أنظمة التشغيل
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
