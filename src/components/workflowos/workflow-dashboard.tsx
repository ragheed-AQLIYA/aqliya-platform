"use client";

import { AlertCircle, FolderKanban } from "lucide-react";
import { WorkflowEmptyState } from "@/components/workflowos/workflow-empty-state";
import { useWorkflowDashboard } from "@/components/workflowos/components/use-workflow-dashboard";
import { WorkflowDashboardHeader } from "@/components/workflowos/components/workflow-dashboard-header";
import { StatCardsGrid } from "@/components/workflowos/components/stat-cards-grid";
import { RecordsSection } from "@/components/workflowos/components/records-section";
import { DashboardSidebar } from "@/components/workflowos/components/dashboard-sidebar";

export function WorkflowDashboard() {
  const {
    clientId,
    setClientId,
    noAccess,
    stats,
    userRole,
    refreshKey,
    onCreated,
  } = useWorkflowDashboard();

  if (noAccess) {
    return (
      <WorkflowEmptyState
        title="لا توجد صلاحية وصول"
        description="ليس لديك صلاحية الوصول إلى أي عميل في سير العمل الذكي. يرجى التواصل مع المشرف."
        icon={AlertCircle}
      />
    );
  }

  return (
    <div className="space-y-6">
      <WorkflowDashboardHeader
        clientId={clientId}
        onClientChange={setClientId}
      />

      {!clientId ? (
        <WorkflowEmptyState
          title="اختر عميلاً للبدء"
          description="يبدو أنه ليس لديك عملاء نشطون بعد. يرجى التواصل مع المشرف."
          icon={FolderKanban}
        />
      ) : (
        <>
          <StatCardsGrid stats={stats} />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecordsSection
                clientId={clientId}
                userRole={userRole}
                refreshKey={refreshKey}
                onCreated={onCreated}
              />
            </div>

            <DashboardSidebar
              clientId={clientId}
              userRole={userRole}
              pendingExports={stats.pendingExports}
              escalated={stats.escalated}
            />
          </div>
        </>
      )}
    </div>
  );
}
