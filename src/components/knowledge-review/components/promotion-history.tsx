"use client";

import { TrendingUp, ExternalLink } from "lucide-react";
import type { PromotionItem } from "./types";

export function PromotionHistory({ promotions }: { promotions: PromotionItem[] }) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 font-semibold">
        <TrendingUp className="h-4 w-4" />
        سجل الترقية ({promotions.length})
      </h3>
      {promotions.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">لم يتم ترقية هذا المرشّح بعد.</p>
      ) : (
        <div className="space-y-2">
          {promotions.map((p) => (
            <div key={p.id} className="rounded-lg border px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{p.artifactType}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(p.promotedAt).toLocaleString("ar-SA")}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>بواسطة: {p.promotedBy}</span>
                {p.artifactPath && (
                  <a
                    href={p.artifactPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    الملف
                  </a>
                )}
              </div>
              {p.notes && <p className="mt-1 text-xs text-muted-foreground">{p.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
