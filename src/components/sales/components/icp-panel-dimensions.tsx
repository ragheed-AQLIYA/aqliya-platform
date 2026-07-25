"use client";

import type { IcpFitDimensions } from "@/lib/sales/icp-types";

function DimensionRow({
  label,
  value,
}: {
  label: string;
  value: number | null | undefined;
}) {
  if (value == null) return null;
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}%</span>
    </div>
  );
}

export function DimensionsBlock({
  dimensions,
}: {
  dimensions: IcpFitDimensions;
}) {
  const rows = [
    { label: "الألم", value: dimensions.pain },
    { label: "الإلحاح", value: dimensions.urgency },
    { label: "الميزانية", value: dimensions.budget },
    { label: "الصلاحية", value: dimensions.authority },
  ].filter((r) => r.value != null);

  if (rows.length === 0) return null;

  return (
    <div className="space-y-1 rounded-md border bg-muted/30 p-3">
      <p className="text-xs font-medium text-muted-foreground">أبعاد الملاءمة</p>
      {rows.map((row) => (
        <DimensionRow key={row.label} label={row.label} value={row.value} />
      ))}
    </div>
  );
}
