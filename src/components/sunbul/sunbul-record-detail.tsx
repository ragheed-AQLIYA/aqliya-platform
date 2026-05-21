"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  sunbul_getRecord,
  sunbul_getClient,
  sunbul_getUserRole,
} from "@/actions/sunbul-actions";
import { SunbulStatusBadge } from "@/components/sunbul/sunbul-status-badge";
import { SunbulWorkflowActions } from "@/components/sunbul/sunbul-workflow-actions";
import { SunbulReviewPanel } from "@/components/sunbul/sunbul-review-panel";
import { SunbulAuditTrail } from "@/components/sunbul/sunbul-audit-trail";
import { SunbulDocumentPanel } from "@/components/sunbul/sunbul-document-panel";
import { SunbulEmptyState } from "@/components/sunbul/sunbul-empty-state";
import { Loader2, ArrowRight, Download } from "lucide-react";
import Link from "next/link";

interface RecordData {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  type: string;
  createdById: string;
  createdAt: Date;
  submittedAt?: Date | null;
  approvedAt?: Date | null;
  archivedAt?: Date | null;
  clientId: string;
  documents?: Array<{
    id: string;
    fileName: string;
    fileType: string;
    createdAt: Date;
  }>;
  reviews?: Array<{
    id: string;
    status: string;
    notes?: string | null;
    reviewerId: string;
    createdAt: Date;
  }>;
}

export function SunbulRecordDetail({
  clientId,
  recordId,
}: {
  clientId: string;
  recordId: string;
}) {
  const router = useRouter();
  const [record, setRecord] = useState<RecordData | null>(null);
  const [clientName, setClientName] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    Promise.resolve().then(() => {
      setLoading(true);
      setError(null);
    });
    Promise.all([
      sunbul_getRecord(clientId, recordId),
      sunbul_getUserRole(clientId),
    ]).then(([recordResult, roleResult]) => {
      if (recordResult.success && recordResult.data) {
        setRecord(recordResult.data as RecordData);
        sunbul_getClient(clientId).then((clientResult) => {
          if (clientResult.success && clientResult.data) {
            setClientName((clientResult.data as { name: string }).name);
          }
        });
      } else {
        setError(recordResult.error ?? "فشل تحميل القضية");
      }
      if (roleResult.success) {
        setUserRole(roleResult.data as string | null);
      }
      setLoading(false);
    });
  }, [clientId, recordId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !record) {
    return (
      <SunbulEmptyState
        title="لم يتم العثور على القضية"
        description={
          error ?? "قد لا تملك صلاحية الوصول أو أن القضية غير موجودة."
        }
      />
    );
  }

  const statusLabels: Record<string, string> = {
    Draft: "مسودة",
    UnderReview: "تحت المراجعة",
    Approved: "معتمد",
    Archived: "مؤرشف",
  };

  const dateFields = [
    { label: "تاريخ الإنشاء", value: record.createdAt },
    { label: "تاريخ الإرسال", value: record.submittedAt },
    { label: "تاريخ الاعتماد", value: record.approvedAt },
    { label: "تاريخ الأرشفة", value: record.archivedAt },
  ].filter((f) => f.value);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href="/sunbul"
          className="hover:text-foreground transition-colors"
        >
          سنبل
        </Link>
        <ArrowRight className="h-3 w-3" />
        <span>{clientName || clientId.slice(0, 8)}</span>
        <ArrowRight className="h-3 w-3" />
        <span className="text-foreground font-medium">{record.title}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-foreground">
              {record.title}
            </h1>
            <SunbulStatusBadge status={record.status} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {clientName} — {record.type === "CASE" ? "قضية" : record.type}
          </p>
        </div>
      </div>

      {/* Workflow Actions */}
      {userRole && (
        <SunbulWorkflowActions
          clientId={clientId}
          recordId={recordId}
          status={record.status}
          userRole={userRole as "PlatformAdmin" | "Operator" | "Reviewer"}
          onActionComplete={loadData}
        />
      )}

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold mb-2">الوصف</h2>
            {record.description ? (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {record.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground/50">لا يوجد وصف</p>
            )}
          </div>

          {/* Timeline */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold mb-3">التواريخ</h2>
            <div className="grid grid-cols-2 gap-3">
              {dateFields.map((f) => (
                <div key={f.label}>
                  <span className="block text-[10px] text-muted-foreground">
                    {f.label}
                  </span>
                  <span className="text-sm">
                    {new Date(f.value!).toLocaleDateString("ar-SA", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold mb-3">المراجعات</h2>
            <SunbulReviewPanel clientId={clientId} recordId={recordId} />
          </div>

          {/* Audit Trail */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold mb-3">سجل الأثر</h2>
            <SunbulAuditTrail clientId={clientId} recordId={recordId} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <SunbulDocumentPanel
            clientId={clientId}
            recordId={recordId}
            recordStatus={record.status}
            userRole={userRole}
          />

          {/* Export */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold mb-3">التصدير</h2>
            {record.status === "Approved" || record.status === "Archived" ? (
              <a
                href={`/api/sunbul/clients/${clientId}/records/${recordId}/export/pdf`}
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
        </div>
      </div>
    </div>
  );
}
