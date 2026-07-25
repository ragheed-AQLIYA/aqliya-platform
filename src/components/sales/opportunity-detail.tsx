"use client";

import { StatusBadge } from "@/components/enterprise/status-badge";
import { OpportunityWinLossCapture } from "@/components/sales/opportunity-win-loss-capture";
import { OpportunityHeader } from "@/components/sales/components/opportunity-header";
import { OpportunityRisksCard } from "@/components/sales/components/opportunity-risks-card";
import { OpportunityWorkflowCard } from "@/components/sales/components/opportunity-workflow-card";
import { OpportunityAISummaryCard } from "@/components/sales/components/opportunity-ai-summary-card";
import { OpportunityProofLinkageCard } from "@/components/sales/components/opportunity-proof-linkage-card";
import { OpportunityEvidenceCard } from "@/components/sales/components/opportunity-evidence-card";
import { useOpportunityDetail } from "@/components/sales/components/use-opportunity-detail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesAuditActions } from "@/lib/sales/audit-events";
import type { SalesAccount, SalesOpportunity } from "@/lib/sales/types";
import type { SalesEvidenceRef } from "@/lib/sales/store";
import type { ProofLinkageSummary } from "@/lib/sales/proof-linkage-service";
import type { ReviewApprovalPackage } from "@/components/sales/components/opportunity-types";

interface StageHistoryEntry {
  id: string;
  action: string;
  actorName: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

interface OpportunityDetailProps {
  opportunity: SalesOpportunity;
  account: SalesAccount | null | undefined;
  evidence: SalesEvidenceRef[];
  reviewPackage: ReviewApprovalPackage;
  exportGate: { allowed: boolean; reason?: string };
  proofLinkage?: ProofLinkageSummary;
  captureWinLossAction?: (
    formData: FormData,
  ) => Promise<{ ok: true; winLossReason: string }>;
  stageHistory?: StageHistoryEntry[];
}

function StageHistoryCard({ events, stages }: { events: StageHistoryEntry[]; stages?: { id: string; name: string }[] }) {
  const stageChanges = events.filter(
    (e) =>
      e.action === SalesAuditActions.DEAL_STAGE_CHANGED ||
      e.action === "sales.opportunity.stage_changed",
  );
  if (stageChanges.length === 0) return null;

  const stageName = (id: string | null) => {
    if (!id) return "بدون مرحلة";
    const found = stages?.find((s) => s.id === id);
    return found?.name ?? id;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">سجل تغيير المراحل</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stageChanges.map((evt) => {
            const meta = evt.metadata ?? {};
            const fromId = (meta.fromStageId as string) ?? null;
            const toId = (meta.toStageId as string) ?? null;
            return (
              <div key={evt.id} className="flex items-start gap-3 text-sm">
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-status-warning" />
                <div className="min-w-0">
                  <p>
                    <span className="text-muted-foreground">من </span>
                    <span className="font-medium">{stageName(fromId)}</span>
                    <span className="text-muted-foreground"> ← </span>
                    <span className="font-medium">{stageName(toId)}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {evt.actorName ? `${evt.actorName} · ` : ""}
                    {new Date(evt.createdAt).toLocaleString("ar-SA")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function OpportunityDetailView({
  opportunity,
  account,
  evidence,
  reviewPackage,
  exportGate,
  proofLinkage,
  stageHistory,
}: OpportunityDetailProps) {
  const {
    pending,
    handleSubmitReview,
    handleApprove,
    handleLinkEvidence,
    handleAIReview,
  } = useOpportunityDetail(opportunity.id);

  const opportunityRisks = opportunity.risks ?? [];

  return (
    <div className="space-y-6" dir="rtl">
      <OpportunityHeader opportunity={opportunity} account={account} />

      <div className="flex flex-wrap gap-2">
        <StatusBadge status={opportunity.stage} />
        <StatusBadge status={reviewPackage.status} size="sm" />
      </div>

      <OpportunityRisksCard risks={opportunityRisks} />

      <div className="grid gap-4 md:grid-cols-2">
        <OpportunityWorkflowCard
          opportunity={opportunity}
          reviewPackage={reviewPackage}
          evidenceCount={evidence.length}
          pending={pending}
          onSubmitReview={handleSubmitReview}
          onApprove={handleApprove}
          onLinkEvidence={handleLinkEvidence}
        />
        <OpportunityAISummaryCard
          exportGate={exportGate}
          pending={pending}
          onAIReview={handleAIReview}
        />
      </div>

      {proofLinkage && <OpportunityProofLinkageCard proofLinkage={proofLinkage} />}

      <OpportunityEvidenceCard evidence={evidence} />

      {stageHistory ? <StageHistoryCard events={stageHistory} /> : null}

      <OpportunityWinLossCapture opportunity={opportunity} />
    </div>
  );
}
