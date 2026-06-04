"use client";

import { useState, useEffect, useCallback } from "react";
import { WorkspaceStatus } from "@/components/workspace/workspace-status";
import { WorkflowClientSelector } from "@/components/workflowos/workflow-client-selector";
import { WorkflowRecordList } from "@/components/workflowos/workflow-record-list";
import { WorkflowCreateRecordForm } from "@/components/workflowos/workflow-create-record-form";
import { WorkflowReviewQueue } from "@/components/workflowos/workflow-review-queue";
import { WorkflowEmptyState } from "@/components/workflowos/workflow-empty-state";
import {
  workflow_listRecords,
  workflow_getUserRole,
} from "@/actions/workflowos-actions";
import { getCurrentUserPendingExportCount, getWorkflowExportStatus } from "@/actions/workflowos-export-actions";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
  ShieldCheck,
  Download,
  AlertTriangle,
  Bell,
} from "lucide-react";

export function WorkflowDashboard() {
  const [clientId, setClientId] = useState<string | null>(null);
  const [noAccess, setNoAccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    underReview: 0,
    approved: 0,
    pendingExports: 0,
    escalated: 0,
  });
  const [userRole, setUserRole] = useState<string | null>(null);

  const onCreated = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!clientId) {
      Promise.resolve().then(() => setUserRole(null));
      return;
    }
    workflow_getUserRole(clientId!).then((r) => {
      if (r.success) setUserRole(r.data as string | null);
    });
  }, [clientId]);

  useEffect(() => {
    if (!clientId) return;
    workflow_listRecords(clientId!).then((result) => {
      if (result.success && result.data) {
        const records = result.data as Array<{ status: string }>;
        setStats({
          total: records.length,
          draft: records.filter((r) => r.status === "Draft").length,
          underReview: records.filter((r) => r.status === "UnderReview").length,
          approved: records.filter((r) => r.status === "Approved").length,
          pendingExports: 0,
          escalated: 0,
        });
      }
      if (!result.success) {
        if (result.error?.includes("Access denied")) {
          setNoAccess(true);
        } else if (result.error?.includes("Unauthenticated")) {
          setNoAccess(true);
        }
      }
    });
    getCurrentUserPendingExportCount().then((result) => {
      if (result.success && result.data) {
        setStats((prev) => ({
          ...prev,
          pendingExports: result.data.pending,
          escalated: result.data.escalated,
        }));
      }
    });
  }, [clientId, refreshKey]);

  if (noAccess) {
    return (
      <WorkflowEmptyState
        title="لا توجد صلاحية وصول"
        description="ليس لديك صلاحية الوصول إلى أي عميل في سير العمل الذكي. يرجى التواصل مع المشرف."
        icon={AlertCircle}
      />
    );
  }

  const statCards = [
    {
      label: "إجمالي القضايا",
      value: stats.total,
      icon: FileText,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "مسودة",
      value: stats.draft,
      icon: Clock,
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
    {
      label: "تحت المراجعة",
      value: stats.underReview,
      icon: Clock,
      color: "text-status-warning",
      bg: "bg-status-warning/10",
    },
    {
      label: "معتمدة",
      value: stats.approved,
      icon: CheckCircle2,
      color: "text-status-success",
      bg: "bg-status-success/10",
    },
    {
      label: "طلبات تصدير معلقة",
      value: stats.pendingExports,
      icon: Download,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "طلبات مُصعدة",
      value: stats.escalated,
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  return (
    <div className="space-y-6">
      <WorkspaceStatus
        module="platform"
        status="healthy"
        message="مساحة عمل سير العمل الذكي — إدارة القضايا والملفات ضمن عزل متعدد العملاء"
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-h2 font-black text-foreground">
            سير العمل الذكي
          </h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            مساحة عمل لإدارة القضايا والملفات ضمن عزل متعدد العملاء
          </p>
        </div>
        <WorkflowClientSelector
          clientId={clientId}
          onClientChange={setClientId}
        />
      </div>

      {!clientId ? (
        <WorkflowEmptyState
          title="اختر عميلاً للبدء"
          description="يبدو أنه ليس لديك عملاء نشطون بعد. يرجى التواصل مع المشرف."
          icon={FolderKanban}
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="rounded-lg border bg-card p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("rounded-full p-2", card.bg)}>
                    <card.icon className={cn("h-5 w-5", card.color)} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <div className="text-xs text-muted-foreground">
                      {card.label}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">القضايا</h2>
                {(userRole === "Operator" || userRole === "PlatformAdmin") && (
                  <WorkflowCreateRecordForm
                    clientId={clientId}
                    onCreated={onCreated}
                  />
                )}
              </div>
              <WorkflowRecordList clientId={clientId} refreshKey={refreshKey} />
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold mb-2">قائمة المراجعة</h2>
                {userRole === "Reviewer" || userRole === "PlatformAdmin" ? (
                  <WorkflowReviewQueue clientId={clientId} />
                ) : (
                  <div className="rounded-lg border bg-card p-4 text-center">
                    <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-2 text-xs text-muted-foreground">
                      متاحة للمراجعين فقط
                    </p>
                  </div>
                )}
              </div>

              <Link
                href="/workflowos/records"
                className="block rounded-lg border bg-card p-4 text-center hover:bg-muted/30 transition-colors"
              >
                <FolderKanban className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-xs text-muted-foreground">
                  عرض جميع القضايا وإدارة الأدلة
                </p>
              </Link>

              {(userRole === "Reviewer" || userRole === "PlatformAdmin") && (
                <Link
                  href="/workflowos/records"
                  className="block rounded-lg border bg-card p-4 text-center hover:bg-muted/30 transition-colors"
                >
                  <Download className="mx-auto h-8 w-8 text-blue-600/50" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    طلبات التصدير
                    {stats.pendingExports > 0 && (
                      <span className="mr-1 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        {stats.pendingExports}
                      </span>
                    )}
                  </p>
                </Link>
              )}

              {stats.escalated > 0 && (
                <Link
                  href="/workflowos/records"
                  className="block rounded-lg border border-orange-200 bg-orange-50 p-4 text-center hover:bg-orange-100 transition-colors"
                >
                  <AlertTriangle className="mx-auto h-8 w-8 text-orange-600/70" />
                  <p className="mt-2 text-xs font-medium text-orange-800">
                    طلبات مُصعدة — {stats.escalated}
                  </p>
                </Link>
              )}

              <Link
                href="/workflowos/records"
                className="block rounded-lg border bg-card p-4 text-center hover:bg-muted/30 transition-colors"
              >
                <Download className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-xs text-muted-foreground">
                  تصدير — متاح بعد اعتماد القضية
                </p>
              </Link>

              <Link
                href="/workflowos/admin"
                className="block rounded-lg border bg-card p-4 text-center hover:bg-muted/30 transition-colors"
              >
                <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-xs text-muted-foreground">
                  إدارة القوالب والإعدادات
                </p>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
