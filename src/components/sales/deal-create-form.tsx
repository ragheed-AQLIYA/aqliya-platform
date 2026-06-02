"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSalesDealAction } from "@/actions/sales-actions";
import type { CreateSalesDealInput } from "@/lib/sales/validation";
import { Plus, XCircle, Briefcase } from "lucide-react";

type AccountOption = { id: string; name: string };
type StageOption = { id: string; name: string };

function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تنفيذ هذا الإجراء";
  }
  if (code === "VALIDATION") {
    return error.replace(/^SalesOS validation:\s*/i, "");
  }
  return error || "حدث خطأ في إنشاء الصفقة";
}

export function DealCreateForm({
  accounts,
  stages,
  redirectOnSuccess = true,
}: {
  accounts: AccountOption[];
  stages: StageOption[];
  redirectOnSuccess?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    try {
      const input: CreateSalesDealInput = {
        title: String(formData.get("title") ?? ""),
        accountId: String(formData.get("accountId") ?? ""),
        stageId: String(formData.get("stageId") || "").trim() || null,
        amount: formData.get("amount") ? Number(formData.get("amount")) : null,
        currency: String(formData.get("currency") ?? "SAR"),
      };
      const res = await createSalesDealAction(input);
      if (res.ok) {
        if (redirectOnSuccess) {
          router.push(`/sales/deals/${res.data.id}`);
        } else {
          router.refresh();
        }
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ في إنشاء الصفقة");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          صفقة جديدة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="title">عنوان الصفقة</Label>
            <Input
              id="title"
              name="title"
              required
              className="h-9"
              placeholder="مثال: توسعة عقد Enterprise — Q3"
            />
          </div>

          <div>
            <Label htmlFor="accountId">الحساب</Label>
            <select
              id="accountId"
              name="accountId"
              required
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              defaultValue=""
            >
              <option value="" disabled>
                اختر حساباً
              </option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="stageId">المرحلة (اختياري)</Label>
            <select
              id="stageId"
              name="stageId"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              defaultValue=""
            >
              <option value="">بدون مرحلة</option>
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="amount">القيمة (اختياري)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="1"
                className="h-9"
                placeholder="500000"
              />
            </div>
            <div>
              <Label htmlFor="currency">العملة</Label>
              <Input
                id="currency"
                name="currency"
                defaultValue="SAR"
                className="h-9"
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <XCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={loading || accounts.length === 0}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              {loading ? "جارٍ الإنشاء..." : "إنشاء الصفقة"}
            </Button>
          </div>

          {accounts.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              لا توجد حسابات — شغّل `tsx scripts/seed-sales-demo.ts` أو أنشئ
              حسابات في PR لاحق.
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
