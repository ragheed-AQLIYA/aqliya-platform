"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6" dir="rtl">
      <h2 className="text-xl font-semibold mb-2">حدث خطأ</h2>
      <p className="text-muted-foreground mb-4">يرجى المحاولة مرة أخرى</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        إعادة المحاولة
      </button>
      <p className="text-sm text-muted-foreground mt-4">{error?.message}</p>
    </div>
  );
}