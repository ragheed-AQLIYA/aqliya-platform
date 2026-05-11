import Link from "next/link"
import type { Metadata } from "next"
import { SectionEyebrow, EnterpriseCTA, CompanyProductMap } from "@/components/enterprise"

export const metadata: Metadata = {
  title: "من نحن | AQLIYA",
  description: "عقلية شركة تقنية تبني وتخصص أنظمة برمجية وذكاء مؤسسي للمؤسسات.",
}

const principles = [
  { title: "الوضوح", desc: "نبدأ من فهم العمل قبل بناء النظام." },
  { title: "التتبع", desc: "كل مخرج مرتبط بمصدره." },
  { title: "المراجعة", desc: "كل نتيجة قابلة للفحص قبل الاعتماد." },
  { title: "التخصيص", desc: "النظام يُبنى حسب طبيعة المؤسسة." },
  { title: "التطوير", desc: "النظام قابل للتحسين بعد التشغيل." },
]

const whatWeDontDo = [
  "لا نبيع AI عام.",
  "لا نفرض قالبًا واحدًا.",
  "لا نستبدل القرار البشري.",
  "لا نبني مخرجات بلا تتبع.",
]

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-20 sm:gap-28">
      {/* 1. من نحن */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <SectionEyebrow
            label="من نحن"
            title="عقلية — شركة أنظمة مؤسسية"
            description="عقلية AQLIYA شركة تقنية تبني وتخصص أنظمة برمجية وذكاء مؤسسي للمؤسسات التي تحتاج إلى تشغيل أوضح، بيانات أكثر تنظيمًا، ومخرجات قابلة للتتبع والمراجعة."
          />
        </div>
      </section>

      {/* 2. لماذا بدأنا */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="لماذا بدأنا"
          title="المؤسسات تحتاج أنظمة تفهم طريقة عملها"
          description="رأينا أن الكثير من المؤسسات تعتمد على أدوات عامة لا تفهم طبيعة عملها. لذلك بدأنا عقلية لبناء أنظمة مصممة حول طريقة عمل المؤسسة، لا العكس."
        />
      </section>

      {/* 3. كيف نفكر */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="كيف نفكر"
          title="لا نبدأ بالأداة، نبدأ بالعمل"
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {principles.map((p) => (
            <div key={p.title} className="rounded-xl border bg-background p-6 shadow-sm">
              <h3 className="text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. ما الذي لا نفعله */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="ما الذي لا نفعله"
          title="حدودنا واضحة"
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {whatWeDontDo.map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-destructive/50" />
              <span className="text-sm leading-6 text-foreground">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. الشركة والمنتجات */}
      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="الشركة والمنتجات"
          title="AQLIYA = الشركة"
          description="AuditOS = منتج. عقلية هي الشركة التي تبني الأنظمة. منتجات مثل AuditOS تمثل أحد تطبيقات عقلية في مجال محدد، لكنها لا تحد نطاق الشركة."
        />
        <div className="mt-10">
          <CompanyProductMap />
        </div>
      </section>

      {/* 6. CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <EnterpriseCTA
          title="ابدأ مشروعك مع عقلية"
          primaryLabel="صمّم نظامك"
          primaryHref="/custom-product"
          secondaryLabel="تواصل معنا"
          secondaryHref="/contact"
        />
      </section>
    </div>
  )
}
