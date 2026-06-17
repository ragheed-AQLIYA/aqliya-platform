"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// ─── Types ───

interface LcWorkbookLine {
  id: string;
  code: string;
  name: string;
  section: string;
  autoFillable: boolean;
  autoFilled: boolean;
  autoFillValue: number | null;
  autoFillSource: string | null;
  manualValue: number | null;
  source: string;
  confidence: string;
  displayOrder: number;
}

interface LcWorkbook {
  id: string;
  projectId: string;
  title: string;
  status: string;
  totalLines: number;
  autoFilledLines: number;
  completionPct: number;
  lines: LcWorkbookLine[];
}

interface PendingFlag {
  id: string;
  workbookLineCode: string;
  accountCode: string;
  accountName: string;
  confidence: number;
  riskLevel: string;
  riskReason: string;
  status: string;
}

interface PendingSuggestion {
  id: string;
  workbookLineCode: string;
  currentPattern: string;
  suggestedPattern: string;
  reasoning: string;
  confidence: number;
  status: string;
}

interface OrgMemory {
  workbookLineCode: string;
  accountCode: string;
  accountName: string;
  previousResult: string;
  manualOverride: boolean;
  overrideReason: string | null;
}

interface IndustryBenchmark {
  industry: string;
  workbookLineCode: string;
  totalMatches: number;
  correctMatches: number;
  falsePositives: number;
  effectivenessPct: number;
}

interface Props {
  projectId: string;
  workbookId: string;
  workbook: LcWorkbook;
  pendingFlags: PendingFlag[];
  pendingSuggestions: PendingSuggestion[];
  orgMemory: OrgMemory[];
  industryBenchmarks: IndustryBenchmark[];
}

// ─── Sub-components ───

function LineCard({
  line,
  explanations,
}: {
  line: LcWorkbookLine;
  explanations: any[];
}) {
  const lineExplanations = explanations.filter(
    (e) => e.workbookLineCode === line.code,
  );

  return (
    <Card key={line.id} className="border-l-4 border-l-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <code className="rounded bg-muted px-2 py-0.5 text-sm font-mono">
              {line.code}
            </code>
            <span className="text-sm font-medium">{line.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {line.autoFillable && (
              <Badge variant="outline" className="text-xs">
                {line.source === "formula" ? "معادلة" : line.autoFilled ? "تلقائي" : "يدوي"}
              </Badge>
            )}
            <Badge
              variant={
                line.confidence === "high"
                  ? "default"
                  : line.confidence === "medium"
                    ? "secondary"
                    : "destructive"
              }
              className="text-xs"
            >
              {line.confidence === "high"
                ? "عالية"
                : line.confidence === "medium"
                  ? "متوسطة"
                  : "منخفضة"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {line.autoFillSource && (
          <p className="text-xs text-muted-foreground mb-2">
            المصدر: {line.autoFillSource}
            {line.autoFillValue !== null && (
              <> | القيمة: {line.autoFillValue.toLocaleString()}</>
            )}
          </p>
        )}
        {lineExplanations.length > 0 && (
          <div className="space-y-1 mt-2">
            <p className="text-xs font-medium text-muted-foreground">
              شرح المطابقات / Match Explanations:
            </p>
            {lineExplanations.slice(0, 3).map((exp, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs rounded bg-muted/50 px-2 py-1"
              >
                <code className="font-mono">{exp.accountCode}</code>
                <span className="text-muted-foreground truncate">
                  {exp.accountName}
                </span>
                <Badge
                  variant={
                    exp.riskLevel === "high"
                      ? "destructive"
                      : exp.riskLevel === "medium"
                        ? "default"
                        : "secondary"
                  }
                  className="text-[10px]"
                >
                  {exp.riskLevel}
                </Badge>
              </div>
            ))}
            {lineExplanations.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{lineExplanations.length - 3} أخرى
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───

export function WorkbookAiAdvisorClient({
  projectId,
  workbookId,
  workbook,
  pendingFlags,
  pendingSuggestions,
  orgMemory,
  industryBenchmarks,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const runAnalysis = useCallback(async () => {
    setLoading("analysis");
    setStatusMessage(null);
    try {
      // We pass empty TB lines — in real usage the user provides TB data
      const { runPatternAnalysisAction } = await import(
        "@/actions/localcontent-ai-advisor-actions"
      );
      const res = await runPatternAnalysisAction(projectId, workbookId, []);
      if ("error" in res && res.error) {
        setStatusMessage(`❌ ${res.error}`);
      } else {
        setStatusMessage("✅ تم تحليل الأنماط بنجاح / Pattern analysis complete");
        router.refresh();
      }
    } catch (err) {
      setStatusMessage(`❌ ${err instanceof Error ? err.message : "فشل التحليل"}`);
    } finally {
      setLoading(null);
    }
  }, [projectId, workbookId, router]);

  const runExplanations = useCallback(async () => {
    setLoading("explanations");
    setStatusMessage(null);
    try {
      const { explainAccountMatchesAction } = await import(
        "@/actions/localcontent-ai-advisor-actions"
      );
      const res = await explainAccountMatchesAction(projectId, workbookId, []);
      if ("error" in res && res.error) {
        setStatusMessage(`❌ ${res.error}`);
      } else if ("data" in res && res.data) {
        setExplanations(res.data as any[]);
        setStatusMessage("✅ تم إنشاء شروحات المطابقات / Explanations ready");
      }
    } catch (err) {
      setStatusMessage(
        `❌ ${err instanceof Error ? err.message : "فشل إنشاء الشروحات"}`,
      );
    } finally {
      setLoading(null);
    }
  }, [projectId, workbookId]);

  const runCalibration = useCallback(async () => {
    setLoading("calibration");
    setStatusMessage(null);
    try {
      const { calibrateConfidenceAction } = await import(
        "@/actions/localcontent-ai-advisor-actions"
      );
      const res = await calibrateConfidenceAction(projectId, workbookId);
      if ("error" in res && res.error) {
        setStatusMessage(`❌ ${res.error}`);
      } else {
        setStatusMessage("✅ تمت معايرة الثقة / Confidence calibrated");
        router.refresh();
      }
    } catch (err) {
      setStatusMessage(
        `❌ ${err instanceof Error ? err.message : "فشل المعايرة"}`,
      );
    } finally {
      setLoading(null);
    }
  }, [projectId, workbookId, router]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link
              href={`/local-content/projects/${projectId}`}
              className="hover:underline"
            >
              المشروع / Project
            </Link>
            <span>/</span>
            <Link
              href={`/local-content/workbook/${workbookId}`}
              className="hover:underline"
            >
              المصنف / Workbook
            </Link>
            <span>/</span>
            <span>AI Advisor</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            AI Advisor — {workbook.title}
          </h1>
          <p className="text-muted-foreground">
            تحليل الأنماط، شرح المطابقات، ومراجعة النتائج
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={runAnalysis}
          disabled={loading !== null}
          variant="default"
        >
          {loading === "analysis" ? "جارٍ التحليل..." : "🔍 تحليل الأنماط / Analyze Patterns"}
        </Button>
        <Button
          onClick={runExplanations}
          disabled={loading !== null}
          variant="outline"
        >
          {loading === "explanations" ? "جارٍ إنشاء الشروحات..." : "📋 شرح المطابقات / Explain Matches"}
        </Button>
        <Button
          onClick={runCalibration}
          disabled={loading !== null}
          variant="secondary"
        >
          {loading === "calibration" ? "جارٍ المعايرة..." : "📊 معايرة الثقة / Calibrate Confidence"}
        </Button>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="py-3">
            <p className="text-sm">{statusMessage}</p>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">{workbook.totalLines}</CardTitle>
            <CardDescription>إجمالي الأسطر / Total Lines</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-green-600">
              {workbook.completionPct}%
            </CardTitle>
            <CardDescription>الإكمال / Completion</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-amber-600">
              {pendingFlags.length}
            </CardTitle>
            <CardDescription>FP بانتظار المراجعة</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-blue-600">
              {pendingSuggestions.length}
            </CardTitle>
            <CardDescription>اقتراحات أنماط</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="lines" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lines">أسطر المصنف / Lines</TabsTrigger>
          <TabsTrigger value="fp-org">
            FP + الذاكرة / FP &amp; Memory
            {pendingFlags.length > 0 && (
              <Badge variant="destructive" className="mr-1">{pendingFlags.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="benchmarks">معايير / Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="lines" className="space-y-4">
          {workbook.lines.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                المصنف فارغ. قم بتعبئته أولاً.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {workbook.lines.map((line) => (
                <LineCard
                  key={line.id}
                  line={line}
                  explanations={explanations}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="fp-org" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold mb-3">
                نتائج خاطئة / False Positive Flags
                {pendingFlags.length > 0 && (
                  <Badge variant="destructive" className="mr-2">
                    {pendingFlags.length}
                  </Badge>
                )}
              </h3>
              {pendingFlags.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-center text-muted-foreground text-sm">
                    لا توجد نتائج خاطئة بانتظار المراجعة
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {pendingFlags.map((f) => (
                    <Card key={f.id} className="border-l-4 border-l-amber-500">
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
                              {f.accountCode}
                            </code>{" "}
                            <span className="text-sm">{f.accountName}</span>
                            <span className="text-xs text-muted-foreground mr-2">
                              ({f.workbookLineCode})
                            </span>
                          </div>
                          <Badge variant="destructive" className="text-xs">
                            {f.riskLevel}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {f.riskReason}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">
                ذاكرة التجاوزات / Organization Memory
              </h3>
              {orgMemory.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-center text-muted-foreground text-sm">
                    لا توجد قرارات سابقة مسجلة
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {orgMemory.slice(0, 10).map((m, i) => (
                    <Card key={i} className="border-l-4 border-l-purple-500">
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
                              {m.accountCode}
                            </code>{" "}
                            <Badge
                              variant={
                                m.previousResult === "matched"
                                  ? "default"
                                  : "destructive"
                              }
                              className="text-[10px]"
                            >
                              {m.previousResult}
                            </Badge>
                          </div>
                          <code className="text-xs text-muted-foreground">
                            {m.workbookLineCode}
                          </code>
                        </div>
                        {m.overrideReason && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {m.overrideReason}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <h3 className="text-lg font-semibold">
            فعالية الأنماط حسب القطاع / Industry Pattern Benchmarks
          </h3>
          {industryBenchmarks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                لا توجد بيانات كافية عن فعالية الأنماط بعد.
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="p-3 text-right font-medium">القطاع</th>
                    <th className="p-3 text-right font-medium">الرمز</th>
                    <th className="p-3 text-right font-medium">الإجمالي</th>
                    <th className="p-3 text-right font-medium">الصحيح</th>
                    <th className="p-3 text-right font-medium">FP</th>
                    <th className="p-3 text-right font-medium">الفعالية</th>
                  </tr>
                </thead>
                <tbody>
                  {industryBenchmarks.map((b, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3 capitalize">{b.industry}</td>
                      <td className="p-3">
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {b.workbookLineCode}
                        </code>
                      </td>
                      <td className="p-3">{b.totalMatches}</td>
                      <td className="p-3">{b.correctMatches}</td>
                      <td className="p-3">{b.falsePositives}</td>
                      <td className="p-3">
                        <span
                          className={
                            b.effectivenessPct >= 80
                              ? "text-green-600 font-medium"
                              : b.effectivenessPct >= 50
                                ? "text-amber-600 font-medium"
                                : "text-red-600 font-medium"
                          }
                        >
                          {b.effectivenessPct}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
