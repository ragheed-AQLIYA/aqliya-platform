"use client";

// ─── AuditOS L6.7 ISQM1 Quality Dashboard ───

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Target,
  AlertTriangle,
  ClipboardCheck,
  TrendingUp,
  Loader2,
  Plus,
  Gauge,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getIsqm1DashboardAction,
  listQualityObjectivesAction,
  listQualityRisksAction,
  listQualityFindingsAction,
  listRemediationsAction,
  listMonitoringActivitiesAction,
  listQualityEvaluationsAction,
} from "@/actions/audit-isqm1-actions";

interface QualityDashboardProps {
  auditOrganizationId: string;
}

export function QualityDashboard({ auditOrganizationId }: QualityDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [risks, setRisks] = useState<any[]>([]);
  const [findings, setFindings] = useState<any[]>([]);
  const [remediations, setRemediations] = useState<any[]>([]);
  const [monitoring, setMonitoring] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const orgId = auditOrganizationId || "org-aqliya";
      const [dash, objs, rsks, fnds, rems, mon, evals] = await Promise.all([
        getIsqm1DashboardAction(orgId),
        listQualityObjectivesAction(orgId),
        listQualityRisksAction(orgId),
        listQualityFindingsAction(orgId),
        listRemediationsAction(orgId),
        listMonitoringActivitiesAction(orgId),
        listQualityEvaluationsAction(orgId),
      ]);
      setDashboard(dash);
      setObjectives(objs);
      setRisks(rsks);
      setFindings(fnds);
      setRemediations(rems);
      setMonitoring(mon);
      setEvaluations(evals);
    } catch { /* ignore */ }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const statusColor = (s: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      archived: "bg-gray-100 text-gray-600",
      identified: "bg-red-100 text-red-800",
      assessed: "bg-amber-100 text-amber-800",
      mitigated: "bg-green-100 text-green-800",
      planned: "bg-blue-100 text-blue-800",
      in_progress: "bg-amber-100 text-amber-800",
      completed: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      remediating: "bg-amber-100 text-amber-800",
      verified: "bg-blue-100 text-blue-800",
      closed: "bg-green-100 text-green-800",
      minor: "bg-gray-100 text-gray-600",
      significant: "bg-amber-100 text-amber-800",
      material: "bg-red-100 text-red-800",
    };
    return colors[s] || "bg-gray-100 text-gray-600";
  };

  const severityColor = (s: string) => {
    if (s === "high" || s === "material") return "bg-red-100 text-red-800";
    if (s === "medium" || s === "significant") return "bg-amber-100 text-amber-800";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            <Gauge className="ml-2 h-4 w-4" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="objectives">
            <Target className="ml-2 h-4 w-4" />
            الأهداف
          </TabsTrigger>
          <TabsTrigger value="risks">
            <AlertTriangle className="ml-2 h-4 w-4" />
            المخاطر
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <ClipboardCheck className="ml-2 h-4 w-4" />
            المراقبة
          </TabsTrigger>
          <TabsTrigger value="findings">
            <ShieldCheck className="ml-2 h-4 w-4" />
            النتائج
          </TabsTrigger>
          <TabsTrigger value="evaluation">
            <TrendingUp className="ml-2 h-4 w-4" />
            التقييم
          </TabsTrigger>
        </TabsList>

        {/* === OVERVIEW === */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  أهداف الجودة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{dashboard?.totalObjectives ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  مخاطر الجودة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{dashboard?.totalRisks ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  إجراءات المراقبة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {dashboard?.monitoringByStatus?.planned ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  نتائج الجودة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {(() => {
                    const fbs = dashboard?.findingsByStatus;
                    if (!fbs) return 0;
                    return Object.values(fbs as Record<string, number>).reduce(
                      (a: number, b: number) => a + b,
                      0,
                    );
                  })()}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">نتائج المراقبة حسب الحالة</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard?.monitoringByStatus &&
                Object.keys(dashboard.monitoringByStatus).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(dashboard.monitoringByStatus).map(
                      ([k, v]: [string, any]) => (
                        <div
                          key={k}
                          className="flex items-center justify-between"
                        >
                          <Badge className={statusColor(k)}>{k}</Badge>
                          <span className="font-bold">{String(v)}</span>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    لا توجد بيانات مراقبة
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">نتائج التقييم حسب الخطورة</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard?.findingsBySeverity &&
                Object.keys(dashboard.findingsBySeverity).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(dashboard.findingsBySeverity).map(
                      ([k, v]: [string, any]) => (
                        <div
                          key={k}
                          className="flex items-center justify-between"
                        >
                          <Badge className={severityColor(k)}>{k}</Badge>
                          <span className="font-bold">{String(v)}</span>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    لا توجد نتائج تقييم
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {dashboard?.latestEvaluation && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-sm">
                  آخر تقييم للنظام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  السنة: {dashboard.latestEvaluation.year} | الفعالية:{" "}
                  <Badge
                    className={
                      dashboard.latestEvaluation.systemEffectiveness ===
                      "effective"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }
                  >
                    {dashboard.latestEvaluation.systemEffectiveness}
                  </Badge>
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* === OBJECTIVES === */}
        <TabsContent value="objectives" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">أهداف الجودة</h3>
          </div>
          {objectives.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                لا توجد أهداف جودة مسجلة
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {objectives.map((obj) => (
                <Card key={obj.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{obj.description}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          التصنيف: {obj.category} | المرجع: {obj.reference ?? "—"}
                        </p>
                      </div>
                      <Badge className={statusColor(obj.status)}>
                        {obj.status}
                      </Badge>
                    </div>
                    {obj.risks && obj.risks.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {obj.risks.length} مخاطر مرتبطة
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* === RISKS === */}
        <TabsContent value="risks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">مخاطر الجودة</h3>
          </div>
          {risks.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                لا توجد مخاطر جودة مسجلة
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {risks.map((risk) => (
                <Card key={risk.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{risk.riskDescription}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          الهدف المرتبط: {risk.objective?.description ?? "—"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={severityColor(risk.inherentRisk)}>
                          {risk.inherentRisk}
                        </Badge>
                        <Badge className={statusColor(risk.status)}>
                          {risk.status}
                        </Badge>
                      </div>
                    </div>
                    {risk.responses && risk.responses.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {risk.responses.length} استجابة
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* === MONITORING === */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">أنشطة المراقبة</h3>
          </div>
          {monitoring.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                لا توجد أنشطة مراقبة مسجلة
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {monitoring.map((act) => (
                <Card key={act.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{act.activityType}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          النطاق: {act.scope ?? "—"} | التكرار:{" "}
                          {act.frequency ?? "—"}
                        </p>
                      </div>
                      <Badge className={statusColor(act.status)}>
                        {act.status}
                      </Badge>
                    </div>
                    {act.findings && act.findings.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {act.findings.length} نتيجة
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* === FINDINGS === */}
        <TabsContent value="findings" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">نتائج الجودة</h3>
          </div>
          {findings.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                لا توجد نتائج جودة مسجلة
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {findings.map((finding) => (
                <Card key={finding.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{finding.description}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          النوع: {finding.findingType}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={severityColor(finding.severity)}>
                          {finding.severity}
                        </Badge>
                        <Badge className={statusColor(finding.status)}>
                          {finding.status}
                        </Badge>
                      </div>
                    </div>
                    {finding.remediation && (
                      <p className="text-xs text-muted-foreground mt-2">
                        خطة معالجة: {finding.remediation.status}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* === EVALUATION === */}
        <TabsContent value="evaluation" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">تقييم نظام الجودة</h3>
          </div>
          {evaluations.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                لا توجد تقييمات مسجلة
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {evaluations.map((evalItem) => (
                <Card key={evalItem.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">
                          تقييم سنة {evalItem.year}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {evalItem.overallConclusion ?? "—"}
                        </p>
                      </div>
                      <Badge
                        className={
                          evalItem.systemEffectiveness === "effective"
                            ? "bg-green-100 text-green-800"
                            : evalItem.systemEffectiveness ===
                                "partially_effective"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {evalItem.systemEffectiveness}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
