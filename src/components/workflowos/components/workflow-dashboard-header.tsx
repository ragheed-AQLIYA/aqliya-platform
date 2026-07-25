"use client";

import { WorkspaceStatus } from "@/components/workspace/workspace-status";
import { WorkflowClientSelector } from "@/components/workflowos/workflow-client-selector";

export function WorkflowDashboardHeader({
  clientId,
  onClientChange,
}: {
  clientId: string | null;
  onClientChange: (id: string | null) => void;
}) {
  return (
    <>
      <WorkspaceStatus
        module="platform"
        status="healthy"
        message="مساحة عمل سير العمل الذكي — إدارة القضايا والملفات ضمن عزل متعدد العملاء"
      />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-h2 font-black text-foreground">سير العمل الذكي</h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            مساحة عمل لإدارة القضايا والملفات ضمن عزل متعدد العملاء
          </p>
        </div>
        <WorkflowClientSelector
          clientId={clientId}
          onClientChange={onClientChange}
        />
      </div>
    </>
  );
}
