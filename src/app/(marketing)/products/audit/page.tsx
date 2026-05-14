import Link from "next/link"
import type { Metadata } from "next"
import { SectionEyebrow, BeforeAfterBlock, WorkflowChain, OutputCard, EnterpriseCTA, InsightCallout, ExecutiveSurface } from "@/components/enterprise"

export const metadata: Metadata = {
  title: "AuditOS — نظام المراجعة والتدقيق والذكاء المالي",
  description: "AuditOS هو أول تطبيق مُثبت على AQLIYA Intelligence Core، ويحوّل ميزان المراجعة إلى مخرجات مالية محكومة وقابلة للتتبع والمراجعة البشرية.",
}

const governanceFeatures = [
  "سجل تتبع كامل من ميزان المراجعة إلى الاعتماد",
  "مراجعة بشرية مطلوبة عند كل بوابة حوكمة",
  "تنبيه النواقص قبل بدء المراجعة",
  "الحكم المهني لا يتم تجاوزه أبدًا",
  "جاهزية الاعتماد واضحة في كل خطوة",
]

const pilotOutputs = [
  "ربط الحسابات مع إمكانية التعديل المهني",
  "مسودة القوائم المالية",
  "مسودة الإيضاحات والإفصاحات",
  "قائمة النواقص",
  "متطلبات الأدلة حسب منطقة الحسابات",
  "توصيات إعادة التصنيف",
  "ملاحظات المراجع",
  "حالة الجاهزية للاعتماد",
]

const excelChatGptComparison = [
  { label: "الدور", excel: "يحسب", chatgpt: "يكتب نصوصًا", auditos: "يحكم مسار الذكاء المالي" },
  { label: "ميزان المراجعة", excel: "خلايا خام", chatgpt: "مدخلات نصية", auditos: "إدخال منظم مع تحقق" },
  { label: "ربط الحسابات", excel: "معادلات يدوية", chatgpt: "اقتراحات عامة", auditos: "تصنيف محكوم مع إمكانية التعديل" },
  { label: "القوائم والإيضاحات", excel: "تجميع يدوي", chatgpt: "توليد غير منظم", auditos: "صياغة ضمن قوالب محكومة" },
  { label: "متطلبات الأدلة", excel: "لا يوجد", chatgpt: "لا يوجد", auditos: "منظمة ومربوطة بالحسابات" },
  { label: "مسار المراجعة", excel: "تعليقات، بريد", chatgpt: "لا يوجد", auditos: "طابور مراجعة مدمج مع ملاحظات" },
  { label: "مسار الاعتماد", excel: "لا يوجد", chatgpt: "لا يوجد", auditos: "تتبع كامل من الإدخال إلى الاعتماد" },
  { label: "الحكم البشري", excel: "متروك للمستخدم", chatgpt: "مخرج غير شفاف", auditos: "مطلوب عند كل بوابة حوكمة" },
]

export default function AuditProductPage() {
  return (
    <div className="flex flex-col gap-20 sm:gap-28">
      {/* ════════════════════════════════════════════
          1. HERO
          ════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#0B1728]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(19,125,197,0.12),transparent_65%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-3xl">
            <Link href="/products" className="inline-block text-xs text-white/40 hover:text-white/60 transition-colors mb-8">
              ← خطوط عقلية
            </Link>

            <span className="inline-block w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-primary mb-5">
              AuditOS / First Proof Application on AQLIYA Core
            </span>

            <h1 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              من ميزان المراجعة إلى مخرجات جاهزة للمراجعة — بنظام محكوم
            </h1>

            <p className="mt-5 text-base leading-8 text-white/65 sm:text-lg">
              AuditOS هو أول تطبيق مُثبت تحت عقلية في مجال التدقيق والذكاء المالي. يبني مسارًا منظمًا فوق AQLIYA Intelligence Core من ميزان المراجعة الخام إلى القوائم والإيضاحات والأدلة والمراجعة والاعتماد، دون استبدال الحكم المهني.
            </p>

            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row">
              <Link
                href="/custom-product"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                  ناقش تفعيل النظام
              </Link>
              <Link
                href="/auditos"
                className="inline-flex h-12 items-center justify-center rounded-md border border-white/15 bg-white/5 px-8 text-base font-medium text-white/80 transition-colors hover:bg-white/10"
              >
                  شاهد AuditOS كأول تطبيق
              </Link>
            </div>

            <p className="mt-5 text-xs text-white/30">
               Built on AQLIYA Core · Governed Workflow · Evidence-Backed · Human Review
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
          title="التقارير المالية ما زالت متشظية"
          description="أغلب فرق المراجعة والمالية ما زالت تنتقل من ميزان المراجعة إلى القوائم والإيضاحات والأدلة والمراجعة والاعتماد عبر ملفات متفرقة وتعليقات متشتتة. AuditOS يعالج ذلك كخط نظام مبني على AQLIYA Intelligence Core، لا كأداة نصوص أو أتمتة معزولة."
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
                "ميزان المراجعة",
                "ربط الحسابات",
                "مسودة القوائم المالية",
                "مسودة الإيضاحات",
                "متطلبات الأدلة",
                "المراجعة",
                "الاعتماد",
              ]}
              className="justify-center"
            />
          </ExecutiveSurface>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { step: "01", label: "ميزان المراجعة", desc: "إدخال البيانات المالية الخام" },
            { step: "02", label: "ربط الحسابات", desc: "تصنيف الحسابات في نموذج مالي منظم" },
            { step: "03", label: "مسودة القوائم", desc: "إنتاج مسودة القوائم للمراجعة" },
            { step: "04", label: "مسودة الإيضاحات", desc: "إنتاج إيضاحات الإفصاح حسب الحسابات" },
            { step: "05", label: "متطلبات الأدلة", desc: "تحديد الأدلة الداعمة المطلوبة" },
            { step: "06", label: "المراجعة", desc: "مراجعة مهنية مع ملاحظات ونتائج" },
            { step: "07", label: "الاعتماد", desc: "اعتماد نهائي ببوابة حوكمة" },
          ].map((item) => (
            <div key={item.step} className="rounded-lg border bg-muted/30 p-4">
              <span className="text-[10px] font-bold tracking-widest text-primary/60">{item.step}</span>
              <h3 className="mt-1 text-sm font-bold">{item.label}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-5">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          5. GOVERNANCE
          ════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="الحوكمة"
          title="الذكاء الاصطناعي يساعد. البشر يقررون. الأدلة تحكم."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <ExecutiveSurface className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3 className="text-lg font-bold">الذكاء الاصطناعي يساعد</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              مسودات، تصنيفات، اقتراحات، مؤشرات أدلة، تنبيهات النواقص
            </p>
          </ExecutiveSurface>

          <ExecutiveSurface className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="text-lg font-bold">البشر يقررون</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              مراجعة، تعديل، اعتماد، رفض، تعديل التصنيفات
            </p>
          </ExecutiveSurface>

          <ExecutiveSurface className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold">الأدلة تحكم</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              كل مخرج متتبع، كل قرار مسجل، كل اعتماد مرتبط ببوابة
            </p>
          </ExecutiveSurface>
        </div>

        <div className="mt-10">
          <OutputCard title="مبادئ الحوكمة" items={governanceFeatures} />
        </div>
      </section>

      {/* ════════════════════════════════════════════
          6. WHY NOT EXCEL / CHATGPT
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
                <th className="border-b px-4 py-3 text-right text-sm font-semibold text-muted-foreground">البعد</th>
                <th className="border-b border-x px-4 py-3 text-center text-sm font-semibold text-destructive/60">Excel</th>
                <th className="border-b border-x px-4 py-3 text-center text-sm font-semibold text-amber-600/60">ChatGPT</th>
                <th className="border-b px-4 py-3 text-center text-sm font-semibold text-primary">AuditOS</th>
              </tr>
            </thead>
            <tbody>
              {excelChatGptComparison.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                  <td className="border-b px-4 py-3 text-sm font-medium">{row.label}</td>
                  <td className="border-b border-x px-4 py-3 text-center text-sm text-muted-foreground">{row.excel}</td>
                  <td className="border-b border-x px-4 py-3 text-center text-sm text-muted-foreground">{row.chatgpt}</td>
                  <td className="border-b px-4 py-3 text-center text-sm font-medium text-primary/80">{row.auditos}</td>
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
          7. PILOT CTA
          ════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="ابدأ الآن"
          title="ابدأ بميزان مراجعة واحد. شاهد الفرق."
          description="ارفع ميزان مراجعة حقيقي واحد. في تجربتك، سينتج AuditOS كل هذه المخرجات ضمن مسار عمل محكوم:"
        />
        <div className="mt-10">
          <OutputCard title="مخرجات التفعيل الأولي" items={pilotOutputs} />
        </div>
      </section>

      {/* ════════════════════════════════════════════
          8. FINAL CTA
          ════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <EnterpriseCTA
          title="هل تريد تجربة AuditOS على بيانات مؤسستك؟"
          description='ابدأ من ميزان مراجعة واحد، وشاهد كيف يُفعّل AuditOS مسارًا ماليًا محكومًا فوق AQLIYA Intelligence Core من البيانات إلى المراجعة والاعتماد.'
          primaryLabel="ناقش تفعيل النظام"
          primaryHref="/custom-product"
          secondaryLabel="شاهد AuditOS كأول تطبيق"
          secondaryHref="/auditos"
        />
      </section>
    </div>
  )
}
