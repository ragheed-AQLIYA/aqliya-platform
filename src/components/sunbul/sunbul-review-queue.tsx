"use client";

import { useEffect, useState } from "react";
import { sunbul_listRecords } from "@/actions/sunbul-actions";
import { SunbulStatusBadge } from "@/components/sunbul/sunbul-status-badge";
import { Loader2, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface UnderReviewRecord {
  id: string;
  title: string;
  clientId: string;
  createdAt: Date;
  submittedAt?: Date | null;
}

export function SunbulReviewQueue({ clientId }: { clientId: string | null }) {
  const [records, setRecords] = useState<UnderReviewRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    sunbul_listRecords(clientId).then((result) => {
      if (result.success && result.data) {
        setRecords(result.data as UnderReviewRecord[]);
      }
      setLoading(false);
    });
  }, [clientId]);

  if (!clientId) return null;
  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-4 text-center text-sm text-muted-foreground">
        <ShieldCheck className="mx-auto h-6 w-6 text-muted-foreground/50 mb-1" />
        لا توجد قضايا بانتظار المراجعة
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {records.slice(0, 10).map((record) => (
        <Link
          key={record.id}
          href={`/sunbul/clients/${clientId}/records/${record.id}`}
          className="flex items-center justify-between rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors group"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">
                {record.title}
              </span>
              <SunbulStatusBadge status="UnderReview" size="sm" />
            </div>
            <div className="mt-0.5 text-[10px] text-muted-foreground">
              {new Date(record.createdAt).toLocaleDateString("ar-SA", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-foreground transition-colors shrink-0" />
        </Link>
      ))}
    </div>
  );
}
