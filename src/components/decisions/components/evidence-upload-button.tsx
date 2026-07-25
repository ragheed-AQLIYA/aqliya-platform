"use client";

import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface EvidenceUploadButtonProps {
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function EvidenceUploadButton({ uploading, onUpload }: EvidenceUploadButtonProps) {
  return (
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
        onChange={onUpload}
        accept=".pdf,.xlsx,.xls,.docx,.doc,.jpg,.jpeg,.png,.csv,.txt"
      />
    </div>
  );
}
