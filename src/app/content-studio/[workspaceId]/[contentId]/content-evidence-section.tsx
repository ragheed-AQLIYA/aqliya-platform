"use client";

import { useState, useEffect } from "react";
import { FileText, Trash2, Upload, Download, PaperclipIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getContentEvidenceAction,
  uploadContentEvidenceAction,
  deleteContentEvidenceAction,
  updateContentEvidenceDescriptionAction,
} from "@/actions/content-evidence-actions";

type ContentEvidence = {
  id: string;
  contentId: string;
  filename: string;
  fileType: string;
  fileSize: number;
  fileHash: string | null;
  storageKey: string | null;
  uploadedById: string | null;
  description: string | null;
  evidenceType: string;
  createdAt: Date;
};

const EVIDENCE_TYPE_LABELS: Record<string, string> = {
  attachment: "مرفق",
  reference: "مرجع",
  source: "مصدر",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileType: string) {
  if (["pdf"].includes(fileType)) return "📄";
  if (["xlsx", "xls"].includes(fileType)) return "📊";
  if (["docx", "doc"].includes(fileType)) return "📝";
  if (["jpg", "jpeg", "png"].includes(fileType)) return "🖼️";
  if (["csv"].includes(fileType)) return "📋";
  return "📎";
}

export function ContentEvidenceSection({
  contentId,
}: {
  contentId: string;
}) {
  const [evidence, setEvidence] = useState<ContentEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // upload form
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [evidenceType, setEvidenceType] = useState("attachment");
  const [editingDescription, setEditingDescription] = useState<string | null>(null);
  const [editDescriptionValue, setEditDescriptionValue] = useState("");

  useEffect(() => {
    loadEvidence();
  }, [contentId]);

  async function loadEvidence() {
    setLoading(true);
    setError(null);
    const result = await getContentEvidenceAction(contentId);
    if (result.ok) {
      setEvidence(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  async function handleUpload() {
    if (!selectedFile) return;
    const fileExt = selectedFile.name.split(".").pop()?.toLowerCase() || "bin";
    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      const result = await uploadContentEvidenceAction({
        contentId,
        filename: selectedFile!.name,
        fileType: fileExt,
        fileData: base64,
        description: description || undefined,
        evidenceType: evidenceType || undefined,
      });
      setUploading(false);
      if (result.ok) {
        setSelectedFile(null);
        setDescription("");
        setEvidenceType("attachment");
        setShowUpload(false);
        await loadEvidence();
      } else {
        setError(result.error);
      }
    };
    reader.readAsDataURL(selectedFile);
  }

  async function handleDelete(evidenceId: string) {
    const result = await deleteContentEvidenceAction(evidenceId);
    if (result.ok) {
      await loadEvidence();
    } else {
      setError(result.error);
    }
  }

  async function handleSaveDescription(evidenceId: string) {
    const result = await updateContentEvidenceDescriptionAction(
      evidenceId,
      editDescriptionValue,
    );
    if (result.ok) {
      setEditingDescription(null);
      await loadEvidence();
    } else {
      setError(result.error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <PaperclipIcon className="h-4 w-4" />
            المستندات والدلائل
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUpload(!showUpload)}
          >
            <Upload className="h-4 w-4 ml-1" />
            رفع مستند
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
            {error}
          </div>
        )}

        {showUpload && (
          <div className="rounded-lg border p-3 space-y-3 bg-muted/30">
            <div className="space-y-1">
              <Label htmlFor="evidence-file">الملف</Label>
              <Input
                id="evidence-file"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                accept=".pdf,.xlsx,.xls,.docx,.doc,.jpg,.jpeg,.png,.csv,.txt,.pptx,.ppt"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="evidence-type">النوع</Label>
              <Select
                value={evidenceType}
                onValueChange={setEvidenceType}
              >
                <SelectTrigger id="evidence-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attachment">مرفق</SelectItem>
                  <SelectItem value="reference">مرجع</SelectItem>
                  <SelectItem value="source">مصدر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="evidence-desc">وصف (اختياري)</Label>
              <Textarea
                id="evidence-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف مختصر للمستند..."
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? "جاري الرفع..." : "رفع"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowUpload(false);
                  setSelectedFile(null);
                  setDescription("");
                }}
              >
                إلغاء
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-xs text-muted-foreground text-center py-4">
            جاري التحميل...
          </div>
        ) : evidence.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-4">
            لا توجد مستندات مرفوعة. أضف مستندات داعمة لهذا المحتوى.
          </div>
        ) : (
          <div className="space-y-2">
            {evidence.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border p-2.5 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-base" aria-hidden="true">
                      {getFileIcon(item.fileType)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">
                        {item.filename}
                      </div>
                      <div className="text-muted-foreground">
                        {formatFileSize(item.fileSize)} ·{" "}
                        {EVIDENCE_TYPE_LABELS[item.evidenceType] ??
                          item.evidenceType}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.storageKey && (
                      <a
                        href={`/api/storage/download?key=${encodeURIComponent(item.storageKey)}&filename=${encodeURIComponent(item.filename)}`}
                        className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent"
                        title="تحميل"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      title="حذف"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {editingDescription === item.id ? (
                  <div className="space-y-1 pr-7">
                    <Textarea
                      value={editDescriptionValue}
                      onChange={(e) => setEditDescriptionValue(e.target.value)}
                      rows={2}
                      className="text-xs"
                      placeholder="وصف المستند..."
                    />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="default"
                        className="h-6 text-xs"
                        onClick={() => handleSaveDescription(item.id)}
                      >
                        حفظ
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs"
                        onClick={() => setEditingDescription(null)}
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                ) : item.description ? (
                  <div
                    className="pr-7 text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => {
                      setEditingDescription(item.id);
                      setEditDescriptionValue(item.description ?? "");
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setEditingDescription(item.id);
                        setEditDescriptionValue(item.description ?? "");
                      }
                    }}
                  >
                    {item.description}
                  </div>
                ) : (
                  <div
                    className="pr-7 text-muted-foreground/50 italic cursor-pointer hover:text-foreground"
                    onClick={() => {
                      setEditingDescription(item.id);
                      setEditDescriptionValue("");
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setEditingDescription(item.id);
                        setEditDescriptionValue("");
                      }
                    }}
                  >
                    أضف وصفاً...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
