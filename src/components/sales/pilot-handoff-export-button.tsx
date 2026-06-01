"use client";

import { buttonVariants } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { cn } from "@/lib/utils";

export function PilotHandoffExportButton({ dealId }: { dealId: string }) {
  const exportUrl = `/api/sales/deals/${dealId}/pilot-handoff`;

  return (
    <a
      href={exportUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1 inline-flex items-center")}
    >
      <Printer className="h-4 w-4" />
      تصدير قائمة التحقق (HTML)
    </a>
  );
}
