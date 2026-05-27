import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "مكتبة الإثبات | AQLIYA",
  description:
    "أمثلة على مخرجات AuditOS الموثقة — قوائم مالية مسودة، سجلات تدقيق، تقارير اعتماد، وتسلسل أدلة. جميعها مبنية على بيانات تجريبية.",
};

type OutputExample = {
  id: string;
  category: string;
  title: string;
  description: string;
  fields: { label: string; value: string }[];
  badge: string;
  note: string;
};

const outputExamples: OutputExample[] = [
  {
    id: "tb-output",
    category: "معالجة ميزان المراجعة",
    title: "نتيجة فحص ميزان المراجعة",
    description:
      "بعد رفع ميزان المراجعة، يُصدر النظام تقرير فحص فوري يتضمن حالة الاتزان ومقترحات توجيه الحسابات.",
    fields: [
      { label: "الملف المدخل", value: "trial_balance_Q4_2024.xlsx" },
      { label: "عدد الحسابات", value: "١٤٧ حساب" },
      { label: "حالة الاتزان", value: "✓ المدين = الدائن — الميزان متزن" },
      { label: "الحسابات المقترح توجيهها", value: "١٤٧ حساب (٩٢٪ ثقة عالية)" },
      {
        label: "حسابات تحتاج مراجعة بشرية",
        value: "١٢ حساب — علامات تمييز لمراجعة المدقق",
      },
      { label: "وقت المعالجة", value: "أقل من دقيقتين" },
    ],
    badge: "بيانات تجريبية",
    note: "هذا مثال على مخرج فعلي من النظام بميزان مراجعة تجريبي. النتائج الفعلية تعتمد على جودة البيانات المدخلة.",
  },
  {
    id: "statement-output",
    category: "مسودة القوائم المالية",
    title: "مسودة قائمة المركز المالي",
    description:
      "النظام يُولّد مسودة القوائم المالية الأساسية بعد اعتماد توجيه الحسابات — للمراجعة البشرية الإلزامية.",
    fields: [
      {
        label: "القوائم المولَّدة",
        value: "المركز المالي · الدخل الشامل · التدفقات النقدية",
      },
      { label: "الإطار المحاسبي", value: "IFRS — قابل للتعديل" },
      { label: "حالة المسودة", value: "⚠ مسودة — لم تُعتمَد بعد" },
      {
        label: "البنود المرتبطة بأدلة",
        value: "٨٩٪ من البنود المادية لها دليل مصدر",
      },
      { label: "البنود تحتاج دليلًا", value: "٦ بنود — مُحددة للمعالجة" },
      { label: "آخر تحديث", value: "مرتبط بآخر اعتماد توجيه حسابات" },
    ],
    badge: "بيانات تجريبية",
    note: "مخرجات القوائم المالية دائمًا مسودات. لا يوجد اعتماد آلي — كل قرار بشري.",
  },
  {
    id: "audit-trail-output",
    category: "سجل التدقيق",
    title: "Audit Trail — سجل تدقيق ارتباط",
    description:
      "كل إجراء في الارتباط مسجّل بالتفصيل. هذا مثال على مقطع من سجل تدقيق ارتباط مكتمل.",
    fields: [
      { label: "المدة الزمنية", value: "٢٠٢٥-٠٣-١٥ → ٢٠٢٥-٠٤-٠٢" },
      { label: "إجمالي الأحداث المسجَّلة", value: "٢٤٧ حدث" },
      {
        label: "أنواع الأحداث",
        value: "رفع ملف · توجيه حساب · ملاحظة · اعتماد · رفض · نشر",
      },
      {
        label: "المستخدمون النشطون",
        value: "٤ مستخدمين (٢ مدقق · ١ مراجع · ١ شريك)",
      },
      {
        label: "بوابات الاعتماد المكتملة",
        value: "٥ / ٥ — جميع الشروط اكتملت",
      },
      { label: "حالة السجل", value: "مُقفَل — لا يمكن التعديل بعد النشر" },
    ],
    badge: "بيانات تجريبية",
    note: "السجل لا يُعدَّل ولا يُحذف بعد تسجيله. قابل للتصدير بصيغة JSON/XLSX مع كل حزمة ارتباط.",
  },
  {
    id: "finding-output",
    category: "الملاحظات والتوصيات",
    title: "نموذج ملاحظة مراجعة",
    description:
      "النظام يُصنّف الملاحظات ويتتبع دورة حياتها من الاكتشاف إلى التسوية والاعتماد.",
    fields: [
      { label: "رقم الملاحظة", value: "F-2025-0047" },
      { label: "التصنيف", value: "عالي الأهمية — يؤثر على صحة الإفصاح" },
      { label: "البند المتأثر", value: "الاحتياطيات — المركز المالي" },
      { label: "الحالة", value: "مُسوَّاة — موثقة بقرار وسبب" },
      { label: "من أنشأها", value: "المدقق المسؤول — ٢٠٢٥-٠٣-٢٢ الساعة ١٤:٣٠" },
      {
        label: "من اعتمدها",
        value: "الشريك المسؤول — ٢٠٢٥-٠٣-٢٨ الساعة ٠٩:١٥",
      },
    ],
    badge: "بيانات تجريبية",
    note: "كل ملاحظة مربوطة بالبند المصدر والدليل الداعم وتسلسل القرارات. لا يمكن إغلاق الملاحظة دون قرار موثق.",
  },
  {
    id: "package-output",
    category: "حزمة الارتباط النهائية",
    title: "حزمة الإغلاق — ما يُصدَّر",
    description:
      "عند اكتمال الارتباط واعتماده، يُصدَّر ملف حزمة يحتوي على كل مخرجات العمل والسجل الموثق.",
    fields: [
      {
        label: "القوائم المالية",
        value: "JSON + XLSX (PDF قيد التطوير للعربية)",
      },
      { label: "الإيضاحات", value: "XLSX مع ربط الأدلة" },
      { label: "سجل التدقيق", value: "JSON كامل — ٢٤٧ حدث" },
      {
        label: "ملخص الملاحظات",
        value: "XLSX — جميع الملاحظات بحالاتها وقراراتها",
      },
      { label: "تقرير الاعتماد", value: "من وافق ومتى على كل مرحلة" },
      { label: "Evidence Manifest", value: "قائمة بكل دليل ومرجعه في القوائم" },
    ],
    badge: "بيانات تجريبية",
    note: "الحزمة مصممة لتكون مرجعًا قانونيًا كاملًا. التصدير الحالي JSON/XLSX — تصدير PDF عربي سيكون متاحاً في مراحل لاحقة.",
  },
];

const assetCategories = [
  {
    name: "Pilot Planning",
    description: "قوالب تحديد النطاق، المعايير، المسؤوليات، وجدول التقييم.",
  },
  {
    name: "Evidence & Traceability",
    description: "نماذج ربط الأدلة، سلسلة التتبّع، و manifests المخرجات.",
  },
  {
    name: "Review & Approval",
    description: "قوالب مراجعة، اعتماد، وتوثيق القرارات عبر بوابات الحوكمة.",
  },
  {
    name: "Decision Outputs",
    description: "نماذج مذكرات القرار، تقارير Go/No-Go، وتوصيات التوسّع.",
  },
  {
    name: "Risk & Issues",
    description: "سجلات المخاطر، الملاحظات، وقرارات التسوية مع أثر أدلة.",
  },
  {
    name: "Product-Specific Samples",
    description:
      "أمثلة مخرجات لكل منتج — AuditOS، LocalContentOS، DecisionOS، Office AI.",
  },
];

const productAssets = [
  {
    product: "AuditOS",
    examples: [
      "trial balance → mapping → evidence chain → review notes → approval trail",
    ],
  },
  {
    product: "LocalContentOS",
    examples: [
      "supplier evidence checklist → local content report sample → issue/risk log",
    ],
  },
  {
    product: "DecisionOS",
    examples: [
      "decision memo → scenario comparison → risk register → recommendation review",
    ],
  },
  {
    product: "Office AI Assistant",
    examples: [
      "governed use case brief → internal knowledge review notes → acceptable-use checklist",
    ],
  },
];

const howToUseSteps = [
  {
    phase: "قبل الـ Pilot",
    detail:
      "استخدم قالب Pilot Scope Memo لتحديد النطاق، المعايير، والمسؤوليات قبل البدء.",
  },
  {
    phase: "أثناء الـ Pilot",
    detail:
      "جمّع الأدلة باستخدام Evidence Checklist، وسجّل الملاحظات والمخاطر مباشرة.",
  },
  {
    phase: "بعد الـ Pilot",
    detail:
      "استخدم Pilot Success Review و Decision Memo لتقييم النتائج واتخاذ قرار Go/No-Go.",
  },
];

const evidenceChainSteps = [
  { node: "المدخل", detail: "ميزان مراجعة العميل — CSV/XLSX" },
  { node: "الفحص", detail: "اتزان + اكتمال الحسابات" },
  { node: "التوجيه", detail: "IFRS mapping + اعتماد المدقق" },
  { node: "القائمة", detail: "مسودة مولَّدة آليًا" },
  { node: "الإيضاح", detail: "مسودة + تحديد النواقص" },
  { node: "الدليل", detail: "ربط كل بند بمستنده" },
  { node: "الملاحظة", detail: "اكتشاف + تصنيف + تسوية" },
  { node: "الاعتماد", detail: "بوابة ٥ شروط — شريك مسؤول" },
  { node: "الحزمة", detail: "تصدير كامل مع Audit Trail" },
];

export default function ProofLibraryPage() {
  return (
    <div className="min-h-screen bg-aqliya-deep" dir="rtl">
      {/* Hero */}
      <section className="hero-gradient py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
            مكتبة أصول الإثبات
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Proof Asset Library
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            ليست مكتبة قصص نجاح. هذه مكتبة أصول تساعدك على فهم ما يتم قياسه،
            توثيقه، ومراجعته خلال pilot محكوم — لكل منتجات AQLIYA.
          </p>
          <div className="mt-6 inline-block px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-amber-300 text-sm">
              جميع الأمثلة مبنية على بيانات تجريبية. لا تحتوي على بيانات عملاء
              حقيقيين.
            </p>
          </div>
        </div>
      </section>

      {/* What This Library Is / Is Not */}
      <section className="py-16 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              ما هذه المكتبة وما ليست
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card rounded-xl p-6">
                <p className="text-emerald-400 font-semibold text-sm mb-3">
                  ✓ هذه المكتبة
                </p>
                <ul className="space-y-2">
                  {[
                    "قوالب ونماذج مرجعية للتخطيط والتقييم",
                    "هياكل عينة للأدلة والمخرجات",
                    "أدوات توثيق المراجعة والاعتماد",
                    "أمثلة تشغيلية لكل منتج — على بيانات تجريبية",
                    "مواد مساعدة لفهم مسار الإثبات",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-slate-300 text-sm"
                    >
                      <span className="text-emerald-400 mt-0.5 shrink-0">
                        ✓
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card rounded-xl p-6">
                <p className="text-red-400/70 font-semibold text-sm mb-3">
                  ✗ هذه المكتبة ليست
                </p>
                <ul className="space-y-2">
                  {[
                    "قصص نجاح حقيقية أو دراسات حالة لعملاء",
                    "ادعاءات ROI أو نتائج مضمونة",
                    "شهادات امتثال أو اعتماد رسمي",
                    "بديلًا عن المراجعة المهنية أو الحكم البشري",
                    "ضمان نجاح pilot — النتائج تعتمد على جودة البيانات وسير العمل",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-slate-300 text-sm"
                    >
                      <span className="text-red-400/60 mt-0.5 shrink-0">✗</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Asset Categories */}
      <section className="section-gradient-dark py-16 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400 text-center">
            تصنيفات الأصول
          </p>
          <h2 className="text-2xl font-bold text-white mt-4 mb-10 text-center">
            فئات الأصول المرجعية
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {assetCategories.map((cat) => (
              <div key={cat.name} className="glass-card rounded-xl p-5">
                <p className="text-white font-semibold text-sm mb-2">
                  {cat.name}
                </p>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {cat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Evidence Chain */}
      <section className="py-16 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-lg font-semibold text-white mb-6 text-center">
            تسلسل الأدلة — من المدخل إلى الحزمة
          </h2>
          <div className="flex flex-wrap gap-2 justify-center items-center">
            {evidenceChainSteps.map((step, i) => (
              <div key={step.node} className="flex items-center gap-2">
                <div className="text-center">
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-3 py-2">
                    <p className="text-cyan-400 text-xs font-semibold">
                      {step.node}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {step.detail}
                    </p>
                  </div>
                </div>
                {i < evidenceChainSteps.length - 1 && (
                  <span className="text-slate-600 text-lg">←</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Proof Assets */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">
              أصول الإثبات الأساسية
            </p>
            <h2 className="text-2xl font-bold text-white mt-4 mb-3">
              نماذج مخرجات قابلة للمراجعة
            </h2>
            <p className="text-slate-400">
              أمثلة على ما يُنتجه النظام — كلها مبنية على بيانات تجريبية موثقة،
              قابلة للتحقق في الديمو
            </p>
          </div>
          <div className="space-y-8">
            {outputExamples.map((ex) => (
              <div
                key={ex.id}
                className="glass-card rounded-2xl overflow-hidden"
              >
                <div className="p-8 border-b border-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">
                      {ex.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {ex.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {ex.title}
                  </h3>
                  <p className="text-slate-300">{ex.description}</p>
                </div>

                <div className="p-8 border-b border-white/5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ex.fields.map((f) => (
                      <div key={f.label} className="bg-white/5 rounded-lg p-3">
                        <p className="text-slate-500 text-xs mb-1">{f.label}</p>
                        <p className="text-white text-sm font-medium">
                          {f.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-8 py-4 bg-white/2">
                  <p className="text-slate-400 text-sm">
                    <span className="font-medium text-slate-300">ملاحظة: </span>
                    {ex.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product-Specific Asset Examples */}
      <section className="section-gradient-dark py-20 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400 text-center">
            أصول حسب المنتج
          </p>
          <h2 className="text-2xl font-bold text-white mt-4 mb-4 text-center">
            أمثلة أصول لكل منتج
          </h2>
          <p className="text-slate-400 text-center mb-10 max-w-2xl mx-auto">
            كل منتج له مسار إثبات وأصول خاصة به. هذه أمثلة تشغيلية على ما يتم
            توثيقه في pilot نموذجي.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {productAssets.map((pa) => (
              <div key={pa.product} className="glass-card rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-3">
                  {pa.product}
                </h3>
                <ul className="space-y-2">
                  {pa.examples.map((ex, i) => (
                    <li key={i} className="flex gap-3 text-slate-300 text-sm">
                      <span className="text-cyan-400 mt-0.5 shrink-0">◈</span>
                      <span className="leading-relaxed">{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Access / Download Boundary */}
      <section className="py-16 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-3xl mx-auto glass-card rounded-xl p-6 border border-amber-500/10">
            <p className="text-sm font-semibold text-amber-400 mb-3">
              حدود الوصول والتحميل
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">
              الأصول المعروضة هنا مرجعية/وصفية. يتم توفير النسخ التشغيلية
              الفعلية (قوالب، نماذج، تقارير) ضمن pilot أو engagement محدد بعد
              الاتفاق على النطاق والمعايير.
            </p>
            <p className="text-slate-500 text-xs mt-3">
              لا توجد ملفات تحميل عامة في هذه المرحلة. جميع الأمثلة معروضة كمرجع
              فقط.
            </p>
          </div>
        </div>
      </section>

      {/* How to Use These Assets */}
      <section className="py-16 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400 text-center">
            دليل الاستخدام
          </p>
          <h2 className="text-2xl font-bold text-white mt-4 mb-10 text-center">
            كيف تستخدم هذه الأصول؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {howToUseSteps.map((s) => (
              <div key={s.phase} className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 shrink-0" />
                  <p className="text-white font-semibold text-sm">{s.phase}</p>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {s.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-gradient-dark py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-3">
              ابدأ بإطار إثبات واضح قبل أن تطلب التوسّع
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              المكتبة مرجع. الـ pilot هو الإثبات. ابدأ بجلسة تشخيص لتحديد النطاق
              والمعايير.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/contact"
                className="btn-primary px-8 py-3 rounded-xl text-sm font-medium"
                data-event="click_request_pilot_review"
              >
                طلب جلسة تشخيص ←
              </Link>
              <Link
                href="/executive-brief"
                className="btn-outline px-8 py-3 rounded-xl text-sm font-medium"
                data-event="click_read_executive_brief"
              >
                الإحاطة التنفيذية
              </Link>
              <Link
                href="/pilot-proof"
                className="btn-outline px-8 py-3 rounded-xl text-sm font-medium"
                data-event="click_view_pilot_proof"
              >
                إطار إثبات الـ Pilot
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
