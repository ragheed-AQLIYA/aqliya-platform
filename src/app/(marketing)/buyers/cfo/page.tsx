import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "للمدير المالي CFO | AQLIYA",
  description:
    "ما يهم المدير المالي: حوكمة قابلة للتدقيق، توثيق القرارات المالية، وتقليص وقت إعداد القوائم دون المساومة على الجودة.",
};

const concerns = [
  {
    fear: "قرارات مالية بلا أثر موثق",
    response:
      "كل قرار مالي في AuditOS مسجّل بالمستخدم والوقت والسبب — من وافق على ماذا ومتى. سجل غير قابل للتعديل.",
  },
  {
    fear: "إعداد القوائم يستغرق أسابيع",
    response:
      "بعد اعتماد توجيه الحسابات، مسودة القوائم المالية تُولَّد خلال دقائق — للمراجعة البشرية الإلزامية لا للاعتماد الآلي.",
  },
  {
    fear: "صعوبة الدفاع عن القوائم أمام المراجع الخارجي",
    response:
      "كل رقم في القوائم مرتبط بمصدره: الحساب ← القرار ← الدليل ← المعتمد. حزمة ارتباط كاملة قابلة للتسليم للمراجع.",
  },
  {
    fear: "الاعتماد على الفرد — ماذا لو غادر الشخص الرئيسي؟",
    response:
      "المنهجية مدمجة في سير العمل — لا تعتمد على ذاكرة فرد. الارتباط يبقى موثقًا بالكامل بغض النظر عن تغييرات الفريق.",
  },
];

const outputs = [
  {
    label: "مسودة القوائم المالية",
    detail: "مركز مالي · دخل شامل · تدفقات نقدية — مولَّدة بعد اعتماد التوجيه",
  },
  { label: "سجل قرارات التوجيه", detail: "كل حساب: من وجّهه، متى، وبأي سلطة" },
  {
    label: "تقرير الاعتماد",
    detail: "سلسلة موافقات كاملة — من المدقق إلى الشريك",
  },
  { label: "Evidence Manifest", detail: "ربط كل بند مادي بدليله الداعم" },
  {
    label: "Audit Trail الكامل",
    detail: "٢٤٧+ حدث مسجّل — قابل للتصدير JSON/XLSX",
  },
];

const nextSteps = [
  {
    step: "١",
    label: "جلسة تنفيذية",
    detail: "٤٥ دقيقة — عرض المنهجية وتقييم الملاءمة",
  },
  {
    step: "٢",
    label: "ديمو موجَّه",
    detail: "مشاهدة سير العمل على ميزان مراجعة تجريبي",
  },
  {
    step: "٣",
    label: "بايلوت تقييمي",
    detail: "٢-٤ أسابيع — ارتباط فعلي محدود النطاق",
  },
];

export default function BuyerCFOPage() {
  return (
    <div className="min-h-screen bg-aqliya-deep" dir="rtl">
      {/* Hero */}
      <section className="hero-gradient py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
            للمدير المالي — CFO
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight max-w-3xl">
            حوكمة مالية قابلة للدفاع عنها — لا قوائم جميلة فقط
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">
            المدير المالي لا يحتاج أداة ذكاء اصطناعي جديدة. يحتاج منظومة توثيق
            تجعل كل قرار مالي قابلًا للتحقق والدفاع والتدقيق.
          </p>
        </div>
      </section>

      {/* Core Problem */}
      <section className="py-16 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">
              المشكلة التي نعالجها
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "القوائم المالية تُعدّ يدويًا في Excel — ساعات لكل تعديل",
                "قرارات التوجيه والتصنيف غير موثقة رسميًا",
                "صعوبة الإجابة على &ldquo;من قرر هذا ولماذا&rdquo; أمام المراجع",
                "الاعتماد على أفراد بعينهم لإعادة إنتاج العمل",
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-red-400 mt-0.5 shrink-0">✕</span>
                  <p
                    className="text-slate-300 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: item }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Concerns & Responses */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">
            الأسئلة التي نسمعها من المديرين الماليين
          </h2>
          <div className="space-y-6">
            {concerns.map((c, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/5">
                  <div className="flex gap-3 items-start">
                    <span className="text-amber-400 text-sm mt-0.5 shrink-0">
                      ؟
                    </span>
                    <p className="text-white font-medium">{c.fear}</p>
                  </div>
                </div>
                <div className="p-6 bg-cyan-500/3">
                  <div className="flex gap-3 items-start">
                    <span className="text-cyan-400 text-sm mt-0.5 shrink-0">
                      ◈
                    </span>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {c.response}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outputs */}
      <section className="section-gradient-dark py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            ما تحصل عليه
          </h2>
          <p className="text-slate-400 text-center mb-10">
            مخرجات موثقة لكل ارتباط — لا تقارير تزيينية
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outputs.map((o) => (
              <div key={o.label} className="glass-card rounded-xl p-5">
                <p className="text-white font-medium text-sm mb-1.5">
                  {o.label}
                </p>
                <p className="text-slate-400 text-sm">{o.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principle */}
      <section className="py-16 border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-2xl font-bold text-white leading-relaxed">
            الذكاء يساعد. الإنسان يقرر. الدليل يحكم.
          </p>
          <p className="text-slate-400 mt-4">
            لا قرار مالي آلي — كل اقتراح يمر بمراجعة وموافقة بشرية قبل الاعتماد.
          </p>
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">
            الخطوة التالية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nextSteps.map((ns) => (
              <div
                key={ns.step}
                className="glass-card rounded-xl p-6 text-center"
              >
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-cyan-400 font-bold text-sm">
                    {ns.step}
                  </span>
                </div>
                <h3 className="text-white font-semibold mb-2">{ns.label}</h3>
                <p className="text-slate-400 text-sm">{ns.detail}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-10">
            <Link
              href="/contact"
              className="btn-primary px-8 py-3 rounded-xl text-sm font-medium"
            >
              طلب جلسة تنفيذية
            </Link>
            <Link
              href="/demo"
              className="btn-outline px-8 py-3 rounded-xl text-sm font-medium"
            >
              مشاهدة الديمو
            </Link>
          </div>
        </div>
      </section>

      {/* Peer Buyers */}
      <section className="py-12 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm mb-4">صفحات مخصصة لأدوار أخرى</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/buyers/cio"
              className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
            >
              مدير تقنية المعلومات
            </Link>
            <span className="text-slate-600">·</span>
            <Link
              href="/buyers/audit-partner"
              className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
            >
              شريك التدقيق
            </Link>
            <span className="text-slate-600">·</span>
            <Link
              href="/buyers/government"
              className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
            >
              الجهات الحكومية
            </Link>
            <span className="text-slate-600">·</span>
            <Link
              href="/buyers/procurement"
              className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
            >
              المشتريات والعقود
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
