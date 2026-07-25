"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Shield } from "lucide-react";
import type { AuditEventItem } from "./types";

interface Props {
  events: AuditEventItem[];
}

export function AuditTrailSection({ events }: Props) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          سجل التدقيق
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-muted-foreground text-sm">لا توجد أحداث مسجلة</p>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-2 border-b last:border-b-0 text-sm"
              >
                <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{event.action}</Badge>
                    {event.actorName && (
                      <span className="text-muted-foreground">{event.actorName}</span>
                    )}
                  </div>
                  {event.fromStatus && event.toStatus && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {event.fromStatus} → {event.toStatus}
                    </p>
                  )}
                  {event.comment && (
                    <p className="text-xs text-muted-foreground mt-0.5">{event.comment}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(event.createdAt).toLocaleString("ar-SA")}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
