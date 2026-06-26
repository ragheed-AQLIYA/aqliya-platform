# AQLIYA Documentation Governance v2.0

> **Purpose:** Define the complete lifecycle, ownership, naming conventions, versioning, deprecation, and hierarchy for all AQLIYA documentation.
>
> **Status:** Active | **Version:** 2.0 | **Date:** 2026-06-26 | **Owner:** Documentation Team | **Last Reviewed:** 2026-06-26 | **Supersedes:** `docs/DOCUMENTATION_GOVERNANCE.md`
>
> **Authority:** This document is authoritative for documentation management. It does not override `docs/DOCUMENTATION_AUTHORITY.md` for conflict resolution between documents.

---

## 1. Core Principles

### 1.1 No Duplicate Documents
Every document must have a unique purpose. If two documents cover the same topic, one must be marked as superseded and reference the active document.

### 1.2 No Conflicting Roadmaps
Exactly one active roadmap document exists at any time. Currently: `docs/official/AQLIYA_ROADMAP_v1.2.md`.

### 1.3 No Executable Source Code Under `docs/`
No `.ts`, `.js`, `.mjs`, `.tsx`, `.jsx` files may reside under `docs/`. Any such files must be moved to `src/` or `scripts/`.

### 1.4 Every Document Must Have an Owner
Every document in `docs/` must have a named owner (team or role) in its frontmatter or metadata.

### 1.5 Every Document Must Have a Status
Every document must declare one of: `Active`, `Deprecated`, `Superseded`, `Archived`, `Draft`.

### 1.6 Source of Truth Is Hierarchical
Document conflict resolution follows the hierarchy defined in `docs/DOCUMENTATION_AUTHORITY.md`.

---

## 2. Document Lifecycle

```
                    ┌─────────────┐
                    │   Concept   │  (idea, not yet written)
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Draft     │  (in progress, not authoritative)
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Active    │  (current, authoritative)
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐ ┌──▼──┐  ┌─────▼──────┐
       │  Superseded │ │Dep.│  │  Archived   │
       │  (replaced) │ │    │  │ (historical)│
       └─────────────┘ └─────┘  └────────────┘
```

### Stage Definitions

| Stage | Meaning | Can Be Cited As Authority? | Review Required For Entry |
|-------|---------|---------------------------|---------------------------|
| **Concept** | Idea documented, not written | No | — |
| **Draft** | Written but not approved | No | — |
| **Active** | Current, approved, authoritative | Yes | Peer review + owner approval |
| **Deprecated** | No longer current, no replacement cited | No | Owner decision |
| **Superseded** | Replaced by a newer document | No, but reference to superseding doc | Owner decision |
| **Archived** | Historical only, preserved for record | No | Owner decision |

---

## 3. Ownership

### 3.1 Owner Types

| Owner | Responsible For |
|-------|-----------------|
| **Platform Team** | Technical infrastructure, deployment, build, Prisma schema |
| **Product Architect** | Product identity, taxonomy, vision, roadmaps |
| **Platform Architect** | Architecture, route strategy, system taxonomy |
| **Governance Team** | Agent contract, implementation rules, documentation governance |
| **Security Agent** | Security gates, RBAC, auth, middleware |
| **Documentation Team** | Documentation lifecycle, knowledge map, clean-up |
| **Commercial Team** | What we do not claim, commercial packs, sales materials |
| **AuditOS Team** | AuditOS product documentation |
| **LocalContentOS Team** | LocalContentOS product documentation |
| **DecisionOS Team** | DecisionOS product documentation |

### 3.2 Ownership Assignment

Every document in `docs/official/`, `docs/source-of-truth/`, `docs/systems/`, `docs/products/`, and root `docs/` must have:
- An `owner` field in its metadata (frontmatter or first comment)
- A `status` field
- A `lastReviewed` date

### 3.3 Ownership Rules

- No document may have "unowned" as owner
- Documents without an owner for >90 days are flagged for review
- Owner changes must be documented in the change log

---

## 4. Naming Conventions

### 4.1 File Naming

| Doc Type | Convention | Example |
|----------|-----------|---------|
| Official doctrine | `topic-v{major}.{minor}.md` | `aqliya-vision-v1.1.md` |
| Source of truth | `TOPIC_IN_SCREAMING_SNAKE.md` | `PRODUCT_STATUS_MATRIX.md` |
| System docs | `system-name/TOPIC.md` | `auditos/AUDITOS_OPERATOR_MANUAL.md` |
| AI documentation | `docs/ai/descriptive-name.json` | `knowledge-map.json` |
| Runbooks | `runbooks/descriptive-name.md` | `production-deployment-runbook.md` |
| Releases | `docs/releases/v{major}.{minor}-{name}.md` | `v1.2-architecture-release.md` |
| Reports | `docs/reports/YYYY-MM-DD-description.md` | `2026-06-01-build-validation.md` |

### 4.2 Naming Rules

- No spaces in filenames — use hyphens or underscores
- Official v1.1+ docs use lowercase with hyphens
- Source-of-truth docs use SCREAMING_SNAKE_CASE
- System docs use the system directory prefix
- Version numbers follow semver: `v{major}.{minor}`

---

## 5. Versioning

### 5.1 Version Number Placement

- Official doctrine docs: version in filename (`aqliya-vision-v1.1.md`)
- Governance docs: version in filename (`DOCUMENTATION_GOVERNANCE_v2.md`)
- Source-of-truth: version in header metadata, not filename
- Systems docs: version in header metadata

### 5.2 Version Increment Rules

| Change Type | Increment | Example |
|-------------|-----------|---------|
| Minor clarification, typo fix | Patch (v1.1 → v1.1.1) | Noted in change log |
| Substantive content change | Minor (v1.1 → v1.2) | New file version |
| Identity/doctrine change | Major (v1.x → v2.0) | Requires full review |

### 5.3 Version Metadata

Every versioned document must include:

```markdown
**Version:** 1.0
**Status:** Active
**Date:** 2026-06-26
**Owner:** [Team/Role]
**Supersedes:** [previous doc path]
**Superseded By:** [newer doc path, if applicable]
```

---

## 6. Deprecation Policy

### 6.1 When to Deprecate

A document is deprecated when:
- It is superseded by a newer document
- Its content is merged into another document
- It is no longer relevant and no replacement is needed
- It contains claims that contradict current reality

### 6.2 Deprecation Procedure

1. Add `**Status:** Deprecated` header to the document
2. Add `**Superseded By:** path/to/replacement.md` if applicable
3. Update the knowledge map (`docs/ai/knowledge-map.json`) to reflect deprecation
4. Notify document owner
5. Do not delete the file — deprecation is non-destructive

### 6.3 Deprecated Document Rules

- Must not be cited as authority
- Must clearly reference the replacement if one exists
- Must remain in place for historical reference
- May be moved to `docs/archive/` only with owner approval

---

## 7. Archive Policy

### 7.1 When to Archive

A document is archived when:
- It has been superseded for >6 months
- It is a pre-v1.1 document with no current relevance
- It is a temporary report that has served its purpose
- It contains outdated brand elements (e.g., "Mind The Future")

### 7.2 Archive Rules

- Never delete archived documents
- Archived documents must have `**Status:** Archived` in header
- Archived documents must not be cited as authority
- Archived documents remain in their original location or move to `docs/archive/`
- `docs/archive/` preserves the original directory structure
- Each archived document must reference why it was archived

### 7.3 Archive Categories

| Category | Examples | Retention |
|----------|----------|-----------|
| Old brand | Pre-v1.1 brand guides, Mind The Future materials | Permanent |
| Superseded doctrine | v1.0 docs replaced by v1.1 | Permanent |
| Stale reports | Build failure matrices, one-time analysis | 1 year |
| Temporary evidence | Validation snapshots, session reports | 6 months |

---

## 8. Superseded Policy

### 8.1 When a Document Is Superseded

A document is superseded (not just deprecated) when a direct replacement exists. For example:
- `aqliya-roadmap-v1.1.md` → partially superseded by `AQLIYA_ROADMAP_v1.2.md`
- `DOCUMENTATION_GOVERNANCE.md` → superseded by `DOCUMENTATION_GOVERNANCE_v2.md`

### 8.2 Superseded Document Rules

- Must include `**Superseded By:** path/to/replacement.md`
- The replacement must include `**Supersedes:** path/to/old-doc.md`
- The knowledge map must reflect the supersession chain
- Superseded documents remain in place (not archived) for at least 90 days

### 8.3 Partial Supersession

Some documents are partially superseded — portions remain valid:
- `aqliya-roadmap-v1.1.md`: Vision/strategy sections remain valid; execution roadmap is superseded
- `aqliya-core-architecture-v1.1.md`: Foundation architecture valid; detailed implementation docs supersede

Partial supersession must be explicitly documented in the header.

---

## 9. Source of Truth Policy

### 9.1 Source of Truth Definition

A Source of Truth document is one that can be cited as authoritative for the domain it covers.

### 9.2 Source of Truth Hierarchy

| Level | Location | Authority |
|-------|----------|-----------|
| L0 | `docs/DOCUMENTATION_AUTHORITY.md` | Highest — conflict resolution |
| L1 | `docs/official/AQLIYA_MASTER_REFERENCE.md` | Platform identity, product list |
| L2 | `docs/official/` (v1.1-series) | Vision, taxonomy, architecture, glossary |
| L3 | `docs/source-of-truth/` | Current state, status, routes, deployment |
| L4 | `AGENTS.md` | Agent operating contract |
| L5 | `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md` | Commercial boundaries |
| L6 | `docs/systems/`, `docs/products/` | Product-specific documentation |
| L7 | `runbooks/`, `infra/`, `monitoring/` | Operational documentation |

### 9.3 Source of Truth Rules

- Each topic must have exactly one Source of Truth
- No two documents may claim Source of Truth for the same topic
- Source of Truth documents must be reviewed at least quarterly
- Source of Truth changes must be documented in the change log

---

## 10. Decision Rules

### Rule 1: No Duplicate Documents
> If two documents cover the same topic, one must be marked as superseded and reference the active document.

*Rationale:* Prevents contradictions, reduces maintenance burden.

### Rule 2: No Conflicting Roadmaps
> Exactly one active roadmap document exists at any time.

*Rationale:* Roadmap conflicts cause execution confusion.

### Rule 3: No Executable Source Code Under docs/
> No `.ts`, `.js`, `.mjs`, `.tsx`, `.jsx` files may reside under `docs/`.

*Rationale:* Documentation directories are not code directories. Code under docs/ creates maintenance ambiguity.

### Rule 4: Every Document Must Have an Owner
> Every document in `docs/` must have a `owner` field in its metadata.

*Rationale:* Ownership ensures accountability and review.

### Rule 5: Every Document Must Have a Status
> Every document must declare `Active`, `Deprecated`, `Superseded`, `Archived`, or `Draft`.

*Rationale:* Status prevents documents from being cited incorrectly.

### Rule 6: Source of Truth Override
> If two documents conflict on the same topic, the higher-authority Source of Truth wins.

*Rationale:* Clear hierarchy prevents endless disputes.

### Rule 7: Stale Report Archival
> Reports more than 3 months old with no active use case must be archived.

*Rationale:* Prevents the root directory from accumulating stale reports.

### Rule 8: Entry Point Requirement
> Every AI assistant must read `docs/AI_ENTRYPOINT.md` before reading any other document in a new session.

*Rationale:* Ensures every agent has baseline context.

---

## 11. Review Cycles

| Document Type | Review Frequency | Responsible |
|---------------|-----------------|-------------|
| DOCUMENTATION_AUTHORITY.md | Quarterly | Documentation Team |
| AQLIYA_MASTER_REFERENCE.md | Monthly | Product Architect |
| Official v1.1 docs (active) | Quarterly | Product Architect |
| Source-of-truth docs | Monthly | Platform Architect + Product Architect |
| AGENTS.md | Quarterly | Governance Team |
| Product status matrix | Monthly | Product Architect |
| Commercial claims | Prior to any release | Commercial Team |
| Knowledge map | Quarterly | Documentation Team |
| Roadmap | Quarterly | Product Architect |

---

## 12. Compliance Checklist

Before creating any new document:

- [ ] Does this document overlap with an existing document?
- [ ] Does this document have a unique purpose?
- [ ] Does this document have a named owner?
- [ ] Does this document have a clear status?
- [ ] Is this document in the correct directory?
- [ ] Does the filename follow naming conventions?
- [ ] Is this document registered in the knowledge map?
- [ ] Does this document declare what it supersedes (if applicable)?
- [ ] Is the version number correct?

---

## 13. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-26 | Initial creation — v2.0 governance framework | OpenCode |
| 2026-06-26 | Supersedes `docs/DOCUMENTATION_GOVERNANCE.md` v1.0 | OpenCode |

---
