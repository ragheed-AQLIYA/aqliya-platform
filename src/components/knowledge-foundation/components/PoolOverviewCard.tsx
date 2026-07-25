"use client";

import type { CandidatePoolOverview } from "@/lib/knowledge-foundation/candidate-pool-overview";

export function PoolOverviewCard({
  poolOverview,
}: {
  poolOverview?: CandidatePoolOverview;
}) {
  if (!poolOverview) return null;

  return (
    <div className="mb-4 grid gap-2 rounded-lg border bg-card p-3 text-xs sm:grid-cols-3">
      <p>
        إجمالي المُرقّاة:{" "}
        <span className="font-bold">{poolOverview.totalPromoted}</span>
      </p>
      <p>
        مرتبطة:{" "}
        <span className="font-bold">{poolOverview.boundTotal}</span>
      </p>
      <p>
        متاحة للربط:{" "}
        <span className="font-bold">{poolOverview.eligibleUnbound}</span>
      </p>
    </div>
  );
}
