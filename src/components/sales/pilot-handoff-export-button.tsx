"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PilotHandoffExportButton({ dealId }: { dealId: string }) {
  const exportUrl = `/api/sales/deals/${dealId}/pilot-handoff`;

  return (
    <Button variant="outline" size="sm" className="gap-1" asChild>
      <a href={exportUrl} target="_blank" rel="noopener noreferrer">
        <Printer className="h-4 w-4" />
        تصدير قائمة التحقق (HTML)
      </a>
    </Button>
  );
}
