import Link from "next/link";
import { DemoSidebar } from "./demo-sidebar";

const mobileSteps = [
  { label: "نظرة عامة", href: "/auditos" },
  { label: "الميزان", href: "/auditos/trial-balance" },
  { label: "التصنيف", href: "/auditos/mapping" },
  { label: "القوائم", href: "/auditos/statements" },
  { label: "الأدلة", href: "/auditos/evidence" },
  { label: "التتبع", href: "/auditos/traceability" },
];

export default function AuditosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen" dir="rtl">
      <DemoSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="mb-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              AuditOS Demo
            </p>
            <p className="text-sm text-muted-foreground">
              تنقل سريع بين خطوات العرض
            </p>
          </div>
          <nav
            className="flex gap-2 overflow-x-auto pb-1"
            aria-label="التنقل السريع في عرض AuditOS"
          >
            {mobileSteps.map((step) => (
              <Link
                key={step.href}
                href={step.href}
                className="shrink-0 rounded-full border border-border/70 bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground"
              >
                {step.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-b border-amber-200/70 bg-amber-50/90">
          <div className="mx-auto max-w-6xl px-6 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
              Demo Only
            </p>
            <p className="mt-1 text-sm leading-6 text-amber-950">
              هذا المسار عرض عام لـ AuditOS ببيانات تجريبية ثابتة فقط. لا توجد
              هنا بيانات عميل، ولا يمكن رفع ملفات أو تنزيل مخرجات أو حفظ
              تغييرات، ولا يصلح كمساحة عمل تشغيلية أو مسار عميل فعلي.
            </p>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
