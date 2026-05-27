"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ActionResult = { ok: boolean; error?: string; code?: string };

type FindingAction = (
  projectId: string,
  formData: FormData,
) => Promise<ActionResult>;

type FindingUpdateAction = (
  projectId: string,
  findingId: string,
  formData: FormData,
) => Promise<ActionResult>;

type FindingInitialValues = {
  title: string;
  description: string;
  type: string;
  severity?: string | null;
  status?: string | null;
};

function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تنفيذ هذا الإجراء";
  }
  return error || "حدث خطأ";
}

interface FindingFormProps {
  projectId: string;
  createAction?: FindingAction;
  updateAction?: FindingUpdateAction;
  findingId?: string;
  initialValues?: FindingInitialValues;
  buttonLabel?: string;
  title?: string;
  submitLabel?: string;
  triggerVariant?: "default" | "outline";
  onSuccess?: () => void;
}

export function FindingForm({
  projectId,
  createAction,
  updateAction,
  findingId,
  initialValues,
  buttonLabel,
  title,
  submitLabel,
  triggerVariant,
  onSuccess,
}: FindingFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isUpdateMode = Boolean(updateAction && findingId);

  const resolvedButtonLabel =
    buttonLabel || (isUpdateMode ? "تعديل النتيجة" : "إضافة نتيجة");
  const resolvedTitle =
    title || (isUpdateMode ? "تحديث النتيجة / الفجوة" : "نتيجة / فجوة جديدة");
  const resolvedSubmitLabel =
    submitLabel || (isUpdateMode ? "حفظ التعديلات" : "حفظ");

  async function handleSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    try {
      const res = isUpdateMode
        ? await updateAction!(projectId, findingId!, formData)
        : await createAction!(projectId, formData);
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
      <Button
        size="sm"
        variant={triggerVariant || (isUpdateMode ? "outline" : "default")}
        onClick={() => setOpen(true)}
      >
        {resolvedButtonLabel}
      </Button>
    );

  return (
    <Card className={isUpdateMode ? undefined : "mb-6"}>
      <CardHeader>
        <CardTitle className="text-base">{resolvedTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="title">العنوان</Label>
            <Input
              id="title"
              name="title"
              required
              className="h-9"
              defaultValue={initialValues?.title || ""}
            />
          </div>
          <div>
            <Label htmlFor="description">الوصف</Label>
            <textarea
              id="description"
              name="description"
              required
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              defaultValue={initialValues?.description || ""}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="type">النوع</Label>
              <select
                id="type"
                name="type"
                required
                defaultValue={initialValues?.type || ""}
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
                defaultValue={initialValues?.severity || ""}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="">غير محددة</option>
                <option value="low">منخفضة</option>
                <option value="medium">متوسطة</option>
                <option value="high">عالية</option>
                <option value="critical">حرجة</option>
              </select>
            </div>
          </div>
          {isUpdateMode && (
            <div>
              <Label htmlFor="status">الحالة</Label>
              <select
                id="status"
                name="status"
                defaultValue={initialValues?.status || "draft"}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="draft">مسودة</option>
                <option value="submitted">مقدم</option>
                <option value="reviewed">مراجع</option>
                <option value="resolved">محلول</option>
                <option value="dismissed">مستبعد</option>
              </select>
            </div>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "جارٍ الحفظ..." : resolvedSubmitLabel}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setError(null);
              }}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
