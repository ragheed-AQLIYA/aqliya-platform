import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "الإحاطة التنفيذية | AQLIYA",
  description:
    "جلسة تشخيص استراتيجي للقيادة المؤسسية — لتحديد الفجوة التشغيلية، تقييم جاهزية المؤسسة، وتصميم مسار ذكاء مؤسسي محكوم.",
};

const diagnosticAreas = [
  {
    number: "01",
    title: "تشخيص الفجوة التشغيلية",
    description:
      "أين تتعثر المؤسسة؟ قرارات بدون أدلة موثقة، تقارير تعتمد على جداول يدوية، عمليات تدقيق تستغرق أسابيع؟ نُحدد الفجوة قبل أن نقترح حلاً.",
  },
  {
    number: "02",
    title: "تقييم جاهزية البيانات",
    description:
      "هل بياناتك في حالة تُمكّن الذكاء الاصطناعي من العمل عليها؟ جودة المدخلات تحدد قيمة المخرجات. نُقيّم الوضع الراهن بواقعية.",
  },
  {
    number: "03",
    title: "تحديد خط النظام المناسب",
    description:
      "ليس كل مؤسسة تحتاج كل شيء. نُحدد الخط الذي يحقق أعلى أثر بأقل احتكاك — AuditOS، DecisionOS، LocalContentOS، أو تصميم مخصص.",
  },
  {
    number: "04",
    title: "تصميم نموذج الحوكمة",
    description:
      "الذكاء الاصطناعي داخل مؤسستك يحتاج حوكمة واضحة. من يوافق؟ ما الذي يُسجَّل؟ كيف تُعالَج الأخطاء؟ نُصمم ذلك معاً قبل التنفيذ.",
  },
  {
    number: "05",
    title: "تقييم مسار التنفيذ",
    description:
      "جداول زمنية واقعية، متطلبات تكامل، واحتياجات الفريق الداخلي — لا وعود بمعجزات، بل مسار منطقي قابل للقياس.",
  },
];

const audienceProfiles = [
  {
    role: "الرئيس التنفيذي",
    concern: "هل الذكاء الاصطناعي يُعزز قدرتي على اتخاذ قرارات أسرع وأدق؟",
    value: "رؤية استراتيجية واضحة ومسار أثر قابل للقياس",
  },
  {
    role: "المدير المالي",
    concern: "كيف أضمن أن الذكاء الاصطناعي لا يُعرّض الامتثال أو التدقيق للخطر؟",
    value: "بنية Evidence Chain كاملة وسجل تدقيق غير قابل للتعديل",
  },
  {
    role: "المدير التقني / المعلومات",
    concern: "هل يمكن التكامل مع بنيتنا التحتية الحالية بشكل آمن؟",
    value: "مراجعة هندسية معمقة وجدوى النشر الخاص",
  },
  {
    role: "مدير الامتثال",
    concern: "هل النظام جاهز لمتطلبات الرقابة والمراجعة الخارجية؟",
    value: "RBAC، Audit Trail، وتوثيق كامل لكل قرار",
  },
  {
    role: "الجهة الحكومية",
    concern: "هل النظام يلتزم بمتطلبات المحتوى المحلي والسيادة الرقمية؟",
    value: "إقامة البيانات محلياً وبنية LocalContentOS المتخصصة",
  },
];

const sessionFormat = [
  {
    phase: "الجلسة التشخيصية الأولى",
    duration: "30–45 دقيقة",
    mode: "عن بُعد أو حضور",
    participants: "المسؤول التنفيذي الرئيسي + شريك تقني اختياري",
    outcome: "تحديد الفجوة الأساسية وخط النظام الأنسب",
  },
  {
    phase: "جلسة العمق التقني",
    duration: "60–90 دقيقة",
    mode: "عادةً حضور أو مرئي تفاعلي",
    participants: "الفريق التقني + الفريق الهندسي من عقلية",
    outcome: "تقييم البيانات، البنية التحتية، ومتطلبات التكامل",
  },
  {
    phase: "إحاطة تنفيذية مخصصة",
    duration: "2–3 أيام عمل بعد الجلستين",
    mode: "وثيقة مكتوبة",
    participants: "يُسلَّم للفريق الكامل",
    outcome: "مسار تنفيذ، جدول زمني، متطلبات، وتقدير التكلفة",
  },
];

export default function ExecutiveBriefingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="relative mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              الإحاطة التنفيذية
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              قبل أي قرار
              <br />
              <span className="text-aqliya-cyan">افهم فجوتك أولاً</span>
            </h1>
            <p className="mt-5 text-base leading-8 text-white/62 sm:text-lg">
              الإحاطة التنفيذية ليست عرضاً تجارياً. هي جلسة تشخيص استراتيجي
              لتحديد أين تكمن الفجوة التشغيلية في مؤسستك — وما إذا كان ذكاء
              مؤسسي محكوم هو الإجابة الصحيحة.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-white/45">
              {[
                "تشخيص قبل أي اقتراح",
                "صدق تام حول جاهزية المنصة",
                "مخرجات مكتوبة وقابلة للتنفيذ",
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-aqliya-cyan/60" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What is it */}
      <section className="border-b border-white/5 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
                ما هي الإحاطة التنفيذية
              </span>
              <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                تشخيص قبل أن يكون بيعاً
              </h2>
              <p className="mt-5 text-base leading-8 text-white/60">
                معظم مؤسسات تصل إلينا وهي تعرف أنها تريد &ldquo;ذكاءً اصطناعياً&rdquo;
                — لكنها لا تعرف بالضبط أين وكيف. مهمتنا الأولى أن نفهم
                واقعها قبل أن نقترح أي شيء.
              </p>
              <p className="mt-4 text-base leading-8 text-white/60">
                إذا لم تكن منصة عقلية مناسبة لمؤسستك في هذه المرحلة —
                سنقول ذلك بصراحة. لا نريد عملاء يشترون ما لا يحتاجون إليه.
              </p>
            </div>
            <div className="rounded-[20px] border border-white/8 bg-gradient-to-br from-white/[0.04] to-transparent p-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                ما لن يحدث في الجلسة
              </p>
              <ul className="mt-4 space-y-3">
                {[
                  "لا عرض PowerPoint مُعدَّ مسبقاً",
                  "لا وعود بنتائج قبل فهم السياق",
                  "لا ضغط للتوقيع أو الانتقال للخطوة التالية",
                  "لا ادعاءات حول شهادات أو اعتمادات لم نحصل عليها",
                  "لا مصطلحات تقنية بدون شرح واضح",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/60">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-rose-400/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Diagnostic Areas */}
      <section className="section-gradient-dark border-b border-white/5 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              محاور التشخيص الاستراتيجي
            </h2>
            <p className="mt-4 text-base text-white/50 sm:text-lg">
              ما نُغطيه معاً قبل أن نصل إلى أي توصية
            </p>
          </div>

          <div className="space-y-4">
            {diagnosticAreas.map((area, i) => (
              <div
                key={area.number}
                className={`flex items-start gap-6 glass-card rounded-2xl p-6 ${
                  i % 2 === 0 ? "" : "lg:flex-row-reverse"
                }`}
              >
                <span className="text-4xl font-black text-white/8 shrink-0 w-12 text-center">
                  {area.number}
                </span>
                <div>
                  <h3 className="text-lg font-black text-white">{area.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/60">{area.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audience Profiles */}
      <section className="border-b border-white/5 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              لمن هذه الإحاطة؟
            </h2>
            <p className="mt-4 text-base text-white/50 sm:text-lg">
              كل دور يأتي بسؤال مختلف — ومخرج مختلف
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {audienceProfiles.map((profile) => (
              <div key={profile.role} className="glass-card rounded-2xl p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-aqliya-cyan">
                  {profile.role}
                </p>
                <p className="mt-3 text-sm font-semibold leading-6 text-white/80">
                  {profile.concern}
                </p>
                <div className="mt-3 border-t border-white/5 pt-3">
                  <p className="text-[10px] text-white/35">ما يخرج من الجلسة:</p>
                  <p className="mt-1 text-sm text-white/60">{profile.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Session Format */}
      <section className="section-gradient-dark border-b border-white/5 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              شكل الجلسة
            </h2>
            <p className="mt-4 text-base text-white/50 sm:text-lg">
              ثلاث مراحل — مرنة وقابلة للتكيف مع سياق مؤسستك
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {sessionFormat.map((phase, i) => (
              <div key={phase.phase} className="glass-card rounded-2xl p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-aqliya-cyan/30 bg-aqliya-cyan/10 text-sm font-black text-aqliya-cyan">
                    {i + 1}
                  </span>
                  <h3 className="font-black text-white">{phase.phase}</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-white/40">المدة</span>
                    <span className="text-right font-medium text-white/70">{phase.duration}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-white/40">الطريقة</span>
                    <span className="text-right font-medium text-white/70">{phase.mode}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-white/40">المشاركون</span>
                    <span className="text-right font-medium text-white/70">{phase.participants}</span>
                  </div>
                  <div className="border-t border-white/5 pt-3">
                    <p className="text-white/40 text-[10px] mb-1">المخرج</p>
                    <p className="font-semibold text-white/75">{phase.outcome}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="gradient-border rounded-[28px] bg-gradient-to-br from-aqliya-deep via-aqliya-indigo/30 to-aqliya-deep p-10 text-center sm:p-14">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              ابدأ بسؤال — ليس بتوقيع
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/60">
              تواصل معنا بطلب بسيط: &ldquo;أريد جلسة تشخيص لمؤسستنا.&rdquo;
              لا نموذج معقد، لا التزام مسبق، لا توقعات مُتضخمة.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact" className="btn-primary px-8 py-3.5 text-base">
                طلب الإحاطة التنفيذية
              </Link>
              <Link href="/use-cases" className="btn-outline px-8 py-3.5 text-base">
                استكشف حالات الاستخدام
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
