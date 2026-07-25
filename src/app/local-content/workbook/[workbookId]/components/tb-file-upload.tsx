"use client";

import { Label } from "@/components/ui/label";

interface Props {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TbFileUpload({ fileInputRef, onFileUpload }: Props) {
  return (
    <div>
      <Label>تحميل ملف / Upload File</Label>
      <div className="flex items-center gap-2 mt-1">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.tsv,.json,text/csv,application/json"
          onChange={onFileUpload}
          className="text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
        />
        <span className="text-xs text-muted-foreground">CSV أو TSV أو JSON</span>
      </div>
    </div>
  );
}
