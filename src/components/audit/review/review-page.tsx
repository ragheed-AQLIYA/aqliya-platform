"use client";

import dynamic from "next/dynamic";
import { useReviewPage } from "./components/use-review-page";
import { ReviewFilterBar } from "./components/review-filter-bar";
import { AddCommentForm } from "./components/add-comment-form";
import { ReviewCommentList } from "./components/review-comment-list";

const TraceabilityDrawer = dynamic(
  () =>
    import("@/components/audit/shared/traceability-drawer").then(
      (m) => ({ default: m.TraceabilityDrawer }),
    ),
  { ssr: false, loading: () => <div className="h-20 animate-pulse rounded-md bg-muted" /> },
);

export default function ReviewPage() {
  const {
    comments,
    engagement,
    loading,
    filter,
    setFilter,
    newComment,
    setNewComment,
    commentTargetType,
    setCommentTargetType,
    commentTargetId,
    setCommentTargetId,
    sending,
    commentError,
    traceComment,
    traceabilityOpen,
    setTraceabilityOpen,
    setTraceComment,
    traceData,
    openCount,
    filteredComments,
    targetLabels,
    getTargetOptions,
    handleAddComment,
    handleTrace,
    handleResolve,
  } = useReviewPage();

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Review</h1>
          <p className="text-sm text-muted-foreground">
            {engagement?.client?.name} - {engagement?.fiscalPeriod}
          </p>
        </div>
        <ReviewFilterBar
          filter={filter}
          totalCount={comments.length}
          openCount={openCount}
          onFilterChange={setFilter}
        />
      </div>

      <AddCommentForm
        commentTargetType={commentTargetType}
        commentTargetId={commentTargetId}
        newComment={newComment}
        sending={sending}
        commentError={commentError}
        targetOptions={getTargetOptions()}
        onTargetTypeChange={(v) => {
          setCommentTargetType(v);
          setCommentTargetId("");
        }}
        onTargetIdChange={setCommentTargetId}
        onCommentChange={setNewComment}
        onSubmit={handleAddComment}
      />

      <ReviewCommentList
        comments={filteredComments}
        targetLabels={targetLabels}
        onTrace={handleTrace}
        onResolve={handleResolve}
      />

      <TraceabilityDrawer
        open={traceabilityOpen}
        onClose={() => {
          setTraceabilityOpen(false);
          setTraceComment(null);
        }}
        entityType="review_comment"
        entityId={traceComment?.id || ""}
        entityLabel={traceComment?.comment?.substring(0, 60) || ""}
        forwardTrace={traceData.forward}
        backwardTrace={traceData.backward}
      />
    </div>
  );
}
