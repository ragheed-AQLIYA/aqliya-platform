"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOutreachEventsAction } from "@/actions/sales-intel-actions";
import {
  Mail,
  MousePointerClick,
  Reply,
  AlertTriangle,
  CalendarCheck,
  Clock,
  RefreshCcw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OutreachEventView {
  id: string;
  type: "sent" | "opened" | "clicked" | "replied" | "bounced" | "meeting_booked";
  contactName: string;
  contactEmail: string;
  occurredAt: Date;
  metadata?: Record<string, unknown>;
}

const EVENT_CONFIG: Record<
  OutreachEventView["type"],
  { icon: React.ReactNode; label: string; color: string; bg: string }
> = {
  sent: {
    icon: <Mail className="h-4 w-4" />,
    label: "تم الإرسال",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
  },
  opened: {
    icon: <MousePointerClick className="h-4 w-4" />,
    label: "تم الفتح",
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
  },
  clicked: {
    icon: <ExternalLink className="h-4 w-4" />,
    label: "نقر الرابط",
    color: "text-indigo-600",
    bg: "bg-indigo-50 border-indigo-200",
  },
  replied: {
    icon: <Reply className="h-4 w-4" />,
    label: "رد إيجابي",
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
  },
  bounced: {
    icon: <AlertTriangle className="h-4 w-4" />,
    label: "ارتداد",
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
  },
  meeting_booked: {
    icon: <CalendarCheck className="h-4 w-4" />,
    label: "تم حجز اجتماع",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
  },
};

/**
 * OutreachTimeline — shows real-time outreach events for a deal.
 * Data comes from SmartLead/Apollo webhooks processed by salesos-handlers.ts.
 */
export function OutreachTimeline({
  dealId,
  accountId,
}: {
  dealId: string;
  accountId: string;
}) {
  const [events, setEvents] = useState<OutreachEventView[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadEvents = async () => {
    setLoading(true);
    try {
      const result = await getOutreachEventsAction(dealId);
      if (result.success && result.events) {
        const mapped: OutreachEventView[] = result.events.map((e) => ({
          id: e.id,
          type: (e.type as OutreachEventView["type"]) || "sent",
          contactName: e.contactName,
          contactEmail: e.contactEmail,
          occurredAt: new Date(e.occurredAt),
        }));
        setEvents(mapped);
      }
      setLastRefresh(new Date());
    } catch {
      // Failed to load — show empty state
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadEvents, 30_000);
    return () => clearInterval(interval);
  }, [dealId]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">سجل التواصل</CardTitle>
            <Badge variant="outline" className="text-xs">
              {events.length} حدث
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadEvents}
            disabled={loading}
          >
            <RefreshCcw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          آخر تحديث: {lastRefresh.toLocaleTimeString("ar-SA")}
        </p>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            <Mail className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>لا توجد أحداث تواصل بعد</p>
            <p className="text-xs mt-1">
              سيتم تحديث هذا السجل تلقائياً عند إرسال الحملات
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {events.map((event, i) => {
              const config = EVENT_CONFIG[event.type] ?? EVENT_CONFIG.sent;
              return (
                <div key={event.id} className="relative flex gap-3 pb-3">
                  {/* Timeline line */}
                  {i < events.length - 1 && (
                    <div className="absolute right-[11px] top-6 bottom-0 w-0.5 bg-border" />
                  )}
                  {/* Icon */}
                  <div
                    className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full ${config.bg} border`}
                  >
                    {config.icon}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {event.occurredAt.toLocaleTimeString("ar-SA", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm">{event.contactName}</p>
                    {event.contactEmail && (
                      <p className="text-xs text-muted-foreground">
                        {event.contactEmail}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
