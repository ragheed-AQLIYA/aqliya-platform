"use client";

import type { ObjectionAnalysisRun } from "@/lib/sales/agents/objection-analysis";
import type { SalesInteractionView } from "@/lib/sales/interactions";
import { SalesViewerReadOnlyNotice } from "@/components/sales/sales-shell";
import { useDealObjectionAnalysis } from "./components/use-deal-objection-analysis";
import { ObjectionRunCard } from "./components/objection-run-card";
import { ObjectionAnalyzeForm } from "./components/objection-analyze-form";

export function DealObjectionAnalysisPanel({
  dealId,
  runs,
  interactions,
  canAnalyze = false,
}: {
  dealId: string;
  runs: ObjectionAnalysisRun[];
  interactions: SalesInteractionView[];
  canAnalyze?: boolean;
}) {
  const {
    loading,
    error,
    mode,
    interactionId,
    pastedText,
    setMode,
    setInteractionId,
    setPastedText,
    handleAnalyze,
  } = useDealObjectionAnalysis(dealId);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        تحليل اعتراض محكوم — تصنيف قواعدي من نص التفاعل أو نص ملصوق. لا
        استدعاء LLM خارجي. المخرجات مسودة بانتظار مراجعة بشرية.
      </p>

      {runs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          لا تحليلات اعتراض بعد — OPERATOR+ يمكنه تشغيل التحليل.
        </p>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => (
            <ObjectionRunCard key={run.id} run={run} />
          ))}
        </div>
      )}

      {!canAnalyze ? (
        <SalesViewerReadOnlyNotice action="تحليل الاعتراض" />
      ) : (
        <ObjectionAnalyzeForm
          mode={mode}
          interactionId={interactionId}
          pastedText={pastedText}
          loading={loading}
          error={error}
          interactions={interactions}
          onModeChange={setMode}
          onInteractionIdChange={setInteractionId}
          onPastedTextChange={setPastedText}
          onAnalyze={handleAnalyze}
        />
      )}
    </div>
  );
}
