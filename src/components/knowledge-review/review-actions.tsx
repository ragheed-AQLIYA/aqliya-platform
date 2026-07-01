/**
 * Phase 8.1 — Review Actions (Client Component).
 *
 * Governs review action buttons with safety rules:
 *
 * - Submit for Review: only CANDIDATE → UNDER_REVIEW
 * - Approve: only CANDIDATE / UNDER_REVIEW → APPROVED
 * - Reject: only CANDIDATE / UNDER_REVIEW → REJECTED (HIDDEN after PROMOTED)
 * - Promote: only APPROVED → PROMOTED (server also enforces)
 *
 * Safety rules enforced client-side (UI visibility + disabled state)
 * and server-side (existing review-workflow.ts and promotion-service.ts).
 */

"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  TrendingUp,
  Send,
  AlertTriangle,
} from "lucide-react";

/* ── Action types ────────────────────────────── */

type ReviewAction = "approve" | "reject" | "promote" | "submit";

type Status = "CANDIDATE" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "PROMOTED";

/* ── Safety rules ────────────────────────────── */

/**
 * Determine which actions are available for the current status.
 * These are UX-level guards; server-side enforcement also exists.
 */
function getAvailableActions(status: Status): ReviewAction[] {
  switch (status) {
    case "CANDIDATE":
      return ["submit", "approve", "reject"];
    case "UNDER_REVIEW":
      return ["approve", "reject"];
    case "APPROVED":
      return ["promote", "reject"];
    case "REJECTED":
      return []; // Cannot re-review (server also blocks)
    case "PROMOTED":
      return []; // Terminal state — all actions blocked
    default:
      return [];
  }
}

/* ── Component ───────────────────────────────── */

export function ReviewActions({
  candidateId: _candidateId,
  currentStatus,
  busy,
  lastAction,
  actionError: _actionError,
  onReview,
}: {
  candidateId: string;
  currentStatus: Status;
  busy: boolean;
  lastAction: string | null;
  actionError: string | null;
  onReview: (action: ReviewAction, notes?: string) => Promise<void>;
}) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [pendingAction, setPendingAction] = useState<ReviewAction | null>(null);

  const availableActions = getAvailableActions(currentStatus);

  if (availableActions.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <AlertTriangle className="h-4 w-4" />
        <span>
          لا توجد إجراءات متاحة للمرشّح في الحالة &quot;
          {currentStatus}&quot;.
        </span>
      </div>
    );
  }

  const actionLabels: Record<ReviewAction, { label: string; color: string; icon: React.ReactNode }> = {
    submit: {
      label: "إرسال للمراجعة",
      color: "bg-blue-600 hover:bg-blue-700 text-white",
      icon: <Send className="h-4 w-4" />,
    },
    approve: {
      label: "اعتماد",
      color: "bg-green-600 hover:bg-green-700 text-white",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    reject: {
      label: "رفض",
      color: "bg-red-600 hover:bg-red-700 text-white",
      icon: <XCircle className="h-4 w-4" />,
    },
    promote: {
      label: "ترقية إلى قطعة معرفية",
      color: "bg-purple-600 hover:bg-purple-700 text-white",
      icon: <TrendingUp className="h-4 w-4" />,
    },
  };

  async function handleClick(action: ReviewAction) {
    setPendingAction(action);
    if (action === "reject" || action === "promote") {
      // Require notes for reject/promote
      setShowNotes(true);
      return;
    }
    await onReview(action);
    setPendingAction(null);
  }

  async function handleConfirm() {
    if (!pendingAction) return;
    await onReview(pendingAction, notes || undefined);
    setShowNotes(false);
    setNotes("");
    setPendingAction(null);
  }

  function handleCancel() {
    setShowNotes(false);
    setNotes("");
    setPendingAction(null);
  }

  return (
    <div className="space-y-3">
      {/* Notes input (conditional) */}
      {showNotes && pendingAction && (
        <div className="space-y-2">
          <label
            htmlFor="review-notes"
            className="text-sm font-medium text-muted-foreground"
          >
            {pendingAction === "reject"
              ? "سبب الرفض (مطلوب)"
              : pendingAction === "promote"
                ? "ملاحظات الترقية (اختياري)"
                : "ملاحظات (اختياري)"}
          </label>
          <textarea
            id="review-notes"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              pendingAction === "reject"
                ? "اذكر سبب الرفض..."
                : "ملاحظات..."
            }
          />
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={busy || (pendingAction === "reject" && !notes.trim())}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {busy ? "جارٍ التنفيذ..." : "تأكيد"}
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 rounded-md border bg-background px-4 py-1.5 text-sm font-medium hover:bg-muted"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!showNotes && (
        <div className="flex flex-wrap gap-2">
          {availableActions.map((action) => {
            const cfg = actionLabels[action];
            return (
              <button
                key={action}
                onClick={() => handleClick(action)}
                disabled={busy}
                className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${cfg.color}`}
                aria-label={cfg.label}
              >
                {busy && lastAction === action ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  cfg.icon
                )}
                {cfg.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
