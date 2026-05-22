import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "بيئات النشر | AQLIYA",
  description:
    "خيارات نشر واضحة وصادقة لمنصة عقلية — سحابة مُدارة، خوادم خاصة (قيد التخطيط)، بيئة معزولة (استراتيجي). إقامة البيانات في المملكة العربية السعودية.",
};

const deploymentModels = [
  {
    id: "cloud",
    name: "السحابة المُدارة",
    nameEn: "Managed Cloud",
    status: "متاح الآن",
    statusEn: "Available Now",
    dotColor: "bg-emerald-400 animate-pulse",
    statusColor: "text-emerald-400",
    borderColor: "border-emerald-500/20",
    accentBg: "from-emerald-500/8 to-green-600/3",
    description:
      "البيئة الإنتاجية الجاهزة لمعظم المؤسسات. عقلية تُدير البنية التحتية، التحديثات، الأمن، وضمان الاستمرارية — بينما تتحكم مؤسستك كاملاً في بياناتها وصلاحياتها.",
    features: [
      {
        label: "إقامة البيانات",
        value: "منطقة سحابية سعودية / خليجية بشكل افتراضي",
      },
      {
        label: "العزل",
        value: "عزل كامل على مستوى قاعدة البيانات ومنطق التطبيق",
      },
      { label: "التوفر المستهدف", value: "99.5% شهرياً" },
      { label: "التحديثات", value: "مُدارة بإشعار مسبق" },
      { label: "الاحتياطية", value: "نسخ يومية مشفرة" },
      { label: "المراقبة", value: "مستمرة مع استجابة للحوادث" },
    ],
    bestFor: ["المؤسسات التي تريد البدء بسرعة", "الفرق التقنية المحدودة", "مشاريع الاستكشاف والتوسع التدريجي"],
    note: null,
  },
  {
    id: "private",
    name: "الخوادم الخاصة",
    nameEn: "Private Cloud",
    status: "قيد التخطيط",
    statusEn: "Planned",
    dotColor: "bg-amber-400/70",
    statusColor: "text-amber-400",
    borderColor: "border-amber-500/20",
    accentBg: "from-amber-500/8 to-orange-600/3",
    description:
      "نشر المنصة كاملاً داخل البنية التحتية السحابية الخاصة بمؤسستك. سيطرة مطلقة على الشبكة والبيانات والتحديثات — مع دعم هندسي مباشر من فريق عقلية.",
    features: [
      {
        label: "البنية التحتية",
        value: "AWS / Azure / GCP داخل حساب المؤسسة",
      },
      { label: "إقامة البيانات", value: "داخل بيئة المؤسسة كاملاً" },
      { label: "التحكم بالشبكة", value: "سياسات VPC خاصة بالمؤسسة" },
      { label: "التحديثات", value: "بموافقة واختبار من فريق المؤسسة" },
      { label: "التكامل", value: "مع IAM، HSM، وأدوات أمن المؤسسة" },
      { label: "الدعم", value: "مهندس دعم مخصص" },
    ],
    bestFor: [
      "المؤسسات ذات متطلبات إقامة بيانات صارمة",
      "القطاع المالي والحكومي والطاقة",
      "المؤسسات التي لديها فرق أمن داخلية متقدمة",
    ],
    note: "هذا النموذج يتطلب تعاوناً هندسياً مسبقاً وتقييم جدوى مشتركاً. إذا كنت مهتماً، يمكننا مناقشة المتطلبات والجدول الزمني في جلسة تقنية.",
  },
  {
    id: "airgapped",
    name: "البيئة المعزولة",
    nameEn: "Air-Gapped",
    status: "استراتيجي",
    statusEn: "Strategic",
    dotColor: "bg-white/20",
    statusColor: "text-white/40",
    borderColor: "border-white/8",
    accentBg: "from-white/3 to-transparent",
    description:
      "بيئة تشغيل منفصلة تماماً عن الإنترنت، مخصصة لأشد البيئات حساسية — سواء حكومية أو دفاعية أو تنظيمية. ليست منتجاً جاهزاً حالياً.",
    features: [
      { label: "الاتصال", value: "لا اتصال بالإنترنت — معزولة شبكياً" },
      { label: "النماذج", value: "تعمل محلياً بدون اعتماد على سحابة" },
      { label: "التحديثات", value: "عبر وسائط فيزيائية آمنة" },
      { label: "الهوية", value: "تكامل مع أنظمة هوية داخلية" },
      { label: "المتطلبات", value: "تصميم مشترك معمق مع الفريق الهندسي" },
      { label: "التوفر الحالي", value: "غير متاح كمنتج جاهز" },
    ],
    bestFor: [
      "الجهات الحكومية ذات الحساسية القصوى",
      "البيئات التي تمنع أي اتصال خارجي",
      "المشاريع الاستراتيجية طويلة الأمد",
    ],
    note: "نرفض ادعاء الجاهزية لما لم يكن جاهزاً. إذا كانت مؤسستك تحتاج هذا النموذج، يمكننا مناقشة إمكانية التصميم المشترك كمشروع استراتيجي خاص.",
  },
];

const dataResidencyPoints = [
  {
    title: "السعودية كخيار افتراضي",
    body: "البيانات تُخزَّن في منطقة سحابية سعودية أو خليجية بشكل افتراضي — دون الحاجة لطلب خاص.",
  },
  {
    title: "لا نقل خارج المنطقة بدون موافقة",
    body: "أي نقل للبيانات خارج المنطقة الجغرافية المتفق عليها يتطلب موافقة كتابية صريحة من المؤسسة.",
  },
  {
    title: "التزام باللوائح المحلية",
    body: "نتابع متطلبات هيئة الاتصالات وتقنية المعلومات والجهات التنظيمية السعودية والخليجية المتعلقة بحماية البيانات.",
  },
  {
    title: "شفافية حول مزودي السحابة",
    body: "نُعلن بوضوح عن مزودي البنية التحتية المستخدمين — لا توريط خفي في عقود أطراف ثالثة.",
  },
];

const customerControlPoints = [
  {
    icon: "01",
    title: "تحكم كامل بالمستخدمين والأدوار",
    body: "مسؤول النظام في مؤسستك يضيف ويُعدّل ويحذف المستخدمين بشكل مستقل. عقلية لا تحتفظ بوصول تشغيلي لبياناتك.",
  },
  {
    icon: "02",
    title: "تصدير كامل في أي وقت",
    body: "يمكنك تصدير كامل بياناتك وسجلات تدقيقك في أي وقت بصيغ قابلة للقراءة الآلية — دون الحاجة لموافقة عقلية.",
  },
  {
    icon: "03",
    title: "سياسة احتفاظ تحددها أنت",
    body: "مدة الاحتفاظ بالبيانات يحددها عقدك — ليست قراراً منفرداً من عقلية. يمكن تمديدها أو تقصيرها بحسب متطلبات الامتثال.",
  },
  {
    icon: "04",
    title: "حق الحذف الكامل مع الإثبات",
    body: "عند إنهاء التعاقد، تُنفَّذ عملية حذف كاملة خلال 30 يوماً مع تقديم شهادة حذف موقعة.",
  },
];

export default function DeploymentPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="relative mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              بيئات النشر
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              نشر واضح وصادق
              <br />
              <span className="text-aqliya-cyan">بدون ادعاءات زائفة</span>
            </h1>
            <p className="mt-5 text-base leading-8 text-white/62 sm:text-lg">
              ثلاثة نماذج نشر بمستويات جاهزية مختلفة — نُعلن عنها بشفافية تامة.
              ما هو متاح الآن، وما هو قيد التخطيط أو التعاون الاستراتيجي
              — كل شيء مُعلَن بوضوح.
            </p>
          </div>
        </div>
      </section>

      {/* 3 Deployment Models */}
      <section className="section-gradient-dark border-b border-white/5 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 lg:grid-cols-3">
            {deploymentModels.map((model) => (
              <div
                key={model.id}
                className={`rounded-[20px] border ${model.borderColor} bg-gradient-to-br ${model.accentBg} p-7`}
              >
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-white">{model.name}</h3>
                    <span
                      className={`flex items-center gap-1.5 text-xs font-semibold ${model.statusColor}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${model.dotColor}`} />
                      {model.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-white/35">
                    {model.nameEn}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/60">
                    {model.description}
                  </p>
                </div>

                {/* Features */}
                <div className="mb-5 space-y-2.5">
                  {model.features.map((f) => (
                    <div key={f.label} className="flex items-start justify-between gap-3 text-xs">
                      <span className="text-white/40">{f.label}</span>
                      <span className="text-right font-medium text-white/70">{f.value}</span>
                    </div>
                  ))}
                </div>

                {/* Best for */}
                <div className="mb-4">
                  <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    الأنسب لـ
                  </p>
                  <ul className="space-y-1.5">
                    {model.bestFor.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-white/55">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-aqliya-cyan/50" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Note */}
                {model.note && (
                  <div className="rounded-lg border border-white/8 bg-white/5 p-3">
                    <p className="text-xs leading-5 text-white/50">{model.note}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Residency */}
      <section className="border-b border-white/5 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              إقامة البيانات وسيادتها
            </h2>
            <p className="mt-4 text-base text-white/50 sm:text-lg">
              مبادئ واضحة حول أين تُخزَّن بياناتك ومن يتحكم فيها
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {dataResidencyPoints.map((item) => (
              <div key={item.title} className="glass-card rounded-2xl p-6">
                <h3 className="font-black text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/60">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Control */}
      <section className="section-gradient-dark border-b border-white/5 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              التحكم المؤسسي
            </h2>
            <p className="mt-4 text-base text-white/50 sm:text-lg">
              ما تتحكم فيه مؤسستك — بشكل مباشر وبدون وساطة
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {customerControlPoints.map((item) => (
              <div key={item.icon} className="flex items-start gap-5 glass-card rounded-2xl p-6">
                <span className="text-3xl font-black text-white/10">{item.icon}</span>
                <div>
                  <h3 className="font-black text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/60">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="gradient-border rounded-[28px] bg-gradient-to-br from-aqliya-deep via-aqliya-indigo/30 to-aqliya-deep p-10 text-center sm:p-14">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              لديك متطلبات نشر خاصة؟
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/60">
              يمكننا ترتيب جلسة تقنية مع فريق البنية التحتية لمناقشة
              متطلباتك المحددة — سواء كانت إقامة البيانات، متطلبات الأمن،
              أو نموذج التشغيل المناسب لمؤسستك.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact" className="btn-primary px-8 py-3.5 text-base">
                ناقش متطلبات النشر
              </Link>
              <Link href="/security" className="btn-outline px-8 py-3.5 text-base">
                بنية الأمن المؤسسي
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
