"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { workflow_listRecords } from "@/actions/workflowos-actions";
import { WorkflowStatusBadge } from "@/components/workflowos/workflow-status-badge";
import { WorkflowEmptyState } from "@/components/workflowos/workflow-empty-state";
import { Loader2, FileText, ExternalLink } from "lucide-react";

interface RecordItem {
  id: string;
  title: string;
  status: string;
  type: string;
  description?: string | null;
  createdById: string;
  createdAt: Date;
}

export function WorkflowRecordList({
  clientId,
  refreshKey,
}: {
  clientId: string | null;
  refreshKey: number;
}) {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;
    let mounted = true;
    Promise.resolve().then(() => {
      if (mounted) setLoading(true);
    });
    Promise.resolve().then(() => {
      if (mounted) setError(null);
    });
    workflow_listRecords(clientId).then((result) => {
      if (!mounted) return;
      if (result.success && result.data) {
        setRecords(result.data as RecordItem[]);
      } else {
        setError(result.error ?? "فشل تحميل السجلات");
      }
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [clientId, refreshKey]);

  if (!clientId) return null;
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-lg border border-status-error/20 bg-status-error/5 p-4 text-sm text-status-error">
        {error}
      </div>
    );
  }
  if (records.length === 0) {
    return (
      <WorkflowEmptyState
        title="لا توجد قضايا بعد"
        description="ابدأ بإنشاء قضية جديدة لإضافتها إلى القائمة."
        icon={FileText}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              العنوان
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              الحالة
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              التاريخ
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {records.map((record) => (
            <tr key={record.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3">
                <Link
                  href={`/workflowos/clients/${clientId}/records/${record.id}`}
                  className="flex items-center gap-2 group"
                >
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="font-medium group-hover:text-primary transition-colors">
                    {record.title}
                  </span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
                </Link>
              </td>
              <td className="px-4 py-3">
                <WorkflowStatusBadge status={record.status} size="sm" />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(record.createdAt).toLocaleDateString("ar-SA", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
