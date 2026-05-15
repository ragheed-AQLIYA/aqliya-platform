import Link from "next/link";
import {
  SectionEyebrow,
  BeforeAfterBlock,
  WorkflowChain,
  ProductProofCard,
  ExecutiveSurface,
} from "@/components/enterprise";
import {
  OperatingSystemMapVisual,
  ProofChainVisual,
} from "@/components/visuals";

const impactMetrics = [
  {
    value: "01",
    label: "نواة مشتركة",
    detail: "منطق حوكمة واحد يمكن البناء فوقه عبر أكثر من خط نظام",
  },
  {
    value: "06",
    label: "خطوط تشغيل",
    detail:
      "تبدأ من AuditOS وتمتد إلى المحتوى المحلي والقرار والمبيعات والمحاكاة",
  },
  {
    value: "100%",
    label: "مبدأ التتبع",
    detail: "كل مخرج يجب أن يبقى مربوطًا بالبيانات، والمراجعة، وصاحب الصلاحية",
  },
];

const promisePoints = [
  "ذكاء يعمل داخل نطاق المؤسسة لا خارجه",
  "مسارات تشغيل تربط الإدخال، المراجعة، والاعتماد في بنية واحدة",
  "مخرجات قابلة للفهم والمراجعة بدل إجابات سريعة بلا سياق",
];

const products = [
  {
    title: "AuditOS | أول تطبيق مُثبت على عقلية",
    problem:
      "بيانات مالية متفرقة، تصنيفات يدوية، أدلة غير مرتبطة، ومراجعة يصعب تتبعها.",
    system:
      "يبني مسار مراجعة وتدقيق محكوم يربط البيانات المالية بالتصنيف، الأدلة، الملاحظات، المراجعة، والاعتماد.",
    output:
      "مخرجات مراجعة منظمة وقابلة للتتبع من المصدر إلى القرار البشري النهائي.",
    flow: ["بيانات", "تصنيف", "مخرجات", "أدلة", "مراجعة"],
    href: "/products/audit",
    note: "أول تطبيق مُثبت على AQLIYA Intelligence Core، ويُظهر كيف يتحول الذكاء المالي إلى مسار محكوم وقابل للمراجعة.",
    maturity: "أول تطبيق مُثبت",
    status: "active",
  },
  {
    title: "LocalContentOS | المنتج الاستراتيجي الثاني ضمن عقلية",
    problem:
      "بيانات موردين، إنفاق، التزام، وتصنيفات موزعة بين فرق ومصادر مختلفة.",
    system:
      "يوحّد قياس المحتوى المحلي عبر ربط الموردين بالإنفاق، التصنيف، نسب الالتزام، الفجوات، ومسارات التتبع.",
    output:
      "رؤية مؤسسية أوضح لمؤشرات المحتوى المحلي وجاهزية القرارات الشرائية.",
    flow: ["موردون", "إنفاق", "تصنيف", "فجوات", "مؤشرات"],
    href: "/products/local-content",
    note: "المنتج الاستراتيجي الثاني ضمن عقلية، موجه لسوق المحتوى المحلي السعودي، ويبنى على AQLIYA Intelligence Core.",
    maturity: "استراتيجي — المنتج الثاني",
    status: "strategic",
  },
  {
    title: "DecisionOS | حوكمة القرار التنفيذي",
    problem:
      "قرارات مهمة تُبنى على نقاشات متفرقة، ملفات متعددة، ومعايير غير موحدة.",
    system:
      "يحوّل القرار التنفيذي إلى مسار محكوم: بدائل، معايير، مخاطر، أدلة، توصية، واعتماد.",
    output: "مذكرة قرار موثقة يمكن مراجعتها وفهم أسبابها قبل الاعتماد.",
    flow: ["مشكلة", "بدائل", "معايير", "مخاطر", "توصية"],
    href: "/products/decision",
    note: "خط نظام لحوكمة القرار التنفيذي، يُفعّل ضمن نطاق المؤسسة ويبنى على AQLIYA Intelligence Core.",
    maturity: "متاح للتفعيل",
    status: "available",
  },
  {
    title: "SalesOS | خط نظام الذاكرة التجارية والمبيعات",
    problem:
      "فرص غير مؤهلة، أولويات غير واضحة، متابعة عشوائية، وتعلم ضعيف من الحملات.",
    system:
      "ينظم تأهيل الفرص، ترتيبها، وضبط المتابعة داخل مسار مبيعات محكوم ومبني على الذاكرة المؤسسية.",
    output:
      "مسار مبيعات أوضح يربط العملاء المحتملين بالأولوية، المتابعة، والتعلم المؤسسي.",
    flow: ["ICP", "تأهيل", "ترتيب", "تواصل", "متابعة", "تعلم"],
    href: "/products/sales",
    note: "خط نظام مستقبلي ضمن عقلية — نموذج أولي بلوحة معلومات ثابتة، بدون خلفية تشغيلية بعد.",
    maturity: "نموذج أولي — مستقبلي",
    status: "prototype",
  },
  {
    title: "SimulationOS | خط نظام محاكاة السيناريوهات",
    problem:
      "قرارات تُنفذ قبل اختبار أثرها على التكلفة، المخاطر، الأداء، أو النتائج.",
    system:
      "يربط المدخلات بالافتراضات والسيناريوهات والمقارنات قبل التنفيذ داخل مسار محاكاة قابل للمراجعة.",
    output:
      "رؤية مقارنة تساعد الإدارة على فهم البدائل قبل اعتماد القرار أو تنفيذ الأثر.",
    flow: ["مدخلات", "افتراضات", "سيناريوهات", "أثر", "مقارنة"],
    href: "/products/simulation",
    note: "خط نظام مستقبلي ضمن عقلية — يُعرَض حاليًا كمفهوم تسويقي لحين تطوير النموذج التشغيلي.",
    maturity: "مستقبلي",
    status: "future",
  },
];

const coreItems = [
  { title: "تنسيق الذكاء", english: "AI Orchestration" },
  { title: "الحوكمة", english: "Governance Engine" },
  { title: "سير العمل", english: "Workflow Engine" },
  { title: "ربط الأدلة", english: "Evidence Graph" },
  { title: "الصلاحيات", english: "RBAC / Permissions" },
  { title: "سجل التدقيق", english: "Audit Logs" },
  { title: "التقارير", english: "Reporting Engine" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/6 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 py-18 sm:py-24 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-14">
            <div className="flex flex-col justify-center animate-fade-in-up">
              <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/85 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
                منصة ذكاء مؤسسي خاص ومحكوم
              </span>
              <p className="text-sm font-semibold tracking-[0.22em] text-aqliya-cyan uppercase">
                AQLIYA
              </p>
              <h1 className="mt-3 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                بنية مؤسسية تجعل الذكاء
                <span className="block text-white/70">
                  مفيدًا، مفهومًا، ومحكومًا
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
                عقلية ليست صفحة دردشة للمؤسسة، وليست طبقة AI منفصلة فوق الفوضى.
                هي منصة تشغيل تربط البيانات، القواعد، الصلاحيات، الأدلة،
                والمراجعة داخل مسار واحد يمكن الوثوق به.
              </p>
              <div className="mt-6 space-y-3">
                {promisePoints.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-3 text-white/70"
                  >
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-aqliya-cyan" />
                    <p className="text-sm leading-7 sm:text-base">{point}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-aqliya-cyan/20 bg-aqliya-cyan/[0.06] p-4 backdrop-blur-sm">
                <p className="text-xs font-semibold text-aqliya-cyan">
                  مبدأ الثقة:
                </p>
                <p className="mt-1 text-base font-bold text-white">
                  الذكاء يساعد. الإنسان يقرر. الدليل يحكم.
                </p>
              </div>
              <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row">
                <Link
                  href="/products"
                  className="btn-primary h-12 px-8 text-base"
                >
                  استكشف خطوط عقلية
                </Link>
                <Link
                  href="/auditos"
                  className="btn-secondary h-12 px-8 text-base"
                >
                  شاهد AuditOS كأول تطبيق
                </Link>
                <Link
                  href="/custom-product"
                  className="btn-secondary h-12 px-8 text-base"
                >
                  ناقش حالة استخدام مؤسسية
                </Link>
              </div>
              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {impactMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-white/15 bg-white/8 p-4 backdrop-blur"
                  >
                    <div className="text-2xl font-black text-white">
                      {metric.value}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-white/88">
                      {metric.label}
                    </div>
                    <p className="mt-2 text-xs leading-6 text-white/58">
                      {metric.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-scale-in stagger-2">
              <div className="gradient-border rounded-[28px] bg-white/[0.03] p-3 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.65)] backdrop-blur-xl">
                <OperatingSystemMapVisual className="w-full rounded-[22px] glow-accent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <SectionEyebrow
          label="الوضوح الموضعي"
          title="عقلية ليست..."
          description="بعض الأشياء التي عقلية لا تفعلها. هذا يساعد في فهم ما هي في الواقع."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-6 backdrop-blur">
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-bold text-foreground">
                ليست صفحة دردشة
              </h3>
              <span className="text-lg text-red-400">✕</span>
            </div>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">
              صفحات الدردشة العامة تعطيك إجابات. عقلية تعطيك مسارات مراجعة
              محكومة وموثقة تربط الإجابة بالبيانات والسياق والموافقات.
            </p>
          </div>
          <div className="rounded-2xl border border-yellow-600/20 bg-yellow-600/[0.05] p-6 backdrop-blur">
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-bold text-foreground">
                ليست SaaS فقط
              </h3>
              <span className="text-lg text-yellow-500">✕</span>
            </div>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">
              عقلية ليست حصرية على السحابة. نقدم نموذج تشغيل مزدوج: سحابة متاحة
              الآن، وخوادم خاصة ومعزولة قيد التطوير للمؤسسات الحساسة.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-600/20 bg-amber-600/[0.05] p-6 backdrop-blur">
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-bold text-foreground">
                ليست منتج واحد فقط
              </h3>
              <span className="text-lg text-amber-500">✕</span>
            </div>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">
              بعض المؤسسات تبحث عن أداة واحدة مثل AuditOS. عقلية نواة تشغيلية
              تسمح ببناء أكثر من خط نظام فوقها حسب احتياج المؤسسة.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <SectionEyebrow
          label="نماذج التشغيل"
          title="السحابة متاحة الآن. الخوادم الخاصة والمعزولة قادمة"
          description="نقدم خيارات تشغيل مختلفة حسب احتياجات المؤسسة الأمنية والتشغيلية. كل نموذج يحافظ على نفس منطق الحوكمة والتتبع والأدلة."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-aqliya-cyan/30 bg-gradient-to-br from-aqliya-cyan/[0.08] to-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-foreground">السحابة</h3>
              <span className="inline-flex rounded-full bg-aqliya-cyan/20 px-2 py-1 text-[9px] font-bold text-aqliya-cyan uppercase">
                متاح الآن
              </span>
            </div>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">
              إصدار سحابة متكامل مع كل الخصائص والتحديثات التلقائية والنسخ
              الاحتياطي. مثالي للمؤسسات التي تفضل عدم إدارة البنية التحتية.
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-muted/30 to-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-foreground">خوادم خاصة</h3>
              <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-[9px] font-bold text-amber-700 uppercase">
                قريبًا
              </span>
            </div>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">
              تثبيت على خوادمك الخاصة مع كل خصائص الحوكمة والتحكم. متوفر على
              Docker أو Kubernetes. يسمح بالتحكم الكامل والتعديلات المؤسسية.
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-muted/30 to-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-foreground">
                معزولة تماما
              </h3>
              <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-600 uppercase">
                استراتيجي
              </span>
            </div>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">
              بيئة معزولة بدون أي اتصال بالانترنت (air-gapped) للمؤسسات ذات
              متطلبات أمنية صارمة. كل البيانات والمعالجة محلية بالكامل.
            </p>
          </div>
        </div>
      </section>

      <section className="section-gradient-light border-t">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <SectionEyebrow
            label="الفجوة التشغيلية"
            title="المشكلة ليست في غياب الذكاء فقط، بل في غياب النظام الذي يحكمه"
            description="حين تعمل البيانات في مكان، والموافقات في مكان، والمراجعة في مكان آخر، تصبح المخرجات سريعة لكنها ضعيفة الثقة. عقلية تعيد جمع المسار كاملًا داخل منطق تشغيلي واحد."
          />
          <div className="mt-12">
            <BeforeAfterBlock
              before={[
                "مخرجات ذكاء غير مرتبطة بسياق العمل",
                "اعتماد عبر البريد والذاكرة",
                "موافقات غير موثقة",
                "أدلة منفصلة عن القرار",
                "صلاحيات لا تحكم المسار كاملًا",
              ]}
              after={[
                "سير عمل محكوم",
                "مخرجات قابلة للتتبع",
                "قرارات موثقة",
                "أدلة مربوطة بكل خطوة",
                "وضوح تشغيلي قابل للمراجعة",
              ]}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <SectionEyebrow
          label="AQLIYA Intelligence Core"
          title="نواة تشغيل واحدة بدل مشاريع متفرقة وأدوات معزولة"
          description="النواة المشتركة في عقلية لا تعني إعادة تسمية مجموعة خصائص تقنية. هي طبقة تشغيل مؤسسي تجعل كل خط نظام جديد يبنى فوق نفس منطق الحوكمة، لا من الصفر."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <ExecutiveSurface>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {coreItems.map((item) => (
                <div
                  key={item.english}
                  className="glass-card-light p-4 text-right"
                >
                  <p className="text-sm font-bold text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-2 text-xs leading-6 text-muted-foreground">
                    {item.english}
                  </p>
                </div>
              ))}
            </div>
          </ExecutiveSurface>
          <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-primary/[0.06] via-background to-aqliya-cyan/[0.04] p-7 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              الأثر التشغيلي
            </p>
            <h3 className="mt-4 text-2xl font-black text-foreground">
              بدل شراء ذكاء منفصل، تبني المؤسسة قدرة تشغيلية متكررة
            </h3>
            <p className="mt-4 text-base leading-8 text-muted-foreground">
              هذا يعني أن كل نطاق جديد لا يبدأ من سؤال: أي أداة نضيف؟ بل من
              سؤال: كيف نُدخل هذا النطاق داخل نفس قواعد البيانات، والمراجعة،
              والصلاحيات، وسلسلة الاعتماد؟
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-t">
        <SectionEyebrow
          label="سلسلة التشغيل"
          title="من البيانات إلى القرار عبر مسار مفهوم ومراجع"
          description="في عقلية، القيمة لا تأتي من الإجابة نفسها فقط، بل من الطريق الذي أنتجها: من أين جاءت البيانات، من راجعها، وما الذي اعتمدها، وما الذي يمكن الرجوع إليه بعد ذلك."
        />
        <div className="mt-10">
          <ExecutiveSurface>
            <WorkflowChain
              steps={[
                "البيانات",
                "سير العمل",
                "الأدلة",
                "المراجعة",
                "الاعتماد",
                "المخرجات",
              ]}
              className="justify-center"
            />
          </ExecutiveSurface>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-t">
        <SectionEyebrow
          label="التفعيل المؤسسي"
          title="وحين لا تكفي الخطوط الجاهزة، يمكن بناء مسارك الخاص فوق النواة نفسها"
          description="بعض المؤسسات تحتاج ما هو أبعد من منتج جاهز. لذلك تسمح عقلية بتفعيل نظام أو مسار مؤسسي مخصص مع الحفاظ على نفس منطق الحوكمة والتتبع والمراجعة."
        />
        <div className="mt-8 text-center">
          <Link
            href="/custom-product"
            className="btn-primary h-12 px-8 text-base"
          >
            صمّم نظامك المؤسسي
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-t">
        <SectionEyebrow
          label="عائلة المنتجات"
          title="كل خط نظام يعالج فجوة تشغيلية محددة داخل المؤسسة"
          description="هذه ليست صفحات منتجات عامة. كل خط نظام في عقلية يبدأ من مشكلة مؤسسية واضحة، ثم يحولها إلى تدفق عمل محكوم ومخرج قابل للمراجعة والتوسع."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductProofCard
              key={product.href}
              title={product.title}
              problem={product.problem}
              system={product.system}
              output={product.output}
              flow={product.flow}
              href={product.href}
              note={product.note}
            />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          PROOF PRODUCT — AuditOS
          ════════════════════════════════════════════ */}
      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-aqliya-cyan/30 bg-aqliya-cyan/[0.1] px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-aqliya-cyan">
                <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
                أول تطبيق مُثبت
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-medium text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                جاهز للتجربة
              </span>
            </div>
            <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
              AuditOS — أول منتج مُثبت على AQLIYA Intelligence Core
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/62">
              AuditOS هو أول تطبيق يُظهر كيف تتحول نواة عقلية إلى خط نظام مالي
              محكوم. يعالج مسار المراجعة المالية بالكامل: من ميزان المراجعة
              الخام إلى القوائم المالية، الإيضاحات، الأدلة، الملاحظات، المراجعة
              البشرية، والاعتماد النهائي.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-aqliya-cyan/80">
                  المسار
                </span>
                <p className="mt-2 text-sm leading-7 text-white/70">
                  ميزان المراجعة ← ربط الحسابات ← القوائم المالية ← الإيضاحات ←
                  الأدلة ← المراجعة ← الاعتماد ← التصدير
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-aqliya-cyan/80">
                  الحوكمة
                </span>
                <p className="mt-2 text-sm leading-7 text-white/70">
                  كل مخرج مربوط بالدليل، كل خطوة تحتاج مراجعة بشرية، كل اعتماد
                  مسجل في سجل التدقيق.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-aqliya-cyan/80">
                  المخرجات
                </span>
                <p className="mt-2 text-sm leading-7 text-white/70">
                  قوائم مالية، إيضاحات، توصيات إعادة تصنيف، تقارير الأدلة، مسار
                  مراجعة كامل.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/auditos" className="btn-primary px-6">
                شاهد AuditOS — عرض تفاعلي
              </Link>
              <Link href="/products/audit" className="btn-secondary px-6">
                استكشف AuditOS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          STRATEGIC PRODUCT — LocalContentOS
          ════════════════════════════════════════════ */}
      <section className="border-t border-white/5 bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                المنتج الاستراتيجي الثاني
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                مستقبلي — قيد التخطيط
              </span>
            </div>
            <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight text-foreground sm:text-4xl">
              LocalContentOS — المنتج الاستراتيجي الثاني لسوق المحتوى المحلي
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
              LocalContentOS يستهدف قياس المحتوى المحلي وإدارة الموردين والإنفاق
              والالتزام داخل مسار حوكمة موحد. صُمم خصيصًا للسوق السعودي، وسيُبنى
              على AQLIYA Intelligence Core بنفس منطق الحوكمة والأدلة والمراجعة
              البشرية.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-600/80">
                  النطاق
                </span>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  تصنيف الموردين، تحليل الإنفاق، قياس الالتزام، مؤشرات المحتوى
                  المحلي.
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-600/80">
                  السوق
                </span>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  موجه للمؤسسات السعودية التي تحتاج قياس المحتوى المحلي والتزام
                  الموردين وفق متطلبات هيئة المحتوى المحلي.
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-600/80">
                  الحالة
                </span>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  قيد التخطيط الاستراتيجي — يُعرَض حاليًا كصفحة تعريفية لحين بدء
                  التطوير.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/products/local-content" className="btn-primary px-6">
                استكشف LocalContentOS
              </Link>
              <Link href="/custom-product" className="btn-outline px-6">
                ناقش التفعيل المستقبلي
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              الثقة والإثبات
            </span>
            <h2 className="mt-5 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
              الثقة في عقلية لا تُبنى على الوعود، بل على القدرة على الرجوع لكل
              خطوة
            </h2>
            <div className="mt-6 rounded-2xl border border-aqliya-cyan/30 bg-aqliya-cyan/[0.08] p-5 backdrop-blur-sm">
              <p className="text-sm font-semibold text-aqliya-cyan">
                المبدأ الأساسي:
              </p>
              <p className="mt-2 text-lg font-black tracking-tight text-white">
                الذكاء يساعد. الإنسان يقرر. الدليل يحكم.
              </p>
            </div>
            <p className="mt-4 text-base leading-8 text-white/58">
              عندما يسأل المدير أو المدقق أو صاحب الصلاحية: كيف وصلنا إلى هذا
              المخرج؟ يجب أن تكون الإجابة موجودة داخل النظام نفسه، لا في الذاكرة
              ولا في سلاسل البريد.
            </p>
          </div>
          <ProofChainVisual />
        </div>
      </section>

      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-8 text-center shadow-[0_18px_60px_-26px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              ابدأ من النطاق
            </p>
            <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
              إذا كانت لديك فجوة تشغيلية معقدة، يمكن تحويلها إلى نظام محكوم قابل
              للتفعيل
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/60">
              ابدأ من خط النظام الأقرب إلى نطاقك، أو اطلب جلسة تصميم إذا كنت
              تحتاج مسارًا مؤسسيًا خاصًا فوق نواة عقلية.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/custom-product"
                className="btn-primary h-12 px-8 text-base"
              >
                صمّم نظامك المؤسسي
              </Link>
              <Link
                href="/contact"
                className="btn-secondary h-12 px-8 text-base"
              >
                ناقش تفعيل النظام
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
