"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, RefreshCw, PhoneCall, FileText, PlusCircle } from "lucide-react";
import { NextBestActionPanel } from "./next-best-action-panel";
import { AccountProfileHeader } from "./components/account-profile-header";
import { AccountProfileMetrics } from "./components/account-profile-metrics";
import { AccountProfileContacts } from "./components/account-profile-contacts";
import { AccountProfileOpportunities } from "./components/account-profile-opportunities";
import { AccountProfileTimeline } from "./components/account-profile-timeline";
import { AccountProfileMeetings } from "./components/account-profile-meetings";
import { AccountProfileSignals } from "./components/account-profile-signals";
import { AccountProfileObjections } from "./components/account-profile-objections";
import { AccountProfileCompetitors } from "./components/account-profile-competitors";
import { AccountProfileProofAssets } from "./components/account-profile-proof-assets";
import { AccountProfileAIBrief } from "./components/account-profile-ai-brief";
import { Button } from "@/components/ui/button";
import { generateAccountResearchAction } from "@/actions/sales-actions/accounts";
import type {
  SalesAccount,
  SalesContact,
  SalesOpportunity,
  SalesAIBriefDraft,
  SalesNextBestActionItem,
  SalesObjectionSignal,
  SalesCompetitorMentionView,
} from "@/lib/sales/types";
import type { SalesEvidenceRef } from "@/lib/sales/store";
import type { AccountIntelligenceSummary } from "@/lib/sales/vnext/account-intelligence";
import type { InteractionTimelineEntry } from "@/lib/sales/intelligence/account-health";
import type { SalesInteractionLog } from "@/lib/sales/types";
import type { IntelligenceSignal } from "@/lib/platform/intelligence";

interface AccountProfileProps {
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
  onIntelligenceRefreshed?: () => void;
}

export function AccountIntelligenceProfile(props: AccountProfileProps) {
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
    onIntelligenceRefreshed,
  } = props;

  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const handleRefreshIntelligence = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await generateAccountResearchAction(accountId);
      if (result.ok) {
        router.refresh();
        onIntelligenceRefreshed?.();
      }
    } finally {
      setRefreshing(false);
    }
  }, [accountId, router, onIntelligenceRefreshed]);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <AccountProfileHeader account={account} />
        <div className="flex items-center gap-2">
          <Link
            href={`/sales/interactions/new?accountId=${accountId}`}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm font-medium hover:bg-muted hover:text-foreground"
          >
            <PhoneCall className="h-4 w-4" />
            تسجيل تفاعل
          </Link>
          <Link
            href={`/sales/notes/new?accountId=${accountId}`}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm font-medium hover:bg-muted hover:text-foreground"
          >
            <FileText className="h-4 w-4" />
            إضافة ملاحظة
          </Link>
          <Link
            href={`/sales/opportunities/new?accountId=${accountId}`}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm font-medium hover:bg-muted hover:text-foreground"
          >
            <PlusCircle className="h-4 w-4" />
            إنشاء فرصة
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshIntelligence}
            disabled={refreshing}
            className="shrink-0"
          >
            {refreshing ? (
              <Loader2 className="ml-1 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="ml-1 h-4 w-4" />
            )}
            {refreshing ? "جاري التحديث..." : "تحديث الذكاء"}
          </Button>
        </div>
      </div>
      <AccountProfileMetrics
        intelligence={intelligence}
        interactionCount={interactionCount}
      />
      <NextBestActionPanel actions={nextActions} title="الإجراء التالي — هذا الحساب" />
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
