"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export function useAiAdvisor(projectId: string, workbookId: string) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const runAnalysis = useCallback(async () => {
    setLoading("analysis");
    setStatusMessage(null);
    try {
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
        setExplanations(res.data as unknown[]);
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

  return {
    loading,
    explanations,
    statusMessage,
    runAnalysis,
    runExplanations,
    runCalibration,
  };
}
