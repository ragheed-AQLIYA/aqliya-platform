"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DraftOnlyBanner } from "@/components/audit/governance";
import { RollforwardPanel } from "@/components/audit/rollforward-panel";
import { TraceabilityDrawer } from "@/components/audit/shared/traceability-drawer";

import { useStatementsPage, statementLabels, statementIcons, sar } from "./hooks/use-statements-page";
import { StatementsLoading } from "./components/statements-loading";
import { StatementsError } from "./components/statements-error";
import { StatementsEmpty } from "./components/statements-empty";
import { StatementsHeader } from "./components/statements-header";
import { GovernanceInfo } from "./components/governance-info";
import { StatementCard } from "./components/statement-card";

export default function StatementsPage() {
  const {
    engagementId,
    t,
    statements,
    engagement,
    loading,
    loadError,
    selectedLine,
    traceData,
    traceabilityOpen,
    governanceOpen,
    exporting,
    exportError,
    exportSuccess,
    fsV2Enabled,
    fsActionLoading,
    governanceCtx,
    loadStatements,
    getDefaultTab,
    handleExport,
    handleGovernanceToggle,
    handleLineClick,
    handleTransitionStatus,
    handleRebuildV2,
    handleMarkAllReviewed,
    handleTraceabilityClose,
  } = useStatementsPage();

  if (loading) return <StatementsLoading />;
  if (loadError) return <StatementsError error={loadError} onRetry={loadStatements} />;
  if (statements.length === 0) return <StatementsEmpty />;

  const labels = statementLabels(t);

  return (
    <div className="space-y-6" dir="rtl">
      <StatementsHeader
        t={t}
        engagement={engagement}
        exporting={exporting}
        exportError={exportError}
        exportSuccess={exportSuccess}
        fsV2Enabled={fsV2Enabled}
        fsActionLoading={fsActionLoading}
        onExport={handleExport}
        onRebuildV2={handleRebuildV2}
        onMarkAllReviewed={handleMarkAllReviewed}
      />

      <DraftOnlyBanner taskType="statement_drafting" />

      <GovernanceInfo
        t={t}
        governanceCtx={governanceCtx}
        open={governanceOpen}
        onToggle={handleGovernanceToggle}
      />

      <Tabs defaultValue={getDefaultTab()}>
        <TabsList className="mb-4">
          {statements.map((s) => (
            <TabsTrigger
              key={s.id}
              value={s.id}
              className="flex items-center gap-1"
            >
              {statementIcons[s.statementType]}
              {labels[s.statementType] || s.title}
              {(s.reviewComments?.length ?? 0) > 0 && (
                <Badge
                  variant="outline"
                  className="me-1 bg-amber-100 text-amber-700 text-[10px] px-1"
                >
                  {s.reviewComments?.length ?? 0}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        {statements.map((s) => (
          <TabsContent key={s.id} value={s.id}>
            <StatementCard
              statement={s}
              engagement={engagement}
              fsV2Enabled={fsV2Enabled}
              fsActionLoading={fsActionLoading}
              t={t}
              sar={sar}
              onLineClick={handleLineClick}
              onTransitionStatus={handleTransitionStatus}
            />
          </TabsContent>
        ))}
      </Tabs>

      <RollforwardPanel engagementId={engagementId} />

      <TraceabilityDrawer
        open={traceabilityOpen}
        onClose={handleTraceabilityClose}
        entityType="financial_statement_line"
        entityId={selectedLine?.line.id || ""}
        entityLabel={selectedLine?.line.label || ""}
        forwardTrace={traceData.forward}
        backwardTrace={traceData.backward}
      />
    </div>
  );
}
