"use client";

import { useState } from "react";
import { WorkspaceStatus } from "@/components/workspace/workspace-status";
import { WorkflowClientList } from "@/components/workflowos/workflow-client-list";
import { WorkflowMembershipManager } from "@/components/workflowos/workflow-membership-manager";
import { Settings } from "lucide-react";

export function WorkflowAdminPage() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <WorkspaceStatus
        module="platform"
        status="healthy"
        message="إدارة سير العمل الذكي — إنشاء العملاء وإدارة العضويات"
      />

      <div className="flex items-center gap-3">
        <Settings className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-h2 font-black text-foreground">
            إدارة سير العمل الذكي
          </h1>
          <p className="text-body-sm text-muted-foreground">
            إدارة العملاء والعضويات في نظام سير العمل
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <WorkflowClientList
          onSelectClient={setSelectedClientId}
          onChange={() => setRefreshKey((k) => k + 1)}
        />
        <WorkflowMembershipManager clientId={selectedClientId} />
      </div>
    </div>
  );
}
