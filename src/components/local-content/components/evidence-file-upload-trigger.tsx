"use client";

import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface EvidenceFileUploadTriggerProps {
  onClick: () => void;
}

export function EvidenceFileUploadTrigger({
  onClick,
}: EvidenceFileUploadTriggerProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={onClick}
      className="flex items-center gap-1"
    >
      <Upload className="h-4 w-4" />
      رفع ملف دليل
    </Button>
  );
}
