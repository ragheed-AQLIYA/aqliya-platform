"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSalesAccountAction } from "@/actions/sales-actions";
import { Plus, XCircle, Building2 } from "lucide-react";

function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تنفيذ هذا الإجراء";
  }
  if (code === "VALIDATION") {
    return error.replace(/^SalesOS validation:\s*/i, "");
  }
  return error || "حدث خطأ في إنشاء الحساب";
}

export function AccountCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    try {
      const res = await createSalesAccountAction(formData);
      if (res.ok) {
        router.push(`/sales/accounts/${res.data.id}`);
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ في إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          حساب جديد
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="name">اسم الحساب</Label>
            <Input
              id="name"
              name="name"
              required
              className="h-9"
              placeholder="مثال: شركة التقنية المتقدمة"
            />
          </div>

          <div>
            <Label htmlFor="industry">القطاع (اختياري)</Label>
            <Input
              id="industry"
              name="industry"
              className="h-9"
              placeholder="technology"
            />
          </div>

          {error ? (
            <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <XCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}

          <Button type="submit" size="sm" disabled={loading} className="gap-1">
            <Plus className="h-4 w-4" />
            {loading ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
