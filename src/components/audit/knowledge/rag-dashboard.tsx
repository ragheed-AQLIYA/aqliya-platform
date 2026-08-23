"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Search,
  Loader2,
  Activity,
  Clock,
  Database,
  BookOpen,
  Shield,
  TrendingUp,
  AlertTriangle,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RagCitation } from "@/components/audit/shared/rag-citation"
import type { IfrsRagCitation } from "@/lib/audit/rules/types"

interface RagStats {
  status: string
  service: string
  metrics: {
    searchCount: number
    avgLatencyMs: number
    p95LatencyMs: number
    errorCount: number
    errorRate: number
    cacheHitRate: number
    totalCitations: number
    size: number
    maxEntries: number
    ttlMs: number
  }
  rateLimits: {
    platform: number
  }
  timestamp: string
}

interface SearchResponse {
  citations: IfrsRagCitation[]
  count: number
  metrics: {
    searchCount: number
    avgLatencyMs: number
    p95LatencyMs: number
    errorCount: number
    errorRate: number
    cacheHitRate: number
    totalCitations: number
  }
}

export function RagDashboard() {
  const [stats, setStats] = useState<RagStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<IfrsRagCitation[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const [lastSearchMetrics, setLastSearchMetrics] =
    useState<SearchResponse["metrics"] | null>(null)

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/knowledge/rag/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch {
      // Stats are non-critical — degrade silently
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    setSearchError(null)
    setSearchResults([])
    setLastSearchMetrics(null)

    try {
      const res = await fetch("/api/knowledge/rag/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery.trim(), limit: 5 }),
      })

      if (!res.ok) {
        const err = await res.json()
        setSearchError(err.error || "Search failed")
        return
      }

      const data: SearchResponse = await res.json()
      setSearchResults(data.citations)
      setLastSearchMetrics(data.metrics)
      // Refresh stats after a search
      loadStats()
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : "Search failed")
    } finally {
      setSearching(false)
    }
  }, [searchQuery, loadStats])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const m = stats?.metrics
  const rateRemaining = stats?.rateLimits?.platform ?? 10

  return (
    <div className="space-y-6" dir="rtl">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs text-muted-foreground">
              <Search className="size-3.5" />
              عمليات البحث
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{m?.searchCount ?? 0}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              إجمالي عمليات البحث المنفذة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              متوسط الاستجابة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {m?.avgLatencyMs ? `${Math.round(m.avgLatencyMs)}ms` : "\u2014"}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              P95: {m?.p95LatencyMs ? `${Math.round(m.p95LatencyMs)}ms` : "\u2014"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs text-muted-foreground">
              <Database className="size-3.5" />
              معدل الكاش
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {m?.cacheHitRate != null
                ? `${Math.round(m.cacheHitRate * 100)}%`
                : "\u2014"}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {m?.size ?? 0} / {m?.maxEntries ?? 1000} عنصر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="size-3.5" />
              معدل الطلبات المتبقية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{rateRemaining}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              من أصل 10 طلبات/دقيقة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4" />
              مقاييس الأداء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">إجمالي الاستشهادات</span>
                <Badge variant="outline" className="font-mono">
                  {m?.totalCitations ?? 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">معدل الأخطاء</span>
                <Badge
                  variant="outline"
                  className={
                    (m?.errorRate ?? 0) > 0.1
                      ? "border-red-300 text-red-700"
                      : "border-emerald-300 text-emerald-700"
                  }
                >
                  {m?.errorRate != null ? `${Math.round(m.errorRate * 100)}%` : "0%"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">أخطاء</span>
                <Badge
                  variant="outline"
                  className={
                    (m?.errorCount ?? 0) > 0
                      ? "border-amber-300 text-amber-700"
                      : ""
                  }
                >
                  {m?.errorCount ?? 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">الوقت الأقصى (TTL)</span>
                <Badge variant="outline">
                  {m?.ttlMs ? `${m.ttlMs / 1000 / 60} دقيقة` : "\u2014"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              معلومات النظام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">الخدمة</span>
                <Badge variant="outline">{stats?.service ?? "ifrs-rag"}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">الحالة</span>
                <Badge
                  variant="outline"
                  className={
                    stats?.status === "healthy"
                      ? "border-emerald-300 text-emerald-700"
                      : "border-red-300 text-red-700"
                  }
                >
                  {stats?.status === "healthy" ? "سليم" : "خطأ"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">آخر تحديث</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {stats?.timestamp
                    ? new Date(stats.timestamp).toLocaleTimeString("ar-SA")
                    : "\u2014"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">آخر بحث (مقاييس)</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {lastSearchMetrics
                    ? `${Math.round(lastSearchMetrics.avgLatencyMs)}ms`
                    : "\u2014"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Search className="h-4 w-4" />
            اختبار البحث الدلالي
          </CardTitle>
          <CardDescription>
            ابحث في قاعدة المعرفة باستخدام المصطلحات ذات الصلة بالمعايير الدولية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="مثال: قياس المخزون، عقود التأمين، القوائم المالية..."
              className="flex-1"
              dir="rtl"
            />
            <Button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              size="sm"
            >
              {searching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
            </Button>
          </div>

          {searchError && (
            <div className="mt-3 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
              <AlertTriangle className="size-4 shrink-0" />
              {searchError}
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="size-3.5" />
                <span>
                  نتائج البحث ({searchResults.length} استشهاد)
                </span>
              </div>
              <div className="space-y-2">
                {searchResults.map((citation) => (
                  <RagCitation
                    key={citation.chunkId}
                    citation={citation}
                    size="md"
                    showPreview
                  />
                ))}
              </div>
            </div>
          )}

          {!searching && searchResults.length === 0 && !searchError && searchQuery && (
            <p className="mt-3 text-sm text-muted-foreground">
              لا توجد نتائج لهذا البحث
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
