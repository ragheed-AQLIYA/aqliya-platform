# REPOSITORY CENSUS — AQLIYA
**Date:** 2026-06-20  
**Scope:** Full repository scan (excluding `node_modules/`, `.git/`, `.next/`, `.claude/` worktrees)

---

## 1. Overview

| Metric | Value |
|--------|-------|
| Total files (incl. all) | 223,192 |
| Files excluding `node_modules/`, `.git/`, `.next/`, `.claude/` | 6,100 |
| Total lines of code (excl. binaries) | 847,207 |
| Repository size on disk (excl. node_modules) | ~72 MB |
| Directories (top-level) | 32 |
| Languages | TypeScript, SQL, Markdown, JSON, YAML, CSS, Shell, PowerShell |
| Number of products/systems | 9 (AuditOS, LocalContentOS, DecisionOS, SalesOS, WorkflowOS, Office AI, LocalContactOS, RiskOS, ContentStudio) |

## 2. Directory Census

| Directory | Files | Lines | Size (MB) | Purpose |
|-----------|-------|-------|-----------|---------|
| `src/` | 2,565 | 275,141 | 10.29 | Application source code |
| `docs/` | 2,284 | 402,970 | 27.50 | Documentation (all types) |
| `uploads/` | 432 | 3,563 | 0.10 | Uploaded files |
| `knowledge-foundation/` | 364 | 31,544 | 1.02 | Knowledge base |
| `scripts/` | 188 | 27,773 | 1.16 | Utility scripts |
| `prisma/` | 97 | 16,098 | 0.89 | Database schema + seeds |
| `archive/` | 42 | 43,905 | 12.61 | Zipped/archived content |
| `infra/` | 32 | 1,997 | 0.07 | Infrastructure configs |
| `public/` | 24 | 12,925 | 2.15 | Static assets |
| `.husky/` | 20 | 57 | 0.00 | Git hooks |
| `backups/` | 14 | 24,025 | 2.05 | Database backups |
| `knowledge/` | 11 | 1,840 | 0.07 | Knowledge references |
| `.github/` | 8 | 431 | 0.01 | GitHub Actions |
| `runbooks/` | 8 | 1,930 | 0.09 | Operations runbooks |
| `messages/` | 4 | 2,514 | 0.11 | i18n message files |
| `certificates/` | 3 | 56 | 0.00 | Security certificates |
| `verification/` | 2 | 421 | 0.02 | Verification reports |
| `i18n/` | 2 | 17 | 0.00 | i18n configuration |
| **Total (excl. filtered)** | **6,100** | **847,207** | **~57.5** | |

## 3. Source Code Breakdown (`src/`)

| Area | Files | % of src | Description |
|------|-------|----------|-------------|
| `src/lib/` | 973 | 37.9% | Business logic, services, engines |
| `src/app/` | 513 | 20.0% | Routes, pages, API handlers |
| `src/components/` | 329 | 12.8% | UI components |
| `src/actions/` | 83 | 3.2% | Server Actions |
| `src/__tests__/` | 44 | 1.7% | Tests |
| `src/core/` | 12 | 0.5% | Core abstractions |
| `src/__mocks__/` | 9 | 0.4% | Test mocks |
| Root files | 5 | 0.2% | middleware.ts, instrumentation.ts |

**Total source files:** 1,975  
**Average file size:** ~139 lines

## 4. Largest Source Files

| Size (KB) | File | Area |
|-----------|------|------|
| 256.5 | `prisma/schema.prisma` | Schema (5,158 lines) |
| 75.8 | `prisma/seed-audit.ts` | AuditOS seed |
| 64.4 | `prisma/seed.ts` | Main seed |
| 62.9 | `AGENTS.md` | Agent contract |
| 35.9 | `AQLIYA_NOTION_MODERNIZATION_PROGRAM.md` | Notion migration |
| 32.3 | `prisma/seed-local-content.ts` | LC seed |
| 30.9 | `AQLIYA_Strategic_Audit_2026.docx` | Strategic audit (binary) |
| 27.7 | `AQLIYA_Repositioning_Content_2026.docx` | Repositioning (binary) |
| 22.9 | `AQLIYA_Website_Content_Review_AR.md` | Website review (Arabic) |
| 15.2 | `prisma/seed-office-ai.ts` | Office AI seed |

## 5. File Type Distribution (excl. binaries)

| Extension | Count | Description |
|-----------|-------|-------------|
| `.md` | 3,200+ | Markdown documentation |
| `.ts` | 1,900+ | TypeScript |
| `.tsx` | 500+ | React TSX |
| `.json` | 450+ | Configuration files |
| `.yml`/`.yaml` | 80+ | YAML configs |
| `.css` | 20+ | Stylesheets |
| `.js` | 15+ | JavaScript |
| `.sql` | 12+ | SQL files |
| `.env*` | 5 | Environment config |
| `.mjs` | 5 | ES modules |

## 6. Documentation Breakdown (`docs/`)

| Category | Directory | Files | Purpose |
|----------|-----------|-------|---------|
| Theoretical Reference | `docs/theoretical-reference/` | 352 | 21-domain theory library |
| Archive | `docs/archive/` | 307 | Historical/legacy docs |
| Reports | `docs/reports/` | 286 | Audit/review reports |
| Products | `docs/products/` | 226 | Product-specific docs |
| Audits | `docs/audits/` | 131 | Audit evidence |
| Releases | `docs/releases/` | 94 | Release programs |
| Operations | `docs/operations/` | 89 | Operational docs |
| Pilot | `docs/pilot/` | 62 | Pilot execution |
| Review | `docs/review/` | 55 | Review artifacts |
| Systems | `docs/systems/` | 38 | System definitions |
| AuditOS | `docs/auditos/` | 36 | AuditOS workspace |
| Validation | `docs/validation/` | 36 | Validation evidence |
| Runtime Prototypes | `docs/runtime-prototypes/` | 31 | Prototype docs |
| Source of Truth | `docs/source-of-truth/` | 26 | Current state docs |
| Official | `docs/official/` | 14 | Doctrine documents |
| Architecture | `docs/architecture/` | 13 | Architecture docs |
| Others | (varied) | ~200 | Remaining |

**Total doc files:** ~1,962  
**Lines of documentation:** ~402,970 (47.5% of repo)  
**Ratio: code to docs:** ~1:0.9 (nearly 1:1)

## 7. Configuration Files Audit

| File | Lines | Purpose |
|------|-------|---------|
| `AGENTS.md` | 1,767 | Primary agent operating contract |
| `CLAUDE.md` | 241 | Secondary Claude agent instructions |
| `package.json` | 230+ | Dependencies |
| `next.config.mjs` | 75+ | Next.js configuration |
| `tsconfig.json` | 50+ | TypeScript configuration |
| `eslint.config.mjs` | 100+ | ESLint rules |
| `jest.config.js` | 40+ | Test configuration |
| `.env.example` | 100+ | Environment template |
| `Dockerfile` | 25+ | Container build |
| `docker-compose.yml` | 30+ | Local services |
| `.github/workflows/*` | 8 files | CI/CD pipelines |
| `.husky/*` | 20 hooks | Git hooks |
| `.cursor/*` | 10 files | Cursor IDE config |
| `.skills/*` | ~100 files | Agent skill system |

## 8. Orphan & Duplicate Files

### Exact Content Duplicates

| File | Occurrences | Locations |
|------|-------------|-----------|
| `cycle5-final-validation.md` | 2 | `docs/` root, `docs/reports/` |
| `dev-low-load.md` | 2 | `docs/` root, `docs/operations/` |
| `DOCUMENTATION_INVENTORY.md` | 2 | `docs/` root, `docs/archive/` |
| `open-design-aqliya-design-lab-policy.md` | 2 | `docs/` root, `docs/archive/` |
| `phase-3-go-nogo-report.md` | 2 | `docs/` root, `docs/reports/` |
| `release-blocking-assessment-cycle5.md` | 2 | `docs/` root, `docs/reports/` |
| `repository-audit-2026-06-04.md` | 2 | `docs/` root, `docs/archive/` |
| `SECURITY_AUDIT_2026-05-23.md` | 2 | `docs/` root, `docs/archive/` |
| `AQLIYA_Website_Content_Review_AR.md` | 2 | `archive/root-docs/`, `archive/root-planning-scratch/` |

### Similar-Named Files (same name, different content)

| Name | Occurrences | Locations |
|------|-------------|-----------|
| `README.md` | 71 | Throughout subdirectories |
| `EXECUTIVE_SUMMARY.md` | 4 | `audits/`, `audits/forensic/`, `review/`, `review/cycle-2/` |
| `pilot-success-criteria.md` | 4 | `archive/sunbul/`, `pilot/`, `products/*/` |
| `pilot-scope.md` | 3 | `archive/sunbul/`, `pilot/`, `products/localcontentos-v0.1/` |
| `pilot-command-center.md` | 3 | `archive/sunbul/`, `products/*/` |
| `demo-script.md` | 3 | `products/*/` |
| `DOCUMENTATION_CONFLICT_REPORT.md` | 2 | `docs/` root, `docs/archive/` (different content) |
| `CLAIMS_VERIFICATION_MATRIX.md` | 2 | `audits/`, `review/` |
| `RELEASE_DECISION.md` | 2 | `audits/`, `review/` |
| `TECHNICAL_RISK_REGISTER.md` | 2 | `audits/`, `review/` |

### Empty Directories

| Directory | Status |
|-----------|--------|
| `docs/brand/` | Empty |
| `docs/templates/` | Empty |
| `docs/tooling/` | Empty |
| `tests/` | Empty (tests in `src/__tests__/`) |

## 9. Key Metrics

| Metric | Value |
|--------|-------|
| Models (Prisma) | 220 |
| Enums | 24 |
| Migrations | 42 |
| Server Actions | 77 |
| API Routes | 47 (across 19 groups) |
| Components | 329 |
| Routes (app pages) | ~150+ |
| Environment variables | ~50 distinct |
| Dependencies (npm) | ~200+ |

## 10. Summary: Repository Health Indicators

| Indicator | Status | Notes |
|-----------|--------|-------|
| Build status | ✅ Passing | Zero errors, zero warnings |
| TypeScript strict | ✅ Enabled | `strict: true` in tsconfig |
| ESLint | ✅ Passing | Zero warnings after R-06 hardening |
| Test suite | ✅ Passing | Full test pass |
| Prisma schema | ✅ Valid | 220 models, no validation errors |
| Duplicate files | ⚠️ 15 pairs | Mostly in docs/, low severity |
| Empty dirs | ⚠️ 3 | `tests/`, `docs/brand/`, `docs/templates/` |
| Orphan files | ⚠️ Minimal | 71 README.md's (expected) |
| Archive bloat | ⚠️ Large | 307 files, could be pruned |
| Binary assets | ⚠️ Present | .pptx, .docx, .xlsx, .pdf in root |
