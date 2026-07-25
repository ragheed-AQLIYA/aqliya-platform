"use client";

import { Brain, User, Clock } from "lucide-react";
import type { KnowledgeCandidateDTO } from "@/lib/tb-intelligence/knowledge-mining/types";

export function CandidateHeader({
  candidate,
  statusCfg,
  liveNotes,
}: {
  candidate: KnowledgeCandidateDTO;
  statusCfg: { label: string; color: string };
  liveNotes: string;
}) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-xl font-bold">{candidate.candidatePhrase}</h2>
            <p className="text-xs text-muted-foreground">
              {candidate.category} · {candidate.canonicalCode}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusCfg.color}`}
        >
          {statusCfg.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">قوّة الدعم</p>
          <p className="font-semibold">{candidate.supportCount}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">المنظمات</p>
          <p className="font-semibold">{candidate.organizationCount}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">نسبة الثقة</p>
          <p className="font-semibold">{Math.round(candidate.confidence * 100)}%</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">المصدر</p>
          <p className="font-mono text-xs">{candidate.source}</p>
        </div>
      </div>

      {liveNotes && (
        <div className="mt-4 rounded-lg border bg-muted/30 p-3 text-sm">
          <p className="text-xs font-medium text-muted-foreground">ملاحظات المراجعة</p>
          <p className="mt-1">{liveNotes}</p>
        </div>
      )}

      {candidate.reviewerId && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span>تمت المراجعة بواسطة {candidate.reviewerId}</span>
          {candidate.reviewedAt && (
            <>
              <Clock className="mr-2 h-3 w-3" />
              <span>{new Date(candidate.reviewedAt).toLocaleString("ar-SA")}</span>
            </>
          )}
        </div>
      )}
    </section>
  );
}
