"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AiInsightsPanel } from "./ai-insights-panel";
import { useWorkbookDetail } from "./use-workbook-detail";
import { WorkbookHeader } from "./components/workbook-header";
import { CompletionBar } from "./components/completion-bar";
import { SectionGrid } from "./components/section-grid";
import { ScoreCard } from "./components/score-card";
import { LcgpaScoreCard } from "./components/lcgpa-score-card";
import { LinesTab } from "./components/lines-tab";
import { MissingDataTab } from "./components/missing-data-tab";
import { DataRequestsTab } from "./components/data-requests-tab";
import type {
  WorkbookWithLines,
  MissingDataDetectionResult,
  DataRequestWithItems,
} from "@/lib/local-content/workbook/types";

interface Props {
  workbook: WorkbookWithLines;
  missingData: MissingDataDetectionResult | null;
  dataRequests: DataRequestWithItems[];
  organizationId: string;
}

export function WorkbookDetailClient({
  workbook,
  missingData,
  dataRequests,
  organizationId,
}: Props) {
  const { state, actions } = useWorkbookDetail(workbook);

  return (
    <div className="space-y-6">
      <WorkbookHeader workbook={workbook} state={state} actions={actions} />

      {state.actionMsg && (
        <div className="bg-primary/10 border border-primary/20 text-sm p-3 rounded-lg">
          {state.actionMsg}
        </div>
      )}

      <CompletionBar workbook={workbook} />

      <SectionGrid sections={state.sections} />

      {state.scoreResult && (
        <ScoreCard
          scoreResult={state.scoreResult}
          showScoreDetail={state.showScoreDetail}
          onToggleDetail={() => actions.setShowScoreDetail((prev) => !prev)}
        />
      )}

      <LcgpaScoreCard
        score={state.lcgpaResult}
        isLoading={state.isLoading === "lcgpa-score"}
        showDetail={state.showLcgpaDetail}
        onCompute={() => void actions.handleComputeLcgpaScore()}
        onToggleDetail={() => actions.setShowLcgpaDetail((prev) => !prev)}
      />

      <Tabs defaultValue="lines">
        <TabsList>
          <TabsTrigger value="lines">البنود ({workbook.lines.length})</TabsTrigger>
          <TabsTrigger value="missing" disabled={!state.canAccessMissing}>
            البيانات الناقصة
            {missingData && missingData.totalMissing > 0 && (
              <Badge variant="destructive" className="mr-1">
                {missingData.totalMissing}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests" disabled={!state.canAccessRequests}>
            طلبات البيانات ({dataRequests.length})
          </TabsTrigger>
          <TabsTrigger value="ai-insights">AI Advisor</TabsTrigger>
        </TabsList>

        <TabsContent value="lines" className="space-y-6">
          <LinesTab state={state} actions={actions} />
        </TabsContent>

        <TabsContent value="missing">
          <MissingDataTab
            missingData={missingData}
            canAccess={state.canAccessMissing}
          />
        </TabsContent>

        <TabsContent value="ai-insights">
          <AiInsightsPanel
            organizationId={organizationId}
            workbookId={workbook.id}
            projectId={workbook.projectId}
          />
        </TabsContent>

        <TabsContent value="requests">
          <DataRequestsTab
            dataRequests={dataRequests}
            state={state}
            actions={actions}
          />
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/local-content/workbook"
          className="text-primary hover:underline"
        >
          ← عودة إلى الدفاتر
        </Link>
        <Separator orientation="vertical" className="h-4" />
        <Link
          href={`/local-content/projects/${workbook.projectId}`}
          className="text-primary hover:underline"
        >
          ← عودة إلى المشروع
        </Link>
      </div>
    </div>
  );
}
