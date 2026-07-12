"use client"

import { useState, useEffect } from "react"

export function SystemUptime() {
  const [uptime, setUptime] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUptime() {
      try {
        const res = await fetch("/api/platform/enterprise-health")
        if (res.ok) {
          const data = await res.json()
          setUptime(data.health?.uptimeSeconds ?? 0)
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false)
      }
    }

    fetchUptime()
    const interval = setInterval(fetchUptime, 60000)
    return () => clearInterval(interval)
  }, [])

  function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (days > 0) return `${days} يوم ${hours} ساعة`
    if (hours > 0) return `${hours} ساعة ${minutes} دقيقة`
    return `${minutes} دقيقة`
  }

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs text-muted-foreground">مدة التشغيل</p>
      <p className="mt-1 text-lg font-semibold">{formatUptime(uptime)}</p>
    </div>
  )
}
