# AQLIYA Changelog — 2026-07-23

## 🚀 SalesOS Intelligence Stack (30 new files)

### New Capabilities
- **5 Sales Intelligence Connectors:** Apollo.io, Ocean.io, Clay, SmartLead, LinkedIn
- **BaseApiKeyConnector:** Shared HTTP foundation with retry (3x), exponential backoff, rate-limit awareness, health checks
- **Webhook Receiver Framework:** HMAC-SHA256 signature verification, event routing, audit logging
- **OAuth2 3-Legged Client:** PKCE support, token exchange, refresh, LinkedIn/Google/Microsoft configs
- **13 Server Actions:** enrichCompany, searchCompanies, findContacts, verifyEmail, waterfallEnrich, createOutreachCampaign, getOutreachEvents, getOutreachAnalytics, batchEnrichAccounts, enrichAccountContacts, scoreDealLeads, autoEnrichAccount, checkIntelProviderHealth
- **2 API Routes:** `POST /api/sales/intel/webhook`, `GET /api/sales/intel/oauth/callback`
- **12 UI Components:** IntelConnectorsPanel, ApiKeyManager, LinkedInConnectButton, EnrichAccountButton, FindSimilarCompanies, OutreachDashboard, OutreachTimeline, CreateCampaignButton, BatchEnrichButton, DealHealthCard, ApolloContactsPanel, EmailTemplateManager
- **Auto-Enrichment:** Accounts enriched automatically on creation (Apollo → Ocean → Clay waterfall)
- **Auto Lead Scoring:** Deals scored automatically on creation (4-factor weighted model)
- **Auto Deal Updates:** Webhook events auto-update deal stages (EMAIL_REPLIED → negotiation, MEETING_BOOKED → qualified)
- **11 Integration Tests:** BaseApiKeyConnector, Factory, Webhook, OAuth2

### Updated Pages
- `/sales/settings/crm` — ApiKeyManager + LinkedInConnectButton + IntelConnectorsPanel
- `/sales/accounts/[id]` — EnrichAccountButton + ApolloContactsPanel
- `/sales/deals/[id]` — DealHealthCard + OutreachTimeline + CreateCampaignButton
- `/sales/outreach` — OutreachDashboard + EmailTemplateManager
- `/sales/outreach/analytics` — NEW: Outreach Analytics page
- `/sales/intelligence` — FindSimilarCompanies
- `/sales` — BatchEnrichButton

## 🔧 Platform Hardening (22 fixes)

### Infrastructure
- **Terraform:** Fixed 11 environment name mismatches (`"prod"` vs `"production"`) across compute, database, monitoring modules
- **ALB Health Check:** Changed from `/api/health` to `/api/platform/health` (now checks DB + Kernel)
- **Middleware:** Added CRM webhook route to matcher with rate limiting

### Security
- **CRM Webhook:** Added to middleware matcher with security headers + rate limiting
- **Institutional Memory:** Added server-side auth guard (was missing `getCurrentUser()` check)
- **SAML Import:** Fixed `@auth/core/jwt` → `next-auth/jwt`

### Code Quality
- **ESLint:** 0 errors (was 17 `as any` — reduced to 5 justified casts)
- **Marketing Routes:** Fixed 3 broken routes (how-we-work, engagement-models, buyers/procurement) with redirects
- **DecisionType:** Fixed missing export from simulation-types
- **Fake Test:** Removed `smoke.test.ts` (tested `1+1=2`)

### Kernel
- **Outbox Bridge:** Wired to EventBus in bootstrap
- **CQRS ProjectionManager:** Wired to EventBus in bootstrap
- **Notification Service:** Upgraded from stub (UUID-only) to real (Prisma PlatformAuditLog)
- **Files Service:** Upgraded from stub (NOT_IMPLEMENTED) to real (CoreEvidence CRUD)
- **Search Service:** Upgraded from stub to real cross-entity search
- **Knowledge Service:** Upgraded from stub to real recall + metadata persistence
- **Automation Service:** Upgraded from stub to real (audit trail + rule execution)
- **Scheduling Service:** Upgraded from stub to real (job lifecycle management)

### Dependencies
- **nodemailer:** Upgraded 7.0.13 → 9.x (fixes 6 SMTP vulnerabilities)
- **xlsx:** Documented as tech debt in package.json overrides (abandoned, unfixed CVEs)
- **engines:** Added Node >=20, <=24 to package.json

### Tests Fixed
- **SAML:** 30/30 (was broken — `@auth/core/jwt` mock fix)
- **decision-gov:** 36/36 (was 2 failures — added OR + in filter support to mock)
- **reporting-graph:** 2/2 (was 1 failure — fixed missing `nodeIds.add()` for mapping nodes)
- **local-contacts-l5:** 20/20 (was 4 failures — added `@/lib/kernel` enforce mock)
- **skill-runtime:** 27/27 (was 1 failure — fixed filesystem path in test)
- **tb-upload-mapping-fs:** 3/3 (was 1 failure — added `createMany` to Prisma mock)
- **cross-product-ai:** Fixed test isolation (idCounter reset + mockReset)

## 📊 Final Metrics

```
TypeScript:  0 errors
ESLint:      0 errors
Build:       PASS
Tests:       5,691 passing, 0 failing
Suites:      438/438 passing
New files:   35
Modified:    15
Total changes: 50 files
```
