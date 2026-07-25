"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import type { TimelineEvent } from "@/lib/decision/decision-timeline";

interface DecisionTimelineProps {
  timeline: TimelineEvent[];
  loadingTimeline: boolean;
  onLoadTimeline: () => void;
}

export function DecisionTimeline({
  timeline,
  loadingTimeline,
  onLoadTimeline,
}: DecisionTimelineProps) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          الخط الزمني للقرار
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onLoadTimeline}
          disabled={loadingTimeline}
        >
          {loadingTimeline
            ? "جارٍ التحميل..."
            : timeline.length > 0
              ? "تحديث الخط الزمني"
              : "تحميل الخط الزمني"}
        </Button>
      </div>
      {timeline.length > 0 && (
        <div className="space-y-0">
          {timeline.map((event, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`h-3 w-3 rounded-full ${event.isCritical ? "bg-red-500" : event.category === "governance" ? "bg-amber-500" : event.category === "publication" ? "bg-blue-500" : "bg-muted"}`}
                />
                {i < timeline.length - 1 && (
                  <div className="w-px h-8 bg-border" />
                )}
              </div>
              <div className="pb-6 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {event.label}
                    </span>
                    {event.isCritical && (
                      <Badge variant="destructive" className="text-xs">
                        حرج
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleString()}
                  </span>
                </div>
                {event.actor && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    بواسطة: {event.actor}
                  </p>
                )}
                {event.details && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {event.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
