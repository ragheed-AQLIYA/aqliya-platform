"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSalesDealAction } from "@/actions/sales-actions";

export interface SalesAccountOption {
  id: string;
  name: string;
}

export interface SalesStageOption {
  id: string;
  name: string;
}

export function CreateDealForm({
  accounts,
  stages,
}: {
  accounts: SalesAccountOption[];
  stages: SalesStageOption[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await createSalesDealAction(new FormData(e.currentTarget));
      if (res.ok) {
        router.push(`/sales/deals/${res.data.id}`);
        router.refresh();
      } else {
        setError(res.error || "تعذر إنشاء الصفقة");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إنشاء الصفقة");
    } finally {
      setLoading(false);
    }
  }

  if (accounts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground rounded-lg border p-4">
        لا توجد حسابات في المؤسسة. شغّل{" "}
        <code className="text-xs">tsx scripts/seed-sales-demo.ts</code> بعد
        تطبيق migration.
      </p>
    );
  }

  return (
    <form
      className="space-y-4 max-w-lg border rounded-lg p-4"
      onSubmit={onFormSubmit}
      dir="rtl"
    >
      <h2 className="font-semibold text-sm">صفقة جديدة</h2>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div>
        <Label htmlFor="title">عنوان الصفقة</Label>
        <Input id="title" name="title" required dir="auto" />
      </div>
      <div>
        <Label htmlFor="accountId">الحساب</Label>
        <select
          id="accountId"
          name="accountId"
          required
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          defaultValue=""
        >
          <option value="" disabled>
            اختر حساباً
          </option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
      {stages.length > 0 ? (
        <div>
          <Label htmlFor="stageId">المرحلة (اختياري)</Label>
          <select
            id="stageId"
            name="stageId"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            defaultValue=""
          >
            <option value="">— بدون مرحلة —</option>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div>
        <Label htmlFor="amount">المبلغ (اختياري)</Label>
        <Input id="amount" name="amount" type="number" min={0} step="0.01" />
      </div>
      <input type="hidden" name="currency" value="SAR" />
      <Button type="submit" disabled={loading}>
        {loading ? "جاري الحفظ…" : "إنشاء الصفقة"}
      </Button>
    </form>
  );
}
