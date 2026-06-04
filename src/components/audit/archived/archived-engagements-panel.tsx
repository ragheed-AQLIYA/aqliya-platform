"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArchiveRestore, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { restoreEngagementAction } from "@/actions/audit-actions";
import type { ArchivedEngagementRow } from "@/lib/audit/engagement-archival";

export function ArchivedEngagementsPanel({
  rows,
  canRestore,
}: {
  rows: ArchivedEngagementRow[];
  canRestore: boolean;
}) {
  const router = useRouter();
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRestore(engagementId: string) {
    if (
      !confirm(
        "استعادة التكليف من الأرشيف؟ سيُعاد إلى حالته السابقة قبل الأرشفة.",
      )
    ) {
      return;
    }
    setRestoringId(engagementId);
    setError(null);
    try {
      const result = await restoreEngagementAction(engagementId);
      if (result.success) {
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشلت الاستعادة");
    } finally {
      setRestoringId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-10">
        لا توجد تكليفات مؤرشفة.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-red-600 rounded border border-red-200 bg-red-50 p-2">
          {error}
        </p>
      )}
      <ul className="divide-y rounded-lg border">
        {rows.map((row) => (
          <li
            key={row.engagementId}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
          >
            <div>
              <Link
                href={`/audit/engagements/${row.engagementId}`}
                className="font-medium hover:underline"
              >
                {row.clientName}
              </Link>
              <span className="text-muted-foreground mx-2">·</span>
              <span className="text-muted-foreground">{row.fiscalPeriod}</span>
              <p className="text-xs text-muted-foreground mt-1">
                كان: {row.previousStatus}
                {row.archivedAt &&
                  ` · أُرشف ${new Date(row.archivedAt).toLocaleDateString("ar-SA")}`}
                {row.archivedBy && ` · ${row.archivedBy}`}
              </p>
            </div>
            {canRestore && (
              <Button
                size="sm"
                variant="outline"
                disabled={restoringId === row.engagementId}
                onClick={() => handleRestore(row.engagementId)}
              >
                {restoringId === row.engagementId ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArchiveRestore className="size-4 me-1" />
                )}
                استعادة
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
