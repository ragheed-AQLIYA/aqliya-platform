# AQLIYA Pilot Readiness Summary

**Status:** Active | **Version:** 1.0 | **Date:** 2026-06-30

## Overview

AQLIYA pilot readiness spans 3 dimensions:
1. **Product Readiness** — Is each product pilot-ready?
2. **Operational Readiness** — Do we have the infrastructure to run a pilot?
3. **Commercial Readiness** — Do we have the materials to engage clients?

## Product Pilot Readiness

| Product | Level | Demo | Real Data | Pilot Docs | Notes |
|---------|-------|------|-----------|------------|-------|
| AuditOS | L5 | ✅ `/auditos` | ✅ TB workflow | ✅ 62 files in `docs/pilot/` | Primary pilot product |
| LocalContentOS | L5 | ❌ | ✅ Workbook scoring | ✅ Limited | Needs demo route |
| DecisionOS | L5 | ❌ | ✅ Decision lifecycle | ⚠️ Limited | Needs demo |
| WorkflowOS | L5 | ❌ | ✅ Template workflows | ⚠️ Limited | Needs demo |
| SalesOS | L5 | ❌ | ⚠️ Internal only | ❌ | Internal preview only |
| Others | L4-L5 | ❌ | ❌ | ❌ | Not pilot-ready |

## Operational Readiness

| Component | Status | Details |
|-----------|--------|---------|
| Docker stack | ✅ | 5 services ready |
| CI/CD pipeline | ✅ | 6 workflows operational |
| Staging environment | ❌ | DNS ENOTFOUND (blocked) |
| Production monitoring | ✅ | Sentry + health endpoints |
| Backup system | ✅ | Automated daily |
| Restore drill | ⚠️ | Manual only, no live RDS access |

## Pilot Materials Inventory

- **Pilot docs:** `docs/pilot/` (62 files — checklists, scripts, logs, datasets)
- **SOW template:** `docs/commercial/PILOT_SOW_TEMPLATE.md`
- **Demo storyline:** `docs/assets/demo-storyline/` (7 files)
- **Execution pack:** `docs/pilot/execution-pack/` (11 files)
- **Commercial claims:** `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md`

## Pilot Process

1. **Diagnostic call** → understand client needs
2. **Demo** → guided walkthrough (AuditOS primary)
3. **Pilot** → real data, controlled execution
4. **Review** → Go/No-Go decision
5. **Deploy** → scale to production

## Key Blockers

1. **Staging DNS failure** — blocks full integration testing
2. **No AWS live access** — blocks restore drill on real RDS
3. **No pen test** — required for enterprise customers

## Quick Start for New Pilot

```bash
# 1. Read the pilot materials
cd docs/pilot
# Start with: PILOT-SCOPE.md → GO-NOGO-CHECKLIST.md → execution-pack/

# 2. Set up demo environment
docker compose up -d
npx prisma db seed
npm run build && npm run start

# 3. Guide the client through /auditos
# 4. Document everything in pilot/execution-pack/
```
