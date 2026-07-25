"use client";
import { STATUS_LABELS } from "./constants";

export function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABELS[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${label?.color || ""}`}
    >
      {label?.en || status}
    </span>
  );
}
