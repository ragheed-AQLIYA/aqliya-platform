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
      { label: "حسابات تحتاج مراجعة بشرية", value: "١٢ حساب — علامات تمييز لمراجعة المدقق" },
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
      { label: "القوائم المولَّدة", value: "المركز المالي · الدخل الشامل · التدفقات النقدية" },
      { label: "الإطار المحاسبي", value: "IFRS — قابل للتعديل" },
      { label: "حالة المسودة", value: "⚠ مسودة — لم تُعتمَد بعد" },
      { label: "البنود المرتبطة بأدلة", value: "٨٩٪ من البنود المادية لها دليل مصدر" },
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
      { label: "أنواع الأحداث", value: "رفع ملف · توجيه حساب · ملاحظة · اعتماد · رفض · نشر" },
      { label: "المستخدمون النشطون", value: "٤ مستخدمين (٢ مدقق · ١ مراجع · ١ شريك)" },
      { label: "بوابات الاعتماد المكتملة", value: "٥ / ٥ — جميع الشروط اكتملت" },
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
      { label: "من اعتمدها", value: "الشريك المسؤول — ٢٠٢٥-٠٣-٢٨ الساعة ٠٩:١٥" },
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
      { label: "القوائم المالية", value: "JSON + XLSX (PDF قيد التطوير للعربية)" },
      { label: "الإيضاحات", value: "XLSX مع ربط الأدلة" },
      { label: "سجل التدقيق", value: "JSON كامل — ٢٤٧ حدث" },
      { label: "ملخص الملاحظات", value: "XLSX — جميع الملاحظات بحالاتها وقراراتها" },
      { label: "تقرير الاعتماد", value: "من وافق ومتى على كل مرحلة" },
      { label: "Evidence Manifest", value: "قائمة بكل دليل ومرجعه في القوائم" },
    ],
    badge: "بيانات تجريبية",
    note: "الحزمة مصممة لتكون مرجعًا قانونيًا كاملًا. التصدير الحالي JSON/XLSX — تصدير PDF عربي سيكون متاحاً في مراحل لاحقة.",
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
    <div className="min-h-screen bg-[var(--aqliya-deep)]" dir="rtl">
      {/* Hero */}
      <section className="hero-gradient py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
            مكتبة الإثبات
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            المخرجات الفعلية للنظام
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            أمثلة على ما يُنتجه AuditOS — مبنية على بيانات تجريبية موثقة.
            كل مثال يعكس قدرة حقيقية يمكن التحقق منها في الديمو.
          </p>
          <div className="mt-6 inline-block px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-amber-300 text-sm">
              جميع الأمثلة مبنية على بيانات تجريبية. لا تحتوي على بيانات عملاء حقيقيين.
            </p>
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
                    <p className="text-cyan-400 text-xs font-semibold">{step.node}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{step.detail}</p>
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

      {/* Output Examples */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6 space-y-8">
          {outputExamples.map((ex) => (
            <div key={ex.id} className="glass-card rounded-2xl overflow-hidden">
              <div className="p-8 border-b border-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">{ex.category}</span>
                  <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {ex.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{ex.title}</h3>
                <p className="text-slate-300">{ex.description}</p>
              </div>

              <div className="p-8 border-b border-white/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ex.fields.map((f) => (
                    <div key={f.label} className="bg-white/5 rounded-lg p-3">
                      <p className="text-slate-500 text-xs mb-1">{f.label}</p>
                      <p className="text-white text-sm font-medium">{f.value}</p>
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
      </section>

      {/* CTA */}
      <section className="section-gradient-dark py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            شاهد هذه المخرجات في الديمو الحي
          </h2>
          <p className="text-slate-300 mb-8 leading-relaxed">
            في الديمو التفاعلي، ستمر بكل خطوة وتشاهد هذه المخرجات تتولد في الوقت الفعلي
            على ميزان مراجعة تجريبي.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/demo" className="btn-primary px-8 py-3 rounded-xl text-sm font-medium">
              مشاهدة الديمو التفاعلي
            </Link>
            <Link href="/pilot-proof" className="btn-outline px-8 py-3 rounded-xl text-sm font-medium">
              دليل البايلوت
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
