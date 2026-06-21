"use client";

export default function NotificationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center" dir="rtl">
      <h2 className="text-lg font-semibold text-foreground mb-2">
        حدث خطأ أثناء تحميل التنبيهات
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        {error.message || "تعذر تحميل مركز التنبيهات. يرجى المحاولة مرة أخرى."}
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}
