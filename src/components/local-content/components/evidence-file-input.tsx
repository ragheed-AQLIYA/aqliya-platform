"use client";

import { type RefObject } from "react";
import { Label } from "@/components/ui/label";

interface EvidenceFileInputProps {
  ref: RefObject<HTMLInputElement | null>;
}

export function EvidenceFileInput({ ref }: EvidenceFileInputProps) {
  return (
    <div>
      <Label htmlFor="file">الملف</Label>
      <input
        id="file"
        name="file"
        type="file"
        ref={ref as React.RefObject<HTMLInputElement>}
        required
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
        accept=".pdf,.xlsx,.xls,.docx,.doc,.jpg,.jpeg,.png,.csv,.txt"
      />
      <p className="text-[10px] text-muted-foreground mt-1">
        PDF, Excel, Word, صور, CSV, نص (الأقصى ١٠ ميغابايت)
      </p>
    </div>
  );
}
