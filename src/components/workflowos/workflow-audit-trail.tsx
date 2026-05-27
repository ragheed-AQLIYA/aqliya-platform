"use client";

import { useEffect, useState } from "react";
import { workflow_listAuditEvents } from "@/actions/workflowos-actions";
import { Loader2, Activity } from "lucide-react";

const actionLabels: Record<string, string> = {
  RECORD_CREATED: "تم إنشاء القضية",
  RECORD_UPDATED: "تم تحديث القضية",
  RECORD_SUBMITTED: "تم إرسال القضية للمراجعة",
  RECORD_APPROVED: "تم اعتماد القضية",
  RECORD_RETURNED: "تم إرجاع القضية",
  RECORD_ARCHIVED: "تم أرشفة القضية",
  RECORD_EXPORTED: "تم تصدير القضية",
  REVIEW_CREATED: "تم إضافة مراجعة",
  DOCUMENT_CREATED: "تم إضافة مستند",
  DOCUMENT_DELETED: "تم حذف مستند",
  CLIENT_CREATED: "تم إنشاء العميل",
  MEMBERSHIP_CREATED: "تم إضافة عضوية",
  MEMBERSHIP_ROLE_CHANGED: "تم تغيير دور العضو",
  MEMBERSHIP_STATUS_CHANGED: "تم تغيير حالة العضوية",
};

interface AuditEventItem {
  id: string;
  action: string;
  actorId: string;
  createdAt: Date;
  metadata?: Record<string, unknown> | null;
}

export function WorkflowAuditTrail({
  clientId,
  recordId,
}: {
  clientId: string;
  recordId: string;
}) {
  const [events, setEvents] = useState<AuditEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    workflow_listAuditEvents(clientId, { recordId }).then((result) => {
      if (result.success && result.data) {
        setEvents(result.data.events as AuditEventItem[]);
      } else {
        setError(result.error ?? "فشل تحميل سجل الأثر");
      }
      setLoading(false);
    });
  }, [clientId, recordId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
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

  if (events.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-4 text-center text-sm text-muted-foreground">
        لا توجد أحداث بعد
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {events.map((event, idx) => (
        <div key={event.id} className="relative flex gap-3 pb-4">
          {idx < events.length - 1 && (
            <div className="absolute right-[7px] top-4 bottom-0 w-px bg-border" />
          )}
          <div className="mt-1 shrink-0">
            <div className="h-3.5 w-3.5 rounded-full border-2 border-primary bg-background" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium">
                {actionLabels[event.action] ?? event.action}
              </span>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {new Date(event.createdAt).toLocaleDateString("ar-SA", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="mt-0.5 text-[10px] text-muted-foreground/60">
              الفاعل: {event.actorId.slice(0, 8)}...
              {event.metadata &&
                typeof event.metadata === "object" &&
                "previousStatus" in event.metadata &&
                "newStatus" in event.metadata && (
                  <span className="mr-2">
                    | من{" "}
                    {String(
                      (event.metadata as Record<string, unknown>)
                        .previousStatus,
                    )}{" "}
                    إلى{" "}
                    {String(
                      (event.metadata as Record<string, unknown>).newStatus,
                    )}
                  </span>
                )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
