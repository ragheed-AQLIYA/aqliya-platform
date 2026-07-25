"use client";

import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  partial: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  recorded: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  pending: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={statusColors[status] ?? "bg-gray-100"}>
      {status}
    </Badge>
  );
}
