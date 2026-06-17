"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  WorkbookReviewStatus,
  AutoReviewResult,
} from "@/lib/local-content/workbook/ai-auto-review";
import type { RecommendationResult } from "@/lib/local-content/workbook/recommendation-engine";
import type { SimulationResult } from "@/lib/local-content/workbook/simulation-engine";
import type { AiHealthReport } from "@/lib/local-content/workbook/ai-health";
import type { TbLine } from "@/lib/local-content/workbook/types";
import {
  checkAiHealthAction,
  getWorkbookReviewStatusAction,
  runWorkbookAiReviewAction,
  generateRecommendationsAction,
  runSimulationAction,
  getWorkbookAiDashboardDataAction,
} from "@/actions/localcontent-ai-advisor-v3-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// ─── Icons (inline to avoid import issues) ───

function BotIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3a3 3 0 0 0-3 3v12a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z" />
      <path d="M5 12a7 7 0 0 0 14 0" />
    </svg>
  );
}

interface Props {
  organizationId: string;
  workbookId: string;
  projectId?: string;
  tbLines?: TbLine[];
}

export function AiInsightsPanel({
  organizationId,
  workbookId,
  tbLines,
}: Props) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [health, setHealth] = useState<AiHealthReport | null>(null);
  const [reviewStatus, setReviewStatus] = useState<WorkbookReviewStatus | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [showSimulation, setShowSimulation] = useState(false);

  // Simulation inputs
  const [supplierIncrease, setSupplierIncrease] = useState("");
  const [saudiHireCount, setSaudiHireCount] = useState("");
  const [assetIncrease, setAssetIncrease] = useState("");

  const showMsg = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 5000);
  };

  // Load health on mount
  useEffect(() => {
    checkAiHealthAction().then((r) => {
      if (r.ok && r.data) setHealth(r.data as AiHealthReport);
    });
  }, []);

  // Load dashboard data
  const loadDashboard = useCallback(async () => {
    setIsLoading("dashboard");
    const result = await getWorkbookAiDashboardDataAction(organizationId, workbookId);
    if (result.ok && result.data) {
      const data = result.data as {
        reviewStatus: WorkbookReviewStatus;
        recommendations: Array<unknown>;
        simulations: Array<unknown>;
        health: AiHealthReport | null;
      };
      setReviewStatus(data.reviewStatus);
      if (data.health) setHealth(data.health);
    }
    setIsLoading(null);
  }, [organizationId, workbookId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // ─── Handlers ───

  const handleRunReview = async () => {
    setIsLoading("review");
    const result = await runWorkbookAiReviewAction(
      organizationId,
      workbookId,
      tbLines ?? [],
    );
    if (result.ok) {
      showMsg("تم تشغيل المراجعة الذكية بنجاح ✅");
      await loadDashboard();
    } else {
      showMsg(`خطأ: ${result.error}`);
    }
    setIsLoading(null);
  };

  const handleGenerateRecommendations = async () => {
    setIsLoading("recommendations");
    const result = await generateRecommendationsAction(organizationId, workbookId);
    if (result.ok && result.data) {
      setRecommendations(result.data as RecommendationResult);
      showMsg("تم إنشاء التوصيات بنجاح ✅");
    } else {
      showMsg(`خطأ: ${result.error}`);
    }
    setIsLoading(null);
  };

  const handleRunSimulation = async () => {
    const localSpendValue = parseFloat(supplierIncrease);
    const saudiWorkforceValue = parseFloat(saudiHireCount);
    const localAssetValue = parseFloat(assetIncrease);

    if (isNaN(localSpendValue) && isNaN(saudiWorkforceValue) && isNaN(localAssetValue)) {
      showMsg("الرجاء إدخال قيمة رقمية صالحة");
      return;
    }

    setIsLoading("simulation");
    const result = await runSimulationAction(organizationId, workbookId, "supplier", {
      localSpendValue,
    });
    if (result.ok && result.data) {
      setSimulationResult(result.data as SimulationResult);
      setShowSimulation(true);
      showMsg("تم تشغيل المحاكاة بنجاح ✅");
    } else {
      showMsg(`خطأ: ${result.error}`);
    }
    setIsLoading(null);
  };

  // ─── Status Text ───

  const reviewStatusText = () => {
    if (!reviewStatus?.everReviewed) return "لم يتم إجراء مراجعة ذكية بعد";
    if (reviewStatus.lastRunStatus === "completed") return "آخر مراجعة: مكتملة ✅";
    if (reviewStatus.lastRunStatus === "partial") return "آخر مراجعة: مكتملة جزئياً ⚠️";
    if (reviewStatus.lastRunStatus === "failed") return "آخر مراجعة: فشلت ❌";
    return "قيد التنفيذ...";
  };

  // ─── Render ───

  return (
    <div className="space-y-4">
      {/* Health Banner */}
      {health && !health.healthy && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-3 text-sm text-amber-800">
            ⚠️ {health.recommendation}
          </CardContent>
        </Card>
      )}

      {actionMsg && (
        <div className="bg-primary/10 border border-primary/20 text-sm p-3 rounded-lg">
          {actionMsg}
        </div>
      )}

      {/* Section 1: AI Review Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BotIcon className="h-4 w-4" />
            المراجعة الذكية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">{reviewStatusText()}</span>
            {reviewStatus?.lastCompletedAt && (
              <span className="text-xs text-muted-foreground">
                {new Date(reviewStatus.lastCompletedAt).toLocaleDateString("ar-SA")}
              </span>
            )}
          </div>
          {reviewStatus && reviewStatus.everReviewed && (
            <div className="flex gap-4 text-xs text-muted-foreground mb-3">
              <span>اقتراحات أنماط معلقة: {reviewStatus.pendingPatternSuggestions}</span>
              <span>نتائج إيجابية خاطئة: {reviewStatus.pendingFalsePositives}</span>
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleRunReview}
            disabled={isLoading === "review"}
          >
            {isLoading === "review" ? "جاري التشغيل..." : "تشغيل المراجعة الذكية"}
          </Button>
        </CardContent>
      </Card>

      {/* Section 2: Recommendations */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BrainIcon className="h-4 w-4" />
            توصيات التحسين
          </CardTitle>
          <CardDescription className="text-xs">
            توصيات مبنية على تحليل بيانات الدفتر لتحسين درجة المحتوى المحلي
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                النتيجة الحالية:{" "}
                {recommendations.currentScore !== null
                  ? `${recommendations.currentScore}%`
                  : "غير متوفرة"}
              </p>
              {recommendations.recommendations.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  لا توجد توصيات حالياً. أضف المزيد من البيانات للحصول على توصيات.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {recommendations.recommendations.slice(0, 5).map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-2 border rounded text-sm hover:bg-muted/30"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-xs">{rec.title}</span>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant={
                              rec.priority === "critical"
                                ? "destructive"
                                : rec.priority === "high"
                                  ? "default"
                                  : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {rec.priority === "critical"
                              ? "حرج"
                              : rec.priority === "high"
                                ? "عالٍ"
                                : rec.priority === "medium"
                                  ? "متوسط"
                                  : "منخفض"}
                          </Badge>
                          <span className="text-xs font-bold">
                            {rec.impactScore}%
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {rec.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={handleGenerateRecommendations}
                disabled={isLoading === "recommendations"}
              >
                {isLoading === "recommendations"
                  ? "جاري الإنشاء..."
                  : "إنشاء التوصيات"}
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground mb-2">
                لم يتم إنشاء توصيات بعد
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerateRecommendations}
                disabled={isLoading === "recommendations"}
              >
                {isLoading === "recommendations"
                  ? "جاري الإنشاء..."
                  : "إنشاء التوصيات"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Simulation */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BrainIcon className="h-4 w-4" />
            محاكاة "ماذا لو"
          </CardTitle>
          <CardDescription className="text-xs">
            جرب تغيير القيم لترى أثرها على درجة المحتوى المحلي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Supplier simulation */}
            <div>
              <label className="text-xs font-medium mb-1 block">
                زيادة المشتريات المحلية إلى
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={supplierIncrease}
                  onChange={(e) => setSupplierIncrease(e.target.value)}
                  placeholder="أدخل القيمة"
                  className="h-8 text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRunSimulation}
                  disabled={isLoading === "simulation"}
                >
                  محاكاة
                </Button>
              </div>
            </div>

            {/* Simulation result */}
            {showSimulation && simulationResult && (
              <div className="p-3 border rounded bg-muted/20">
                <p className="text-xs font-medium mb-2">
                  {simulationResult.scenarioLabel}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span>النتيجة الحالية:</span>
                  <span className="font-bold">
                    {simulationResult.currentScore.overallScore !== null
                      ? `${simulationResult.currentScore.overallScore}%`
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>النتيجة المتوقعة:</span>
                  <span className="font-bold text-green-600">
                    {simulationResult.projectedScore.overallScore !== null
                      ? `${simulationResult.projectedScore.overallScore}%`
                      : "—"}
                  </span>
                </div>
                {simulationResult.delta !== null && (
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span>الفرق:</span>
                    <span
                      className={`font-bold ${
                        simulationResult.delta >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {simulationResult.delta >= 0 ? "+" : ""}
                      {simulationResult.delta}%
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span>مستوى الثقة:</span>
                  <span>{simulationResult.confidence}%</span>
                </div>
                {simulationResult.assumptions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[10px] text-muted-foreground">الافتراضات:</p>
                    <ul className="text-[10px] text-muted-foreground list-disc list-inside">
                      {simulationResult.assumptions.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="mt-3"
            onClick={() => setShowSimulation(!showSimulation)}
          >
            {showSimulation ? "إخفاء" : "عرض المزيد من خيارات المحاكاة"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
