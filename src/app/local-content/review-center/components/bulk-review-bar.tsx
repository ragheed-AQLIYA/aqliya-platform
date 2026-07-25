"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BulkReviewBarProps {
  selectedCount: number;
  reviewNotes: string;
  onReviewNotesChange: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onClear: () => void;
  processing: boolean;
}

export function BulkReviewBar({
  selectedCount,
  reviewNotes,
  onReviewNotesChange,
  onApprove,
  onReject,
  onClear,
  processing,
}: BulkReviewBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-0 z-10 rounded-lg border bg-background p-3 mb-4 flex items-center gap-3 shadow-sm">
      <span className="text-sm font-medium">
        {selectedCount} مختارة / selected
      </span>
      <Input
        placeholder="ملاحظات جماعية..."
        className="flex-1 h-8 text-sm"
        value={reviewNotes}
        onChange={(e) => onReviewNotesChange(e.target.value)}
      />
      <Button
        size="sm"
        variant="outline"
        onClick={onApprove}
        disabled={processing}
      >
        ✅ اعتماد الكل / Approve All
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onReject}
        disabled={processing}
      >
        ❌ رفض الكل / Reject All
      </Button>
      <Button size="sm" variant="ghost" onClick={onClear}>
        إلغاء / Clear
      </Button>
    </div>
  );
}
