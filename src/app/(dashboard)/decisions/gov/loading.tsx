export default function Loading() {
  return (
    <main className="flex items-center justify-center min-h-[60vh]" dir="rtl">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm">جاري التحميل...</p>
      </div>
    </main>
  )
}
