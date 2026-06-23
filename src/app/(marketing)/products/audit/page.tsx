import Link from "next/link";
import type { Metadata } from "next";
import {
  SectionEyebrow,
  BeforeAfterBlock,
  EnterpriseCTA,
} from "@/components/enterprise";

export const metadata: Metadata = {
  title: "AuditOS — نظام تشغيل المراجعة والالتزام | AQLIYA",
  description:
    "من قبول العميل إلى إصدار التقرير. نظام تشغيل المراجعة والالتزام يغطي دورة المراجعة بالكامل: القبول، الاستقلالية، التخطيط، التنفيذ، المراجعة، الجودة، والإصدار.",
};

const journeySteps = [
  {
    number: "01",
    title: "قبول العميل",
    subtitle: "Client Acceptance",
    desc: "إدارة العملاء المحتملين، فحص العناية الواجبة (KYC)، تقييم المخاطر، وقرار القبول مع الاعتماد.",
    engine: "Client Acceptance Engine",
    capabilities: ["خط أنابيب العملاء المحتملين", "تقييم مخاطر بخمسة أبعاد", "اعتماد الشريك", "المراجعة الدورية للاستمرار"],
    icon: "👥",
  },
  {
    number: "02",
    title: "الاستقلالية",
    subtitle: "Independence",
    desc: "إدارة سجل الاستقلالية، المصالح المالية، علاقات العمل، وتقييم التهديدات وفقاً لمدونة IESBA.",
    engine: "Independence Engine",
    capabilities: ["سجل الاستقلالية", "الكشف عن التعارضات", "تقييم التهديدات (5 فئات)", "التأكيد السنوي"],
    icon: "🛡️",
  },
  {
    number: "03",
    title: "التخطيط والمادية",
    subtitle: "Planning & Materiality",
    desc: "حساب الأهمية النسبية وفقاً لـ ISA 320 مع دعم منهجيات متعددة، اعتماد الشريك، وتوثيق ورقة العمل.",
    engine: "Materiality Engine",
    capabilities: ["منهجيات ISA 320", "حساب PM / Performance / Trivial", "اعتماد إلكتروني", "ورقة عمل آلية"],
    icon: "📐",
  },
  {
    number: "04",
    title: "ميزان المراجعة والتصنيف",
    subtitle: "Trial Balance & Mapping",
    desc: "رفع ميزان المراجعة، تصنيف الحسابات، الربط بالمعايير المحاسبية (IFRS/SOCPA)، والتحقق من التوازن.",
    engine: "Trial Balance Engine + AI Mapping",
    capabilities: ["رفع إكسيل مباشر", "تصنيف ذكي بالذكاء الاصطناعي", "التحقق من التوازن", "ربط بالمعايير"],
    icon: "📊",
  },
  {
    number: "05",
    title: "القوائم المالية والإيضاحات",
    subtitle: "Financial Statements & Notes",
    desc: "توليد القوائم المالية والإيضاحات المرتبطة بالأدلة، مع مسار مراجعة واعتماد كامل.",
    engine: "Statements Engine + AI Draft",
    capabilities: ["قوائم مالية آلية", "إيضاحات بمساعدة AI", "ربط ببند القائمة", "مراجعة واعتماد"],
    icon: "📋",
  },
  {
    number: "06",
    title: "أخذ العينات",
    subtitle: "Audit Sampling",
    desc: "عينات إحصائية (عشوائي، طبقي، منتظم، MUS) مع توثيق النتائج والأدلة لكل بند والتحقق من المنهجية.",
    engine: "Sampling Engine",
    capabilities: ["4 مناهج إحصائية", "توثيق الأدلة لكل بند", "مراجعة المنهجية", "استقراء النتائج"],
    icon: "🎯",
  },
  {
    number: "07",
    title: "الأدلة والنتائج",
    subtitle: "Evidence & Findings",
    desc: "ربط الأدلة بالبنود والحسابات، تسجيل النتائج، التوصيات، ومسار المراجعة الكامل.",
    engine: "Evidence Vault + Findings Engine",
    capabilities: ["خزينة أدلة بالإصدارات", "ربط ثنائي الاتجاه", "تصنيف النتائج", "توصيات آلية"],
    icon: "📁",
  },
  {
    number: "08",
    title: "أوراق العمل",
    subtitle: "Working Papers",
    desc: "ملف تدقيق متكامل: قوائم ربط، مراجعة تحليلية، اختبارات رقابة، اختبارات موضوعية، وإجراءات الإكمال.",
    engine: "Working Papers Engine",
    capabilities: ["6 أنواع من أوراق العمل", "ترقيم ومراجع تبادلية", "توثيق المنهجية", "التوقيع والإغلاق"],
    icon: "📑",
  },
  {
    number: "09",
    title: "ملاحظات المراجعة",
    subtitle: "Review Notes",
    desc: "دورة حياة كاملة لملاحظات المراجعة من الرفع إلى الإغلاق مع مؤشرات الأداء والتصعيد.",
    engine: "Review Notes Engine",
    capabilities: ["دورة حياة كاملة (7 حالات)", "مؤشرات SLA", "التصعيد التلقائي", "تقارير الأداء"],
    icon: "💬",
  },
  {
    number: "10",
    title: "الجودة ISQM1",
    subtitle: "Quality Management",
    desc: "نظام إدارة جودة متكامل وفقاً لـ ISQM1: الأهداف، المخاطر، الاستجابات، المراقبة، النتائج، والمعالجات.",
    engine: "ISQM1 Quality Engine",
    capabilities: ["أهداف الجودة", "مخاطر واستجابات", "أنشطة مراقبة", "نتائج ومعالجات", "التقييم السنوي"],
    icon: "✅",
  },
  {
    number: "11",
    title: "التقرير والنشر",
    subtitle: "Report & Publication",
    desc: "إصدار تقرير المراجعة مع حزمة النشر الكاملة: القوائم، الإيضاحات، النتائج، والتوصيات.",
    engine: "Publication Engine",
    capabilities: ["حزمة نشر كاملة", "قفل بعد النشر", "سجل تدقيق", "تصدير ثنائي اللغة"],
    icon: "📤",
  },
  {
    number: "12",
    title: "الأرشفة والمعرفة",
    subtitle: "Archive & Knowledge",
    desc: "أرشفة المهام المكتملة واستخلاص الأنماط المعرفية لتحسين جودة المهام المستقبلية.",
    engine: "Knowledge Engine",
    capabilities: ["أرشفة المهام", "أنماط متكررة (%82)", "توصيات ذكية", "معايير قطاعية"],
    icon: "🧠",
  },
];

const outputs = [
  "قرار قبول العميل",
  "شهادة الاستقلالية",
  "ورقة عمل الأهمية النسبية",
  "ميزان مراجعة مصنف",
  "قوائم مالية وإيضاحات",
  "خطة العينة ونتائجها",
  "خزينة أدلة بالإصدارات",
  "ملف أوراق عمل كامل",
  "ملاحظات المراجعة المغلقة",
  "تقرير الجودة ISQM1",
  "تقرير المراجعة النهائي",
  "ملف المعرفة التدقيقية",
];

const regulatoryItems = [
  { name: "SOCPA", desc: "متطلبات الهيئة السعودية للمراجعين والمحاسبين" },
  { name: "IFRS", desc: "المعايير الدولية للتقارير المالية" },
  { name: "ISA", desc: "معايير التدقيق الدولية (320, 230, 530, 220)" },
  { name: "ISQM1", desc: "إدارة الجودة في مكاتب المراجعة" },
  { name: "IESBA", desc: "مدونة السلوك الأخلاقي والاستقلالية" },
  { name: "ZATCA", desc: "متطلبات هيئة الزكاة والضريبة والجمارك" },
];

export default function AuditProductPage() {
  return (
    <div className="flex flex-col gap-20 sm:gap-28">
      {/* ===== HERO ===== */}
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <Link
            href="/products"
            className="relative text-sm text-white/45 hover:text-white/70 transition-colors"
          >
            ← العودة إلى أنظمة التشغيل
          </Link>
          <div className="relative max-w-4xl">
            <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              AuditOS / نظام تشغيل المراجعة والالتزام
            </span>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              مسار مراجعة متكامل — من القبول إلى حزمة الارتباط
            </div>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              من قبول العميل<br />
              <span className="text-aqliya-cyan">إلى إصدار التقرير</span>
              <br />
              في منصة واحدة
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              AuditOS ليس برنامج مراجعة. هو نظام تشغيل المراجعة والالتزام. 
              12 محطة مترابطة تغطي دورة المراجعة بالكامل — مع حوكمة، أدلة، 
              مراجعة، اعتماد، وسجل تدقيق لا يقبل التعديل.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/auditos"
                className="btn-primary inline-flex h-12 items-center gap-2 px-8 text-sm"
              >
                عرض توضيحي (4 دقائق)
              </Link>
              <Link
                href="/custom-product"
                className="btn-secondary inline-flex h-12 items-center gap-2 px-8 text-sm"
              >
                ناقش التفعيل لمكتبك
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== THE PROBLEM / BEFORE-AFTER ===== */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow label="لماذا AuditOS بدلاً من Excel" title="مكاتب المراجعة تحتاج منصة وليس برنامجاً" />
        <BeforeAfterBlock
          before={[
            "Excel لقبول العملاء — بريد إلكتروني وملفات مبعثرة",
            "الاستقلالية — أزمة سنوية وفحص يدوي للتعارضات",
            "الأهمية النسبية — جداول منسوخة بدون تتبع الإصدارات",
            "أوراق العمل — 50 ملفاً منفصلاً بدون ربط أو ترقيم",
            "ملاحظات المراجعة — بريد إلكتروني وواتساب بدون متابعة",
            "الجودة ISQM1 — مجلدات ورقية قبل الفحص التنظيمي",
            "المعرفة — تروح برحيل كبير المحاسبين",
          ]}
          after={[
            "قبول عملاء — مسار محكوم بمخاطر مقاسة واعتماد الشريك",
            "الاستقلالية — سجل حي مع كشف تعارضات فوري",
            "الأهمية النسبية — ISA 320 بنقرة واحدة مع ورقة عمل",
            "أوراق العمل — ملف تدقيق متكامل بمراجع تبادلية",
            "ملاحظات المراجعة — دورة حياة مع SLA وتصعيد تلقائي",
            "الجودة ISQM1 — نظام رقمي متكامل مع تقييم سنوي",
            "المعرفة — أنماط مستخلصة من 82% من المهام السابقة",
          ]}
        />
      </section>

      {/* ===== FULL JOURNEY ===== */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow label="دورة المراجعة الكاملة" title="12 محطة. منصة واحدة." description="كل محطة تبني على التي قبلها. كل مخرج مرتبط بمصدره، مراجعته، واعتماده." />

        <div className="mt-12 space-y-4">
          {journeySteps.map((step, i) => (
            <div
              key={step.number}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-6 transition-all hover:border-white/10 hover:bg-white/[0.06] sm:p-8"
            >
              {/* Connector line */}
              {i < journeySteps.length - 1 && (
                <div className="absolute right-8 top-full h-4 w-px bg-gradient-to-b from-white/20 to-transparent" />
              )}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl">
                  {step.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                    <span className="text-xs font-semibold text-aqliya-cyan">
                      الخطوة {step.number}
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      {step.title}
                    </h3>
                    <span className="hidden text-sm text-white/30 sm:inline">
                      {step.subtitle}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/50">
                    {step.desc}
                  </p>
                  <div className="mt-2">
                    <span className="text-[11px] font-mono text-aqliya-cyan/60">
                      {step.engine}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {step.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="inline-flex items-center rounded-full border border-white/5 bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-white/40"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== OUTPUTS ===== */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow label="مخرجات قابلة للتسليم" title="كل دورة مراجعة تنتج" />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {outputs.map((o) => (
            <div key={o} className="rounded-[24px] border border-border/70 bg-gradient-to-br from-background to-muted/30 p-6 shadow-sm">
              <span className="rounded-full border border-primary/10 bg-primary/[0.04] px-3.5 py-2 text-xs font-medium text-foreground">
                {o}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== REGULATORY COMPLIANCE ===== */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow label="مواكبة المتطلبات المهنية والتنظيمية" title="بني ليتوافق مع معايير المهنة" description="تتغير المعايير واللوائح باستمرار. AuditOS يساعد مكتبك على تطبيق متطلبات SOCPA، معايير IFRS، معايير ISA، متطلبات ISQM1، وتحديثات ZATCA ضمن منهجية عمل موحدة وقابلة للتدقيق." />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {regulatoryItems.map((item) => (
            <div
              key={item.name}
              className="rounded-xl border border-white/5 bg-white/[0.03] p-5"
            >
              <span className="text-sm font-bold text-aqliya-cyan">
                {item.name}
              </span>
              <p className="mt-1 text-sm leading-6 text-white/50">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <EnterpriseCTA
          title="جرب AuditOS بنفسك"
          description="استعرض دورة المراجعة الكاملة في 4 دقائق. أو ناقش كيف يمكن تفعيل AuditOS لمكتبك."
          primaryLabel="العرض التوضيحي"
          primaryHref="/auditos"
          secondaryLabel="ناقش التفعيل"
          secondaryHref="/custom-product"
        />
      </section>
    </div>
  );
}
