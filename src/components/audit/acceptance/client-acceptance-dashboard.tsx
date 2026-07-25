"use client";

import { Loader2, AlertTriangle, CheckCircle2, Target, Plus, Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAcceptanceWorkflow } from "./components/use-acceptance-workflow";
import { PipelineTab } from "./components/pipeline-tab";
import { NewProspectTab } from "./components/new-prospect-tab";
import { ProspectDetailTab } from "./components/prospect-detail-tab";

interface ClientAcceptanceDashboardProps {
  auditOrganizationId: string;
}

export function ClientAcceptanceDashboard({
  auditOrganizationId,
}: ClientAcceptanceDashboardProps) {
  const { state, actions } = useAcceptanceWorkflow(auditOrganizationId);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {state.error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {state.success}
        </div>
      )}

      <Tabs value={state.activeTab} onValueChange={actions.setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pipeline">
            <Target className="ml-2 h-4 w-4" />
            خط الأنابيب
          </TabsTrigger>
          <TabsTrigger value="new">
            <Plus className="ml-2 h-4 w-4" />
            عميل جديد
          </TabsTrigger>
          <TabsTrigger value="detail" disabled={!state.selectedProspect}>
            <Building2 className="ml-2 h-4 w-4" />
            تفاصيل العميل
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <PipelineTab
            pipeline={state.pipeline}
            prospects={state.prospects}
            onSelectProspect={actions.handleSelectProspect}
          />
        </TabsContent>

        <TabsContent value="new">
          <NewProspectTab
            submitting={state.submitting}
            onSubmit={actions.handleCreateProspect}
          />
        </TabsContent>

        <TabsContent value="detail" className="space-y-4">
          <ProspectDetailTab
            prospect={state.selectedProspect}
            submitting={state.submitting}
            kycData={state.kycData}
            riskFactors={state.riskFactors}
            decisionValue={state.decisionValue}
            decisionRationale={state.decisionRationale}
            onKycDataChange={actions.setKycData}
            onRiskFactorsChange={actions.setRiskFactors}
            onDecisionValueChange={actions.setDecisionValue}
            onDecisionRationaleChange={actions.setDecisionRationale}
            onSubmitKyc={actions.handleSubmitKyc}
            onSubmitRisk={actions.handleAssessRisk}
            onSubmitDecision={actions.handleMakeDecision}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
