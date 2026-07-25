"use client";

import dynamic from "next/dynamic";
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
import { AccountProfileHeader } from "@/components/sales/components/account-profile-header";
import { AccountProfileMetrics } from "@/components/sales/components/account-profile-metrics";
import { AccountProfileContacts } from "@/components/sales/components/account-profile-contacts";
import { AccountProfileOpportunities } from "@/components/sales/components/account-profile-opportunities";
import { AccountProfileTimeline } from "@/components/sales/components/account-profile-timeline";
import { AccountProfileMeetings } from "@/components/sales/components/account-profile-meetings";
import { AccountProfileSignals } from "@/components/sales/components/account-profile-signals";
import { AccountProfileObjections } from "@/components/sales/components/account-profile-objections";
import { AccountProfileCompetitors } from "@/components/sales/components/account-profile-competitors";
import { AccountProfileProofAssets } from "@/components/sales/components/account-profile-proof-assets";
import { AccountProfileAIBrief } from "@/components/sales/components/account-profile-ai-brief";
import {
  AccountCommercialMemorySummary,
  AccountNextActionsSection,
} from "./account-intelligence-sections";
import { useAccountProfileView } from "./components/use-account-profile-view";

interface AccountProfileViewProps {
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

export function AccountProfileView(props: AccountProfileViewProps) {
  const {
    account,
    contacts,
    opportunities,
    intelligence,
    interactionCount,
    interactionTimeline,
    meetings,
    objections,
    competitors,
    proofAssets,
    aiBriefDraft,
    nextActions,
    signals,
    accountId,
    commercialMemory,
    accountIcpFitPct,
  } = useAccountProfileView(props);

  return (
    <div className="space-y-6" dir="rtl">
      <AccountProfileHeader account={account} />
      <AccountProfileMetrics
        intelligence={intelligence}
        interactionCount={interactionCount}
      />
      <AccountNextActionsSection nextActions={nextActions} />
      <AccountCommercialMemorySummary
        snapshot={commercialMemory}
        accountIcpFitPct={accountIcpFitPct}
      />
      <AccountProfileContacts contacts={contacts} />
      <AccountProfileOpportunities
        opportunities={opportunities}
        accountId={accountId}
      />
      <AccountProfileTimeline entries={interactionTimeline} />
      <AccountProfileMeetings meetings={meetings} />
      <AccountProfileSignals signals={signals} />
      <AccountProfileObjections objections={objections} />
      <AccountProfileCompetitors competitors={competitors} />
      <AccountProfileProofAssets assets={proofAssets} />
      <AccountProfileAIBrief brief={aiBriefDraft} />
    </div>
  );
}
