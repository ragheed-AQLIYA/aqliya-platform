"use client";

import { AlertTriangle } from "lucide-react";

interface EvidenceErrorAlertProps {
  error: string | null;
}

export function EvidenceErrorAlert({ error }: EvidenceErrorAlertProps) {
  if (!error) return null;

  return (
    <div className="mb-3 rounded bg-destructive/10 p-3 text-sm text-destructive">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{error}</span>
      </div>
    </div>
  );
}
