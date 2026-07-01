# AQLIYA Pilot Launch Checklist

**Date:** 2026-06-21  
**Status:** Pre-launch

---

## Section 1: Infrastructure

- [ ] **ClamAV deployed**: `docker compose ps clamav` shows running
- [ ] **SCANNER_PROVIDER configured**: `.env` has `SCANNER_PROVIDER=clamav`
- [ ] **Redis deployed**: `docker compose ps redis` shows running
- [ ] **Rate limiter active**: `RATE_LIMITER=redis` set
- [ ] **Backup scheduler running**: `docker compose ps backup` shows running
- [ ] **First backup completed**: `ls ./backups/` contains at least 1 dump file
- [ ] **Restore drill passed**: `npm run db:restore:drill` exits 0
- [ ] **Upload test**: Upload a file through product UI → verify no scanner errors

## Section 2: Security

- [ ] **AUTH_SECRET changed** from default
- [ ] **DOWNLOAD_TOKEN_SECRET changed** from default
- [ ] **MFA enforced** for pilot users
- [ ] **ABAC enforcement enabled**: `FF_ABAC_ENFORCE=true` + pilot orgs in `ABAC_ENFORCE_ORG_IDS`
- [ ] **ABAC shadow reviewed**: `/api/platform/abac/shadow-report` has no unexpected denials
- [ ] **Audit hash chain verified**: `/settings/chain-verification` shows green

## Section 3: AI Runtime

- [ ] **AI provider keys configured**: `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` set
- [ ] **AI mode selected**: `AI_MODE=cloud` or `AI_MODE=local`
- [ ] **FF_AI_REAL_PROVIDERS** set to `true` if using real AI
- [ ] **Test AI generation**: Verify in Office AI Assistant or DecisionOS
- [ ] **RAG disabled**: `FF_AI_RAG=false` (unless vector DB configured)

## Section 4: Monitoring

- [ ] **Enterprise Health verified**: `/operator` shows no alerts
- [ ] **Outbox healthy**: No failed events in outbox
- [ ] **SIEM configured** (if required): `/settings/siem` has destination
- [ ] **Logs accessible**: `docker compose logs app --tail=20` works

## Section 5: Pilot Product

Select pilot product and verify:

- [ ] **AuditOS**: Engagement created, trial balance uploaded, evidence verified
- [ ] **DecisionOS**: Decision created, intake accepted, scenario evaluated
- [ ] **LocalContentOS**: Project created, baseline imported, score computed

## Section 6: User Onboarding

- [ ] **Organization created**: `/organizations` has pilot org
- [ ] **Users provisioned**: SCIM or admin UI
- [ ] **Roles assigned**: VIEWER, OPERATOR, ADMIN as needed
- [ ] **First login test**: User can login, see correct products
- [ ] **MFA enrolled**: First login prompts MFA setup

## Section 7: Support

- [ ] **Operator access**: Support team has ADMIN access to `/operator`
- [ ] **Runbook accessible**: `docs/runbooks/production-support-runbook.md`
- [ ] **Incident contact defined**: Who to call for P0/P1
- [ ] **Backup verified**: `npm run db:restore:drill` passes
