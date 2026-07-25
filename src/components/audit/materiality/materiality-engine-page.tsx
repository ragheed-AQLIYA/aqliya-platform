"use client";

import { Calculator, FileText, History, TrendingUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useMateriality } from "./use-materiality";
import { CalculateTab } from "./components/calculate-tab";
import { CurrentMaterialityTab } from "./components/current-materiality-tab";
import { HistoryTab } from "./components/history-tab";
import { WorkingPaperTab } from "./components/working-paper-tab";

interface MaterialityEnginePageProps {
  engagementId: string;
  auditOrganizationId?: string;
}

export function MaterialityEnginePage({ engagementId }: MaterialityEnginePageProps) {
  const m = useMateriality(engagementId);

  return (
    <div className="space-y-6" dir="rtl">
      <Tabs value={m.activeTab} onValueChange={m.setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculate">
            <Calculator className="ml-2 h-4 w-4" />
            حساب
          </TabsTrigger>
          <TabsTrigger value="current">
            <TrendingUp className="ml-2 h-4 w-4" />
            المستوى الحالي
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="ml-2 h-4 w-4" />
            السجل
          </TabsTrigger>
          <TabsTrigger value="paper">
            <FileText className="ml-2 h-4 w-4" />
            ورقة العمل
          </TabsTrigger>
        </TabsList>

        <CalculateTab
          loading={m.loading}
          error={m.error}
          success={m.success}
          methodologies={m.methodologies}
          selectedMethodology={m.selectedMethodology}
          percentage={m.percentage}
          benchmarkValue={m.benchmarkValue}
          currency={m.currency}
          rationale={m.rationale}
          onMethodologyChange={m.handleMethodologyChange}
          onPercentageChange={m.setPercentage}
          onBenchmarkValueChange={m.setBenchmarkValue}
          onCurrencyChange={m.setCurrency}
          onRationaleChange={m.setRationale}
          onCalculate={m.handleCalculate}
        />

        <CurrentMaterialityTab
          current={m.current}
          loading={m.loading}
          formatAmount={m.formatAmount}
          onApprove={m.handleApprove}
          onGenerateWorkingPaper={m.handleGenerateWorkingPaper}
        />

        <HistoryTab
          history={m.history}
          formatAmount={m.formatAmount}
          onLoadHistory={() => { m.loadHistory(); m.setActiveTab("history"); }}
        />

        <WorkingPaperTab
          workingPaper={m.workingPaper}
          loading={m.loading}
          onGenerateWorkingPaper={m.handleGenerateWorkingPaper}
        />
      </Tabs>
    </div>
  );
}
