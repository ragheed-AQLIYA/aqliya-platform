import Link from "next/link";
import type { Metadata } from "next";
import { SectionEyebrow, WorkflowChain } from "@/components/enterprise";

export const metadata: Metadata = {
  title: "الحوكمة والأمان | AQLIYA",
  description:
    "بنية الثقة المؤسسية في عقلية: سلسلة الأدلة، RBAC، سجل التدقيق غير القابل للتعديل، بوابات المراجعة البشرية، عزل المؤسسات، وحدود الذكاء الاصطناعي — مُنفَّذة على مستوى المنصة.",
};

// ─── Evidence Chain Levels ──────────────────────────────────────────────────
const evidenceLevels = [
  {
    step: "01",
    title: "البيانات المصدرية",
    en: "Source Data",
    desc: "كل إدخال يُسجَّل مع هوية المُدخِل، الوقت، والمصدر — سواء كان ملفاً مرفوعاً، إدخالاً يدوياً، أو استدعاءً خارجياً.",
  },
  {
    step: "02",
    title: "المعالجة والتحويل",
    en: "Processing & Transformation",
    desc: "كل تحويل أو تصنيف أو تحليل يُربط بالإجراء المُنفَّذ والإصدار والمعلمات المستخدمة — لا معالجة غير مُوثَّقة.",
  },
  {
    step: "03",
    title: "مخرجات الذكاء الاصطناعي",
    en: "AI Output",
    desc: "كل مخرج ذكاء اصطناعي مُعلَّم بوضوح كـ AI-assisted، مع الإشارة إلى النموذج، المدخلات، ودرجة الثقة إن وجدت.",
  },
  {
    step: "04",
    title: "المراجعة البشرية",
    en: "Human Review",
    desc: "كل مخرج يمر عبر مراجعة بشرية صريحة — ليس اختيارياً. المراجعة تسجل: من راجع، ماذا راجع، وما الإجراء الذي اتخذه.",
  },
  {
    step: "05",
    title: "الاعتماد الرسمي",
    en: "Formal Approval",
    desc: "الاعتماد يتطلب هوية الصلاحية المناسبة. يُسجَّل مع الوقت، والهوية، والحالة، وأي تعليقات — لا اعتماد ضمني.",
  },
  {
    step: "06",
    title: "المخرج النهائي والتصدير",
    en: "Final Output & Export",
    desc: "أي تصدير أو نشر يتضمن حالة الاعتماد، المُعتمِد، والتوقيت — ويرتبط بالسلسلة الكاملة من المصدر إلى المخرج.",
  },
];

// ─── RBAC Model ──────────────────────────────────────────────────────────────
const rbacLevels = [
  {
    level: "المؤسسة",
    en: "Organization Level",
    desc: "عزل كامل بين المؤسسات. لا تشارك بيانات أو صلاحيات أو سجلات بين مؤسسات مختلفة على نفس المنصة.",
    critical: true,
  },
  {
    level: "مساحة العمل",
    en: "Workspace Level",
    desc: "داخل المؤسسة: مشاريع أو مساحات عمل مستقلة بصلاحيات منفصلة.",
    critical: false,
  },
  {
    level: "الدور",
    en: "Role Level",
    desc: "أدوار محددة مسبقاً: قارئ، مراجع، معتمِد، مسؤول — لا صلاحيات ضمنية.",
    critical: false,
  },
  {
    level: "الإجراء",
    en: "Action Level",
    desc: "كل إجراء حساس يتطلب صلاحية صريحة: التصدير، الاعتماد، التعديل، الحذف.",
    critical: false,
  },
  {
    level: "الحقل",
    en: "Field Level",
    desc: "في السياقات الحساسة: بعض الحقول مرئية لأدوار محددة فقط.",
    critical: false,
  },
];

// ─── Audit Trail Properties ────────────────────────────────────────────────
const auditTrailProps = [
  { prop: "الأحداث المُسجَّلة", value: "كل حدث: إنشاء، تعديل، اعتماد، رفض، تصدير، تسجيل دخول، رفع ملف" },
  { prop: "البيانات المُسجَّلة لكل حدث", value: "هوية المستخدم، الوقت الدقيق، عنوان IP، الحالة السابقة، الحالة الجديدة، السياق" },
  { prop: "قابلية التعديل", value: "غير قابل للتعديل أو الحذف — بما في ذلك من قِبل المسؤولين" },
  { prop: "مدة الاحتفاظ", value: "يُحدَّد حسب متطلبات المؤسسة والامتثال" },
  { prop: "قابلية التصدير", value: "قابل للتصدير لأغراض الامتثال والتدقيق الخارجي" },
  { prop: "البحث والتصفية", value: "بحث حسب الحدث، المستخدم، الكيان، الفترة الزمنية، أو حالة الاعتماد" },
];

// ─── AI Boundaries ─────────────────────────────────────────────────────────
const aiRules = [
  {
    rule: "الذكاء يقترح — لا يقرر",
    detail: "كل مخرج ذكاء اصطناعي هو مسودة أو اقتراح — يخضع إلزامياً لمراجعة بشرية قبل أي اعتماد.",
  },
  {
    rule: "كل استدعاء موثَّق",
    detail: "كل طلب للذكاء الاصطناعي، مع المدخلات والمخرجات، يُسجَّل في سجل التدقيق.",
  },
  {
    rule: "حدود بيانات واضحة",
    detail: "الذكاء الاصطناعي لا يصل إلى بيانات خارج نطاق الصلاحية الممنوحة للمستخدم.",
  },
  {
    rule: "لا قرار مالي أو قانوني أوتوماتيكي",
    detail: "أي مخرج ذو أثر مالي أو قانوني يُعلَّم تلقائياً كـ 'يستلزم مراجعة بشرية'.",
  },
  {
    rule: "تعيين الثقة",
    detail: "حيث ينطبق: كل مخرج يتضمن مؤشر ثقة أو قيوداً معروفة لمساعدة المراجع.",
  },
  {
    rule: "معلومات الإدارة",
    detail: "المستخدم يعرف دائماً: هذا مخرج ذكاء اصطناعي، من أي نموذج، وبأي مدخلات.",
  },
];

export default function GovernancePage() {
  return (
    <div className="flex flex-col">

      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="relative mx-auto max-w-5xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              الحوكمة والأمان المؤسسي
            </span>
            <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              الحوكمة ليست ميزة إضافية —
              <span className="block text-white/72 mt-1">
                هي البنية الأساسية
              </span>
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/62 sm:text-lg">
              في عقلية، الحوكمة مُنفَّذة على مستوى المنصة — لا تُضاف لاحقاً ولا تُفعَّل اختيارياً. كل نظام يُبنى فوق AQLIYA Intelligence Core يرث تلقائياً سلسلة الأدلة، الصلاحيات، وسجل التدقيق.
            </p>
            <div className="mt-7 rounded-2xl border border-aqliya-cyan/18 bg-aqliya-cyan/[0.05] px-5 py-4 backdrop-blur max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan/80 mb-1.5">
                المبدأ الحاكم
              </p>
              <p className="text-base font-black text-white">
                الذكاء يساعد. الإنسان يقرر. الدليل يحكم.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Evidence Chain ───────────────────────────────── */}
      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <SectionEyebrow
          label="سلسلة الأدلة"
          title="كل مخرج له تاريخ كامل يمكن تتبعه"
          description="من لحظة إدخال البيانات إلى التصدير النهائي — كل خطوة موثَّقة ومرتبطة بالخطوة التالية. لا ثغرة في السلسلة."
        />

        <div className="mt-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {evidenceLevels.map((level) => (
              <div
                key={level.step}
                className="rounded-2xl border border-border/60 p-5 transition-all hover:border-primary/20 hover:shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-black text-primary shrink-0">
                    {level.step}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{level.title}</p>
                    <p className="text-[11px] text-muted-foreground">{level.en}</p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{level.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-primary/15 bg-primary/[0.04] p-5">
            <p className="text-xs font-bold text-primary mb-3">مسار سلسلة الأدلة</p>
            <WorkflowChain
              steps={["بيانات المصدر", "المعالجة", "مخرج الذكاء", "المراجعة", "الاعتماد", "التصدير"]}
              className="justify-start"
            />
          </div>
        </div>
      </section>

      {/* ─── RBAC ─────────────────────────────────────────── */}
      <section className="section-gradient-light border-t">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <SectionEyebrow
            label="الصلاحيات والأدوار"
            title="نموذج صلاحيات متعدد الطبقات بدون صلاحيات ضمنية"
            description="لا وصول ضمني في عقلية. كل صلاحية مُحدَّدة صراحةً على مستوى المؤسسة، مساحة العمل، الدور، والإجراء."
          />

          <div className="mt-10 space-y-3">
            {rbacLevels.map((level) => (
              <div
                key={level.level}
                className={`rounded-2xl border p-5 ${
                  level.critical
                    ? "border-primary/20 bg-primary/[0.04]"
                    : "border-border/60 bg-background"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <p className="text-sm font-black text-foreground">{level.level}</p>
                    <p className="text-[11px] text-muted-foreground">{level.en}</p>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground flex-1">
                    {level.desc}
                  </p>
                  {level.critical && (
                    <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-bold text-primary shrink-0">
                      أساسي
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Audit Trail ─────────────────────────────────── */}
      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <SectionEyebrow
          label="سجل التدقيق"
          title="سجل غير قابل للتعديل لكل حدث في المنصة"
          description="كل إجراء يُنفَّذ داخل عقلية يُسجَّل في سجل تدقيق مُستمر. لا حدث يغادر الذاكرة، لا سجل يُحذف."
        />

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {auditTrailProps.map((item) => (
            <div
              key={item.prop}
              className="flex gap-4 rounded-2xl border border-border/60 p-5"
            >
              <div className="w-40 shrink-0">
                <p className="text-xs font-bold text-foreground">{item.prop}</p>
              </div>
              <p className="text-sm leading-6 text-muted-foreground flex-1">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5">
          <p className="text-xs font-bold text-amber-700 mb-2">
            ملاحظة مهمة للمؤسسات
          </p>
          <p className="text-sm leading-6 text-amber-700/80">
            سجل التدقيق في عقلية مُصمَّم ليكون شاهداً مؤسسياً — يمكن الاستعانة به في مراجعات خارجية، تحقيقات، أو نزاعات. لهذا السبب لا يمكن حذفه أو تعديله حتى من قِبل مسؤولي المنصة.
          </p>
        </div>
      </section>

      {/* ─── AI Governance ───────────────────────────────── */}
      <section className="section-gradient-light border-t">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <SectionEyebrow
            label="حوكمة الذكاء الاصطناعي"
            title="الذكاء محدود بقواعد صريحة في كل سياق"
            description="في عقلية، الذكاء الاصطناعي ليس صندوقاً أسود. كل استخدام محكوم بقواعد معلنة تمنع التصرف المستقل وتضمن أن الإنسان يبقى في مركز القرار."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {aiRules.map((rule) => (
              <div
                key={rule.rule}
                className="rounded-2xl border border-border/60 bg-background p-5"
              >
                <div className="flex items-start gap-2 mb-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-aqliya-cyan" />
                  <p className="text-sm font-bold text-foreground">{rule.rule}</p>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{rule.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Tenant Isolation ────────────────────────────── */}
      <section className="mx-auto max-w-7xl border-t px-6 py-16 sm:py-20">
        <SectionEyebrow
          label="عزل المؤسسات"
          title="كل مؤسسة في بيئتها المستقلة الكاملة"
          description="في بيئة متعددة المستأجرين (Multi-tenant)، عزل البيانات بين المؤسسات غير قابل للتفاوض."
        />

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "عزل البيانات", body: "لا بيانات مشتركة بين مؤسسات مختلفة على أي مستوى." },
            { title: "عزل الصلاحيات", body: "مستخدم في مؤسسة لا يمكنه رؤية أو الوصول لأي بيانات مؤسسة أخرى." },
            { title: "عزل سجل التدقيق", body: "سجل التدقيق لكل مؤسسة منفصل ومحمي." },
            { title: "عزل الإعدادات", body: "إعدادات الحوكمة والأدوار والتهيئة مستقلة لكل مؤسسة." },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border/60 bg-muted/10 p-5"
            >
              <p className="text-sm font-black text-foreground mb-2">{item.title}</p>
              <p className="text-xs leading-6 text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────── */}
      <section className="section-gradient-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl rounded-[24px] border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-xl">
            <h2 className="text-2xl font-black text-white sm:text-3xl">
              لديك متطلبات أمنية أو امتثالية خاصة؟
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/55">
              نناقش معك متطلبات الحوكمة والأمان المحددة لمؤسستك ونحدد كيف تتوافق معها بنية عقلية.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="btn-primary h-11 px-8">
                طلب جلسة أمنية تقنية
              </Link>
              <Link href="/platform" className="btn-secondary h-11 px-8">
                معمارية المنصة
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
