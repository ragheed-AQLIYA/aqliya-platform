export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center" dir="rtl">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        <span className="text-sm text-muted-foreground">جاري التحميل...</span>
      </div>
    </div>
  )
}
