"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const REFRESH_INTERVAL = 30000

export function MonitoringAutoRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (!isActive) return
    const interval = setInterval(() => {
      setLastRefresh(new Date())
      router.refresh()
    }, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [router, isActive])

  return (
    <div className="relative">
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur-sm border">
        <span
          className={`inline-block h-2 w-2 rounded-full ${isActive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
        />
        <span>تحديث تلقائي</span>
        <button
          onClick={() => setIsActive(!isActive)}
          className="ml-1 text-xs underline hover:text-foreground"
          aria-label={isActive ? "إيقاف التحديث التلقائي" : "تفعيل التحديث التلقائي"}
        >
          {isActive ? "إيقاف" : "تشغيل"}
        </button>
        <span className="text-[10px] text-muted-foreground/60" suppressHydrationWarning>
          {lastRefresh.toLocaleTimeString("ar-SA")}
        </span>
      </div>
    </div>
  )
}
