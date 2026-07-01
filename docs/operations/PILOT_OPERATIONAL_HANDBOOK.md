# AQLIYA Operational Pilot Handbook

**Version:** 1.0  
**Date:** 2026-06-21  
**Scope:** First institutional pilot — AuditOS, DecisionOS, LocalContentOS  
**Authority:** Operations (supplements `production-deployment-runbook.md`)

---

## 1. Pilot Onboarding Checklist

### Pre-contract (commercial)

- [ ] Signed pilot SOW with scope, duration, and exclusions documented
- [ ] Customer data residency requirements confirmed (AWS me-south-1 default)
- [ ] SSO requirement identified (SAML/OIDC vs credentials)
- [ ] Pilot users identified with roles (ADMIN, OPERATOR, REVIEWER, VIEWER)
- [ ] Products in scope confirmed (AuditOS / DecisionOS / LocalContentOS — not all required)

### Platform provisioning (Day 0–1)

- [ ] `PlatformOrganization` created for customer tenant
- [ ] Users invited or SCIM-provisioned
- [ ] SSO provider configured at `/settings/sso` (if required)
- [ ] RBAC verified — pilot users cannot access other tenants
- [ ] Seed/demo data removed or isolated from pilot workspace

### Evidence platform activation (Day 0)

- [ ] `npx prisma migrate deploy` — all migrations applied
- [ ] `npm run platform:backfill-evidence:apply` — historical evidence registered
- [ ] `GET /api/platform/evidence/health` — `backfillCoverage.overall.percent === 100`
- [ ] File upload path tested with `SCANNER_PROVIDER=clamav` in target environment

### Product workspace setup

| Product | Setup actions |
|---------|---------------|
| **AuditOS** | Create engagement, upload trial balance, verify evidence vault |
| **DecisionOS** | Create decision, attach evidence, run review workflow |
| **LocalContentOS** | Create project, import suppliers/spend, upload LC evidence |

### Go-live verification (Day 1)

- [ ] Login + MFA (if enabled)
- [ ] Core workflow smoke test per product in scope
- [ ] Export/download tested with audit log entry
- [ ] Monitoring dashboards accessible (`/monitoring`, `/operator`)
- [ ] Customer admin briefed on support channel and escalation path

---

## 2. Pilot Support Runbook

### Support tiers

| Tier | Owner | Response target | Scope |
|------|-------|-----------------|-------|
| L1 | Customer admin | 4 business hours | Access, navigation, how-to |
| L2 | AQLIYA operator | 8 business hours | Workflow errors, data issues |
| L3 | Platform engineering | 24 hours | Security, data integrity, outage |

### Daily operator routine

1. Check `/monitoring` — enterprise health + evidence health panels
2. Review `GET /api/platform/enterprise-health` for critical alerts
3. Review `GET /api/platform/evidence/health` for adapter sync gaps
4. Check CloudWatch / Sentry for error spikes (production)
5. Confirm backup job completed (RDS automated backups + optional `db:backup`)

### Weekly pilot review

- User adoption metrics (logins, mutations per product)
- Open findings / decisions / LC review queue depth
- Evidence lifecycle distribution (created vs approved)
- Customer feedback log update

### Known pilot limitations (do not over-promise)

- On-Prem / Air-Gapped — strategic only, not production package
- SalesOS, RiskOS — prototype; not in first institutional pilot unless explicitly scoped
- `/auditos/*` — public demo only; not customer workspace
- AI features require `AI_CLOUD_API_KEY`; outputs are assistive drafts only

---

## 3. Escalation Matrix

| Severity | Definition | Example | Escalate to | SLA |
|----------|------------|---------|-------------|-----|
| **P1 — Critical** | Platform down or data breach suspected | Auth failure all users, cross-tenant data visible | L3 + leadership immediately | 1 hour |
| **P2 — High** | Core workflow blocked | Evidence upload fails all files, export broken | L3 | 4 hours |
| **P3 — Medium** | Degraded feature | AI suggestions failing, slow pages | L2 | 1 business day |
| **P4 — Low** | UX / cosmetic | Label typo, non-blocking UI | L1 | Next sprint |

### Escalation contacts (fill before pilot)

| Role | Name | Channel |
|------|------|---------|
| Pilot customer admin | _TBD_ | _email / Teams_ |
| AQLIYA operator on-call | _TBD_ | _Pager / phone_ |
| Platform engineering lead | _TBD_ | _Slack #aqliya-ops_ |

---

## 4. Incident Response Process

### Detect

- Automated: CloudWatch alarms, Sentry errors, health API alerts
- Manual: Customer report, operator monitoring

### Triage (within 15 minutes for P1/P2)

1. Classify severity (P1–P4)
2. Assign incident commander (L2 or L3)
3. Open incident log (timestamp, symptoms, affected tenants/products)
4. Communicate to customer admin if P1/P2

### Contain

- Disable affected feature flag if available
- Block affected route at middleware if security-related
- Do **not** disable auth/RBAC globally without leadership approval

### Resolve

- Apply fix or rollback (see Section 5)
- Verify with smoke tests (`scripts/post-deploy-smoke.mjs`)
- Confirm evidence integrity via `/api/platform/evidence/health`

### Post-incident

- Post-mortem within 5 business days for P1/P2
- Update runbook if gap identified
- Platform audit log review for affected period

---

## 5. Rollback Process

### Application rollback (ECS / Vercel)

1. Identify last known-good image/tag (N-1 from deploy pipeline)
2. ECS: update service to previous task definition revision
3. Vercel: promote previous deployment from dashboard
4. Run `scripts/post-deploy-smoke.mjs` against rolled-back environment
5. Notify customer if pilot-affecting

### Database rollback

- **Do not** run destructive migrations in production without backup
- RDS point-in-time restore requires AWS console + leadership approval
- Local/staging: `restore-drill.mjs` validates backup integrity only

### Evidence rollback

- CoreEvidence is additive mirror — product tables are source of truth
- Rollback app code does not require evidence data rollback
- If bad backfill: re-run `platform:backfill-evidence:apply` (idempotent)

### Rollback decision criteria

| Trigger | Action |
|---------|--------|
| Build-breaking deploy | Immediate app rollback |
| Auth/RBAC regression | Immediate rollback + hotfix |
| Data corruption suspected | Stop writes, assess RDS PITR |
| Evidence sync gap only | No rollback; run backfill + investigate adapter |

---

## 6. Quick Reference Commands

```bash
# Evidence activation
npx prisma migrate deploy
npm run platform:backfill-evidence:apply
node scripts/platform/pilot-readiness-check.mjs

# Health checks
curl -H "Cookie: ..." https://<host>/api/platform/evidence/health
curl -H "Cookie: ..." https://<host>/api/platform/enterprise-health

# Backup
npm run db:backup
node scripts/platform/restore-drill.mjs

# Post-deploy smoke
node scripts/post-deploy-smoke.mjs
```

---

## 7. Related Documents

- `docs/operations/production-deployment-runbook.md`
- `docs/deliverables/PILOT_EXECUTION_READINESS_PHASE7.md`
- `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`
- `docs/deliverables/CORE_EVIDENCE_PLATFORM_PHASE_5B_1_3.md`
