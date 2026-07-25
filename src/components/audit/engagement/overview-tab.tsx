"use client";

import type { Engagement } from "@/types/audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentActivity } from "@/components/audit/dashboard/recent-activity";
import { useOverviewTab } from "./components/use-overview-tab";
import { NextStepCard } from "./components/next-step-card";
import { MetricsGrid } from "./components/metrics-grid";
import { TeamCard } from "./components/team-card";
import { WorkflowStepsCard } from "./components/workflow-steps-card";

interface OverviewTabProps {
  engagementId: string;
  engagement: Engagement;
}

export function OverviewTab({ engagementId, engagement }: OverviewTabProps) {
  const {
    tb,
    mappings,
    evidence,
    findings,
    openReviews,
    approvalStatus,
    events,
    workflowContext,
    nextAction,
  } = useOverviewTab(engagementId);

  return (
    <div className="space-y-6">
      {nextAction && <NextStepCard nextAction={nextAction} />}

      <MetricsGrid
        tb={tb}
        mappings={mappings}
        evidence={evidence}
        findings={findings}
        openReviews={openReviews}
        approvalStatus={approvalStatus}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TeamCard team={engagement.team} />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              النشاط الأخير
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity events={events} />
          </CardContent>
        </Card>
      </div>

      <WorkflowStepsCard
        engagementId={engagementId}
        workflowContext={workflowContext}
      />
    </div>
  );
}
