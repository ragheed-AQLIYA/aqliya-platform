"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getMemoryEvents,
  deleteMemoryEvent,
  PRODUCT_LABELS_AR,
  EVENT_TYPE_LABELS_AR,
} from "@/actions/institutional-memory-actions";
import type { MemoryEventData } from "@/actions/institutional-memory-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, RefreshCw } from "lucide-react";

const CONFIDENCE_COLORS: Record<string, string> = {
  "1": "bg-green-100 text-green-800",
  "0.8": "bg-blue-100 text-blue-800",
  "0.5": "bg-yellow-100 text-yellow-800",
  "0.2": "bg-red-100 text-red-800",
};

function confidenceBadge(confidence: number) {
  const key = String(confidence) as keyof typeof CONFIDENCE_COLORS;
  const color = CONFIDENCE_COLORS[key] ?? "bg-gray-100 text-gray-800";
  return (
    <Badge variant="outline" className={color}>
      {Math.round(confidence * 100)}%
    </Badge>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function MemoryEventsPage() {
  const [events, setEvents] = useState<MemoryEventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getMemoryEvents();
    setLoading(false);
    if (res.success && res.data) {
      setEvents(res.data);
    } else {
      setError(res.error ?? "فشل في تحميل الأحداث");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الحدث؟")) return;
    const res = await deleteMemoryEvent(id);
    if (res.success) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">أحداث الذاكرة المؤسسية</h1>
          <p className="text-sm text-muted-foreground">
            Institutional Memory Events — سجل الروابط بين الكيانات عبر المنتجات
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ml-1 ${loading ? "animate-spin" : ""}`} />
          تحديث
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="py-8 text-center text-destructive">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && events.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-3xl mb-2">🔗</p>
            <p className="font-bold text-muted-foreground">لا توجد أحداث بعد</p>
            <p className="text-sm text-muted-foreground">
              سيتم إنشاء الأحداث تلقائياً عند ربط الكيانات عبر المنتجات
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && events.length > 0 && (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id} className="relative">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Event type + confidence */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge>
                        {EVENT_TYPE_LABELS_AR[event.eventType] ?? event.eventType}
                      </Badge>
                      {confidenceBadge(event.confidence)}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(event.createdAt)}
                      </span>
                    </div>

                    {/* Source → Target */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">
                        {PRODUCT_LABELS_AR[event.sourceProduct] ?? event.sourceProduct}
                      </span>
                      <span className="text-xs text-muted-foreground">({event.sourceEntityType})</span>
                      <span className="text-muted-foreground">←</span>
                      <span className="font-medium">
                        {PRODUCT_LABELS_AR[event.targetProduct] ?? event.targetProduct}
                      </span>
                      <span className="text-xs text-muted-foreground">({event.targetEntityType})</span>
                    </div>

                    {/* Description */}
                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    {/* Actor */}
                    {event.createdBy && (
                      <p className="text-xs text-muted-foreground">
                        بواسطة: {event.createdBy.name ?? "النظام"}
                      </p>
                    )}
                  </div>

                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
