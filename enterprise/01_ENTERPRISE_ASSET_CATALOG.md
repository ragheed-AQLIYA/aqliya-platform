# AQLIYA Enterprise Asset Catalog

**Status:** Active | **Version:** 1.0 | **Date:** 2026-06-30

## 25 Enterprise Assets

### Products (10)

| ID | Asset | Status | Owner | Routes |
|----|-------|--------|-------|--------|
| P01 | AuditOS | L5 | Audit Team | 27 |
| P02 | LocalContentOS | L5 | LC Team | 29 |
| P03 | DecisionOS | L5 | Gov Team | 22 |
| P04 | WorkflowOS | L5 | Platform | 8 |
| P05 | SalesOS | L5 | Sales | 30 |
| P06 | LocalContactOS | L5 | Platform | 7 |
| P07 | Office AI Assistant | L5 | AI Team | 3 |
| P08 | RiskOS | L5 | Audit | 4 |
| P09 | Institutional Memory | L5 | Platform | 4 |
| P10 | ContentStudio | L4 | Platform | 5 |

### Core Platform Modules (12)

| ID | Asset | Location | Files | Tests |
|----|-------|----------|-------|-------|
| C01 | AI Engine | `src/lib/core/ai/` | 57 | ✅ |
| C02 | Workflow Engine | `src/lib/core/workflow/` | 6 | ✅ |
| C03 | Evidence Core | `src/lib/core/evidence/` | 11 | ✅ |
| C04 | Knowledge Engine | `src/lib/core/knowledge/` | 13 | ✅ |
| C05 | Institutional Memory | `src/lib/core/memory/` | 3 | ✅ |
| C06 | Policy/ABAC | `src/lib/core/policy/` | 14 | ✅ |
| C07 | Events/Outbox | `src/lib/core/events/` | 6 | ✅ |
| C08 | Core Audit | `src/lib/core/audit/` | 2 | ✅ |
| C09 | Decision Engine | `src/lib/core/decision/` | 10 | ✅ |
| C10 | Signals | `src/lib/core/signals/` | 6 | ✅ |
| C11 | Governance | `src/lib/core/governance/` | 2 | ✅ |
| C12 | Contracts | `src/lib/core/contracts/` | 2 | ✅ |

### Infrastructure (3)

| ID | Asset | Components |
|----|-------|-----------|
| I01 | Docker Stack | 6 files (1 Dockerfile + 5 compose) |
| I02 | CI/CD | 6 GitHub workflows |
| I03 | Monitoring | Sentry + health endpoints |
