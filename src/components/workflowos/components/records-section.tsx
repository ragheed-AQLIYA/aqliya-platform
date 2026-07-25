"use client";

import { WorkflowCreateRecordForm } from "@/components/workflowos/workflow-create-record-form";
import { WorkflowRecordList } from "@/components/workflowos/workflow-record-list";

export function RecordsSection({
  clientId,
  userRole,
  refreshKey,
  onCreated,
}: {
  clientId: string;
  userRole: string | null;
  refreshKey: number;
  onCreated: () => void;
}) {
  const canCreate = userRole === "Operator" || userRole === "PlatformAdmin";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">القضايا</h2>
        {canCreate && (
          <WorkflowCreateRecordForm
            clientId={clientId}
            onCreated={onCreated}
          />
        )}
      </div>
      <WorkflowRecordList clientId={clientId} refreshKey={refreshKey} />
    </div>
  );
}
