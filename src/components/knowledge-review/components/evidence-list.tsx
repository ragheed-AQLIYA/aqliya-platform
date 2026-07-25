"use client";

import { BarChart3 } from "lucide-react";
import type { EvidenceItem } from "./types";

export function EvidenceList({ evidence }: { evidence: EvidenceItem[] }) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 font-semibold">
        <BarChart3 className="h-4 w-4" />
        الأدلة ({evidence.length})
      </h3>
      {evidence.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">لا توجد أدلة مرتبطة بهذا المرشّح.</p>
      ) : (
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {evidence.map((e) => (
            <div key={e.id} className="rounded-lg border px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs">{e.accountCode}</span>
                <span className="text-xs text-muted-foreground">{e.evidenceType}</span>
              </div>
              {e.accountName && (
                <p className="mt-0.5 text-xs text-muted-foreground">{e.accountName}</p>
              )}
              <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                <span>معرّف: {e.evidenceId.slice(0, 12)}...</span>
                <span>جهة: {e.organizationId.slice(0, 12)}...</span>
                <span>{new Date(e.createdAt).toLocaleDateString("ar-SA")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
