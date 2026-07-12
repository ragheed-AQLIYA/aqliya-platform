# Engineering Cost Report

**Agent:** engineering-cost  
**Generated:** 2026-07-11T02:08:06.906Z  
**Score:** 85/100  
**Findings:** 26 (critical 0, high 25, medium 0, low 0, info 1)

> Engineering Excellence — findings only. OpenCode remains implementation authority. No automatic code changes.

## Summary

| Severity | Count |
| -------- | ----- |
| critical | 0 |
| high | 25 |
| medium | 0 |
| low | 0 |
| info | 1 |

## Cost Model

# Engineering Cost Estimates

**Generated:** 2026-07-11T02:08:06.905Z  
**Backlog (sampled):** ~**161** engineer-days

> Estimates are heuristic for prioritization — not contracts or invoices.

| Issue | Impact | Files | LOC | Fix Cost | Risk | Product |
| ----- | ------ | ----- | --- | -------- | ---- | ------- |
| Large module / God Object signal: index.ts | High | 1 | 3657 | 3.25 days | Low | AuditOS |
| Large module / God Object signal: mock-data.ts | High | 1 | 2456 | 3.25 days | Low | AuditOS |
| Large module / God Object signal: services.ts | High | 1 | 1931 | 3.25 days | Low | AuditOS |
| Large module / God Object signal: audit-actions.ts | High | 1 | 1775 | 3.25 days | Low | AuditOS |
| Large module / God Object signal: decisions.ts | High | 1 | 1696 | 3.25 days | Low | DecisionOS |
| Large module / God Object signal: seed-data.ts | High | 1 | 1695 | 3.25 days | Low | SalesOS |
| Long function buildSalesSeedData (1651 lines) | High | 1 | 1695 | 3.25 days | Low | SalesOS |
| Long function runValidation (308 lines) | High | 1 | 3657 | 3.25 days | Low | AuditOS |
| Long function getDashboardMetrics (274 lines) | High | 1 | 1696 | 3.25 days | Low | DecisionOS |
| Elevated complexity in index.ts | High | 1 | 3657 | 3.25 days | Low | AuditOS |
| Large module / God Object signal: localcontent-actions.ts | High | 1 | 1449 | 3 days | Low | LocalContentOS |
| Client module references server-only concerns | High | 1 | 1237 | 2.75 days | Low | LocalContentOS |
| Large module / God Object signal: page.tsx | High | 1 | 1304 | 2.75 days | Low | DecisionOS |
| Large module / God Object signal: page.tsx | High | 1 | 1237 | 2.75 days | Low | LocalContentOS |
| Large module / God Object signal: evidence-page.tsx | High | 1 | 1216 | 2.75 days | Low | AuditOS |
| Long function ConnectionDetailPanel (330 lines) | High | 1 | 1237 | 2.75 days | Low | LocalContentOS |
| Large module / God Object signal: store.ts | High | 1 | 1162 | 2.5 days | Low | SalesOS |
| Large module / God Object signal: ai-advisor.ts | High | 1 | 1162 | 2.5 days | Low | LocalContentOS |
| Large module / God Object signal: demo-data.ts | High | 1 | 1153 | 2.5 days | Low | AuditOS |
| Large module / God Object signal: findings-page.tsx | High | 1 | 1148 | 2.5 days | Low | AuditOS |
| Large module / God Object signal: page.tsx | High | 1 | 1138 | 2.5 days | Low | SalesOS |
| Elevated complexity in ai-advisor.ts | High | 1 | 1162 | 2.5 days | Low | LocalContentOS |
| Client module references server-only concerns | High | 1 | 825 | 2.25 days | Low | AuditOS |
| Long function buildStatementLinesFromMappings (718 lines) | High | 1 | 839 | 2.25 days | Low | AuditOS |
| Long function WorkbookDetailClient (708 lines) | High | 1 | 797 | 2.25 days | Low | LocalContentOS |
| Long function TrialBalanceUpload (434 lines) | High | 1 | 825 | 2.25 days | Low | AuditOS |
| Client module references server-only concerns | High | 1 | 774 | 2 days | Low | AuditOS |
| Long function ClientAcceptanceDashboard (662 lines) | High | 1 | 740 | 2 days | Low | AuditOS |
| Long function PilotPageContent (654 lines) | High | 1 | 774 | 2 days | Low | AuditOS |
| Long function main (645 lines) | High | 1 | 697 | 2 days | Low | Platform |
| Long function ReviewNotesBoard (598 lines) | High | 1 | 655 | 2 days | Low | AuditOS |
| Long function ReviewCenter (561 lines) | High | 1 | 629 | 2 days | Low | LocalContentOS |
| Long function QualityDashboardClient (519 lines) | High | 1 | 629 | 2 days | Low | LocalContentOS |
| Long function CustomProductForm (419 lines) | High | 1 | 763 | 2 days | Low | Platform |
| Client module references server-only concerns | High | 1 | 459 | 1.75 days | Low | DecisionOS |
| Large module / God Object signal: services.ts | Medium | 1 | 961 | 1.75 days | Low | LocalContentOS |
| Large module / God Object signal: sales-actions.ts | Medium | 1 | 917 | 1.75 days | Low | SalesOS |
| Large module / God Object signal: prisma-repository.ts | Medium | 1 | 897 | 1.75 days | Low | SalesOS |
| Large module / God Object signal: workflowos-actions.ts | Medium | 1 | 824 | 1.75 days | Low | WorkflowOS |
| Large module / God Object signal: primitives.ts | Medium | 1 | 83 | 1.75 days | Low | LocalContentOS |

## HIGH Findings

### F-0837 — Large module / God Object signal: index.ts

- **Category:** fix-cost
- **Files:** `src/lib/audit/db/index.ts`
- **Evidence:** Impact=High; Files=1; LOC≈3657; Fix Cost=3.25 days; Risk=Low; Product=AuditOS

### F-0838 — Large module / God Object signal: mock-data.ts

- **Category:** fix-cost
- **Files:** `src/lib/audit/mock-data.ts`
- **Evidence:** Impact=High; Files=1; LOC≈2456; Fix Cost=3.25 days; Risk=Low; Product=AuditOS

### F-0839 — Large module / God Object signal: services.ts

- **Category:** fix-cost
- **Files:** `src/lib/audit/services.ts`
- **Evidence:** Impact=High; Files=1; LOC≈1931; Fix Cost=3.25 days; Risk=Low; Product=AuditOS

### F-0840 — Large module / God Object signal: audit-actions.ts

- **Category:** fix-cost
- **Files:** `src/actions/audit-actions.ts`
- **Evidence:** Impact=High; Files=1; LOC≈1775; Fix Cost=3.25 days; Risk=Low; Product=AuditOS

### F-0841 — Large module / God Object signal: decisions.ts

- **Category:** fix-cost
- **Files:** `src/actions/decisions.ts`
- **Evidence:** Impact=High; Files=1; LOC≈1696; Fix Cost=3.25 days; Risk=Low; Product=DecisionOS

### F-0842 — Large module / God Object signal: seed-data.ts

- **Category:** fix-cost
- **Files:** `src/lib/sales/seed-data.ts`
- **Evidence:** Impact=High; Files=1; LOC≈1695; Fix Cost=3.25 days; Risk=Low; Product=SalesOS

### F-0843 — Long function buildSalesSeedData (1651 lines)

- **Category:** fix-cost
- **Files:** `src/lib/sales/seed-data.ts`
- **Evidence:** Impact=High; Files=1; LOC≈1695; Fix Cost=3.25 days; Risk=Low; Product=SalesOS

### F-0844 — Long function runValidation (308 lines)

- **Category:** fix-cost
- **Files:** `src/lib/audit/db/index.ts`
- **Evidence:** Impact=High; Files=1; LOC≈3657; Fix Cost=3.25 days; Risk=Low; Product=AuditOS

### F-0845 — Long function getDashboardMetrics (274 lines)

- **Category:** fix-cost
- **Files:** `src/actions/decisions.ts`
- **Evidence:** Impact=High; Files=1; LOC≈1696; Fix Cost=3.25 days; Risk=Low; Product=DecisionOS

### F-0846 — Elevated complexity in index.ts

- **Category:** fix-cost
- **Files:** `src/lib/audit/db/index.ts`
- **Evidence:** Impact=High; Files=1; LOC≈3657; Fix Cost=3.25 days; Risk=Low; Product=AuditOS

### F-0847 — Large module / God Object signal: localcontent-actions.ts

- **Category:** fix-cost
- **Files:** `src/actions/localcontent-actions.ts`
- **Evidence:** Impact=High; Files=1; LOC≈1449; Fix Cost=3 days; Risk=Low; Product=LocalContentOS

### F-0848 — Client module references server-only concerns

- **Category:** fix-cost
- **Files:** `src/app/local-content/settings/integrations/page.tsx`
- **Evidence:** Impact=High; Files=1; LOC≈1237; Fix Cost=2.75 days; Risk=Low; Product=LocalContentOS

### F-0849 — Large module / God Object signal: page.tsx

- **Category:** fix-cost
- **Files:** `src/app/(dashboard)/decisions/[id]/governance/page.tsx`
- **Evidence:** Impact=High; Files=1; LOC≈1304; Fix Cost=2.75 days; Risk=Low; Product=DecisionOS

### F-0850 — Large module / God Object signal: page.tsx

- **Category:** fix-cost
- **Files:** `src/app/local-content/settings/integrations/page.tsx`
- **Evidence:** Impact=High; Files=1; LOC≈1237; Fix Cost=2.75 days; Risk=Low; Product=LocalContentOS

### F-0851 — Large module / God Object signal: evidence-page.tsx

- **Category:** fix-cost
- **Files:** `src/components/audit/evidence/evidence-page.tsx`
- **Evidence:** Impact=High; Files=1; LOC≈1216; Fix Cost=2.75 days; Risk=Low; Product=AuditOS

### F-0852 — Long function ConnectionDetailPanel (330 lines)

- **Category:** fix-cost
- **Files:** `src/app/local-content/settings/integrations/page.tsx`
- **Evidence:** Impact=High; Files=1; LOC≈1237; Fix Cost=2.75 days; Risk=Low; Product=LocalContentOS

### F-0853 — Large module / God Object signal: store.ts

- **Category:** fix-cost
- **Files:** `src/lib/sales/store.ts`
- **Evidence:** Impact=High; Files=1; LOC≈1162; Fix Cost=2.5 days; Risk=Low; Product=SalesOS

### F-0854 — Large module / God Object signal: ai-advisor.ts

- **Category:** fix-cost
- **Files:** `src/lib/local-content/workbook/ai-advisor.ts`
- **Evidence:** Impact=High; Files=1; LOC≈1162; Fix Cost=2.5 days; Risk=Low; Product=LocalContentOS

### F-0855 — Large module / God Object signal: demo-data.ts

- **Category:** fix-cost
- **Files:** `src/app/auditos/demo-data.ts`
- **Evidence:** Impact=High; Files=1; LOC≈1153; Fix Cost=2.5 days; Risk=Low; Product=AuditOS

### F-0856 — Large module / God Object signal: findings-page.tsx

- **Category:** fix-cost
- **Files:** `src/components/audit/findings/findings-page.tsx`
- **Evidence:** Impact=High; Files=1; LOC≈1148; Fix Cost=2.5 days; Risk=Low; Product=AuditOS

### F-0857 — Large module / God Object signal: page.tsx

- **Category:** fix-cost
- **Files:** `src/app/sales/settings/crm/page.tsx`
- **Evidence:** Impact=High; Files=1; LOC≈1138; Fix Cost=2.5 days; Risk=Low; Product=SalesOS

### F-0858 — Elevated complexity in ai-advisor.ts

- **Category:** fix-cost
- **Files:** `src/lib/local-content/workbook/ai-advisor.ts`
- **Evidence:** Impact=High; Files=1; LOC≈1162; Fix Cost=2.5 days; Risk=Low; Product=LocalContentOS

### F-0859 — Client module references server-only concerns

- **Category:** fix-cost
- **Files:** `src/components/audit/trial-balance/trial-balance-upload.tsx`
- **Evidence:** Impact=High; Files=1; LOC≈825; Fix Cost=2.25 days; Risk=Low; Product=AuditOS

### F-0860 — Long function buildStatementLinesFromMappings (718 lines)

- **Category:** fix-cost
- **Files:** `src/lib/audit/db/statement-builder.ts`
- **Evidence:** Impact=High; Files=1; LOC≈839; Fix Cost=2.25 days; Risk=Low; Product=AuditOS

### F-0861 — Long function WorkbookDetailClient (708 lines)

- **Category:** fix-cost
- **Files:** `src/app/local-content/workbook/[workbookId]/workbook-detail-client.tsx`
- **Evidence:** Impact=High; Files=1; LOC≈797; Fix Cost=2.25 days; Risk=Low; Product=LocalContentOS

## INFO Findings

### F-0836 — Estimated remediation backlog: ~161 engineer-days

- **Category:** cost-summary
- **Evidence:** 80 costed items (sampled)

---

_AQLIYA Engineering Excellence · engineering-cost_
