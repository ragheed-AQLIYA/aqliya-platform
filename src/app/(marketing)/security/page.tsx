import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "الأمن المؤسسي | AQLIYA",
  description:
    "بنية أمن مؤسسي مبنية على RBAC، سجلات التدقيق، تتبع الأدلة، العزل بين المستأجرين، وبوابات الموافقة البشرية — لضمان أن الذكاء الاصطناعي يدعم القرار ولا يتجاوزه.",
};

const securityPillars = [
  {
    id: "rbac",
    label: "RBAC",
    title: "التحكم بالوصول القائم على الأدوار",
    subtitle: "Role-Based Access Control",
    description:
      "كل مستخدم داخل المنصة يملك صلاحيات محددة بناءً على دوره المؤسسي. لا يمكن لأي طرف الوصول إلى بيانات أو وظائف خارج نطاق دوره — سواء كان محللاً، مديراً، أو مدقق داخلي.",
    points: [
      "تعريف أدوار مؤسسية مخصصة لكل عميل",
      "صلاحيات منفصلة لكل نظام من أنظمة عقلية",
      "منع الوصول الجانبي بين الأقسام",
      "مراجعة دورية لصلاحيات المستخدمين",
      "سجل تغييرات الأدوار غير قابل للتعديل",
    ],
    accent: "from-sky-500/10 to-blue-600/5",
    border: "border-sky-500/20",
    tag: "هوية وصلاحية",
  },
  {
    id: "audit",
    label: "Audit Logs",
    title: "سجلات التدقيق الكاملة",
    subtitle: "Immutable Audit Trail",
    description:
      "كل حدث داخل المنصة — من استعلام إلى قرار إلى تصدير — يُسجَّل بشكل فوري وغير قابل للتعديل. سجل التدقيق هو العمود الفقري لأي مراجعة داخلية أو امتثال خارجي.",
    points: [
      "تسجيل كل طلب، استجابة، وقرار",
      "ختم زمني دقيق لكل حدث",
      "ربط كل إجراء بهوية المستخدم المسؤول",
      "سجلات غير قابلة للحذف أو التعديل",
      "تصدير سجلات التدقيق لأغراض الامتثال",
    ],
    accent: "from-emerald-500/10 to-green-600/5",
    border: "border-emerald-500/20",
    tag: "شفافية وامتثال",
  },
  {
    id: "evidence",
    label: "Evidence Traceability",
    title: "تتبع سلسلة الأدلة",
    subtitle: "Evidence Chain Traceability",
    description:
      "كل مخرج ذكاء اصطناعي داخل عقلية مرتبط بمصادره الأصلية. لا يمكن لأي توصية أو تقرير أن يظهر بدون ربط حي بالوثيقة أو البيانات التي استند إليها.",
    points: [
      "ربط كل مخرج بمصدره الأصلي",
      "عرض موقع الدليل داخل الوثيقة بدقة",
      "الحفاظ على سلسلة الأدلة عبر جميع الخطوات",
      "منع الاستنتاجات غير المرتبطة بدليل",
      "تصدير سلسلة الأدلة لأي قرار أو تقرير",
    ],
    accent: "from-violet-500/10 to-purple-600/5",
    border: "border-violet-500/20",
    tag: "صدق وتتبع",
  },
  {
    id: "isolation",
    label: "Tenant Isolation",
    title: "العزل الكامل بين المستأجرين",
    subtitle: "Multi-Tenant Isolation",
    description:
      "بيانات كل عميل معزولة تماماً عن بيانات غيره على مستوى قاعدة البيانات، منطق التطبيق، ومساحات العمل الذكية. لا يمكن لبيانات مؤسسة أن تتقاطع مع أخرى بأي شكل.",
    points: [
      "فصل البيانات على مستوى قاعدة البيانات",
      "مساحات ذكاء اصطناعي منفصلة لكل عميل",
      "منع تسرب بيانات النماذج بين المستأجرين",
      "سياسات شبكية مستقلة لكل بيئة",
      "تدقيق دوري على حدود العزل",
    ],
    accent: "from-orange-500/10 to-amber-600/5",
    border: "border-orange-500/20",
    tag: "عزل وخصوصية",
  },
  {
    id: "human-gates",
    label: "Human Approval Gates",
    title: "بوابات الموافقة البشرية",
    subtitle: "Mandatory Human-in-the-Loop",
    description:
      "المبدأ المؤسسي لعقلية: الذكاء الاصطناعي يساعد ولا يقرر. كل إجراء ذو أثر مؤسسي — تصدير تقرير، إصدار توصية رسمية، إغلاق مهمة حرجة — يتطلب موافقة بشرية صريحة قبل التنفيذ.",
    points: [
      "لا يتخذ النظام أي قرار نهائي تلقائياً",
      "طلبات موافقة واضحة لكل إجراء حرج",
      "سجل موافقات مرتبط بهوية المعتمِد",
      "رفض أو تأجيل أي إجراء معلق",
      "تاريخ كامل لكل موافقة ورفض",
    ],
    accent: "from-rose-500/10 to-red-600/5",
    border: "border-rose-500/20",
    tag: "حوكمة وسيطرة",
  },
  {
    id: "encryption",
    label: "Encryption & Data",
    title: "تشفير البيانات والتحكم في الملكية",
    subtitle: "Encryption & Data Ownership",
    description:
      "البيانات مشفرة أثناء النقل وأثناء التخزين. العميل يملك بياناته ويحتفظ بحق الحذف الكامل. لا تُستخدم بيانات العملاء لتدريب نماذج الذكاء الاصطناعي.",
    points: [
      "TLS 1.3 لجميع الاتصالات",
      "تشفير قاعدة البيانات أثناء الراحة",
      "المستأجر يملك مفاتيح تشفير بياناته (خطة مستقبلية)",
      "حق الحذف الكامل وإثبات التنفيذ",
      "بيانات العملاء لا تُغذّي نماذج خارجية",
    ],
    accent: "from-cyan-500/10 to-teal-600/5",
    border: "border-cyan-500/20",
    tag: "تشفير وملكية",
  },
];

const aiGovernanceRules = [
  {
    rule: "لا قرار نهائي بدون إنسان",
    detail: "النظام يقترح ويحلل. الموافقة النهائية دائماً للإنسان المعتمَد.",
  },
  {
    rule: "لا تصدير بدون إذن",
    detail: "أي تقرير أو مستند يُصدَّر يتطلب إذناً صريحاً من صاحب الصلاحية.",
  },
  {
    rule: "لا توصية بدون دليل",
    detail: "كل مخرج ذكاء اصطناعي مرتبط بمصدره. لا استنتاج معلق في الهواء.",
  },
  {
    rule: "لا وصول بدون هوية",
    detail: "جميع الطلبات مرتبطة بمستخدم محدد. لا جلسات مجهولة داخل المنصة.",
  },
  {
    rule: "لا تعديل على سجل التدقيق",
    detail: "سجلات التدقيق غير قابلة للتعديل أو الحذف حتى من مسؤول النظام.",
  },
  {
    rule: "لا تشارك بيانات بين مستأجرين",
    detail: "العزل مطلق. بيانات المؤسسة لا تُرى ولا تُستخدم خارج نطاقها.",
  },
];

const deploymentControls = [
  {
    env: "السحابة المُدارة",
    status: "متاح",
    statusColor: "text-emerald-400",
    dot: "bg-emerald-400 animate-pulse",
    details: [
      "استضافة في منطقة سعودية (AWS Riyadh / Azure UAE مؤقتاً)",
      "عزل شبكي على مستوى المستأجر",
      "نسخ احتياطية يومية مشفرة",
      "مراقبة مستمرة واستجابة للحوادث",
    ],
  },
  {
    env: "الخوادم الخاصة",
    status: "قيد التخطيط",
    statusColor: "text-amber-400",
    dot: "bg-amber-400/60",
    details: [
      "نشر داخل البنية التحتية للعميل",
      "سيطرة كاملة على الشبكة والبيانات",
      "تحديثات مُوجَّهة بموافقة العميل",
      "دعم تقني مباشر لبيئة الإنتاج",
    ],
  },
  {
    env: "البيئة المعزولة (Air-Gapped)",
    status: "استراتيجي",
    statusColor: "text-white/35",
    dot: "bg-white/20",
    details: [
      "بيئة منفصلة تماماً عن الإنترنت",
      "مخصصة للبيئات الحكومية الحساسة",
      "تتطلب تعاوناً هندسياً معمقاً",
      "ليست متاحة حالياً كمنتج جاهز",
    ],
  },
];

export default function SecurityPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="relative mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              الأمن المؤسسي
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              الأمن ليس طبقة إضافية
              <br />
              <span className="text-aqliya-cyan">هو بنية أساسية</span>
            </h1>
            <p className="mt-5 text-base leading-8 text-white/62 sm:text-lg">
              كل نظام من أنظمة عقلية مبني فوق طبقة أمن مؤسسي واحدة: تحكم بالوصول،
              سجلات تدقيق، تتبع أدلة، عزل بين المستأجرين، وبوابات موافقة إنسانية
              إلزامية — لا يمكن تجاوزها.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-white/45">
              {[
                "RBAC متعدد المستويات",
                "Audit Trail غير قابل للتعديل",
                "Human-in-the-Loop إلزامي",
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-aqliya-cyan/60" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Governance Principle Banner */}
      <section className="border-b border-white/5 bg-gradient-to-r from-aqliya-deep via-aqliya-indigo/20 to-aqliya-deep py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:gap-8">
            <p className="text-lg font-black text-white">
              الذكاء يساعد. الإنسان يقرر. الدليل يحكم.
            </p>
            <span className="hidden text-white/20 sm:block">|</span>
            <p className="text-sm text-white/50">
              AI assists. Humans decide. Evidence governs.
            </p>
          </div>
        </div>
      </section>

      {/* 6 Security Pillars */}
      <section className="section-gradient-dark border-b border-white/5 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              ستة ركائز أمنية مؤسسية
            </h2>
            <p className="mt-4 text-base text-white/50 sm:text-lg">
              كل ركيزة مبنية داخل AQLIYA Intelligence Core ومطبقة بالتساوي على
              جميع الأنظمة الفوقية
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {securityPillars.map((pillar) => (
              <div
                key={pillar.id}
                className={`gradient-border rounded-[20px] bg-gradient-to-br ${pillar.accent} p-6`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className={`rounded-full border ${pillar.border} bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/70`}
                  >
                    {pillar.label}
                  </span>
                  <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-white/35">
                    {pillar.tag}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">{pillar.title}</h3>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-white/40">
                  {pillar.subtitle}
                </p>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  {pillar.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {pillar.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-white/55">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-aqliya-cyan/60" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Governance Rules */}
      <section className="border-b border-white/5 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              قواعد حوكمة الذكاء الاصطناعي
            </h2>
            <p className="mt-4 text-base text-white/50 sm:text-lg">
              قيود هندسية صارمة — لا يمكن تجاوزها حتى من قِبل المطور
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {aiGovernanceRules.map((item) => (
              <div
                key={item.rule}
                className="glass-card rounded-2xl p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-aqliya-cyan" />
                  <div>
                    <p className="font-bold text-white">{item.rule}</p>
                    <p className="mt-1.5 text-sm leading-6 text-white/55">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deployment Controls */}
      <section className="section-gradient-dark border-b border-white/5 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              ضوابط بيئات النشر
            </h2>
            <p className="mt-4 text-base text-white/50 sm:text-lg">
              شفافية كاملة حول ما هو متاح الآن وما هو قيد التخطيط
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {deploymentControls.map((env) => (
              <div key={env.env} className="glass-card rounded-2xl p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="font-black text-white">{env.env}</h3>
                  <span className={`flex items-center gap-2 text-xs font-semibold ${env.statusColor}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${env.dot}`} />
                    {env.status}
                  </span>
                </div>
                <ul className="space-y-3">
                  {env.details.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-white/55">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/30" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
            <p className="text-sm font-semibold text-amber-400">
              ملاحظة: البيئة المعزولة (Air-Gapped) ليست منتجاً جاهزاً حالياً
            </p>
            <p className="mt-1.5 text-sm text-white/50">
              نرفض الادعاء بجاهزية ما لم يكن جاهزاً. إذا كانت مؤسستك تحتاج بيئة
              معزولة، يمكننا مناقشة جدوى وتكلفة التصميم المشترك في جلسة تقنية مخصصة.
            </p>
          </div>
        </div>
      </section>

      {/* Data Ownership */}
      <section className="border-b border-white/5 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
                ملكية البيانات
              </span>
              <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                بياناتك ملكك أنت
                <br />
                <span className="text-white/50">لا ملكنا</span>
              </h2>
              <p className="mt-5 text-base leading-8 text-white/60">
                عقلية لا تستخدم بيانات العملاء لتدريب نماذج الذكاء الاصطناعي.
                لا مشاركة، لا تحليل عبر المستأجرين، لا استخلاص أنماط تشغيلية من
                بيانات مؤسستك لتحسين عروض طرف ثالث.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "حق الحذف الكامل مع إثبات التنفيذ",
                  "لا استخدام للبيانات في التدريب أو التحسين الخارجي",
                  "تصدير كامل للبيانات عند إنهاء التعاقد",
                  "سياسة احتفاظ يحددها العميل لا المنصة",
                  "مراجعة دورية لسياسات الوصول الداخلية",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/65">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  استضافة البيانات
                </p>
                <p className="mt-2 text-lg font-bold text-white">
                  منطقة سعودية — بشكل افتراضي
                </p>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  البيانات تُخزَّن داخل منطقة سحابية في السعودية أو الخليج
                  كخيار افتراضي. الاستضافة خارج المنطقة تتطلب موافقة صريحة من
                  العميل.
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  التعامل مع نماذج الذكاء الاصطناعي
                </p>
                <p className="mt-2 text-lg font-bold text-white">
                  معالجة فورية — لا تخزين
                </p>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  البيانات التي تُرسَل إلى نماذج الذكاء الاصطناعي تُعالَج
                  فورياً ولا تُحفَظ لدى مزود النموذج. عقود عدم الاستخدام
                  مفعّلة مع جميع المزودين.
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  الامتثال والتدقيق الخارجي
                </p>
                <p className="mt-2 text-lg font-bold text-white">
                  جاهزون للمراجعة — لا شهادات مُدّعاة
                </p>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  لا ندّعي شهادات SOC2 أو ISO لم نحصل عليها بعد. نحن شركة
                  ناشئة تبني بنيتها الأمنية بمسؤولية — وجاهزون لجلسة تقنية
                  مفتوحة مع فريقك الأمني.{" "}
                  <Link href="/soc2-roadmap" className="text-aqliya-cyan underline">
                    خارطة SOC2 المستهدفة →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Procurement pack */}
      <section className="border-t border-white/5 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              حزمة التقييم للمشتريات
            </p>
            <h2 className="mt-4 text-2xl font-black text-white">
              وثائق جاهزة لفريق المشتريات والأمن
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/60">
              نطاق التقييم التشغيلي، معايير النجاح، ملخص الأمن، نماذج التعاون، وإطار
              قرار بالأدلة — متاحة عبر{" "}
              <Link href="/proof" className="text-aqliya-cyan underline">
                مركز الإثبات
              </Link>{" "}
              و{" "}
              <Link href="/start#procurement" className="text-aqliya-cyan underline">
                دليل المشتريات
              </Link>
              .
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link href="/procurement-pack" className="btn-primary px-6 py-2.5 text-sm">
                حزمة المشتريات
              </Link>
              <Link href="/proof" className="btn-secondary px-6 py-2.5 text-sm">
                مركز الإثبات
              </Link>
              <Link href="/start#engagement" className="btn-outline px-6 py-2.5 text-sm">
                نماذج التعاون
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="gradient-border rounded-[28px] bg-gradient-to-br from-aqliya-deep via-aqliya-indigo/30 to-aqliya-deep p-10 text-center sm:p-14">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              هل أنت المسؤول الأمني أو التقني في مؤسستك؟
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/60">
              يمكننا ترتيب جلسة تقنية مخصصة لمناقشة بنية الأمن، سياسات
              البيانات، وآليات الحوكمة بعمق — مع الفريق الهندسي مباشرة.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact" className="btn-primary px-8 py-3.5 text-base">
                طلب جلسة تقنية أمنية
              </Link>
              <Link href="/governance" className="btn-outline px-8 py-3.5 text-base">
                بنية الحوكمة الكاملة
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
