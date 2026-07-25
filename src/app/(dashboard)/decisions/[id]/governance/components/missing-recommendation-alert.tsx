"use client";

import { Card } from "@/components/ui/card";

interface MissingRecommendationAlertProps {
  hasRecommendation: boolean;
  status: string;
}

export function MissingRecommendationAlert({
  hasRecommendation,
  status,
}: MissingRecommendationAlertProps) {
  if (hasRecommendation || status !== "IN_REVIEW") return null;

  return (
    <Card className="p-4 mb-6 border-amber-200 bg-amber-50">
      <p className="text-sm text-amber-800">
        لم تُنشأ توصية بعد. يُفضّل تشغيل المحاكاة قبل الاعتماد، أو تقديم
        سبب التجاوز.
      </p>
    </Card>
  );
}
