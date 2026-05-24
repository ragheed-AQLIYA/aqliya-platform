"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { uploadLocalContentEvidenceFileAction } from "@/actions/localcontent-actions";
import { Upload, CheckCircle2, XCircle, FileText } from "lucide-react";

interface EvidenceFileUploadFormProps {
  projectId: string;
  suppliers: { id: string; name: string }[];
  onSuccess?: () => void;
}

function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تنفيذ هذا الإجراء";
  }
  return error || "حدث خطأ في الرفع";
}

const EVIDENCE_TYPE_LABELS: Record<string, string> = {
  certificate: "شهادة محتوى محلي",
  contract: "عقد",
  attestation: "إقرار",
  invoice: "فاتورة",
  registration: "سجل تجاري",
  other: "أخرى",
};

export function EvidenceFileUploadForm({
  projectId,
  suppliers,
  onSuccess,
}: EvidenceFileUploadFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    id: string;
    filename: string;
    mimeType?: string;
    sizeBytes?: number;
    fileHash?: string;
    evidenceType: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await uploadLocalContentEvidenceFileAction(
        projectId,
        formData,
      );
      if (res.ok) {
        const evidence = res.data as {
          id: string;
          filename: string;
          storageKey: string;
        };
        const file = formData.get("file") as File | null;
        setResult({
          id: evidence.id,
          filename: evidence.filename,
          mimeType: file?.type,
          sizeBytes: file?.size,
          fileHash: undefined,
          evidenceType: (formData.get("evidenceType") as string) || "other",
        });
        setOpen(false);
        setResult(null);
        router.refresh();
        onSuccess?.();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ في الرفع");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1"
      >
        <Upload className="h-4 w-4" />
        رفع ملف دليل
      </Button>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">رفع ملف دليل</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="file">الملف</Label>
            <input
              id="file"
              name="file"
              type="file"
              ref={fileInputRef as React.RefObject<HTMLInputElement>}
              required
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
              accept=".pdf,.xlsx,.xls,.docx,.doc,.jpg,.jpeg,.png,.csv,.txt"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              PDF, Excel, Word, صور, CSV, نص (الأقصى ١٠ ميغابايت)
            </p>
          </div>

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

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <XCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {result && (
            <div className="rounded-md bg-green-50 dark:bg-green-950 p-3 text-xs space-y-2">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle2 className="h-4 w-4" />
                تم رفع الملف بنجاح
              </div>
              <div className="space-y-1 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="font-mono">{result.filename}</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {result.mimeType && (
                    <Badge variant="outline" className="text-[10px]">
                      {result.mimeType}
                    </Badge>
                  )}
                  {result.sizeBytes != null && (
                    <Badge variant="outline" className="text-[10px]">
                      {(result.sizeBytes / 1024).toFixed(1)}KB
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px] bg-muted">
                    {EVIDENCE_TYPE_LABELS[result.evidenceType] ||
                      result.evidenceType}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200"
                  >
                    مخزن بأمان
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="flex items-center gap-1"
            >
              <Upload className="h-4 w-4" />
              {loading ? "جارٍ الرفع..." : "رفع"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setResult(null);
                setError(null);
              }}
            >
              إغلاق
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
