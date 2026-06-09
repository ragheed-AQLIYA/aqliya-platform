import Link from "next/link";
import type { Metadata } from "next";
import {
  SectionEyebrow,
  BeforeAfterBlock,
  ProductWorkflowVisual,
  OutputCard,
  EnterpriseCTA,
} from "@/components/enterprise";
import { publicOsStatus } from "@/lib/marketing/public-status";

export const metadata: Metadata = {
  title: "SalesOS — نظام تشغيل تطوير الأعمال والمبيعات | AQLIYA",
  description:
    "SalesOS نظام تشغيل تطوير الأعمال والمبيعات ضمن عقلية — يحل تحديات تشغيلية محددة داخل المؤسسة مثل إدارة الحسابات والفرص والاجتماعات والعروض والعقود والذاكرة البيعية مع حوكمة وأدلة وسجل تدقيقي كامل.",
};

const outputs = [
  "ICP Profiles",
  "Lead Score",
  "Opportunity List",
  "Campaign Logic",
  "Follow-up Tracker",
  "Sales Learning Report",
];

export default function SalesProductPage() {
  return (
    <div className="flex flex-col gap-20 sm:gap-28">
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <Link
            href="/products"
            className="relative text-sm text-white/45 hover:text-white/70 transition-colors"
          >
            ← العودة إلى المنتجات
          </Link>
          <div className="relative max-w-4xl">
            <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              SalesOS / Business Development & Sales
            </span>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-muted-foreground/30 bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
              {publicOsStatus.salesOS.label}
            </div>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              نظام ذاكرة تجارية محكوم — قيد التطوير
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/62">
              SalesOS خط استراتيجي على AQLIYA Intelligence Core — ليس متاحًا
              للشراء أو البايلوت حاليًا. هذه الصفحة تصف الاتجاه فقط، لا منتجًا
              جاهزًا للتفعيل.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/contact" className="btn-primary px-6">
                ناقش الاتجاه مع الفريق
              </Link>
              <Link href="/products#strategic" className="btn-secondary px-6">
                الخطوط الاستراتيجية
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Before / After */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="المشكلة والحل"
          title="لماذا تحتاج فرق المبيعات نظام تشغيل بدلاً من أدوات متفرقة؟"
          description="SalesOS لا يقدم CRM تقليديًا، بل نظام تشغيل تطوير أعمال ومبيعات يربط الحسابات والفرص والعقود والذاكرة البيعية داخل بيئة واحدة محكومة وقابلة للتتبع."
        />
        <div className="mt-10">
          <BeforeAfterBlock
            before={[
              "حسابات مبعثرة بين جداول ورسائل",
              "فرص بدون تصنيف أو أولوية",
              "اجتماعات دون أهداف أو متابعة",
              "عروض وعقود خارج النظام",
              "غياب الذاكرة البيعية عند تغير الفريق",
            ]}
            after={[
              "حسابات منظّمة بسجل كامل",
              "فرص مصنّفة حسب الأولوية والمرحلة",
              "اجتماعات مرتبطة بالحساب والفرصة",
              "عروض وعقود داخل سير عمل موحّد",
              "ذاكرة بيعية مؤسسية قابلة للتعلم",
            ]}
          />
        </div>
      </section>

      {/* 3. Governance & Trust Principle */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="الحوكمة والثقة"
          title="كيف يعمل مبدأ الثقة في النظام التجاري؟"
          description="الذكاء يساعد بتصنيف العملاء والأولويات. الإنسان يقرر حول الاستراتيجية والرسالة. الدليل يحكم من خلال سجل كامل للتواصل والنتائج."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <div className="rounded-[16px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-sm font-semibold text-aqliya-cyan">
              الذكاء يساعد
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/62">
              النظام يصنف العملاء وفقاً لـ ICP، يقيّم التأهيل، يوصي بالأولويات.
            </p>
          </div>
          <div className="rounded-[16px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-sm font-semibold text-aqliya-cyan">
              الإنسان يقرر
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/62">
              الفريق يختار الرسالة والنهج والأولويات بناءً على السياق والحكم
              الشخصي.
            </p>
          </div>
          <div className="rounded-[16px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-sm font-semibold text-aqliya-cyan">
              الدليل يحكم
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/62">
              كل تواصل وتفاعل مسجل، والنتائج مرتبطة بالحملة والفريق والعميل.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Workflow Visual */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow label="سير العمل" title="كيف يعمل النظام؟" />
        <div className="mt-10">
          <ProductWorkflowVisual
            title="من التأهيل إلى التعلم"
            steps={[
              "ICP",
              "التأهيل",
              "الفلترة",
              "التواصل",
              "المتابعة",
              "التعلم",
            ]}
          />
        </div>
      </section>

      {/* 5. Outputs */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow label="المخرجات" title="ماذا ينتج النظام؟" />
        <div className="mt-10">
          <OutputCard title="تقارير المبيعات والأداء" items={outputs} />
        </div>
      </section>

      {/* 6. Customization */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="التخصيص"
          title="كيف يتكيف النظام مع مؤسستك؟"
          description="يُفعّل SalesOS حسب نطاق المؤسسة عبر معايير التأهيل، منطق الترتيب، قنوات التواصل، تقارير الأداء، ولوحات المتابعة، مع بقاء منطق الحوكمة والتعلم المؤسسي ثابتًا فوق AQLIYA Intelligence Core."
        />
      </section>

      {/* 7. Use Scenario */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="سيناريو تطبيقي"
          title="قسم مبيعات B2B يعاني من تشتت الحسابات والفرص"
        />
        <div className="mt-10 rounded-[24px] border border-border/70 bg-gradient-to-br from-background to-muted/30 p-6 shadow-sm sm:p-8">
          <p className="text-base leading-8 text-muted-foreground">
            <strong className="text-foreground">قبل:</strong> الحسابات موزعة
            بين إيميلات وجداول إكسل وملاحظات شخصية. الفرص بدون تصنيف،
            والاجتماعات لا ترتبط بصفقة محددة. عند مغادرة أي عضو فريق، تضيع
            معرفة كاملة بحسابات كاملة.
          </p>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            <strong className="text-foreground">بعد:</strong> كل حساب له سجل
            كامل بالفرص والاجتماعات والعروض والعقود. الفرص مصنّفة حسب
            المرحلة والأولوية. الذاكرة البيعية مؤسسية — لا تضيع المعرفة
            بتغير الفريق. وكل قرار موثق مع دليل وسجل تدقيقي.
          </p>
        </div>
      </section>

      {/* 8. CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <EnterpriseCTA
          title="مهتم بمسار الذاكرة التجارية المحكومة؟"
          description="SalesOS قيد التطوير — لا بايلوت ولا شراء حاليًا. يمكننا مناقشة الاتجاه أو مسار AuditOS/DecisionOS إذا كان لديك حاجة تشغيلية فورية."
          primaryLabel="احجز جلسة تشخيص"
          primaryHref="/contact"
          secondaryLabel="مركز الإثبات"
          secondaryHref="/proof"
        />
      </section>
    </div>
  );
}
