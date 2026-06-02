// @ts-nocheck
import type {
  SalesAccount,
  SalesInteractionLog,
  SalesOpportunity,
} from "../../types";
import {
  DRAFT_AR,
  HIGH_ICP_THRESHOLD,
  REVISIT_DAYS,
} from "./constants";
import { daysSince, makeRec, openOpportunities } from "./helpers";
import { STRATEGIC_RULE_IDS } from "./rules";
import type { StrategicRecommendation } from "./types";

export function deriveAccountRevisit(input: {
  accounts: SalesAccount[];
  opportunities: SalesOpportunity[];
  interactions: SalesInteractionLog[];
  now: Date;
}): StrategicRecommendation[] {
  const recs: StrategicRecommendation[] = [];
  const openByAccount = new Map<string, SalesOpportunity[]>();
  for (const opp of openOpportunities(input.opportunities)) {
    const list = openByAccount.get(opp.accountId) ?? [];
    list.push(opp);
    openByAccount.set(opp.accountId, list);
  }

  for (const account of input.accounts) {
    const accountInts = input.interactions.filter(
      (i) => i.accountId === account.id,
    );
    const lastAt = accountInts.length
      ? Math.max(...accountInts.map((i) => new Date(i.loggedAt).getTime()))
      : null;
    const daysIdle =
      lastAt === null
        ? REVISIT_DAYS + 1
        : daysSince(new Date(lastAt).toISOString(), input.now);

    const dormant =
      account.status === "dormant" ||
      (daysIdle >= REVISIT_DAYS && openByAccount.has(account.id));
    const highIcpStale =
      (account.icpFitScore ?? 0) >= HIGH_ICP_THRESHOLD &&
      daysIdle >= REVISIT_DAYS;

    if (!dormant && !highIcpStale) continue;

    const ruleId = highIcpStale
      ? STRATEGIC_RULE_IDS.ACCOUNT_HIGH_ICP_STALE
      : STRATEGIC_RULE_IDS.ACCOUNT_REVISIT_STALE;
    const confidence = Math.min(
      0.88,
      0.45 +
        (account.icpFitScore ?? 50) / 200 +
        (daysIdle >= REVISIT_DAYS ? 0.15 : 0) +
        (account.status === "dormant" ? 0.12 : 0),
    );

    recs.push(
      makeRec({
        ruleId,
        category: "account_revisit",
        title: `Revisit ${account.name} (${DRAFT_AR})`,
        titleAr: `Revisit ${account.nameAr ?? account.name} (${DRAFT_AR})`,
        reasoning:
          lastAt === null
            ? "Account with open pipeline but no logged interactions."
            : `No interaction for ${daysIdle} days; ${openByAccount.get(account.id)?.length ?? 0} open opp(s).`,
        reasoningAr: `Stale account touch; ${daysIdle} days idle.`,
        confidence,
        evidence: [
          {
            text: `Status: ${account.status}, ICP: ${account.icpFitScore ?? "n/a"}`,
            textAr: `Status: ${account.status}`,
            source: "account",
            refId: account.id,
          },
          ...(accountInts[0]
            ? [
                {
                  text: accountInts[0].summary,
                  textAr: accountInts[0].summary,
                  source: "interaction" as const,
                  refId: accountInts[0].id,
                },
              ]
            : []),
        ],
        priority: highIcpStale ? "high" : "medium",
        accountId: account.id,
        href: `/sales/accounts/${account.id}`,
      }),
    );
  }

  return recs.slice(0, 5);
}
