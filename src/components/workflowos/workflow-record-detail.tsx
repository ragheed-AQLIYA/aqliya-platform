"use client";

import { Loader2 } from "lucide-react";
import { WorkflowEmptyState } from "@/components/workflowos/workflow-empty-state";
import { WorkflowWorkflowActions } from "@/components/workflowos/workflow-workflow-actions";
import { WorkflowReviewPanel } from "@/components/workflowos/workflow-review-panel";
import { WorkflowAuditTrail } from "@/components/workflowos/workflow-audit-trail";
import { WorkflowDocumentPanel } from "@/components/workflowos/workflow-document-panel";
import { useWorkflowRecordDetail } from "@/components/workflowos/components/use-workflow-record-detail";
import { WorkflowRecordBreadcrumb } from "@/components/workflowos/components/workflow-record-breadcrumb";
import { WorkflowRecordHeader } from "@/components/workflowos/components/workflow-record-header";
import { WorkflowRecordDescription } from "@/components/workflowos/components/workflow-record-description";
import { WorkflowRecordTimeline } from "@/components/workflowos/components/workflow-record-timeline";
import { WorkflowRecordExportCard } from "@/components/workflowos/components/workflow-record-export-card";

export function WorkflowRecordDetail({
  clientId,
  recordId,
}: {
  clientId: string;
  recordId: string;
}) {
  const { record, clientName, userRole, loading, error, loadData } =
    useWorkflowRecordDetail(clientId, recordId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !record) {
    return (
      <WorkflowEmptyState
        title="لم يتم العثور على القضية"
        description={
          error ?? "قد لا تملك صلاحية الوصول أو أن القضية غير موجودة."
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <WorkflowRecordBreadcrumb
        clientName={clientName}
        clientId={clientId}
        recordTitle={record.title}
      />

      <WorkflowRecordHeader
        title={record.title}
        status={record.status}
        clientName={clientName}
        type={record.type}
      />

      {userRole && (
        <WorkflowWorkflowActions
          clientId={clientId}
          recordId={recordId}
          status={record.status}
          userRole={userRole as "PlatformAdmin" | "Operator" | "Reviewer"}
          onActionComplete={loadData}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <WorkflowRecordDescription description={record.description} />

          <WorkflowRecordTimeline record={record} />

          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold mb-3">المراجعات</h2>
            <WorkflowReviewPanel clientId={clientId} recordId={recordId} />
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold mb-3">سجل الأثر</h2>
            <WorkflowAuditTrail clientId={clientId} recordId={recordId} />
          </div>
        </div>

        <div className="space-y-4">
          <WorkflowDocumentPanel
            clientId={clientId}
            recordId={recordId}
            recordStatus={record.status}
            userRole={userRole}
          />

          <WorkflowRecordExportCard
            clientId={clientId}
            recordId={recordId}
            recordStatus={record.status}
          />
        </div>
      </div>
    </div>
  );
}
