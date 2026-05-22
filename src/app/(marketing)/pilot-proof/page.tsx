import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "دليل البايلوت | AQLIYA",
  description:
    "الأدلة التشغيلية لقدرات AuditOS — ما يمكن إثباته في البايلوت، وكيف يتم التحقق منه، وما هي شروط النجاح.",
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
    verifiable: "يمكن التحقق في الديمو: ارفع ميزان تجريبي وتتبع أي رقم في القائمة إلى مصدره",
  },
  {
    title: "إثبات ٢: Audit Trail غير قابل للتعديل",
    description:
      "كل إجراء مسجّل — لا يُحذف، لا يُعدَّل. سجل قانوني قابل للتصدير.",
    steps: [
      {
        label: "ما يُسجَّل",
        detail: "١٨+ نوع حدث: رفع ملف، توجيه حساب، إنشاء ملاحظة، اعتماد، رفض، نشر",
      },
      {
        label: "كيف يُسجَّل",
        detail: "User ID + Timestamp + Action Type + الكيان المتأثر + الحالة قبل وبعد",
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
    verifiable: "يمكن التحقق في الديمو: أنجز خطوة في سير العمل ثم راجع Audit Trail المباشر",
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
    verifiable: "يمكن التحقق في الديمو: حاول النشر قبل اكتمال الشروط — سيرفض النظام",
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
        detail: "الشريك يعتمد — المدقق ينفذ — المراجع يفحص — لا تداخل في الأدوار",
      },
    ],
    verifiable: "يمكن التحقق في الديمو: سجّل الدخول بأدوار مختلفة وراقب الصلاحيات",
  },
];

const pilotCriteria = [
  { category: "اكتمال سير العمل", items: ["رفع الميزان وفحصه", "توجيه الحسابات", "توليد القوائم", "إدارة الملاحظات", "الاعتماد والنشر"] },
  { category: "منهجية التدقيق", items: ["التوافق مع IFRS", "الأدلة الداعمة", "التوثيق الرسمي", "سجل القرارات"] },
  { category: "قابلية الاستخدام", items: ["وضوح الواجهة", "سهولة الاستخدام", "دعم العربية", "الأداء العام"] },
  { category: "قبول أصحاب المصلحة", items: ["ثقة المدقق بالمخرجات", "تقبّل الشريك للمنهجية", "الاستعداد للاعتماد"] },
];

export default function PilotProofPage() {
  return (
    <div className="min-h-screen bg-[var(--aqliya-deep)]" dir="rtl">
      {/* Hero */}
      <section className="hero-gradient py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
            دليل البايلوت
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            ما يمكن إثباته — وكيف
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            قبل الالتزام بأي اشتراك، نعطيك الأدوات للتحقق بنفسك.
            كل ادعاء قابل للاختبار في بيئة بايلوت فعلية.
          </p>
        </div>
      </section>

      {/* Proof Scenarios */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold text-white mb-3">سيناريوهات الإثبات</h2>
            <p className="text-slate-400">أربعة محاور يمكنك التحقق منها بشكل مستقل</p>
          </div>
          <div className="space-y-8">
            {proofScenarios.map((ps) => (
              <div key={ps.title} className="glass-card rounded-2xl overflow-hidden">
                <div className="p-8 border-b border-white/5">
                  <h3 className="text-xl font-bold text-white mb-2">{ps.title}</h3>
                  <p className="text-slate-300">{ps.description}</p>
                </div>
                <div className="p-8 border-b border-white/5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ps.steps.map((step, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-4">
                        <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wide mb-1">
                          {step.label}
                        </p>
                        <p className="text-slate-300 text-sm leading-relaxed">{step.detail}</p>
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
            <h2 className="text-2xl font-bold text-white mb-3">معايير نجاح البايلوت</h2>
            <p className="text-slate-400">
              البايلوت ليس إثباتًا أعمى — له معايير واضحة ومتفق عليها مسبقًا
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pilotCriteria.map((pc) => (
              <div key={pc.category} className="glass-card rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">{pc.category}</h3>
                <ul className="space-y-2">
                  {pc.items.map((item) => (
                    <li key={item} className="flex gap-3 text-slate-300 text-sm">
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
              في نهاية البايلوت، تحصل على تقرير Go/No-Go يوثق النتائج ويحدد الخطوة التالية —
              سواء كانت التوسع أو التعديل أو إغلاق التجربة.
            </p>
          </div>
        </div>
      </section>

      {/* What Is NOT Proven */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="glass-card rounded-2xl p-8 border border-amber-500/10">
            <h2 className="text-xl font-bold text-white mb-6">ما لا يُدّعى في البايلوت</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "لا ندّعي أن النظام يستبدل المدقق أو المحاسب",
                "لا ندّعي شهادات SOC2 أو ISO في هذه المرحلة",
                "لا ندّعي أن البايلوت بيئة إنتاجية مكتملة",
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

      {/* CTA */}
      <section className="section-gradient-dark py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            جاهز للتحقق بنفسك؟
          </h2>
          <p className="text-slate-300 mb-8">
            ابدأ بالديمو التفاعلي — لا حاجة لإنشاء حساب، لا بيانات حقيقية.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/demo" className="btn-primary px-8 py-3 rounded-xl text-sm font-medium">
              مشاهدة الديمو
            </Link>
            <Link href="/engagement-models" className="btn-outline px-8 py-3 rounded-xl text-sm font-medium">
              نماذج التعاون
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
