"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { scaffoldUploadSalesProofAssetFileAction } from "@/actions/sales-actions";
import {
  SALES_CORE_FILES_ADOPTION_BLOCKER,
  SALES_FILE_BACKED_PROOF_ASSET_TYPES,
} from "@/products/sales/core-adapters/evidence-adapter";

interface ProofAssetFileUploadScaffoldProps {
  organizationId: string;
  proofAssetId: string;
  assetType: string;
  title: string;
}

export function ProofAssetFileUploadScaffold({
  organizationId,
  proofAssetId,
  assetType,
  title,
}: ProofAssetFileUploadScaffoldProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    storageKey: string;
  } | null>(null);

  const fileBacked = (
    SALES_FILE_BACKED_PROOF_ASSET_TYPES as readonly string[]
  ).includes(assetType);

  if (!fileBacked) {
    return null;
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setResult(null);

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      setError("الملف مطلوب");
      setLoading(false);
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          "",
        ),
      );
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";

      const res = await scaffoldUploadSalesProofAssetFileAction({
        organizationId,
        proofAssetId,
        filename: file.name,
        fileType: ext,
        fileDataBase64: base64,
      });

      if (!res.ok) {
        setError(res.error);
      } else if (res.data.ok) {
        setResult({
          storageKey: res.data.storageKey,
        });
        router.refresh();
      } else {
        setError(res.data.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل الرفع");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="mt-1 h-7 gap-1 px-2 text-xs"
        onClick={() => setOpen(true)}
      >
        <Upload className="h-3 w-3" />
        رفع ملف (مسودة)
      </Button>
    );
  }

  return (
    <div className="mt-2 rounded-md border border-dashed border-border/70 bg-muted/20 p-2 space-y-2">
      <p className="text-[10px] text-muted-foreground">{title}</p>

      <div className="flex items-start gap-1.5 rounded border border-amber-300/80 bg-amber-50/80 p-1.5 text-[10px] text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
        <span>{SALES_CORE_FILES_ADOPTION_BLOCKER}</span>
      </div>

      <form action={handleSubmit} className="space-y-2">
        <div>
          <Label htmlFor={`proof-file-${proofAssetId}`} className="text-xs">
            الملف
          </Label>
          <input
            id={`proof-file-${proofAssetId}`}
            name="file"
            type="file"
            ref={fileInputRef}
            required
            accept=".pdf,.mp4,.docx,.xlsx"
            className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs file:border-0 file:bg-transparent file:text-xs"
          />
        </div>

        {error && (
          <p className="text-[10px] text-red-600 dark:text-red-400">{error}</p>
        )}

        {result && (
          <p className="text-[10px] font-mono text-green-700 dark:text-green-300">
            مُخزَّن: {result.storageKey}
          </p>
        )}

        <div className="flex gap-1">
          <Button type="submit" size="sm" className="h-7 text-xs" disabled={loading}>
            {loading ? "..." : "رفع"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => {
              setOpen(false);
              setError(null);
              setResult(null);
            }}
          >
            إغلاق
          </Button>
        </div>
      </form>
    </div>
  );
}
