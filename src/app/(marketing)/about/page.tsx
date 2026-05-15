import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "من نحن | AQLIYA",
  description:
    "عقلية منصة ذكاء مؤسسي خاص ومحكوم تبني خطوط أنظمة مؤسسية فوق AQLIYA Intelligence Core، بحيث تبقى البيانات والمخرجات والمراجعات تحت حوكمة المؤسسة.",
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

const systemLines = [
  "AuditOS — نظام التدقيق والذكاء المالي",
  "LocalContentOS — نظام المحتوى المحلي",
  "DecisionOS — نظام حوكمة القرارات",
  "SalesOS — نظام الذاكرة التجارية والمبيعات",
  "SimulationOS — نظام محاكاة السيناريوهات",
  "Custom Systems — أنظمة مؤسسية مخصصة",
];

const whatAqliyaIsNot = [
  "منصة متكاملة، لا منتج واحد — تشغّل خطوط أنظمة متعددة فوق نواة حوكمة واحدة",
  "خاصة ومحكومة — تعمل على بيانات المؤسسة، داخل بيئتها، وتحت حوكمتها",
  "الإنسان هو صاحب القرار النهائي — الذكاء يساعد، لا يقرر",
  "قابلة للتتبع والمراجعة — كل خطوة تُوثَّق وتُربط بالأدلة والصلاحيات",
  "جاهزة للتوسع — تُفعّل حسب نطاق المؤسسة، من خط نظام إلى مسار مؤسسي كامل",
  "Cloud + Private استراتيجيًا — قدرات On-Prem وAir-Gapped وLocal AI تُعرض كمسارات مستقبلية، ولا تُقدَّم كمنتجات إنتاجية منفذة إلا بعد اكتمالها واعتمادها",
];

const operatingBeliefs = [
  "لا نبدأ من الشاشة، بل من واقع المؤسسة: من يقرر، من يراجع، وما الذي يجب أن يبقى قابلًا للتفسير.",
  "لا نبيع ذكاءً معزولًا عن المسؤولية. كل مخرج في عقلية يجب أن يجد طريقه إلى المراجعة والاعتماد.",
  "لا نبني لكل نطاق نظامًا منفصلًا تمامًا؛ نبني قدرة تشغيلية يمكن تكرارها فوق نواة واحدة.",
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
              Operating Beliefs
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

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-t">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-black text-foreground">
            خطوط الأنظمة ليست أقسامًا تسويقية، بل مجالات تشغيل فعلية
          </h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            كل خط نظام تحت عقلية يعالج نمطًا مؤسسيًا متكررًا: تدقيق، محتوى محلي،
            قرار، مبيعات، محاكاة، أو مسار خاص. الفكرة ليست تنويع المنتجات، بل
            توحيد طريقة بناء الأنظمة المؤسسية المحكومة.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {systemLines.map((item) => (
              <div key={item} className="glass-card-light p-5">
                <p className="text-sm font-bold text-foreground">{item}</p>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">
                  خط متخصص ضمن عقلية، قابل للتفعيل حسب نطاق المؤسسة، ويرتبط بسير
                  العمل، والأدلة، والمراجعة، والاعتماد.
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

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-t">
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
            <Link href="/products" className="btn-primary h-12 px-8 text-base">
              استكشف خطوط عقلية
            </Link>
            <Link
              href="/custom-product"
              className="btn-outline h-12 px-8 text-base"
            >
              صمّم نظامك المؤسسي
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
