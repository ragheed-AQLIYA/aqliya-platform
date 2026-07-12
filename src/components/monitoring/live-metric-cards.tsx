"use client"

import { useState, useEffect } from "react"

interface MetricData {
  label: string
  value: number
  unit?: string
  status: "healthy" | "warning" | "critical"
  trend?: "up" | "down" | "stable"
}

function MetricCard({ metric }: { metric: MetricData }) {
  const statusColors = {
    healthy: "text-green-600",
    warning: "text-amber-600",
    critical: "text-red-600",
  }

  const trendIcons = {
    up: "↑",
    down: "↓",
    stable: "→",
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{metric.label}</p>
        {metric.trend && (
          <span className="text-xs text-muted-foreground">
            {trendIcons[metric.trend]}
          </span>
        )}
      </div>
      <p className={`mt-1 text-2xl font-black ${statusColors[metric.status]}`}>
        {metric.value.toLocaleString("ar-SA")}
      </p>
      {metric.unit && (
        <p className="text-xs text-muted-foreground">{metric.unit}</p>
      )}
      <div className="mt-2 flex items-center gap-1.5">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            metric.status === "healthy"
              ? "bg-green-500"
              : metric.status === "warning"
              ? "bg-amber-500"
              : "bg-red-500"
          }`}
        />
        <span className="text-[10px] text-muted-foreground">
          {metric.status === "healthy" ? "سليم" : metric.status === "warning" ? "تحذير" : "حرج"}
        </span>
      </div>
    </div>
  )
}

export function LiveMetricCards() {
  const [metrics, setMetrics] = useState<MetricData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch("/api/platform/enterprise-health")
        if (res.ok) {
          const data = await res.json()
          const checks = data.health?.checks ?? {}
          setMetrics([
            {
              label: "حالة قاعدة البيانات",
              value: checks.database?.status === "ok" ? 1 : 0,
              unit: checks.database?.status === "ok" ? "متصل" : "منقطع",
              status: checks.database?.status === "ok" ? "healthy" : "critical",
            },
            {
              label: "حالة التخزين",
              value: checks.storage?.status === "ok" ? 1 : 0,
              unit: checks.storage?.status === "ok" ? "متاح" : "غير متاح",
              status: checks.storage?.status === "ok" ? "healthy" : "critical",
            },
            {
              label: "حالة Redis",
              value: checks.redis?.status === "ok" ? 1 : 0,
              unit: checks.redis?.status === "ok" ? "متصل" : "غير متصل",
              status: checks.redis?.status === "ok" ? "healthy" : "warning",
            },
            {
              label: "حالة AI",
              value: checks.ai?.status === "ok" ? 1 : 0,
              unit: checks.ai?.status === "ok" ? "متاح" : "غير متاح",
              status: checks.ai?.status === "ok" ? "healthy" : "warning",
            },
          ])
        }
      } catch {
        setMetrics([
          {
            label: "حالة النظام",
            value: 0,
            unit: "خطأ في الاتصال",
            status: "critical",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse rounded-xl border bg-card p-4">
            <div className="mb-2 h-3 w-20 rounded bg-muted" />
            <div className="mb-1 h-8 w-16 rounded bg-muted" />
            <div className="h-2 w-12 rounded bg-muted" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {metrics.map((metric, i) => (
        <MetricCard key={i} metric={metric} />
      ))}
    </div>
  )
}
