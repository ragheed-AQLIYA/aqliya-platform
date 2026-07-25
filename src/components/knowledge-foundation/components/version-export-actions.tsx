"use client";

import { exportKnowledgeFoundationVersionAction } from "@/actions/knowledge-foundation/actions";

interface Props {
  versionId: string;
  exportLoading: string | null;
  onExportStart: (format: string) => void;
  onExportError: (msg: string) => void;
  onExportEnd: () => void;
}

async function downloadExport(versionId: string, format: "pdf" | "json") {
  const result = await exportKnowledgeFoundationVersionAction(versionId, format);
  const byteChars = atob(result.content);
  const byteArr = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteArr[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([byteArr], { type: result.mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = result.filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function VersionExportActions({
  versionId,
  exportLoading,
  onExportStart,
  onExportError,
  onExportEnd,
}: Props) {
  const handleExport = async (format: "pdf" | "json") => {
    onExportStart(format);
    try {
      await downloadExport(versionId, format);
    } catch {
      onExportError(format === "pdf" ? "فشل تصدير PDF" : "فشل تصدير JSON");
    } finally {
      onExportEnd();
    }
  };

  return (
    <div className="flex flex-wrap gap-3 border-t pt-4">
      <button
        onClick={() => handleExport("pdf")}
        disabled={exportLoading !== null}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {exportLoading === "pdf" ? "جاري..." : "📄 تصدير PDF"}
      </button>
      <button
        onClick={() => handleExport("json")}
        disabled={exportLoading !== null}
        className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {exportLoading === "json" ? "جاري..." : "📋 تصدير JSON"}
      </button>
    </div>
  );
}
