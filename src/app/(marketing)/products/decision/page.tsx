import Link from "next/link";
import type { Metadata } from "next";
import {
  SectionEyebrow,
  BeforeAfterBlock,
  ProductWorkflowVisual,
  OutputCard,
  EnterpriseCTA,
} from "@/components/enterprise";

export const metadata: Metadata = {
  title: "DecisionOS — حوكمة القرارات التنفيذية | AQLIYA",
  description:
    "DecisionOS خط نظام لحوكمة القرارات التنفيذية ضمن AQLIYA Intelligence Core، يربط البدائل والمعايير والمخاطر والأدلة ضمن مسار قابل للمراجعة والاعتماد.",
};

const outputs = [
  "Decision Brief",
  "Decision Memo",
  "Comparison Matrix",
  "Risk Summary",
  "Recommendation Report",
  "Approval Log",
];

export default function DecisionProductPage() {
  return (
    <div className="flex flex-col gap-20 sm:gap-28">
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <Link
            href="/products"
            className="relative text-sm text-white/45 hover:text-white/70 transition-colors"
          >
            ← العودة إلى خطوط عقلية
          </Link>
          <div className="relative max-w-4xl">
            <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              DecisionOS / Governed Decisions
            </span>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/78">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              نظام مجاور — نشط
            </div>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              حوكمة القرار بدل تركه لمذكرات متفرقة ونقاشات غير قابلة للتتبع
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/62">
              DecisionOS يحول القرارات المعقدة من نقاشات وملفات متفرقة إلى مسار
              مؤسسي واضح: مشكلة، بدائل، معايير، مخاطر، أدلة، توصية، واعتماد داخل
              منطق واحد مبني على AQLIYA Intelligence Core.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/custom-product" className="btn-primary px-6">
                ناقش تفعيل النظام
              </Link>
              <Link href="/products" className="btn-secondary px-6">
                استكشف خطوط عقلية
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Before / After */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="المشكلة والحل"
          title="لماذا تحتاج المؤسسات نظام قرار واضح؟"
          description="DecisionOS يربط البدائل والمعايير والمخاطر والأدلة داخل منطق حوكمة واحد، بحيث يصبح القرار المؤسسي قابلاً للمراجعة لا مجرد توصية سريعة."
        />
        <div className="mt-10">
          <BeforeAfterBlock
            before={[
              "قرارات تعتمد على النقاشات فقط",
              "ملفات ومبررات غير موثقة",
              "تقييم مخاطر غير منهجي",
              "صعوبة تتبع سبب القرار",
              "اعتمادات غير واضحة",
            ]}
            after={[
              "مسار قرار موثق ومنهجي",
              "معايير تقييم واضحة وقابلة للقياس",
              "ملخص مخاطر مرتبط بالبدائل",
              "توصية مدعومة بالأدلة",
              "سجل اعتماد كامل",
            ]}
          />
        </div>
      </section>

      {/* 3. Governance & Trust Principle */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="الحوكمة والثقة"
          title="كيف يعمل مبدأ الثقة في نظام القرار؟"
          description="الذكاء يساعد بإعداد البيانات والبدائل. الإنسان يقرر بناءً على المعايير والأدلة. الدليل يحكم من خلال توثيق كامل للمسار والقرار."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <div className="rounded-[16px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-sm font-semibold text-aqliya-cyan">
              الذكاء يساعد
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/62">
              النظام يصنف البدائل، يقيّم المخاطر، يجمع الأدلة، لكنه لا يقرر.
            </p>
          </div>
          <div className="rounded-[16px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-sm font-semibold text-aqliya-cyan">
              الإنسان يقرر
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/62">
              المتخذ يختار بناءً على معايير واضحة وأدلة موثقة وتقييم مخاطر كامل.
            </p>
          </div>
          <div className="rounded-[16px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-sm font-semibold text-aqliya-cyan">
              الدليل يحكم
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/62">
              كل قرار مرتبط بمسار تام، معايير معروضة، وسجل اعتماد كامل.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Workflow Visual */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow label="سير العمل" title="كيف يعمل النظام؟" />
        <div className="mt-10">
          <ProductWorkflowVisual
            title="من المشكلة إلى الاعتماد"
            steps={[
              "المشكلة",
              "البدائل",
              "المعايير",
              "المخاطر",
              "الأدلة",
              "التوصية",
              "الاعتماد",
            ]}
          />
        </div>
      </section>

      {/* 5. Outputs */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow label="المخرجات" title="ماذا ينتج النظام؟" />
        <div className="mt-10">
          <OutputCard title="تقارير وسجلات القرار" items={outputs} />
        </div>
      </section>

      {/* 6. Customization */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="التخصيص"
          title="كيف يتكيف النظام مع مؤسستك؟"
          description="يُفعّل DecisionOS حسب نطاق المؤسسة من خلال مواءمة البيانات، الصلاحيات، إجراءات الاعتماد، معايير التقييم، والتقارير، مع بقاء النواة الحاكمة نفسها فوق AQLIYA Intelligence Core."
        />
      </section>

      {/* 7. Use Scenario */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="سيناريو تطبيقي"
          title="لجنة المشتريات في مؤسسة كبيرة"
        />
        <div className="mt-10 rounded-[24px] border border-border/70 bg-gradient-to-br from-background to-muted/30 p-6 shadow-sm sm:p-8">
          <p className="text-base leading-8 text-muted-foreground">
            <strong className="text-foreground">قبل:</strong> قرارات الشراء تتم
            عبر اجتماعات متفرقة، عروض أسعار غير مقارنة بمنهجية واضحة، ومبررات
            غير موثقة.
          </p>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            <strong className="text-foreground">بعد:</strong> كل قرار يمر بمسار
            واضح: تحديد الحاجة → مقارنة البدائل → تقييم المخاطر → توثيق المبررات
            → إصدار التوصية → الاعتماد الرسمي.
          </p>
        </div>
      </section>

      {/* 8. CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <EnterpriseCTA
          title="هل تحتاج نظام قرار واضح لمؤسستك؟"
          primaryLabel="ناقش تفعيل النظام"
          primaryHref="/custom-product"
          secondaryLabel="استكشف خطوط عقلية"
          secondaryHref="/contact"
        />
      </section>
    </div>
  );
}
