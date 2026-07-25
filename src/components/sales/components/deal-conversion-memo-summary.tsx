"use client";

import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS, STATUS_LABELS } from "./deal-conversion-memo-constants";
import type { ConversionMemo } from "@/lib/sales/conversion-memo";
import type { SalesEvidenceLinkView } from "@/lib/sales/evidence-links";

export function MemoSummary({
  memo,
  evidenceLinks,
}: {
  memo: ConversionMemo;
  evidenceLinks: SalesEvidenceLinkView[];
}) {
  const linkById = new Map(evidenceLinks.map((l) => [l.id, l]));

  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={STATUS_COLORS[memo.status] ?? STATUS_COLORS.draft}>
          {STATUS_LABELS[memo.status] ?? memo.status}
        </Badge>
        <span className="text-xs text-muted-foreground">
          آخر تحديث: {new Date(memo.updatedAt).toLocaleString("ar-SA")}
        </span>
      </div>
      <div>
        <p className="text-muted-foreground text-xs">المسودة</p>
        <p className="whitespace-pre-wrap">{memo.draft}</p>
      </div>
      <div>
        <p className="text-muted-foreground text-xs">معايير الـ pilot</p>
        <p className="whitespace-pre-wrap">{memo.pilotCriteria}</p>
      </div>
      {memo.evidenceRefs.length > 0 ? (
        <div>
          <p className="text-muted-foreground text-xs">مراجع الأدلة</p>
          <ul className="list-disc pr-4">
            {memo.evidenceRefs.map((ref) => {
              const link = linkById.get(ref);
              return <li key={ref}>{link?.title ?? ref}</li>;
            })}
          </ul>
        </div>
      ) : null}
      {memo.submittedAt ? (
        <p className="text-xs text-muted-foreground">
          أُرسل: {new Date(memo.submittedAt).toLocaleString("ar-SA")}
        </p>
      ) : null}
      {memo.decidedAt ? (
        <p className="text-xs text-muted-foreground">
          قرار: {new Date(memo.decidedAt).toLocaleString("ar-SA")}
        </p>
      ) : null}
    </div>
  );
}
