# Documentation Truth Matrix — AQLIYA Deep Reality Audit

**Audit date:** 2026-06-17  
**Method:** Cross-reference `docs/` claims against code execution evidence  
**Docs scanned:** 1,671 markdown files (sampled: authority docs, PRODUCT_STATUS_MATRIX, README, AGENTS.md, architecture docs, AI docs)

---

## Legend

| Label | Meaning |
|-------|---------|
| **VERIFIED** | Claim matches code + execution evidence |
| **PARTIALLY VERIFIED** | Claim true under conditions or partially implemented |
| **FALSE** | Claim contradicted by evidence |
| **MISSING** | Claimed capability with no code path |
| **UNVERIFIED** | No execution evidence collected |

---

## Critical Claims Matrix

| Claim | Source | Evidence | Status |
|-------|--------|----------|--------|
| "0 TS errors, build passes" (Phase 7, 2026-05-28) | PRODUCT_STATUS_MATRIX | `tsc --noEmit` = 9 errors; `npm run build` FAIL | **FALSE** |
| "135 ESLint warnings → 0" (Phase 7) | PRODUCT_STATUS_MATRIX | `npm run lint` = 33,662 problems (broad scope) | **FALSE** / UNVERIFIED scoped |
| AuditOS L5 Pilot-ready | PRODUCT_STATUS_MATRIX, CLAUDE.md | 27 routes, seed-audit.ts, governance tests pass | **VERIFIED** |
| LocalContentOS L4 Usable v0.1 | PRODUCT_STATUS_MATRIX | 26 routes, workbook engine, 265 LC tests claimed | **PARTIALLY VERIFIED** (L5 features exist; build blocked) |
| LocalContentOS "265 passing tests" | PRODUCT_STATUS_MATRIX | Full suite 2424 pass; LC subset not isolated | **PARTIALLY VERIFIED** |
| Local AI L4 pilot with Ollama | PRODUCT_STATUS_MATRIX | `local-ai:smoke` PASS with qwen3:8b | **VERIFIED** |
| LocalAIProvider "Not implemented" | `src/lib/ai/README.md` | `local-provider.ts` + smoke PASS | **FALSE** (doc stale) |
| RiskOS L0 Concept / not implemented | PRODUCT_STATUS_MATRIX | `/risk/*` routes exist with Prisma models | **FALSE** (exists as audit submodule L3) |
| SSO L4 Usable v0.1 | PRODUCT_STATUS_MATRIX | Env OAuth works; DB SSO CRUD not wired to login | **PARTIALLY VERIFIED** |
| SCIM L4 Usable v0.1 | PRODUCT_STATUS_MATRIX | API routes + auth + service exist | **VERIFIED** (single-org limitation) |
| SalesOS L5 criteria met | PRODUCT_STATUS_MATRIX | Real Prisma, 30 routes; TS errors, duplicate tests | **PARTIALLY VERIFIED** |
| On-Prem / Air-Gapped implemented | Various marketing/theoretical docs | No deployment package in repo | **MISSING** (correctly labeled strategic in official docs) |
| AQLIYA Studio implemented | PRODUCT_STATUS_MATRIX | No routes | **MISSING** (correctly L0) |
| Production AWS ECS Fargate | CLAUDE.md, terraform | Full IaC in repo; live state unverified | **PARTIALLY VERIFIED** |
| pgvector RAG | Architecture docs | Schema + similarity-search.ts; gated by FF_AI_RAG | **VERIFIED** (gated) |
| Skill Evaluation 25/25 pass | PRODUCT_STATUS_MATRIX | Eval framework exists; live AI 0/11 pass (doc acknowledges) | **PARTIALLY VERIFIED** |
| MFA implemented | Docs + routes | TOTP code exists; JWT fields not set at login | **PARTIALLY VERIFIED** |
| Virus scanning on uploads | Implied enterprise readiness | `file-scanner.ts` pass-through stub | **FALSE** for production claim |
| CoreAccessControl RBAC | Implied by architecture | Always returns `granted` | **FALSE** as enforcement |

---

## Documentation Contradictions

| Topic | Doc A Says | Doc B / Code Says | Resolution |
|-------|-----------|-------------------|------------|
| Local AI status | README: not implemented | Smoke test PASS; model-registry disabled entry | **Code wins** — update README |
| Build health | Phase 7: green | Current: 9 TS errors, build fail | **Code wins** — matrix stale |
| RiskOS | L0 not implemented | `/risk/*` audit-risk module | **Code wins** — submodule exists |
| Domain | README/terraform README: aqliya.ai | Production tfvars: aqliya.com | **Partially migrated** |
| SalesOS maturity | L5 criteria met | Duplicate test files, TS errors | **Overclaimed** |

---

## Documentation Volume vs Value

| Category | Files | Accuracy Assessment |
|----------|------:|---------------------|
| `docs/official/` | ~15 | High for identity/governance; check dates |
| `docs/source-of-truth/` | ~10 | **Stale on build/test status** |
| `docs/theoretical-reference/` | ~200+ | Background only — not implementation authority |
| `docs/archive/` | ~400+ | Historical — must not drive claims |
| `docs/review/` | ~50+ | Evidence reports — trustworthy as snapshots |
| `docs/product/` | ~100+ | Mixed — specs ahead of code in places |
| `knowledge-foundation/` | ~292 | Reference corpus — not runtime-loaded |

---

## Unsupported Commercial Claims (Do Not Use in Sales)

1. Production-certified / L6 anything — **FALSE**
2. Air-gapped local AI package — **MISSING**
3. SAML SSO from admin UI — **STUB** (CRUD only)
4. Model Governance registry — **MISSING**
5. Institutional Memory engine (standalone product) — **PARTIAL** (DB layer exists, not productized)
6. Virus scanning on uploads — **STUB**
7. Full enterprise RBAC matrix — **STUB** (CoreAccessControl)

---

## Recommendations

| Priority | Action |
|----------|--------|
| P0 | Update PRODUCT_STATUS_MATRIX build/test status to reflect 2026-06-17 reality |
| P0 | Fix `src/lib/ai/README.md` Local AI section |
| P1 | Add "last verified" date + verification command to each status row |
| P1 | Mark RiskOS as "Audit Risk Submodule L3" not L0 |
| P2 | Archive or banner stale audit reports claiming green build |

---

**Overall documentation accuracy score: 62/100** — Strong on identity and product taxonomy; weak on implementation status freshness.
