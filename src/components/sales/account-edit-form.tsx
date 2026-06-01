"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSalesAccountAction } from "@/actions/sales-actions";
import { RefreshCw, XCircle } from "lucide-react";

function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تحديث الحساب";
  }
  if (code === "VALIDATION") {
    return error.replace(/^SalesOS validation:\s*/i, "");
  }
  return error || "تعذر تحديث الحساب";
}

export function AccountEditForm({
  accountId,
  name,
  industry,
  status,
}: {
  accountId: string;
  name: string;
  industry: string | null;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    try {
      const res = await updateSalesAccountAction(accountId, formData);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحديث الحساب");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="name">اسم الحساب</Label>
        <Input id="name" name="name" defaultValue={name} required className="h-9" />
      </div>

      <div>
        <Label htmlFor="industry">القطاع</Label>
        <Input
          id="industry"
          name="industry"
          defaultValue={industry ?? ""}
          className="h-9"
        />
      </div>

      <div>
        <Label htmlFor="status">الحالة</Label>
        <select
          id="status"
          name="status"
          defaultValue={status}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
          <option value="archived">مؤرشف</option>
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
        {loading ? "جارٍ الحفظ..." : "حفظ التعديلات"}
      </Button>
    </form>
  );
}
