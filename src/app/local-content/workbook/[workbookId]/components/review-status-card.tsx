import type { WorkbookReviewStatus } from "@/lib/local-content/workbook/ai-auto-review";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BotIcon } from "./icons";

interface Props {
  reviewStatus: WorkbookReviewStatus | null;
  isLoading: string | null;
  onRunReview: () => void;
}

function reviewStatusText(status: WorkbookReviewStatus | null): string {
  if (!status?.everReviewed) return "لم يتم إجراء مراجعة ذكية بعد";
  if (status.lastRunStatus === "completed") return "آخر مراجعة: مكتملة ✅";
  if (status.lastRunStatus === "partial") return "آخر مراجعة: مكتملة جزئياً ⚠️";
  if (status.lastRunStatus === "failed") return "آخر مراجعة: فشلت ❌";
  return "قيد التنفيذ...";
}

export function ReviewStatusCard({
  reviewStatus,
  isLoading,
  onRunReview,
}: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <BotIcon className="h-4 w-4" />
          المراجعة الذكية
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm">{reviewStatusText(reviewStatus)}</span>
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
          onClick={onRunReview}
          disabled={isLoading === "review"}
        >
          {isLoading === "review" ? "جاري التشغيل..." : "تشغيل المراجعة الذكية"}
        </Button>
      </CardContent>
    </Card>
  );
}
