import Link from "next/link"

export default function FeedbackNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <h2 className="text-xl font-semibold mb-2">الصفحة غير موجودة</h2>
      <p className="text-muted-foreground mb-4 max-w-md">
        الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
      >
        العودة للرئيسية
      </Link>
    </div>
  )
}
