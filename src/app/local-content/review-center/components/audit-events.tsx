"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface AuditEventItem {
  id: string;
  action: string;
  status: string;
  confidence?: number;
  durationMs: number;
  createdAt: string;
}

interface AuditEventsProps {
  events: AuditEventItem[];
}

export function AuditEvents({ events }: AuditEventsProps) {
  if (events.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-3">
        📋 آخر أحداث التدقيق / Recent Audit Events
      </h2>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-right px-3 py-2 font-medium">الإجراء / Action</th>
                <th className="text-right px-3 py-2 font-medium">الحالة / Status</th>
                <th className="text-right px-3 py-2 font-medium">الثقة / Confidence</th>
                <th className="text-right px-3 py-2 font-medium">المدة (مللي) / Duration</th>
                <th className="text-right px-3 py-2 font-medium">التاريخ / Date</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-xs">{event.action}</td>
                  <td className="px-3 py-2">
                    <Badge
                      variant={
                        event.status === "success"
                          ? "default"
                          : event.status === "partial"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-xs"
                    >
                      {event.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    {event.confidence != null
                      ? `${Math.round(event.confidence * 100)}%`
                      : "—"}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {event.durationMs.toLocaleString()}ms
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {new Date(event.createdAt).toLocaleDateString("ar-SA", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
