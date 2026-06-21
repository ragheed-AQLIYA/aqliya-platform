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
- **Validation:** `npx tsc --noEmit` pass, `npm run build` pass, `npm run smoke:tier2` 7/7, `npm run smoke:tier3:http` 10/10.

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

## Operator Quick Reference
```bash
npm run smoke:tier2              # DB + outbox + ABAC (no server)
npm run smoke:tier3:http         # All platform operator APIs (server required)
npm run tier3:infra-checklist    # Local env pre-flight
npm run verify:redis-rate-limiter
```

**Surfaces:** `/monitoring`, `/operator`, `/intelligence`  
**Docs:** `docs/operations/parallel-execution-cycle-tier3-enterprise-2026-06-21.md`

## Relevant Files
- `docs/deliverables/EXECUTIVE_RECOMMENDATION_2026.md`
- `docs/operations/parallel-execution-cycle-tier2-core-namespace-2026-06-21.md`
- `docs/operations/parallel-execution-cycle-tier3-enterprise-2026-06-21.md`
- `docs/operations/production-deployment-runbook.md` (v1.4)
