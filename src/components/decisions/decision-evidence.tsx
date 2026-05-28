"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getDecisionEvidenceAction,
  uploadDecisionEvidenceAction,
  deleteDecisionEvidenceAction,
} from "@/actions/decision-evidence-actions";

interface DecisionEvidenceItem {
  id: string;
  decisionId: string;
  filename: string;
  fileType: string;
  fileSize: number;
  fileHash: string | null;
  description: string | null;
  createdAt: string;
}

interface DecisionEvidenceProps {
  decisionId: string;
}

const FILE_TYPE_BADGES: Record<string, string> = {
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DecisionEvidence({ decisionId }: DecisionEvidenceProps) {
  const [evidence, setEvidence] = useState<DecisionEvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvidence();
  }, [decisionId]);

  async function loadEvidence() {
    setLoading(true);
    const result = await getDecisionEvidenceAction(decisionId);
    if (result.success) {
      setEvidence(result.data as unknown as DecisionEvidenceItem[]);
    }
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
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
    const result = await deleteDecisionEvidenceAction(evidenceId);
    if (result.success) {
      setEvidence((prev) => prev.filter((e) => e.id !== evidenceId));
    } else {
      setError(result.error || "فشل الحذف");
    }
  }

  return (
    <section className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">المستندات والأدلة</h2>
        <Badge variant="outline">{evidence.length}</Badge>
      </div>

      {error && (
        <div className="mb-3 rounded bg-destructive/10 p-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mb-3">
        <Button
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() =>
            document.getElementById("evidence-upload-input")?.click()
          }
        >
          {uploading ? "جاري الرفع..." : "+ إضافة مستند"}
        </Button>
        <input
          id="evidence-upload-input"
          type="file"
          className="hidden"
          onChange={handleUpload}
          accept=".pdf,.xlsx,.xls,.docx,.doc,.jpg,.jpeg,.png,.csv,.txt"
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">جاري التحميل...</p>
      ) : evidence.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          لا توجد مستندات أدلة بعد. أضف مستندات لدعم القرار.
        </p>
      ) : (
        <div className="space-y-2">
          {evidence.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 rounded border p-2 text-sm"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Badge
                  variant={
                    (FILE_TYPE_BADGES[item.fileType] || "outline") as
                      | "default"
                      | "secondary"
                      | "outline"
                  }
                >
                  {item.fileType.toUpperCase()}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(item.fileSize)}
                    {item.description && ` — ${item.description}`}
                    {item.fileHash && ` — 🧾 ${item.fileHash}`}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive shrink-0"
                onClick={() => handleDelete(item.id)}
              >
                حذف
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
