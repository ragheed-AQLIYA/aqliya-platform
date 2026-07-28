"use client";

export default function AnalyticsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center" dir="rtl">
      <h2 className="text-xl font-bold text-red-600">خطأ في تحميل التحليلات</h2>
      <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      <button onClick={reset} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded text-sm">
        إعادة المحاولة
      </button>
    </div>
  );
}
