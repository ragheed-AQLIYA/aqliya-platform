"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getDecisionEvidenceAction,
  uploadDecisionEvidenceAction,
  deleteDecisionEvidenceAction,
} from "@/actions/decision-evidence-actions";
import {
  AlertTriangle,
  Download,
  FileText,
  ShieldCheck,
  Upload,
} from "lucide-react";

interface DecisionEvidenceItem {
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

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "pdf",
  "xlsx",
  "xls",
  "docx",
  "doc",
  "jpg",
  "jpeg",
  "png",
  "csv",
  "txt",
];

function formatEvidenceError(error?: string | null): string {
  if (!error) return "حدث خطأ غير متوقع";
  if (error === "Failed to fetch evidence") {
    return "تعذر تحميل الأدلة المرتبطة بهذا القرار";
  }
  return error;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatEvidenceDate(value: string): string {
  return new Date(value).toLocaleString("ar-SA");
}

export function DecisionEvidence({ decisionId }: DecisionEvidenceProps) {
  const [evidence, setEvidence] = useState<DecisionEvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvidence();
  }, [decisionId]);

  async function loadEvidence() {
    setLoading(true);
    setError(null);
    const result = await getDecisionEvidenceAction(decisionId);
    if (result.success) {
      setEvidence(result.data as unknown as DecisionEvidenceItem[]);
    } else {
      setError(formatEvidenceError(result.error));
    }
    setLoading(false);
  }

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

  return (
    <section className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">المستندات والأدلة</h2>
          <p className="text-xs text-muted-foreground">
            أدلة دعم القرار للمراجعة البشرية وليست اعتمادًا نهائيًا بحد ذاتها.
          </p>
        </div>
        <Badge variant="outline">{evidence.length}</Badge>
      </div>

      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="space-y-1">
            <p className="font-medium">الحوكمة</p>
            <p>
              كل مستند هنا هو مادة دعم للقرار. يبقى القرار بحاجة إلى مراجعة
              واعتماد بشريين حتى لو اكتملت الأدلة.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <Badge variant="outline">حتى 50 مستندًا</Badge>
        <Badge variant="outline">الحد الأقصى 20MB</Badge>
        <Badge variant="outline">PDF / Office / صور / CSV / TXT</Badge>
      </div>

      {error && (
        <div className="mb-3 rounded bg-destructive/10 p-3 text-sm text-destructive">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
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
          className="gap-1"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "جاري الرفع..." : "إضافة مستند دعم"}
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
        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">لا توجد أدلة مرفقة بعد</p>
          <p className="mt-1">
            أضف عقودًا، عروضًا، ملفات تحليل، أو مراسلات داعمة قبل إرسال القرار
            للمراجعة.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {evidence.map((item) => (
            <div key={item.id} className="rounded border p-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-2">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{item.filename}</p>
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
                      <Badge variant="outline" className="bg-muted">
                        مستند دعم
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatFileSize(item.fileSize)}
                      {item.description ? ` — ${item.description}` : ""}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      <span>أضيف في {formatEvidenceDate(item.createdAt)}</span>
                      {item.fileHash ? (
                        <span>بصمة: {item.fileHash.slice(0, 12)}</span>
                      ) : null}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                      {item.storageKey ? (
                        <a
                          href={`/api/decisions/${decisionId}/evidence/${item.id}/download`}
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <Download className="h-3.5 w-3.5" />
                          تنزيل الملف
                        </a>
                      ) : (
                        <span className="text-muted-foreground">
                          لا يوجد ملف محفوظ للتنزيل
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-destructive"
                  disabled={deletingId === item.id}
                  onClick={() => handleDelete(item.id)}
                >
                  {deletingId === item.id ? "جارٍ الحذف..." : "حذف"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
