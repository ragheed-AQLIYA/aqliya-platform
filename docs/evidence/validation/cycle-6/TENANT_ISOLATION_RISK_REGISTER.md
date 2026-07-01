# Tenant Isolation Risk Register — Cycle 6

**Date:** 2026-06-06  
**Agent:** AGENT-B

| ID | Risk | Severity | Evidence | Cycle 6 impact |
| -- | ---- | -------- | -------- | -------------- |
| TI-01 | ADMIN super-user cross-org access via `server-action-guard` | **High** (accepted) | `cross-tenant-isolation.test.ts`; `RISK_ACCEPTANCE_REPORT.md` | Documented; not remediated in Track A |
| TI-02 | No full-stack DB leak integration test | **Medium** | No `cross-tenant-db.integration.test.ts` | Blocks enterprise L6 claim |
| TI-03 | RAG `DocumentChunk` scoped by `organizationId` — integration unproven on staging | **Medium** | Code in `orchestrator-rag-inject.ts` | AGENT-A live smoke |
| TI-04 | `CoreAccessControl` grants at core; enforcement in guard only | **Low** | By design post phase-1c | Tests updated |
| TI-05 | Client-provided `organizationId` must never bypass server guard | **Critical** if violated | Static: actions use `requireServerActionAccess` pattern | Ongoing code review |

**Accepted for pilot:** TI-01 with audit logging expectation.  
**Must fix for enterprise:** TI-02, external pentest findings (AGENT-E).
