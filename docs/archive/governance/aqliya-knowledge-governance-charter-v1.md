# AQLIYA Knowledge Governance Charter v1

**Status:** Active — Governing authority for all documentation decisions during Knowledge Governance Sprint v1  
**Version:** 1.0  
**File location:** `docs/governance/aqliya-knowledge-governance-charter-v1.md`  
**Authority:** Level 2 — subordinate to `docs/DOCUMENTATION_AUTHORITY.md`; supersedes all other governance rules for documentation classification during the Sprint  
**Owner:** Governance Team  
**Effective date:** 2026-06-29  
**Review cycle:** Every 3 months or at Documentation Freeze breach, whichever comes first

---

## 1. Purpose

This charter defines the rules by which all AQLIYA documentation is classified, evaluated, and governed during the Knowledge Governance Sprint v1 and beyond.

It exists because:

- A documentation corpus of **1,956 files and 380K lines** requires classification before cleanup.
- **10 documents already declare themselves superseded** — yet remain in active indexes.
- **1,312 archived documents** still appear in search and navigation.
- Without explicit governance rules, every cleanup decision becomes an unprincipled judgment call.

This charter eliminates judgment calls by providing binary pass/fail rules.

---

## 2. Document Types

Every document in the AQLIYA knowledge base must carry exactly one of these five type labels.

| Type | Definition | Update policy | Search inclusion | Authority |
|---|---|---|---|---|
| **Authority** | Single source of truth for one Knowledge Area. One per area. No duplicates. | Updated only when the truth changes | Always included | Highest for its area |
| **Reference** | Supporting document that cites Authority rather than duplicating it. | Updated when Authority changes (redirect, don't copy) | Included | None — cites Authority |
| **Working** | Active draft, in-progress design, temporary decision record. | Frequently updated until promoted or archived | Excluded from default search | None — temporary |
| **Historical** | Retained record of a past state, decision, or approach. Annotated with what replaced it. | Error corrections only | Excluded from default search | None — informational only |
| **Archive** | Superseded or obsolete document, preserved for audit/compliance only. | Never updated | Excluded from all search | None — preserved only |

### 2.1 Type assignment rules

- **Every document must have exactly one type.** No document may be untyped.
- **A document cannot be Authority and Reference simultaneously.** If it contains original claims, it is Authority. If it only cites, it is Reference.
- **A document cannot be Working for more than one review cycle (3 months).** Either promote it or archive it.
- **Archive is final.** Once archived, a document cannot be reactivated without a new Governance Charter decision.
- **Historical is not Archive.** Historical documents are kept for reference value; Archive documents are kept for compliance only.

---

## 3. Authority Rules

### 3.1 One Authority per Knowledge Area

Each Knowledge Area has exactly one Authority document.

| Knowledge Area | Authority Document |
|---|---|
| Platform Identity | `docs/official/aqliya-vision-v1.1.md` |
| Product Taxonomy | `docs/official/aqliya-product-taxonomy-v1.1.md` |
| Product Status | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` |
| Architecture | `docs/official/aqliya-core-architecture-v1.1.md` |
| Glossary | `docs/official/aqliya-glossary-v1.1.md` |
| Routes | `docs/source-of-truth/ROUTE_STRATEGY.md` |
| Roadmap | `docs/official/AQLIYA_ROADMAP_v1.2.md` |
| Agent Execution | `AGENTS.md` |
| Documentation Hierarchy | `docs/DOCUMENTATION_AUTHORITY.md` |
| Readiness | `docs/source-of-truth/READINESS_GATES.md` |
| Pilot Operations | `docs/pilot/*` (as single Pilot knowledge area) |
| Security Governance | `docs/governance/SECURITY_REVIEW.md` + tenant-security docs |
| AI Governance | `docs/governance/ai-governance.md` |
| Knowledge Governance | **This document** |

**Rule:** No second Authority may exist for any area listed above. If discovered during the Sprint, the duplicate must be either demoted to Reference or archived.

### 3.2 Authority documents must

- Announce their type in the header: `**Type:** Authority — [Knowledge Area]`
- Name their Knowledge Area explicitly
- Declare their Owner
- Include a Last Reviewed date
- List any Supersedes / Superseded By references

### 3.3 Authority documents must not

- Duplicate content from another Authority (use `See: [Authority]` instead)
- Contain Working content or drafts
- Reference archived documents as current sources

---

## 4. Conflict Resolution Rules

When a document conflict is discovered during the Sprint:

| Situation | Rule |
|---|---|
| Authority conflicts with Authority | **Blocking.** Cannot proceed until resolved. Escalate to Governance Team. The older or less-specific Authority is demoted to Reference or Historical. |
| Authority conflicts with Reference | **Authority wins.** Reference must be updated to cite Authority, removing the conflicting claim. |
| Authority conflicts with Historical | **Authority wins.** Historical document is annotated with a note explaining the conflict and citing the Authority. |
| Authority conflicts with Archive | **Authority wins.** Archive is untouched (it is preserved as-is). No annotation needed. |
| Reference conflicts with Reference | **Resolved by tracing to Authority.** Both References must be aligned to the Authority. |
| Two documents claim Authority for the same area | **Blocking.** One must be demoted. The demoted document is marked as Superseded and reclassified as Historical or Reference. |

### 4.1 Silent conflict rule

Do not silently choose a third interpretation. Every conflict must be:

1. Documented in `KNOWLEDGE_CLEANUP_LOG.md`
2. Resolved according to the table above
3. Verified by the Governance Team

---

## 5. Transfer Rules

When content is moved, merged, or relocated between documents:

| Requirement | Enforcement |
|---|---|
| **Traceability** | Every moved fact must have a source document and target document recorded in `KNOWLEDGE_CLEANUP_LOG.md` |
| **Back-reference** | The source document must contain a visible redirect: `> **Moved to:** [target path]` |
| **No information loss** | No content may be deleted without a trace. If removed, the fact and reason must be logged. |
| **Cross-reference update** | All documents linking to the old location must be updated to point to the new location. |

### 5.1 Deletion rule

**No document may be deleted.** Instead:

- Authority → demote to Reference, then to Historical, then to Archive
- Reference → demote to Historical, then to Archive
- Working → promote to Authority/Reference or move to Archive
- Historical → move to Archive
- Archive → never deleted

This ensures full audit trail for all knowledge decisions.

---

## 6. Lifecycle Metadata Requirements

Every active (non-Archive, non-Historical) document must carry:

| Field | Required? | Example |
|---|---|---|
| `Type` | **Required** | Authority, Reference, Working |
| `Status` | **Required** | Active, Draft, Review, Superseded |
| `Knowledge Area` | **Required** | Architecture, Product Status, Glossary |
| `Owner` | **Required** | Governance Team, Platform Team |
| `Last Reviewed` | **Required** | 2026-06-29 |
| `Review Cycle` | Recommended | Every 3 months |
| `Supersedes` | If applicable | `docs/old-file.md` |
| `Superseded By` | If applicable | `docs/new-file.md` |

Documents missing any **Required** field must be flagged in the Sprint log.

---

## 7. Success Criteria

The Sprint is complete only when ALL of these are true:

| # | Criterion | Verification method |
|---|---|---|
| 1 | **Zero duplicate authorities** | Authority Matrix shows 1:1 mapping |
| 2 | **Zero orphan knowledge areas** | Every area has an assigned Authority |
| 3 | **Zero broken cross-references** | All internal links verified |
| 4 | **100% authority ownership** | Every Authority has a named Owner |
| 5 | **100% lifecycle metadata** | Every active document has Type, Status, Area, Owner, Last Reviewed |
| 6 | **100% claim verification** | All substantive claims in active docs traced to code or Authority |
| 7 | **Navigation depth ≤ 3** | Any fact reachable within 3 navigation steps from MASTER_REFERENCE |
| 8 | **Active Knowledge Surface reduced** | Measured before/after — reduction in active (non-Archive) document count |
| 9 | **Governance Gate defined** | Automated check defined in CI or documented process |

---

## 8. Documentation Freeze v1.0

Effective immediately upon completion of the Sprint:

| Rule | Detail |
|---|---|
| **No new Authority documents** without Governance Team approval and justification why existing Authority cannot be updated |
| **No new Reference documents** for a Knowledge Area that already has an Authority (use `See: Authority` instead) |
| **No duplicate facts** — any PR adding documentation must prove the fact does not already exist in an Authority |
| **Every new doc must carry full lifecycle metadata** (Type, Status, Area, Owner, Last Reviewed) |
| **Knowledge Governance Gate** — documentation changes must pass: no broken links, no duplicate authorities, no untyped documents, all references cite valid Authorities |

---

## 9. Knowledge Governance Gate (Post-Sprint)

After Documentation Freeze v1.0, a permanent automated gate governs all documentation changes:

### 9.1 Gate rules

| Rule | Enforcement |
|---|---|
| No new Authority for an area that already has one | Script checks AUTHORITY_MATRIX.md |
| No broken internal links | Link checker on all changed `.md` files |
| No untyped documents | Every `.md` file must have a Type header field |
| No references to Superseded/Archived docs as current sources | Reference checker |
| All new docs have Owner and Last Reviewed | Metadata validator |

### 9.2 Gate implementation

The gate should be implemented as:

1. A script in `scripts/` (e.g., `scripts/validate-knowledge-governance.mjs`)
2. Integrated into pre-commit or CI pipeline
3. Generates a pass/fail report with specific violations

---

## 10. Amendment

This charter may only be amended by:

1. A documented decision (see Decision Brief format in AGENTS.md §31.1)
2. Updated version with changelog entry
3. Governance Team approval

---

## 11. Change Log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-06-29 | 1.0 | Initial charter — created as D0 for Knowledge Governance Sprint v1 | OpenCode |
