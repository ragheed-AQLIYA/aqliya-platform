# NAVIGATION_ANALYSIS.md
# Knowledge Governance Sprint v1 — Phase 4 Report

> **Status:** Completed | **Date:** 2026-06-29 | **Owner:** Governance Team | **Sprint:** Knowledge Governance Sprint v1

---

## 1. Executive Summary

The AQLIYA documentation corpus spans **56 active directories** containing approximately **1,977 non-archive Markdown files**. While the corpus has several navigation entry points — docs/README.md, docs/DOCUMENTATION_AUTHORITY.md, docs/AI_KNOWLEDGE_MAP.md, and docs/AI_ENTRYPOINT.md — the navigation structure suffers from three critical problems:

1. **Missing index files:** 41 of 56 directories (73%) lack a README.md or equivalent index, forcing users to browse raw file listings.
2. **Click depth variance:** Most content is reachable in 1-3 clicks, but some marketing production paths extend to depth 5-6.
3. **App sidebar vs doc navigation disconnect:** The platform sidebar (platform-sidebar.tsx) defines application navigation independently from the documentation structure, with no cross-linking or shared information architecture.

**Key findings:**

| Metric | Value |
|--------|-------|
| Active directories | 56 |
| Non-archive .md files | ~1,977 |
| README.md files across docs/ | 64 |
| Directories WITHOUT README | 41 (73%) |
| Entry point files | 4 (README, DOCUMENTATION_AUTHORITY, AI_KNOWLEDGE_MAP, AI_ENTRYPOINT) |
| Total entry points to docs/ | 1 (docs/README.md) |
| App sidebar modules | 5 product modules + 14 platform nav items |
| Directories with click depth ≥ 4 | 14 paths |

**Recommendation:** Create index files for all top-level directories, establish a unified information architecture that maps documentation to the app sidebar, and reduce maximum click depth to 3.

---

## 2. Navigation Entry Points

### Current Entry Points

| File | Role | Links To | Last Updated |
|------|------|----------|--------------|
| docs/README.md | Main entry point for docs | Official docs, source-of-truth, AI entry points | 2026-06 |
| docs/DOCUMENTATION_AUTHORITY.md | Conflict-resolution hierarchy | All doc levels | 2026-06-26 |
| docs/AI_KNOWLEDGE_MAP.md | AI agent knowledge orientation | Thematic doc clusters | 2026-06 |
| docs/AI_ENTRYPOINT.md | Reduced entry point for AI agents | Core identity, key docs | 2026-06 |

### Entry Point Quality Assessment

| Entry Point | Comprehensive? | Cross-link to sidebar? | Has ToC? | Machine-readable? |
|-------------|---------------|----------------------|----------|-------------------|
| docs/README.md | Partial (high-level only) | No | Yes | Partial |
| DOCUMENTATION_AUTHORITY.md | Yes (hierarchy) | No | Yes | Yes |
| AI_KNOWLEDGE_MAP.md | Yes (knowledge-oriented) | No | Yes | Yes |
| AI_ENTRYPOINT.md | Partial (AI-focused) | No | Yes | Yes |

**Gap:** No single navigation index maps the full directory tree or links to all 56 directories. A user must discover directories through context, search, or file browsing.

---

## 3. Directory Map with File Counts and Click Depths

### Top-Level Directory Overview

| Directory | Files | README? | Click Depth from root | Notes |
|-----------|-------|---------|----------------------|-------|
| theoretical-reference | 352 | ✅ (subdirs have READMEs) | 1 | Heaviest directory; has its own nav structure |
| products | 270 | ✅ | 1 | Product documentation |
| reports | 257 | ✅ | 1 | Audit and analysis reports |
| audits | 112 | ❌ | 1 | Audit system documentation |
| operations | 110 | ❌ | 1 | Operational docs |
| releases | 95 | ❌ | 1 | Release notes |
| deliverables | 90 | ❌ | 1 | Delivery artifacts |
| pilot | 61 | ✅ | 1 | Pilot documentation |
| systems | 39 | ❌ | 1 | Product system docs |
| auditos | 36 | ❌ | 1 | AuditOS docs |
| review | 35 | ❌ | 1 | Review documentation |
| validation | 32 | ❌ | 1 | Validation cycles |
| programs | 31 | ❌ | 1 | Governance programs |
| architecture | 25 | ❌ | 1 | Architecture docs |
| engineering | 24 | ❌ | 1 | Engineering docs |
| commercial-pack | 16 | ✅ | 1 | Commercial collateral |
| commercial | 10 | ✅ | 1 | Commercial strategy |
| official | 14 | ❌ | 1 | Official doctrine (v1.1) |
| marketing | 13 | ❌ | 1 | Marketing assets |
| governance | 9 | ❌ | 1 | Governance docs |
| deployment | 8 | ❌ | 1 | Deployment docs |
| source-of-truth | 26 | ✅ | 1 | Source of truth |
| platform | 12 | ❌ | 1 | Platform docs |
| strategy | 7 | ❌ | 1 | Strategy docs |
| runbooks | 5 | ❌ | 1 | Operations runbooks |
| 02-accounting-methodology | 7 | ❌ | 1 | Accounting methodology |
| 03-audit-methodology | 6 | ❌ | 1 | Audit methodology |
| 05-notes-system | 6 | ❌ | 1 | Notes system |
| api | 4 | ✅ | 1 | API docs |
| clients | 2 | ✅ (sunbul subdir) | 1 | Client documentation |
| content | 2 | ❌ | 1 | Content assets |
| demo | 2 | ❌ | 1 | Demo docs |
| company | 1 | ✅ | 1 | Company overview |
| ai | 0 | ❌ | 1 | AI docs (empty) |
| config-drafts | 0 | ❌ | 1 | Config drafts (empty) |
| tooling | 0 | ❌ | 1 | Tooling docs (empty) |
| notion | 1 | ✅ | 1 | Notion sync docs |
| phase0, phase2, etc. | 2-7 each | ❌ | 1 | Historical phases |
| execution | 6 | ✅ | 1 | Execution docs |
| execution-backlog | 2 | ❌ | 1 | Backlog items |
| recovery | 1 | ✅ | 1 | Recovery docs |
| refactoring | 10 | ❌ | 1 | Refactoring docs |
| remediation | 6 | ❌ | 1 | Remediation docs |
| research | 1 | ❌ | 1 | Research docs |
| reviews | 2 | ❌ | 1 | Review docs |
| strategic-* | 1-15 each | ❌ / ✅ | 1 | Strategic analysis |
| runtime-prototypes | 31 | ❌ | 1 | Prototype docs |
| tabletop-audit | 2 | ❌ | 1 | Tabletop exercises |
| technical | 3 | ❌ | 1 | Technical docs |
| final | 1 | ❌ | 1 | Final output |

### Click Depth Distribution

| Depth | Paths | Examples |
|-------|-------|----------|
| 1 | 56 directories | docs/products/ |
| 2 | Most content | docs/products/localcontentos-data-templates/README.md |
| 3 | Subdirectory content | docs/theoretical-reference/01-foundational-doctrine/01-01-core-doctrine.md |
| 4 | Nested content | docs/theoretical-reference/gateways/ai-governance-gateway.md |
| 5+ | Marketing production | docs/marketing/social-media/visual-production/proofs/week-1/post-1 |

---

## 4. Missing Index Files

The following **41 directories (73%)** lack a README.md or equivalent index file. These directories are invisible to navigation — users must guess their contents or browse raw file listings.

### Priority 1 — High-traffic, high-file-count directories

| Directory | Files | Impact of Missing README |
|-----------|-------|--------------------------|
| audits | 112 | No overview of audit documentation structure |
| operations | 110 | No operational documentation index |
| releases | 95 | Cannot browse releases by summary |
| products | 270 | Has README, but no per-product subdirectory index |
| deliverables | 90 | No delivery overview |
| auditos | 36 | No AuditOS doc entry point |
| review | 35 | No review documentation index |

### Priority 2 — Architecturally significant directories

| Directory | Files | Impact of Missing README |
|-----------|-------|--------------------------|
| architecture | 25 | No architecture overview; critical for onboarding |
| systems | 39 | No systems documentation map |
| governance | 9 | No governance documentation index |
| official | 14 | No official doc index (partially mitigated by DOCUMENTATION_AUTHORITY.md) |
| deployment | 8 | No deployment guide index |
| runbooks | 5 | No runbook index |
| engineering | 24 | No engineering process overview |
| validation | 32 | No validation overview |

### Priority 3 — Supporting directories

| Directory | Files | Notes |
|-----------|-------|-------|
| platform | 12 | Platform doc index |
| strategy | 7 | Strategy doc index |
| marketing | 13 | Marketing doc index |
| commercial | 10 | Has README — okay |
| technical | 3 | Low file count |
| All others (0-7 files) | — | Low file count, low urgency |

---

## 5. Click Depth to Key Topics

| Topic | Current Path | Click Depth | Has Dedicated README? | Notes |
|-------|-------------|-------------|----------------------|-------|
| **Product docs** | docs/products/ | 1 | ✅ | Good — direct listing |
| **Product: LocalContentOS** | docs/products/localcontentos-*/ | 2 | ✅ per subdir | Good |
| **Product: AuditOS** | docs/auditos/ | 1 | ❌ | Missing index |
| **Product: DecisionOS** | docs/systems/decisionos/ | 2 | ✅ | Good |
| **Architecture** | docs/architecture/ | 1 | ❌ | Missing index |
| **Official docs** | docs/official/ | 1 | ❌ | Missing index (mitigated by authority doc) |
| **AI docs** | docs/ai/ | 1 | ❌ | Empty directory |
| **AI knowledge** | docs/AI_KNOWLEDGE_MAP.md | 1 | ✅ | Good — dedicated AI entry |
| **Security** | docs/governance/SECURITY_REVIEW.md | 2 | ❌ | Governance dir lacks README |
| **Pilot** | docs/pilot/ | 1 | ✅ | Good |
| **Governance** | docs/governance/ | 1 | ❌ | Missing index |
| **Deployment** | docs/deployment/ | 1 | ❌ | Missing index |
| **Runbooks** | docs/runbooks/ | 1 | ❌ | Missing index |
| **Release notes** | docs/releases/ | 1 | ❌ | Missing index |
| **Source of truth** | docs/source-of-truth/ | 1 | ✅ | Good |
| **Commercial pack** | docs/commercial-pack/ | 1 | ✅ | Good |
| **Theoretical reference** | docs/theoretical-reference/ | 1 | ✅ (subdirs too) | Best-structured directory |

---

## 6. Deep Path Analysis

Paths at depth 4 or greater represent a navigation risk — users may not discover or easily return to these documents.

### Depth 4 Paths

| Path | Description | Risk |
|------|-------------|------|
| 	heoretical-reference/gateways/*.md | Cross-reference gateway files | Low — gateway dir is well-known |
| 	heoretical-reference/01-foundational-doctrine/01-01-*.md | Deep doctrine files | Low — subdir structure is documented |
| marketing/social-media/visual-production/proofs/ | Marketing proofs | Medium — discovery only through context |
| marketing/social-media/visual-production/prompts/ | Marketing prompts | Medium |
| marketing/social-media/visual-production/exports/ | Marketing exports | Low |
| marketing/social-media/visual-production/templates/ | Marketing templates | Medium |
| programs/localcontentos-production-readiness/RB-01/proofs | Program artifacts | Low — program-specific |

### Depth 5-6 Paths

| Path | Depth | Description | Risk |
|------|-------|-------------|------|
| marketing/social-media/visual-production/proofs/week-1/post-1 | 6 | Individual social post proof | Low — production automation |
| marketing/social-media/visual-production/proofs/week-1/post-2 | 6 | Individual social post proof | Low |
| marketing/social-media/visual-production/exports/week-1/ | 5 | Exports by week | Low |
| marketing/social-media/visual-production/source/week-1/ | 5 | Source assets by week | Low |

**Assessment:** Deep paths are concentrated in marketing production and program-specific directories. These are low-risk because they are automation-generated and not part of the primary docs navigation experience. All governance-critical content (official docs, source-of-truth, product docs) is at depth 1-3.

---

## 7. App Sidebar vs Doc Navigation Disconnect

### Sidebar Structure (platform-sidebar.tsx)

The application sidebar defines navigation with two sections:

**Product modules (5):**
| Module | Route | Has doc directory? | Cross-linked? |
|--------|-------|-------------------|---------------|
| AuditOS | /audit | docs/auditos/ | No |
| DecisionOS | /decisions | docs/systems/decisionos/ | No |
| WorkflowOS | /workflowos | docs/products/workflowos/ | No |
| LocalContentOS | /local-content | docs/products/localcontentos-*/ | No |
| SalesOS | /sales | docs/systems/salesos/ | No |

**Platform navigation (14 items):**
| Item | Route | Doc Coverage | Cross-linked? |
|------|-------|-------------|---------------|
| Platform Overview | /overview | docs/platform/ | No |
| Notifications | /notifications | None | N/A |
| Decision Intelligence | /decisions | docs/systems/decisionos/ | No |
| Sunbul Company | /organizations/sunbul | docs/clients/sunbul/ | No |
| Intelligence | /intelligence/sectors | None | N/A |
| Contacts | /contacts/dashboard | None | N/A |
| Settings | /settings | None | N/A |
| Governance Hub | /governance-hub | docs/governance/ | No |
| AI Governance | /settings/ai-governance | docs/governance/ai-governance.md | No |
| Operator Dashboard | /operator | None | N/A |
| Office AI Assistant | /assistant | docs/assistant/ (if it exists) | No |

### The Disconnect

1. **No cross-linking between sidebar routes and documentation directories.** A user viewing the AuditOS sidebar has no direct link to docs/auditos/.
2. **No shared information architecture.** The sidebar uses route names (/local-content) while docs use directory names (products/localcontentos-*).
3. **Unreferenced docs directories.** Several doc directories have no corresponding sidebar route (docs/engineering/, docs/deployment/, docs/operations/, etc.).
4. **No "Docs" link in the sidebar.** Users must know to navigate to /docs in the URL or find the README independently.
5. **Inconsistent naming.** LocalContentOS in sidebar vs local-content route vs localcontentos in directory name.

---

## 8. Proposed New Navigation Structure

### Principle: Unified Information Architecture

Every documentation directory should be reachable from the app sidebar through a "Documentation" entry, and every sidebar module should link to its documentation.

### Proposed Structure

`
docs/
├── README.md                                  ← Main entry (improved)
├── DOCUMENTATION_AUTHORITY.md                 ← Hierarchy authority
├── AI_ENTRYPOINT.md                           ← AI agent entry
├── AI_KNOWLEDGE_MAP.md                        ← Knowledge map
├── INDEX.md                                   ← NEW: Full directory tree index
│
├── official/              → README.md         ← NEW
├── source-of-truth/       → README.md         ← EXISTING (good)
├── governance/            → README.md         ← NEW
├── architecture/          → README.md         ← NEW
├── products/              → README.md         ← EXISTING
├── systems/               → README.md         ← NEW
├── pilot/                 → README.md         ← EXISTING
├── runbooks/              → README.md         ← NEW
├── deployment/            → README.md         ← NEW
├── operations/            → README.md         ← NEW
├── engineering/           → README.md         ← NEW
├── validation/            → README.md         ← NEW
├── releases/              → README.md         ← NEW
├── marketing/             → README.md         ← NEW
├── commercial/            → README.md         ← EXISTING
├── commercial-pack/       → README.md         ← EXISTING
├── reports/               → README.md         ← EXISTING
├── audits/                → README.md         ← NEW
├── review/                → README.md         ← NEW
├── theoretical-reference/ → README.md         ← EXISTING
└── technical/             → README.md         ← NEW
`

### App Sidebar Integration

Add a **Documentation** section to the app sidebar:

`
📚 Documentation
  ├── Official Docs        → /docs/official/
  ├── Architecture         → /docs/architecture/
  ├── Product Docs         → /docs/products/
  ├── Governance           → /docs/governance/
  ├── Runbooks             → /docs/runbooks/
  ├── Deployment           → /docs/deployment/
  ├── Release Notes        → /docs/releases/
  └── Full Index           → /docs/INDEX.md
`

And within each module's page/section, add a "Documentation" link pointing to the relevant doc directory.

---

## 9. Implementation Recommendations

### Phase 1 — Index Files (High Priority, ~2 days)

Create README.md index files for the following directories (in priority order):

1. governance/ — Index of governance docs (9 files, already contains sprint work)
2. rchitecture/ — Map of architecture documents (25 files)
3. udits/ — Overview of audit documentation (112 files)
4. operations/ — Operational doc index (110 files)
5. eleases/ — Release notes index (95 files)
6. systems/ — Systems documentation map (39 files)
7. uditos/ — AuditOS documentation index (36 files)
8. eview/ — Review documentation index (35 files)
9. alidation/ — Validation documentation index (32 files)
10. programs/ — Governance programs index (31 files)
11. engineering/ — Engineering process index (24 files)
12. unbooks/ — Runbook index (5 files)
13. deployment/ — Deployment guide index (8 files)
14. marketing/ — Marketing documentation index (13 files)
15. 	echnical/ — Technical documentation index (3 files)
16. platform/ — Platform documentation index (12 files)

### Phase 2 — Cross-Link Sidebar to Docs (Medium Priority, ~1 day)

1. Add a "Documentation" section to platform-sidebar.tsx with links to key doc directories
2. Add "View docs →" links to each module's page
3. Create docs/INDEX.md as a full directory tree index

### Phase 3 — Click Depth Reduction (Lower Priority, ~0.5 days)

1. Evaluate depth-4+ paths for restructuring
2. Move marketing production artifacts to a flatter structure or automate index generation
3. Ensure all governance-critical content is at depth ≤ 3

### README Template for New Index Files

`markdown
# Directory Name

> **Purpose:** Brief description of what this directory contains.
> **Status:** Active | Draft | Needs Review
> **Owner:** Team Name

## Contents

| File | Description |
|------|-------------|
| ilename.md | What this file covers |
| ... | ... |

## Related

- Link to related directories or entry points
`

---

## Appendix: Current README Distribution

| Category | Count |
|----------|-------|
| Total README.md files | 64 |
| Root docs/ | 1 |
| Top-level directories with README | 15 of 56 (27%) |
| Subdirectories with README | 48 |
| Directories without README | 41 (73%) |
| Theoretical-reference subdirs with README | 23 of 23 (100%) |

The 	heoretical-reference/ directory is the best-structured: every subdirectory has its own README, creating a self-contained navigation system. Other directories should follow this pattern.

---

*This analysis was conducted as part of Knowledge Governance Sprint v1, Phase 4. For metadata audit, see METADATA_AUDIT.md. For broken reference analysis, see BROKEN_REFERENCES.md.*
