"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type {
  LcScoreReportRow,
  SpendReportRow,
  SupplierReportRow,
} from "@/actions/localcontent-report-actions";
import { LcScoreReport } from "./lc-score-report";
import { SpendReport } from "./spend-report";
import { SupplierReport } from "./supplier-report";
import { TAB_OPTIONS } from "./use-reports";

export function ReportsClient({
  scoreData,
  spendData,
  supplierData,
}: {
  scoreData: LcScoreReportRow[];
  spendData: SpendReportRow[];
  supplierData: SupplierReportRow[];
}) {
  return (
    <Tabs defaultValue="scores" className="mt-6">
      <TabsList>
        {TAB_OPTIONS.map((tab) => (
          <TabsTrigger key={tab.key} value={tab.key}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="scores" className="mt-4">
        <LcScoreReport data={scoreData} />
      </TabsContent>
      <TabsContent value="spend" className="mt-4">
        <SpendReport data={spendData} />
      </TabsContent>
      <TabsContent value="suppliers" className="mt-4">
        <SupplierReport data={supplierData} />
      </TabsContent>
    </Tabs>
  );
}
