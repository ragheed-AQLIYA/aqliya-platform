# AQLIYA Documentation Conflict Report

> Generated: 2026-05-16
> Updated: 2026-05-16 (Phase 2 — updated after numbered folder archival)
> Purpose: Identify potential conflicts between documentation files and official v1.1 positioning.

---

## Findings

### Finding 1: `Mind The Future` in legacy archive docs

| Field                  | Value                                                                                                                                                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Files**              | `docs/archive/old-brand/AQLIYA_BRAND_SYSTEM.md`, `AQLIYA_UI_COPY_GUIDE.md`, `AQLIYA_VISUAL_QA_CHECKLIST.md`, `AQLIYA-VISUAL-IDENTITY-SYSTEM.md`, `QUICK-REFERENCE.md`, `docs/archive/old-brand/BRAND-ASSETS-ORGANIZATION.md` |
| **Term**               | `Mind The Future`                                                                                                                                                                                                            |
| **Context**            | Old brand system documents from before v1.1 alignment                                                                                                                                                                        |
| **Risk**               | Low — these are archived as historical                                                                                                                                                                                       |
| **Recommended Action** | None needed — clearly marked as archive. If these are ever restored, `Mind The Future` must be removed.                                                                                                                      |

### Finding 2: `Mind The Future` in active pilot docs

| Field                  | Value                                                                                                                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Files**              | `docs/pilot/execution-pack/README.md:93`, `docs/pilot/controlled-execution/AQLIYA_CONTROLLED_PILOT_EXECUTION_REPORT.md:244`, `docs/pilot/AQLIYA_PILOT_EXECUTION_PACK_REPORT.md:316` |
| **Term**               | `AQLIYA — Mind The Future`                                                                                                                                                          |
| **Context**            | Footer or branding in pilot reports written before v1.1 branding alignment                                                                                                          |
| **Risk**               | Medium — active docs still using old tagline                                                                                                                                        |
| **Recommended Action** | Replace with `AQLIYA — منصة ذكاء مؤسسي خاص ومحكوم` or remove the tagline entirely. These 3 files should be updated.                                                                 |

### Finding 3: SAMA / PDPL claims in Claude draft

| Field                  | Value                                                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Files**              | `docs/content/aqliya-website-content-professional-CLAUDE.md:1278,1731,1737`                                           |
| **Term**               | `SAMA`, `PDPL`, `ZATCA`, `NCA`                                                                                        |
| **Context**            | Claude marketing rewrite referenced regulatory compliance not yet supported by code                                   |
| **Risk**               | Low — this file is a rejected draft and is not used for implementation                                                |
| **Recommended Action** | None needed. The v3 hybrid explicitly excludes these claims (see Section 10 of v3 hybrid). Do not promote this draft. |

### Finding 4: Old product status labels in earlier content rewrites

| Field                  | Value                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| **Files**              | `docs/content/website-content-rewrite-v1-*.md`, `docs/content/website-content-rewrite-v2*.md`       |
| **Term**               | Various — e.g., `نظام قائم`, `متاح للتفعيل`, `06 خطوط تشغيل`                                        |
| **Context**            | Earlier drafts before v3 hybrid alignment                                                           |
| **Risk**               | Low — superseded by v3 hybrid                                                                       |
| **Recommended Action** | These are historical drafts. The v3 hybrid is the implementation source of truth. No action needed. |

### Finding 5: On-Prem references in official docs (aligned)

| Field                  | Value                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| **Files**              | `docs/official/aqliya-vision-v1.1.md`, `aqliya-glossary-v1.1.md`, `aqliya-roadmap-v1.1.md` |
| **Term**               | `On-Prem`, `Private / On-Prem`                                                             |
| **Context**            | All official docs correctly state On-Prem as strategic/future, not production-ready        |
| **Risk**               | None — properly aligned                                                                    |
| **Recommended Action** | None needed.                                                                               |

### Finding 6: Docker references in official docs (aligned — tech context)

| Field                  | Value                                                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Files**              | `docs/official/aqliya-core-architecture-v1.1.md:52`, `aqliya-roadmap-v1.1.md:61,150`, `aqliya-skill-context-v1.1.md:123`, `aqliya-implementation-rules-v1.1.md:100` |
| **Term**               | `Docker`, `Kubernetes`                                                                                                                                              |
| **Context**            | Official docs correctly state: Docker Compose for test env only, no On-Prem package, Kubernetes listed as unimplemented                                             |
| **Risk**               | None — properly contextualized as development/test, not production                                                                                                  |
| **Recommended Action** | None needed.                                                                                                                                                        |

### Finding 7: `AQLIYA AuditOS` / `AQLIYA SalesOS` naming in product docs

| Field                  | Value                                                                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Files**              | Various product definition packs in `docs/product/`                                                                                                  |
| **Term**               | Naming patterns                                                                                                                                      |
| **Context**            | Some older product docs may use `AQLIYA AuditOS` format instead of `AuditOS` (product) built on `AQLIYA` (platform)                                  |
| **Risk**               | Low — product packs are internal and pre-date v1.1 naming discipline                                                                                 |
| **Recommended Action** | Flag for future cleanup: product names should be `AuditOS`, `SalesOS`, etc., not `AQLIYA AuditOS`. The platform is AQLIYA; products are built on it. |

---

## Summary (Phase 2 Update)

| Severity | Count | Details                                                            |
| -------- | ----- | ------------------------------------------------------------------ |
| Critical | 0     | —                                                                  |
| High     | 0     | —                                                                  |
| Medium   | 0     | 3 pilot docs previously flagged for `Mind The Future` reviewed and noted as already cleaned in commits `ac19a8d`/`ac00dde` |
| Low      | 4     | Archive docs, Claude draft, superseded rewrites, product naming    |
| None     | 2     | On-Prem and Docker references in official docs (correctly aligned) |

### Phase 2 Resolutions

| Previous Finding | Status | Action |
|-----------------|--------|--------|
| Finding 2: `Mind The Future` in active pilot docs | ✅ Resolved | Confirmed already cleaned in commits `ac19a8d`, `ac00dde`; pilot files updated |
| Finding 7: `AQLIYA AuditOS` naming in product docs | ✅ v1.1 notices added | 4 product definition packs now have v1.1 alignment notices |
