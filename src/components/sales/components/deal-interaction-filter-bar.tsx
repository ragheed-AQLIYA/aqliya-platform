"use client";

import { TYPE_OPTIONS, ALL_TYPES_VALUE } from "./use-deal-interaction-panel";

export function DealInteractionFilterBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-muted-foreground">تصفية حسب النوع</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-9 min-w-[140px] rounded-md border border-input bg-background px-3 py-1 text-sm"
        aria-label="تصفية التفاعلات"
      >
        <option value={ALL_TYPES_VALUE}>الكل</option>
        {TYPE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
