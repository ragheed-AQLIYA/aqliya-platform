"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, Send } from "lucide-react";

export function MemoSubmitActions({
  submitting,
  evidenceCount,
  onSubmit,
}: {
  submitting: boolean;
  evidenceCount: number;
  onSubmit: (markDecided: boolean) => Promise<void>;
}) {
  const disabled = submitting || evidenceCount === 0;

  return (
    <div className="flex flex-wrap gap-2 border-t pt-4">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={disabled}
        className="gap-1"
        onClick={() => onSubmit(false)}
      >
        <Send className="h-4 w-4" />
        {submitting ? "جارٍ الإرسال..." : "إرسال للتسليم (يتطلب أدلة)"}
      </Button>
      <Button
        type="button"
        size="sm"
        disabled={disabled}
        className="gap-1"
        onClick={() => onSubmit(true)}
      >
        <CheckCircle2 className="h-4 w-4" />
        {submitting ? "جارٍ التسجيل..." : "تسجيل قرار التحويل"}
      </Button>
    </div>
  );
}
