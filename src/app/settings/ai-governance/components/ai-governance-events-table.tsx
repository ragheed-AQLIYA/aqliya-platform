"use client";

import type { AiGovernanceStats } from "@/actions/ai-governance-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { StatusBadge } from "./status-badge";

interface Props {
  stats: AiGovernanceStats;
  formatDate: (iso: string) => string;
}

export function AiGovernanceEventsTable({ stats, formatDate }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          آخر الأحداث / Recent AI Events
        </CardTitle>
        <CardDescription className="text-xs">
          آخر 20 نشاط AI عبر المنتجات
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stats.recentEvents.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <p>لا توجد أحداث AI مسجلة بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium">المصدر</th>
                  <th className="pb-2 font-medium">الإجراء</th>
                  <th className="pb-2 font-medium">الحالة</th>
                  <th className="pb-2 font-medium">الثقة</th>
                  <th className="pb-2 font-medium">المزود</th>
                  <th className="pb-2 font-medium">النموذج</th>
                  <th className="pb-2 font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentEvents.map((event) => (
                  <tr key={event.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-2">
                      <Badge
                        variant="outline"
                        className={
                          event.source === "localcontent"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }
                      >
                        {event.source === "localcontent" ? "LC" : "Platform"}
                      </Badge>
                    </td>
                    <td className="py-2 max-w-[160px] truncate">
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {event.action}
                      </code>
                    </td>
                    <td className="py-2">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="py-2">
                      {event.confidence !== null ? `${event.confidence}%` : "—"}
                    </td>
                    <td className="py-2 text-xs text-muted-foreground">
                      {event.providerId ?? "—"}
                    </td>
                    <td className="py-2 text-xs text-muted-foreground">
                      {event.modelVersion ?? "—"}
                    </td>
                    <td className="py-2 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(event.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
