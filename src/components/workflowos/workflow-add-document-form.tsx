"use client";

import { useState, useRef } from "react";
import { workflow_uploadDocument } from "@/actions/workflowos-actions";
import { Loader2, Plus, Upload } from "lucide-react";

export function WorkflowAddDocumentForm({
  clientId,
  recordId,
  recordStatus,
  userRole,
  onAdded,
}: {
  clientId: string;
  recordId: string;
  recordStatus: string;
  userRole: string | null;
  onAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const canAdd =
    (userRole === "Operator" || userRole === "PlatformAdmin") &&
    recordStatus === "Draft";
  const canOverride =
    userRole === "PlatformAdmin" && recordStatus === "UnderReview";

  if (!canAdd && !canOverride) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setSubmitting(true);
    setError(null);

    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      const result = await workflow_uploadDocument(clientId, recordId, {
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        contentBase64: base64,
      });

      if (result.success) {
        setFile(null);
        setOpen(false);
        if (inputRef.current) inputRef.current.value = "";
        onAdded();
      } else {
        setError(result.error ?? "فشل رفع المستند");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل قراءة الملف");
    }

    setSubmitting(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs font-medium hover:bg-muted transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        رفع مستند
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border bg-card p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold">رفع مستند جديد</h3>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[10px] text-muted-foreground hover:text-foreground"
        >
          إلغاء
        </button>
      </div>

      <div>
        <label className="block text-[10px] font-medium text-muted-foreground mb-1">
          الملف *
        </label>
        <input
          ref={inputRef}
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-xs file:mr-2 file:rounded-md file:border-0 file:bg-primary/10 file:px-2 file:py-1 file:text-xs file:font-medium file:text-primary hover:file:bg-primary/20"
          required
          accept=".pdf,.xlsx,.xls,.docx,.jpg,.jpeg,.png,.csv"
        />
        <div className="mt-1 text-[9px] text-muted-foreground">
          PDF, XLSX, DOCX, JPG, PNG, CSV — الحد الأقصى ٢٠ ميغابايت
        </div>
      </div>

      {file && (
        <div className="rounded-md bg-muted/50 p-2 text-[10px] text-muted-foreground">
          {file.name} — {(file.size / 1024).toFixed(1)} KB
        </div>
      )}

      {error && (
        <div className="rounded-md bg-status-error/10 p-2 text-[10px] text-status-error">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || !file}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
          {submitting ? "جاري الرفع..." : "رفع"}
        </button>
      </div>
    </form>
  );
}
