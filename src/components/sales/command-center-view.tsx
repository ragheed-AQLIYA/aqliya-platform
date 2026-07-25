"use client";

import { useCommandCenter } from "./components/use-command-center";
import { CommandCenterHeader } from "./components/command-center-header";
import { MetricsGrid } from "./components/metrics-grid";
import { StalledOpportunitiesCard } from "./components/stalled-opportunities-card";
import { WeeklyMeetingsCard } from "./components/weekly-meetings-card";
import { NextBestActionPanel } from "./next-best-action-panel";
import { ObjectionsCard } from "./components/objections-card";
import { SignalsCard } from "./components/signals-card";
import { IcpDistributionCard } from "./components/icp-distribution-card";
import { RecentActivityCard } from "./components/recent-activity-card";
import { StageDistributionCard } from "./components/stage-distribution-card";
import { QuickAccountsCard } from "./components/quick-accounts-card";
import type {
  SalesAccount,
  SalesInteractionLog,
  SalesNextBestActionItem,
  SalesObjectionSignal,
  SalesOpportunity,
} from "@/lib/sales/types";
import type { IntelligenceSignal } from "@/lib/platform/intelligence";

export interface CommandCenterViewProps {
  activeAccounts: number;
  activeOpps: number;
  pipelineValue: number;
  stalledOpps: number;
  meetingsThisWeek: number;
  topObjections: SalesObjectionSignal[];
  topSignals: IntelligenceSignal[];
  icpFit: { labelAr: string; count: number; pct: number }[];
  nextActions: SalesNextBestActionItem[];
  recentActivity: SalesInteractionLog[];
  accounts: SalesAccount[];
  opportunities?: SalesOpportunity[];
  interactions?: SalesInteractionLog[];
  byStage: Record<string, number>;
  forecastWeighted?: number;
}

export function CommandCenterView({
  activeAccounts,
  activeOpps,
  pipelineValue,
  stalledOpps,
  meetingsThisWeek,
  topObjections,
  topSignals,
  icpFit,
  nextActions,
  recentActivity,
  accounts,
  opportunities = [],
  interactions = [],
  byStage,
  forecastWeighted,
}: CommandCenterViewProps) {
  const { stalledList, weeklyMeetings, accountById } = useCommandCenter({
    opportunities,
    interactions,
    accounts,
  });

  return (
    <div className="space-y-6" dir="rtl">
      <CommandCenterHeader />

      <MetricsGrid
        activeAccounts={activeAccounts}
        activeOpps={activeOpps}
        pipelineValue={pipelineValue}
        stalledOpps={stalledOpps}
        meetingsThisWeek={meetingsThisWeek}
        forecastWeighted={forecastWeighted}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <StalledOpportunitiesCard
          stalledList={stalledList}
          stalledOpps={stalledOpps}
          accountById={accountById}
        />
        <WeeklyMeetingsCard
          weeklyMeetings={weeklyMeetings}
          accountById={accountById}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <NextBestActionPanel actions={nextActions.slice(0, 6)} />
        <ObjectionsCard topObjections={topObjections} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SignalsCard topSignals={topSignals} />
        <IcpDistributionCard icpFit={icpFit} />
      </div>

      <RecentActivityCard recentActivity={recentActivity} accountById={accountById} />

      {Object.keys(byStage).length > 0 && (
        <StageDistributionCard byStage={byStage} />
      )}

      <QuickAccountsCard accounts={accounts} />
    </div>
  );
}
