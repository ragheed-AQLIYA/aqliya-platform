# P0 Repository Reproducibility Recovery — **COMPLETE** (2026-06-23)

## Verdict

**Repository is fully reproducible on a fresh PostgreSQL 16 + pgvector database using standard `prisma migrate deploy` → `prisma db seed` → `npm run build` → `npm test`.**

All 53 migrations apply cleanly from scratch. Full test suite (307 suites, 2912 tests) passes with 0 failures. Build produces 138 routes with 0 errors.

## Recovery Deliverables

| Deliverable | Status |
|---|---|
| `docs/deliverables/MIGRATION_FORENSICS_REPORT.md` | Root cause analysis of the 3-model lineage break |
| `docs/deliverables/KNOWLEDGE_CANDIDATE_RECOVERY.md` | Forward-fix strategy and before/after migration graph |
| `docs/deliverables/DATABASE_REPRODUCIBILITY_AUDIT.md` | Fresh DB migrate deploy + seed proof |
| `docs/deliverables/REPOSITORY_RECOVERY_PLAN.md` | 9-Phase P0 recovery plan |
| `docs/deliverables/REPRODUCIBILITY_GATE_REPORT.md` | Phase C-F gate report |
| `docs/deliverables/FRESH_DB_MIGRATION_PROOF.md` | Full migration deploy output |
| `docs/deliverables/FRESH_DB_SEED_PROOF.md` | Full seed output |
| `docs/deliverables/CI_REPRODUCIBILITY_AUDIT.md` | CI/CD gap analysis and hardening |

## Infrastructure/Pipeline Changes

| File | Change |
|---|---|
| `.github/workflows/ci.yml` | `prisma db push` → `prisma migrate deploy` + `prisma migrate status` |
| `.github/workflows/deploy.yml` | New `migrate` job runs `prisma migrate deploy` before `deploy` |
| `docker-compose.yml` | `postgres:16-alpine` → `pgvector/pgvector:pg16` |
| `docker-compose.test.yml` | `postgres:16-alpine` → `pgvector/pgvector:pg16` |
| `package.json` | `test:integration:setup` uses `prisma migrate deploy` |

## Remaining Infrastructure Gaps (requires live AWS)

| Gap | Detail |
|---|---|
| Terraform RDS parameter group | Missing `vector` in `shared_preload_libraries` |
| RDS pgvector extension | Requires `CREATE EXTENSION vector` on RDS after engine supports it |
| Production migration run | First `prisma migrate deploy` on live production RDS has not been executed |

---

## Goal
Post-stabilization enterprise architecture — Tier 1–3 implementation cycles (2026-06-21).

## Constraints & Preferences
- Evidence first — code before documentation, reality before roadmap.
- Tier 1 → Tier 2 → Tier 3 sequencing per `EXECUTIVE_RECOMMENDATION_2026.md`.
- Full Event Bus, Studio, new products — deferred until Tier 3 enterprise ops complete.

## Progress
### Done (code + validation)
- **Tier 1:** Audit convergence, Core access gate, evidence registry facade, signal engine recovery, ABAC shadow wiring.
- **Tier 2 exit (2026-06-21):** `src/lib/core/` facades (workflow, evidence graph, events outbox + schema registry, AI cost/eval, ISA rules). Intelligence workspace `/intelligence`. Event contract on PlatformAuditLog.
- **Tier 3 prep exit (2026-06-21):** Enterprise health API, outbox operator replay, ABAC pilot-status, monitoring/operator UX, runbook v1.4, smoke scripts, build + HTTP smoke 10/10.
- **Phase 8.1 (2026-06-22):** Knowledge Review Governance Dashboard — `/knowledge-review` queue with status filters, KPI widgets, candidate detail panel, review actions (Approve/Reject/Promote) with safety rules, notification events foundation, sidebar link. **Step 11:** `emitReviewEvent` calls wired into `review-workflow.ts` (submit/approve/reject) and `promotion-service.ts` (promote/batch promote) — events are now live.
- **Validation:** `npx tsc --noEmit` pass (0 errors), `npx jest knowledge-review-events` 9/9 pass, `npm run build` pass (138 pages), `npm run smoke:tier2` 7/7, `npm run smoke:tier3:http` 10/10.

### Pending (live infra / external)
- **I-01:** RDS restore drill on AWS staging/production
- **I-03:** `RATE_LIMITER=redis` on ECS + `verify:redis-rate-limiter`
- **I-04:** ClamAV daemon in production
- **E-01:** Penetration test scheduled
- **E-02:** SOC2 gap assessment

## Key Decisions
- **Tier 2 full Event Bus** — deferred to post–Tier 3 prep (Phase 3 pub/sub in discovery report)
- **ABAC enforce** — env-gated pilot only (`FF_ABAC_ENFORCE` + `ABAC_ENFORCE_ORG_IDS`)
- **SSO/SCIM** — L4 built; Tier 3 scope is hardening runbook, not greenfield

## Next Steps (Phase 8.1)
1. Wire `emitReviewEvent` into AuditEngine — register `onReviewEvent` handlers for `writePlatformAuditLog`
2. Batch operations — multi-select approve/reject/promote on queue page
3. Email/queue integration — `onReviewEvent` triggers for notifications
4. Candidate diff view — what changed since last mining cycle

## Operator Quick Reference
```bash
npm run smoke:tier2              # DB + outbox + ABAC (no server)
npm run smoke:tier3:http         # All platform operator APIs (server required)
npm run tier3:infra-checklist    # Local env pre-flight
npm run verify:redis-rate-limiter
```

**Surfaces:** `/knowledge-review`, `/monitoring`, `/operator`, `/intelligence`  
**Docs:** `docs/deliverables/KNOWLEDGE_REVIEW_DASHBOARD_PHASE_8_1.md`, `docs/operations/parallel-execution-cycle-tier3-enterprise-2026-06-21.md`

## Relevant Files
- `docs/deliverables/KNOWLEDGE_REVIEW_DASHBOARD_PHASE_8_1.md`
- `docs/deliverables/EXECUTIVE_RECOMMENDATION_2026.md`
- `docs/operations/parallel-execution-cycle-tier2-core-namespace-2026-06-21.md`
- `docs/operations/parallel-execution-cycle-tier3-enterprise-2026-06-21.md`
- `docs/operations/production-deployment-runbook.md` (v1.4)
- `src/lib/knowledge-review/events.ts` — event types + pub/sub
- `src/lib/tb-intelligence/knowledge-mining/review-workflow.ts` — wired (submit/approve/reject events)
- `src/lib/tb-intelligence/knowledge-mining/promotion-service.ts` — wired (promote/batch promote events)
