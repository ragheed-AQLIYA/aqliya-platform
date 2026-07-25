"use client";

import type { VersionDiff } from "./use-evidence-history";

interface VersionDiffPanelProps {
  diffResult: VersionDiff[];
}

export function VersionDiffPanel({ diffResult }: VersionDiffPanelProps) {
  return (
    <div className="mt-4 rounded-md border p-3">
      <h4 className="text-sm font-semibold mb-2">نتيجة المقارنة</h4>
      <ul className="space-y-1 text-xs">
        {diffResult
          .filter((d) => d.changed)
          .map((d) => (
            <li key={d.field}>
              <span className="font-medium">{d.field}:</span>{" "}
              {String(d.oldValue ?? "—")} → {String(d.newValue ?? "—")}
            </li>
          ))}
      </ul>
    </div>
  );
}
