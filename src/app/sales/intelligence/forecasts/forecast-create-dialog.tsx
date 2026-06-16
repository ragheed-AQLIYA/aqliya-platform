"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { createForecastAction } from "../actions";
import type { ForecastPeriod } from "@/lib/platform/sales-intelligence";

export function ForecastCreateDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      const form = new FormData(e.currentTarget);
      const name = form.get("name") as string;
      const period = form.get("period") as ForecastPeriod;
      const periodStart = form.get("periodStart") as string;
      const periodEnd = form.get("periodEnd") as string;
      const expectedRevenue = parseFloat(
        (form.get("expectedRevenue") as string) || "0",
      );
      const confidenceRaw = form.get("confidencePct") as string;
      const confidencePct = confidenceRaw
        ? parseFloat(confidenceRaw)
        : undefined;
      const notes = (form.get("notes") as string) || undefined;

      const result = await createForecastAction({
        name,
        period,
        periodStart,
        periodEnd,
        expectedRevenue,
        confidencePct,
        notes,
      });
      setLoading(false);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setOpen(false);
      router.refresh();
    },
    [router],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        توقع جديد
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>إنشاء توقع جديد</DialogTitle>
          <DialogDescription>
            أدخل تفاصيل التوقع — سيتم حسابه من صفقات المسار لاحقًا.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">الاسم *</label>
            <Input name="name" required placeholder="اسم التوقع" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">الفترة *</label>
              <Select name="period" defaultValue="MONTHLY">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">شهري</SelectItem>
                  <SelectItem value="QUARTERLY">ربعي</SelectItem>
                  <SelectItem value="YEARLY">سنوي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">نسبة الثقة</label>
              <Input
                name="confidencePct"
                type="number"
                min="0"
                max="100"
                placeholder="مثل: 80"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">تاريخ البداية *</label>
              <Input name="periodStart" type="date" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">تاريخ النهاية *</label>
              <Input name="periodEnd" type="date" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              الإيرادات المتوقعة *
            </label>
            <Input
              name="expectedRevenue"
              type="number"
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">ملاحظات</label>
            <Textarea name="notes" rows={2} placeholder="ملاحظات اختيارية" />
          </div>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              إنشاء
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
