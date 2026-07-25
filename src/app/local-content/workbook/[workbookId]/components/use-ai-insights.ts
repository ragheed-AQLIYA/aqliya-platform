import { useState, useEffect, useCallback } from "react";
import type {
  WorkbookReviewStatus,
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

interface DashboardData {
  reviewStatus: WorkbookReviewStatus;
  recommendations: Array<unknown>;
  simulations: Array<unknown>;
  health: AiHealthReport | null;
}

export function useAiInsights(
  organizationId: string,
  workbookId: string,
  tbLines?: TbLine[],
) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [health, setHealth] = useState<AiHealthReport | null>(null);
  const [reviewStatus, setReviewStatus] = useState<WorkbookReviewStatus | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [showSimulation, setShowSimulation] = useState(false);
  const [supplierIncrease, setSupplierIncrease] = useState("");

  const showMsg = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 5000);
  };

  useEffect(() => {
    checkAiHealthAction().then((r) => {
      if (r.ok && r.data) setHealth(r.data as AiHealthReport);
    });
  }, []);

  const loadDashboard = useCallback(async () => {
    setIsLoading("dashboard");
    const result = await getWorkbookAiDashboardDataAction(organizationId, workbookId);
    if (result.ok && result.data) {
      const data = result.data as DashboardData;
      setReviewStatus(data.reviewStatus);
      if (data.health) setHealth(data.health);
    }
    setIsLoading(null);
  }, [organizationId, workbookId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

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

    if (isNaN(localSpendValue)) {
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

  return {
    health,
    reviewStatus,
    recommendations,
    simulationResult,
    actionMsg,
    isLoading,
    showSimulation,
    supplierIncrease,
    setSupplierIncrease,
    handleRunReview,
    handleGenerateRecommendations,
    handleRunSimulation,
    setShowSimulation,
  };
}
