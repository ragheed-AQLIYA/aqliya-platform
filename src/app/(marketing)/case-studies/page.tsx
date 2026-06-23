import type { Metadata } from "next";
import Link from "next/link";
import { ScheduleDiagnosticCta } from "@/components/marketing/schedule-diagnostic-cta";

export const metadata: Metadata = {
  title: "دراسات الحالة | AQLIYA",
  description:
    "سيناريوهات مؤسسية موثقة توضح كيف تحول عقلية سير العمل من عمليات يدوية مبعثرة إلى مسارات محكومة قابلة للتدقيق.",
};

const scenarios = [
  {
    id: "audit-firm-pilot",
    label: "دراسة حالة: مكتب تدقيق إقليمي",
    badge: "سيناريو تجريبي — بيانات محاكاة",
    badgeColor: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    context:
      "مكتب تدقيق إقليمي يدير ٣-٥ ارتباطات متزامنة. الفريق يعمل على Excel ومجلدات مشتركة. المراجعة تتم عبر البريد الإلكتروني وواتساب.",
    before: [
      "ميزان المراجعة يُعالَج يدويًا في Excel — ساعات لكل ارتباط",
      "توجيه الحسابات يعتمد على خبرة الفرد لا على منهجية موثقة",
      "الملاحظات مبعثرة: إيميل، ورق، واتساب",
      "لا يوجد سجل موحد لمن وافق على القرار ومتى",
      "القوائم المالية تُجمّع يدويًا مع كل إعادة عمل",
    ],
    after: [
      "ميزان المراجعة يُرفع ويُتحقق منه بدقيقتين — الاتزان يُكتشف آليًا",
      "اقتراحات توجيه الحسابات مبنية على معايير IFRS — المدقق يراجع ويعدّل",
      "سير عمل الملاحظات داخل المنصة: إنشاء → تعيين → مراجعة → اعتماد الشريك",
      "سجل تدقيق كامل: كل إجراء موثق بالمستخدم والوقت والسبب",
      "مسودة القوائم المالية والإيضاحات تُولَّد آليًا للمراجعة البشرية",
    ],
    evidence: [
      "١٨+ نوع حدث مسجّل في Audit Trail",
      "بوابة اعتماد: ٥ شروط يجب اكتمالها قبل النشر",
      "ربط كل بند في القوائم بدليله المصدر",
      "تسلسل الموافقات محفوظ — من وافق ومتى ولماذا",
    ],
    workflow: [
      {
        step: "١",
        label: "رفع الميزان",
        detail: "CSV/XLSX — التحقق الفوري من الاتزان",
      },
      {
        step: "٢",
        label: "توجيه الحسابات",
        detail: "اقتراح ذكي + مراجعة المدقق",
      },
      {
        step: "٣",
        label: "القوائم المالية",
        detail: "مسودة آلية + مراجعة بشرية إلزامية",
      },
      {
        step: "٤",
        label: "الإيضاحات والأدلة",
        detail: "تحديد النواقص + ربط المستندات",
      },
      {
        step: "٥",
        label: "الملاحظات والتوصيات",
        detail: "تصنيف تلقائي حسب الخطورة",
      },
      { step: "٦", label: "مراجعة الشريك", detail: "بوابة اعتماد + سجل موقّع" },
      { step: "٧", label: "النشر", detail: "حزمة ارتباط كاملة مع Audit Trail" },
    ],
    note: "سيناريو مؤسسي موثّق يعكس قدرات AuditOS في مسار المراجعة المحكوم. النتائج الفعلية تعتمد على طبيعة كل ارتباط وجودة البيانات.",
  },
  {
    id: "gov-entity-pilot",
    label: "دراسة حالة: جهة حكومية — مراجعة داخلية",
    badge: "سيناريو تجريبي — بيانات محاكاة",
    badgeColor: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    context:
      "وحدة مراجعة داخلية في جهة حكومية. المراجعة تشمل ارتباطات متعددة الأقسام. متطلب رئيسي: توثيق قابل للتحقق ومسار اعتماد واضح.",
    before: [
      "توثيق إجراءات المراجعة في ملفات Word — صعب المراجعة والتحقق",
      "الأدلة الداعمة مبعثرة في مجلدات مشتركة بدون تنظيم منهجي",
      "قرارات المراجعة غير موثقة بشكل كافٍ للتحقق الخارجي",
      "إعادة إنتاج الملاحظات من دورة لأخرى تعتمد على ذاكرة الفريق",
      "لا يوجد فصل واضح بين من أنجز العمل ومن اعتمده",
    ],
    after: [
      "كل إجراء مراجعة مسجّل بالمستخدم والدور والوقت",
      "الأدلة مربوطة مباشرة بالبنود المراجعة — قابلية تتبع كاملة",
      "فصل تام بين دور المنفذ ودور المعتمد — لا تجاوز للصلاحيات",
      "حزمة الارتباط كاملة قابلة للتصدير للمراجع الخارجي",
      "سجل تدقيق غير قابل للتعديل — كل إجراء محفوظ",
    ],
    evidence: [
      "RBAC: صلاحيات على مستوى الدور والارتباط",
      "Audit Trail: سجل لا يُحذف — ١٨+ نوع حدث",
      "Evidence Graph: ربط الدليل بالبند المحدد",
      "Human Gates: لا يمكن النشر دون اكتمال شروط الاعتماد",
    ],
    workflow: [
      {
        step: "١",
        label: "إنشاء الارتباط",
        detail: "تحديد النطاق والفريق والصلاحيات",
      },
      {
        step: "٢",
        label: "تحميل البيانات",
        detail: "مستندات الارتباط والبيانات المالية",
      },
      { step: "٣", label: "تخصيص العمل", detail: "تعيين المهام حسب الدور" },
      {
        step: "٤",
        label: "إجراءات المراجعة",
        detail: "التنفيذ مع التوثيق الآني",
      },
      {
        step: "٥",
        label: "مراجعة المشرف",
        detail: "فحص الجودة + توجيه التعديلات",
      },
      { step: "٦", label: "اعتماد المسؤول", detail: "بوابة الاعتماد الرسمية" },
      {
        step: "٧",
        label: "الأرشفة والتصدير",
        detail: "حزمة كاملة للتوثيق الرسمي",
      },
    ],
    note: "سيناريو مؤسسي يعكس قدرات الحوكمة وسجل التدقيق في AuditOS. يمكن التحقق من المسار عبر الديمو التفاعلي أو حزمة الإثبات.",
  },
];

const trustPoints = [
  {
    icon: "⊘",
    title: "لا شعارات وهمية",
    body: "لا نضع شعارات عملاء دون إذن. الدراسات المعروضة سيناريوهات مؤسسية موثقة ببيانات محاكاة.",
  },
  {
    icon: "⊡",
    title: "النتائج تعتمد على السياق",
    body: "كل مؤسسة مختلفة. نركز على المنهجية والأدلة — لا على وعود أرقام عامة.",
  },
  {
    icon: "⊞",
    title: "الدليل أولًا",
    body: "كل ادعاء مرتبط بقدرة في المنصة — يمكنك التحقق في الديمو أو حزمة الإثبات.",
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-aqliya-deep" dir="rtl">
      {/* Hero */}
      <section className="hero-gradient py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
            دراسات الحالة
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            كيف يبدو العمل مع AuditOS
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            سيناريوهات موثقة توضح تحول سير عمل التدقيق — من عمليات يدوية مبعثرة
            إلى منهجية موحدة قابلة للتتبع والاعتماد.
          </p>
          <p className="mt-4 text-sm text-amber-400/80">
            ملاحظة: جميع السيناريوهات المعروضة تجريبية ببيانات محاكاة. لا يوجد
            مراجعة عملاء حقيقيين في هذه الصفحة.
          </p>
        </div>
      </section>

      {/* Institutional reference scenarios */}
      <section className="py-12 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              مراجع مؤسسية
            </p>
            <h2 className="mt-3 text-xl font-bold text-white">
              سيناريو مقاولات سعودية — امتثال المحتوى المحلي
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              شركة مقاولات كبرى خاضعة لبرنامج المحتوى المحلي. البيانات موزعة
              بين المشتريات والمالية والامتثال. التقارير تُعدّ يدوياً قبل
              المواعيد التنظيمية.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm">
              <div>
                <p className="font-semibold text-white">المشكلة</p>
                <p className="mt-1 text-slate-400">
                  إنفاق وموردون بلا ربط تشغيلي، وفجوات امتثال تُكتشف متأخراً.
                </p>
              </div>
              <div>
                <p className="font-semibold text-white">المنهجية</p>
                <p className="mt-1 text-slate-400">
                  تفعيل LocalContentOS لربط المورد–الإنفاق–التصنيف–المؤشرات في
                  مسار واحد محكوم.
                </p>
              </div>
              <div>
                <p className="font-semibold text-white">النتيجة</p>
                <p className="mt-1 text-slate-400">
                  رؤية امتثال مستمرة وتقارير جاهزة للجهات التنظيمية — كل رقم
                  مربوط بمصدره.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/products/local-content"
                className="btn-outline px-5 py-2.5 text-sm"
              >
                استكشف LocalContentOS
              </Link>
              <Link href="/proof#evidence-samples" className="btn-outline px-5 py-2.5 text-sm">
                راجع حزمة الإثبات
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Points */}
      <section className="py-10 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {trustPoints.map((t) => (
            <div key={t.title} className="flex gap-4 items-start">
              <span className="text-cyan-400 text-xl mt-0.5">{t.icon}</span>
              <div>
                <p className="text-white font-medium text-sm">{t.title}</p>
                <p className="text-slate-400 text-sm mt-1">{t.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Scenarios */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6 space-y-20">
          {scenarios.map((s) => (
            <div key={s.id} className="glass-card rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="p-8 border-b border-white/5">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${s.badgeColor}`}
                  >
                    {s.badge}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  {s.label}
                </h2>
                <p className="text-slate-300 leading-relaxed">{s.context}</p>
              </div>

              {/* Before / After */}
              <div className="grid grid-cols-1 md:grid-cols-2 border-b border-white/5">
                <div className="p-8 border-b md:border-b-0 md:border-l border-white/5">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    قبل — الوضع الراهن
                  </h3>
                  <ul className="space-y-3">
                    {s.before.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-slate-300 text-sm leading-relaxed"
                      >
                        <span className="text-red-400 mt-0.5 shrink-0">✕</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-8">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    بعد — مع AuditOS
                  </h3>
                  <ul className="space-y-3">
                    {s.after.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-slate-300 text-sm leading-relaxed"
                      >
                        <span className="text-emerald-400 mt-0.5 shrink-0">
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Workflow */}
              <div className="p-8 border-b border-white/5">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">
                  سير العمل
                </h3>
                <div className="flex flex-wrap gap-3">
                  {s.workflow.map((w) => (
                    <div
                      key={w.step}
                      className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-2.5"
                    >
                      <span className="text-cyan-400 font-bold text-sm">
                        {w.step}
                      </span>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {w.label}
                        </p>
                        <p className="text-slate-400 text-xs">{w.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence Chain */}
              <div className="p-8 border-b border-white/5">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  سلسلة الأدلة — ما يسجله النظام
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {s.evidence.map((e, i) => (
                    <div
                      key={i}
                      className="flex gap-3 items-center bg-cyan-500/5 border border-cyan-500/10 rounded-lg px-4 py-3"
                    >
                      <span className="text-cyan-400 text-sm shrink-0">◈</span>
                      <span className="text-slate-300 text-sm">{e}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="p-6 bg-amber-500/5">
                <p className="text-amber-300/70 text-sm leading-relaxed">
                  <span className="font-medium">ملاحظة منهجية: </span>
                  {s.note}
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
            شاهد سير العمل الكامل
          </h2>
          <p className="text-slate-300 mb-8 leading-relaxed">
            في الديمو التفاعلي، ستمر بكل خطوة من رفع الميزان إلى نشر حزمة
            الارتباط — على بيانات تجريبية حقيقية.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/demo"
              className="btn-primary px-8 py-3 rounded-xl text-sm font-medium"
            >
              مشاهدة الديمو الكامل
            </Link>
            <ScheduleDiagnosticCta className="rounded-xl px-8 py-3 text-sm font-medium" />
          </div>
        </div>
      </section>
    </div>
  );
}
