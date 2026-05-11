import Link from "next/link"
import type { Metadata } from "next"
import { SectionEyebrow, ProductLineCard, EnterpriseCTA } from "@/components/enterprise"

export const metadata: Metadata = {
  title: "خطوط حلول عقلية | AQLIYA",
  description: "تطوّر عقلية خطوط حلول جاهزة يمكن تشغيلها أو تخصيصها حسب طبيعة عمل المؤسسة.",
}

const productLines = [
  {
    title: "الأنظمة المؤسسية المخصصة",
    desc: "نبني أنظمة رقمية من الصفر أو نخصص حلولاً موجودة لتتناسب تمامًا مع إجراءات مؤسستك، بياناتها، صلاحياتها، ومخرجاتها.",
    href: "/custom-product",
    workflow: ["فهم العمل", "تصميم النظام", "البناء", "التشغيل"],
    visualType: "workflow" as const,
  },
  {
    title: "أنظمة اتخاذ القرار",
    desc: "أنظمة تساعد المؤسسات على تنظيم القرارات المعقدة من مرحلة تحديد المشكلة إلى مقارنة البدائل، تقييم المخاطر، توثيق المبررات، وإصدار توصية قابلة للمراجعة والاعتماد.",
    href: "/products/decision",
    workflow: ["المشكلة", "البدائل", "المعايير", "التوصية"],
    visualType: "decision" as const,
  },
  {
    title: "أنظمة المحاكاة",
    desc: "أنظمة تساعد المؤسسات على اختبار السيناريوهات قبل التنفيذ، ومقارنة أثر الخيارات على النتائج، التكاليف، المخاطر، الإيرادات، أو مؤشرات الأداء.",
    href: "/products/simulation",
    workflow: ["المدخلات", "السيناريو", "الافتراضات", "الأثر"],
    visualType: "simulation" as const,
  },
  {
    title: "أنظمة المبيعات",
    desc: "أنظمة تساعد فرق B2B على تنظيم المبيعات من تعريف العميل المثالي إلى تأهيل العملاء، ترتيب الأولويات، تنفيذ الحملات، المتابعة، وتحسين الأداء.",
    href: "/products/sales",
    workflow: ["ICP", "التأهيل", "المتابعة", "التحسين"],
    visualType: "sales" as const,
  },
  {
    title: "AQLIYA AuditOS",
    desc: "نظام المراجعة والتدقيق والذكاء المالي. يوضح كيف يمكن لعقلية تحويل سير عمل مهني معقد إلى نظام واضح وقابل للتتبع.",
    href: "/auditos",
    workflow: ["ميزان المراجعة", "التصنيف", "القوائم", "الأدلة"],
    visualType: "audit" as const,
  },
  {
    title: "أنظمة المحتوى المحلي",
    desc: "أنظمة تساعد المؤسسات على إدارة وتحليل بيانات الموردين، الإنفاق، الالتزام، ومؤشرات المحتوى المحلي بطريقة أوضح وقابلة للتتبع.",
    href: "/products/local-content",
    workflow: ["الموردين", "الإنفاق", "الالتزام", "التقارير"],
    visualType: "local-content" as const,
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
            description="تطوّر عقلية خطوط حلول جاهزة يمكن تشغيلها أو تخصيصها حسب طبيعة عمل المؤسسة. هذه الخطوط لا تحد نطاق عقلية، بل تمثل نماذج من قدرتها على بناء أنظمة متخصصة حسب الحاجة."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {productLines.map((product) => (
            <ProductLineCard
              key={product.href}
              title={product.title}
              description={product.desc}
              href={product.href}
              workflow={product.workflow}
              visualType={product.visualType}
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
