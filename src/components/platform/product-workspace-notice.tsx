import { cn } from "@/lib/utils"

type NoticeLevel = "prototype" | "conditional" | "pilot"

const COPY: Record<
  NoticeLevel,
  { badge: string; title: string; body: string }
> = {
  prototype: {
    badge: "نموذج أولي — L3",
    title: "سطح تجريبي محكوم",
    body: "البيانات والتدفقات قيد التطوير. الذكاء الاصطناعي يساعد — الإنسان يقرر — الدليل يحكم. لا تُستخدم لقرارات نهائية أو بيانات عملاء حقيقية دون مراجعة.",
  },
  conditional: {
    badge: "جاهز للتجربة — بشروط",
    title: "منتج تجريبي بشروط",
    body: "التدفقات الأساسية متاحة مع حوكمة ومراجعة بشرية. راجع سياسة المؤسسة قبل الاعتماد التشغيلي.",
  },
  pilot: {
    badge: "جاهز للتشغيل التجريبي — L5",
    title: "مرحلة التشغيل التجريبي",
    body: "التدفقات الأساسية، الحوكمة، الأدلة، سجل التدقيق، والتصدير متاحة. البيانات قابلة للاستمرار. راجع سياسة المؤسسة قبل الاعتماد التشغيلي الكامل.",
  },
}

export function ProductWorkspaceNotice({
  productNameAr,
  level = "prototype",
  className,
}: {
  productNameAr: string
  level?: NoticeLevel
  className?: string
}) {
  const copy = COPY[level]
  return (
    <div
      role="status"
      className={cn(
        "mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
        className,
      )}
      dir="rtl"
    >
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <span className="font-semibold">{productNameAr}</span>
        <span className="rounded-md bg-amber-200/80 px-2 py-0.5 text-xs font-medium dark:bg-amber-900/80">
          {copy.badge}
        </span>
      </div>
      <p className="font-medium">{copy.title}</p>
      <p className="mt-1 text-amber-800/90 dark:text-amber-100/90">{copy.body}</p>
    </div>
  )
}
