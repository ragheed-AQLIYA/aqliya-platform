"use client";

import { cn } from "@/lib/utils";
import {
  FileText,
  Clock,
  CheckCircle2,
  Download,
  AlertTriangle,
} from "lucide-react";
import type { DashboardStats } from "./use-workflow-dashboard";

const STAT_CARD_DEFS = [
  { key: "total" as const, label: "إجمالي القضايا", icon: FileText, color: "text-primary", bg: "bg-primary/10" },
  { key: "draft" as const, label: "مسودة", icon: Clock, color: "text-muted-foreground", bg: "bg-muted" },
  { key: "underReview" as const, label: "تحت المراجعة", icon: Clock, color: "text-status-warning", bg: "bg-status-warning/10" },
  { key: "approved" as const, label: "معتمدة", icon: CheckCircle2, color: "text-status-success", bg: "bg-status-success/10" },
  { key: "pendingExports" as const, label: "طلبات تصدير معلقة", icon: Download, color: "text-blue-600", bg: "bg-blue-100" },
  { key: "escalated" as const, label: "طلبات مُصعدة", icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-100" },
];

export function StatCardsGrid({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {STAT_CARD_DEFS.map(({ key, label, icon: Icon, color, bg }) => (
        <div
          key={key}
          className="rounded-lg border bg-card p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className={cn("rounded-full p-2", bg)}>
              <Icon className={cn("h-5 w-5", color)} />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats[key]}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
