"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { useWorkflowRecordDetail } from "./components/use-workflow-record-detail";
import { RecordHeader } from "./components/record-header";
import { RecordStatsGrid } from "./components/record-stats-grid";
import { StepsList } from "./components/steps-list";
import { ExportSection } from "./components/export-section";
import { EvidenceSection } from "./components/evidence-section";
import { AuditTrailSection } from "./components/audit-trail-section";

function WorkflowRecordDetailInner() {
  const { id } = useParams<{ id: string }>();
  const {
    record, slaInfo, evidence, auditEvents,
    handleAdvance, handleComplete, handleReject,
    handleRequestExport, handleApproveExport, handleRejectExport,
    uploadEvidence,
  } = useWorkflowRecordDetail(id);

  const showActions = !["completed", "rejected", "cancelled"].includes(record.status);

  return (
    <div dir="rtl" className="max-w-3xl mx-auto">
      <RecordHeader record={record} id={id} />
      <RecordStatsGrid record={record} slaInfo={slaInfo} />
      <StepsList
        record={record}
        showActions={showActions}
        onAdvance={handleAdvance}
        onComplete={handleComplete}
        onReject={handleReject}
      />
      <ExportSection
        record={record}
        id={id}
        onRequestExport={handleRequestExport}
        onApproveExport={handleApproveExport}
        onRejectExport={handleRejectExport}
      />
      {record.metadata ? (
        <div className="mt-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-sm font-semibold leading-none tracking-tight">بيانات إضافية</h3>
            </div>
            <div className="p-6 pt-0">
              <pre className="text-sm bg-muted p-3 rounded overflow-x-auto">
                {JSON.stringify(record.metadata, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      ) : null}
      <EvidenceSection evidence={evidence} uploadEvidence={uploadEvidence} />
      <AuditTrailSection events={auditEvents} />
    </div>
  );
}

export default function WorkflowRecordDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">جاري التحميل...</div>}>
      <WorkflowRecordDetailInner />
    </Suspense>
  );
}
