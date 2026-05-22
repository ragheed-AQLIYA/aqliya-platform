import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "للمشتريات والعقود | AQLIYA",
  description:
    "ما يهم فريق المشتريات: وثائق التقييم، نماذج التعاون، متطلبات التشغيل، بيانات النشر، وآلية الحصول على عرض رسمي.",
};

const procurementDocs = [
  {
    title: "وثيقة نطاق البايلوت",
    desc: "تحديد نطاق التجربة، المخرجات المتوقعة، معايير النجاح، جدول التنفيذ",
    available: "متاحة عند الطلب",
  },
  {
    title: "وثيقة الإفصاح عن المخاطر والقيود",
    desc: "القيود التقنية الحالية، ما لا يفعله النظام، ما هو مخطط لما قبل الإنتاج",
    available: "متاحة عند الطلب",
  },
  {
    title: "مواصفات النشر",
    desc: "متطلبات الخادم، نموذج البيانات، نطاق التكامل في البايلوت",
    available: "متاحة عند الطلب",
  },
  {
    title: "مصفوفة الأدوار والصلاحيات",
    desc: "تفصيل أدوار المستخدمين، مستويات الوصول، فصل الصلاحيات",
    available: "متاحة عند الطلب",
  },
  {
    title: "معايير نجاح البايلوت",
    desc: "٢٨ معيار قابل للقياس، شروط Go/No-Go، آلية تقييم مستقل",
    available: "متاحة عند الطلب",
  },
  {
    title: "خطة التوسع ما بعد البايلوت",
    desc: "متطلبات ما قبل الإنتاج، نماذج الاشتراك، مسار الانتقال",
    available: "متاحة عند الطلب",
  },
];

const engagementModels = [
  {
    name: "التشخيص التنفيذي",
    duration: "٤٥-٩٠ دقيقة",
    cost: "مجاني",
    output: "تقرير ملاءمة أولي",
  },
  {
    name: "بايلوت تقييمي",
    duration: "٢-٤ أسابيع",
    cost: "مجاني",
    output: "تقرير Go/No-Go + دليل موثق",
  },
  {
    name: "نشر المنتج",
    duration: "يُحدَّد بعد البايلوت",
    cost: "حسب النطاق",
    output: "اشتراك Cloud Managed",
  },
  {
    name: "نظام مؤسسي مخصص",
    duration: "يُحدَّد بالمتطلبات",
    cost: "مخصص",
    output: "حل مبني على AQLIYA Core",
  },
];

const evaluationCriteria = [
  "هل النظام يعمل على بياناتنا الفعلية؟",
  "هل المخرجات موثقة وقابلة للتدقيق؟",
  "هل الصلاحيات مفعّلة على مستوى الخادم؟",
  "هل يوجد سجل تدقيق غير قابل للتعديل؟",
  "هل سير العمل يتوافق مع منهجيتنا الداخلية؟",
  "هل الفريق قادر على التشغيل بعد التدريب؟",
];

export default function BuyerProcurementPage() {
  return (
    <div className="min-h-screen bg-[var(--aqliya-deep)]" dir="rtl">
      {/* Hero */}
      <section className="hero-gradient py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
            للمشتريات والعقود
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight max-w-3xl">
            كل ما تحتاجه لعملية التقييم والمشتريات
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">
            وثائق التقييم، نماذج التعاون، متطلبات التشغيل، ومسار الحصول على عرض رسمي —
            مرتبة لتسهيل عملية المشتريات.
          </p>
        </div>
      </section>

      {/* Procurement Docs */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">وثائق التقييم المتاحة</h2>
          <p className="text-slate-400 text-center mb-10">
            جميع الوثائق التقنية والتعاقدية متاحة للمراجعة قبل أي التزام
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {procurementDocs.map((doc) => (
              <div key={doc.title} className="glass-card rounded-xl p-6">
                <h3 className="text-white font-semibold mb-2">{doc.title}</h3>
                <p className="text-slate-400 text-sm mb-3">{doc.desc}</p>
                <span className="text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full">
                  {doc.available}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement Models */}
      <section className="section-gradient-dark py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">نماذج التعاون</h2>
          <p className="text-slate-400 text-center mb-10">
            من جلسة تشخيص مجانية إلى نظام مؤسسي مخصص
          </p>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="text-right px-5 py-3 text-slate-400 font-medium">نموذج التعاون</th>
                  <th className="text-right px-5 py-3 text-slate-400 font-medium">المدة</th>
                  <th className="text-right px-5 py-3 text-slate-400 font-medium">التكلفة</th>
                  <th className="text-right px-5 py-3 text-slate-400 font-medium">المخرج</th>
                </tr>
              </thead>
              <tbody>
                {engagementModels.map((m, i) => (
                  <tr key={m.name} className={`border-b border-white/5 ${i === 1 ? "bg-cyan-500/5" : ""}`}>
                    <td className={`px-5 py-4 font-medium ${i === 1 ? "text-cyan-400" : "text-white"}`}>
                      {m.name}
                    </td>
                    <td className="px-5 py-4 text-slate-300">{m.duration}</td>
                    <td className="px-5 py-4 text-slate-300">{m.cost}</td>
                    <td className="px-5 py-4 text-slate-300">{m.output}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-slate-500 text-xs text-center mt-4">
            تفاصيل كاملة في صفحة{" "}
            <Link href="/engagement-models" className="text-cyan-500 hover:text-cyan-400 transition-colors">
              نماذج التعاون
            </Link>
          </p>
        </div>
      </section>

      {/* Evaluation Criteria */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">معايير التقييم المقترحة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {evaluationCriteria.map((c, i) => (
              <div key={i} className="flex gap-3 items-start glass-card rounded-lg px-5 py-4">
                <span className="text-cyan-400 mt-0.5 shrink-0">◈</span>
                <p className="text-slate-300 text-sm">{c}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 glass-card rounded-xl p-6 border border-cyan-500/10 max-w-3xl mx-auto">
            <p className="text-slate-300 text-sm text-center leading-relaxed">
              البايلوت التقييمي المجاني (٢-٤ أسابيع) مصمم للإجابة على هذه الأسئلة بالكامل
              قبل أي قرار اشتراك.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-gradient-dark py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            للحصول على حزمة التقييم
          </h2>
          <p className="text-slate-300 mb-8">
            تواصل معنا لتلقي حزمة وثائق التقييم الكاملة وجدولة الجلسة التنفيذية.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="btn-primary px-8 py-3 rounded-xl text-sm font-medium">
              طلب حزمة التقييم
            </Link>
            <Link href="/engagement-models" className="btn-outline px-8 py-3 rounded-xl text-sm font-medium">
              نماذج التعاون
            </Link>
          </div>
        </div>
      </section>

      {/* Peer Buyers */}
      <section className="py-12 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm mb-4">صفحات مخصصة لأدوار أخرى</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/buyers/cfo" className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">المدير المالي</Link>
            <span className="text-slate-600">·</span>
            <Link href="/buyers/cio" className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">مدير التقنية</Link>
            <span className="text-slate-600">·</span>
            <Link href="/buyers/audit-partner" className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">شريك التدقيق</Link>
            <span className="text-slate-600">·</span>
            <Link href="/buyers/government" className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">الجهات الحكومية</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
