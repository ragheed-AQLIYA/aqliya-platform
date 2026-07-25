"use client";

import { Loader2, Shield, Users, AlertTriangle, Search, FileText, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIndependence } from "./components/use-independence";
import { OverviewTab } from "./components/overview-tab";
import { RegisterTab } from "./components/register-tab";
import { ThreatsTab } from "./components/threats-tab";
import { ConflictCheckTab } from "./components/conflict-check-tab";
import { ConfirmationTab } from "./components/confirmation-tab";

interface IndependenceDashboardProps {
  auditOrganizationId: string;
}

export function IndependenceDashboard({ auditOrganizationId }: IndependenceDashboardProps) {
  const [state, actions] = useIndependence(auditOrganizationId);

  if (state.loading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      {state.error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />{state.error}
        </div>
      )}
      {state.success && (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />{state.success}
        </div>
      )}

      <Tabs value={state.activeTab} onValueChange={actions.setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview"><Shield className="ml-2 h-4 w-4" />نظرة عامة</TabsTrigger>
          <TabsTrigger value="register"><Users className="ml-2 h-4 w-4" />السجل</TabsTrigger>
          <TabsTrigger value="threats"><AlertTriangle className="ml-2 h-4 w-4" />التهديدات</TabsTrigger>
          <TabsTrigger value="conflict"><Search className="ml-2 h-4 w-4" />التعارض</TabsTrigger>
          <TabsTrigger value="confirm"><FileText className="ml-2 h-4 w-4" />التأكيد السنوي</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab state={state} actions={actions} /></TabsContent>
        <TabsContent value="register"><RegisterTab state={state} actions={actions} /></TabsContent>
        <TabsContent value="threats"><ThreatsTab state={state} actions={actions} /></TabsContent>
        <TabsContent value="conflict"><ConflictCheckTab state={state} actions={actions} /></TabsContent>
        <TabsContent value="confirm"><ConfirmationTab state={state} actions={actions} /></TabsContent>
      </Tabs>
    </div>
  );
}
