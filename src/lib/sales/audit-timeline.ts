import { SalesAuditActions } from "./audit-events";

export interface SalesAuditTimelineRow {
  id: string;
  action: string;
  actorId: string;
  actorName: string | null;
  metadata: unknown;
  createdAt: Date;
}

const ACTION_LABELS: Record<string, string> = {
  [SalesAuditActions.DEAL_CREATED]: "تم إنشاء الصفقة",
  [SalesAuditActions.DEAL_UPDATED]: "تم تحديث الصفقة",
  [SalesAuditActions.DEAL_STAGE_CHANGED]: "تغيير مرحلة المسار",
};

export function mapSalesAuditEventsToTimeline(events: SalesAuditTimelineRow[]) {
  return events.map((event) => {
    const isStageChange = event.action === SalesAuditActions.DEAL_STAGE_CHANGED;
    const metadata =
      event.metadata && typeof event.metadata === "object"
        ? (event.metadata as Record<string, unknown>)
        : null;

    let description: string | undefined;
    if (isStageChange && metadata) {
      description = `من ${String(metadata.fromStageId ?? "—")} إلى ${String(metadata.toStageId ?? "—")}`;
    } else if (
      event.action === SalesAuditActions.DEAL_CREATED &&
      metadata?.title
    ) {
      description = String(metadata.title);
    }

    return {
      id: event.id,
      timestamp: event.createdAt,
      type: isStageChange ? ("status_change" as const) : ("action" as const),
      title: ACTION_LABELS[event.action] ?? event.action,
      description,
      actor: event.actorName ?? event.actorId,
    };
  });
}
