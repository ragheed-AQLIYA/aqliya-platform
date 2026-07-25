"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Loader2 } from "lucide-react";

import type { Reviewer } from "./types";

interface AssignReviewerFormProps {
  availableReviewers: Reviewer[];
  loading: string | null;
  selectedReviewer: string;
  reviewType: string;
  reason: string;
  dueDate: string;
  onSelectedReviewerChange: (value: string) => void;
  onReviewTypeChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onAssign: (reviewerId: string, type: string, reason: string | undefined, dueDate: string | undefined) => void;
}

export function AssignReviewerForm({
  availableReviewers,
  loading,
  selectedReviewer,
  reviewType,
  reason,
  dueDate,
  onSelectedReviewerChange,
  onReviewTypeChange,
  onReasonChange,
  onDueDateChange,
  onAssign,
}: AssignReviewerFormProps) {
  return (
    <details className="border rounded-lg p-3">
      <summary className="cursor-pointer font-medium text-sm text-muted-foreground hover:text-foreground">
        <UserPlus className="inline ml-1 h-4 w-4" />
        تعيين مراجع جديد
      </summary>
      <div className="mt-3 space-y-3">
        <div>
          <label className="text-sm font-medium">المراجع</label>
          <select
            value={selectedReviewer}
            onChange={(e) => onSelectedReviewerChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
          >
            <option value="">اختر مراجع...</option>
            {availableReviewers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">نوع المراجعة</label>
          <select
            value={reviewType}
            onChange={(e) => onReviewTypeChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
          >
            <option value="sensitivity">مراجعة حساسية</option>
            <option value="accuracy">مراجعة دقة</option>
            <option value="completeness">مراجعة اكتمال</option>
            <option value="custom">مخصص</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">السبب</label>
          <Textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="سبب المراجعة"
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">تاريخ الاستحقاق</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => onDueDateChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
          />
        </div>
        <Button
          onClick={() => onAssign(selectedReviewer, reviewType, reason || undefined, dueDate || undefined)}
          disabled={loading === "assign" || !selectedReviewer}
          size="sm"
        >
          {loading === "assign" ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <UserPlus className="ml-1 h-4 w-4" />}
          تعيين مراجع
        </Button>
      </div>
    </details>
  );
}
