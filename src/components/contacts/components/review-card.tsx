"use client";

import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertTriangle, Loader2 } from "lucide-react";

import { REVIEW_STATUS_LABELS, REVIEW_STATUS_COLORS, REVIEW_TYPE_LABELS } from "./constants";
import type { Review } from "./types";

interface ReviewCardProps {
  review: Review;
  loading: string | null;
  notes: string;
  completeReviewId: string;
  canManage: boolean;
  onNotesChange: (reviewId: string, value: string) => void;
  onComplete: (reviewId: string, notes: string | undefined) => void;
}

function ReviewApprovals({ approvals }: { approvals: Review["approvals"] }) {
  if (approvals.length === 0) return null;
  return (
    <div className="space-y-1 mt-2 border-t pt-2">
      <p className="text-xs font-medium text-muted-foreground">الموافقات:</p>
      {approvals.map((a) => (
        <div key={a.id} className="flex items-center justify-between text-xs">
          <span>
            {a.approverName ?? "مستخدم"}:{" "}
            {a.status === "approved" ? (
              <span className="text-green-600">✓ معتمد</span>
            ) : (
              <span className="text-red-600">✗ مرفوض</span>
            )}
          </span>
          <span className="text-muted-foreground">
            {new Date(a.createdAt).toLocaleDateString("ar-SA")}
          </span>
        </div>
      ))}
    </div>
  );
}

function ReviewCompleteForm({
  reviewId,
  loading,
  notes,
  completeReviewId,
  onNotesChange,
  onComplete,
}: {
  reviewId: string;
  loading: string | null;
  notes: string;
  completeReviewId: string;
  onNotesChange: (reviewId: string, value: string) => void;
  onComplete: (reviewId: string, notes: string | undefined) => void;
}) {
  return (
    <div className="mt-2 space-y-2">
      <div>
        <label className="text-xs font-medium">ملاحظات الإكمال</label>
        <Textarea
          value={completeReviewId === reviewId ? notes : ""}
          onChange={(e) => onNotesChange(reviewId, e.target.value)}
          placeholder="ملاحظات المراجعة"
          className="mt-1 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => onComplete(reviewId, notes || undefined)}
          disabled={loading === `complete-${reviewId}`}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          {loading === `complete-${reviewId}` ? (
            <Loader2 className="ml-1 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="ml-1 h-4 w-4" />
          )}
          إكمال المراجعة
        </Button>
      </div>
    </div>
  );
}

export function ReviewCard({
  review,
  loading,
  notes,
  completeReviewId,
  canManage,
  onNotesChange,
  onComplete,
}: ReviewCardProps) {
  const isOverdue = review.status === "pending" && review.reviewDueDate && new Date(review.reviewDueDate) < new Date();

  return (
    <div key={review.id} className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className={REVIEW_STATUS_COLORS[review.status] || ""}>
            {REVIEW_STATUS_LABELS[review.status] || review.status}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {REVIEW_TYPE_LABELS[review.reviewType] || review.reviewType}
          </Badge>
          {isOverdue && (
            <AlertTriangle className="h-4 w-4 text-red-500" aria-label="متأخر" />
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(review.createdAt).toLocaleDateString("ar-SA")}
        </span>
      </div>
      {review.reviewerName && (
        <p className="text-sm">المراجع: {review.reviewerName}</p>
      )}
      {review.reason && (
        <p className="text-sm text-muted-foreground">{review.reason}</p>
      )}
      {review.reviewDueDate && (
        <p className="text-xs text-muted-foreground">
          <Clock className="inline ml-1 h-3 w-3" />
          تاريخ الاستحقاق: {new Date(review.reviewDueDate).toLocaleDateString("ar-SA")}
          {isOverdue && <span className="text-red-500"> (متأخر)</span>}
        </p>
      )}
      {review.reviewerNotes && (
        <p className="text-sm bg-muted p-2 rounded">
          ملاحظات: {review.reviewerNotes}
        </p>
      )}
      {review.completedAt && (
        <p className="text-xs text-muted-foreground">
          اكتملت في: {new Date(review.completedAt).toLocaleDateString("ar-SA")}
        </p>
      )}

      <ReviewApprovals approvals={review.approvals} />

      {review.status === "pending" && canManage && (
        <ReviewCompleteForm
          reviewId={review.id}
          loading={loading}
          notes={notes}
          completeReviewId={completeReviewId}
          onNotesChange={onNotesChange}
          onComplete={onComplete}
        />
      )}
    </div>
  );
}
