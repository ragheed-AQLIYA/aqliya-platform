"use client";

import { XCircle } from "lucide-react";

export function IcpPanelErrorBanner({ error }: { error: string }) {
  return (
    <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
      <XCircle className="h-4 w-4 shrink-0" />
      {error}
    </div>
  );
}
