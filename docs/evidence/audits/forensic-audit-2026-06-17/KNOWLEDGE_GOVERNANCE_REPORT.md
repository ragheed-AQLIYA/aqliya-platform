# KNOWLEDGE GOVERNANCE REPORT — AQLIYA Forensic Audit

**Generated:** 2026-06-17  
**Method:** DOCUMENTATION_AUTHORITY.md read + DOCUMENT_INDEX generation + folder counts

---

## Knowledge Foundation Map

| Corpus | Location | Files (.md) | Authority level | Runtime loaded |
|--------|----------|------------:|-----------------|----------------|
| Doctrine | `docs/official/` | 14 | Level 2 | No |
| Source of truth | `docs/source-of-truth/` | 24 | Level 4 | No |
| Product specs | `docs/product/` | 218 | Level 5 | No |
| Theoretical reference | `docs/theoretical-reference/` | 352 | Level 7 — background | No |
| Archive | `docs/archive/` | 227 | Level 8 — historical | No |
| Audits / evidence | `docs/audits/` | 69+ | Evidence | No |
| Knowledge Foundation Program | `knowledge-foundation/` | ~292 (prior commit) | NOT in hierarchy | **NOT VERIFIED** runtime |
| Agent skills | `.skills/aqliya/` | NOT VERIFIED count | AGENTS.md reference | Agent-only |
| Runbooks | `docs/operations/`, `runbooks/` | 89+ ops, 6 root runbooks | Operational | No |

**Total markdown indexed:** 1,735 (DOCUMENT_INDEX.md generation)

---

## Governance Hierarchy (VERIFIED)

Source: `docs/DOCUMENTATION_AUTHORITY.md`

- **Doctrine** (identity, trust) → `docs/official/*`
- **Implementation status** → code + validation + reports
- **Reports** → `docs/reports/*` — **BROKEN: directory empty (0 files)**
- **Theoretical** → background only, must not drive product claims
- **Archive** → historical only

---

## Orphan Knowledge (High Volume, No Clear Owner)

| Area | Issue | Evidence |
|------|-------|----------|
| `docs/theoretical-reference/` (352 files) | No per-doc owner field | DOCUMENT_INDEX — title only |
| `docs/archive/` (227 files) | Risk of stale citation | Authority Level 8 |
| `knowledge-foundation/` | Parallel to docs/; not in DOCUMENTATION_AUTHORITY table | Glob + git log 8f14d8f |
| `docs/review/localcontent/` | Pilot evidence pack (git status untracked) | Recent work, no index entry |
| Multiple reality audits | `reality-audit-2026-06-17/` + prior audits | Duplicated evidence |

**Owner field:** NOT VERIFIED in any doc frontmatter sampled.

---

## Duplicate Knowledge

| Topic | Locations |
|-------|-----------|
| Release decisions | `docs/audits/RELEASE_DECISION.md`, `docs/review/RELEASE_DECISION.md` |
| Backup procedures | `docs/operations/backup-restore-procedure.md`, `runbooks/backup-restore.md` |
| Reality audits | `docs/audits/AQLIYA_REALITY_AUDIT_*`, `reality-audit-2026-06-17/`, this forensic package |
| SalesOS status | Master ref, README, matrix, architecture |
| AI runtime strategy | ADR-001, `src/lib/ai/README.md`, product docs |

---

## Missing Ownership Signals

| Gap | Evidence |
|-----|----------|
| No `docs/reports/` population | DOCUMENTATION_AUTHORITY Level 6 empty |
| No unified doc owner registry | NOT VERIFIED in repo |
| Stale master reference dates | §16 still 2026-05-28 baseline |
| Agent contract (AGENTS.md) 1731+ lines | Partial read only — governance embedded |

---

## Stale References

| Reference | Stated | Current evidence |
|-----------|--------|------------------|
| Master ref validation | 27 suites / 213 tests | 272 suites / 2515 tests |
| Master ref SalesOS | L3 no backend | 358 lib files |
| Master ref Local AI | NOT implemented | smoke PASS |
| `docs/reports/*` as evidence layer | Required by authority | Missing directory |

---

## Compliance / Standards References

| Type | Path | Opened |
|------|------|--------|
| ADR | `docs/architecture/ADR-001-AI-RUNTIME-STRATEGY.md` | Partial |
| SOCPA audit rules tests | `src/lib/audit/rules/__tests__/socpa-rules.test.ts` | NOT opened |
| ISQM1 models | prisma schema | NOT verified |
| Deployment runbook | `docs/operations/production-deployment-runbook.md` | NOT opened |

---

## Knowledge ↔ Code Linkage

| Knowledge type | Linked to runtime |
|----------------|-------------------|
| RAG document chunks | YES — pgvector schema |
| knowledge-foundation/ corpus | **NOT VERIFIED** loaded into RAG |
| Theoretical reference | NO — by design |
| Pilot review JSON in docs/review/ | Evidence only |
| `.skills/aqliya/` | Agent execution guidance |

---

## Recommendations

1. **Create `docs/reports/`** or amend DOCUMENTATION_AUTHORITY Level 6
2. **Add owner + last-reviewed** frontmatter to source-of-truth docs
3. **Archive superseded** master ref sections with date stamps
4. **Index knowledge-foundation/** in docs/README.md with non-runtime disclaimer
5. **Merge duplicate** RELEASE_DECISION and backup runbooks
6. **Single audit package pointer** — link forensic + reality audits in README

---

## NOT VERIFIED

- Notion integration (`docs/notion/` — 1 file)
- Full knowledge-foundation file inventory
- Institutional compliance doc completeness (SOC2, etc.)
- Which docs are customer-facing vs internal
