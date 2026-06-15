"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Brain,
  Loader2,
  TrendingUp,
  Target,
  BookOpen,
  BarChart3,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getKnowledgeDashboardAction,
  listPatternsAction,
  listBenchmarksAction,
} from "@/actions/audit-knowledge-actions";

interface KnowledgeDashboardProps {
  auditOrganizationId: string;
}

export function KnowledgeDashboard({ auditOrganizationId }: KnowledgeDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [benchmarks, setBenchmarks] = useState<any[]>([]);

  const orgId = auditOrganizationId || "org-aqliya";

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, pats, ben] = await Promise.all([
        getKnowledgeDashboardAction(orgId),
        listPatternsAction(orgId),
        listBenchmarksAction(orgId),
      ]);
      setDashboard(dash);
      setPatterns(pats);
      setBenchmarks(ben);
    } catch { /* ignore */ }
    setLoading(false);
  }, [orgId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (loading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">أنماط المعرفة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dashboard?.patternCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">التوصيات</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dashboard?.totalRecommendations ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">ملفات المهام</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dashboard?.profileCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">المعايير</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dashboard?.benchmarks?.length ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Top Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4" />
              أهم الأنماط المتكررة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.topPatterns?.length > 0 ? (
              <div className="space-y-2">
                {dashboard.topPatterns.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between text-sm border-b pb-1">
                    <div>
                      <p className="font-medium">{p.patternLabel}</p>
                      <p className="text-xs text-muted-foreground">{p.patternType}</p>
                    </div>
                    <Badge variant="outline">{p.occurrenceCount} مرة</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">لم تُشتق أنماط بعد. أكمل المهام لبناء المعرفة.</p>
            )}
          </CardContent>
        </Card>

        {/* Benchmarks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4" />
              المعايير القطاعية
            </CardTitle>
          </CardHeader>
          <CardContent>
            {benchmarks.length > 0 ? (
              <div className="space-y-2">
                {benchmarks.map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between text-sm border-b pb-1">
                    <span>{b.industry}: {b.metricName}</span>
                    <span className="font-medium">{b.metricValue} {b.unit ?? ""}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">لا توجد معايير قطاعية مسجلة</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4" />
            جميع الأنماط
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patterns.length > 0 ? (
            <div className="space-y-2">
              {patterns.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between text-sm border-b pb-1">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-3 w-3 text-amber-500" />
                    <span>{p.patternLabel}</span>
                    <Badge variant="outline" className="text-[10px]">{p.patternType}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{p.occurrenceCount} تكرار</span>
                    <span className="text-xs">{p.confidenceScore ? `${Math.round(p.confidenceScore * 100)}%` : "—"}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">لا توجد أنماط معرفة مسجلة</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
