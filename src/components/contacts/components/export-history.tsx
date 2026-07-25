"use client";

import { Badge } from "@/components/ui/badge";
import type { ExportRequest } from "./use-export-approval";

interface ExportHistoryProps {
  requests: ExportRequest[];
}

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  approved: "معتمد",
  rejected: "مرفوض",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export function ExportHistory({ requests }: ExportHistoryProps) {
  if (requests.length === 0) return null;

  return (
    <div className="border-t pt-3 space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        سجل طلبات التصدير
      </p>
      {requests.slice(0, 5).map((req) => (
        <div
          key={req.id}
          className="flex items-center justify-between text-xs"
        >
          <span>
            {req.requestedByName || "مستخدم"} —{" "}
            <Badge className={statusColors[req.status] || ""}>
              {statusLabels[req.status] || req.status}
            </Badge>
          </span>
          <span className="text-muted-foreground">
            {new Date(req.createdAt).toLocaleDateString("ar-SA")}
          </span>
        </div>
      ))}
    </div>
  );
}
