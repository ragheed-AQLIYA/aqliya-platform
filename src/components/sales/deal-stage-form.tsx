"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateSalesDealAction } from "@/actions/sales-actions";
import type { UpdateSalesDealInput } from "@/lib/sales/validation";
import { XCircle, RefreshCw } from "lucide-react";

type StageOption = { id: string; name: string };

function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تحديث المرحلة";
  }
  if (code === "VALIDATION") {
    return error.replace(/^SalesOS validation:\s*/i, "");
  }
  return error || "تعذر تحديث المرحلة";
}

export function DealStageForm({
  dealId,
  currentStageId,
  stages,
}: {
  dealId: string;
  currentStageId: string | null;
  stages: StageOption[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    try {
      const input: UpdateSalesDealInput = {
        stageId: String(formData.get("stageId") ?? "").trim() || null,
      };
      const res = await updateSalesDealAction(dealId, input);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحديث المرحلة");
    } finally {
      setLoading(false);
    }
  }

  if (stages.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        لا توجد مراحل مسار — طبّق migration و seed.
      </p>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="stageId">مرحلة المسار</Label>
        <select
          id="stageId"
          name="stageId"
          defaultValue={currentStageId ?? ""}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="">بدون مرحلة</option>
          {stages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.name}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <XCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <Button type="submit" size="sm" disabled={loading} className="gap-1">
        <RefreshCw className="h-4 w-4" />
        {loading ? "جارٍ الحفظ..." : "تحديث المرحلة"}
      </Button>
    </form>
  );
}
