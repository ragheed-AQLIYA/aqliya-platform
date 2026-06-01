"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateDealNextActionAction } from "@/actions/sales-actions";
import { CalendarClock, RefreshCw } from "lucide-react";

function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تحديث الإجراء التالي";
  }
  if (code === "VALIDATION") {
    return error.replace(/^SalesOS validation:\s*/i, "");
  }
  return error || "تعذر تحديث الإجراء التالي";
}

function toDatetimeLocalValue(d: Date | null): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DealNextActionForm({
  dealId,
  nextAction,
  nextActionAt,
}: {
  dealId: string;
  nextAction: string | null;
  nextActionAt: Date | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await updateDealNextActionAction(dealId, formData);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "تعذر تحديث الإجراء التالي",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {nextAction ? (
        <div className="rounded-md border bg-muted/30 p-3 text-sm">
          <p className="font-medium flex items-center gap-1">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            {nextAction}
          </p>
          {nextActionAt ? (
            <p className="text-xs text-muted-foreground mt-1">
              موعد: {nextActionAt.toLocaleString("ar-SA")}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">لم يُحدد إجراء تالي بعد.</p>
      )}

      <form action={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="nextAction">الإجراء التالي</Label>
          <Input
            id="nextAction"
            name="nextAction"
            defaultValue={nextAction ?? ""}
            placeholder="مثال: متابعة العرض التجاري"
          />
        </div>
        <div>
          <Label htmlFor="nextActionAt">الموعد (اختياري)</Label>
          <Input
            id="nextActionAt"
            name="nextActionAt"
            type="datetime-local"
            defaultValue={toDatetimeLocalValue(nextActionAt)}
          />
        </div>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <Button type="submit" size="sm" disabled={loading} className="gap-1">
          <RefreshCw className="h-4 w-4" />
          {loading ? "جارٍ الحفظ..." : "حفظ الإجراء التالي"}
        </Button>
      </form>
    </div>
  );
}
