"use client";

import { useRouter } from "next/navigation";
import { useCandidateDetail } from "./components/use-candidate-detail";
import { CandidateHeader } from "./components/candidate-header";
import { ReviewActionsSection } from "./components/review-actions-section";
import { EvidenceList } from "./components/evidence-list";
import { PromotionHistory } from "./components/promotion-history";
import { CandidateSidebar } from "./components/candidate-sidebar";
import type { KnowledgeCandidateDTO, KnowledgeMiningKPIs } from "@/lib/tb-intelligence/knowledge-mining/types";
import type { EvidenceItem, PromotionItem } from "./components/types";

export function CandidateDetailClient({
  candidate,
  evidence,
  promotions,
  kpis,
}: {
  candidate: KnowledgeCandidateDTO;
  evidence: EvidenceItem[];
  promotions: PromotionItem[];
  kpis: KnowledgeMiningKPIs | null;
}) {
  const router = useRouter();
  const {
    busy,
    lastAction,
    actionError,
    liveStatus,
    liveNotes,
    statusCfg,
    handleReview,
  } = useCandidateDetail(candidate, router);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <CandidateHeader candidate={candidate} statusCfg={statusCfg} liveNotes={liveNotes} />
        <ReviewActionsSection
          candidateId={candidate.id}
          liveStatus={liveStatus}
          busy={busy}
          lastAction={lastAction}
          actionError={actionError}
          onReview={handleReview}
        />
        <EvidenceList evidence={evidence} />
        <PromotionHistory promotions={promotions} />
      </div>
      <CandidateSidebar kpis={kpis} actionError={actionError} />
    </div>
  );
}
