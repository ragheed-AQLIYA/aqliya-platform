import { getDecisionTimeline } from "@/actions/approval";

function formatTime(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "منذ دقائق";
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `منذ ${days} يوم`;
  return date.toLocaleDateString("ar-SA");
}

export async function RecentActivity({ decisionId }: { decisionId: string }) {
  const result = await getDecisionTimeline(decisionId);
  if (!result.success || !result.data) return null;

  const events = result.data.slice(-10);

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-sm font-semibold mb-3">آخر النشاطات</h3>
      <div className="space-y-2">
        {events.length === 0 ? (
          <p className="text-xs text-muted-foreground">لا توجد نشاطات</p>
        ) : (
          events.map((event, i) => (
            <div
              key={`${event.type}-${event.date.getTime()}`}
              className="flex items-start gap-3 text-sm p-2 rounded hover:bg-muted transition-colors"
            >
              <div className="h-2 w-2 mt-1.5 rounded-full bg-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-xs">{event.label}</p>
                <p className="text-[10px] text-muted-foreground">
                  {event.actor ? `${event.actor} · ` : ""}{formatTime(event.date)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
