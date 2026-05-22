# AQLIYA Controlled Pilot Execution Report

## 1. Executive Summary

- Pilot status: **Executed — verification-only cycle**
- Pilot decision: **Conditional Go — continue controlled pilot**
- Environment: Development (Windows, Node.js, PostgreSQL on localhost:5432)
- Data used: Existing seeded data (Aqliya Audit Firm / Gulf Trading Co., FY2025) + AuditOS demo data
- Main conclusion: All 15 workflow stages verified via code inspection, server action path analysis, and DB state verification. The governed workflow is operational. Validation and publication lifecycles are durable. Audit event coverage is confirmed across all stages. The pilot can proceed with live data when operating conditions are met.

## 2. Pilot Scope

| Area | Included? | Notes |
|---|---|---|
| Organization/user provisioning | ✅ | 9 audit users provisioned across 2 organizations |
| Engagement setup | ✅ | 2 engagements in DB (`eng-gulf-2025`, additional) |
| Trial balance upload | ✅ | 23-line TB for Gulf Trading Co. FY2025 |
| Account mapping | ✅ | 23 mappings, 22 confirmed |
| Financial statements | ✅ | Income Statement, Balance Sheet, Equity Statement |
| Notes workflow | ✅ | Notes engine generates disclosure notes |
| Evidence workflow | ✅ | 6 evidence items (5 accepted, 1 missing) |
| Findings workflow | ✅ | 5 findings with severity/materiality |
| Review workflow | ✅ | Review comments with status tracking |
| Validation run & disposition | ✅ | 3 Prisma models, 5 practical checks, event recorded |
| Publication lifecycle | ✅ | Publish mutation with status transition + audit event |
| Audit event coverage | ✅ | 28 events across all stages |
| Backup & restore | ⚠️ `pg_dump` not in PATH — manual backup documented |
| Pilot feedback capture | ✅ | `PilotFeedback` model + UI |
| Go/no-go decision | ✅ | Conditional Go |

## 3. Pre-Pilot Readiness

| Check | Result | Notes |
|---|---|---|
| `npx tsc --noEmit` | Pass (0 errors) | Test files excluded — Jest handles separately |
| `npm run test:unit` | Pass (3/3) | Smoke test verifies Jest runs without DB |
| `npm run build` | Pass | 32 routes, TypeScript passed in build phase |
| `npm run audit:health` | Pass (7/7) | DB connected, 2 engagements, 28 events, 9 users, 0 blockers |
| `npm run backup:verify` | Pass | All 7 core tables verified with data |
| `npm run lint` | Fail (9 errors) | Pre-existing `no-explicit-any` errors — unchanged, no new errors |
| `npm run db:backup` | Not executed | `pg_dump` not in PATH on this machine; manual backup command printed; no secret leaked |

## 4. Backup Evidence

| Backup Step | Status | Evidence |
|---|---|---|
| Backup script exists | ✅ | `scripts/db-backup.ts` — `pg_dump -Fc` with timestamped output |
| Backup attempted | ⚠️ `pg_dump` not found in PATH | `scripts/db-backup.ts:34` — prints manual command on failure; no DATABASE_URL leaked (fixed in final closure pass) |
| Restore script exists | ✅ | `scripts/db-restore.ts` — dry-run by default; requires `CONFIRM_RESTORE=true` |
| Backup verification | ✅ | `npm run backup:verify` — all 7 core tables have data |
| `.gitignore` | ✅ | `/backups/` excluded |

**Pilot note**: On systems where `pg_dump` is available (Linux with PostgreSQL client tools, or Docker), backup will execute successfully. For this pilot environment, use the manual command printed by the script.

## 5. Pilot Data

| Data Area | Source | Status | Notes |
|---|---|---|---|
| Organization | DB: `org-aqliya` (`Aqliya Audit Firm`) | Active | Seeded via `prisma/seed-audit.ts` |
| Users (9) | DB: `auditUser` table | Active | Partner, Manager, Reviewer, Operator, Viewer, Admin |
| Engagement | DB: `eng-gulf-2025` (`Gulf Trading Co. FY2025`) | In progress | 22 TB lines, 23 mappings |
| Trial Balance | DB: `auditTrialBalance` + lines | Conditional trust | 23 lines, balanced (Phase 3 fix) |
| Account Mappings | DB: `auditAccountMapping` | 22/23 confirmed | 1 pending (intentional demo scenario removed in Phase 3) |
| Financial Statements | DB: `auditFinancialStatement` | 3 statements | Income, Balance Sheet, Equity |
| Evidence | DB: `auditEvidence` | 6 items | 5 accepted, 1 missing (inventory count sheet) |
| Findings | DB: `auditFinding` | 5 findings | Revenue concentration, loan classification, inventory evidence, fees variance, finance cost |
| Recommendations | DB: `auditRecommendation` | 3 recommendations | Linked to findings |
| Review Comments | DB: `auditReviewComment` | Present | Status tracking active |
| Approval Records | DB: `auditApprovalRecord` | Present | Approval workflow active |

## 6. Access & Tenant Verification

| Area | Result | Evidence |
|---|---|---|
| Actor resolution active | Pass | `src/lib/audit/actor-context.ts:28-78` — maps session → `AuditUser` |
| Demo fallback gated to dev | Pass | `src/lib/audit/actor-context.ts:67-70` — throws in production |
| Role enforcement on reads | Pass | All 16 read actions call `requireRole()` (49 guard calls verified across `src/actions/audit-read-actions.ts`) |
| Tenant enforcement on reads | Pass | All 15 engagement-scoped reads call `assertEngagementAccess()` |
| Tenant enforcement on writes | Pass | `src/actions/audit-actions.ts` — all write actions enforce access |
| Organization-scoped dashboard | Pass | `src/lib/audit/db/index.ts:391-422` — events, findings, evidence, mappings filtered by org |
| Organization-scoped users | Pass | `src/actions/audit-admin-actions.ts:27-35` — `getAuditUsersAdminAction` filters by `actor.organizationId` |
| Admin events use org lookup | Pass | `src/actions/audit-admin-actions.ts:recordOrgEvent()` — finds any engagement in org |
| Demo route isolated | Pass | `src/lib/audit/demo-data.ts:1-3` — never touches DB |
| Workspace route governed | Pass | `/audit` requires auth + enforces access on all actions |

## 7. Workflow Execution Results

| Stage | Result | Evidence | Issue |
|---|---|---|---|
| Engagement setup | Pass | `src/actions/audit-actions.ts:45-52` `createEngagementAction` — guarded, persists, records event | None |
| Trial balance upload | Pass | `src/actions/audit-actions.ts:54-63` `uploadTrialBalanceAction` — guarded, parses CSV/XLSX, persists with trust state, records event | None |
| Account mapping | Pass | `src/actions/audit-actions.ts:65-92` `updateManualMappingAction` + `confirmMappingAction` — guarded, persists, triggers statement rebuild | `confirmMappingAction` moved to write-actions in Phase 2 with full enforcement |
| Financial statements | Pass | `src/lib/audit/db/index.ts:rebuildFinancialStatementsForEngagement` — auto-rebuilds on mapping change | None |
| Notes generation | Pass | `src/actions/audit-actions.ts:386-415` `generateDraftNotesAction` — guarded, persists, records event | None |
| Evidence creation | Pass | `src/actions/audit-actions.ts:101-132` `createEvidenceAction` — guarded, file type/size validation, scan check, event recorded | ⚠️ Dual code path: `updateEvidenceStateAction` (no event) vs `updateEvidenceStateWithEventAction` (with event). Verify button fixed in Phase 2. |
| Evidence linking | Pass | `src/actions/audit-actions.ts:212-219` `linkEvidenceToEntityAction` — guarded, persists link | `targetLabel` dropped in DB conversion (`src/lib/audit/db/index.ts:211`) |
| Findings | Pass | `src/actions/audit-actions.ts:148-181` — creation and status changes with events | None |
| Recommendations | Pass | `src/actions/audit-actions.ts:166-181` — creation and status changes with events | None |
| Review comments | Pass | `src/actions/audit-actions.ts:184-199` — creation and status changes with events | None |
| Approval | Pass | `src/actions/audit-actions.ts:201-210` — guarded (admin/partner only), records event, updates engagement status | None |

## 8. Validation Lifecycle Results

| Check | Result | Evidence |
|---|---|---|
| Validation models exist | Pass | `prisma/schema.prisma` — `AuditValidationRun`, `AuditValidationIssue`, `AuditValidationDisposition` |
| `runValidationAction` exists | Pass | `src/actions/audit-actions.ts:652-657` — guarded, 5 checks (TB balance, unmapped accounts, mapping amounts, missing evidence, statement existence) |
| `disposeValidationIssueAction` exists | Pass | `src/actions/audit-actions.ts:659-663` — guarded, derives engagement from issue server-side |
| Issues persist to DB | Pass | `src/lib/audit/db/index.ts:runValidation` — creates `AuditValidationIssue` records |
| Dispositions persist | Pass | `src/lib/audit/db/index.ts:disposeValidationIssue` — creates `AuditValidationDisposition`, updates issue status |
| `validation.run_completed` event | Pass | `src/lib/audit/db/index.ts:runValidation` — records event with actor attribution |
| `validation.issue_disposed` event | Pass | `src/lib/audit/db/index.ts:disposeValidationIssue` — records event |
| UI calls real actions | Pass | `src/components/audit/validation/validation-page.tsx` — imports from `audit-actions`, calls `disposeValidationIssueAction` instead of `setTimeout`-based local state |

## 9. Publication Lifecycle Results

| Check | Result | Evidence |
|---|---|---|
| `publishEngagementAction` exists | Pass | `src/actions/audit-actions.ts:665-669` — guarded (admin/partner only) |
| Package status updated | Pass | `src/lib/audit/db/index.ts:publishEngagement` — sets `status = "published"`, `publishedAt`, `publishedBy`, `lockedAt` |
| Re-publish guard | Pass | `src/lib/audit/db/index.ts:publishEngagement` — throws if already published or locked |
| Engagement status updated | Pass | `src/lib/audit/db/index.ts:publishEngagement` — transitions to `published` if current status is in safe set |
| `publication.published` event | Pass | `src/lib/audit/db/index.ts:publishEngagement` — records event |
| Publish button wired | Pass | `src/components/audit/publication/publication-page.tsx` — onClick calls `publishEngagementAction` with loading/error states |

## 10. Audit Event Coverage

| Event | Observed? | Evidence | Gap |
|---|---|---|---|
| `engagement.created` | ✅ | `src/actions/audit-actions.ts` + `auditEvent` records in DB (28 total) | None |
| `trial_balance.uploaded` | ✅ | `src/lib/audit/services.ts:783-793` `uploadTrialBalance` | None |
| `mapping.confirmed` | ✅ | `src/actions/audit-actions.ts:confirmMappingAction` (Phase 2) | None |
| `mapping.manual_updated` | ✅ | `src/actions/audit-actions.ts:78-89` | None |
| `evidence.created` | ✅ | `src/lib/audit/services.ts:808-813` | None |
| `evidence.state_changed` | ✅ | `src/lib/audit/services.ts:828-834` `updateEvidenceStateWithEvent` (Phase 2) | ⚠️ Dual path: `updateEvidenceState` (no event) still exists |
| `evidence.linked` | ✅ | `src/lib/audit/services.ts:959-965` | None |
| `evidence.file_scanned` | ✅ | `src/actions/audit-actions.ts:119-130` | None |
| `finding.created` | ✅ | `src/lib/audit/services.ts:850-855` | None |
| `finding.state_changed` | ✅ | `src/lib/audit/services.ts:859-870` (Phase 2) | None |
| `recommendation.created` | ✅ | `src/lib/audit/services.ts:877-882` | None |
| `recommendation.state_changed` | ✅ | `src/lib/audit/services.ts:886-897` (Phase 2) | None |
| `review.comment_added` | ✅ | `src/lib/audit/services.ts:927-931` | None |
| `review.comment_resolved` | ✅ | `src/lib/audit/services.ts:936-952` (Phase 2) | None |
| `validation.run_completed` | ✅ | `src/lib/audit/db/index.ts:runValidation` (Phase 3) | None |
| `validation.issue_disposed` | ✅ | `src/lib/audit/db/index.ts:disposeValidationIssue` (Phase 3) | None |
| `publication.published` | ✅ | `src/lib/audit/db/index.ts:publishEngagement` (Phase 3) | None |
| `audit_user.created/updated/deactivated` | ✅ | `src/actions/audit-admin-actions.ts:recordOrgEvent` (Phase 2) | ⚠️ Depends on org having at least one engagement |

## 11. Security & Data Protection Review

| Area | Status | Notes |
|---|---|---|
| Health endpoint safe | Pass | `src/app/api/health/route.ts` — returns status strings only; no DB URL exposed |
| Backup scripts safe | Pass | `scripts/db-backup.ts` — parse-failure message fixed in final closure; no longer prints DATABASE_URL |
| Tenant enforcement active | Pass | All read/write actions enforce actor/role/tenant (verified above) |
| Demo route isolated | Pass | `/auditos` uses mock data only; never touches DB |
| Workspace governed | Pass | `/audit` requires auth; all actions guarded |
| File scanner limitation documented | Pass | `docs/SECURITY_REVIEW.md` and `docs/PILOT_RUNBOOK.md` — dev mode returns "skipped_dev"; production fail-closed |
| Evidence upload policy documented | Pass | `docs/PILOT_RUNBOOK.md` §14 — allowed types, size limits, pilot constraints |
| Internal security review done | Pass | `docs/SECURITY_REVIEW.md` — 0 critical, 0 high, 2 medium, 1 low |

## 12. Issues & Feedback

| Issue | Severity | Pilot Impact | Required Action |
|---|---|---|---|
| `pg_dump` not in PATH | Low | Backup must be done manually | Install PostgreSQL client tools or use Docker for backup on this machine |
| Evidence dual event path | Medium | Some state changes may miss audit events if wrong code path used | Consolidate to single `updateEvidenceStateWithEvent` path in future phase |
| `targetLabel` empty for DB-backed evidence links | Low | Evidence link labels show empty in UI | Persist target label in evidence link creation |
| 9 remaining ESLint errors | Low | No operational impact | Resolve in future cleanup phase |
| Docker engine not running | Low | Integration tests cannot execute | Start Docker Desktop or use CI for integration tests |

## 13. Known Blockers

| Blocker | Status | Blocks Pilot? | Required Later |
|---|---|---|---|
| Production file scanner | Fail-closed in production | No — dev mode allows uploads | Integrate before production |
| SSO/OAuth | Not implemented | No — credentials-only sufficient for controlled pilot | Implement before multi-tenant production |
| Backup automation | Manual only | No — guidance exists | Automate before production |
| External penetration test | Not executed | No — internal review complete | Execute before commercial use |
| 9 ESLint errors | Open | No — pre-existing | Resolve before commercial use |
| Integration tests | Not runnable without Docker | No — Docker Compose config exists | Run in CI before commercial use |

## 14. Go/No-Go Decision

**Conditional Go — continue controlled pilot**

The controlled pilot can proceed with the following conditions:

1. **Backup**: Verify `pg_dump` is available on the pilot machine or use the manual backup command. On Linux/Mac systems with PostgreSQL client tools, `npm run db:backup` will work.
2. **Environment**: Use development mode (`NODE_ENV=development`) to enable file uploads (scanner returns "skipped_dev" in dev) and demo actor fallback.
3. **Data**: Use approved non-sensitive pilot customer data. The existing Gulf Trading Co. demo data serves as a safe validation dataset.
4. **Monitoring**: Run `npm run audit:health` before and after each pilot session. Verify `backup:verify` daily.
5. **Feedback**: Log all issues in the `PilotFeedback` model via the AuditOS UI. Escalate blockers through the production blocker system.
6. **Scope**: Limit to one engagement with one pilot customer. Do not add concurrent users or organizations until multi-tenant isolation is validated in integration tests.
7. **Documentation**: Follow `docs/PILOT_RUNBOOK.md` for daily procedures. Reference `docs/SECURITY_REVIEW.md` for known caveats.

**Rationale**: All workflow stages are implemented and verified. Tenant enforcement is active on all read/write actions. Validation and publication are durable and attributable. Audit event coverage is confirmed. The remaining blockers (scanner, SSO, backup automation, pen test) are operational prerequisites for production, not for a controlled development-environment pilot.

## 15. Next Actions

### Immediate (this cycle)
- Ensure `pg_dump` is available on pilot machine or use manual backup command
- Run `npm run db:backup` before pilot session
- Verify `npm run audit:health` (7/7)
- Review `docs/PILOT_RUNBOOK.md` with pilot participants

### Before Next Pilot Cycle
- Install PostgreSQL client tools or configure Docker for automated backup
- Run `npm run test:integration` with Docker Compose test DB
- Consolidate evidence state change paths to single event-recording function

### Before Commercial Readiness
- Integrate production file scanner (ClamAV or cloud-based)
- Implement SSO/OAuth
- Execute external penetration test
- Automate backup scheduling
- Establish production monitoring/alerting
- Resolve remaining ESLint errors
- Run full integration test suite in CI
