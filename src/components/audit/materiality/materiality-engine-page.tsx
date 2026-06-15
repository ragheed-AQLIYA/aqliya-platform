"use client";

// ─── AuditOS L6.3 Materiality Engine Page ───

import { useState, useEffect } from "react";
import {
  Calculator,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  History,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  calculateMaterialityAction,
  approveMaterialityAction,
  getCurrentMaterialityAction,
  getMaterialityHistoryAction,
  getMethodologiesAction,
  suggestBenchmarkValueAction,
  generateMaterialityWorkingPaperAction,
} from "@/actions/audit-materiality-engine-actions";

interface MaterialityEnginePageProps {
  engagementId: string;
  auditOrganizationId: string;
}

interface MethodologyInfo {
  benchmarkType: string;
  percentageDefault: number;
  percentageMin: number;
  percentageMax: number;
  label: string;
  description: string;
  regulatoryReference: string;
}

interface MaterialitySet {
  planningId: string;
  performanceId: string;
  trivialId: string;
  benchmarkValue: number;
  planningMateriality: number;
  performanceMateriality: number;
  trivialThreshold: number;
  currency: string;
  percentage: number;
  performancePercentage: number;
  trivialPercentage: number;
  status: string;
}

export function MaterialityEnginePage({
  engagementId,
}: MaterialityEnginePageProps) {
  const [activeTab, setActiveTab] = useState("calculate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Methodology selection
  const [methodologies, setMethodologies] = useState<MethodologyInfo[]>([]);
  const [selectedMethodology, setSelectedMethodology] = useState<string>("revenue");
  const [percentage, setPercentage] = useState("0.5");
  const [benchmarkValue, setBenchmarkValue] = useState("");
  const [currency, setCurrency] = useState("SAR");
  const [rationale, setRationale] = useState("");

  // Current materiality
  const [current, setCurrent] = useState<MaterialitySet | null>(null);
  const [history, setHistory] = useState<MaterialitySet[]>([]);
  const [workingPaper, setWorkingPaper] = useState<string | null>(null);

  useEffect(() => {
    loadMethodologies();
    loadCurrent();
  }, []);

  async function loadMethodologies() {
    try {
      const methods = await getMethodologiesAction();
      setMethodologies(methods);
    } catch { /* ignore */ }
  }

  async function loadCurrent() {
    try {
      const c = await getCurrentMaterialityAction(engagementId);
      if (c) {
        setCurrent({
          planningId: c.id,
          performanceId: c.performanceMateriality?.id ?? "",
          trivialId: c.trivialThreshold?.id ?? "",
          benchmarkValue: c.benchmark?.value ?? 0,
          planningMateriality: c.computedAmount,
          performanceMateriality: c.performanceMateriality?.computedAmount ?? 0,
          trivialThreshold: c.trivialThreshold?.computedAmount ?? 0,
          currency: c.currency,
          percentage: c.percentage,
          performancePercentage: c.performanceMateriality?.percentage ?? 0.75,
          trivialPercentage: c.trivialThreshold?.percentage ?? 0.05,
          status: c.status,
        });
      }
    } catch { /* ignore */ }
  }

  async function loadHistory() {
    try {
      setLoading(true);
      const h = await getMaterialityHistoryAction(engagementId);
      setHistory(
        h.map((c: any) => ({
          planningId: c.id,
          performanceId: c.performanceMateriality?.id ?? "",
          trivialId: c.trivialThreshold?.id ?? "",
          benchmarkValue: c.benchmark?.value ?? 0,
          planningMateriality: c.computedAmount,
          performanceMateriality: c.performanceMateriality?.computedAmount ?? 0,
          trivialThreshold: c.trivialThreshold?.computedAmount ?? 0,
          currency: c.currency,
          percentage: c.percentage,
          performancePercentage: c.performanceMateriality?.percentage ?? 0.75,
          trivialPercentage: c.trivialThreshold?.percentage ?? 0.05,
          status: c.status,
        })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل تحميل السجل");
    } finally {
      setLoading(false);
    }
  }

  async function handleMethodologyChange(value: string) {
    setSelectedMethodology(value);
    const method = methodologies.find((m) => m.benchmarkType === value);
    if (method) {
      setPercentage((method.percentageDefault * 100).toString());
    }
    // Try to suggest a benchmark value
    try {
      const suggested = await suggestBenchmarkValueAction(engagementId, value as any);
      if (suggested !== null) {
        setBenchmarkValue(suggested.toString());
      }
    } catch { /* ignore */ }
  }

  async function handleCalculate() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const method = methodologies.find((m) => m.benchmarkType === selectedMethodology);
      const result = await calculateMaterialityAction({
        engagementId,
        benchmarkType: selectedMethodology as any,
        sourceType: "trial_balance",
        benchmarkValue: Number(benchmarkValue),
        currency,
        percentage: Number(percentage) / 100,
        methodologyRef: method?.regulatoryReference,
        rationale: rationale || undefined,
      });
      setCurrent(result);
      setSuccess("تم حساب الأهمية النسبية بنجاح");
      setActiveTab("current");
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل حساب الأهمية النسبية");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!current) return;
    setLoading(true);
    setError(null);
    try {
      await approveMaterialityAction(current.planningId, engagementId);
      setSuccess("تم اعتماد الأهمية النسبية");
      await loadCurrent();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل اعتماد الأهمية النسبية");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateWorkingPaper() {
    setLoading(true);
    try {
      const paper = await generateMaterialityWorkingPaperAction(engagementId);
      setWorkingPaper(paper);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل إنشاء ورقة العمل");
    } finally {
      setLoading(false);
    }
  }

  function formatAmount(value: number, cur: string = currency): string {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return `${cur} ${(abs / 1_000_000_000).toFixed(2)}B`;
    if (abs >= 1_000_000) return `${cur} ${(abs / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000) return `${cur} ${(abs / 1_000).toFixed(2)}K`;
    return `${cur} ${abs.toFixed(2)}`;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculate">
            <Calculator className="ml-2 h-4 w-4" />
            حساب
          </TabsTrigger>
          <TabsTrigger value="current">
            <TrendingUp className="ml-2 h-4 w-4" />
            المستوى الحالي
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="ml-2 h-4 w-4" />
            السجل
          </TabsTrigger>
          <TabsTrigger value="paper">
            <FileText className="ml-2 h-4 w-4" />
            ورقة العمل
          </TabsTrigger>
        </TabsList>

        {/* === CALCULATE TAB === */}
        <TabsContent value="calculate" className="space-y-4">
          <Card className="rounded-[24px] border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                حاسبة الأهمية النسبية
              </CardTitle>
              <CardDescription>
                احسب مستويات الأهمية النسبية لمهمة المراجعة وفقاً لـ ISA 320
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>المنهجية</Label>
                  <Select value={selectedMethodology} onValueChange={handleMethodologyChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {methodologies.map((m) => (
                        <SelectItem key={m.benchmarkType} value={m.benchmarkType}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {methodologies.find((m) => m.benchmarkType === selectedMethodology) && (
                    <p className="text-xs text-muted-foreground">
                      {
                        methodologies.find(
                          (m) => m.benchmarkType === selectedMethodology,
                        )?.description
                      }
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>النسبة المئوية (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                  />
                  {methodologies.find((m) => m.benchmarkType === selectedMethodology) && (
                    <p className="text-xs text-muted-foreground">
                      المدى:{" "}
                      {(
                        (methodologies.find(
                          (m) => m.benchmarkType === selectedMethodology,
                        )?.percentageMin ?? 0) * 100
                      ).toFixed(1)}
                      % –{" "}
                      {(
                        (methodologies.find(
                          (m) => m.benchmarkType === selectedMethodology,
                        )?.percentageMax ?? 0) * 100
                      ).toFixed(1)}
                      %
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>قيمة الأساس</Label>
                  <Input
                    type="number"
                    value={benchmarkValue}
                    onChange={(e) => setBenchmarkValue(e.target.value)}
                    placeholder="10000000"
                  />
                </div>

                <div className="space-y-2">
                  <Label>العملة</Label>
                  <Input
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="SAR"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label>مبررات الاختيار (اختياري)</Label>
                  <Input
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                    placeholder="سبب اختيار هذا الأساس والنسبة"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {success}
                </div>
              )}

              <Button
                className="mt-4"
                onClick={handleCalculate}
                disabled={loading || !benchmarkValue}
              >
                {loading ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <Calculator className="ml-2 h-4 w-4" />
                )}
                {loading ? "جارٍ الحساب..." : "احسب الأهمية النسبية"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === CURRENT MATERIALITY TAB === */}
        <TabsContent value="current" className="space-y-4">
          <Card className="rounded-[24px] border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                مستويات الأهمية النسبية الحالية
              </CardTitle>
              <CardDescription>
                آخر حساب للأهمية النسبية لهذه المهمة
              </CardDescription>
            </CardHeader>
            <CardContent>
              {current ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Badge
                      className={
                        current.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }
                    >
                      {current.status === "approved" ? "معتمد" : "مسودة"}
                    </Badge>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                      <p className="text-sm text-blue-600 mb-1 font-medium">
                        الأهمية النسبية العامة
                      </p>
                      <p className="text-2xl font-bold text-blue-700">
                        {formatAmount(current.planningMateriality)}
                      </p>
                      <p className="text-xs text-blue-500 mt-1">
                        {(current.percentage * 100).toFixed(1)}% من الأساس
                      </p>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm text-amber-600 mb-1 font-medium">
                        أداء الأهمية النسبية
                      </p>
                      <p className="text-2xl font-bold text-amber-700">
                        {formatAmount(current.performanceMateriality)}
                      </p>
                      <p className="text-xs text-amber-500 mt-1">
                        {(current.performancePercentage * 100).toFixed(0)}% من العامة
                      </p>
                    </div>
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                      <p className="text-sm text-green-600 mb-1 font-medium">
                        عتبة التافه الواضح
                      </p>
                      <p className="text-2xl font-bold text-green-700">
                        {formatAmount(current.trivialThreshold)}
                      </p>
                      <p className="text-xs text-green-500 mt-1">
                        {(current.trivialPercentage * 100).toFixed(0)}% من العامة
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {current.status !== "approved" && (
                      <Button onClick={handleApprove} disabled={loading}>
                        {loading ? (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="ml-2 h-4 w-4" />
                        )}
                        اعتماد الأهمية النسبية
                      </Button>
                    )}
                    <Button variant="outline" onClick={handleGenerateWorkingPaper} disabled={loading}>
                      <FileText className="ml-2 h-4 w-4" />
                      إنشاء ورقة العمل
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  لم يتم حساب الأهمية النسبية بعد. استخدم تبويب "حساب" لبدء الحساب.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === HISTORY TAB === */}
        <TabsContent value="history" className="space-y-4">
          <Card className="rounded-[24px] border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                سجل الأهمية النسبية
              </CardTitle>
              <CardDescription>جميع إصدارات حساب الأهمية النسبية</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-muted-foreground">لا يوجد سجل سابق</p>
              ) : (
                <div className="space-y-3">
                  {history.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">الإصدار {history.length - i}</p>
                        <p className="text-sm text-muted-foreground">
                          العامة: {formatAmount(h.planningMateriality)} | الأداء:{" "}
                          {formatAmount(h.performanceMateriality)}
                        </p>
                      </div>
                      <Badge
                        className={
                          h.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }
                      >
                        {h.status === "approved" ? "معتمد" : "مسودة"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  loadHistory();
                  setActiveTab("history");
                }}
              >
                <History className="ml-2 h-4 w-4" />
                تحميل السجل
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === WORKING PAPER TAB === */}
        <TabsContent value="paper" className="space-y-4">
          <Card className="rounded-[24px] border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                ورقة عمل الأهمية النسبية
              </CardTitle>
              <CardDescription>
                وثيقة توثيق الأهمية النسبية وفقاً لـ ISA 320
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workingPaper ? (
                <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm dark:bg-gray-900">
                  {workingPaper}
                </pre>
              ) : (
                <p className="text-muted-foreground">
                  اضغط على "إنشاء ورقة العمل" لعرض وثيقة الأهمية النسبية
                </p>
              )}
              <Button
                variant="outline"
                className="mt-4"
                onClick={handleGenerateWorkingPaper}
                disabled={loading}
              >
                <FileText className="ml-2 h-4 w-4" />
                {loading ? "جارٍ الإنشاء..." : "إنشاء ورقة العمل"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
