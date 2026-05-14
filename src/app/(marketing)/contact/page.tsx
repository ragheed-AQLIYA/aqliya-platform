import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "تواصل معنا | AQLIYA",
  description: "ابدأ من نطاق مؤسستك مع عقلية: حدد خط النظام المناسب، ناقش التفعيل، أو اطلب جلسة تصميم نظام مؤسسي محكوم.",
}

export default function ContactPage() {
  return (
    <div className="flex flex-col">
      {/* Hero — Dark */}
      <section className="bg-[#0B1728] border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full border border-[#137dc5]/20 bg-[#137dc5]/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#137dc5]">
              Contact
            </span>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
              ابدأ من نطاق مؤسستك
            </h1>
            <p className="mt-4 text-base leading-7 text-white/50">
              سواء كنت تريد تفعيل خط نظام تحت عقلية، أو تحديد المسار المؤسسي المناسب، أو تصميم نظام خاص فوق AQLIYA Intelligence Core، فهذه هي نقطة البداية الصحيحة.
            </p>
          </div>
        </div>
      </section>

      {/* 1. Activation CTA */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl rounded-xl border bg-muted/10 p-8 sm:p-10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xl font-bold">1</div>
            <div>
              <h2 className="text-xl font-bold text-foreground">حدد خط النظام المناسب</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                إذا كنت تعرف المجال الذي تريد تفعيله داخل مؤسستك، فابدأ من اختيار خط النظام المناسب: تدقيق، محتوى محلي، حوكمة قرار، مبيعات، محاكاة، أو مسار مخصص فوق عقلية.
              </p>
              <div className="mt-4">
                <Link href="/products" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                  استكشف خطوط عقلية
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Activation Discussion */}
      <section className="mx-auto max-w-7xl px-6 py-12 border-t">
        <div className="mx-auto max-w-3xl rounded-xl border bg-muted/10 p-8 sm:p-10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xl font-bold">2</div>
            <div>
              <h2 className="text-xl font-bold text-foreground">ناقش تفعيل النظام</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                إذا كنت تحتاج مناقشة نطاق التفعيل، الحوكمة، طبيعة البيانات، أو المسار التشغيلي المناسب، فابدأ من جلسة تفعيل النظام أو من طلب تصميم نظام مؤسسي محكوم.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/custom-product" className="inline-flex h-10 items-center justify-center rounded-md border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                  اطلب جلسة تصميم النظام
                </Link>
                <a href="mailto:ragheed@aqliya.com" className="inline-flex h-10 items-center justify-center rounded-md border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                  ناقش التفعيل عبر البريد
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Proof Application */}
      <section className="mx-auto max-w-7xl px-6 py-12 border-t">
        <div className="mx-auto max-w-3xl rounded-xl border bg-muted/10 p-8 sm:p-10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xl font-bold">3</div>
            <div>
              <h2 className="text-xl font-bold text-foreground">شاهد AuditOS كأول تطبيق</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                إذا أردت رؤية كيف تتحول AQLIYA Intelligence Core إلى تطبيق فعلي، فابدأ بعرض AuditOS التوضيحي كأول تطبيق مُثبت تحت عقلية.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/auditos" className="inline-flex h-10 items-center justify-center rounded-md border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                  شاهد AuditOS
                </Link>
                <a href="mailto:ragheed@aqliya.com" className="inline-flex h-10 items-center justify-center rounded-md border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                  راسلنا مباشرة
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
