"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles } from "lucide-react";
import { SalesViewerReadOnlyNotice } from "@/components/sales/sales-shell";

export function FollowUpCreateForm({
  loading,
  error,
  selectedInteractionId,
  interactions,
  canCreate,
  onSelectInteraction,
  onDraft,
}: {
  loading: boolean;
  error: string | null;
  selectedInteractionId: string;
  interactions: Array<{ id: string; type: string; subject: string | null }>;
  canCreate: boolean;
  onSelectInteraction: (id: string) => void;
  onDraft: () => void;
}) {
  if (!canCreate) {
    return <SalesViewerReadOnlyNotice action="إنشاء مسودات متابعة" />;
  }

  return (
    <div className="space-y-3 border-t pt-4">
      {interactions.length > 0 ? (
        <div className="space-y-1">
          <label
            htmlFor="followUpInteraction"
            className="text-sm font-medium"
          >
            التفاعل المصدر (اختياري — الافتراضي: الأحدث)
          </label>
          <select
            id="followUpInteraction"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            disabled={loading}
            value={selectedInteractionId}
            onChange={(e) => onSelectInteraction(e.target.value)}
          >
            <option value="">آخر تفاعل</option>
            {interactions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.type}
                {item.subject ? ` — ${item.subject}` : ""}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          أضف تفاعلاً (اجتماع/ملاحظة) قبل إنشاء مسودة متابعة.
        </p>
      )}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button
        type="button"
        size="sm"
        disabled={loading || interactions.length === 0}
        className="gap-1"
        onClick={onDraft}
      >
        {loading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        إنشاء مسودة متابعة (Stub)
      </Button>
    </div>
  );
}
