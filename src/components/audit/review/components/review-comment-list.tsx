"use client";

import type { ReviewComment } from "@/types/audit";
import { ReviewCommentCard } from "./review-comment-card";

interface ReviewCommentListProps {
  comments: ReviewComment[];
  targetLabels: Map<string, string>;
  onTrace: (c: ReviewComment) => void;
  onResolve: (c: ReviewComment) => void;
}

export function ReviewCommentList({
  comments,
  targetLabels,
  onTrace,
  onResolve,
}: ReviewCommentListProps) {
  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <ReviewCommentCard
          key={comment.id}
          comment={comment}
          targetLabel={targetLabels.get(comment.id) || ""}
          onTrace={onTrace}
          onResolve={onResolve}
        />
      ))}
    </div>
  );
}
