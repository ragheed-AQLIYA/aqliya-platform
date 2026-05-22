import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "حالات الاستخدام | AQLIYA",
  description:
    "سبع فئات حالات استخدام مؤسسية لمنصة عقلية — التدقيق والامتثال، حوكمة القرارات، المحتوى المحلي، ذاكرة المؤسسة، مراقبة العقود، الجاهزية التنظيمية، وذكاء المشتريات.",
};

const useCases = [
  {
    id: "audit-compliance",
    category: "AuditOS",
    categoryColor: "text-emerald-400",
    categoryBorder: "border-emerald-500/20",
    categoryBg: "bg-emerald-500/5",
    title: "التدقيق الداخلي والامتثال",
    icon: "◈",
    problem:
      "فرق التدقيق تقضي 60–70% من وقتها في جمع المعلومات يدوياً من وثائق مبعثرة عبر أنظمة متعددة — بدلاً من التحليل الفعلي.",
    traditionalState:
      "مراجع يقرأ مئات الصفحات يدوياً، يُعلّم عليها، يُنشئ ملخصات في Excel، ثم يعيد الكرة في الدورة التالية.",
    aqliyaApproach:
      "AuditOS يعالج مئات الوثائق المالية والتشغيلية، يُنشئ خريطة مخاطر مرتبطة بأدلة محددة، ويُنبّه المراجع على الانحرافات — مع سجل تدقيق كامل لكل نتيجة.",
    outcome:
      "تخفيض دورة جمع البيانات من أسابيع إلى ساعات، مع الحفاظ على المراجع الإنسانية كصاحب القرار النهائي.",
    systemLink: "/products/audit",
    systemLabel: "استكشف AuditOS",
  },
  {
    id: "decision-governance",
    category: "DecisionOS",
    categoryColor: "text-violet-400",
    categoryBorder: "border-violet-500/20",
    categoryBg: "bg-violet-500/5",
    title: "حوكمة القرارات المؤسسية",
    icon: "◉",
    problem:
      "القرارات المهمة تُتخذ في اجتماعات دون توثيق سياقها — من وافق، ما كان البديل، لماذا اختير هذا المسار. بعد ستة أشهر لا أحد يتذكر.",
    traditionalState:
      "دقائق اجتماع عامة، قرارات موزعة في رسائل بريد إلكتروني، ولا إمكانية لمراجعة منطق القرار عند الحاجة.",
    aqliyaApproach:
      "DecisionOS يُنشئ سجل قرارات منظم: السياق، الخيارات المدروسة، الأدلة الداعمة، المعتمدون، والنتائج — مع بحث وربط لاحق بين القرارات ذات الصلة.",
    outcome:
      "مؤسسة قادرة على تقديم تبرير موثق لأي قرار أمام مجلس الإدارة أو جهة التنظيم — بنقرات لا بساعات بحث.",
    systemLink: "/products/decision",
    systemLabel: "استكشف DecisionOS",
  },
  {
    id: "local-content",
    category: "LocalContentOS",
    categoryColor: "text-sky-400",
    categoryBorder: "border-sky-500/20",
    categoryBg: "bg-sky-500/5",
    title: "إدارة المحتوى المحلي والامتثال التنظيمي",
    icon: "◎",
    problem:
      "متطلبات المحتوى المحلي في العقود الحكومية والقطاعات المنظَّمة تتطلب رصداً مستمراً، تقارير دورية، وتوثيقاً يصعب الحفاظ عليه يدوياً مع توسع المشاريع.",
    traditionalState:
      "جداول Excel معقدة، بيانات سعودة مبعثرة، تقارير يدوية تُعدّ قبيل المواعيد النهائية مع مخاطر الخطأ البشري.",
    aqliyaApproach:
      "LocalContentOS يتتبع 12 مساراً من مسارات المحتوى المحلي في الوقت الفعلي، يُولّد تقارير الامتثال آلياً، ويُنبّه على الانحرافات قبل الاستحقاق.",
    outcome:
      "تقارير امتثال جاهزة في دقائق، مع سجل أدلة كامل يصمد أمام المراجعات التنظيمية.",
    systemLink: "/products/local-content",
    systemLabel: "استكشف LocalContentOS",
  },
  {
    id: "institutional-memory",
    category: "مخصص / Intelligence Core",
    categoryColor: "text-amber-400",
    categoryBorder: "border-amber-500/20",
    categoryBg: "bg-amber-500/5",
    title: "ذاكرة المؤسسة وإدارة المعرفة",
    icon: "◌",
    problem:
      "عندما يترك موظف خبير المؤسسة، يأخذ معه سنوات من السياق والمعرفة غير الموثقة. المؤسسة تبدأ من الصفر في كل دورة.",
    traditionalState:
      "وثائق إجراءات قديمة، ملفات SharePoint مهجورة، ومعرفة ضمنية موزعة على رؤوس الأفراد.",
    aqliyaApproach:
      "نظام مخصص فوق Intelligence Core يُنشئ قاعدة معرفة مؤسسية حية: السياسات، القرارات التاريخية، الدروس المستفادة، وأفضل الممارسات — قابلة للبحث والربط.",
    outcome:
      "معرفة المؤسسة تصبح أصلاً إنتاجياً لا ذاكرة فردية — جاهزة للموظف الجديد في أسبوع لا في أشهر.",
    systemLink: "/custom-product",
    systemLabel: "تصميم نظام مخصص",
  },
  {
    id: "contract-monitoring",
    category: "مخصص / AuditOS",
    categoryColor: "text-amber-400",
    categoryBorder: "border-amber-500/20",
    categoryBg: "bg-amber-500/5",
    title: "مراقبة العقود وإدارة الالتزامات",
    icon: "◐",
    problem:
      "مؤسسات تُدير عشرات أو مئات العقود تواجه صعوبة في تتبع الالتزامات، مواعيد الاستحقاق، وشروط التجديد — تكتشف الانتهاكات بعد وقوعها.",
    traditionalState:
      "قائمة بالعقود في Excel، تنبيهات يدوية في التقويم، ومراجعات سنوية تفقد فيها الكثير من التفاصيل الحرجة.",
    aqliyaApproach:
      "نظام يعالج نصوص العقود ويستخرج الالتزامات والمواعيد والشروط، يُنشئ لوحة مراقبة حية، ويُنبّه المسؤولين قبل الاستحقاقات.",
    outcome:
      "لا التزام يُفوَّت، كل انتهاك محتمل يُعالَج مسبقاً، وسجل كامل لكل تعديل أو تجديد.",
    systemLink: "/custom-product",
    systemLabel: "تصميم نظام مخصص",
  },
  {
    id: "regulatory-readiness",
    category: "مخصص / DecisionOS",
    categoryColor: "text-amber-400",
    categoryBorder: "border-amber-500/20",
    categoryBg: "bg-amber-500/5",
    title: "الجاهزية التنظيمية والرقابية",
    icon: "◑",
    problem:
      "التفتيش التنظيمي المفاجئ أو طلب الإفصاح يُربك المؤسسات التي لم تبنِ منهجية توثيق منتظمة — يستغرق إعداد الملف أسابيع.",
    traditionalState:
      "إعداد ملفات مكثف قبل كل زيارة تنظيمية، توثيق متأخر، وعدم تناسق في الروايات.",
    aqliyaApproach:
      "توثيق مستمر وآني لكل قرار وإجراء، مع بنية Evidence Chain تُتيح استخراج ملف امتثال متكامل في أي وقت — لا عند الحاجة فحسب.",
    outcome:
      "التفتيش يُصبح روتيناً لا أزمة. الملف جاهز دائماً، موثوق، ومرتبط بالأدلة الأصلية.",
    systemLink: "/governance",
    systemLabel: "بنية الحوكمة",
  },
  {
    id: "procurement-intelligence",
    category: "مخصص / Intelligence Core",
    categoryColor: "text-amber-400",
    categoryBorder: "border-amber-500/20",
    categoryBg: "bg-amber-500/5",
    title: "ذكاء المشتريات ودعم قرار الترسية",
    icon: "◒",
    problem:
      "لجان التقييم في المشتريات تغرق في مئات الصفحات من العروض التقنية والمالية — التقييم يستغرق أسابيع وتُفوَّت فيه تفاصيل مهمة.",
    traditionalState:
      "قراءة يدوية، ملاحظات شخصية، ومقارنات في جداول يبنيها كل عضو لجنة بطريقته.",
    aqliyaApproach:
      "نظام يُحلل وثائق العروض ويستخرج نقاط المقارنة المحددة في معايير التقييم، يُنشئ مصفوفة مقارنة موثقة، ويُنبّه على الانحرافات أو الثغرات.",
    outcome:
      "قرار ترسية مدعوم بأدلة موثقة، قابل للمراجعة، ومحمي من الطعن.",
    systemLink: "/custom-product",
    systemLabel: "تصميم نظام مخصص",
  },
];

export default function UseCasesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="relative mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              حالات الاستخدام
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              أين يُحدث ذكاء عقلية
              <br />
              <span className="text-aqliya-cyan">فارقاً فعلياً؟</span>
            </h1>
            <p className="mt-5 text-base leading-8 text-white/62 sm:text-lg">
              سبع فئات من التحديات المؤسسية الحقيقية — المشكلة كما هي، الوضع
              التقليدي بصدق، ومسار عقلية مع تحفظ واضح: الإنسان يقرر دائماً.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="space-y-8">
            {useCases.map((uc) => (
              <div
                key={uc.id}
                className={`rounded-[24px] border ${uc.categoryBorder} ${uc.categoryBg} p-8 sm:p-10`}
              >
                {/* Header */}
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${uc.categoryColor}`}
                    >
                      {uc.category}
                    </span>
                    <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                      {uc.title}
                    </h2>
                  </div>
                  <span className="text-3xl text-white/10">{uc.icon}</span>
                </div>

                {/* 3-column breakdown */}
                <div className="grid gap-5 lg:grid-cols-3">
                  <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-5">
                    <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-red-400">
                      المشكلة
                    </p>
                    <p className="text-sm leading-7 text-white/65">{uc.problem}</p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
                    <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/40">
                      الوضع التقليدي
                    </p>
                    <p className="text-sm leading-7 text-white/55">{uc.traditionalState}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-5">
                    <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
                      مسار عقلية
                    </p>
                    <p className="text-sm leading-7 text-white/65">{uc.aqliyaApproach}</p>
                  </div>
                </div>

                {/* Outcome + Link */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.025] p-5">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-aqliya-cyan">
                      الأثر المؤسسي
                    </p>
                    <p className="mt-1 text-sm text-white/70">{uc.outcome}</p>
                  </div>
                  <Link
                    href={uc.systemLink}
                    className="btn-outline shrink-0 px-5 py-2 text-sm"
                  >
                    {uc.systemLabel}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Caveat + CTA */}
      <section className="border-t border-white/5 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 rounded-2xl border border-white/8 bg-white/[0.025] p-6 text-center">
            <p className="text-sm font-semibold text-white/60">
              تحفظ مؤسسي ثابت في جميع حالات الاستخدام
            </p>
            <p className="mt-2 text-base font-black text-white">
              الذكاء يساعد. الإنسان يقرر. الدليل يحكم.
            </p>
            <p className="mt-2 text-sm text-white/45">
              عقلية لا تتخذ قرارات نهائية. كل إجراء ذو أثر مؤسسي يتطلب
              موافقة بشرية صريحة — هذا قيد هندسي لا خيار في الإعدادات.
            </p>
          </div>

          <div className="gradient-border rounded-[28px] bg-gradient-to-br from-aqliya-deep via-aqliya-indigo/30 to-aqliya-deep p-10 text-center sm:p-14">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              لا ترى مؤسستك في القائمة؟
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/60">
              إذا كانت تحديات مؤسستك لا تنطبق على أي من الفئات أعلاه، فهذا
              لا يعني أن عقلية ليست مناسبة. يمكننا تصميم نظام مخصص فوق
              AQLIYA Intelligence Core يعالج سياقك بالضبط.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/executive-briefing" className="btn-primary px-8 py-3.5 text-base">
                طلب إحاطة تنفيذية
              </Link>
              <Link href="/custom-product" className="btn-outline px-8 py-3.5 text-base">
                تصميم نظام مخصص
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
