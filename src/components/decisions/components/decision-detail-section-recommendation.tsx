"use client";

import { Badge } from "@/components/ui/badge";
import { evaluateDecisionRecommendation } from "@/lib/decision/recommendation";

type RecommendationSectionProps = {
  recommendationState: ReturnType<typeof evaluateDecisionRecommendation>;
  decision: Record<string, unknown>;
};

export function DecisionDetailSectionRecommendation({
  recommendationState,
  decision,
}: RecommendationSectionProps) {
  return (
    <section className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">أ-١٫٤ التوصية</h2>
        {!recommendationState.isComplete ? (
          <Badge variant="secondary">محظور</Badge>
        ) : (
          <Badge variant="default">مكتمل</Badge>
        )}
      </div>
      {!recommendationState.isComplete ? (
        <p className="text-sm text-muted-foreground">
          التوصية محظورة حتى استيفاء جميع المتطلبات.
        </p>
      ) : decision.recommendation ? (
        <div className="space-y-3 text-sm">
          <div>
            <h3 className="font-medium">الإجراء الموصى به</h3>
            <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
              {(decision.recommendation as { recommendedAction: string }).recommendedAction}
            </p>
          </div>
          <div>
            <h3 className="font-medium">المبرّر</h3>
            <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
              {(decision.recommendation as { rationale: string }).rationale}
            </p>
          </div>
          <div>
            <h3 className="font-medium">الحالة التالية المتوقّعة</h3>
            <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
              {(decision.recommendation as { expectedNextState: string }).expectedNextState}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          لم تبدأ التوصية بعد. افتح تبويب التوصية لتعريفها.
        </p>
      )}
    </section>
  );
}
