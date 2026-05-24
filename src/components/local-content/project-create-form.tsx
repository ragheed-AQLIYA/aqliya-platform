"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createLocalContentProjectAction } from "@/actions/localcontent-actions";
import { Plus, XCircle, CheckCircle2, Building2 } from "lucide-react";

function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تنفيذ هذا الإجراء";
  }
  return error || "حدث خطأ في إنشاء المشروع";
}

export function ProjectCreateForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setCreated(null);

    try {
      const res = await createLocalContentProjectAction(formData);
      if (res.ok) {
        const project = res.data as { id: string; name: string };
        setCreated(project.name);
        router.refresh();
        onSuccess?.();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ في إنشاء المشروع");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1"
      >
        <Plus className="h-4 w-4" />
        إنشاء مشروع
      </Button>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          مشروع تقييم محتوى محلي جديد
        </CardTitle>
      </CardHeader>
      <CardContent>
        {created ? (
          <div className="rounded-md bg-green-50 dark:bg-green-950 p-4 text-sm space-y-2">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-4 w-4" />
              تم إنشاء المشروع بنجاح
            </div>
            <p className="text-muted-foreground">
              اسم المشروع: <span className="font-medium">{created}</span>
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setCreated(null);
                setError(null);
              }}
            >
              إغلاق
            </Button>
          </div>
        ) : (
          <form action={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="name">اسم المشروع</Label>
              <Input
                id="name"
                name="name"
                required
                className="h-9"
                placeholder="مثال: تقييم المحتوى المحلي FY2026 — شركة التقنية"
              />
            </div>
            <div>
              <Label htmlFor="reportingPeriod">الفترة</Label>
              <Input
                id="reportingPeriod"
                name="reportingPeriod"
                required
                className="h-9"
                placeholder="مثال: FY2025"
              />
            </div>
            <div>
              <Label htmlFor="scopeDescription">الوصف والنطاق (اختياري)</Label>
              <textarea
                id="scopeDescription"
                name="scopeDescription"
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="وصف موجز لنطاق التقييم..."
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <XCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={loading}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                {loading ? "جارٍ الإنشاء..." : "إنشاء"}
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
        )}
      </CardContent>
    </Card>
  );
}
