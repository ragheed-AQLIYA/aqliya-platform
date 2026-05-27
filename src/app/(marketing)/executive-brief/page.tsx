import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "الإحاطة التنفيذية | AQLIYA",
  description:
    "ملخص تنفيذي قابل للقراءة: ما هي AQLIYA، لماذا تهم، المنصة الأساسية، نموذج الحوكمة، نماذج النشر، حالات الاستخدام، ولماذا الوقت مناسب الآن.",
};

const platformLayers = [
  {
    name: "AQLIYA Intelligence Core",
    description:
      "الطبقة الأساسية المشتركة بين جميع المنتجات — AI Orchestration، Governance Engine، Evidence Graph، RBAC، Audit Logs، Document Intelligence.",
    role: "الأساس",
  },
  {
    name: "AuditOS",
    description:
      "نظام سير عمل التدقيق المالي — من ميزان المراجعة إلى حزمة الارتباط. L5: Pilot-ready.",
    role: "المنتج الرئيسي",
  },
  {
    name: "DecisionOS",
    description:
      "توثيق القرارات المؤسسية — سياق + بدائل + أدلة + اعتماد + Audit Trail. L4: Usable v0.1.",
    role: "المنتج الثاني",
  },
  {
    name: "LocalContentOS",
    description:
      "إدارة محتوى العمالة والمقاولين وفق متطلبات نظام المحتوى المحلي. قيد التطوير التسويقي — اطلب إحاطة للمسار.",
    role: "استراتيجي",
  },
];

const governanceModel = [
  {
    principle: "الذكاء يساعد",
    detail:
      "كل مخرج AI هو مسودة. لا قرار آلي نهائي. النظام يقترح — الإنسان يقرر.",
  },
  {
    principle: "الإنسان يقرر",
    detail: "Human Gates تمنع الاعتماد قبل اكتمال الشروط البشرية المطلوبة.",
  },
  {
    principle: "الدليل يحكم",
    detail: "Evidence Graph يربط كل قرار بمصدره. Audit Trail يوثق كل إجراء.",
  },
];

const deploymentModels = [
  {
    name: "Cloud Managed",
    status: "متاح — النموذج الافتراضي",
    suitable: "مكاتب التدقيق، شركات القطاع الخاص",
    statusColor: "text-emerald-400",
  },
  {
    name: "Private Cloud",
    status: "قيد التخطيط",
    suitable: "المؤسسات ذات متطلبات خصوصية البيانات",
    statusColor: "text-amber-400",
  },
  {
    name: "On-Premises / Air-Gapped",
    status: "قيد الدراسة — غير متاح حاليًا",
    suitable: "الجهات الحكومية ذات أعلى متطلبات الأمن",
    statusColor: "text-slate-500",
  },
];

const useCases = [
  {
    sector: "مكاتب التدقيق والمحاسبة",
    value:
      "تنظيم سير العمل من الميزان إلى التقرير، توثيق القرارات، سرعة الإنجاز",
  },
  {
    sector: "المراجعة الداخلية المؤسسية",
    value: "سجل قانوني قابل للتدقيق، فصل الأدوار، حزمة ارتباط للجهات الرقابية",
  },
  {
    sector: "إدارات المالية الحكومية",
    value:
      "إعداد القوائم السنوية، توثيق مسار الاعتماد، استعداد للتدقيق الخارجي",
  },
  {
    sector: "القطاع المصرفي والمالي",
    value: "حوكمة القرار المالي، Audit Trail للمعاملات الكبرى، توثيق الامتثال",
  },
  {
    sector: "الشركات الكبرى والمؤسسات",
    value:
      "إدارة قرارات متعددة المستويات، ذاكرة مؤسسية، تقليص اعتماد القرار على الفرد",
  },
];

const whyNow = [
  {
    driver: "تصاعد متطلبات الحوكمة",
    detail:
      "رؤية 2030 ومتطلبات هيئة السوق المالية والرقابة المؤسسية تستلزم توثيق القرار لا فقط نتيجته.",
  },
  {
    driver: "نضج الذكاء الاصطناعي في البيئة المؤسسية",
    detail:
      "المؤسسات تبحث عن أدوات AI تخدم الحوكمة لا تتجاوزها. النموذج الحالي يُجيب على هذا بدقة.",
  },
  {
    driver: "الفجوة في أدوات سير العمل الموثقة",
    detail:
      "Excel + WhatsApp + Email ليست منظومة حوكمة. لا يوجد بديل عربي-أول مبني على الأدلة.",
  },
  {
    driver: "التكلفة الحقيقية لغياب التوثيق",
    detail:
      "قرارات بلا أثر = اعتماد على ذاكرة الأفراد = خطر على المؤسسة عند تغيير الفريق أو الطعن في القرار.",
  },
];

const currentStatus = {
  readinessGate: "Pilot-ready (L5) — مرشح لبيئة بايلوت تقييمي",
  availableNow: [
    "AuditOS — Pilot-ready",
    "DecisionOS — Usable v0.1",
    "سير عمل كامل على بيانات فعلية",
  ],
  notYet: [
    "شهادات SOC2 أو ISO",
    "نشر On-Premises أو Air-Gapped",
    "تكامل ERP خارجي",
    "Client Portal",
  ],
};

export default function ExecutiveBriefPage() {
  return (
    <div className="min-h-screen bg-aqliya-deep" dir="rtl">
      {/* Hero */}
      <section className="hero-gradient py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
            الإحاطة التنفيذية
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            AQLIYA — منصة الذكاء المؤسسي المحكوم
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            ملخص تنفيذي للرؤساء التنفيذيين، مدراء التقنية، وصناع القرار: ما هي
            AQLIYA، لماذا تهم مؤسستك اليوم، وما الجاهز للتجربة.
          </p>
        </div>
      </section>

      {/* Trust Principle */}
      <section className="py-14 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-2xl md:text-3xl font-bold text-white mb-3 leading-snug">
            الذكاء يساعد. الإنسان يقرر. الدليل يحكم.
          </p>
          <p className="text-cyan-400/80 text-base">
            AI Assists. Humans Decide. Evidence Governs.
          </p>
          <p className="text-slate-400 text-sm mt-4 max-w-2xl mx-auto">
            هذا المبدأ يركّز كل منتج وكل قرار وكل مخرج على المنصة. ليس شعارًا —
            هو بنية الحوكمة الأساسية.
          </p>
        </div>
      </section>

      {/* What is AQLIYA + Is/Is Not */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-6">ما هي AQLIYA</h2>
          <div className="glass-card rounded-2xl p-8">
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              AQLIYA منصة ذكاء اصطناعي مؤسسية مبنية على مبدأ أن{" "}
              <span className="text-white font-semibold">
                الذكاء يساعد، الإنسان يقرر، والدليل يحكم
              </span>
              . ليست أداة إنتاجية عامة — هي منظومة تُنظّم سير عمل القرار المؤسسي
              بحوكمة كاملة وأثر موثق.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
              <div>
                <p className="text-emerald-400 font-semibold text-sm mb-3">
                  ✓ AQLIYA هي
                </p>
                <ul className="space-y-2">
                  <li className="flex gap-3 text-slate-300 text-sm">
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    <span>
                      منصة ذكاء مؤسسي خاص ومحكوم — تبني أنظمة تشغيلية فوق نواة
                      حوكمة وأدلة وسجل تدقيق
                    </span>
                  </li>
                  <li className="flex gap-3 text-slate-300 text-sm">
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    <span>
                      بيئة تنظيم سير عمل القرار المؤسسي من المدخل إلى المخرج مع
                      توثيق كامل
                    </span>
                  </li>
                  <li className="flex gap-3 text-slate-300 text-sm">
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    <span>
                      نظام متعدد المنتجات — AuditOS، DecisionOS، وغيرها — يشترك
                      في نواة واحدة
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-red-400/70 font-semibold text-sm mb-3">
                  ✗ AQLIYA ليست
                </p>
                <ul className="space-y-2">
                  <li className="flex gap-3 text-slate-300 text-sm">
                    <span className="text-red-400/60 mt-0.5 shrink-0">✗</span>
                    <span>
                      أداة إنتاجية عامة أو شات بوت — بل منظومة حوكمة مؤسسية
                      متكاملة
                    </span>
                  </li>
                  <li className="flex gap-3 text-slate-300 text-sm">
                    <span className="text-red-400/60 mt-0.5 shrink-0">✗</span>
                    <span>
                      بديلًا عن الحكم البشري — الذكاء يقترح، الإنسان يقرر، لا
                      استثناءات
                    </span>
                  </li>
                  <li className="flex gap-3 text-slate-300 text-sm">
                    <span className="text-red-400/60 mt-0.5 shrink-0">✗</span>
                    <span>
                      SaaS فقط — صُممت للسحابة والخاص معًا، والخاص قيد التخطيط
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <p className="text-slate-400 text-sm">
                <span className="text-cyan-400 font-semibold">
                  الجمهور المستهدف:{" "}
                </span>
                مكاتب التدقيق، المراجعة الداخلية، المالية المؤسسية، الجهات
                الحكومية.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            المنصة الأساسية
          </h2>
          <div className="space-y-4">
            {platformLayers.map((layer) => (
              <div
                key={layer.name}
                className="glass-card rounded-xl p-6 flex gap-6 items-start"
              >
                <span className="text-xs font-medium text-slate-500 bg-white/5 px-2.5 py-1 rounded mt-0.5 shrink-0 whitespace-nowrap">
                  {layer.role}
                </span>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    {layer.name}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {layer.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 glass-card rounded-xl p-5 border border-cyan-500/10 text-center">
            <p className="text-slate-300 text-sm">
              <span className="text-cyan-400 font-semibold">
                أول منتج مُثبت:{" "}
              </span>
              AuditOS — مسار عمل محكوم لإعداد وعرض ومراجعة التقارير المالية.{" "}
              <Link
                href="/products/audit"
                className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300 transition-colors"
              >
                عرض الصفحة التعريفية ←
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            AQLIYA مقابل البدائل
          </h2>
          <p className="text-slate-400 text-center mb-10 max-w-2xl mx-auto">
            لماذا لا تكفي الأدوات الحالية، وماذا يضيف نهج المنصة المحكوم
          </p>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="text-right px-5 py-3 text-slate-400 font-medium">
                    البعد
                  </th>
                  <th className="text-right px-5 py-3 text-slate-400 font-medium">
                    Excel / بريد
                  </th>
                  <th className="text-right px-5 py-3 text-slate-400 font-medium">
                    ChatGPT عام
                  </th>
                  <th className="text-right px-5 py-3 text-cyan-400 font-medium">
                    AQLIYA
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="px-5 py-3.5 text-white font-medium whitespace-nowrap">
                    حوكمة سير العمل
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">❌ غير موجودة</td>
                  <td className="px-5 py-3.5 text-slate-400">❌ غير موجودة</td>
                  <td className="px-5 py-3.5 text-emerald-400">
                    ✓ مسار محكوم كامل
                  </td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="px-5 py-3.5 text-white font-medium whitespace-nowrap">
                    أدلة وقرارات
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">❌ غير مرتبطة</td>
                  <td className="px-5 py-3.5 text-slate-400">❌ لا توجد</td>
                  <td className="px-5 py-3.5 text-emerald-400">
                    ✓ مرتبطة بمصدرها
                  </td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="px-5 py-3.5 text-white font-medium whitespace-nowrap">
                    سجل تدقيق
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">❌ غير موثق</td>
                  <td className="px-5 py-3.5 text-slate-400">❌ غير موجود</td>
                  <td className="px-5 py-3.5 text-emerald-400">
                    ✓ كل إجراء مسجّل
                  </td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="px-5 py-3.5 text-white font-medium whitespace-nowrap">
                    فصل الأدوار
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">❌ صلاحيات ملف</td>
                  <td className="px-5 py-3.5 text-slate-400">❌ حساب واحد</td>
                  <td className="px-5 py-3.5 text-emerald-400">✓ RBAC كامل</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="px-5 py-3.5 text-white font-medium whitespace-nowrap">
                    الذكاء المساعد
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">❌ غير موجود</td>
                  <td className="px-5 py-3.5 text-slate-400">⚠️ غير محكوم</td>
                  <td className="px-5 py-3.5 text-emerald-400">
                    ✓ يقترح + يراجع
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-3.5 text-white font-medium whitespace-nowrap">
                    توفر عربي-أول
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">⚠️ واجهة عربية</td>
                  <td className="px-5 py-3.5 text-slate-400">
                    ⚠️ يدعم العربية
                  </td>
                  <td className="px-5 py-3.5 text-emerald-400">
                    ✓ مصمم للعربية
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-slate-500 text-xs text-center mt-4">
            AQLIYA لا ينافس Excel كآلة حساب أو ChatGPT ككاتب نصوص — يوفر طبقة
            حوكمة لا يقدمها أي منهما.
          </p>
        </div>
      </section>

      {/* Governance */}
      <section className="section-gradient-dark py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            نموذج الحوكمة
          </h2>
          <p className="text-slate-400 text-center mb-10">
            المبدأ الأساسي الذي يحكم كل منتج وكل قرار في المنصة
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {governanceModel.map((g) => (
              <div
                key={g.principle}
                className="glass-card rounded-xl p-6 text-center"
              >
                <h3 className="text-2xl font-bold text-white mb-3">
                  {g.principle}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {g.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deployment */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-6">نماذج النشر</h2>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="text-right px-6 py-3 text-slate-400 font-medium">
                    النموذج
                  </th>
                  <th className="text-right px-6 py-3 text-slate-400 font-medium">
                    الحالة
                  </th>
                  <th className="text-right px-6 py-3 text-slate-400 font-medium">
                    المناسب لـ
                  </th>
                </tr>
              </thead>
              <tbody>
                {deploymentModels.map((dm) => (
                  <tr key={dm.name} className="border-b border-white/5">
                    <td className="px-6 py-4 text-white font-medium">
                      {dm.name}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-medium ${dm.statusColor}`}
                    >
                      {dm.status}
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm">
                      {dm.suitable}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            حالات الاستخدام
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {useCases.map((uc) => (
              <div key={uc.sector} className="glass-card rounded-xl p-5">
                <h3 className="text-white font-semibold text-sm mb-1.5">
                  {uc.sector}
                </h3>
                <p className="text-slate-400 text-sm">{uc.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Now */}
      <section className="section-gradient-dark py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">
            لماذا الآن
          </h2>
          <div className="space-y-5">
            {whyNow.map((w) => (
              <div
                key={w.driver}
                className="glass-card rounded-xl p-6 flex gap-4 items-start"
              >
                <span className="text-cyan-400 text-lg mt-0.5 shrink-0">◈</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">{w.driver}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {w.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Status */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-6">الحالة الراهنة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-emerald-400 font-semibold mb-4">متاح الآن</h3>
              <ul className="space-y-2">
                {currentStatus.availableNow.map((item) => (
                  <li key={item} className="flex gap-3 text-slate-300 text-sm">
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card rounded-xl p-6 border border-amber-500/10">
              <h3 className="text-amber-400 font-semibold mb-4">
                غير متاح في هذه المرحلة
              </h3>
              <ul className="space-y-2">
                {currentStatus.notYet.map((item) => (
                  <li key={item} className="flex gap-3 text-slate-300 text-sm">
                    <span className="text-slate-600 mt-0.5 shrink-0">⊘</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 glass-card rounded-xl p-5 border border-cyan-500/10 text-center">
            <p className="text-slate-300 text-sm">
              <span className="text-cyan-400 font-semibold">
                بوابة الجاهزية:{" "}
              </span>
              {currentStatus.readinessGate}
            </p>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-3 text-center">
            ابدأ الآن — في ثلاث خطوات
          </h2>
          <p className="text-slate-400 text-center mb-10 max-w-xl mx-auto">
            مسار مباشر من المشاهدة إلى التقييم على بياناتك الحقيقية
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-xl p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-cyan-400 font-bold text-sm">١</span>
              </div>
              <h3 className="text-white font-semibold mb-2">
                شاهد الديمو التفاعلي
              </h3>
              <p className="text-slate-400 text-sm mb-5">
                ١٠ دقائق — اختبر AuditOS على بيانات تجريبية
              </p>
              <Link
                href="/auditos"
                className="btn-outline block w-full py-2.5 rounded-xl text-sm font-medium text-center"
                data-event="click_view_demo"
              >
                مشاهدة الديمو
              </Link>
            </div>
            <div className="glass-card rounded-xl p-6 text-center border border-cyan-500/20">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-cyan-400 font-bold text-sm">٢</span>
              </div>
              <h3 className="text-white font-semibold mb-2">
                جلسة تنفيذية مخصصة
              </h3>
              <p className="text-slate-400 text-sm mb-5">
                ٤٥ دقيقة — نناقش سياقك واحتياجاتك المحددة
              </p>
              <Link
                href="/contact"
                className="btn-primary block w-full py-2.5 rounded-xl text-sm font-medium text-center"
                data-event="click_request_pilot_review"
              >
                طلب الجلسة
              </Link>
            </div>
            <div className="glass-card rounded-xl p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-cyan-400 font-bold text-sm">٣</span>
              </div>
              <h3 className="text-white font-semibold mb-2">
                بايلوت تقييمي (مجاني)
              </h3>
              <p className="text-slate-400 text-sm mb-5">
                ٢-٤ أسابيع — على بياناتك الحقيقية
              </p>
              <Link
                href="/engagement-models"
                className="btn-outline block w-full py-2.5 rounded-xl text-sm font-medium text-center"
                data-event="click_view_engagement_models"
              >
                اكتشف نماذج التعاون
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
