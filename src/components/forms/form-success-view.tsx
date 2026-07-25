"use client";

export function FormSuccessView({ contactEmail }: { contactEmail: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6 sm:py-16">
      <div className="rounded-[28px] border border-border/70 bg-gradient-to-br from-background via-background to-primary/[0.03] p-8 shadow-sm sm:p-10">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <span className="text-2xl">✓</span>
        </div>
        <h2 className="text-2xl font-black">تم استلام طلبك</h2>
        <p className="mt-3 leading-7 text-muted-foreground">
          سنراجع طبيعة العمل ونقترح المسار الأنسب:
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
          <span className="rounded-full bg-muted px-3 py-1.5">جلسة فهم</span>
          <span>→</span>
          <span className="rounded-full bg-muted px-3 py-1.5">تصور أولي</span>
          <span>→</span>
          <span className="rounded-full bg-muted px-3 py-1.5">
            ديمو أو Pilot
          </span>
          <span>→</span>
          <span className="rounded-full bg-muted px-3 py-1.5">
            بناء النظام
          </span>
        </div>
        <p className="mt-6 text-sm text-muted-foreground/80">
          سيتم إرسال نسخة إلى {contactEmail}
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a href="/products" className="btn-outline h-10 px-5 text-sm">
            استكشف خطوط حلول عقلية
          </a>
          <a href="/contact" className="btn-primary h-10 px-5 text-sm">
            تواصل معنا
          </a>
        </div>
      </div>
    </div>
  );
}
