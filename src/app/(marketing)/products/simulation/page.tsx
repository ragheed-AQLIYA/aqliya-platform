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
  title: "SimulationOS — محاكاة السيناريوهات | AQLIYA",
  description:
    "SimulationOS نظام ضمن عقلية لمحاكاة السيناريوهات ومقارنة أثر القرارات قبل التنفيذ — قيد التخطيط، يُعرَض حاليًا كصفحة تعريفية.",
};

const outputs = [
  "Scenario Report",
  "Impact Comparison",
  "Risk View",
  "Cost/Benefit Simulation",
  "Recommendation Input",
];

export default function SimulationProductPage() {
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
              SimulationOS / Scenario Intelligence
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              اختبار القرار قبل تنفيذه يجب أن يكون جزءًا من المسار لا تمرينًا
              منفصلًا
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/62">
              SimulationOS ضمن عقلية — نظام قيد التخطيط لمحاكاة السيناريوهات
              ومقارنة أثر الخيارات على النتائج والتكلفة والمخاطر قبل التنفيذ،
              داخل مسار محاكاة قابل للمراجعة والاعتماد. يُعرَض حاليًا كصفحة
              تعريفية حتى اكتمال التطوير.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/50">
              <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
              قيد التخطيط
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/custom-product" className="btn-primary px-6">
                ناقش حالة استخدام مؤسسية
              </Link>
              <Link href="/products" className="btn-secondary px-6">
                استكشف خطوط عقلية
              </Link>
            </div>
            <p className="mt-4 text-xs leading-6 text-white/35">
              SimulationOS قيد التخطيط. التفعيل يتطلب تنسيقًا مسبقًا
              مع الفريق الهندسي.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Before / After */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="المشكلة والحل"
          title="لماذا تحتاج المؤسسات محاكاة قبل التنفيذ؟"
          description="SimulationOS يربط الافتراضات والمدخلات والمقارنة داخل خط نظام محكوم، بحيث تصبح المحاكاة أداة قرار قابلة للمراجعة لا مجرد تصور منفصل."
        />
        <div className="mt-10">
          <BeforeAfterBlock
            before={[
              "قرارات تتخذ دون اختبار الأثر",
              "توقعات غير مدعومة ببيانات",
              "صعوبة مقارنة السيناريوهات",
              "مخاطر غير محسوبة",
              "تكاليف غير متوقعة",
            ]}
            after={[
              "سيناريوهات مدروسة وقابلة للمقارنة",
              "أثر واضح على التكلفة والإيرادات",
              "تقييم مخاطر منهجي",
              "دعم القرار بالبيانات",
              "توقعات واقعية وموثقة",
            ]}
          />
        </div>
      </section>

      {/* 3. Governance & Trust Principle */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="الحوكمة والثقة"
          title="كيف يعمل مبدأ الثقة في المحاكاة؟"
          description="الذكاء يساعد بمعالجة السيناريوهات والافتراضات والأثر. الإنسان يقرر بناءً على النتائج والمقارنات. الدليل يحكم من خلال توثيق كامل للنموذج والافتراضات."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <div className="rounded-[16px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-sm font-semibold text-aqliya-cyan">
              الذكاء يساعد
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/62">
              النظام يعالج المدخلات، يبني النماذج، يحسب الأثر والمقارنات.
            </p>
          </div>
          <div className="rounded-[16px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-sm font-semibold text-aqliya-cyan">
              الإنسان يقرر
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/62">
              المتخذ يقيّم السيناريوهات، يختار الافتراضات الأساسية، يحكم على
              الأثر.
            </p>
          </div>
          <div className="rounded-[16px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-sm font-semibold text-aqliya-cyan">
              الدليل يحكم
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/62">
              كل محاكاة مرتبطة بنموذج موثق، افتراضات معروضة، وتقارير مدقوقة.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Workflow Visual */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow label="سير العمل" title="كيف يعمل النظام؟" />
        <div className="mt-10">
          <ProductWorkflowVisual
            title="من المدخلات إلى دعم القرار"
            steps={[
              "المدخلات",
              "نموذج السيناريو",
              "الافتراضات",
              "الأثر",
              "المقارنة",
              "دعم القرار",
            ]}
          />
        </div>
      </section>

      {/* 5. Outputs */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow label="المخرجات" title="ماذا ينتج النظام؟" />
        <div className="mt-10">
          <OutputCard title="تقارير المحاكاة والمقارنات" items={outputs} />
        </div>
      </section>

      {/* 6. Customization */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="التخصيص"
          title="كيف يتكيف النظام مع مؤسستك؟"
          description="يُفعّل SimulationOS حسب نطاق المؤسسة عبر النماذج، المتغيرات، معايير المقارنة، التقارير، ولوحات العرض، مع بقاء منطق التتبع والمراجعة ثابتًا فوق AQLIYA Intelligence Core."
        />
      </section>

      {/* 7. Use Scenario */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="سيناريو تطبيقي"
          title="محاكاة أثر تغيير الموردين"
        />
        <div className="mt-10 rounded-[24px] border border-border/70 bg-gradient-to-br from-background to-muted/30 p-6 shadow-sm sm:p-8">
          <p className="text-base leading-8 text-muted-foreground">
            <strong className="text-foreground">قبل:</strong> اختيار الموردين
            يعتمد على السعر فقط، دون فهم الأثر الكلي على الجودة، الالتزام،
            والمحتوى المحلي.
          </p>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            <strong className="text-foreground">بعد:</strong> محاكاة شاملة تقارن
            بين الموردين بناءً على السعر، الجودة، الالتزام، المحتوى المحلي،
            والمخاطر التشغيلية.
          </p>
        </div>
      </section>

      {/* 8. CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <EnterpriseCTA
          title="هل تحتاج نظام محاكاة لمؤسستك؟"
          description="SimulationOS في المرحلة التسويقية حاليًا. إذا كنت مهتمًا بهذا المفهوم، ناقش حالة الاستخدام مع فريق عقلية."
          primaryLabel="ناقش حالة الاستخدام"
          primaryHref="/custom-product"
          secondaryLabel="استكشف خطوط عقلية"
          secondaryHref="/products"
        />
      </section>
    </div>
  );
}
