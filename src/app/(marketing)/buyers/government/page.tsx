import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "للجهات الحكومية | AQLIYA",
  description:
    "ما يهم الجهات الحكومية: سيادة البيانات، إقامة البيانات على الخوادم السعودية، حوكمة القرار، توثيق قابل للمساءلة، والتوافق مع متطلبات رؤية 2030.",
};

const govPriorities = [
  {
    icon: "⊡",
    title: "سيادة البيانات",
    body: "البيانات لا تغادر البنية التحتية المحددة. نموذج Cloud Managed Deployment على خوادم بمواصفات متفق عليها. مسار Private Deployment قيد التخطيط.",
  },
  {
    icon: "◈",
    title: "حوكمة القرار والمساءلة",
    body: "كل قرار مسجّل: من اتخذه، متى، وبأي سلطة. لا قرار آلي — الإنسان المختص يعتمد. سجل لا يُعدَّل.",
  },
  {
    icon: "⊞",
    title: "الكفاءة في إطار المساءلة",
    body: "أتمتة الجوانب المتكررة دون التفريط في الحوكمة. التوثيق آني — لا إعادة بناء للملفات لاحقًا.",
  },
  {
    icon: "⊛",
    title: "اللغة العربية أولًا",
    body: "واجهة عربية RTL كاملة. مصطلحات عربية في سير العمل. دعم المحتوى العربي في جميع المراحل.",
  },
];

const concerns = [
  {
    fear: "بياناتنا حساسة — أين تُخزَّن؟",
    response:
      "في نموذج Cloud Managed Deployment، البيانات على خوادم محددة بمواصفات متفق عليها مسبقًا. نموذج Private Cloud/On-Premises لجهات الحكومة الحساسة قيد التخطيط — نتشاور معك على المتطلبات.",
  },
  {
    fear: "هل هناك شهادات أمنية؟",
    response:
      "نحن في مرحلة Pilot-ready. لا ندّعي SOC2 أو ISO في هذه المرحلة. المراجعة الأمنية الخارجية واحدة من متطلبات ما قبل الإنتاج. نوفر الوثائق التقنية للمراجعة قبل القرار.",
  },
  {
    fear: "كيف يتوافق مع رؤية 2030 ومتطلبات التحول الرقمي؟",
    response:
      "AQLIYA مبنية على مبدأ أن الذكاء الاصطناعي يُعزز القرار البشري لا يستبدله. توثيق المساءلة والحوكمة المؤسسية متوافقان مع متطلبات التحول الرقمي الحكومي.",
  },
  {
    fear: "هل النظام مرخّص ومصادق عليه في السعودية؟",
    response:
      "AQLIYA شركة سعودية. العمليات في المملكة. متطلبات الترخيص الرسمي تُحدَّد حسب طبيعة كل جهة وطبيعة البيانات. نتشاور مع الجهة على المتطلبات في الجلسة التنفيذية.",
  },
];

const useCaseGov = [
  {
    title: "وحدات المراجعة الداخلية",
    detail: "توثيق إجراءات المراجعة، سجل القرارات، بوابة اعتماد المسؤول",
  },
  {
    title: "إدارات المالية الحكومية",
    detail: "إعداد القوائم المالية السنوية، ربط الأدلة، مسار الاعتماد الرسمي",
  },
  {
    title: "هيئات الرقابة والإشراف",
    detail: "سير عمل مراجعة الجهات الخاضعة للرقابة، توثيق الاستجواب والقرار",
  },
  {
    title: "الصناديق والمؤسسات الحكومية",
    detail: "إدارة ارتباطات تدقيق متعددة، Audit Trail للتقارير الدورية",
  },
];

export default function BuyerGovernmentPage() {
  return (
    <div className="min-h-screen bg-aqliya-deep" dir="rtl">
      {/* Hero */}
      <section className="hero-gradient py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
            للجهات الحكومية
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight max-w-3xl">
            حوكمة مؤسسية لمتطلبات القطاع الحكومي
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">
            سيادة البيانات، توثيق المساءلة، وسير عمل مراجعة موثوق — مبني على
            مبدأ أن القرار البشري المختص هو السلطة النهائية.
          </p>
        </div>
      </section>

      {/* Gov Priorities */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {govPriorities.map((v) => (
              <div key={v.title} className="glass-card rounded-xl p-6">
                <div className="flex gap-4 items-start">
                  <span className="text-cyan-400 text-xl mt-0.5">{v.icon}</span>
                  <div>
                    <h3 className="text-white font-semibold mb-2">{v.title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {v.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="section-gradient-dark py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            حالات الاستخدام الحكومية
          </h2>
          <p className="text-slate-400 text-center mb-10">
            القطاعات التي تستفيد من منهجية AQLIYA
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {useCaseGov.map((uc) => (
              <div key={uc.title} className="glass-card rounded-xl p-6">
                <h3 className="text-white font-semibold mb-2">{uc.title}</h3>
                <p className="text-slate-400 text-sm">{uc.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Concerns */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">
            الأسئلة الحكومية الشائعة
          </h2>
          <div className="space-y-5">
            {concerns.map((c, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <div className="p-5 border-b border-white/5">
                  <p className="text-white font-medium text-sm">{c.fear}</p>
                </div>
                <div className="p-5">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {c.response}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-gradient-dark py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ابدأ بجلسة استشارية مخصصة
          </h2>
          <p className="text-slate-300 mb-8">
            للجهات الحكومية، الجلسة الأولى استشارية بالكامل — نفهم متطلباتكم
            ونقيّم الملاءمة قبل أي التزام.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact"
              className="btn-primary px-8 py-3 rounded-xl text-sm font-medium"
            >
              طلب جلسة استشارية
            </Link>
            <Link
              href="/executive-brief"
              className="btn-outline px-8 py-3 rounded-xl text-sm font-medium"
            >
              الإحاطة التنفيذية
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
              href="/buyers/cfo"
              className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
            >
              المدير المالي
            </Link>
            <span className="text-slate-600">·</span>
            <Link
              href="/buyers/cio"
              className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
            >
              مدير التقنية
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
              href="/buyers/procurement"
              className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
            >
              المشتريات
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
