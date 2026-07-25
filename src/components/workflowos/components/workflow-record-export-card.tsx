"use client";

import { Download } from "lucide-react";

export function WorkflowRecordExportCard({
  clientId,
  recordId,
  recordStatus,
}: {
  clientId: string;
  recordId: string;
  recordStatus: string;
}) {
  const exportable = recordStatus === "Approved" || recordStatus === "Archived";

  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="text-sm font-semibold mb-3">التصدير</h2>
      {exportable ? (
        <a
          href={`/api/workflowos/clients/${clientId}/records/${recordId}/export/pdf`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          تحميل التقرير (PDF)
        </a>
      ) : (
        <div className="text-center py-4">
          <Download className="mx-auto h-6 w-6 text-muted-foreground/50 mb-1" />
          <p className="text-xs text-muted-foreground">
            لا يمكن تصدير القضية قبل الاعتماد
          </p>
        </div>
      )}
    </div>
  );
}
