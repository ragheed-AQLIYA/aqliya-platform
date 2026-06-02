import type { SalesContact, SalesOpportunity } from "../types";
import type { SalesAccount } from "../types";
import type { SalesEvidenceRef } from "../store";
import { buildOpportunityIntelligence } from "../vnext/opportunity-intelligence";
import { scoreOpportunity } from "./opportunity-scoring";

interface SalesPipelineItemView {
  opportunity: SalesOpportunity;
  accountName: string;
  accountNameAr?: string;
  probability?: number;
  closeDate: string;
  risks: string[];
  nextAction?: string;
  ownerLabel: string;
  contactNames: string[];
  proofCount: number;
  winLossReason?: string;
}

function estimateCloseDate(opp: SalesOpportunity): string {
  const base = new Date();
  const daysByStage: Record<string, number> = {
    Draft: 90,
    Qualification: 60,
    InReview: 45,
    Approved: 30,
    ClosedWon: 0,
    ClosedLost: 0,
  };
  base.setDate(base.getDate() + (daysByStage[opp.stage] ?? 60));
  return base.toISOString().slice(0, 10);
}

export function buildPipelineView(input: {
  opportunities: SalesOpportunity[];
  accounts: SalesAccount[];
  contacts: SalesContact[];
  evidence: SalesEvidenceRef[];
  interactionsByOpp: Map<string, number>;
  ownerLabel?: string;
}): SalesPipelineItemView[] {
  const accountMap = new Map(input.accounts.map((a) => [a.id, a]));
  const contactsByAccount = new Map<string, SalesContact[]>();
  for (const c of input.contacts) {
    const list = contactsByAccount.get(c.accountId) ?? [];
    list.push(c);
    contactsByAccount.set(c.accountId, list);
  }

  return input.opportunities.map((opp) => {
    const account = accountMap.get(opp.accountId);
    const intel = buildOpportunityIntelligence({
      opportunity: opp,
      evidenceCount: input.evidence.filter((e) => e.opportunityId === opp.id)
        .length,
      interactionCount: input.interactionsByOpp.get(opp.id) ?? 0,
      hasApprovedClaims: opp.approvalStatus === "Approved",
    });
    const scoring = scoreOpportunity(opp);

    let winLossReason: string | undefined;
    if (opp.stage === "ClosedWon") winLossReason = "فوز — اعتماد تجاري";
    if (opp.stage === "ClosedLost") winLossReason = "خسارة — تأخر التأهيل";
    if (opp.stage === "Rejected") winLossReason = "مرفوض — مراجعة";

    const nextAction =
      opp.stage === "Draft"
        ? "جدولة اجتماع اكتشاف"
        : intel.reviewRequired
          ? "إكمال المراجعة التجارية"
          : opp.stage === "Qualification"
            ? "إعداد عرض"
            : undefined;

    return {
      opportunity: opp,
      accountName: account?.name ?? opp.accountId,
      accountNameAr: account?.nameAr,
      probability: intel.winProbability,
      closeDate: estimateCloseDate(opp),
      risks: [...scoring.riskIndicators, ...scoring.blockers],
      nextAction,
      ownerLabel: input.ownerLabel ?? opp.ownerId.slice(0, 8),
      contactNames: (contactsByAccount.get(opp.accountId) ?? []).map(
        (c) => c.name,
      ),
      proofCount: input.evidence.filter((e) => e.opportunityId === opp.id)
        .length,
      winLossReason,
    };
  });
}
