"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddHoldForm } from "./components/add-hold-form";
import { DryRunResultsCard } from "./components/dry-run-results-card";
import { ErrorBanner } from "./components/error-banner";
import { HistoryTable } from "./components/history-table";
import { HoldList } from "./components/hold-list";
import { LoadingState } from "./components/loading-state";
import { PolicyList } from "./components/policy-list";
import { RetentionHeader } from "./components/retention-header";
import { RunActionsCard } from "./components/run-actions-card";
import { TabNavigation } from "./components/tab-navigation";
import { useRetentionSettings } from "./components/use-retention-settings";

export default function RetentionSettingsPage() {
  const h = useRetentionSettings();

  if (h.loading) return <LoadingState />;

  return (
    <main className="p-8 max-w-5xl mx-auto" dir="rtl">
      <RetentionHeader />

      {h.error && <ErrorBanner error={h.error} onDismiss={() => h.setError(null)} />}

      <TabNavigation activeTab={h.activeTab} holdsCount={h.holds.length} onTabChange={h.setActiveTab} />

      {h.activeTab === "policies" && (
        <>
          <RunActionsCard running={h.running} onRun={h.handleRun} onDryRun={h.handleDryRun} />
          {h.dryRunResults && (
            <DryRunResultsCard results={h.dryRunResults} totalRecords={h.totalDryRecords} />
          )}
          <PolicyList
            policies={h.policies}
            editingModel={h.editingModel}
            editDays={h.editDays}
            editAction={h.editAction}
            editEnabled={h.editEnabled}
            onStartEdit={h.startEdit}
            onSave={h.handleSavePolicy}
            onReset={h.handleResetPolicy}
            onCancelEdit={() => h.setEditingModel(null)}
            onEditDaysChange={h.setEditDays}
            onEditActionChange={h.setEditAction}
            onEditEnabledChange={h.setEditEnabled}
          />
        </>
      )}

      {h.activeTab === "holds" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">تعليقات الاحتفاظ</CardTitle>
            <CardDescription>
              تمنع التعليقات حذف السجلات المهمة لأسباب قانونية أو امتثال
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddHoldForm
              type={h.newHoldType}
              id={h.newHoldId}
              reason={h.newHoldReason}
              onTypeChange={h.setNewHoldType}
              onIdChange={h.setNewHoldId}
              onReasonChange={h.setNewHoldReason}
              onAdd={h.handleAddHold}
            />
            <HoldList holds={h.holds} onRemove={h.handleRemoveHold} />
          </CardContent>
        </Card>
      )}

      {h.activeTab === "history" && <HistoryTable history={h.history} />}
    </main>
  );
}
