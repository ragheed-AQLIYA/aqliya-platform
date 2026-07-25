"use client";

import { Shield, CheckCircle } from "lucide-react";
import { ReviewActions } from "@/components/knowledge-review/review-actions";
import { STATUS_CONFIG } from "./use-candidate-detail";
import type { ReviewAction } from "./use-candidate-detail";

type Status = "CANDIDATE" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "PROMOTED";

export function ReviewActionsSection({
  candidateId,
  liveStatus,
  busy,
  lastAction,
  actionError,
  onReview,
}: {
  candidateId: string;
  liveStatus: Status;
  busy: boolean;
  lastAction: ReviewAction | null;
  actionError: string | null;
  onReview: (action: ReviewAction, notes?: string) => Promise<void>;
}) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 font-semibold">
        <Shield className="h-4 w-4" />
        إجراءات المراجعة
      </h3>

      <ReviewActions
        candidateId={candidateId}
        currentStatus={liveStatus}
        busy={busy}
        lastAction={lastAction}
        actionError={actionError}
        onReview={onReview}
      />

      {lastAction && !actionError && !busy && (
        <div className="mt-3 flex items-center gap-2 text-xs text-green-700">
          <CheckCircle className="h-3 w-3" />
          <span>
            تم تنفيذ &quot;{lastAction}&quot; بنجاح — الحالة الآن:{" "}
            {STATUS_CONFIG[liveStatus]?.label ?? liveStatus}
          </span>
        </div>
      )}
    </section>
  );
}
