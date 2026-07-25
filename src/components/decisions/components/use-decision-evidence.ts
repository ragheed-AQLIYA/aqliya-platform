"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getDecisionEvidenceAction,
  uploadDecisionEvidenceAction,
  deleteDecisionEvidenceAction,
} from "@/actions/decision-evidence-actions";

export interface DecisionEvidenceItem {
  id: string;
  decisionId: string;
  filename: string;
  fileType: string;
  fileSize: number;
  fileHash: string | null;
  storageKey: string | null;
  description: string | null;
  createdAt: string;
}

export const FILE_TYPE_BADGES: Record<string, string> = {
  pdf: "default",
  xlsx: "secondary",
  xls: "secondary",
  docx: "outline",
  doc: "outline",
  jpg: "outline",
  jpeg: "outline",
  png: "outline",
  csv: "secondary",
  txt: "secondary",
} as const;

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
export const ALLOWED_FILE_TYPES = [
  "pdf", "xlsx", "xls", "docx", "doc",
  "jpg", "jpeg", "png", "csv", "txt",
];

export function formatEvidenceError(error?: string | null): string {
  if (!error) return "حدث خطأ غير متوقع";
  if (error === "Failed to fetch evidence") {
    return "تعذر تحميل الأدلة المرتبطة بهذا القرار";
  }
  return error;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatEvidenceDate(value: string): string {
  return new Date(value).toLocaleString("ar-SA");
}

export function useDecisionEvidence(decisionId: string) {
  const [evidence, setEvidence] = useState<DecisionEvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadEvidence = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getDecisionEvidenceAction(decisionId);
    if (result.success) {
      setEvidence(result.data as unknown as DecisionEvidenceItem[]);
    } else {
      setError(formatEvidenceError(result.error));
    }
    setLoading(false);
  }, [decisionId]);

  useEffect(() => {
    loadEvidence();
  }, [loadEvidence]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_FILE_TYPES.includes(fileType)) {
      setError(
        `نوع الملف غير مدعوم. الأنواع المسموحة: ${ALLOWED_FILE_TYPES.join(", ")}`,
      );
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(
        `الملف أكبر من الحد المسموح ${(MAX_FILE_SIZE_BYTES / 1024 / 1024).toFixed(0)}MB`,
      );
      e.target.value = "";
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(",")[1];
          const result = await uploadDecisionEvidenceAction({
            decisionId,
            filename: file.name,
            fileType: file.name.split(".").pop() || "unknown",
            fileData: base64,
          });

          if (result.success) {
            await loadEvidence();
          } else {
            setError(result.error || "فشل الرفع");
          }
        } catch {
          setError("تعذر رفع مستند الدعم");
        }
        setUploading(false);
      };
      reader.onerror = () => {
        setError("فشل قراءة الملف");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setError("فشل رفع الملف");
      setUploading(false);
    }

    e.target.value = "";
  }

  async function handleDelete(evidenceId: string) {
    const selected = evidence.find((item) => item.id === evidenceId);
    const confirmed = window.confirm(
      `سيتم حذف مستند الدعم ${selected?.filename || "المحدد"} من هذا القرار. لا يمكن التراجع عن هذا الإجراء.`,
    );

    if (!confirmed) return;

    setDeletingId(evidenceId);
    setError(null);
    try {
      const result = await deleteDecisionEvidenceAction(evidenceId);
      if (result.success) {
        setEvidence((prev) => prev.filter((e) => e.id !== evidenceId));
      } else {
        setError(formatEvidenceError(result.error || "فشل الحذف"));
      }
    } catch {
      setError("تعذر حذف مستند الدعم");
    } finally {
      setDeletingId(null);
    }
  }

  return {
    evidence,
    loading,
    uploading,
    deletingId,
    error,
    setError,
    handleUpload,
    handleDelete,
    loadEvidence,
  };
}
