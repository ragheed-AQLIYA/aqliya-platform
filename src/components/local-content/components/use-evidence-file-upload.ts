"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadLocalContentEvidenceFileAction } from "@/actions/localcontent-actions";

interface EvidenceFileUploadResult {
  id: string;
  filename: string;
  mimeType?: string;
  sizeBytes?: number;
  fileHash?: string;
  evidenceType: string;
}

export function useEvidenceFileUpload(
  projectId: string,
  onSuccess?: () => void,
) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvidenceFileUploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function close() {
    setOpen(false);
    setResult(null);
    setError(null);
  }

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

  return {
    open,
    loading,
    error,
    result: result as EvidenceFileUploadResult | null,
    fileInputRef,
    handleSubmit,
    setOpen,
    close,
  };
}

function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تنفيذ هذا الإجراء";
  }
  return error || "حدث خطأ في الرفع";
}
