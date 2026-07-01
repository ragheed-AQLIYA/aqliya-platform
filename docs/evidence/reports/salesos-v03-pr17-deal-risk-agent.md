# SalesOS v0.3 PR-17 ? Deal Risk Agent Stub (Rules, Advisory Only)

**Workstream:** L6 PR-17 ? salesos_p17_deal_risk_agent
**Date:** 2026-06-01
**Validation:** light validated (sales-deal-risk-agent.test.ts ? 5/5 pass)

## Goal

Advisory rules-only deal risk: activity gaps, no-response, missing stakeholder hints. No LLM. metadata.riskAssessment + audit sales.agent.deal_risk_computed.

## Files

- src/lib/sales/agents/deal-risk.ts
- src/components/sales/deal-risk-panel.tsx
- src/app/sales/deals/[id]/page.tsx (Risk panel)
- src/actions/sales-actions.ts (recalculateDealRiskAction)
- src/lib/sales/audit-events.ts (AGENT_DEAL_RISK_COMPUTED)
- src/lib/sales/__tests__/sales-deal-risk-agent.test.ts

## Not changed

- objection-analysis, follow-up agents/UI

## Arabic one-liner

وكيل مخاطر الصفقة استشاري بقواعد فقط — فجوات النشاط وغياب الرد وتلميحات أصحاب المصلحة في metadata بدون LLM.
