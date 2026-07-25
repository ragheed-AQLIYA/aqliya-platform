"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { ReviewQueueItem as ReviewQueueItemType } from "@/actions/localcontent-review-actions";

export const typeConfig: Record<
  string,
  { label: string; color: string; border: string }
> = {
  explanation: {
    label: "تفسير / Explanation",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    border: "border-l-blue-500",
  },
  suggestion: {
    label: "اقتراح / Suggestion",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    border: "border-l-purple-500",
  },
  false_positive: {
    label: "إيجابية كاذبة / FP",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    border: "border-l-amber-500",
  },
};

interface ReviewQueueItemProps {
  item: ReviewQueueItemType;
  isSelected: boolean;
  isProcessing: boolean;
  reviewNotes: string;
  onToggleSelect: (id: string) => void;
  onReviewNotesChange: (value: string) => void;
  onReview: (item: ReviewQueueItemType, decision: string) => void;
}

export function ReviewQueueItemCard({
  item,
  isSelected,
  isProcessing,
  reviewNotes,
  onToggleSelect,
  onReviewNotesChange,
  onReview,
}: ReviewQueueItemProps) {
  const cfg = typeConfig[item.type] ?? typeConfig.explanation;

  return (
    <Card
      className={`border-l-4 ${cfg.border} ${isSelected ? "ring-2 ring-primary" : ""}`}
    >
      <CardHeader className="py-3 px-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(item.id)}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-sm font-medium truncate">
                {item.title}
              </CardTitle>
              <Badge
                variant="outline"
                className={`text-xs ${cfg.color}`}
              >
                {cfg.label}
              </Badge>
              {item.riskLevel && (
                <Badge
                  variant={
                    item.riskLevel === "high"
                      ? "destructive"
                      : item.riskLevel === "medium"
                        ? "default"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {item.riskLevel === "high"
                    ? "عالي"
                    : item.riskLevel === "medium"
                      ? "متوسط"
                      : "منخفض"}
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs">
              <span className="font-mono">{item.workbookLineCode}</span>
              {" · "}
              <span>{item.detail.substring(0, 120)}</span>
              {" · "}
              <span className="text-muted-foreground">
                {Math.round((Date.now() - item.createdAt.getTime()) / 86400000)}d ago
              </span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-2 px-4 pb-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="ملاحظات المراجعة..."
            className="flex-1 h-8 text-sm"
            onChange={(e) => onReviewNotesChange(e.target.value)}
            disabled={isProcessing}
          />
          {item.type === "suggestion" ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReview(item, "rejected")}
                disabled={isProcessing}
              >
                ❌ رفض / Reject
              </Button>
              <Button
                size="sm"
                onClick={() => onReview(item, "approved")}
                disabled={isProcessing}
              >
                ✅ اعتماد / Approve
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReview(item, "rejected")}
                disabled={isProcessing}
              >
                ❌ رفض / Reject
              </Button>
              <Button
                size="sm"
                onClick={() => onReview(item, "confirmed")}
                disabled={isProcessing}
              >
                ✅ تأكيد / Confirm
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
