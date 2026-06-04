# Parallel Execution — Cycle 6 Plan (BLOCKED until staging live)

**Status:** **In progress (repo)** — live staging smoke still required for commercial sign-off  
**Prerequisite:** Cycle 5 live staging smoke log = PASS in `ai-intelligence-activation.md`

---

## Unblock checklist (ops)

| Step | Command / artifact |
| ---- | ------------------ |
| 1 | `docker compose -f docker-compose.staging.yml up -d db` (pgvector image) |
| 2 | `npx prisma migrate deploy` |
| 3 | `npm run db:verify-pgvector` → PASS |
| 4 | Staging env: `FF_AI_RAG`, `FF_AI_REAL_PROVIDERS`, API keys |
| 5 | `npm run ic:smoke:cycle5:live` + fill smoke log table |
| 6 | Director sign-off → execute Cycle 6 |

---

## Cycle 6 objective

**A1-09** — AuditOS AI integration (assistive only, evidence + human review).

| Agent | Task | Repo status |
| ----- | ---- | ----------- |
| Agent-AuditOS | A1-09 governed LLM via `audit-ai-bridge.ts` | ✅ Wired |
| Agent-IC | Core orchestrator + RAG (consumed by bridge) | ✅ |
| Agent-QA | `audit-ai-bridge.test.ts` + full validation | Partial |

### A1-09 implementation (repo)

- `src/lib/audit/audit-ai-bridge.ts` — `runGovernedAuditAI()` passes `organizationId`, RAG query, actor, provider flags
- `src/lib/audit/services/ai.ts` — all `generate*` flows use bridge
- `src/actions/audit-actions.ts` — passes `userId` / `userRole` to services
- Real LLM draft persisted when provider returns text (not only deterministic `metadata.outputs`)
- Default remains deterministic when `FF_AI_REAL_PROVIDERS` off

**Forbidden in Cycle 6:** DecisionOS/LocalContentOS/Office AI expansion, terraform apply, weakening governance.

---

## Consumption pattern

Products must use Intelligence Core RAG via:

- `src/lib/rag/index.ts` → `retrieveGovernedContext`
- Orchestrator path when `FF_AI_RAG=true`

Do not duplicate vector lookup in product modules.

---

## Related

- `parallel-execution-cycle-2026-06-05-cycle-5.md`
- `pgvector-staging-runbook.md`
- `program-execution-state.md`
