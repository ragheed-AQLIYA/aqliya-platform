"use client";

import { FileText, AlertTriangle, Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FileItem {
  id: string;
  filename: string;
  fileType: string;
  mimeType: string | null;
  sizeBytes: number | null;
  extractionStatus: string | null;
  extractedContent: string | null;
  extractedAt: string | Date | null;
  extractionMeta: Record<string, unknown> | null;
  storageKey: string | null;
  fileHash: string | null;
}

interface SourceFilesCardProps {
  files: FileItem[];
  isArchived: boolean;
  canGenerate: boolean;
  onAddFile: (formData: FormData) => Promise<void>;
  onRemoveFile: (fileId: string) => Promise<void>;
}

function FileRow({
  file,
  isArchived,
  onRemoveFile,
}: {
  file: FileItem;
  isArchived: boolean;
  onRemoveFile: (id: string) => Promise<void>;
}) {
  return (
    <div className="p-3 rounded-md border">
      <div className="flex items-center gap-3 text-xs">
        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="font-medium">{file.filename}</span>
        <Badge variant="outline" className="text-[9px]">{file.fileType}</Badge>
        {file.sizeBytes && (
          <span className="text-muted-foreground">
            {(file.sizeBytes / 1024).toFixed(0)}KB
          </span>
        )}
        <span
          className={`text-[10px] ${
            file.extractionStatus === "completed"
              ? "text-green-600"
              : file.extractionStatus === "failed"
                ? "text-red-500"
                : file.extractionStatus === "skipped"
                  ? "text-yellow-500"
                  : "text-muted-foreground"
          }`}
        >
          {file.extractionStatus === "completed"
            ? "✅ Extracted"
            : file.extractionStatus === "failed"
              ? "⚠ Failed"
              : file.extractionStatus === "skipped"
                ? "⏭ Skipped"
                : "🔲 Pending"}
        </span>
        {!isArchived && (
          <button
            type="button"
            onClick={() => onRemoveFile(file.id)}
            className="mr-auto text-red-500 hover:text-red-700 text-[10px] font-medium"
          >
            Remove
          </button>
        )}
      </div>

      {file.extractionStatus && (
        <div className="mt-2 px-2 py-1.5 rounded bg-muted/30">
          {file.extractionStatus === "completed" && file.extractedContent && (
            <details className="text-[10px]">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Show extracted content preview (
                {file.extractedContent.length} chars)
              </summary>
              <pre className="mt-1 p-2 rounded bg-background text-[10px] max-h-32 overflow-y-auto whitespace-pre-wrap">
                {file.extractedContent.slice(0, 2000)}
                {file.extractedContent.length > 2000 ? "..." : ""}
              </pre>
            </details>
          )}
          <div className="flex items-center gap-3 mt-1 text-[9px] text-muted-foreground">
            {file.extractedAt && (
              <span>
                Extracted:{" "}
                {new Date(file.extractedAt).toLocaleString("en-SA")}
              </span>
            )}
            {file.extractionStatus === "failed" && file.extractionMeta && (
              <span>
                Reason:{" "}
                {String(file.extractionMeta?.error || "Unknown")}
              </span>
            )}
            {file.extractionStatus === "skipped" && (
              <span>Unsupported format for extraction</span>
            )}
          </div>
        </div>
      )}

      {(file.storageKey || file.fileHash) && (
        <details className="mt-1 text-[9px] text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground">
            Technical metadata
          </summary>
          <div className="mt-1 p-1.5 rounded bg-background">
            {file.storageKey && (
              <div>
                Storage key:{" "}
                <code className="text-[8px]">{file.storageKey}</code>
              </div>
            )}
            {file.fileHash && (
              <div>
                SHA-256: <code className="text-[8px]">{file.fileHash}</code>
              </div>
            )}
            {file.mimeType && <div>MIME: {file.mimeType}</div>}
          </div>
        </details>
      )}
    </div>
  );
}

function FileUploadForm({ onAddFile }: { onAddFile: (fd: FormData) => Promise<void> }) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onAddFile(new FormData(e.currentTarget));
  };

  return (
    <details className="text-xs">
      <summary className="cursor-pointer text-muted-foreground hover:text-foreground mb-2">
        Attach a file / إرفاق ملف
      </summary>
      <p className="text-[10px] text-muted-foreground mb-2">
        Accepted: PDF, Word, Excel, CSV, TXT — Max 10 MB.
      </p>
      <form
        onSubmit={handleSubmit}
        className="space-y-3 p-3 rounded-md border bg-muted/30"
      >
        <div>
          <Label htmlFor="file">Upload File</Label>
          <Input id="file" name="file" type="file" className="text-xs" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="filename">Filename</Label>
            <Input
              id="filename"
              name="filename"
              placeholder="report.pdf"
              className="text-xs"
            />
          </div>
          <div>
            <Label htmlFor="fileType">Type</Label>
            <select
              id="fileType"
              name="fileType"
              className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-xs"
            >
              <option value="">Select...</option>
              <option value="pdf">PDF</option>
              <option value="docx">Word</option>
              <option value="xlsx">Excel</option>
              <option value="csv">CSV</option>
              <option value="txt">Text</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <Button
          type="submit"
          size="sm"
          variant="outline"
          className="flex items-center gap-2"
        >
          <Upload className="h-3.5 w-3.5" /> Attach
        </Button>
      </form>
    </details>
  );
}

export function SourceFilesCard({
  files,
  isArchived,
  canGenerate,
  onAddFile,
  onRemoveFile,
}: SourceFilesCardProps) {
  const hasFiles = files.length > 0;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">
          Source Files / الملفات المصدر
        </CardTitle>
        <CardDescription>
          Attached files for content extraction and reference
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasFiles ? (
          <div className="space-y-2 mb-4">
            {files.map((f) => (
              <FileRow
                key={f.id}
                file={f}
                isArchived={isArchived}
                onRemoveFile={onRemoveFile}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic mb-4">
            No files attached yet.
          </p>
        )}

        {!hasFiles && canGenerate && (
          <div className="flex items-start gap-2 p-3 mb-4 rounded-md bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              يمكن توليد مسودة بدون ملف، لكن الأفضل إرفاق مصدر أولًا.
              <br />A draft can be generated without files, but attaching a
              source first is recommended.
            </p>
          </div>
        )}

        {!isArchived && <FileUploadForm onAddFile={onAddFile} />}
      </CardContent>
    </Card>
  );
}
