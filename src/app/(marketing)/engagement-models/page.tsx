import type { Metadata } from "next";
import Link from "next/link";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";
import { publicOsStatus } from "@/lib/marketing/public-status";

export const metadata: Metadata = {
  title: "نماذج التعاون | AQLIYA",
  description:
    "خمسة نماذج تعاون مصممة لمراحل مختلفة من قرار الاشتراك — من تشخيص مجاني إلى نظام مؤسسي مخصص.",
};

const models = [
  {
    id: "diagnostic",
    number: "٠١",
    name: "التشخيص التنفيذي",
    tagline: "فهم الوضع الراهن قبل أي قرار",
    whoFor: "المدير التنفيذي، CFO، CIO، أو قيادة مكتب التدقيق",
    duration: "٤٥-٩٠ دقيقة — جلسة واحدة أو جلستان",
    cost: "مجاني",
    description:
      "جلسة عمل منظمة نفهم فيها سياقك وتحدياتك الراهنة. لا عرض مبيعات — تشخيص فعلي لتحديد إذا كانت AQLIYA الخيار المناسب لك وما هو النموذج الأنسب.",
    outputs: [
      "تقييم مدى ملاءمة AQLIYA لسياقك",
      "تحديد نقاط القيمة الأعلى لحالتك",
      "توصية بالخطوة المنطقية التالية",
      "وثيقة ملخص الجلسة",
    ],
    clientRequirements: [
      "تخصيص ٤٥-٩٠ دقيقة من القيادة",
      "وصف مبدئي لسير العمل الحالي",
    ],
    nextStep: "حجز جلسة التشخيص",
    nextStepHref: "/contact",
    accent: "cyan",
    featured: false,
  },
  {
    id: "pilot",
    number: "٠٢",
    name: "البايلوت التقييمي",
    tagline: "الخطوة الأولى لإثبات القيمة",
    whoFor: "مكاتب التدقيق، وحدات المراجعة الداخلية، إدارات المالية",
    duration: "٢-٤ أسابيع",
    cost: "مجاني",
    description:
      "ارتباط تدقيق واحد محدود النطاق على بيانات فعلية في بيئة محكومة. تشغيل سير العمل الكامل: من رفع الميزان إلى نشر حزمة الارتباط. تقييم مستقل ومتفق على معاييره مسبقًا.",
    outputs: [
      "تشغيل سير عمل AuditOS كاملًا على ارتباط فعلي",
      "٢٨ معيار تقييم موثقة مع نتائج قابلة للقياس",
      "تقرير Go/No-Go لقرار الاشتراك",
      "حزمة ارتباط مكتملة: قوائم + أدلة + Audit Trail",
      "جلسة مراجعة نتائج مع فريقك",
    ],
    clientRequirements: [
      "ميزان مراجعة ارتباط واحد (CSV/XLSX)",
      "فريق مدققين جاهز للتفاعل مع النظام",
      "٢-٤ أسابيع من الوقت الفعلي (ليس متفرغًا)",
      "نقطة تواصل واحدة من جانبكم",
    ],
    limitations: [
      "تصدير JSON/XLSX — PDF عربي قيد التطوير",
      "إدارة المستخدمين من فريق AQLIYA",
      "تخزين محلي في بيئة البايلوت",
      "لا تكامل مع أنظمة خارجية في البايلوت",
    ],
    nextStep: "طلب بدء بايلوت",
    nextStepHref: "/contact",
    accent: "cyan",
    featured: true,
  },
  {
    id: "deployment",
    number: "٠٣",
    name: "نشر المنتج",
    tagline: "الانتقال من البايلوت إلى الاشتراك",
    whoFor: "العملاء الذين أكملوا البايلوت بنجاح",
    duration: "يُحدَّد بعد تقرير Go/No-Go",
    cost: "حسب النطاق — يُحدَّد بعد البايلوت",
    description:
      "بعد البايلوت الناجح، الانتقال إلى اشتراك Cloud Managed Deployment مع استيفاء متطلبات ما قبل الإنتاج: فحص الفيروسات، المصادقة الإنتاجية، النسخ الاحتياطي الآلي، والمراجعة الأمنية الخارجية.",
    outputs: [
      "بيئة إنتاج مكتملة على Cloud Managed Deployment",
      "مصادقة إنتاجية مع إدارة المستخدمين",
      "النسخ الاحتياطي الآلي والمراقبة",
      "تدريب الفريق الكامل",
      "دعم فني مستمر",
    ],
    clientRequirements: [
      "إكمال البايلوت التقييمي بنجاح",
      "الموافقة على متطلبات البنية التحتية",
      "تعيين مسؤول تقني داخلي",
    ],
    nextStep: "مراجعة تقرير البايلوت",
    nextStepHref: "/contact",
    accent: "indigo",
    featured: false,
  },
  {
    id: "private-assessment",
    number: "٠٤",
    name: "تقييم النشر الخاص",
    tagline: "لمتطلبات سيادة البيانات والخصوصية المؤسسية",
    whoFor: "الجهات الحكومية، المؤسسات ذات متطلبات سيادة البيانات",
    duration: "٤-٨ أسابيع — تقييم وتخطيط",
    cost: "حسب النطاق",
    description:
      "لمن لديه متطلبات نشر خاص على بنيته التحتية، نُجري تقييمًا تقنيًا مشتركًا لتحديد المتطلبات ومسار التنفيذ. نموذج Private Cloud/On-Premises قيد التخطيط — هذا النموذج لوضع خطة التنفيذ معًا.",
    outputs: [
      "تقييم تقني مشترك للبنية التحتية",
      "خطة تنفيذ مقترحة للنشر الخاص",
      "قائمة المتطلبات التقنية والتنظيمية",
      "تقدير المدة والجهد المطلوب",
    ],
    clientRequirements: [
      "وصف البنية التحتية الحالية",
      "تحديد متطلبات سيادة البيانات بوضوح",
      "مشاركة فريق تقني في التقييم",
    ],
    note: "هذا النموذج لتخطيط التنفيذ — ليس اشتراكًا قائمًا حاليًا. النشر الخاص الكامل يتطلب دراسة تفصيلية.",
    nextStep: "طلب تقييم تقني",
    nextStepHref: "/contact",
    accent: "indigo",
    featured: false,
  },
  {
    id: "custom",
    number: "٠٥",
    name: "النظام المؤسسي المخصص",
    tagline: "منظومة مبنية على AQLIYA Core لسياقك",
    whoFor: "المؤسسات ذات سير عمل متخصص لا تغطيه المنتجات الجاهزة",
    duration: "يُحدَّد بالمتطلبات",
    cost: "مخصص — يُحدَّد بعد التشخيص",
    description:
      "بناء منظومة مخصصة على AQLIYA Intelligence Core — نفس طبقات الحوكمة والأدلة والـ RBAC وAudit Trail، لكن بسير عمل مصمم لسياقك المؤسسي الخاص.",
    outputs: [
      "تصميم سير عمل مخصص لسياقك",
      "بناء على AQLIYA Intelligence Core",
      "حوكمة كاملة: RBAC + Audit Trail + Evidence Graph",
      "تسليم مراحلي مع نقاط تحقق",
    ],
    clientRequirements: [
      "توثيق سير العمل الحالي بالتفصيل",
      "مشاركة فريق تقني وتشغيلي",
      "التزام بمراحل التسليم والمراجعة",
    ],
    nextStep: "بدء بجلسة التشخيص",
    nextStepHref: "/contact",
    accent: "indigo",
    featured: false,
  },
];

const fitGuide = [
  {
    situation: "عندك فكرة فقط",
    model: "التشخيص التنفيذي",
    color: "text-cyan-400",
  },
  {
    situation: "عندك workflow واضح",
    model: "البايلوت التقييمي",
    color: "text-emerald-400",
  },
  {
    situation: "عندك فريق جاهز",
    model: "نشر المنتج",
    color: "text-cyan-400",
  },
  {
    situation: "عندك احتياج خاص",
    model: "النظام المؤسسي المخصص",
    color: "text-indigo-400",
  },
];

const whatWeNeed = [
  {
    label: "مالك use case",
    detail: "من المسؤول عن سير العمل الذي نريد تفعيله؟",
  },
  {
    label: "نموذج بيانات أو وصف",
    detail: "عينة أو وصف للبيانات التي سيدخلها النظام.",
  },
  {
    label: "صاحب القرار",
    detail: "من يقرر بدء التجربة وتقييم النتائج؟",
  },
  {
    label: "معايير النجاح",
    detail: "كيف نقيس أن التجربة نجحت؟ وما المخرجات المتوقعة؟",
  },
  {
    label: "مسار المراجعة والاعتماد",
    detail: "من يراجع المخرجات قبل اعتمادها؟ وما مسار الموافقات؟",
  },
  {
    label: "قيود الأمان والبيانات",
    detail: "هل توجد متطلبات خصوصية أو حساسية بيانات يجب مراعاتها؟",
  },
];

const boundaries = [
  "لا نعد بنتيجة pilot مضمونة — التقييم يحدد الوضع، لا النتيجة النهائية.",
  "لا deployment بدون تقييم نطاق كامل — البايلوت لا يلزم بنشر إنتاجي.",
  "لا استخدام بيانات حساسة بدون ترتيبات مناسبة — نحدد معًا متطلبات الأمان قبل البدء.",
  "لا استبدال للفرق المهنية — النظام يدعم الحكم البشري، لا يحل محله.",
  "لا ادعاء امتثال أو اعتماد غير موثق — المخرجات أداة مساعدة، المسؤولية المهنية تبقى على عاتق الفريق.",
];

const recommendedProducts = [
  {
    name: "AuditOS",
    match: "التدقيق والمراجعة المالية",
    description:
      "سير عمل المراجعة المالية: ميزان المراجعة، القوائم، الأدلة، المراجعة، والاعتماد.",
    href: "/products/audit",
    status: publicOsStatus.auditOS.label,
    statusColor: "text-emerald-400",
  },
  {
    name: "LocalContentOS",
    match: "المحتوى المحلي والموردين",
    description: "إدارة المحتوى المحلي: الموردين، العقود، الأدلة، والتقارير.",
    href: "/products/local-content",
    status: publicOsStatus.localContentOS.label,
    statusColor: "text-amber-400",
  },
  {
    name: "DecisionOS",
    match: "حوكمة القرارات",
    description: "توثيق القرارات: سيناريوهات، مخاطر، أدلة، مراجعة، واعتماد.",
    href: "/products/decision",
    status: publicOsStatus.decisionOS.label,
    statusColor: "text-primary",
  },
  {
    name: "Office AI Assistant",
    match: "المساعد المؤسسي المحكوم",
    description: "المعرفة الداخلية والإنتاجية ضمن بيئة حوكمة وأدلة ومراجعة.",
    href: "/products/office-ai",
    status: publicOsStatus.officeAI.label,
    statusColor: "text-primary",
  },
];

export default function EngagementModelsPage() {
  return (
    <div className="min-h-screen bg-aqliya-deep" dir="rtl">
      {/* Hero */}
      <section className="hero-gradient py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
            نماذج التعاون
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            نماذج التعاون مع AQLIYA
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            ابدأ بمراجعة محدودة، أثبت القيمة على سير عمل واحد، ثم قرر التوسع
            بناءً على الأدلة.
          </p>
        </div>
      </section>

      {/* Quick Comparison */}
      <section className="py-12 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-right px-4 py-3 text-slate-400 font-medium w-28">
                    النموذج
                  </th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">
                    لمن
                  </th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">
                    المدة
                  </th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">
                    التكلفة
                  </th>
                </tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr
                    key={m.id}
                    className={`border-b border-white/5 ${
                      m.featured ? "bg-cyan-500/5" : ""
                    }`}
                  >
                    <td
                      className={`px-4 py-3 font-medium ${m.featured ? "text-cyan-400" : "text-white"}`}
                    >
                      {m.name}
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs">
                      {m.whoFor}
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs">
                      {m.duration}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          m.cost === "مجاني"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "text-slate-400"
                        }`}
                      >
                        {m.cost}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Model Cards */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6 space-y-10">
          {models.map((m) => (
            <div
              key={m.id}
              className={`glass-card rounded-2xl overflow-hidden ${
                m.featured ? "border border-cyan-500/20" : ""
              }`}
            >
              {m.featured && (
                <div className="bg-cyan-500/10 border-b border-cyan-500/20 px-8 py-2 text-center">
                  <span className="text-cyan-400 text-xs font-semibold">
                    الخطوة الموصى بها — ابدأ هنا
                  </span>
                </div>
              )}

              <div className="p-8 border-b border-white/5">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <span className="text-slate-600 font-bold text-2xl">
                    {m.number}
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{m.name}</h2>
                    <p className="text-slate-400 text-sm">{m.tagline}</p>
                  </div>
                  {m.cost === "مجاني" && (
                    <span className="mr-auto px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      مجاني
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  <div>
                    <p className="text-slate-500 text-xs mb-1">لمن</p>
                    <p className="text-slate-300 text-sm">{m.whoFor}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">المدة</p>
                    <p className="text-slate-300 text-sm">{m.duration}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">التكلفة</p>
                    <p className="text-slate-300 text-sm">{m.cost}</p>
                  </div>
                </div>

                <p className="mt-6 text-slate-300 leading-relaxed">
                  {m.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 border-b border-white/5">
                {/* Outputs */}
                <div className="p-8 border-b md:border-b-0 md:border-l border-white/5">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    المخرجات
                  </h3>
                  <ul className="space-y-2.5">
                    {m.outputs.map((o, i) => (
                      <li key={i} className="flex gap-3 text-slate-300 text-sm">
                        <span className="text-cyan-400 mt-0.5 shrink-0">✓</span>
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Requirements */}
                <div className="p-8">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    متطلبات من طرفكم
                  </h3>
                  <ul className="space-y-2.5">
                    {m.clientRequirements.map((r, i) => (
                      <li key={i} className="flex gap-3 text-slate-300 text-sm">
                        <span className="text-slate-500 mt-0.5 shrink-0">
                          ◦
                        </span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Limitations (pilot only) */}
              {m.limitations && (
                <div className="p-6 border-b border-white/5 bg-amber-500/3">
                  <h3 className="text-xs font-semibold text-amber-400/70 uppercase tracking-wider mb-3">
                    قيود البايلوت
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {m.limitations.map((l, i) => (
                      <p
                        key={i}
                        className="text-amber-300/60 text-xs flex gap-2"
                      >
                        <span className="shrink-0 mt-0.5">⊘</span>
                        {l}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Note */}
              {m.note && (
                <div className="px-8 py-4 bg-amber-500/5">
                  <p className="text-amber-300/70 text-sm">{m.note}</p>
                </div>
              )}

              {/* CTA */}
              <div className="p-6 flex items-center justify-between">
                <Link
                  href={m.nextStepHref}
                  className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    m.featured ? "btn-primary" : "btn-outline"
                  }`}
                >
                  {m.nextStep}
                </Link>
                <span className="text-slate-600 text-sm">{m.number} / ٠٥</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Which Model Fits You? */}
      <section className="section-gradient-dark py-20 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400 text-center">
            دليل الاختيار
          </p>
          <h2 className="text-2xl font-bold text-white mt-4 mb-10 text-center">
            أي نموذج يناسبك؟
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {fitGuide.map((item) => (
              <div
                key={item.situation}
                className="glass-card rounded-xl p-5 text-center"
              >
                <p className="text-slate-400 text-sm mb-2">{item.situation}</p>
                <p className={`text-lg font-bold ${item.color}`}>
                  {item.model}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Need From You */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400 text-center">
            متطلبات البداية
          </p>
          <h2 className="text-2xl font-bold text-white mt-4 mb-4 text-center">
            ما نحتاجه منك
          </h2>
          <p className="text-slate-400 text-center mb-10 max-w-2xl mx-auto">
            ستة عناصر نسأل عنها قبل أي engagement — لتحديد النطاق والتوقعات
            بدقة.
          </p>
          <div className="max-w-3xl mx-auto space-y-3">
            {whatWeNeed.map((item) => (
              <div
                key={item.label}
                className="glass-card rounded-xl p-5 flex items-start gap-4"
              >
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                <div>
                  <p className="text-white font-semibold text-sm mb-0.5">
                    {item.label}
                  </p>
                  <p className="text-slate-400 text-sm">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do Not Promise */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-3xl mx-auto rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400 text-center">
              حدود واضحة
            </p>
            <h2 className="text-2xl font-bold text-white mt-3 mb-8 text-center">
              ما لا نعدك به
            </h2>
            <div className="space-y-3">
              {boundaries.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 text-amber-400/60">⊘</span>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Starting Points */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400 text-center">
            نقطة البداية حسب المنتج
          </p>
          <h2 className="text-2xl font-bold text-white mt-4 mb-4 text-center">
            ما المنتج المناسب لسير عملك؟
          </h2>
          <p className="text-slate-400 text-center mb-10 max-w-2xl mx-auto">
            كل منتج مبني على AQLIYA Intelligence Core — الحوكمة، الأدلة، وسجل
            التدقيق مشتركة بينهم.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {recommendedProducts.map((p) => (
              <div key={p.name} className="glass-card rounded-xl p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">{p.name}</h3>
                  <span className={`text-xs font-medium ${p.statusColor}`}>
                    {p.status}
                  </span>
                </div>
                <p className="text-cyan-400/80 text-sm mb-2">{p.match}</p>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  {p.description}
                </p>
                <Link
                  href={p.href}
                  className="inline-flex items-center gap-1 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  عرض الصفحة التعريفية ←
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment framing */}
      <section className="border-b border-white/5 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            الاستثمار
          </p>
          <h2 className="mt-4 text-2xl font-bold text-white">
            التشخيص والبايلوت — مجاني. النشر — بعد Go/No-Go
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            لا نحدد تسعيرة الإنتاج قبل تقييم النطاق. بعد بايلوت ناجح، نقدم
            عرضًا مبنيًا على عدد المستخدمين، أنظمة التشغيل المفعّلة، ومتطلبات
            النشر. البايلوت التقييمي مجاني دائمًا للمسار الأول.
          </p>
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              نطاق تقديري (بعد Go/No-Go — ليس عرضاً ملزماً)
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>• جلسة تشخيص — مجانية</li>
              <li>• بايلوت تقييمي (مسار واحد) — مجاني</li>
              <li>
                • نشر إنتاج: يبدأ تقريباً من{" "}
                <strong className="text-white">15,000 ريال/شهر</strong> لمكتب
                مراجعة صغير — يُحدد في عرض مكتوب بعد البايلوت
              </li>
              <li>• مؤسسات أكبر / أنظمة متعددة — تسعير حسب النطاق والنشر</li>
            </ul>
            <p className="mt-4 text-xs text-slate-500">
              الأرقام إرشادية للتأهيل فقط. لا التزام تعاقدي قبل SOW وGo/No-Go.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-gradient-dark py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-3">
              ابدأ بمراجعة محدودة. لا توسّع قبل الدليل.
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              الخطوة الصحيحة تبدأ بفهم سياقك — جدولة جلسة تشخيص أو مراجعة
              المنتجات أولاً.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <ScheduleDiagnosticCta className="px-8 py-3 rounded-xl text-sm font-medium" />
              <Link
                href="/procurement-pack"
                className="btn-outline px-8 py-3 rounded-xl text-sm font-medium"
              >
                حزمة المشتريات
              </Link>
              <Link
                href="/pilot-proof"
                className="btn-outline px-8 py-3 rounded-xl text-sm font-medium"
                data-event="click_view_pilot_proof"
              >
                إطار إثبات الـ Pilot ←
              </Link>
              <Link
                href="/executive-brief"
                className="btn-outline px-8 py-3 rounded-xl text-sm font-medium"
                data-event="click_read_executive_brief"
              >
                الملخص التنفيذي
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
