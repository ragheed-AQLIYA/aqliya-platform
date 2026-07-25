"use client";

import type {
  SalesAccount,
  SalesContact,
  SalesOpportunity,
  SalesInteractionLog,
  SalesAIBriefDraft,
  SalesNextBestActionItem,
  SalesObjectionSignal,
  SalesCompetitorMentionView,
} from "@/lib/sales/types";
import type { SalesEvidenceRef } from "@/lib/sales/store";
import type { AccountIntelligenceSummary } from "@/lib/sales/vnext/account-intelligence";
import type { InteractionTimelineEntry } from "@/lib/sales/intelligence/account-health";
import type { IntelligenceSignal } from "@/lib/platform/intelligence";
import type { CommercialMemorySnapshot } from "@/lib/sales/vnext/commercial-memory";

export interface UseAccountProfileViewProps {
  account: SalesAccount;
  contacts: SalesContact[];
  opportunities: SalesOpportunity[];
  intelligence: AccountIntelligenceSummary;
  interactionCount: number;
  interactionTimeline: InteractionTimelineEntry[];
  meetings: SalesInteractionLog[];
  objections: SalesObjectionSignal[];
  competitors: SalesCompetitorMentionView[];
  proofAssets: SalesEvidenceRef[];
  aiBriefDraft: SalesAIBriefDraft;
  nextActions: SalesNextBestActionItem[];
  signals: IntelligenceSignal[];
  accountId: string;
  commercialMemory: CommercialMemorySnapshot;
  accountIcpFitPct?: number;
}

export function useAccountProfileView(props: UseAccountProfileViewProps) {
  return props;
}
