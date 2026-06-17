"use client"

import { useEffect, useState } from "react"

interface SpendSummary {
  totalCost: number
  totalRequests: number
  byProvider: Record<string, { requests: number; cost: number; avgCost: number }>
  byModel: Record<string, { requests: number; cost: number; avgTokens: number }>
  byDay: { date: string; requests: number; cost: number }[]
  currency: string
}

interface GovernanceMetrics {
  totalRequests: number
  reviewedCount: number
  autoAcceptedCount: number
  reviewRate: number
  overrideRate: number
  averageConfidence: number
  byProvider: Record<string, { requests: number; reviewed: number; cost: number }>
}

export default function AIOpsPage() {
  const [spend, setSpend] = useState<SpendSummary | null>(null)
  const [gov, setGov] = useState<GovernanceMetrics | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/ai/spend?days=30").then(r => r.json()),
      fetch("/api/ai/governance?days=30").then(r => r.json()),
    ]).then(([s, g]) => {
      if (s.success) setSpend(s.data)
      if (g.success) setGov(g.data)
    }).catch(() => setError("تعذر تحميل بيانات AI"))
  }, [])

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">عمليات AI</h1>
        <p className="text-sm text-muted-foreground">لوحة تحكم الإنفاق والحوكمة</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

      {/* Spend summary */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">ملخص الإنفاق (آخر 30 يوم)</h2>
        {spend && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricCard label="إجمالي الإنفاق" value={`$${spend.totalCost.toFixed(4)}`} />
              <MetricCard label="عدد الطلبات" value={String(spend.totalRequests)} />
              <MetricCard label="متوسط التكلفة لكل طلب" value={spend.totalRequests > 0 ? `$${(spend.totalCost / spend.totalRequests).toFixed(6)}` : "$0"} />
              <MetricCard label="العملة" value={spend.currency} />
            </div>
            <h3 className="text-sm font-medium mt-4">حسب المزود</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mt-2">
              {Object.entries(spend.byProvider).map(([provider, p]) => (
                <MetricCard key={provider} label={provider} value={`$${p.cost.toFixed(4)} (${p.requests} طلب)`} />
              ))}
            </div>
            <h3 className="text-sm font-medium mt-4">حسب النموذج</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mt-2">
              {Object.entries(spend.byModel).map(([model, m]) => (
                <MetricCard key={model} label={model} value={`$${m.cost.toFixed(4)} (${m.avgTokens} توكن)`} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Governance metrics */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">مؤشرات الحوكمة</h2>
        {gov && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricCard label="إجمالي طلبات AI" value={String(gov.totalRequests)} />
              <MetricCard label="قيد المراجعة" value={String(gov.reviewedCount)} color={gov.reviewedCount > 0 ? "text-yellow-600" : undefined} />
              <MetricCard label="مقبول تلقائيًا" value={String(gov.autoAcceptedCount)} />
              <MetricCard label="نسبة المراجعة" value={`${gov.reviewRate}%`} color={gov.reviewRate > 50 ? "text-yellow-600" : undefined} />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mt-2">
              <MetricCard label="نسبة التجاوز" value={`${gov.overrideRate}%`} color={gov.overrideRate > 10 ? "text-red-600" : undefined} />
              <MetricCard label="متوسط الثقة" value={`${(gov.averageConfidence * 100).toFixed(0)}%`} color={gov.averageConfidence < 0.7 ? "text-yellow-600" : undefined} />
            </div>
          </>
        )}
      </section>
    </div>
  )
}

function MetricCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg border bg-card p-3 text-center shadow-sm">
      <p className={`text-xl font-black ${color ?? "text-foreground"}`}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
