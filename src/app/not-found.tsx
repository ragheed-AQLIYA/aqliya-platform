import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center" dir="rtl">
      <div className="mx-auto flex max-w-md flex-col items-center gap-6">
        <span className="text-[8rem] font-black leading-none text-primary/20">404</span>
        <h1 className="text-2xl font-bold text-foreground">الصفحة غير موجودة</h1>
        <p className="text-muted-foreground">الصفحة التي تبحث عنها غير متوفرة أو قد تكون قد أزيلت.</p>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          العودة إلى الرئيسية
        </Link>
      </div>
    </div>
  )
}
