"use client";

import { useEffect, useState } from "react";
import { workflow_listReviews } from "@/actions/workflowos-actions";
import { WorkflowStatusBadge } from "@/components/workflowos/workflow-status-badge";
import { Loader2, MessageSquare } from "lucide-react";

interface ReviewItem {
  id: string;
  status: string;
  notes?: string | null;
  reviewerId: string;
  createdAt: Date;
}

export function WorkflowReviewPanel({
  clientId,
  recordId,
}: {
  clientId: string;
  recordId: string;
}) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    workflow_listReviews(clientId, recordId).then((result) => {
      if (result.success && result.data) {
        setReviews(result.data as ReviewItem[]);
      } else {
        setError(result.error ?? "فشل تحميل المراجعات");
      }
      setLoading(false);
    });
  }, [clientId, recordId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-status-error/20 bg-status-error/5 p-4 text-sm text-status-error">
        {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-4 text-center text-sm text-muted-foreground">
        لا توجد مراجعات بعد
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <WorkflowStatusBadge
              status={review.status === "Returned" ? "Draft" : review.status}
              size="sm"
            />
            <span className="text-[10px] text-muted-foreground">
              {new Date(review.createdAt).toLocaleDateString("ar-SA", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          {review.notes && (
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
              <span>{review.notes}</span>
            </div>
          )}
          <div className="mt-1 text-[10px] text-muted-foreground/60">
            المراجع: {review.reviewerId.slice(0, 8)}...
          </div>
        </div>
      ))}
    </div>
  );
}
