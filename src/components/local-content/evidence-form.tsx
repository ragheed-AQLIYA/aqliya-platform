"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ActionResult = { ok: boolean; error?: string; code?: string };

function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تنفيذ هذا الإجراء";
  }
  return error || "حدث خطأ";
}

interface EvidenceFormProps {
  projectId: string;
  suppliers: { id: string; name: string }[];
  createAction: (
    projectId: string,
    formData: FormData,
  ) => Promise<ActionResult>;
  onSuccess?: () => void;
}

export function EvidenceForm({
  projectId,
  suppliers,
  createAction,
  onSuccess,
}: EvidenceFormProps) {
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
        إضافة دليل
      </Button>
    );

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">دليل جديد</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="filename">اسم الملف</Label>
            <Input id="filename" name="filename" required className="h-9" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="evidenceType">نوع الدليل</Label>
              <select
                id="evidenceType"
                name="evidenceType"
                required
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="">اختر...</option>
                <option value="certificate">شهادة محتوى محلي</option>
                <option value="contract">عقد</option>
                <option value="attestation">إقرار</option>
                <option value="invoice">فاتورة</option>
                <option value="registration">سجل تجاري</option>
                <option value="other">أخرى</option>
              </select>
            </div>
            <div>
              <Label htmlFor="fileType">نوع الملف</Label>
              <select
                id="fileType"
                name="fileType"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="pdf">PDF</option>
                <option value="xlsx">Excel</option>
                <option value="docx">Word</option>
                <option value="jpg">صورة</option>
                <option value="csv">CSV</option>
                <option value="txt">نص</option>
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="supplierId">مرتبط بمورد (اختياري)</Label>
            <select
              id="supplierId"
              name="supplierId"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="">بدون</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
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

const EVIDENCE_TYPE_LABELS: Record<string, string> = {
  certificate: "شهادة",
  contract: "عقد",
  attestation: "إقرار",
  invoice: "فاتورة",
  registration: "سجل تجاري",
};

const STATUS_LABELS: Record<string, string> = {
  uploaded: "مرفوع",
  linked: "مرتبط",
  reviewed: "مراجع",
  verified: "موثق",
  rejected: "مرفوض",
  missing: "مفقود",
};

const STATUS_COLORS: Record<string, string> = {
  verified: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
  reviewed: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  uploaded:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
  linked: "bg-muted",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  missing: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
};

export function EvidenceStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={STATUS_COLORS[status] || ""}>
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}

export function EvidenceTypeBadge({ type }: { type: string }) {
  return (
    <Badge variant="outline" className="bg-muted">
      {EVIDENCE_TYPE_LABELS[type] || type}
    </Badge>
  );
}
