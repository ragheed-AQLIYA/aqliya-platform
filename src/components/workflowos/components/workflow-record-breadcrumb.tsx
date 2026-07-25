"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function WorkflowRecordBreadcrumb({
  clientName,
  clientId,
  recordTitle,
}: {
  clientName: string;
  clientId: string;
  recordTitle: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Link
        href="/workflowos"
        className="hover:text-foreground transition-colors"
      >
        سير العمل الذكي
      </Link>
      <ArrowRight className="h-3 w-3" />
      <span>{clientName || clientId.slice(0, 8)}</span>
      <ArrowRight className="h-3 w-3" />
      <span className="text-foreground font-medium">{recordTitle}</span>
    </div>
  );
}
