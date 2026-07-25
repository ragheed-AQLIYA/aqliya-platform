"use client";

import { Shield, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useReviewAssignment } from "./components/use-review-assignment";
import { AssignReviewerForm } from "./components/assign-reviewer-form";
import { ReviewCard } from "./components/review-card";
import type { Reviewer, Review } from "./components/types";

interface ReviewAssignmentPanelProps {
  contactId: string;
  organizationId: string;
  reviews: Review[];
  availableReviewers: Reviewer[];
  userRole: string;
}

export function ReviewAssignmentPanel({
  contactId,
  organizationId: _organizationId,
  reviews,
  availableReviewers,
  userRole,
}: ReviewAssignmentPanelProps) {
  const {
    loading,
    selectedReviewer, setSelectedReviewer,
    reviewType, setReviewType,
    reason, setReason,
    dueDate, setDueDate,
    notes, setNotes,
    completeReviewId, setCompleteReviewId,
    handleAssign,
    handleComplete,
    canManage,
    pendingReviews,
  } = useReviewAssignment({ contactId, reviews, userRole });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          إدارة المراجعات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {canManage && (
          <AssignReviewerForm
            availableReviewers={availableReviewers}
            loading={loading}
            selectedReviewer={selectedReviewer}
            reviewType={reviewType}
            reason={reason}
            dueDate={dueDate}
            onSelectedReviewerChange={setSelectedReviewer}
            onReviewTypeChange={setReviewType}
            onReasonChange={setReason}
            onDueDateChange={setDueDate}
            onAssign={handleAssign}
          />
        )}

        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-sm">لا توجد مراجعات</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                loading={loading}
                notes={notes}
                completeReviewId={completeReviewId}
                canManage={canManage}
                onNotesChange={(reviewId, value) => {
                  setCompleteReviewId(reviewId);
                  setNotes(value);
                }}
                onComplete={handleComplete}
              />
            ))}
          </div>
        )}

        {pendingReviews.length > 0 && (
          <div className="border-t pt-2">
            <div className="flex items-center gap-1 text-sm text-amber-600">
              <Clock className="h-4 w-4" />
              <span>{pendingReviews.length} مراجعة (مراجعات) معلقة</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
