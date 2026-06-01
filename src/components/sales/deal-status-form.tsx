"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSalesDealAction } from "@/actions/sales-actions";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";

function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تحديث حالة الصفقة";
  }
  if (code === "VALIDATION") {
    return error.replace(/^SalesOS validation:\s*/i, "");
  }
  return error || "تعذر تحديث الحالة";
}

export function DealStatusForm({
  dealId,
  currentStatus,
}: {
  dealId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>("");

  const isTerminal = currentStatus === "won" || currentStatus === "lost";

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    try {
      const res = await updateSalesDealAction(dealId, formData);
      if (res.ok) {
        setTargetStatus("");
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحديث الحالة");
    } finally {
      setLoading(false);
    }
  }

  if (isTerminal) {
    return (
      <p className="text-sm text-muted-foreground">
        الصفقة في حالة نهائية ({currentStatus}). لا يمكن إعادة فتحها من P0.
      </p>
    );
  }

  const needsReason = targetStatus === "won" || targetStatus === "lost";

  return (
    <form action={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="status">حالة الصفقة</Label>
        <select
          id="status"
          name="status"
          value={targetStatus}
          onChange={(e) => setTargetStatus(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="" disabled>
            اختر الحالة
          </option>
          <option value="open">مفتوحة</option>
          <option value="won">فوز</option>
          <option value="lost">خسارة</option>
          <option value="archived">مؤرشفة</option>
        </select>
      </div>

      {needsReason ? (
        <div>
          <Label htmlFor="statusReason">سبب الفوز/الخسارة (مطلوب)</Label>
          <Input
            id="statusReason"
            name="statusReason"
            required
            className="h-9"
            placeholder="مثال: توقيع العقد — Q3"
          />
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <XCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <Button
        type="submit"
        size="sm"
        disabled={loading || !targetStatus}
        className="gap-1"
      >
        {targetStatus === "won" ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        {loading ? "جارٍ الحفظ..." : "تحديث الحالة"}
      </Button>
    </form>
  );
}
