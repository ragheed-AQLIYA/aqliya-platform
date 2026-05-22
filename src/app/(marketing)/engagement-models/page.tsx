import type { Metadata } from "next";
import Link from "next/link";

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

export default function EngagementModelsPage() {
  return (
    <div className="min-h-screen bg-[var(--aqliya-deep)]" dir="rtl">
      {/* Hero */}
      <section className="hero-gradient py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
            نماذج التعاون
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            ابدأ من حيث أنت الآن
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            لا التزام مبكر، لا سعر مخفي. خمسة نماذج مصممة لمراحل مختلفة من قرار الاشتراك.
            الخطوة الصحيحة تبدأ بفهم سياقك.
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
                  <th className="text-right px-4 py-3 text-slate-400 font-medium w-28">النموذج</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">لمن</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">المدة</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">التكلفة</th>
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
                    <td className={`px-4 py-3 font-medium ${m.featured ? "text-cyan-400" : "text-white"}`}>
                      {m.name}
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{m.whoFor}</td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{m.duration}</td>
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
                  <span className="text-cyan-400 text-xs font-semibold">الخطوة الموصى بها — ابدأ هنا</span>
                </div>
              )}

              <div className="p-8 border-b border-white/5">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <span className="text-slate-600 font-bold text-2xl">{m.number}</span>
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

                <p className="mt-6 text-slate-300 leading-relaxed">{m.description}</p>
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
                        <span className="text-slate-500 mt-0.5 shrink-0">◦</span>
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
                      <p key={i} className="text-amber-300/60 text-xs flex gap-2">
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
                    m.featured
                      ? "btn-primary"
                      : "btn-outline"
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

      {/* Decision Guide */}
      <section className="section-gradient-dark py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">
            غير متأكد من أين تبدأ؟
          </h2>
          <p className="text-slate-300 mb-8 leading-relaxed">
            ابدأ بجلسة التشخيص التنفيذي — مجانية، بدون التزام، تنتهي بتوصية واضحة.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="btn-primary px-8 py-3 rounded-xl text-sm font-medium">
              طلب جلسة التشخيص
            </Link>
            <Link href="/how-we-work" className="btn-outline px-8 py-3 rounded-xl text-sm font-medium">
              كيف نعمل
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
