import type {
  SalesAccount,
  SalesInteractionLog,
  SalesNextBestAction,
  SalesOpportunity,
} from "../types";
import { buildAccountIntelligence } from "../vnext/account-intelligence";
import { buildOpportunityIntelligence } from "../vnext/opportunity-intelligence";
import { scoreOpportunity } from "./opportunity-scoring";

export function buildNextBestActions(input: {
  accounts: SalesAccount[];
  opportunities: SalesOpportunity[];
  interactions: SalesInteractionLog[];
  scope?: { accountId?: string; opportunityId?: string };
}): SalesNextBestAction[] {
  const actions: SalesNextBestAction[] = [];
  const { scope } = input;

  let opps = input.opportunities;
  let accounts = input.accounts;

  if (scope?.opportunityId) {
    opps = opps.filter((o) => o.id === scope.opportunityId);
    const opp = opps[0];
    if (opp) accounts = accounts.filter((a) => a.id === opp.accountId);
  } else if (scope?.accountId) {
    accounts = accounts.filter((a) => a.id === scope.accountId);
    opps = opps.filter((o) => o.accountId === scope.accountId);
  }

  for (const opp of opps) {
    const oppInteractions = input.interactions.filter(
      (i) => i.opportunityId === opp.id,
    );
    const intel = buildOpportunityIntelligence({
      opportunity: opp,
      evidenceCount: 0,
      interactionCount: oppInteractions.length,
      hasApprovedClaims: opp.approvalStatus === "Approved",
    });
    const scoring = scoreOpportunity(opp);

    if (opp.stage === "Draft" && oppInteractions.length === 0) {
      actions.push({
        id: `nba-${opp.id}-meeting`,
        priority: "high",
        labelAr: `جدولة اجتماع اكتشاف — ${opp.name}`,
        labelEn: `Schedule discovery — ${opp.name}`,
        href: `/sales/opportunities/${opp.id}`,
        entityType: "opportunity",
        entityId: opp.id,
        rationaleAr: "لا توجد تفاعلات مسجّلة بعد",
      });
    }
    if (intel.reviewRequired && opp.stage !== "ClosedWon") {
      actions.push({
        id: `nba-${opp.id}-review`,
        priority: scoring.riskIndicators.length > 0 ? "high" : "medium",
        labelAr: `إكمال المراجعة التجارية — ${opp.name}`,
        labelEn: `Complete commercial review — ${opp.name}`,
        href: `/sales/opportunities/${opp.id}`,
        entityType: "opportunity",
        entityId: opp.id,
        rationaleAr: intel.qualificationGap[0] ?? "مراجعة بشرية مطلوبة",
      });
    }
    if (opp.stage === "Qualification" && (opp.valueEstimate ?? 0) > 400_000) {
      actions.push({
        id: `nba-${opp.id}-evidence`,
        priority: "medium",
        labelAr: `ربط أدلة إضافية — ${opp.name}`,
        labelEn: `Link additional evidence — ${opp.name}`,
        href: `/sales/opportunities/${opp.id}`,
        entityType: "opportunity",
        entityId: opp.id,
        rationaleAr: "صفقة عالية القيمة تحتاج أدلة",
      });
    }
  }

  for (const account of accounts) {
    const acctOpps = opps.filter((o) => o.accountId === account.id);
    const acctInteractions = input.interactions.filter(
      (i) => i.accountId === account.id,
    );
    const intel = buildAccountIntelligence({
      account,
      opportunities: acctOpps,
      interactionCount: acctInteractions.length,
      daysSinceLastInteraction:
        acctInteractions.length > 0
          ? Math.floor(
              (Date.now() -
                new Date(acctInteractions[0].loggedAt).getTime()) /
                86400000,
            )
          : undefined,
    });
    for (const action of intel.nextActions) {
      actions.push({
        id: `nba-${account.id}-${action.slice(0, 8)}`,
        priority: action.includes("first") ? "high" : "medium",
        labelAr: `${action} — ${account.nameAr ?? account.name}`,
        labelEn: `${action} — ${account.name}`,
        href: `/sales/accounts/${account.id}`,
        entityType: "account",
        entityId: account.id,
        rationaleAr: "مشتق من صحة الحساب والتفاعل",
      });
    }
  }

  if (!scope?.accountId && !scope?.opportunityId) {
    const stalled = input.opportunities.filter((o) => {
      const ints = input.interactions.filter((i) => i.opportunityId === o.id);
      if (ints.length === 0 && o.stage !== "Draft") return true;
      if (ints.length === 0) return false;
      const days =
        (Date.now() - new Date(ints[0].loggedAt).getTime()) / 86400000;
      return days >= 14 && !["ClosedWon", "ClosedLost", "Archived"].includes(o.stage);
    });
    if (stalled.length > 0) {
      actions.push({
        id: "nba-global-stalled",
        priority: "high",
        labelAr: `متابعة ${stalled.length} فرص متوقفة`,
        labelEn: `Follow up ${stalled.length} stalled opportunities`,
        href: "/sales/opportunities",
        entityType: "global",
        rationaleAr: "لا نشاط منذ 14+ يوم",
      });
    }
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return actions
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, scope ? 8 : 12);
}
