"use client";

export function FilterBar({
  canonicalFilter,
  onCanonicalFilterChange,
  minConfidence,
  onMinConfidenceChange,
  promotedAfter,
  onPromotedAfterChange,
}: {
  canonicalFilter: string;
  onCanonicalFilterChange: (value: string) => void;
  minConfidence: number;
  onMinConfidenceChange: (value: number) => void;
  promotedAfter: string;
  onPromotedAfterChange: (value: string) => void;
}) {
  return (
    <div className="mb-3 grid gap-2 sm:grid-cols-3">
      <input
        type="text"
        value={canonicalFilter}
        onChange={(e) => onCanonicalFilterChange(e.target.value)}
        placeholder="تصفية بالرمز أو العبارة..."
        className="rounded-lg border bg-background p-2 text-xs"
      />
      <label className="flex items-center gap-2 text-xs">
        <span className="shrink-0">أدنى ثقة %</span>
        <input
          type="range"
          min={0}
          max={100}
          value={minConfidence}
          onChange={(e) => onMinConfidenceChange(Number(e.target.value))}
          className="flex-1"
        />
        <span className="w-8 font-mono">{minConfidence}</span>
      </label>
      <input
        type="date"
        value={promotedAfter}
        onChange={(e) => onPromotedAfterChange(e.target.value)}
        className="rounded-lg border bg-background p-2 text-xs"
        title="تاريخ الترقية من"
      />
    </div>
  );
}
