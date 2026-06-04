// LC-06 — organization spend analytics (deterministic, reuses scoring breakdown)

import { calculateSpendBreakdown, type CalculateScoringInput } from "./scoring";

export interface ProjectSpendSummary {
  projectId: string;
  projectName: string;
  reportingPeriod: string;
  status: string;
  recordCount: number;
  totalSpend: number;
  localSpend: number;
  nonLocalSpend: number;
  unclassifiedSpend: number;
  localContentPercentage: number;
}

export interface OrganizationSpendAnalytics {
  projectCount: number;
  totalSpend: number;
  localSpend: number;
  nonLocalSpend: number;
  unclassifiedSpend: number;
  localContentPercentage: number;
  byCategory: Record<string, number>;
  projects: ProjectSpendSummary[];
}

export function buildOrganizationSpendAnalytics(input: {
  projects: Array<{
    id: string;
    name: string;
    reportingPeriod: string;
    status: string;
    spendRecords: CalculateScoringInput["spendRecords"];
  }>;
}): OrganizationSpendAnalytics {
  const byCategory: Record<string, number> = {};
  const projects: ProjectSpendSummary[] = [];
  let totalSpend = 0;
  let localSpend = 0;
  let nonLocalSpend = 0;
  let unclassifiedSpend = 0;

  for (const project of input.projects) {
    const breakdown = calculateSpendBreakdown(project.spendRecords);
    for (const row of project.spendRecords) {
      const cat = row.category || "other";
      byCategory[cat] = (byCategory[cat] ?? 0) + row.amount;
    }
    projects.push({
      projectId: project.id,
      projectName: project.name,
      reportingPeriod: project.reportingPeriod,
      status: project.status,
      recordCount: project.spendRecords.length,
      totalSpend: breakdown.totalSpend,
      localSpend: breakdown.localSpend,
      nonLocalSpend: breakdown.nonLocalSpend,
      unclassifiedSpend: breakdown.unclassifiedSpend,
      localContentPercentage: breakdown.localContentPercentage,
    });
    totalSpend += breakdown.totalSpend;
    localSpend += breakdown.localSpend;
    nonLocalSpend += breakdown.nonLocalSpend;
    unclassifiedSpend += breakdown.unclassifiedSpend;
  }

  const classified = localSpend + nonLocalSpend;
  const localContentPercentage =
    classified > 0 ? (localSpend / classified) * 100 : 0;

  return {
    projectCount: projects.length,
    totalSpend,
    localSpend,
    nonLocalSpend,
    unclassifiedSpend,
    localContentPercentage,
    byCategory,
    projects: projects.sort((a, b) => b.totalSpend - a.totalSpend),
  };
}
