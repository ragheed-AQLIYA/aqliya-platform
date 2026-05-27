"use client";

import { useEffect, useState } from "react";
import {
  workflow_listDocuments,
  workflow_deleteDocument,
} from "@/actions/workflowos-actions";
import { WorkflowAddDocumentForm } from "@/components/workflowos/workflow-add-document-form";
import {
  Loader2,
  FileText,
  Trash2,
  FolderKanban,
  Download,
} from "lucide-react";

interface DocItem {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storageKey: string;
  uploadedById: string;
  createdAt: Date;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function WorkflowDocumentPanel({
  clientId,
  recordId,
  recordStatus,
  userRole,
}: {
  clientId: string;
  recordId: string;
  recordStatus: string;
  userRole: string | null;
}) {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isPlatformAdmin = userRole === "PlatformAdmin";
  const canDelete = isPlatformAdmin;

  useEffect(() => {
    workflow_listDocuments(clientId, recordId).then((result) => {
      setLoadError(null);
      if (result.success && result.data) {
        setDocs(result.data as DocItem[]);
      } else {
        setLoadError(result.error ?? "فشل تحميل المستندات");
      }
      setLoading(false);
    });
  }, [clientId, recordId, refreshKey]);

  async function handleDelete(documentId: string) {
    if (!confirm("تأكيد حذف المستند؟")) return;
    setDeleting(documentId);
    await workflow_deleteDocument(clientId, recordId, documentId);
    setDeleting(null);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">المستندات</h2>
        <WorkflowAddDocumentForm
          clientId={clientId}
          recordId={recordId}
          recordStatus={recordStatus}
          userRole={userRole}
          onAdded={() => setRefreshKey((k) => k + 1)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : loadError ? (
        <div className="rounded-lg border border-status-error/20 bg-status-error/5 p-4 text-sm text-status-error">
          {loadError}
        </div>
      ) : docs.length === 0 ? (
        <div className="rounded-lg border bg-card p-4 text-center">
          <FolderKanban className="mx-auto h-6 w-6 text-muted-foreground/50 mb-1" />
          <p className="text-xs text-muted-foreground">
            لم يتم إرفاق مستندات بعد
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border bg-card p-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <FileText className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {doc.fileName}
                    </span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {doc.fileType.split("/").pop() || doc.fileType}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>{formatSize(doc.fileSize)}</span>
                    <span>
                      {new Date(doc.createdAt).toLocaleDateString("ar-SA", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {doc.storageKey.startsWith("metadata-only:") ? (
                      <span className="text-amber-600 dark:text-amber-400">
                        مسجل فقط
                      </span>
                    ) : (
                      <a
                        href={`/api/workflowos/documents/${doc.id}/download`}
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                        title="تحميل"
                      >
                        <Download className="h-3 w-3" />
                        تحميل
                      </a>
                    )}
                  </div>
                </div>
              </div>
              {canDelete && (
                <button
                  onClick={() => handleDelete(doc.id)}
                  disabled={deleting === doc.id}
                  className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-status-error hover:bg-status-error/10 transition-colors disabled:opacity-50"
                  title="حذف"
                >
                  {deleting === doc.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
