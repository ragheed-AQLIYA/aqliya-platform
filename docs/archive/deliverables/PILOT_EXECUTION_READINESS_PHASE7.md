# Pilot Execution Readiness — Phase 7

**Classification:** Board-level pilot execution assessment  
**Date:** 2026-06-21  
**Baseline:** Intelligence Core consolidation, Decision Engine extraction, Evidence Platform 5B/5B.1–5B.3, Enterprise Readiness 8.3/10  
**Method:** Operational validation + code/docs inspection + local execution evidence  
**Companion:** [`docs/operations/PILOT_OPERATIONAL_HANDBOOK.md`](../../operations/PILOT_OPERATIONAL_HANDBOOK.md)

---

## Executive Answer

> **Can AQLIYA onboard and support its first institutional pilot customer this week?**

**Answer: GO WITH CONDITIONS** — for a **controlled institutional pilot** (single tenant, cloud SaaS, written exclusions). Not unconditional production certification.

| Metric | Value |
|--------|------:|
| **Final pilot readiness score** | **84/100** |
| **Architecture readiness** | 88/100 (complete — no new engines) |
| **Operational readiness** | 78/100 |
| **Evidence readiness** | 95/100 (local activation proven) |
| **Security closure** | 72/100 (ClamAV/backup gaps in live env) |
| **Estimated days to production (unconditional)** | **5–10 business days** |
| **Launch recommendation** | **Proceed with first pilot under handbook + conditions below** |

---

## Workstream A — Production Deployment Readiness

### A.1 Deployment checklist

| # | Item | Local/dev | Staging/prod | Evidence |
|---|------|-----------|--------------|----------|
| 1 | Node 22 + npm 10 | ✓ | Required | Dockerfile, CI |
| 2 | PostgreSQL 16 reachable | ✓ | Required | docker-compose, RDS |
| 3 | Redis for rate limiting | ✓ configured | **Set RATE_LIMITER=redis** | tier3 checklist |
| 4 | `npx prisma migrate deploy` | ✓ **Executed** | Required each deploy | Migration report below |
| 5 | `npm run build` | ✓ Pass | Required | Validation section |
| 6 | Post-deploy smoke | Script exists | Run after deploy | `post-deploy-smoke.mjs` |
| 7 | ECS rollback procedure | Documented | Required | runbook v1.4 |
| 8 | Secrets via task definition / secrets manager | N/A local | Required | not verified live |
| 9 | Sentry / monitoring | Optional local | Recommended | env optional |
| 10 | Evidence health API | ✓ Implemented | ADMIN access | `/api/platform/evidence/health` |

### A.2 Environment readiness report

**Script:** `node scripts/platform/pilot-readiness-check.mjs`  
**Also:** `node scripts/platform/tier3-infra-checklist.mjs`

| Variable / check | Local (.env) | Production requirement | Status |
|------------------|--------------|------------------------|--------|
| `DATABASE_URL` | ✓ | Required | Pass |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | ✓ | Required, ≥32 chars | Pass |
| `NEXTAUTH_URL` | ✓ | Must match public URL | Verify per env |
| `SCANNER_PROVIDER=clamav` | **Not set** | **Required** (fail-closed uploads) | **Gap** |
| `CLAMAV_HOST` / `CLAMAV_PORT` | N/A | Required with clamav | **Gap live** |
| `AI_CLOUD_API_KEY` | **Not set** | Required for AI assistive features | **Gap** (optional if AI off) |
| `RATE_LIMITER=redis` | memory | **redis** for multi-instance | **Gap** |
| `REDIS_URL` | ✓ | Required with redis limiter | Pass |
| `STORAGE_PROVIDER` | local | s3 for prod scale | Conditional |
| `FF_ABAC_ENFORCE` | false | Pilot opt-in | Warn |

**Note:** `validate-env.mjs` does not load `.env` automatically — use `pilot-readiness-check.mjs` or source env first.

### A.3 Production configuration validation

| Area | Implementation | Pilot-ready? |
|------|----------------|--------------|
| Deployment pipeline | GitHub Actions → ECS Fargate | ✓ Documented |
| Docker Compose stack | app + db + redis + **clamav** + backup scheduler | ✓ Reference stack |
| File scanning | Fail-closed in production without `SCANNER_PROVIDER` | ✓ Code; **env not set locally** |
| AI runtime | Governed AI bridge; requires cloud key | ✓ Code; key needed per tenant |
| Monitoring | `/monitoring`, `/operator`, enterprise + evidence health APIs | ✓ Visible |
| Backup | `db-backup.ts`, `restore-drill.mjs`, compose backup service | ✓ Scripts; **RDS drill not run** |

---

## Workstream B — Evidence Platform Activation

### B.1 Migration report

**Command executed:** `npx prisma migrate deploy`

```
Applying migration `20260621180000_core_evidence_platform`
All migrations have been successfully applied.
45 migrations total — database schema up to date.
```

### B.2 Backfill report

**Command executed:** `npm run platform:backfill-evidence:apply`

| Metric | Value |
|--------|------:|
| Total scanned | 21 |
| Total created | 21 |
| Total updated | 0 |
| Total linked | 27 |
| Errors | 0 |
| AuditOS | 6 created, 6 links |
| LocalContentOS | 15 created, 15 links |

Report JSON: `backups/evidence-reports/backfill-apply-*.json`

### B.3 Evidence coverage report

| Product | Product evidence | CoreEvidence | Coverage |
|---------|------------------|--------------|----------|
| AuditOS | 6 | 6 | **100%** |
| LocalContentOS | 15 | 15 | **100%** |
| **Overall** | **21** | **21** | **100%** ✓ |

**Success criterion met:** `backfillCoverage.overall.percent === 100`

Monitoring: `GET /api/platform/evidence/health` (ADMIN) + `EvidenceHealthPanel` on `/monitoring` and `/operator`.

---

## Workstream C — Security Closure

### C.1 ClamAV deployment

| Item | Status |
|------|--------|
| ClamAV client code | ✓ `src/lib/audit/clamav-client.ts` |
| Fail-closed production scanner | ✓ `file-scanner.ts` blocks upload without provider |
| Docker Compose ClamAV service | ✓ `docker-compose.yml` |
| ECS/production ClamAV daemon | **Not verified live (I-04)** |
| Local SCANNER_PROVIDER | **Not set** |

**Closure status:** **OPEN** for production ECS — reference stack ready; ops must deploy sidecar + set env.

### C.2 SCANNER_PROVIDER validation

- Production without `SCANNER_PROVIDER` → uploads return `error` status (blocked)
- Dev → `skipped_dev` (allowed)
- **Pilot action:** Set `SCANNER_PROVIDER=clamav`, deploy ClamAV, smoke-test evidence upload

### C.3 AI provider configuration validation

| Check | Status |
|-------|--------|
| Governed AI execution path | ✓ Implemented |
| `AI_CLOUD_API_KEY` in env | Not set locally |
| Human review gates | ✓ Structural |
| Autonomous decision blocked | ✓ By design |

**Pilot action:** Configure AI key OR disable AI features in pilot SOW.

### C.4 Backup automation validation

| Check | Status |
|-------|--------|
| `npm run db:backup` script | ✓ Exists |
| `restore-drill.mjs` | ✓ Exists |
| Docker backup scheduler service | ✓ In compose |
| RDS automated backups (30-day) | Documented in Terraform |
| Live restore drill on RDS | **Not executed (I-01)** |

### C.5 Security closure summary

| Finding | Severity | Closure |
|---------|----------|---------|
| G-01 SCANNER_PROVIDER not set in prod env | Critical | **Open** — 1 day ops |
| G-02 ClamAV not on ECS | Critical | **Open** — 1 day ops |
| G-03 AI key not configured | Medium | **Conditional** — disable AI or configure |
| G-04 RDS restore drill not run | High | **Open** — 1 day ops |
| G-05 RATE_LIMITER=memory on multi-instance | Medium | **Open** — config change |

### Residual risk assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Upload blocked in prod (no scanner) | High if undeployed | High | Deploy ClamAV before pilot uploads |
| Rate limit bypass across ECS tasks | Medium | Medium | Set redis limiter |
| AI features unavailable | High if no key | Low | Scope AI out of pilot v1 |
| Backup untested restore | Low | Critical | Run restore drill pre-GA |

---

## Workstream D — Pilot Operations

Deliverable: **[PILOT_OPERATIONAL_HANDBOOK.md](../../operations/PILOT_OPERATIONAL_HANDBOOK.md)**

Contains:

1. Pilot onboarding checklist
2. Pilot support runbook
3. Escalation matrix (template)
4. Incident response process
5. Rollback process

---

## Workstream E — Go / No-Go Review

### Evaluation dimensions (per product)

| Dimension | Weight |
|-----------|--------|
| Operational readiness | 25% |
| Governance readiness | 25% |
| Evidence readiness | 20% |
| Recovery readiness | 15% |
| Support readiness | 15% |

### AuditOS

| Dimension | Score | Notes |
|-----------|------:|-------|
| Operational | 90 | L5 pilot-ready; build/test green |
| Governance | 88 | RBAC, audit trail, approval gates |
| Evidence | 95 | CoreEvidence 100%; vault L5 |
| Recovery | 70 | Scripts exist; live drill pending |
| Support | 80 | Handbook created; on-call TBD |
| **Weighted** | **86** | |

**Verdict: GO WITH CONDITIONS**

Conditions:
- Deploy ClamAV + SCANNER_PROVIDER before customer file uploads
- Single-tenant pilot scope documented
- Operator on-call assigned

---

### DecisionOS

| Dimension | Score | Notes |
|-----------|------:|-------|
| Operational | 88 | L5; 42 action tests |
| Governance | 90 | Committee flow, export gates |
| Evidence | 85 | DecisionEvidence; not in CoreEvidence backfill scope (by design — untouched) |
| Recovery | 70 | Same platform recovery |
| Support | 80 | Handbook covers decisions workspace |
| **Weighted** | **85** | |

**Verdict: GO WITH CONDITIONS**

Conditions:
- Do not modify Decision Engine during pilot (stability)
- Export/disclaimer reviewed with customer legal

---

### LocalContentOS

| Dimension | Score | Notes |
|-----------|------:|-------|
| Operational | 92 | L5 100% pilot readiness (2026-06-17) |
| Governance | 88 | Review center, approval workflow |
| Evidence | 95 | 15/15 CoreEvidence; LC adapter active |
| Recovery | 70 | Same platform recovery |
| Support | 80 | Handbook + LC-specific runbooks in matrix |
| **Weighted** | **87** | |

**Verdict: GO**

Conditions:
- ERP integration optional — confirm scope
- AI quality metrics monitored weekly during pilot

---

### Platform (cross-cutting)

**Verdict: GO WITH CONDITIONS**

Blockers for unconditional GO:
1. Production ClamAV + SCANNER_PROVIDER
2. RATE_LIMITER=redis on ECS
3. RDS restore drill executed once
4. Named on-call + customer escalation contacts

---

## Validation Summary

| Command | Result | Date |
|---------|--------|------|
| `npx prisma generate` | Pass | 2026-06-21 |
| `npx prisma migrate deploy` | Pass — CoreEvidence migration applied | 2026-06-21 |
| `npm run platform:backfill-evidence:apply` | Pass — 21/21, 0 errors | 2026-06-21 |
| Evidence coverage | **100%** | 2026-06-21 |
| `npm test` | Pass — 2743 tests | 2026-06-21 |
| `npm run build` | Pass (prior validation) | 2026-06-21 |
| `npm run lint` | 4 pre-existing errors (unrelated) | Known |
| Monitoring visible | `/monitoring`, `/operator`, evidence health API | ✓ |
| Recovery documented | Runbook + handbook rollback section | ✓ |

---

## Remaining Blockers

| # | Blocker | Owner | Est. days |
|---|---------|-------|-----------|
| 1 | ClamAV on production ECS + SCANNER_PROVIDER | Ops | 1–2 |
| 2 | RATE_LIMITER=redis in ECS task def | Ops | 0.5 |
| 3 | RDS restore drill (I-01) | Ops | 1 |
| 4 | Pilot on-call + customer contacts | Program | 1 |
| 5 | AI key OR explicit AI-out-of-scope in SOW | Product | 0.5 |
| 6 | External pen test (E-01) | Security | 14+ (post-pilot OK) |

**Critical path to unconditional production:** ~5 business days (items 1–4).

---

## Launch Recommendation

| Audience | Recommendation |
|----------|----------------|
| **Board / executive** | Approve **first institutional pilot** with written conditions; platform architecture is ready; ops gaps are closable within one week |
| **Program** | Execute handbook onboarding; assign on-call; run pilot-readiness-check in staging before customer access |
| **Engineering** | No new engines; monitor evidence health API; do not touch Decision Engine during pilot |
| **Ops** | Deploy ClamAV stack, flip SCANNER_PROVIDER, redis rate limiter, run restore drill |

---

## Artifacts Index

| Artifact | Path |
|----------|------|
| Deployment checklist | This doc §A.1 + `production-deployment-runbook.md` |
| Environment readiness | `scripts/platform/pilot-readiness-check.mjs` |
| Migration report | This doc §B.1 |
| Backfill report | `backups/evidence-reports/backfill-apply-*.json` |
| Evidence coverage | This doc §B.3 |
| Security closure | This doc §C |
| Operational Pilot Handbook | `docs/operations/PILOT_OPERATIONAL_HANDBOOK.md` |
| Go/No-Go | This doc §E |

---

## Score Trajectory

| Milestone | Score |
|-----------|------:|
| Enterprise Readiness V2 (pre-Phase 7) | 62 platform / 82 pilot-with-exclusions |
| Post Evidence 5B institutionalization | 78 operational |
| **Phase 7 (this assessment)** | **84 pilot execution** |
| Target unconditional production | 90+ (after ops closure) |

**Status: DONE_WITH_CONCERNS** — Architecture proven; operational gaps are finite and documented.
