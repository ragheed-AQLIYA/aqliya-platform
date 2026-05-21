"use client";

import { useState, useEffect, useCallback } from "react";
import { WorkspaceStatus } from "@/components/workspace/workspace-status";
import { SunbulClientSelector } from "@/components/sunbul/sunbul-client-selector";
import { SunbulRecordList } from "@/components/sunbul/sunbul-record-list";
import { SunbulCreateRecordForm } from "@/components/sunbul/sunbul-create-record-form";
import { SunbulReviewQueue } from "@/components/sunbul/sunbul-review-queue";
import { SunbulEmptyState } from "@/components/sunbul/sunbul-empty-state";
import {
  sunbul_listRecords,
  sunbul_getUserRole,
} from "@/actions/sunbul-actions";
import { cn } from "@/lib/utils";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
  ShieldCheck,
  Download,
} from "lucide-react";

export function SunbulDashboard() {
  const [clientId, setClientId] = useState<string | null>(null);
  const [noAccess, setNoAccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    underReview: 0,
    approved: 0,
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
    sunbul_getUserRole(clientId!).then((r) => {
      if (r.success) setUserRole(r.data as string | null);
    });
  }, [clientId]);

  useEffect(() => {
    if (!clientId) return;
    sunbul_listRecords(clientId!).then((result) => {
      if (result.success && result.data) {
        const records = result.data as Array<{ status: string }>;
        setStats({
          total: records.length,
          draft: records.filter((r) => r.status === "Draft").length,
          underReview: records.filter((r) => r.status === "UnderReview").length,
          approved: records.filter((r) => r.status === "Approved").length,
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
  }, [clientId, refreshKey]);

  if (noAccess) {
    return (
      <SunbulEmptyState
        title="لا توجد صلاحية وصول"
        description="ليس لديك صلاحية الوصول إلى أي عميل في سنبل. يرجى التواصل مع المشرف."
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
  ];

  return (
    <div className="space-y-6">
      <WorkspaceStatus
        module="platform"
        status="healthy"
        message="مساحة عمل سنبل — إدارة القضايا والملفات ضمن عزل متعدد العملاء"
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-h2 font-black text-foreground">سنبل</h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            مساحة عمل لإدارة القضايا والملفات ضمن عزل متعدد العملاء
          </p>
        </div>
        <SunbulClientSelector
          clientId={clientId}
          onClientChange={setClientId}
        />
      </div>

      {!clientId ? (
        <SunbulEmptyState
          title="اختر عميلاً للبدء"
          description="يبدو أنه ليس لديك عملاء نشطون بعد. يرجى التواصل مع المشرف."
          icon={FolderKanban}
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                  <SunbulCreateRecordForm
                    clientId={clientId}
                    onCreated={onCreated}
                  />
                )}
              </div>
              <SunbulRecordList clientId={clientId} refreshKey={refreshKey} />
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold mb-2">قائمة المراجعة</h2>
                {userRole === "Reviewer" || userRole === "PlatformAdmin" ? (
                  <SunbulReviewQueue clientId={clientId} />
                ) : (
                  <div className="rounded-lg border bg-card p-4 text-center">
                    <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-2 text-xs text-muted-foreground">
                      متاحة للمراجعين فقط
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-sm font-semibold mb-2">المستندات</h2>
                <div className="rounded-lg border bg-card p-4 text-center">
                  <FolderKanban className="mx-auto h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    سيتم تفعيلها في Phase 2C
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold mb-2">التصدير</h2>
                <div className="rounded-lg border bg-card p-4 text-center">
                  <Download className="mx-auto h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    سيتم تفعيله لاحقاً
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
