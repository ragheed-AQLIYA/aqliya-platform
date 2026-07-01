# CLEANUP ROADMAP — AQLIYA Forensic Audit

**Generated:** 2026-06-17  
**Includes:** FILES_TO_DELETE, FILES_TO_ARCHIVE, FILES_TO_MERGE, FOLDERS_TO_RESTRUCTURE  
**Risk/Effort:** Sourced from opened audit evidence; import analysis NOT RUN for all items

---

## Phase 0 — Immediate (Security + Build Blockers)

| Action | Files | Effort | Risk | Dependency |
|--------|-------|--------|------|------------|
| Delete or dev-gate test-token | `src/app/api/test-token/route.ts` | 15m | Low | None |
| Fix TS: platformAuditEvent | `audit-event-service.ts` + schema/migration | 1–2h | Medium | DB migrate |
| Fix TS: SecretEntry exports | `src/lib/platform/secrets/types.ts` | 30m | Low | None |
| Fix Sales TS errors | `prisma-intelligence-snapshots.ts`, `prisma-legacy-adapters.ts` | 1h | Low | None |
| Clean `.next` stale types | `.next/` | 5m | Low | Rebuild |

---

## FILES_TO_DELETE.md

| Path | Confidence | Impact if wrong | Evidence |
|------|------------|-----------------|----------|
| `src/app/api/test-token/route.ts` | 95% | Debug only | SECURITY_AUDIT SEC-C01 |
| All 19 `src/**/* (1).ts` duplicates | 98% | Canonical siblings exist | DEAD_CODE_REPORT §1 |
| `public/brand/Favicons/symbol (1).svg` | 98% | Duplicate asset | glob |
| All 11 `src/app/(marketing)/**/*.bak` | 95% | Not routed | glob |
| Empty dirs: `src/lib/contacts/`, `utils/`, `i18n/` | 85% | Empty | Phase 3 |

**NOT VERIFIED safe to delete without import check:**
- `src/lib/sales/v02/` OR `_v02/` (pick one tree)
- `src/app/decision/` OR consolidate into dashboard

---

## FILES_TO_ARCHIVE.md

| Path | Target | Reason |
|------|--------|--------|
| `docs/archive/code/` | Keep in archive; **exclude from ESLint** | Lint noise — CONFIG_AUDIT |
| Superseded audit docs pre-2026-06 | `docs/archive/audits/` | Reduce active confusion |
| Marketing `.bak` (if kept for history) | `docs/archive/marketing-pages/` | Optional — delete preferred |
| One of `RELEASE_DECISION.md` copies | Archive duplicate | KNOWLEDGE_GOVERNANCE |

---

## FILES_TO_MERGE.md

| A | B | Result |
|---|---|--------|
| `docs/audits/RELEASE_DECISION.md` | `docs/review/RELEASE_DECISION.md` | Single release decision doc |
| `docs/operations/backup-restore-procedure.md` | `runbooks/backup-restore.md` | Single backup runbook |
| `src/lib/sales/v02/cross-product-signals/*` | `src/lib/sales/_v02/cross-product-signals/*` | Single v02 tree |
| `src/lib/ai/provider-factory.ts` | `src/lib/ai/providers/index.ts` | Single factory (verify first) |
| Master ref §6/§9 | PRODUCT_STATUS_MATRIX | Aligned product status |

---

## FOLDERS_TO_RESTRUCTURE.md

| Current | Recommended | Effort | Risk |
|---------|-------------|--------|------|
| `src/lib/sales/{v02,_v02,vnext}/` | `src/lib/sales/{core,vnext}/` | 3–5d | High — import sweep |
| `src/app/decision/` + `(dashboard)/decisions/` | Single `(dashboard)/decisions/` | 2–3d | Medium — redirects |
| `src/lib/risk/` (empty) | `src/lib/audit/risk/` or populate lib | 1–2d | Medium |
| `docs/reports/` (missing) | Create + move validation outputs | 1d | Low |
| `knowledge-foundation/` | Document as non-runtime corpus under docs index | 4h | Low |
| ESLint scope | Lint `src/` only; ignore docs/knowledge | 2h | Low |

---

## Effort Summary

| Phase | Scope | Human effort (from prior audits) | Risk |
|-------|-------|----------------------------------|------|
| P0 Security/build | 5 items | ~1 day | Low–Medium |
| P1 Dead file cleanup | 30 files | ~2 hours | Low |
| P2 Doc alignment | 5 authority docs | ~2 days | Low commercial risk |
| P3 Sales consolidation | v02 merge | ~1 week | **High** |
| P4 RBAC/MFA/SSO | Security stubs | ~2–4 weeks | **High** |

---

## Dependency Impact

| Cleanup | Blocks | Blocked by |
|---------|--------|------------|
| Delete `(1)` files | Nothing if unimported | Import verification |
| Schema drift fix | Deploy pipeline | Migration approval |
| Sales tree merge | Sales feature work | Test suite green |
| Doc updates | Commercial claims | Product owner review |

---

## Validation After Cleanup

| Command | Required when |
|---------|---------------|
| `npx tsc --noEmit` | After any TS/schema fix |
| `npm test` | After deleting files or merging sales |
| `npm run build` | Before deploy claim |
| `npm run lint -- src/` | After ESLint scope fix |

**NOT RUN in this audit** — user approval required for heavy commands.

---

## NOT VERIFIED

- Full import graph before delete list execution
- Customer dependencies on Sunbul URLs
- Production usage of `/api/test-token`
