"use client";

import { Button } from "@/components/ui/button";

interface Props {
  loading: string | null;
  onRunAnalysis: () => void;
  onRunExplanations: () => void;
  onRunCalibration: () => void;
}

export function AiAdvisorActions({
  loading,
  onRunAnalysis,
  onRunExplanations,
  onRunCalibration,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={onRunAnalysis}
        disabled={loading !== null}
        variant="default"
      >
        {loading === "analysis" ? "جارٍ التحليل..." : "🔍 تحليل الأنماط / Analyze Patterns"}
      </Button>
      <Button
        onClick={onRunExplanations}
        disabled={loading !== null}
        variant="outline"
      >
        {loading === "explanations" ? "جارٍ إنشاء الشروحات..." : "📋 شرح المطابقات / Explain Matches"}
      </Button>
      <Button
        onClick={onRunCalibration}
        disabled={loading !== null}
        variant="secondary"
      >
        {loading === "calibration" ? "جارٍ المعايرة..." : "📊 معايرة الثقة / Calibrate Confidence"}
      </Button>
    </div>
  );
}
