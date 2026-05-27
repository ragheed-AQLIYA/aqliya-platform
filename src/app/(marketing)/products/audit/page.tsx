import Link from "next/link";
import type { Metadata } from "next";
import {
  SectionEyebrow,
  BeforeAfterBlock,
  WorkflowChain,
  OutputCard,
  InsightCallout,
  ExecutiveSurface,
} from "@/components/enterprise";

export const metadata: Metadata = {
  title: "AuditOS — أول منتج مُثبت على AQLIYA | نظام المراجعة والذكاء المالي",
  description:
    "AuditOS هو أول منتج مُثبت على AQLIYA Intelligence Core. يحوّل ميزان المراجعة إلى مخرجات مالية محكومة مع ربط الأدلة، المراجعة البشرية، سير العمل، وسجل الاعتماد.",
};

const governanceFeatures = [
  "سجل تتبع كامل من ميزان المراجعة إلى الاعتماد",
  "مراجعة بشرية مطلوبة عند كل بوابة حوكمة",
  "تنبيه النواقص قبل بدء المراجعة",
  "الحكم المهني لا يتم تجاوزه أبدًا",
  "جاهزية الاعتماد واضحة في كل خطوة",
];

const pilotOutputs = [
  "ربط الحسابات مع إمكانية التعديل المهني",
  "مسودة القوائم المالية",
  "مسودة الإيضاحات والإفصاحات",
  "قائمة النواقص",
  "متطلبات الأدلة حسب منطقة الحسابات",
  "توصيات إعادة التصنيف",
  "ملاحظات المراجع",
  "حالة الجاهزية للاعتماد",
];

const excelChatGptComparison = [
  {
    label: "الدور",
    excel: "يحسب",
    chatgpt: "يكتب نصوصًا",
    auditos: "يحكم مسار الذكاء المالي",
  },
  {
    label: "ميزان المراجعة",
    excel: "خلايا خام",
    chatgpt: "مدخلات نصية",
    auditos: "إدخال منظم مع تحقق",
  },
  {
    label: "ربط الحسابات",
    excel: "معادلات يدوية",
    chatgpt: "اقتراحات عامة",
    auditos: "تصنيف محكوم مع إمكانية التعديل",
  },
  {
    label: "القوائم والإيضاحات",
    excel: "تجميع يدوي",
    chatgpt: "توليد غير منظم",
    auditos: "صياغة ضمن قوالب محكومة",
  },
  {
    label: "متطلبات الأدلة",
    excel: "لا يوجد",
    chatgpt: "لا يوجد",
    auditos: "منظمة ومربوطة بالحسابات",
  },
  {
    label: "مسار المراجعة",
    excel: "تعليقات، بريد",
    chatgpt: "لا يوجد",
    auditos: "طابور مراجعة مدمج مع ملاحظات",
  },
  {
    label: "مسار الاعتماد",
    excel: "لا يوجد",
    chatgpt: "لا يوجد",
    auditos: "تتبع كامل من الإدخال إلى الاعتماد",
  },
  {
    label: "الحكم البشري",
    excel: "متروك للمستخدم",
    chatgpt: "مخرج غير شفاف",
    auditos: "مطلوب عند كل بوابة حوكمة",
  },
];

export default function AuditProductPage() {
  return (
    <div className="flex flex-col gap-20 sm:gap-28">
      {/* ════════════════════════════════════════════
          1. HERO
          ════════════════════════════════════════════ */}
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/products"
              className="mb-8 inline-block text-xs text-white/40 transition-colors hover:text-white/60"
            >
              ← خطوط عقلية
            </Link>

            <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              AuditOS / أول تطبيق مثبت على نواة عقلية
            </span>

            <h1 className="text-4xl font-black leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-6xl">
              AuditOS — مسار عمل محكوم لإعداد وعرض ومراجعة التقارير المالية
            </h1>

            <p className="mt-5 text-base leading-8 text-white/65 sm:text-lg">
              AuditOS هو أول نظام مُثبت على AQLIYA Intelligence Core في مجال
              التدقيق والذكاء المالي. يساعد فرق المراجعة والمالية على تحويل
              ميزان المراجعة، التصنيفات، القوائم، الإيضاحات، الأدلة، والملاحظات
              إلى مسار قابل للمراجعة والتتبع — دون أن يستبدل الحكم المهني.
            </p>

            <p className="mt-3 text-sm leading-6 text-white/45">
              ليس أداة ذكاء اصطناعي عامة، ولا جدولة Excel. —{" "}
              <strong className="text-white/70">
                مساحة عمل حوكمة وإعداد محكومة، مصممة خصيصًا لأعمال المراجعة
                والتقارير المالية.
              </strong>
            </p>

            {/* Trust Principle — visible from the hero */}
            <div className="mt-6 rounded-2xl border border-aqliya-cyan/18 bg-aqliya-cyan/[0.05] px-5 py-4 backdrop-blur-sm">
              <p className="text-lg font-black text-white">
                الذكاء يساعد.{"  "}
                <span className="text-aqliya-cyan">الإنسان يقرر.</span>
                {"  "}
                الدليل يحكم.
              </p>
              <p className="mt-1 text-[11px] text-white/50">
                AI assists. Humans decide. Evidence governs.
              </p>
            </div>

            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row">
              <Link href="/auditos" className="btn-primary h-12 px-8 text-base">
                شاهد العرض التفاعلي
              </Link>
              <Link
                href="/custom-product"
                className="btn-secondary h-12 px-8 text-base"
              >
                طلب تجربة بايلوت
              </Link>
              <Link
                href="/proof-library"
                className="btn-outline border-white/15 text-white/70 hover:bg-white/5 h-12 px-8 text-base"
              >
                شاهد سير العمل
              </Link>
            </div>

            <p className="mt-5 text-xs text-white/30">
              مبني على AQLIYA Intelligence Core · سير عمل محكوم · مخرجات مدعومة
              بالأدلة · مراجعة بشرية إلزامية
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          2. ONE-LINER (Trust Bar)
          ════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6">
        <InsightCallout
          text="AuditOS يوضح كيف تتحول نواة عقلية إلى خط نظام مالي محكوم يربط البيانات، الأدلة، المراجعة، والاعتماد داخل مسار واحد قابل للتتبع."
          type="info"
          className="justify-center text-base leading-8"
        />
      </section>

      {/* ════════════════════════════════════════════
          3. PROBLEM
          ════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="المشكلة"
          title="التقارير المالية ما زالت متشظية بين ملفات ومراجعات منفصلة"
          description="ما زالت كثير من فرق المراجعة والمالية تنتقل من ميزان المراجعة إلى القوائم والإيضاحات والأدلة والمراجعة والاعتماد عبر ملفات متفرقة وتعليقات متشتتة. AuditOS يعالج ذلك كخط نظام مبني على AQLIYA Intelligence Core، لا كأداة نصوص أو أتمتة معزولة."
        />
        <div className="mt-10">
          <BeforeAfterBlock
            before={[
              "ملفات Excel متفرقة وتصنيف يدوي للحسابات",
              "أدلة وملاحظات ونتائج غير مرتبطة بالحسابات المصدر",
              "سياق المراجعة مفقود بين البريد الإلكتروني والتعليقات",
              "الاعتماد يعتمد على المتابعة الشخصية والذاكرة",
              "أدوات الذكاء الاصطناعي تولد نصوصًا دون حوكمة لمسار العمل",
            ]}
            after={[
              "مسار عمل محكوم من ميزان المراجعة إلى الاعتماد",
              "كل مخرج مرتبط بحساب مصدره",
              "الأدلة والملاحظات مربوطة بكل بند في القوائم",
              "جاهزية المراجعة واضحة في كل خطوة",
              "الاعتماد البشري في المركز، والذكاء الاصطناعي طبقة مساعدة",
            ]}
          />
        </div>
      </section>

      {/* ════════════════════════════════════════════
          4. WORKFLOW
          ════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="مسار العمل"
          title="مسار محكوم من البيانات الخام إلى مخرجات جاهزة للاعتماد"
        />
        <div className="mt-10">
          <ExecutiveSurface>
            <WorkflowChain
              steps={[
                "الارتباط",
                "ميزان المراجعة",
                "الربط",
                "القوائم",
                "الإيضاحات",
                "الأدلة",
                "الملاحظات",
                "المراجعة",
                "الاعتماد",
              ]}
              className="justify-center"
            />
          </ExecutiveSurface>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: "01",
              label: "الارتباط",
              desc: "تحديد نطاق العمل، الجهة، الفترة، المسؤوليات، ومعايير النجاح",
            },
            {
              step: "02",
              label: "ميزان المراجعة",
              desc: "إدخال أو مراجعة ميزان المراجعة كنقطة بداية مالية",
            },
            {
              step: "03",
              label: "الربط",
              desc: "ربط الحسابات بتصنيفات وقوائم مالية قابلة للمراجعة",
            },
            {
              step: "04",
              label: "القوائم",
              desc: "إعداد مخرجات القوائم المالية بناءً على الربط المعتمد",
            },
            {
              step: "05",
              label: "الإيضاحات",
              desc: "تنظيم الإيضاحات وربطها بالبند المالي والسياق المهني",
            },
            {
              step: "06",
              label: "الأدلة",
              desc: "ربط المستندات والمراجع الداعمة بالمخرجات",
            },
            {
              step: "07",
              label: "الملاحظات",
              desc: "توثيق ملاحظات المراجعة، الفجوات، أو نقاط المتابعة",
            },
            {
              step: "08",
              label: "المراجعة",
              desc: "مراجعة بشرية للمخرجات قبل الاعتماد",
            },
            {
              step: "09",
              label: "الاعتماد",
              desc: "اعتماد مضبوط مع أثر تتبع واضح",
            },
          ].map((item) => (
            <div key={item.step} className="rounded-lg border bg-muted/30 p-4">
              <span className="text-[10px] font-bold tracking-widest text-primary/60">
                {item.step}
              </span>
              <h3 className="mt-1 text-sm font-bold">{item.label}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-5">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
           5. GOVERNANCE — 4 Pillars
           ════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="الحوكمة"
          title="أربع ركائز تحكم كل مسار في AuditOS"
          description="كل مخرج، كل قرار، كل خطوة في AuditOS مبنية على هذه الركائز الأربع. ليست طبقة تُضاف — هي بنية النظام الأساسية."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Pillar 1: Human Review */}
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/20 p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-muted/40">
              <svg
                className="h-5 w-5 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <p className="text-sm font-black text-foreground">
              مراجعة بشرية إلزامية
            </p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              الذكاء يقترح — المراجع يقرر. كل مخرج يمر عبر مراجعة إنسانية قبل
              الاعتماد. لا استثناءات.
            </p>
          </div>

          {/* Pillar 2: Evidence-linked Outputs */}
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/20 p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-muted/40">
              <svg
                className="h-5 w-5 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <p className="text-sm font-black text-foreground">
              مخرجات مرتبطة بالأدلة
            </p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              كل بند في القوائم المالية مربوط بالأدلة الداعمة. لا مخرج بدون مصدر
              يمكن الرجوع إليه.
            </p>
          </div>

          {/* Pillar 3: Traceability */}
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/20 p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-muted/40">
              <svg
                className="h-5 w-5 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <p className="text-sm font-black text-foreground">
              إمكانية التتبع الكامل
            </p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              كل تغيير، مراجعة، واعتماد مسجل بالهوية والوقت والسياق. يمكن إرجاع
              أي مخرج إلى مصدره.
            </p>
          </div>

          {/* Pillar 4: Controlled Approval */}
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/20 p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-muted/40">
              <svg
                className="h-5 w-5 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <p className="text-sm font-black text-foreground">
              اعتماد محكوم ببوابات
            </p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              لا تصدير بدون موافقة. بوابات اعتماد في كل مرحلة: المراجعة،
              التعديل، الاعتماد النهائي.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <OutputCard
            title="مبادئ الحوكمة في AuditOS"
            items={governanceFeatures}
          />
        </div>
      </section>

      {/* ════════════════════════════════════════════
           6. WHAT AuditOS IS / IS NOT
           ════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl border-t border-border/50 px-6 py-16 sm:py-20">
        <SectionEyebrow
          label="ما هو AuditOS وما ليس"
          title="التحديد الواضح يحمي الثقة — نعم، هناك حدود"
          description="لأن الثقة المؤسسية تبدأ من الصدق في تحديد ما يفعله النظام وما لا يفعله."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {/* Is */}
          <div className="rounded-2xl border border-status-success/30 bg-gradient-to-br from-status-success/[0.04] to-background p-6 sm:p-8">
            <span className="mb-4 inline-flex rounded-full bg-status-success/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-status-success">
              ✓ AuditOS هو
            </span>
            <ul className="space-y-4">
              {[
                {
                  title: "مساحة عمل إعداد مراجعة محكومة",
                  desc: "بيئة منظمة تربط البيانات، الأدلة، المراجعة، والاعتماد في مسار واحد.",
                },
                {
                  title: "طبقة دعم لإعداد التقارير المالية",
                  desc: "تساعد في تحويل ميزان المراجعة إلى قوائم وإيضاحات ضمن قوالب محكومة.",
                },
                {
                  title: "مسار أدلة ومراجعة",
                  desc: "كل مخرج مربوط بمصدره. الأدلة منظمة. المراجعة موثقة.",
                },
                {
                  title: "منتج مُثبت جاهز للتجربة",
                  desc: "L5 Pilot-ready — يعمل على بيانات حقيقية مع فرق مراجعة حالية.",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-status-success/15">
                    <span className="text-[10px] text-status-success">✓</span>
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {item.title}
                    </p>
                    <p className="text-xs leading-5 text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Is Not */}
          <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.03] to-background p-6 sm:p-8">
            <span className="mb-4 inline-flex rounded-full bg-amber-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-amber-600">
              ✗ AuditOS ليس
            </span>
            <ul className="space-y-4">
              {[
                {
                  title: "بديلًا عن المراجع البشري",
                  desc: "الحكم المهني أساسي. الذكاء يساعد، لا يقرر.",
                },
                {
                  title: "صندوق أسود للذكاء الاصطناعي",
                  desc: "كل مخرج قابل للتفسير والتتبع. لا مخرجات بدون مصدر.",
                },
                {
                  title: "محرك تدقيق آلي بالكامل",
                  desc: "النظام يدعم التحضير والمراجعة — لا يقوم بالتدقيق نيابة عن المراجع.",
                },
                {
                  title: "ضمان امتثال أو اعتماد",
                  desc: "المخرجات أداة مساعدة للمراجع. المسؤولية القانونية تبقى على عاتق الفريق المهني.",
                },
                {
                  title: "شات بوت غير محكوم",
                  desc: "لا تفاعل مفتوح بدون صلاحيات. كل إجراء ضمن حدود الحوكمة والأدوار.",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
                    <span className="text-[10px] text-amber-600">✗</span>
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {item.title}
                    </p>
                    <p className="text-xs leading-5 text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between rounded-2xl border border-border/50 bg-muted/20 p-5">
          <div>
            <p className="text-sm font-bold text-foreground">المبدأ الأساسي</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              الذكاء يساعد. الإنسان يقرر. الدليل يحكم. — AI assists. Humans
              decide. Evidence governs.
            </p>
          </div>
          <Link
            href="/auditos"
            className="btn-outline h-9 px-5 text-sm shrink-0"
          >
            شاهد بنفسك — العرض التفاعلي
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════
           7. COMPARISON: WHY NOT EXCEL / CHATGPT
           ════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="المقارنة"
          title="AuditOS يحكم ما لا تستطيعه Excel و ChatGPT"
          description="Excel يحسب. ChatGPT يكتب. AuditOS يحكم مسار العمل. كأول تطبيق على AQLIYA Intelligence Core، يوفر AuditOS طبقة تشغيل محكومة لا يقدمها أي منهما، مصممة خصيصًا لأعمال المراجعة والتقارير المالية."
        />
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-0 rounded-xl border">
            <thead>
              <tr className="bg-muted/50">
                <th className="border-b px-4 py-3 text-right text-sm font-semibold text-muted-foreground">
                  البعد
                </th>
                <th className="border-b border-x px-4 py-3 text-center text-sm font-semibold text-destructive/60">
                  Excel
                </th>
                <th className="border-b border-x px-4 py-3 text-center text-sm font-semibold text-amber-600/60">
                  ChatGPT
                </th>
                <th className="border-b px-4 py-3 text-center text-sm font-semibold text-primary">
                  AuditOS
                </th>
              </tr>
            </thead>
            <tbody>
              {excelChatGptComparison.map((row, i) => (
                <tr
                  key={row.label}
                  className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}
                >
                  <td className="border-b px-4 py-3 text-sm font-medium">
                    {row.label}
                  </td>
                  <td className="border-b border-x px-4 py-3 text-center text-sm text-muted-foreground">
                    {row.excel}
                  </td>
                  <td className="border-b border-x px-4 py-3 text-center text-sm text-muted-foreground">
                    {row.chatgpt}
                  </td>
                  <td className="border-b px-4 py-3 text-center text-sm font-medium text-primary/80">
                    {row.auditos}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6">
          <InsightCallout
            text="AuditOS لا ينافس Excel كآلة حاسبة ولا ChatGPT ككاتب نصوص. إنه يوفر طبقة مسار عمل محكوم لا يقدمها أي منهما — مصممة خصيصًا لأعمال المراجعة والتقارير المالية."
            type="success"
            className="justify-center"
          />
        </div>
      </section>

      {/* ════════════════════════════════════════════
           8. PILOT READINESS
           ════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl border-t border-border/50 px-6 py-16 sm:py-20">
        <SectionEyebrow
          label="جاهزية التفعيل التجريبي"
          title="AuditOS جاهز لتجربة بايلوت محكومة — الآن"
          description="لا نبدأ بعقود ضخمة. نبدأ بنطاق واحد، مجموعة بيانات واحدة، ومعايير نجاح واضحة. هذه هي شروط التفعيل التجريبي:"
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              num: "01",
              title: "نطاق واحد",
              desc: "اختيار engagement واحد فقط — ميزان مراجعة حقيقي لفترة مالية واحدة.",
            },
            {
              num: "02",
              title: "مجموعة بيانات محدودة",
              desc: "البيانات الحقيقية للفترة المختارة. لا نحتاج إلى سنوات سابقة للتجربة.",
            },
            {
              num: "03",
              title: "معايير نجاح واضحة",
              desc: "نحدد معًا قبل البداية: ماذا نختبر، كيف نقيس النجاح، وما هي المخرجات المتوقعة.",
            },
            {
              num: "04",
              title: "مراجعة بشرية في كل خطوة",
              desc: "كل مخرج في التجربة يمر عبر مراجعة إنسانية. الذكاء يقترح — الفريق يقرر.",
            },
            {
              num: "05",
              title: "مخرجات قابلة للقياس",
              desc: "قوائم مالية، إيضاحات، متطلبات أدلة، توصيات إعادة تصنيف — ضمن مسار محكوم.",
            },
            {
              num: "06",
              title: "تتبع أدلة كامل",
              desc: "كل مخرج مربوط بمصدره. يمكن تتبع أي توصية أو تعديل عبر سلسلة الأدلة.",
            },
          ].map((item) => (
            <div
              key={item.num}
              className="rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/20 p-5"
            >
              <span className="text-[10px] font-bold tracking-widest text-primary/40">
                {item.num}
              </span>
              <p className="mt-1 text-sm font-black text-foreground">
                {item.title}
              </p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <OutputCard
            title="مخرجات التفعيل الأولي المتوقعة"
            items={pilotOutputs}
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/pilot-proof"
            className="text-sm font-semibold text-aqliya-cyan underline-offset-4 hover:underline"
          >
            ← شاهد دليل البايلوت: مخرجات AuditOS على بيانات حقيقية
          </Link>
          <Link
            href="/proof-library"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            ← مكتبة الإثبات: نماذج مخرجات قابلة للتصدير
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════
           9. FINAL CTA — Pilot-oriented
           القرار: CTA يركز على البايلوت — لا وعود كبيرة
           ════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-border/60 bg-gradient-to-br from-primary/[0.04] via-background to-aqliya-cyan/[0.03] p-8 text-center shadow-sm sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
            ابدأ من engagement واحد
          </p>
          <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight text-foreground sm:text-3xl">
            ميزان مراجعة واحد. سلسلة أدلة واحدة.
            <span className="block text-primary mt-1">
              معايير مراجعة واضحة. مخرجات مدعومة بالأدلة.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
            لا نبدأ بتطبيق كامل. نبدأ بنطاق محدود: نحمّل ميزان المراجعة الحقيقي
            لفترة واحدة، نفعّل مسار العمل، ونقيّم النتائج مع فريقك. الشفافية
            والتتبع مضمونان.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/executive-brief"
              className="btn-primary h-12 px-10 text-base font-bold"
              data-event="click_read_executive_brief"
            >
              قراءة الإحاطة التنفيذية ←
            </Link>
            <Link
              href="/contact"
              className="btn-secondary h-12 px-10 text-base"
              data-event="click_request_pilot_review"
            >
              طلب مراجعة Pilot
            </Link>
            <Link
              href="/proof-library"
              className="btn-outline h-12 px-10 text-base"
              data-event="click_view_proof_library"
            >
              مكتبة الإثبات
            </Link>
          </div>

          {/* Supporting links */}
          <div className="mt-8 grid gap-3 text-sm sm:grid-cols-2 border-t border-border/40 pt-8">
            {[
              {
                label: "دليل البايلوت",
                sub: "مخرجات AuditOS على بيانات حقيقية",
                href: "/pilot-proof",
                event: "click_view_pilot_proof",
              },
              {
                label: "مكتبة الإثبات",
                sub: "نماذج مخرجات قابلة للتصدير",
                href: "/proof-library",
                event: "click_view_proof_library",
              },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-border/50 p-4 text-center transition-colors hover:border-primary/25 hover:bg-muted/30"
                data-event={link.event}
              >
                <p className="font-semibold text-foreground">{link.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{link.sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
