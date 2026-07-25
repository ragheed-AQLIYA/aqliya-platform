"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAiAdvisor } from "./components/use-ai-advisor";
import { AiAdvisorHeader } from "./components/ai-advisor-header";
import { AiAdvisorActions } from "./components/ai-advisor-actions";
import { StatusMessageCard } from "./components/status-message-card";
import { SummaryCards } from "./components/summary-cards";
import { LinesTab } from "./components/lines-tab";
import { FpMemoryTab } from "./components/fp-memory-tab";
import { BenchmarksTab } from "./components/benchmarks-tab";
import type {
  LcWorkbook,
  PendingFlag,
  PendingSuggestion,
  OrgMemory,
  IndustryBenchmark,
} from "./components/types";

interface Props {
  projectId: string;
  workbookId: string;
  workbook: LcWorkbook;
  pendingFlags: PendingFlag[];
  pendingSuggestions: PendingSuggestion[];
  orgMemory: OrgMemory[];
  industryBenchmarks: IndustryBenchmark[];
}

export function WorkbookAiAdvisorClient({
  projectId,
  workbookId,
  workbook,
  pendingFlags,
  pendingSuggestions,
  orgMemory,
  industryBenchmarks,
}: Props) {
  const {
    loading,
    explanations,
    statusMessage,
    runAnalysis,
    runExplanations,
    runCalibration,
  } = useAiAdvisor(projectId, workbookId);

  return (
    <div className="space-y-6">
      <AiAdvisorHeader
        projectId={projectId}
        workbookId={workbookId}
        workbookTitle={workbook.title}
      />

      <AiAdvisorActions
        loading={loading}
        onRunAnalysis={runAnalysis}
        onRunExplanations={runExplanations}
        onRunCalibration={runCalibration}
      />

      <StatusMessageCard message={statusMessage} />

      <SummaryCards
        totalLines={workbook.totalLines}
        completionPct={workbook.completionPct}
        pendingFlagsCount={pendingFlags.length}
        pendingSuggestionsCount={pendingSuggestions.length}
      />

      <Tabs defaultValue="lines" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lines">أسطر المصنف / Lines</TabsTrigger>
          <TabsTrigger value="fp-org">
            FP + الذاكرة / FP &amp; Memory
            {pendingFlags.length > 0 && (
              <Badge variant="destructive" className="mr-1">
                {pendingFlags.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="benchmarks">معايير / Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="lines" className="space-y-4">
          <LinesTab lines={workbook.lines} explanations={explanations} />
        </TabsContent>

        <TabsContent value="fp-org" className="space-y-4">
          <FpMemoryTab pendingFlags={pendingFlags} orgMemory={orgMemory} />
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <BenchmarksTab benchmarks={industryBenchmarks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
