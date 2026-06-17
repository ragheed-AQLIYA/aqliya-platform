# Cycle 6 Close Readiness

**Status:** PREPARED (waiting on remote staging access)
**Date:** 2026-06-08
**Authority:** program-execution-state.md → phase-4-entry-checklist.md

## Current Blockers

| Blocker | Impact | Resolution |
|---------|--------|------------|
| staging.aqliya.ai DNS does not resolve from build environment | Cannot run remote smoke tests | Operator with network access to staging must run checklist |
| No staging DATABASE_URL available | Cannot deploy migrations | DevOps to provision or provide credentials |
| No AI provider API keys in build env | Cannot run live IC smoke | Operator to set env vars |

## What CAN be verified locally

| Check | Command | Status |
|-------|---------|--------|
| Prisma schema valid | 
px prisma validate | ✅ Done |
| TypeScript compile | 
px tsc --noEmit | ✅ 0 errors |
| Build | 
pm run build | ⏳ Pending |
| Tests | 
pm test | ⏳ Pending |
| Local staging proxy | docker compose -f docker-compose.staging.yml up -d | ⏳ Pending operator |

## Prerequisites Checklist

- [ ] Remote staging URL resolvable (staging.aqliya.ai)
- [ ] Staging DATABASE_URL available
- [ ] AUTH_SECRET for staging
- [ ] AI_PROVIDER + API keys for staging
- [ ] FF_AI_RAG=true, FF_AI_REAL_PROVIDERS=true on staging
- [ ] SCIM_API_KEY configured
- [ ] SSO_DEFAULT_ORG_ID set

## Step-by-Step Operator Runbook

### Phase 1: Database
`ash
# 1. Set env
export DATABASE_URL="postgresql://..."
export STAGING_BASE_URL="https://staging.aqliya.ai"

# 2. Deploy migrations
npx prisma migrate deploy

# 3. Verify pgvector
npm run db:pgvector-health
npm run db:verify-pgvector
`

### Phase 2: Smoke Tests
`ash
# 4. Live IC smoke
npm run ic:smoke:cycle5:live

# 5. Governed Audit AI smoke
npm run cycle6:smoke:audit-ai

# 6. Remote smoke (comprehensive)
npm run cycle6:remote-smoke
`

### Phase 3: Evidence Collection
`ash
# 7. Generate stamp
node scripts/ic/cycle6-smoke-report-stamp.mjs

# 8. Fill live smoke report
# Edit docs/validation/cycle-6/LIVE_SMOKE_REPORT.md
`

### Phase 4: Close
- [ ] Update program-execution-state.md Cycle 6 → CLOSED
- [ ] Director G6-7 verification pass
- [ ] Phase 4 entry checklist unlocked

## Evidence Artifacts

| Artifact | Path |
|----------|------|
| IC smoke log | docs/validation/cycle-6/evidence/ic-smoke-cycle5-live.json |
| Audit AI smoke | docs/validation/cycle-6/evidence/cycle6-governed-audit-smoke.json |
| Live smoke report | docs/validation/cycle-6/LIVE_SMOKE_REPORT.md |
| AI activation log | docs/operations/ai-intelligence-activation.md |

## New Features Ready for Staging

These features are built and committed but NOT yet deployed to any environment:

| Feature | Routes | Backend |
|---------|--------|---------|
| SSO (L0-05) | /settings/sso, /login (SSO buttons) | OAuth/OIDC/SAML providers, PrismaAdapter |
| SCIM (L0-06) | /api/scim/v2/Users, /api/scim/v2/Groups | SCIM v2 service, API key auth |
| CRM Sync (S7-03) | /sales/settings/crm | HubSpot/Salesforce connectors, sync orchestrator |
| ERP Integration (LC-08) | /local-content/settings/integrations | SAP/Oracle/CSV importers, review pipeline |
