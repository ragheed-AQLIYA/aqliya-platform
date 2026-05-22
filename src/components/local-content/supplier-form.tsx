"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SupplierFormProps {
  projectId: string;
  createAction: (projectId: string, formData: FormData) => Promise<unknown>;
  onSuccess?: () => void;
}

export function SupplierForm({
  projectId,
  createAction,
  onSuccess,
}: SupplierFormProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    try {
      await createAction(projectId, formData);
      setOpen(false);
      onSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ");
    }
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        إضافة مورد
      </Button>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">مورد جديد</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="name">اسم المورد</Label>
            <Input id="name" name="name" required className="h-9" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="crNumber">رقم السجل التجاري</Label>
              <Input id="crNumber" name="crNumber" className="h-9" />
            </div>
            <div>
              <Label htmlFor="localityClassification">تصنيف المحلية</Label>
              <select
                id="localityClassification"
                name="localityClassification"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="">غير محدد</option>
                <option value="local">محلي</option>
                <option value="non_local">غير محلي</option>
                <option value="mixed">مشترك</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ownershipType">نوع الملكية</Label>
              <select
                id="ownershipType"
                name="ownershipType"
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
              />
            </div>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm">
              حفظ
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
