"use client";

import { ArrowRight, AlertTriangle, Layers } from "lucide-react";
import Link from "next/link";
import type { KnowledgeMiningKPIs } from "@/lib/tb-intelligence/knowledge-mining/types";

export function CandidateSidebar({
  kpis,
  actionError,
}: {
  kpis: KnowledgeMiningKPIs | null;
  actionError: string | null;
}) {
  return (
    <aside className="space-y-4">
      {kpis && kpis.topEmergingPatterns.length > 0 && (
        <section className="rounded-xl border bg-card p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Layers className="h-4 w-4" />
            الأنماط الصاعدة
          </h3>
          <ul className="space-y-2">
            {kpis.topEmergingPatterns.slice(0, 5).map((p, i) => (
              <li
                key={`${p.phrase}-${i}`}
                className="rounded-lg border px-3 py-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{p.phrase}</span>
                  <span className="text-muted-foreground">{p.canonicalCode}</span>
                </div>
                <div className="mt-1 flex gap-3 text-[10px] text-muted-foreground">
                  <span>الدعم: {p.supportCount}</span>
                  <span>الثقة: {Math.round(p.confidence * 100)}%</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {actionError && (
        <div
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">فشلت العملية</p>
            <p className="mt-0.5 text-xs">{actionError}</p>
          </div>
        </div>
      )}

      <Link
        href="/knowledge-review"
        className="flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <ArrowRight className="h-4 w-4" />
        العودة إلى قائمة المراجعة
      </Link>
    </aside>
  );
}
