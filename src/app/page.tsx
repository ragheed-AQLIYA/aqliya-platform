import Image from "next/image"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#eef7fc_0%,#ffffff_42%,#f8fbfd_100%)] px-6 text-center">
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--brand-indigo),var(--brand-blue),var(--brand-cyan))]" />
      <Image
        src="/brand/aqliya-logo.svg"
        alt="AQLIYA - Mind the Future"
        width={520}
        height={260}
        priority
        className="h-auto w-full max-w-[520px]"
      />
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        منصة ذكاء قراري تجمع بين الحوكمة، المحاكاة، والتوصيات التنفيذية لاتخاذ قرارات أوضح.
      </p>
      <Link href="/decisions" className={cn(buttonVariants({ size: "lg" }), "mt-8 bg-primary hover:bg-primary/90")}>
        الدخول إلى المنصة
      </Link>
    </main>
  )
}
