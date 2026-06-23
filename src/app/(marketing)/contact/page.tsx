import Link from "next/link";
import type { Metadata } from "next";
import { ContactForm } from "./contact-form";
import { publicOsStatus } from "@/lib/marketing/public-status";

export const metadata: Metadata = {
  title: "احجز جلسة تشخيص | AQLIYA",
  description:
    "ابدأ بجلسة تشخيص أو تقييم تشغيلي محكوم — مسار واحد، بيانات محدودة، ومعايير نجاح واضحة قبل أي التزام واسع.",
};

const products = [
  {
    name: "AuditOS",
    description: "للتدقيق، القوائم المالية، الأدلة، المراجعة، والاعتماد.",
    href: "/products/audit",
    status: publicOsStatus.auditOS.label,
    statusColor: "text-emerald-400",
  },
  {
    name: "LocalContentOS",
    description: "للمحتوى المحلي، الموردين، الأدلة، والتقارير.",
    href: "/products/local-content",
    status: publicOsStatus.localContentOS.label,
    statusColor: "text-amber-400",
  },
  {
    name: "DecisionOS",
    description: "للقرارات، السيناريوهات، المخاطر، والمراجعة.",
    href: "/products/decision",
    status: publicOsStatus.decisionOS.label,
    statusColor: "text-primary",
  },
  {
    name: "Office AI Assistant",
    description: "للمعرفة الداخلية، الإنتاجية، والمساعد المؤسسي المحكوم.",
    href: "/products/office-ai",
    status: publicOsStatus.officeAI.label,
    statusColor: "text-primary",
  },
];

const reviewElements = [
  {
    label: "سير العمل (Use Case)",
    detail:
      "ما العملية التي تريد تفعيلها؟ هل هي تدقيق، محتوى محلي، قرارات، أو مساعد مؤسسي؟",
  },
  {
    label: "حساسية البيانات",
    detail:
      "ما نوع البيانات التي سيدخلها النظام؟ هل تحتاج ترتيبات خصوصية أو بيئة مخصصة؟",
  },
  {
    label: "مالك سير العمل",
    detail:
      "من المسؤول عن تشغيل وإدارة سير العمل داخل مؤسستك؟ من هم المراجعون؟",
  },
  {
    label: "مسار المراجعة والاعتماد",
    detail: "كيف يتم الاعتماد حاليًا؟ من يقرر؟ ما الأدلة المطلوبة لكل قرار؟",
  },
  {
    label: "معايير النجاح",
    detail: "كيف نقيس نجاح التجربة؟ ما المخرجات المتوقعة في نطاق التقييم؟",
  },
];

const boundaries = [
  "لا ضمان امتثال — المخرجات أداة مساعدة، المسؤولية القانونية تبقى على عاتق الفريق المهني.",
  "لا استبدال للفرق المهنية — النظام يدعم، لا يحل محل الحكم البشري.",
  "لا أتمتة كاملة بدون مراجعة — كل مخرج يمر بمراجعة إنسانية قبل الاعتماد.",
  "لا التزام تفعيل قبل تقييم النطاق — التقييم التشغيلي لا يلزم بنشر كامل.",
  "لا استخدام بيانات حساسة بدون ترتيبات — نوضح معًا متطلبات الأمان والخصوصية قبل البداية.",
];

export default function ContactPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="relative mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              طلب تقييم تشغيلي محكوم
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              احجز جلسة تشخيص أو ناقش التفعيل المؤسسي
            </h1>
            <p className="mt-5 text-base leading-8 text-white/62 sm:text-lg">
              سير عمل واحد، مجموعة بيانات محدودة، ومعايير نجاح واضحة — قبل أي
              التزام واسع.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-white/45">
              {[
                "اختيار نظام التشغيل المناسب",
                "تقييم use case",
                "مخرجات مدعومة بالأدلة",
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

      {/* Pilot Intake Positioning */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-b border-white/5">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-aqliya-cyan">
            كيف تعمل المراجعة
          </p>
          <h2 className="mt-4 text-3xl font-black text-white">
            الهدف ليس بيعًا مباشرًا — بل تقييم مسار تشغيلي منظم
          </h2>
          <p className="mt-4 text-base leading-8 text-white/62">
            لا نبدأ بعقود أو التزامات طويلة. نحدد معًا سير العمل، البيانات، فريق
            المراجعة، معايير النجاح، والمخرجات المتوقعة. خلال ٢-٤ أسابيع، تخرج
            بتقييم واقعي: هل هذا النظام مناسب لمؤسستك، وما الخطوة التالية
            المنطقية.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-2xl font-bold text-white">١</p>
              <p className="mt-2 text-sm text-white/62">
                نحدد نظام التشغيل والمسار المناسب
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-2xl font-bold text-white">٢</p>
              <p className="mt-2 text-sm text-white/62">
                نحمّل البيانات في بيئة معزولة
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-2xl font-bold text-white">٣</p>
              <p className="mt-2 text-sm text-white/62">
                نقيم النتائج ونحدد الخطوة التالية
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Fit Cards */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-b border-white/5">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-aqliya-cyan">
            اختر نقطة البداية
          </p>
          <h2 className="mt-4 text-3xl font-black text-white">
            أي نظام تشغيل يناسب حالة الاستخدام لديك؟
          </h2>
          <p className="mt-4 text-base leading-8 text-white/62">
            كل نظام يُبني على نواة AQLIYA Intelligence Core — حوكمة، أدلة، سجل
            تدقيق، ومراجعة بشرية إلزامية.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {products.map((product) => (
            <div
              key={product.name}
              className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-white/20"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-bold text-white">{product.name}</h3>
                <span className={`text-xs font-medium ${product.statusColor}`}>
                  {product.status}
                </span>
              </div>
              <p className="mt-2 text-sm leading-7 text-white/62">
                {product.description}
              </p>
              <Link
                href={product.href}
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-aqliya-cyan hover:text-cyan-300 transition-colors"
              >
                استكشف نظام التشغيل ←
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* What We Review */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-b border-white/5">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-aqliya-cyan text-center">
            عناصر المراجعة
          </p>
          <h2 className="mt-4 text-3xl font-black text-white text-center">
            ماذا نقيّم قبل التقييم التشغيلي
          </h2>
          <p className="mt-4 text-base leading-8 text-white/62 text-center mb-10">
            خمسة عناصر نناقشها معك قبل البدء — لنضمن أن التجربة تقيس ما يهم
            فعلاً.
          </p>
          <div className="space-y-4">
            {reviewElements.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-5"
              >
                <p className="text-sm font-bold text-aqliya-cyan mb-1">
                  {item.label}
                </p>
                <p className="text-sm leading-7 text-white/62">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Will Not Promise */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-b border-white/5">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400 text-center">
              حدود واضحة
            </p>
            <h2 className="mt-3 text-2xl font-black text-white text-center">
              ما لن نعدك به
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/62 text-center mb-8">
              الثقة تبدأ من الصدق في تحديد ما لا يمكننا تقديمه.
            </p>
            <div className="space-y-3">
              {boundaries.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 shrink-0 text-amber-400/60 text-sm">
                    ⊘
                  </span>
                  <p className="text-sm leading-7 text-white/62">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ContactForm />

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8">
            <h2 className="text-2xl font-black text-white">
              ابدأ صغيرًا. راجع بوضوح. قرر بناءً على الدليل.
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/62">
              تقييم واحد لا يحدد مستقبل المؤسسة — لكنه يحدد بوضوح إذا كان
              المسار صحيحًا.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/pilot-proof"
                className="btn-outline px-6 py-2.5 rounded-xl text-sm"
                data-event="click_view_pilot_proof"
              >
                ← إطار التقييم التشغيلي
              </Link>
              <a
                href="mailto:ragheed@aqliya.com"
                className="btn-primary px-6 py-2.5 rounded-xl text-sm"
                data-event="click_contact_direct"
              >
                راسلنا مباشرة ←
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
