import Link from "next/link";
import { listOrgSalesAuditEventsAction } from "@/actions/sales-actions";
import {
  SalesNavLinks,
  SalesPageHeader,
  SalesInlineNotice,
  SalesEmptyState,
} from "@/components/sales/sales-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { SalesAuditActions } from "@/lib/sales/audit-events";
import { getSalesPermissionsForRole } from "@/lib/sales/permissions";
import { parseSalesAuditTrailFilters } from "@/lib/sales/audit-trail";
import { History, User } from "lucide-react";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  [SalesAuditActions.DEAL_CREATED]: "إنشاء صفقة",
  [SalesAuditActions.DEAL_UPDATED]: "تحديث صفقة",
  [SalesAuditActions.DEAL_STAGE_CHANGED]: "تغيير مرحلة الصفقة",
  [SalesAuditActions.DEAL_STATUS_CHANGED]: "تغيير حالة الصفقة",
  [SalesAuditActions.ACCOUNT_CREATED]: "إنشاء حساب",
  [SalesAuditActions.ACCOUNT_UPDATED]: "تحديث حساب",
  [SalesAuditActions.ACCOUNT_VIEWED]: "عرض حساب",
  [SalesAuditActions.PIPELINE_VIEWED]: "عرض المسار",
  [SalesAuditActions.EVIDENCE_LINKED]: "ربط دليل",
  [SalesAuditActions.EVIDENCE_UNLINKED]: "إلغاء ربط دليل",
  [SalesAuditActions.INTERACTION_CREATED]: "إنشاء تفاعل",
  [SalesAuditActions.INTERACTION_UPDATED]: "تحديث تفاعل",
  [SalesAuditActions.INTERACTION_DELETED]: "حذف تفاعل",
  [SalesAuditActions.DEAL_NEXT_ACTION_SET]: "تعيين الإجراء التالي",
  [SalesAuditActions.SIGNAL_CREATED]: "إنشاء إشارة",
  [SalesAuditActions.OUTREACH_DRAFT_CREATED]: "مسودة outreach",
  [SalesAuditActions.OUTREACH_REVIEWED]: "مراجعة outreach",
  [SalesAuditActions.GOVERNANCE_OVERRIDE]: "تجاوز حوكمة",
  [SalesAuditActions.GOVERNANCE_REVIEW_DECISION]: "قرار مراجعة حوكمة",
  [SalesAuditActions.REPORTS_VIEWED]: "عرض تقرير",
};

const TARGET_TYPE_OPTIONS = [
  { value: "", label: "كل الأنواع" },
  { value: "SalesDeal", label: "صفقة" },
  { value: "SalesAccount", label: "حساب" },
  { value: "SalesPipeline", label: "مسار" },
  { value: "SalesInteraction", label: "تفاعل" },
  { value: "SalesEvidenceLink", label: "ربط دليل" },
  { value: "SalesReport", label: "تقرير" },
];

function targetLink(targetType: string, targetId: string): string | null {
  if (targetType === "SalesDeal") return `/sales/deals/${targetId}`;
  if (targetType === "SalesAccount") return `/sales/accounts/${targetId}`;
  return null;
}

export default async function SalesAuditTrailPage({
  searchParams,
}: {
  searchParams: Promise<{
    targetType?: string;
    action?: string;
    from?: string;
    to?: string;
    limit?: string;
    cursor?: string;
  }>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const { canCreate } = getSalesPermissionsForRole(user.role);

  const res = await listOrgSalesAuditEventsAction(
    parseSalesAuditTrailFilters({
      targetType: sp.targetType,
      action: sp.action,
      from: sp.from,
      to: sp.to,
      limit: sp.limit,
      cursor: sp.cursor,
    }),
  );

  if (!res.ok) {
    return (
      <div dir="rtl">
        <SalesNavLinks active="audit-trail" canCreate={canCreate} />
        <SalesInlineNotice
          variant="error"
          title="تعذر تحميل سجل التدقيق"
          description={res.error}
        />
      </div>
    );
  }

  const events = res.data;
  const nextCursor =
    events.length > 0 && events.length >= Number(sp.limit || 100)
      ? events[events.length - 1]?.id
      : null;

  return (
    <div dir="rtl">
      <SalesNavLinks active="audit-trail" canCreate={canCreate} />
      <SalesPageHeader
        title="سجل تدقيق SalesOS"
        subtitle="قراءة فقط — أحداث org-scoped (حد 100 افتراضي)"
      />

      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
        SalesOS v0.3 PR-12 — سجل SalesAuditEvent. لا تعديل ولا حذف من هذه الصفحة.
      </div>

      <form
        method="get"
        className="mb-6 grid gap-3 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <label className="text-sm space-y-1">
          <span className="text-muted-foreground">نوع الهدف</span>
          <select
            name="targetType"
            defaultValue={sp.targetType ?? ""}
            className="w-full rounded border bg-background px-2 py-1.5 text-sm"
          >
            {TARGET_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm space-y-1">
          <span className="text-muted-foreground">بادئة الإجراء</span>
          <input
            name="action"
            type="text"
            defaultValue={sp.action ?? ""}
            placeholder="sales.deal"
            className="w-full rounded border bg-background px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-sm space-y-1">
          <span className="text-muted-foreground">من تاريخ</span>
          <input
            name="from"
            type="datetime-local"
            defaultValue={sp.from ?? ""}
            className="w-full rounded border bg-background px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-sm space-y-1">
          <span className="text-muted-foreground">إلى تاريخ</span>
          <input
            name="to"
            type="datetime-local"
            defaultValue={sp.to ?? ""}
            className="w-full rounded border bg-background px-2 py-1.5 text-sm"
          />
        </label>
        <div className="flex flex-wrap items-end gap-2 md:col-span-2 lg:col-span-4">
          <button
            type="submit"
            className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground"
          >
            تطبيق الفلاتر
          </button>
          <Link
            href="/sales/audit-trail"
            className="rounded border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            إعادة ضبط
          </Link>
        </div>
      </form>

      <p className="mb-4 text-xs text-muted-foreground">
        {events.length} حدث — صلاحية salesos:read
      </p>

      {events.length === 0 ? (
        <SalesEmptyState
          title="لا أحداث تدقيق"
          description="جرّب توسيع الفلاتر أو نفّذ عمليات على الصفقات/الحسابات."
        />
      ) : (
        <div className="space-y-2">
          {events.map((event) => {
            const href = targetLink(event.targetType, event.targetId);
            return (
              <Card key={event.id}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 min-w-0">
                      <History className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {ACTION_LABELS[event.action] ?? event.action}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {event.targetType}
                            {href ? (
                              <>
                                {" · "}
                                <Link
                                  href={href}
                                  className="text-primary hover:underline"
                                >
                                  {event.targetId.slice(0, 8)}…
                                </Link>
                              </>
                            ) : (
                              <> · {event.targetId.slice(0, 8)}…</>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <User className="h-3 w-3" />
                        {event.actorName || event.actorId}
                      </div>
                      <div className="text-[9px] text-muted-foreground">
                        {new Date(event.createdAt).toLocaleString("ar-SA")}
                      </div>
                    </div>
                  </div>
                  {event.metadata != null ? (
                    <details className="mt-1">
                      <summary className="text-[10px] text-muted-foreground cursor-pointer">
                        بيانات إضافية
                      </summary>
                      <pre className="text-[9px] text-muted-foreground mt-1 whitespace-pre-wrap">
                        {JSON.stringify(event.metadata, null, 2)}
                      </pre>
                    </details>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {nextCursor ? (
        <div className="mt-4">
          <Link
            href={{
              pathname: "/sales/audit-trail",
              query: {
                ...(sp.targetType ? { targetType: sp.targetType } : {}),
                ...(sp.action ? { action: sp.action } : {}),
                ...(sp.from ? { from: sp.from } : {}),
                ...(sp.to ? { to: sp.to } : {}),
                ...(sp.limit ? { limit: sp.limit } : {}),
                cursor: nextCursor,
              },
            }}
            className="text-sm text-primary hover:underline"
          >
            المزيد (cursor)
          </Link>
        </div>
      ) : null}
    </div>
  );
}
