import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "إطار التقييم التشغيلي | AQLIYA",
  description:
    "الأدلة التشغيلية لقدرات AuditOS — ما يمكن إثباته في التقييم التشغيلي، وكيف يتم التحقق منه، وما هي معايير النجاح.",
};

const proofScenarios = [
  {
    title: "إثبات ١: سلسلة الأدلة",
    description:
      "من ميزان المراجعة إلى القائمة المالية — كل رقم مربوط بمصدره، كل خطوة موثقة.",
    steps: [
      {
        label: "المدخل",
        detail: "ميزان مراجعة بـ ٥٠-٢٠٠ حساب — CSV أو XLSX",
      },
      {
        label: "المعالجة",
        detail: "فحص الاتزان + اقتراح توجيه IFRS + تأكيد المدقق",
      },
      {
        label: "المخرج",
        detail: "كل بند في القائمة مشير إلى الحساب المصدر والمدقق المعتمد",
      },
      {
        label: "الدليل",
        detail: "Evidence Graph يربط: الرقم ← الحساب ← القرار ← الدليل ← الشخص",
      },
    ],
    verifiable:
      "يمكن التحقق في الديمو: ارفع ميزان تجريبي وتتبع أي رقم في القائمة إلى مصدره",
  },
  {
    title: "إثبات ٢: Audit Trail غير قابل للتعديل",
    description:
      "كل إجراء مسجّل — لا يُحذف، لا يُعدَّل. سجل قانوني قابل للتصدير.",
    steps: [
      {
        label: "ما يُسجَّل",
        detail:
          "١٨+ نوع حدث: رفع ملف، توجيه حساب، إنشاء ملاحظة، اعتماد، رفض، نشر",
      },
      {
        label: "كيف يُسجَّل",
        detail:
          "User ID + Timestamp + Action Type + الكيان المتأثر + الحالة قبل وبعد",
      },
      {
        label: "من يرى ماذا",
        detail: "RBAC: الشريك يرى الكل — المدقق يرى ارتباطاته فقط",
      },
      {
        label: "التصدير",
        detail: "سجل التدقيق قابل للتصدير بصيغة JSON/XLSX مع كل حزمة ارتباط",
      },
    ],
    verifiable:
      "يمكن التحقق في الديمو: أنجز خطوة في سير العمل ثم راجع Audit Trail المباشر",
  },
  {
    title: "إثبات ٣: بوابة الاعتماد البشري",
    description:
      "لا يمكن نشر أي ارتباط قبل اكتمال خمسة شروط بشرية. الذكاء الاصطناعي يقترح — الإنسان يعتمد.",
    steps: [
      {
        label: "الشرط ١",
        detail: "اكتمال جميع أقسام الارتباط (٠ بنود مفتوحة)",
      },
      {
        label: "الشرط ٢",
        detail: "تسوية جميع الملاحظات أو قرار رسمي بالتجاهل مع سبب موثق",
      },
      {
        label: "الشرط ٣",
        detail: "ربط الأدلة الداعمة بكل بند مادي",
      },
      {
        label: "الشرط ٤",
        detail: "مراجعة المشرف وإعطاء موافقة مرحلية",
      },
      {
        label: "الشرط ٥",
        detail: "اعتماد الشريك/المسؤول النهائي بتوقيع رقمي مسجّل",
      },
    ],
    verifiable:
      "يمكن التحقق في الديمو: حاول النشر قبل اكتمال الشروط — سيرفض النظام",
  },
  {
    title: "إثبات ٤: RBAC — فصل الصلاحيات",
    description:
      "كل مستخدم يرى فقط ما يسمح له دوره برؤيته. لا تجاوز للصلاحيات.",
    steps: [
      {
        label: "الأدوار",
        detail: "Admin / Auditor / Reviewer / Partner / Viewer",
      },
      {
        label: "المستوى",
        detail: "صلاحية على مستوى المنصة + على مستوى الارتباط",
      },
      {
        label: "التطبيق",
        detail: "Server-side enforcement — لا يمكن تجاوزه من الواجهة",
      },
      {
        label: "الأثر",
        detail:
          "الشريك يعتمد — المدقق ينفذ — المراجع يفحص — لا تداخل في الأدوار",
      },
    ],
    verifiable:
      "يمكن التحقق في الديمو: سجّل الدخول بأدوار مختلفة وراقب الصلاحيات",
  },
];

const pilotCriteria = [
  {
    category: "اكتمال سير العمل",
    items: [
      "رفع الميزان وفحصه",
      "توجيه الحسابات",
      "توليد القوائم",
      "إدارة الملاحظات",
      "الاعتماد والنشر",
    ],
  },
  {
    category: "منهجية التدقيق",
    items: [
      "التوافق مع IFRS",
      "الأدلة الداعمة",
      "التوثيق الرسمي",
      "سجل القرارات",
    ],
  },
  {
    category: "قابلية الاستخدام",
    items: ["وضوح الواجهة", "سهولة الاستخدام", "دعم العربية", "الأداء العام"],
  },
  {
    category: "قبول أصحاب المصلحة",
    items: [
      "ثقة المدقق بالمخرجات",
      "تقبّل الشريك للمنهجية",
      "الاستعداد للاعتماد",
    ],
  },
];

const proofDimensions = [
  {
    dimension: "وضوح سير العمل",
    question:
      "هل سير العمل المحدد مناسب للتشغيل على المنصة؟ هل الخطوات واضحة وقابلة للتنفيذ؟",
  },
  {
    dimension: "جاهزية البيانات",
    question:
      "هل البيانات متوفرة؟ هل هي بالجودة والصيغة المطلوبة لبدء التقييم التشغيلي؟",
  },
  {
    dimension: "إمكانية تتبع الأدلة",
    question: "هل يمكن ربط كل مخرج بمصدره؟ هل مسار الإثبات واضح وقابل للتدقيق؟",
  },
  {
    dimension: "جودة المراجعة البشرية",
    question:
      "هل فهم الفريق المخرجات؟ هل استطاعوا مراجعتها واتخاذ قرارات بناءً عليها؟",
  },
  {
    dimension: "فائدة المخرجات",
    question:
      "هل المخرجات قابلة للاستخدام فعليًا؟ هل تخدم سير العمل الفعلي للفريق؟",
  },
  {
    dimension: "ثقة القرار",
    question:
      "هل يمكن اتخاذ قرار بالأدلة بناءً على التجربة؟",
  },
];

const pilotDecisionOutputs = [
  {
    outcome: "متابعة — توسّع",
    detail:
      "التقييم أثبت القيمة. الانتقال إلى تفعيل مؤسسي مع النطاق نفسه.",
  },
  {
    outcome: "مراجعة النطاق — تعديل",
    detail:
      "التقييم أظهر فجوة في اختيار المسار أو البيانات. نعدّل ونعيد التقييم.",
  },
  {
    outcome: "تمديد التقييم",
    detail: "النتائج واعدة لكنها تحتاج نطاقًا أوسع أو فترة أطول لتأكيد القرار.",
  },
  {
    outcome: "إيقاف",
    detail:
      "التقييم بيّن أن هذا المسار غير مناسب. نوصي ببديل أو نغلق الملف.",
  },
  {
    outcome: "نظام مخصص",
    detail:
      "الاحتياج يتجاوز الأنظمة الجاهزة. ننتقل إلى جلسة تصميم نظام مؤسسي مخصص.",
  },
];

const productProofExamples = [
  {
    product: "AuditOS",
    examples: [
      "ميزان مراجعة واحد ← mapping واضح ← evidence chain ← review notes",
    ],
    href: "/products/audit",
  },
  {
    product: "LocalContentOS",
    examples: ["قاعدة مورّدين/عقود ← evidence checklist ← تقرير محتوى محلي"],
    href: "/products/local-content",
  },
  {
    product: "DecisionOS",
    examples: ["قرار مؤسسي واحد ← سيناريوهات ← مخاطر ← توصية مع أثر أدلة"],
    href: "/products/decision",
  },
  {
    product: "Office AI Assistant",
    examples: ["حالة معرفة داخلية ← Q&A محكوم ← مراجعة وملاحظات"],
    href: "/products/office-ai",
  },
];

export default function PilotProofPage() {
  return (
    <div className="min-h-screen bg-aqliya-deep" dir="rtl">
      {/* Hero */}
      <section className="hero-gradient py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
            إطار إثبات القيمة
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            إطار إثبات القيمة التشغيلية
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            لا نبدأ بتوسّع واسع. نبدأ بمسار واحد، نلتقط الأدلة، نقيس النتائج،
            ثم نقرر بناءً على أدلة واضحة.
          </p>
        </div>
      </section>

      {/* What Pilot Proof Means */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">
              ما يعنيه الإثبات
            </p>
            <h2 className="text-2xl font-bold text-white mt-4 mb-6">
              إطار التقييم التشغيلي ليس وعدًا تجاريًا — هو طريقة منظمة للإجابة
            </h2>
          </div>
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "هل workflow مناسب للمنصة؟",
              "هل البيانات كافية ومتوافقة؟",
              "هل المخرجات قابلة للمراجعة والاعتماد؟",
              "هل الفريق قادر على استخدام النظام؟",
              "هل يوجد أثر أدلة وتتبّع قابل للتدقيق؟",
            ].map((q) => (
              <div
                key={q}
                className="glass-card rounded-xl p-5 flex items-center gap-3"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                <p className="text-slate-300 text-sm leading-relaxed">{q}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proof Dimensions */}
      <section className="section-gradient-dark py-20 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400 text-center">
            أبعاد الإثبات
          </p>
          <h2 className="text-2xl font-bold text-white mt-4 mb-10 text-center">
            ستة أبعاد نقيس بها التقييم التشغيلي
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proofDimensions.map((pd) => (
              <div key={pd.dimension} className="glass-card rounded-xl p-5">
                <p className="text-white font-semibold text-sm mb-2">
                  {pd.dimension}
                </p>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {pd.question}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Evidence Captured During Pilot */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">
              الأدلة الملتقطة
            </p>
            <h2 className="text-2xl font-bold text-white mt-4 mb-3">
              ما نلتقطه أثناء التقييم التشغيلي
            </h2>
            <p className="text-slate-400">
              أمثلة على الأدلة التي توثقها كل تجربة — قابلة للمراجعة والتصدير
            </p>
          </div>
          <div className="space-y-8">
            {proofScenarios.map((ps) => (
              <div
                key={ps.title}
                className="glass-card rounded-2xl overflow-hidden"
              >
                <div className="p-8 border-b border-white/5">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {ps.title}
                  </h3>
                  <p className="text-slate-300">{ps.description}</p>
                </div>
                <div className="p-8 border-b border-white/5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ps.steps.map((step, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-4">
                        <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wide mb-1">
                          {step.label}
                        </p>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {step.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-8 py-4 bg-cyan-500/5">
                  <p className="text-cyan-300 text-sm">
                    <span className="font-semibold">كيف تتحقق: </span>
                    {ps.verifiable}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pilot Success Criteria */}
      <section className="section-gradient-dark py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">
              معايير التقييم
            </p>
            <h2 className="text-2xl font-bold text-white mt-4 mb-3">
              كيف نقيّم نجاح التقييم التشغيلي
            </h2>
            <p className="text-slate-400">
              التقييم ليس إثباتًا أعمى — له معايير واضحة ومتفق عليها مسبقًا
              تُجيب على: هل ننتقل أم نعدّل أم نوقف؟
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pilotCriteria.map((pc) => (
              <div key={pc.category} className="glass-card rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">{pc.category}</h3>
                <ul className="space-y-2">
                  {pc.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-slate-300 text-sm"
                    >
                      <span className="text-cyan-400 mt-0.5 shrink-0">◈</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 glass-card rounded-xl p-6 border border-cyan-500/10">
            <p className="text-slate-300 text-sm leading-relaxed text-center">
              في نهاية التقييم، تحصل على تقرير قرار بالأدلة يوثق النتائج ويحدد
              الخطوة التالية — سواء كانت التوسع أو التعديل أو إغلاق التجربة.
            </p>
          </div>
        </div>
      </section>

      {/* Product-Specific Proof Examples */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400 text-center">
            أمثلة حسب نظام التشغيل
          </p>
          <h2 className="text-2xl font-bold text-white mt-4 mb-4 text-center">
            نموذج الإثبات لكل نظام
          </h2>
          <p className="text-slate-400 text-center mb-10 max-w-2xl mx-auto">
            كل نظام له مسار إثبات مختلف. هذه أمثلة على ما نختبره في تقييم
            تشغيلي نموذجي — بدون نتائج موثقة مسبقًا.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {productProofExamples.map((p) => (
              <div key={p.product} className="glass-card rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-3">
                  {p.product}
                </h3>
                <ul className="space-y-2">
                  {p.examples.map((ex, i) => (
                    <li key={i} className="flex gap-3 text-slate-300 text-sm">
                      <span className="text-cyan-400 mt-0.5 shrink-0">◈</span>
                      <span className="leading-relaxed">{ex}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.href}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  استكشف نظام التشغيل ←
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pilot Decision Output */}
      <section className="section-gradient-dark py-20 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400 text-center">
            مخرجات القرار
          </p>
          <h2 className="text-2xl font-bold text-white mt-4 mb-4 text-center">
            نهاية التقييم — مخرج واحد من خمسة
          </h2>
          <p className="text-slate-400 text-center mb-10 max-w-2xl mx-auto">
            التقييم لا ينتهي بـ &ldquo;ناجح&rdquo; أو &ldquo;فاشل&rdquo; فقط.
            له خمسة مخرجات ممكنة، كلها مفيدة.
          </p>
          <div className="max-w-3xl mx-auto space-y-3">
            {pilotDecisionOutputs.map((d) => (
              <div key={d.outcome} className="glass-card rounded-xl p-5">
                <p className="text-white font-semibold text-sm mb-1">
                  {d.outcome}
                </p>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {d.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Is NOT Proven */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="glass-card rounded-2xl p-8 border border-amber-500/10">
            <h2 className="text-xl font-bold text-white mb-6">
              ما لا يُدّعى في التقييم التشغيلي
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "لا ندّعي أن النظام يستبدل المدقق أو المحاسب",
                "لا ندّعي شهادات SOC2 أو ISO في هذه المرحلة",
                "لا ندّعي أن التقييم بيئة إنتاجية مكتملة",
                "لا ندّعي أن مخرجات الذكاء الاصطناعي نهائية دون مراجعة بشرية",
                "لا ندّعي تكاملًا مع ERP أو أنظمة خارجية حاليًا",
                "لا ندّعي تصدير PDF عربي مكتمل التنسيق في هذا الإصدار",
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-amber-400 mt-0.5 shrink-0">⊘</span>
                  <p className="text-slate-300 text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-gradient-dark py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-3">
              حوّل أول مسار تشغيلي إلى أدلة قابلة للمراجعة
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              جلسة تشخيص مجانية تحدد سير العمل المناسب، معايير النجاح، والخطوة
              التالية.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/contact"
                className="btn-primary px-8 py-3 rounded-xl text-sm font-medium"
                data-event="click_request_pilot_review"
              >
                طلب جلسة تشخيص
              </Link>
              <Link
                href="/proof-library"
                className="btn-outline px-8 py-3 rounded-xl text-sm font-medium"
                data-event="click_view_proof_library"
              >
                مكتبة الإثبات ←
              </Link>
              <Link
                href="/engagement-models"
                className="btn-outline px-8 py-3 rounded-xl text-sm font-medium"
                data-event="click_view_engagement_models"
              >
                نماذج التعاون
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
