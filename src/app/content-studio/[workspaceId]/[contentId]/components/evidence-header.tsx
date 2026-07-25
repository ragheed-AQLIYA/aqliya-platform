"use client";

import { Upload, PaperclipIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";

export function EvidenceHeader({
  onToggleUpload,
}: {
  onToggleUpload: () => void;
}) {
  return (
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <PaperclipIcon className="h-4 w-4" />
          المستندات والدلائل
        </span>
        <Button variant="outline" size="sm" onClick={onToggleUpload}>
          <Upload className="h-4 w-4 ml-1" />
          رفع مستند
        </Button>
      </CardTitle>
    </CardHeader>
  );
}
