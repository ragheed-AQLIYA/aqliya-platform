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

interface FindingFormProps {
  projectId: string;
  createAction: (
    projectId: string,
    formData: FormData,
  ) => Promise<ActionResult>;
  onSuccess?: () => void;
}

export function FindingForm({
  projectId,
  createAction,
  onSuccess,
}: FindingFormProps) {
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
        إضافة نتيجة
      </Button>
    );

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">نتيجة / فجوة جديدة</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="title">العنوان</Label>
            <Input id="title" name="title" required className="h-9" />
          </div>
          <div>
            <Label htmlFor="description">الوصف</Label>
            <textarea
              id="description"
              name="description"
              required
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="type">النوع</Label>
              <select
                id="type"
                name="type"
                required
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="">اختر...</option>
                <option value="evidence_gap">فجوة أدلة</option>
                <option value="low_content">محتوى محلي منخفض</option>
                <option value="unclassified_supplier">مورد غير مصنف</option>
                <option value="data_quality">جودة بيانات</option>
                <option value="compliance_risk">خطر امتثال</option>
              </select>
            </div>
            <div>
              <Label htmlFor="severity">الشدة</Label>
              <select
                id="severity"
                name="severity"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="medium">متوسطة</option>
                <option value="low">منخفضة</option>
                <option value="high">عالية</option>
                <option value="critical">حرجة</option>
              </select>
            </div>
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
