"use client";

import { WorkflowStatusBadge } from "@/components/workflowos/workflow-status-badge";

export function WorkflowRecordHeader({
  title,
  status,
  clientName,
  type,
}: {
  title: string;
  status: string;
  clientName: string;
  type: string;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black text-foreground">{title}</h1>
          <WorkflowStatusBadge status={status} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {clientName} — {type === "CASE" ? "قضية" : type}
        </p>
      </div>
    </div>
  );
}
