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
    <div className="space-y-6">
      <SummaryCards metrics={metrics} />
      <GovernanceCards metrics={metrics} />
      <DistributionPanel metrics={metrics} />
      <CrossDecisionPatterns metrics={metrics} />
      <PortfolioPanel metrics={metrics} />
      <OutcomePanel metrics={metrics} />
      <BottlenecksPanel metrics={metrics} />
      <AlertsPanel metrics={metrics} />
      <RecentDecisionsPanel metrics={metrics} />
    </div>
  );
}
