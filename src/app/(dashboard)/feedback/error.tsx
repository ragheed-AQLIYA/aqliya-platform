"use client"

export default function FeedbackError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <h2 className="text-xl font-semibold text-destructive mb-2">حدث خطأ</h2>
      <p className="text-muted-foreground mb-4 max-w-md">
        تعذّر تحميل صفحة الملاحظات. يرجى المحاولة مرة أخرى.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
      >
        إعادة المحاولة
      </button>
    </div>
  )
}
