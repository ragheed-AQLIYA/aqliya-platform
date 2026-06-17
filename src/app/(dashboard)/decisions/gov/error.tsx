"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex items-center justify-center min-h-[60vh]" dir="rtl">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">حدث خطأ</h2>
        <p className="text-sm text-muted-foreground">
          {error.message || "عذراً، حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى."}
        </p>
        <Button variant="outline" onClick={reset}>
          حاول مرة أخرى
        </Button>
      </div>
    </main>
  )
}
