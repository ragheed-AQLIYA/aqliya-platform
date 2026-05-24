"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ActionResult = { ok: boolean; error?: string; code?: string };

type SupplierAction = (
  projectId: string,
  formData: FormData,
) => Promise<ActionResult>;

type SupplierUpdateAction = (
  projectId: string,
  supplierId: string,
  formData: FormData,
) => Promise<ActionResult>;

type SupplierInitialValues = {
  name: string;
  crNumber?: string | null;
  localityClassification?: string | null;
  ownershipType?: string | null;
  localContentPercentage?: number | null;
  workforceLocalPct?: number | null;
};

function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تنفيذ هذا الإجراء";
  }
  return error || "حدث خطأ";
}

interface SupplierFormProps {
  projectId: string;
  createAction?: SupplierAction;
  updateAction?: SupplierUpdateAction;
  supplierId?: string;
  initialValues?: SupplierInitialValues;
  buttonLabel?: string;
  title?: string;
  submitLabel?: string;
  triggerVariant?: "default" | "outline";
  onSuccess?: () => void;
}

export function SupplierForm({
  projectId,
  createAction,
  updateAction,
  supplierId,
  initialValues,
  buttonLabel,
  title,
  submitLabel,
  triggerVariant,
  onSuccess,
}: SupplierFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isUpdateMode = Boolean(updateAction && supplierId);

  const resolvedButtonLabel =
    buttonLabel || (isUpdateMode ? "تعديل المورد" : "إضافة مورد");
  const resolvedTitle =
    title || (isUpdateMode ? "تحديث بيانات المورد" : "مورد جديد");
  const resolvedSubmitLabel =
    submitLabel || (isUpdateMode ? "حفظ التعديلات" : "حفظ");

  async function handleSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    try {
      const res = isUpdateMode
        ? await updateAction!(projectId, supplierId!, formData)
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

  if (!open) {
    return (
      <Button
        size="sm"
        variant={triggerVariant || (isUpdateMode ? "outline" : "default")}
        onClick={() => setOpen(true)}
      >
        {resolvedButtonLabel}
      </Button>
    );
  }

  return (
    <Card className={isUpdateMode ? undefined : "mb-6"}>
      <CardHeader>
        <CardTitle className="text-base">{resolvedTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="name">اسم المورد</Label>
            <Input
              id="name"
              name="name"
              required
              className="h-9"
              defaultValue={initialValues?.name || ""}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="crNumber">رقم السجل التجاري</Label>
              <Input
                id="crNumber"
                name="crNumber"
                className="h-9"
                defaultValue={initialValues?.crNumber || ""}
              />
            </div>
            <div>
              <Label htmlFor="localityClassification">تصنيف المحلية</Label>
              <select
                id="localityClassification"
                name="localityClassification"
                defaultValue={initialValues?.localityClassification || ""}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="">غير محدد</option>
                <option value="local">محلي</option>
                <option value="non_local">غير محلي</option>
                <option value="mixed">مشترك</option>
                <option value="unclassified">غير مصنف</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ownershipType">نوع الملكية</Label>
              <select
                id="ownershipType"
                name="ownershipType"
                defaultValue={initialValues?.ownershipType || ""}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="">غير محدد</option>
                <option value="Saudi">سعودي</option>
                <option value="foreign">أجنبي</option>
                <option value="joint_venture">مشروع مشترك</option>
              </select>
            </div>
            <div>
              <Label htmlFor="localContentPercentage">نسبة المحتوى %</Label>
              <Input
                id="localContentPercentage"
                name="localContentPercentage"
                type="number"
                min="0"
                max="100"
                className="h-9"
                defaultValue={initialValues?.localContentPercentage ?? ""}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="workforceLocalPct">نسبة السعودة %</Label>
            <Input
              id="workforceLocalPct"
              name="workforceLocalPct"
              type="number"
              min="0"
              max="100"
              className="h-9"
              defaultValue={initialValues?.workforceLocalPct ?? ""}
            />
          </div>
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
