import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "لمدير تقنية المعلومات CIO | AQLIYA",
  description:
    "ما يهم CIO: نموذج النشر، عزل البيانات، متطلبات التكامل، أمن البنية التحتية، وخارطة طريق واضحة نحو الإنتاج.",
};

const concerns = [
  {
    fear: "لا أعرف كيف يُعالج الذكاء الاصطناعي بيانات عملائنا",
    response:
      "البيانات لا تُستخدم لتدريب نماذج خارجية. معالجة LLM تُجرى على الجلسة فقط — لا تخزين في نماذج خارجية. يمكن مراجعة الوثائق التقنية قبل القرار.",
  },
  {
    fear: "متطلبات التكامل مع أنظمتنا الحالية",
    response:
      "البايلوت يعمل مستقلًا — استيراد CSV/XLSX، تصدير JSON/XLSX. API خارجي وتكامل ERP في خارطة ما بعد الإنتاج. لا تكامل إلزامي في البايلوت.",
  },
  {
    fear: "هل النظام يعمل On-Premises؟",
    response:
      "النموذج الحالي: Cloud Managed Deployment على بنية تحتية محددة. نموذج Private Cloud/On-Prem قيد التخطيط. البايلوت يُشغَّل في بيئة محكومة متفق عليها.",
  },
  {
    fear: "المصادقة والصلاحيات — هل تتوافق مع بنيتنا؟",
    response:
      "النظام الحالي: مصادقة NextAuth محلية، RBAC على مستوى الدور والارتباط. دعم SSO/LDAP في خارطة ما قبل الإنتاج. إدارة المستخدمين في البايلوت من فريق AQLIYA.",
  },
];

const techSpecs = [
  { label: "البنية الأساسية", value: "Next.js · PostgreSQL · REST API" },
  {
    label: "نموذج البيانات",
    value: "عزل على مستوى الارتباط — لا مشاركة بين العملاء في البايلوت",
  },
  { label: "المصادقة", value: "NextAuth — إدارة يدوية في البايلوت" },
  {
    label: "تدفق LLM",
    value: "API calls per session — لا تخزين في نماذج خارجية",
  },
  { label: "التصدير", value: "JSON / XLSX — PDF عربي قيد التطوير" },
  { label: "Audit Log", value: "DB-backed — immutable — قابل للتصدير" },
];

const readinessGate = [
  { item: "ClamAV — فحص الفيروسات للملفات المرفوعة", status: "ما قبل الإنتاج" },
  { item: "مصادقة إنتاجية مع SSO", status: "ما قبل الإنتاج" },
  { item: "نسخ احتياطي آلي", status: "ما قبل الإنتاج" },
  { item: "اختبار أمني خارجي", status: "ما قبل الإنتاج" },
  { item: "عزل متعدد العملاء مختبَر", status: "ما قبل الإنتاج" },
  { item: "RBAC Server-side enforcement", status: "✓ متاح الآن" },
  { item: "Audit Trail غير قابل للتعديل", status: "✓ متاح الآن" },
  { item: "Evidence Graph", status: "✓ متاح الآن" },
];

export default function BuyerCIOPage() {
  return (
    <div className="min-h-screen bg-aqliya-deep" dir="rtl">
      {/* Hero */}
      <section className="hero-gradient py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
            لمدير تقنية المعلومات — CIO
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight max-w-3xl">
            معلومات تقنية دقيقة — لا تسويق
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">
            نشر النظام، أمن البيانات، متطلبات التكامل، مسار التوسع نحو الإنتاج —
            بشفافية كاملة حول ما هو متاح الآن وما هو قيد التخطيط.
          </p>
        </div>
      </section>

      {/* Tech Specs */}
      <section className="py-16 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-xl font-bold text-white mb-6">
            المواصفات التقنية — البايلوت
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {techSpecs.map((s) => (
              <div
                key={s.label}
                className="bg-white/5 border border-white/5 rounded-xl p-4"
              >
                <p className="text-slate-500 text-xs mb-1">{s.label}</p>
                <p className="text-white text-sm font-medium">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Concerns */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">
            الأسئلة التقنية التي نسمعها من CIO
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
                <div className="p-6">
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

      {/* Readiness Gate */}
      <section className="section-gradient-dark py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            بوابة الجاهزية — ما هو متاح الآن
          </h2>
          <p className="text-slate-400 text-center mb-10">
            شفافية كاملة حول حالة كل متطلب تقني
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {readinessGate.map((r) => (
              <div
                key={r.item}
                className="glass-card rounded-xl p-4 flex gap-4 items-center justify-between"
              >
                <p className="text-slate-300 text-sm">{r.item}</p>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                    r.status.includes("✓")
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            للاطلاع على الوثائق التقنية
          </h2>
          <p className="text-slate-300 mb-8">
            في الجلسة التنفيذية، نوفر الوثائق التقنية الكاملة لمراجعة فريقك قبل
            اتخاذ القرار.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact"
              className="btn-primary px-8 py-3 rounded-xl text-sm font-medium"
            >
              طلب جلسة تقنية
            </Link>
            <Link
              href="/security"
              className="btn-outline px-8 py-3 rounded-xl text-sm font-medium"
            >
              وثيقة الأمن
            </Link>
            <Link
              href="/deployment"
              className="btn-outline px-8 py-3 rounded-xl text-sm font-medium"
            >
              نماذج النشر
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
              المشتريات
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
