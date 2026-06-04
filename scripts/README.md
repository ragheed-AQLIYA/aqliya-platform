# AQLIYA Scripts

> Auto-generated inventory. Last updated: 2026-06-02

## Quick Start

```bash
# Validate environment setup
node scripts/validate-env.mjs

# Run backup
node scripts/backup.mjs

# Verify database health
npx tsx scripts/audit-health-check.ts
```

## Categories

### 🔧 Development & Setup
| Script | Purpose | Usage |
|--------|---------|-------|
| `validate-env.mjs` | Validate environment variables | `node scripts/validate-env.mjs` |
| `bundle-analyzer.js` | Analyze bundle size | `node scripts/bundle-analyzer.js` |
| `performance-budget.mjs` | Check performance budgets | `node scripts/performance-budget.mjs` |
| `rtl-audit.ts` | Audit RTL layout compliance | `npx tsx scripts/rtl-audit.ts` |

### 🗄️ Database
| Script | Purpose | Usage |
|--------|---------|-------|
| `db-backup.ts` | Database backup (pg_dump) | `npx tsx scripts/db-backup.ts` |
| `db-restore.ts` | Database restore (pg_restore) | `npx tsx scripts/db-restore.ts` |
| `backup.mjs` | File/directory backup | `node scripts/backup.mjs` |
| `backup-verify.ts` | Verify backup integrity | `npx tsx scripts/backup-verify.ts` |

### ✅ Verification & Validation
| Script | Purpose | Usage |
|--------|---------|-------|
| `audit-action-guards.mjs` | Inventory server-action guard patterns | `npm run audit:action-guards` |
| `demo-smoke-check.mjs` | Static demo route / governance smoke | `npm run demo:smoke` |
| `verify-mfa-db.ts` | Post-migrate MFA column smoke query | `npm run db:verify-mfa` |
| `_audit-db-state.ts` | Migration + User column audit (dev) | `npx tsx scripts/_audit-db-state.ts` |
| `audit-health-check.ts` | Check audit system health | `npx tsx scripts/audit-health-check.ts` |
| `inspect-findings.ts` | Inspect high-severity findings | `npx tsx scripts/inspect-findings.ts` |
| `turkish-qa.mjs` | Turkish vs Arabic i18n comparison | `node scripts/turkish-qa.mjs` |
| `validate-sunbul-admin-auth.ts` | Validate Sunbul admin auth | `npx tsx scripts/validate-sunbul-admin-auth.ts` |
| `validate-sunbul-e2e.ts` | Sunbul E2E data layer validation | `npx tsx scripts/validate-sunbul-e2e.ts` |
| `verify-auditos-dual-write.ts` | Verify AuditOS dual-write to PlatformAuditLog | `npx tsx scripts/verify-auditos-dual-write.ts` |
| `verify-client-workspace-links.ts` | Verify ClientWorkspace/Project links | `npx tsx scripts/verify-client-workspace-links.ts` |
| `verify-decisionos-dual-write.ts` | Verify DecisionOS dual-write to PlatformAuditLog | `npx tsx scripts/verify-decisionos-dual-write.ts` |
| `verify-office-ai-extraction.ts` | Verify Office AI file extraction | `npx tsx scripts/verify-office-ai-extraction.ts` |
| `verify-office-ai-file-validation.ts` | Verify Office AI file validation rules | `npx tsx scripts/verify-office-ai-file-validation.ts` |
| `verify-office-ai-task-service.ts` | Verify Office AI task service path | `npx tsx scripts/verify-office-ai-task-service.ts` |
| `verify-office-ai-v01.ts` | Verify Office AI v0.1 completeness | `npx tsx scripts/verify-office-ai-v01.ts` |
| `verify-platform-audit-log-write.ts` | Verify PlatformAuditLog write path | `npx tsx scripts/verify-platform-audit-log-write.ts` |
| `verify-platform-audit-logs.ts` | Report PlatformAuditLog coverage | `npx tsx scripts/verify-platform-audit-logs.ts` |
| `verify-platform-organization-links.ts` | Verify org link status | `npx tsx scripts/verify-platform-organization-links.ts` |

### 🌱 Seed Data
| Script | Purpose | Usage |
|--------|---------|-------|
| `seed-office-ai.ts` | Seed Office AI Assistant demo tasks | `npx tsx scripts/seed-office-ai.ts` |
| `seed-sunbul-organization.ts` | Seed Sunbul as client organization | `npx tsx scripts/seed-sunbul-organization.ts` |
| `seed-sunbul-pilot.ts` | Seed Sunbul pilot test data | `npx tsx scripts/seed-sunbul-pilot.ts` |

### 🧪 Pilot & Testing
| Script | Purpose | Usage |
|--------|---------|-------|
| `pilot-daily-monitor.ts` | Daily pilot status report | `npx tsx scripts/pilot-daily-monitor.ts` |
| `pilot-session-2-exercise.ts` | Pilot session 2 exercise data | `npx tsx scripts/pilot-session-2-exercise.ts` |
| `pilot-session-check.ts` | Quick pilot session validation | `npx tsx scripts/pilot-session-check.ts` |
| `pilot-workflow-execution.ts` | Active pilot workflow execution | `npx tsx scripts/pilot-workflow-execution.ts` |
| `run-localcontent-pilot.ps1` | LocalContentOS pilot dev server | `powershell ... run-localcontent-pilot.ps1` |
| `sunbul-internal-pilot.ts` | Full Sunbul workflow simulation | `npx tsx scripts/sunbul-internal-pilot.ts` |

### 🏗️ Migration & Remediation
| Script | Purpose | Usage |
|--------|---------|-------|
| `phase20-remediation.ts` | Phase 20 findings remediation & approval readiness | `npx tsx scripts/phase20-remediation.ts` |
| `phase20-verify.ts` | Phase 20 post-remediation verification | `npx tsx scripts/phase20-verify.ts` |
| `phase20-21-combined.ts` | Combined Phase 20 + Phase 21 remediation | `npx tsx scripts/phase20-21-combined.ts` |
| `phase21-clearance.ts` | Phase 21 approval gate clearance | `npx tsx scripts/phase21-clearance.ts` |
| `phase21-inspect.ts` | Phase 21 open review inspection | `npx tsx scripts/phase21-inspect.ts` |
| `phase22-scoring.ts` | Phase 22 production criteria scoring | `npx tsx scripts/phase22-scoring.ts` |
| `phase23-rescore.ts` | Phase 23 exit criteria rescore | `npx tsx scripts/phase23-rescore.ts` |
| `phase24-rescore.ts` | Phase 24 final exit criteria rescore | `npx tsx scripts/phase24-rescore.ts` |
| `backfill-client-workspaces.ts` | Backfill ClientWorkspace/Project records | `npx tsx scripts/backfill-client-workspaces.ts` |
| `backfill-platform-organizations.ts` | Backfill PlatformOrganization bridge records | `npx tsx scripts/backfill-platform-organizations.ts` |
| `execute-category-b-archive.ps1` | Category B archive moves | `powershell ... execute-category-b-archive.ps1` |

### 🗑️ One-Time / Archived
Scripts prefixed with `_` are one-time use, experimental, or stage-specific. They are documented for reference but not intended for routine execution.

| Script | Purpose |
|--------|---------|
| `_agent10_write_docs.py` | Agent 10 documentation generation |
| `_fix-utf16-temp.cjs` | UTF-16 temp file fix |
| `_l6-smoke-worker2.ts` | L6 smoke test worker |
| `_lcos-smoke-login-once.mjs` | LocalContentOS smoke login test |
| `_phase8-extract-writes.cjs` | Phase 8 write extraction |
| `_phase8-find-actions.cjs` | Phase 8 action finder |
| `_phase8-restore-actions.cjs` | Phase 8 action restore |
| `_phase8-restore-actions2.cjs` | Phase 8 action restore (secondary) |
| `_phase8-restore-review.cjs` | Phase 8 review restore |
| `_salesos-v02-smoke-once.ts` | SalesOS v0.2 smoke test |
| `_stage-smoke-verify.ts` | Stage smoke verification |
| `_stage-source-counts.ts` | Stage source counts |
| `_stage-verify-counts.ts` | Stage verify counts |
| `_stage-verify-db.ts` | Stage DB verification |
| `_w3-smoke-check.mjs` | Week 3 smoke check |
| `_w3-write-docs.mjs` | Week 3 documentation write |
| `_write-institutional-memory-shared.js` | Institutional memory shared write |
| `_write-phase3-report.js` | Phase 3 report generation |
| `_write-pr21a-commercial-claims-test.py` | PR21a commercial claims test |
| `_write-pr21a-commercial-claims.py` | PR21a commercial claims write |
| `_write-pr21a-report.py` | PR21a report generation |
| `_write-tier-b-persistence.mjs` | Tier B persistence write |
| `_write_intelligence_hub.py` | Intelligence Hub write |
| `_write_l5_docs.py` | L5 documentation generation |

### 📁 Product Factory
> `scripts/product-factory/` — Currently empty. Reserved for system templates. See `scripts/product-factory/README.md`.

## Statistics

| Category | Count |
|----------|-------|
| Development & Setup | 4 |
| Database | 4 |
| Verification & Validation | 15 |
| Seed Data | 3 |
| Pilot & Testing | 6 |
| Migration & Remediation | 11 |
| One-Time / Archived | 24 |
| **Total** | **67** |

## Notes

- One-time scripts (underscore-prefixed) remain in `scripts/` for reference but should not be re-run without understanding their purpose.
- `scripts/product-factory/` is reserved for future system template generation.
- No production source files were modified during categorization.
