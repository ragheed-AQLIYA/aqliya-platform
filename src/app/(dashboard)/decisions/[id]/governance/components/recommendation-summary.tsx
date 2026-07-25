"use client";

import { Card } from "@/components/ui/card";

interface RecommendationSummaryProps {
  recommendationSummary: any;
}

export function RecommendationSummary({
  recommendationSummary,
}: RecommendationSummaryProps) {
  if (!recommendationSummary) return null;

  return (
    <section className="mb-8">
      <h3 className="text-lg font-semibold mb-4">التوصية الحالية</h3>
      <Card className="p-4">
        <div className="space-y-2">
          <div>
            <span className="text-muted-foreground">الإجراء:</span>
            <span className="ml-2 font-medium">
              {recommendationSummary.action}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">المبرّر:</span>
            <p className="mt-1 text-sm">
              {recommendationSummary.rationale}
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
}
