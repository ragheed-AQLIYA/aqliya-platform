export type { DashboardMetrics } from "./components/constants";
import type { DashboardMetrics } from "./components/constants";
import { SummaryCards } from "./components/summary-cards";
import { GovernanceCards } from "./components/governance-cards";
import { DistributionPanel } from "./components/distribution-panel";
import { CrossDecisionPatterns } from "./components/cross-decision-patterns";
import { PortfolioPanel } from "./components/portfolio-panel";
import { OutcomePanel } from "./components/outcome-panel";
import { BottlenecksPanel } from "./components/bottlenecks-panel";
import { AlertsPanel } from "./components/alerts-panel";
import { RecentDecisionsPanel } from "./components/recent-decisions-panel";

export function DecisionDashboard({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="space-y-6" role="region" aria-label="لوحة تحكم القرارات">
      <section aria-label="ملخص القرارات">
        <SummaryCards metrics={metrics} />
      </section>
      <section aria-label="مؤشرات الحوكمة">
        <GovernanceCards metrics={metrics} />
      </section>
      <section aria-label="توزيع القرارات">
        <DistributionPanel metrics={metrics} />
      </section>
      <section aria-label="أنماط القرارات المشتركة">
        <CrossDecisionPatterns metrics={metrics} />
      </section>
      <section aria-label="محفظة القرارات">
        <PortfolioPanel metrics={metrics} />
      </section>
      <section aria-label="تحليل النتائج">
        <OutcomePanel metrics={metrics} />
      </section>
      <section aria-label="نقاط الاختناق">
        <BottlenecksPanel metrics={metrics} />
      </section>
      <section aria-label="التنبيهات">
        <AlertsPanel metrics={metrics} />
      </section>
      <section aria-label="القرارات الأخيرة">
        <RecentDecisionsPanel metrics={metrics} />
      </section>
    </div>
  );
}
