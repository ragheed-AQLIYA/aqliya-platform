"use client";

import { useState, useEffect } from "react";
import {
  getIsqm1DashboardAction,
  listQualityObjectivesAction,
  listQualityRisksAction,
  listQualityFindingsAction,
  listRemediationsAction,
  listMonitoringActivitiesAction,
  listQualityEvaluationsAction,
} from "@/actions/audit-isqm1-actions";

export interface UseQualityDashboardResult {
  loading: boolean;
  dashboard: any;
  objectives: any[];
  risks: any[];
  findings: any[];
  remediations: any[];
  monitoring: any[];
  evaluations: any[];
}

export function useQualityDashboard(auditOrganizationId: string): UseQualityDashboardResult {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [risks, setRisks] = useState<any[]>([]);
  const [findings, setFindings] = useState<any[]>([]);
  const [remediations, setRemediations] = useState<any[]>([]);
  const [monitoring, setMonitoring] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const orgId = auditOrganizationId || "org-aqliya";
      const [dash, objs, rsks, fnds, rems, mon, evals] = await Promise.all([
        getIsqm1DashboardAction(orgId),
        listQualityObjectivesAction(orgId),
        listQualityRisksAction(orgId),
        listQualityFindingsAction(orgId),
        listRemediationsAction(orgId),
        listMonitoringActivitiesAction(orgId),
        listQualityEvaluationsAction(orgId),
      ]);
      setDashboard(dash);
      setObjectives(objs);
      setRisks(rsks);
      setFindings(fnds);
      setRemediations(rems);
      setMonitoring(mon);
      setEvaluations(evals);
    } catch { /* ignore */ }
    setLoading(false);
  }

  return { loading, dashboard, objectives, risks, findings, remediations, monitoring, evaluations };
}
