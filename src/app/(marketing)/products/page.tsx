import Link from "next/link"
import type { Metadata } from "next"
import { SectionEyebrow, ProductProofCard, EnterpriseCTA } from "@/components/enterprise"

export const metadata: Metadata = {
  title: "خطوط حلول عقلية | AQLIYA",
  description: "عقلية تبني أنظمة مؤسسية قابلة للتخصيص حسب طبيعة عمل المؤسسة.",
}

const productLines = [
  {
    title: "Custom Enterprise Systems",
    problem: "إجراءات متكررة، ملفات متفرقة، قرارات غير موثقة، مخرجات بلا تتبع.",
    system: "نحوّل طريقة عمل مؤسستك إلى نظام رقمي واضح: صفحات، صلاحيات، مسارات عمل، تقارير.",
    output: "نظام تشغيل داخلي قابل للتتبع والمراجعة والتطوير.",
    flow: ["فهم العمل", "تصميم النظام", "ربط البيانات", "تشغيل المخرجات"],
    href: "/custom-product",
  },
  {
    title: "Decision Systems",
    problem: "قرارات مهمة تُبنى على نقاشات وملفات متفرقة بلا توثيق.",
    system: "بدائل، معايير، مخاطر، أدلة، توصية قابلة للمراجعة والاعتماد.",
    output: "Decision Memo موثق وقابل للتتبع من المشكلة إلى القرار.",
    flow: ["Problem", "Criteria", "Evidence", "Recommendation"],
    href: "/products/decision",
  },
  {
    title: "Simulation Systems",
    problem: "قرارات كبرى تُتخذ قبل اختبار أثرها على التكلفة والأداء.",
    system: "مدخلات، نموذج سيناريو، افتراضات، أثر، مقارنة، دعم قرار.",
    output: "تقرير محاكاة يقارن السيناريوهات قبل التنفيذ.",
    flow: ["Inputs", "Scenario", "Impact", "Comparison"],
    href: "/products/simulation",
  },
  {
    title: "Sales Systems",
    problem: "فرص غير مؤهلة، رسائل عامة، متابعة عشوائية، أولويات غير واضحة.",
    system: "ICP، تأهيل، فلترة، تواصل، متابعة، تعلم مستمر.",
    output: "مسار مبيعات واضح من التأهيل إلى التحسين.",
    flow: ["ICP", "Scoring", "Outreach", "Learning"],
    href: "/products/sales",
  },
  {
    title: "AQLIYA AuditOS",
    problem: "ميزان مراجعة، تصنيف يدوي، أدلة متفرقة، مراجعة بطيئة.",
    system: "Mapping، قوائم مالية، إيضاحات، أدلة، ملاحظات، تتبع.",
    output: "ملف مراجعة قابل للتتبع من الحساب إلى الدليل.",
    flow: ["TB", "Mapping", "Statement", "Evidence"],
    href: "/auditos",
  },
  {
    title: "Local Content Systems",
    problem: "بيانات موردين غير مصنفة، إنفاق غير محلل، التزام غير واضح.",
    system: "موردون، إنفاق، تصنيف، فجوة التزام، محاكاة، تقارير.",
    output: "نظام محتوى محلي يربط الموردين بالالتزام والمؤشرات.",
    flow: ["Suppliers", "Spend", "Compliance", "Report"],
    href: "/products/local-content",
  },
]

export default function ProductsPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <SectionEyebrow
            label="منتجاتنا"
            title="خطوط حلول عقلية"
            description="عقلية تبني أنظمة مؤسسية قابلة للتخصيص حسب طبيعة عمل المؤسسة. هذه الخطوط لا تحد نطاق عقلية، بل تمثل نماذج من قدرتها على بناء أنظمة متخصصة."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {productLines.map((product) => (
            <ProductProofCard
              key={product.href}
              title={product.title}
              problem={product.problem}
              system={product.system}
              output={product.output}
              flow={product.flow}
              href={product.href}
            />
          ))}
        </div>
        <div className="mt-12">
          <EnterpriseCTA
            title="هل تحتاج نظامًا مصممًا لطبيعة عملك؟"
            primaryLabel="صمّم نظامك الآن"
            primaryHref="/custom-product"
            secondaryLabel="تواصل معنا"
            secondaryHref="/contact"
          />
        </div>
      </section>
    </div>
  )
}
