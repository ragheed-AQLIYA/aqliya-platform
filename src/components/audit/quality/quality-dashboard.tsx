"use client";

// ─── AuditOS L6.7 ISQM1 Quality Dashboard ───

import { useState } from "react";
import {
  ShieldCheck,
  Target,
  AlertTriangle,
  ClipboardCheck,
  TrendingUp,
  Loader2,
  Gauge,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQualityDashboard } from "./components/use-quality-dashboard";
import { OverviewTab } from "./components/overview-tab";
import { ObjectivesTab } from "./components/objectives-tab";
import { RisksTab } from "./components/risks-tab";
import { MonitoringTab } from "./components/monitoring-tab";
import { FindingsTab } from "./components/findings-tab";
import { EvaluationTab } from "./components/evaluation-tab";

interface QualityDashboardProps {
  auditOrganizationId: string;
}

export function QualityDashboard({ auditOrganizationId }: QualityDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { loading, dashboard, objectives, risks, findings, remediations, monitoring, evaluations } =
    useQualityDashboard(auditOrganizationId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            <Gauge className="ml-2 h-4 w-4" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="objectives">
            <Target className="ml-2 h-4 w-4" />
            الأهداف
          </TabsTrigger>
          <TabsTrigger value="risks">
            <AlertTriangle className="ml-2 h-4 w-4" />
            المخاطر
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <ClipboardCheck className="ml-2 h-4 w-4" />
            المراقبة
          </TabsTrigger>
          <TabsTrigger value="findings">
            <ShieldCheck className="ml-2 h-4 w-4" />
            النتائج
          </TabsTrigger>
          <TabsTrigger value="evaluation">
            <TrendingUp className="ml-2 h-4 w-4" />
            التقييم
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab dashboard={dashboard} />
        </TabsContent>

        <TabsContent value="objectives" className="space-y-4">
          <ObjectivesTab objectives={objectives} />
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <RisksTab risks={risks} />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <MonitoringTab monitoring={monitoring} />
        </TabsContent>

        <TabsContent value="findings" className="space-y-4">
          <FindingsTab findings={findings} />
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-4">
          <EvaluationTab evaluations={evaluations} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
