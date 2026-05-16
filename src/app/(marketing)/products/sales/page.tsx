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
  title: "SalesOS — الذاكرة التجارية والمبيعات | AQLIYA",
  description:
    "SalesOS نموذج أولي لنظام الذاكرة التجارية والمبيعات ضمن عقلية، ينظم التأهيل والترتيب والمتابعة والتعلم داخل مسار تجاري محكوم.",
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
            ← العودة إلى خطوط عقلية
          </Link>
          <div className="relative max-w-4xl">
            <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              SalesOS / Commercial Memory
            </span>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              نموذج أولي — مستقبلي
            </div>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              المبيعات ليست فقط Pipeline بل ذاكرة تشغيلية يجب أن تتعلم وتتحسن
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/62">
              SalesOS هو نموذج أولي ضمن عقلية لنظام الذاكرة التجارية والمبيعات.
              يستكشف كيفية تنظيم رحلة المبيعات من تعريف العميل المثالي إلى
              التأهيل والترتيب والمتابعة والتعلم المؤسسي. حاليًا، يوجد واجهة
              لوحة معلومات ثابتة بدون خلفية تشغيلية مكتملة.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/custom-product" className="btn-primary px-6">
                ناقش التفعيل المستقبلي
              </Link>
              <Link href="/products" className="btn-secondary px-6">
                استكشف خطوط عقلية
              </Link>
            </div>
            <p className="mt-4 text-xs leading-6 text-white/35">
              SalesOS حاليًا في مرحلة النموذج الأولي. لا توجد خلفية تشغيلية أو
              قاعدة بيانات مكتملة بعد.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Before / After */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="المشكلة والحل"
          title="لماذا تحتاج فرق المبيعات نظامًا واضحًا؟"
          description="SalesOS لا يقدم CRM عامًا، بل يفعّل ذاكرة تجارية مؤسسية تربط التأهيل والأولوية والمتابعة والتعلم داخل منطق واحد قابل للتتبع."
        />
        <div className="mt-10">
          <BeforeAfterBlock
            before={[
              "عملاء غير مؤهلين",
              "رسائل عامة وغير مخصصة",
              "متابعة ضعيفة أو عشوائية",
              "غياب منطق الأولوية",
              "تقارير أداء غير دقيقة",
            ]}
            after={[
              "ملف عميل مثالي واضح (ICP)",
              "تأهيل وترتيب منهجي",
              "حملات ومتابعة منظمة",
              "أولويات مبنية على البيانات",
              "تقارير تعلم وتحسين مستمر",
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
          title="فريق مبيعات B2B في شركة خدمات"
        />
        <div className="mt-10 rounded-[24px] border border-border/70 bg-gradient-to-br from-background to-muted/30 p-6 shadow-sm sm:p-8">
          <p className="text-base leading-8 text-muted-foreground">
            <strong className="text-foreground">قبل:</strong> الفريق يتواصل مع
            أي عميل محتمل، بدون تأهيل واضح، والمتابعة تعتمد على الذاكرة
            والاجتهاد الشخصي.
          </p>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            <strong className="text-foreground">بعد:</strong> كل عميل يمر بمسار
            تأهيل واضح، يتم ترتيبه بناءً على معايير محددة، والمتابعة تتم
            تلقائيًا وفقًا لمنطق محدد.
          </p>
        </div>
      </section>

      {/* 8. CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <EnterpriseCTA
          title="هل تحتاج نظام مبيعات واضح لفريقك؟"
          description="SalesOS في مرحلة النموذج الأولي. إذا كنت مهتمًا بهذا المفهوم، ناقش حالة الاستخدام مع فريق عقلية."
          primaryLabel="ناقش حالة الاستخدام"
          primaryHref="/custom-product"
          secondaryLabel="استكشف خطوط عقلية"
          secondaryHref="/products"
        />
      </section>
    </div>
  );
}
