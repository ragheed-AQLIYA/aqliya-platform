"use client";

import type { Version } from "./use-diff-viewer";

interface VersionSelectorsProps {
  fromId: string;
  toId: string;
  onFromIdChange: (v: string) => void;
  onToIdChange: (v: string) => void;
  versions: Version[];
  loading: boolean;
  onCompare: () => void;
}

export function VersionSelectors({
  fromId,
  toId,
  onFromIdChange,
  onToIdChange,
  versions,
  loading,
  onCompare,
}: VersionSelectorsProps) {
  const selectable = versions.filter((v) => v.id);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">من الإصدار</label>
          <select
            value={fromId}
            onChange={(e) => onFromIdChange(e.target.value)}
            className="w-full rounded-lg border bg-background p-2 text-sm"
          >
            <option value="">اختر...</option>
            {selectable.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.versionNumber}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">إلى الإصدار</label>
          <select
            value={toId}
            onChange={(e) => onToIdChange(e.target.value)}
            className="w-full rounded-lg border bg-background p-2 text-sm"
          >
            <option value="">اختر...</option>
            {selectable.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.versionNumber}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={onCompare}
        disabled={loading}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "جاري المقارنة..." : "مقارنة الإصدارات"}
      </button>
    </>
  );
}
