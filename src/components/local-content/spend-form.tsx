"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ActionResult = { ok: boolean; error?: string; code?: string };

function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تنفيذ هذا الإجراء";
  }
  return error || "حدث خطأ";
}

interface SpendFormProps {
  projectId: string;
  suppliers: { id: string; name: string }[];
  createAction: (
    projectId: string,
    formData: FormData,
  ) => Promise<ActionResult>;
  onSuccess?: () => void;
}

export function SpendForm({
  projectId,
  suppliers,
  createAction,
  onSuccess,
}: SpendFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    try {
      const res = await createAction(projectId, formData);
      if (!res.ok) {
        setError(formatActionError(res.error ?? "", res.code));
        return;
      }
      setOpen(false);
      router.refresh();
      onSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setPending(false);
    }
  }

  if (!open)
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        إضافة سجل إنفاق
      </Button>
    );

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">سجل إنفاق جديد</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="supplierId">المورد</Label>
            <select
              id="supplierId"
              name="supplierId"
              required
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="">اختر...</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="amount">المبلغ</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                required
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="category">التصنيف</Label>
              <select
                id="category"
                name="category"
                required
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="">اختر...</option>
                <option value="technology">تقنية</option>
                <option value="goods">سلع</option>
                <option value="services">خدمات</option>
                <option value="construction">إنشاءات</option>
                <option value="logistics">لوجستي</option>
                <option value="other">أخرى</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="period">الفترة</Label>
              <Input
                id="period"
                name="period"
                required
                placeholder="Q1"
                className="h-9"
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
          <div>
            <Label htmlFor="contractReference">رقم العقد / أمر الشراء</Label>
            <Input
              id="contractReference"
              name="contractReference"
              className="h-9"
            />
          </div>
          <div>
            <Label htmlFor="description">الوصف</Label>
            <Input id="description" name="description" className="h-9" />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "جارٍ الحفظ..." : "حفظ"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
