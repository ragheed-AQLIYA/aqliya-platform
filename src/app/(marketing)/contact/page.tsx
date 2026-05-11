import Link from "next/link"
import type { Metadata } from "next"
import { SectionEyebrow, EnterpriseCTA } from "@/components/enterprise"

export const metadata: Metadata = {
  title: "تواصل معنا | AQLIYA",
  description: "ابدأ مشروعك مع عقلية — تصميم نظام خاص، تخصيص حلول جاهزة، أو مناقشة احتياج تشغيلي.",
}

export default function ContactPage() {
  return (
    <div className="flex flex-col gap-20 sm:gap-28">
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <SectionEyebrow
            label="تواصل معنا"
            title="ابدأ مشروعك مع عقلية"
            description="سواء كنت تريد تصميم نظام خاص، تخصيص أحد حلول عقلية، أو مناقشة احتياج تشغيلي داخل مؤسستك، يمكننا مساعدتك على تحويل الفكرة إلى نظام قابل للتشغيل."
          />
          <div className="mt-8 text-center">
            <a href="mailto:ragheed@aqliya.com" className="text-xl font-semibold text-primary underline-offset-4 hover:underline">
              ragheed@aqliya.com
            </a>
          </div>
        </div>
      </section>

      {/* 1. طلب نظام مؤسسي */}
      <section className="mx-auto max-w-7xl px-6">
        <EnterpriseCTA
          title="طلب نظام مؤسسي"
          description="إذا كانت مؤسستك تحتاج نظامًا مبنيًا حول طريقة عملها، ابدأ من هنا."
          primaryLabel="صمّم نظامك"
          primaryHref="/custom-product"
        />
      </section>

      {/* 2. AuditOS Demo */}
      <section className="mx-auto max-w-7xl px-6">
        <EnterpriseCTA
          title="استعراض AuditOS"
          description="هل تريد رؤية مثال حي على أنظمة عقلية؟ استعرض AuditOS."
          primaryLabel="استعرض AuditOS"
          primaryHref="/auditos"
          secondaryLabel="اطلب Pilot"
          secondaryHref="/custom-product"
        />
      </section>

      {/* 3. تواصل عام */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <SectionEyebrow
          label="تواصل عام"
          title="استفسارات أخرى"
          description="لأي استفسار عام أو شراكة محتملة، يمكنك التواصل مباشرة عبر البريد الإلكتروني."
        />
        <div className="mt-8 text-center">
          <a href="mailto:ragheed@aqliya.com" className="inline-flex h-12 items-center justify-center rounded-md border bg-background px-8 text-base font-medium text-foreground transition-colors hover:bg-muted">
            أرسل بريدًا إلكترونيًا
          </a>
        </div>
      </section>
    </div>
  )
}
