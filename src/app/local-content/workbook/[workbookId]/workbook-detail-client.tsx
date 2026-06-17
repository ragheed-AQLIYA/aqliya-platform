"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  WorkbookWithLines,
  MissingDataDetectionResult,
  DataRequestWithItems,
} from "@/lib/local-content/workbook/types";
import {
  recalculateWorkbookAction,
  updateWorkbookLineAction,
  generateDataRequestAction,
  sendDataRequestAction,
  exportWorkbookAction,
  getDataRequestTextAction,
  markWorkbookExportedAction,
  computeWorkbookScoreAction,
} from "@/actions/localcontent-workbook-actions";

import type { LcScoreResult } from "@/lib/local-content/workbook/types";

import {
  evaluateAllTabGates,
  buildGateContext,
} from "@/lib/local-content/workflow-gating";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  Send,
  RefreshCw,
  PlusCircle,
  Upload,
} from "lucide-react";
import { TbImportDialog } from "./tb-import-dialog";
import { AiInsightsPanel } from "./ai-insights-panel";

const STATUS_LABELS: Record<string, string> = {
  draft: "مسودة",
  populated: "تم التعبئة",
  partial: "مكتمل جزئياً",
  complete: "مكتمل",
  exported: "تم التصدير",
};

const SECTION_LABELS: Record<string, string> = {
  company_info: "معلومات المنشأة",
  revenue: "الإيرادات",
  cost_of_sales: "تكلفة المبيعات",
  gross_profit: "إجمالي الربح",
  supplier_spend: "المشتريات",
  workforce: "الموظفين",
  assets: "الأصول",
  declarations: "الإقرارات",
};

const CONFIDENCE_BADGES: Record<string, "default" | "secondary" | "outline"> = {
  high: "default",
  medium: "secondary",
  low: "outline",
};

const CATEGORY_LABELS: Record<string, string> = {
  financial_data: "بيانات مالية",
  evidence: "مستندات الإثبات",
  classification: "تصنيف",
  narrative: "إيضاحات",
};

interface Props {
  workbook: WorkbookWithLines;
  missingData: MissingDataDetectionResult | null;
  dataRequests: DataRequestWithItems[];
  organizationId: string;
}

export function WorkbookDetailClient({
  workbook,
  missingData,
  dataRequests,
  organizationId,
}: Props) {
  const router = useRouter();
  const [editingLine, setEditingLine] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [scoreResult, setScoreResult] = useState<LcScoreResult | null>(null);
  const [showScoreDetail, setShowScoreDetail] = useState(false);

  const showAction = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 3000);
  };

  // Group lines by section
  const sections = workbook.lines.reduce(
    (acc, line) => {
      if (!acc[line.section]) acc[line.section] = [];
      acc[line.section].push(line);
      return acc;
    },
    {} as Record<string, typeof workbook.lines>,
  );

  // Workflow gating
  const gateCtx = buildGateContext(workbook);
  const gates = evaluateAllTabGates(gateCtx);
  const isEditable = !(gates["manual-edit"]?.locked ?? true);
  const canExport = !(gates["export"]?.locked ?? true);
  const canImportTb = !(gates["tb-import"]?.locked ?? true);
  const canAccessMissing = !(gates["missing"]?.locked ?? true);
  const canAccessRequests = !(gates["requests"]?.locked ?? true);

  const handleEdit = (lineId: string, currentValue: number | null) => {
    setEditingLine(lineId);
    setEditValue(currentValue?.toString() ?? "");
    setEditNotes("");
  };

  const handleSave = async (lineId: string) => {
    setIsLoading(lineId);
    const val = parseFloat(editValue);
    if (isNaN(val)) {
      showAction("الرجاء إدخال قيمة رقمية صالحة");
      setIsLoading(null);
      return;
    }
    const res = await updateWorkbookLineAction(lineId, val, editNotes || undefined);
    if (res.ok) {
      showAction("تم حفظ القيمة ✅");
      setEditingLine(null);
      await recalculateWorkbookAction(workbook.id);
      router.refresh();
    } else {
      showAction(`خطأ: ${res.error}`);
    }
    setIsLoading(null);
  };

  const handleRecalculate = async () => {
    setIsLoading("recalc");
    const res = await recalculateWorkbookAction(workbook.id);
    if (res.ok) {
      showAction("تم إعادة احتساب الإحصائيات ✅");
      router.refresh();
    }
    setIsLoading(null);
  };

  const handleGenerateRequest = async () => {
    setIsLoading("gen-request");
    const res = await generateDataRequestAction(workbook.id);
    if (res.ok) {
      showAction("تم إنشاء طلب البيانات ✅");
      router.refresh();
    } else {
      showAction(`خطأ: ${res.error}`);
    }
    setIsLoading(null);
  };

  const handleSendRequest = async (requestId: string) => {
    setIsLoading(`send-${requestId}`);
    const res = await sendDataRequestAction(requestId);
    if (res.ok) {
      showAction("تم إرسال الطلب ✅");
      router.refresh();
    }
    setIsLoading(null);
  };

  const handleExport = async () => {
    setIsLoading("export");
    const res = await exportWorkbookAction(workbook.id);
    if (!res.ok) {
      showAction(`خطأ: ${res.error}`);
    } else if (res.data) {
      const blob = new Blob([JSON.stringify(res.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `workbook-${workbook.id.slice(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showAction("تم التصدير ✅");
    }
    setIsLoading(null);
  };

  const handleFinalizeExport = async () => {
    setIsLoading("finalize");
    const res = await markWorkbookExportedAction(workbook.id);
    if (res.ok) {
      showAction("تم إنهاء الدفتر وتأكيد التصدير ✅");
      router.refresh();
    } else {
      showAction(`خطأ: ${res.error}`);
    }
    setIsLoading(null);
  };

  const handleComputeScore = async () => {
    setIsLoading("score");
    const res = await computeWorkbookScoreAction(workbook.id);
    if (!res.ok) {
      showAction(`خطأ: ${res.error}`);
    } else if (res.data) {
      setScoreResult(res.data as LcScoreResult);
      setShowScoreDetail(true);
    }
    setIsLoading(null);
  };

  const handleViewRequestText = async (requestId: string) => {
    const res = await getDataRequestTextAction(requestId);
    if (res.ok && res.data) {
      const blob = new Blob([res.data], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `data-request-${requestId.slice(0, 8)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{workbook.title}</h1>
            <Badge>{STATUS_LABELS[workbook.status] || workbook.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            الفترة: {workbook.reportingPeriod} | إجمالي البنود:{" "}
            {workbook.totalLines}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculate}
            disabled={isLoading === "recalc" || !isEditable}
          >
            <RefreshCw
              className={`h-4 w-4 ml-1 ${isLoading === "recalc" ? "animate-spin" : ""}`}
            />
            إعادة احتساب
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isLoading === "export" || !canExport}
            title={!canExport ? "يجب إكمال الدفتر أولاً" : undefined}
          >
            <Download className="h-4 w-4 ml-1" />
            تصدير
          </Button>
          {workbook.status !== "exported" && (
            <Button
              variant="default"
              size="sm"
              onClick={handleFinalizeExport}
              disabled={isLoading === "finalize" || !canExport}
              title={!canExport ? "يجب إكمال الدفتر أولاً" : "إنهاء التصدير ومنع التعديل"}
            >
              إنهاء التصدير
            </Button>
          )}
          <TbImportDialog
            workbookId={workbook.id}
            projectId={workbook.projectId}
            disabled={!canImportTb}
          />
          <Button
            size="sm"
            onClick={handleGenerateRequest}
            disabled={isLoading === "gen-request" || !isEditable}
          >
            <PlusCircle className="h-4 w-4 ml-1" />
            إنشاء طلب بيانات
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleComputeScore}
            disabled={isLoading === "score"}
          >
            احتساب النتيجة
          </Button>
        </div>
      </div>

      {actionMsg && (
        <div className="bg-primary/10 border border-primary/20 text-sm p-3 rounded-lg">
          {actionMsg}
        </div>
      )}

      {/* Completion bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">نسبة الإنجاز</span>
            <span className="text-sm font-medium">{workbook.completionPct}%</span>
          </div>
          <Progress value={workbook.completionPct} className="h-3" />
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>✓ {workbook.autoFilledLines} تلقائي</span>
            <span>✎ {workbook.lines.filter((l) => l.manualValue !== null).length} يدوي</span>
            <span className="text-amber-500">⚠ {workbook.missingLines} ناقص</span>
          </div>
        </CardContent>
      </Card>

      {/* Section completion */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(sections).map(([section, lines]) => {
          const filled = lines.filter(
            (l) => l.autoFilled || l.manualValue !== null,
          ).length;
          const pct = Math.round((filled / lines.length) * 100);
          return (
            <Card key={section}>
              <CardContent className="p-3 text-center">
                <p className="text-xs font-medium truncate">
                  {SECTION_LABELS[section] || section}
                </p>
                <p className="text-lg font-bold">{pct}%</p>
                <p className="text-[10px] text-muted-foreground">
                  {filled}/{lines.length}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* LC Score Card */}
      {scoreResult && (
        <Card className={showScoreDetail ? "border-primary/30" : ""}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className="text-lg">📊</span>
                نتيجة المحتوى المحلي
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowScoreDetail(!showScoreDetail)}
                >
                  {showScoreDetail ? "إخفاء التفاصيل" : "عرض التفاصيل"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-3">
              {scoreResult.overallScore !== null ? (
                <>
                  <div
                    className={`text-3xl font-bold ${
                      scoreResult.overallScore >= 60
                        ? "text-green-600"
                        : scoreResult.overallScore >= 40
                          ? "text-amber-600"
                          : "text-red-600"
                    }`}
                  >
                    {scoreResult.overallScore}%
                  </div>
                  <div>
                    <p className="text-sm font-medium">{scoreResult.statusLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      النتيجة الإجمالية للمحتوى المحلي
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  لا توجد بيانات كافية لاحتساب النتيجة
                </p>
              )}
            </div>

                {showScoreDetail && (
              <div className="space-y-2 mt-3">
                <p className="text-xs text-muted-foreground mb-2">{scoreResult.summaryAr}</p>

                {/* Metric Scores */}
                <p className="text-xs font-semibold mt-3 mb-1">المؤشرات</p>
                {scoreResult.metrics.map((m) => (
                  <div
                    key={m.code}
                    className="flex items-center justify-between text-sm p-2 border rounded"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{m.labelAr}</p>
                      <p className="text-xs text-muted-foreground">{m.explanationAr}</p>
                    </div>
                    <div className="text-right shrink-0 mr-3">
                      <p className="font-bold">
                        {m.score !== null ? `${m.score}%` : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m.numerator !== null
                          ? `${m.numerator.toLocaleString("ar-SA")} / ${m.denominator?.toLocaleString("ar-SA") ?? "—"}`
                          : "لا توجد بيانات"}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Contribution Breakdown */}
                {scoreResult.contributions && scoreResult.contributions.length > 0 && (
                  <>
                    <p className="text-xs font-semibold mt-3 mb-1">تحليل المساهمة</p>
                    {scoreResult.contributions.map((c) => (
                      <div
                        key={c.code}
                        className="flex items-center justify-between text-sm p-2 border rounded bg-muted/20"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{c.labelAr}</p>
                          <p className="text-xs text-muted-foreground">
                            الوزن: {Math.round(c.weight * 100)}%
                            {c.score !== null && (
                              <> ← الوزن الفعلي: {Math.round(c.effectiveWeight * 100)}%</>
                            )}
                          </p>
                        </div>
                        <div className="text-right shrink-0 mr-3">
                          <p className="font-bold">
                            {c.contributionPct !== null
                              ? `${c.contributionPct.toFixed(1)}%`
                              : "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {c.contributionPct !== null ? "مساهمة في النتيجة" : "لا توجد بيانات"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Section Data Availability */}
                {scoreResult.sectionBreakdown && scoreResult.sectionBreakdown.length > 0 && (
                  <>
                    <p className="text-xs font-semibold mt-3 mb-1">تعبئة الأقسام</p>
                    {scoreResult.sectionBreakdown.map((s) => (
                      <div key={s.section} className="text-sm p-2 border rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{s.labelAr}</span>
                          <span className="text-xs text-muted-foreground">
                            {s.filledLines}/{s.totalLines} (
                            {s.fillPct}%)
                          </span>
                        </div>
                        <Progress value={s.fillPct} className="h-1.5" />
                      </div>
                    ))}
                  </>
                )}

                <p className="text-[10px] text-muted-foreground mt-2">
                  تم الاحتساب: {new Date(scoreResult.computedAt).toLocaleString("ar-SA")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs: Lines / Missing / Requests */}
        <Tabs defaultValue="lines">
        <TabsList>
          <TabsTrigger value="lines">البنود ({workbook.lines.length})</TabsTrigger>
          <TabsTrigger value="missing" disabled={!canAccessMissing}>
            البيانات الناقصة
            {missingData && missingData.totalMissing > 0 && (
              <Badge variant="destructive" className="mr-1">
                {missingData.totalMissing}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests" disabled={!canAccessRequests}>
            طلبات البيانات ({dataRequests.length})
          </TabsTrigger>
          <TabsTrigger value="ai-insights">AI Advisor</TabsTrigger>
        </TabsList>

        {/* Lines Tab */}
        <TabsContent value="lines" className="space-y-6">
          {Object.entries(sections).map(([section, lines]) => (
            <div key={section}>
              <h3 className="text-sm font-semibold mb-2">
                {SECTION_LABELS[section] || section}
              </h3>
              <div className="space-y-1">
                {lines.map((line) => (
                  <div
                    key={line.id}
                    className="flex items-center gap-3 p-2 border rounded text-sm hover:bg-muted/30"
                  >
                    <div className="w-16 text-xs text-muted-foreground font-mono">
                      {line.code}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{line.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {line.autoFilled && (
                          <Badge variant="secondary" className="text-[10px] px-1">
                            تلقائي
                          </Badge>
                        )}
                        {line.autoFillValue !== null && (
                          <span>
                            تلقائي: {line.autoFillValue.toLocaleString("ar-SA")}
                          </span>
                        )}
                        {line.manualValue !== null && (
                          <span className="text-green-600">
                            يدوي: {line.manualValue.toLocaleString("ar-SA")}
                          </span>
                        )}
                        {!line.autoFilled && line.manualValue === null && (
                          <span className="text-amber-500">ناقص</span>
                        )}
                        <Badge variant={CONFIDENCE_BADGES[line.confidence] || "outline"} className="text-[10px] px-1">
                          {line.confidence}
                        </Badge>
                        {line.evidenceRequired && (
                          <span className="text-blue-500">مطلوب إثبات</span>
                        )}
                      </div>
                    </div>
                    {editingLine === line.id ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-28 h-8 text-sm"
                          placeholder="القيمة"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSave(line.id)}
                          disabled={isLoading === line.id}
                        >
                          حفظ
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingLine(null)}
                        >
                          إلغاء
                        </Button>
                      </div>
                    ) : isEditable ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleEdit(line.id, line.manualValue ?? line.autoFillValue)
                        }
                      >
                        إدخال
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground px-2">
                        مقفل
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Missing Data Tab */}
        <TabsContent value="missing">
          {!canAccessMissing ? (
            <div className="text-center py-8 text-muted-foreground">
              <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>استورد الميزان أولا لتعبئة الدفتر.</p>
            </div>
          ) : !missingData || missingData.totalMissing === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p>لا توجد بيانات ناقصة. كل البنود مكتملة.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                إجمالي العناصر الناقصة: {missingData.totalMissing}
              </p>
              {Object.values(missingData.byCategory).map((group) => (
                <Card key={group.category}>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      {group.label} ({group.count})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {group.items.map((item, idx) => (
                        <div
                          key={`${item.lineCode}-${item.fieldName}-${idx}`}
                          className="text-sm p-2 border rounded"
                        >
                          <p className="font-medium">
                            {item.lineCode} — {item.lineName}
                          </p>
                          <p className="text-muted-foreground text-xs mt-1">
                            {item.description}
                          </p>
                          {item.evidenceRequired && item.evidenceTypes.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {item.evidenceTypes.map((t) => (
                                <Badge key={t} variant="outline" className="text-[10px]">
                                  {t}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai-insights">
          <AiInsightsPanel
            organizationId={organizationId}
            workbookId={workbook.id}
            projectId={workbook.projectId}
          />
        </TabsContent>

        {/* Data Requests Tab */}
        <TabsContent value="requests">
          {!canAccessRequests ? (
            <div className="text-center py-8 text-muted-foreground">
              <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>استورد الميزان أولا لتعبئة الدفتر.</p>
            </div>
          ) : dataRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Send className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>لا توجد طلبات بيانات بعد.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleGenerateRequest}
                disabled={isLoading === "gen-request"}
              >
                <PlusCircle className="h-4 w-4 ml-1" />
                إنشاء طلب بيانات
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {dataRequests.map((req) => (
                <Card key={req.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{req.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge>{req.status}</Badge>
                        {req.status === "draft" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendRequest(req.id)}
                            disabled={isLoading === `send-${req.id}`}
                          >
                            <Send className="h-3 w-3 ml-1" />
                            إرسال
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewRequestText(req.id)}
                        >
                          عرض النص
                        </Button>
                      </div>
                    </div>
                    {req.description && (
                      <p className="text-xs text-muted-foreground">
                        {req.description}
                      </p>
                    )}
                    {req.sentAt && (
                      <p className="text-xs text-muted-foreground">
                        أُرسل: {req.sentAt.toLocaleDateString("ar-SA")}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {req.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm p-2 border rounded"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="truncate">{item.label}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-[10px]">
                                {CATEGORY_LABELS[item.category] || item.category}
                              </Badge>
                              {item.evidenceRequired && (
                                <span className="text-blue-500">إثبات</span>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant={
                              item.status === "fulfilled"
                                ? "default"
                                : item.status === "waived"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {item.status === "fulfilled"
                              ? "مكتمل"
                              : item.status === "waived"
                                ? "متنازل"
                                : "مفتوح"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/local-content/workbook"
          className="text-primary hover:underline"
        >
          ← عودة إلى الدفاتر
        </Link>
        <Separator orientation="vertical" className="h-4" />
        <Link
          href={`/local-content/projects/${workbook.projectId}`}
          className="text-primary hover:underline"
        >
          ← عودة إلى المشروع
        </Link>
      </div>
    </div>
  );
}
