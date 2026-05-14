# AQLIYA Implementation Rules v1.1

**Purpose:** Mandatory rules for any code change in the AQLIYA repository.

**Version:** 1.1
**Status:** Official — all changes MUST comply

---

## Rule 1: Do Not Break the Platform Identity

**DO:**
- Treat AQLIYA as a Private Governed Institutional Intelligence Platform
- Reference products as built on AQLIYA Core
- Maintain Cloud + Private positioning in all copy and docs
- Keep AuditOS as "the first proof product under AQLIYA"

**DO NOT:**
- Describe AQLIYA as an audit system, chatbot, or SaaS only
- Replace AQLIYA branding with product-only branding
- Remove or downplay Private/On-Prem references from docs

---

## Rule 2: Do Not Change the Database Schema Unless Strictly Required

**DO NOT:**
- Add new models for future products that are not being built now
- Add columns for hypothetical Private/On-Prem features
- Create migrations that are not tied to an active implementation task

**DO:**
- Add fields only when implementing a concrete feature
- Use the existing schema design patterns (consistent naming, audit events, tenant fields)

---

## Rule 3: Do Not Refactor Unrelated Code

**The scope of v1.1 alignment is:**
- Documentation (docs/official/, README.md, docs/README.md)
- Agent context files (AGENTS.md)
- UI/product copy alignment (metadata, headers, sidebar labels, footer)

**DO NOT:**
- Refactor AuditOS workflow logic
- Refactor DecisionOS engine
- Refactor governance framework code
- Refactor server actions
- Refactor Prisma schema
- Refactor test files
- Refactor utility libraries

---

## Rule 4: Preserve All Existing Functionality

**DO NOT:**
- Remove or disable any existing route
- Remove or disable any existing workspace (AuditOS, DecisionOS, SalesOS)
- Change route paths that existing links depend on
- Remove any existing component, action, or service

**DO:**
- Add new documentation
- Update copy/labels (metadata, headers, sidebar labels, footer)
- Add agent context files

---

## Rule 5: AI Output Boundaries

**Every AI output must be:**
- Evidence-based (linked to source data)
- Human-reviewed (shows reviewer name, timestamp)
- Permissioned (respects tenant and role)
- Auditable (has audit log entry)

**AI does NOT:**
- Make autonomous decisions
- Override human review
- Export without approval
- Operate without audit trail

---

## Rule 6: Do Not Claim Unimplemented Capabilities

**Current status — these claims are NOT YET supported by code:**
- On-Prem deployment package
- Air-Gapped mode
- Local AI runtime
- AQLIYA Studio
- Institutional Memory engine
- Model Governance registry
- LocalContentOS workspace
- SalesOS backend
- SSO/LDAP/AD integration
- SIEM integration
- Kubernetes deployment
- GPU-based local inference

**These claims ARE supported by existing code/docs:**
- Cloud SaaS deployment
- Next.js + PostgreSQL + Prisma architecture
- Role-based access (tenant guard)
- Audit trail (AuditEvent model)
- Evidence linking in AuditOS
- Workflow gating (state transitions)
- Approval workflow
- PDF/XLSX export
- Guided demo (/auditos)
- Bilingual data processing

---

## Rule 7: Version Alignment

All documentation references must point to v1.1 as the highest official reference.

**Hierarchy:**
1. `docs/official/` — v1.1 highest authority
2. `docs/source-of-truth/` — Architecture, taxonomy, routes (v1.0, aligned)
3. `docs/systems/` — Per-system details
4. `docs/theoretical-reference/` — Full theoretical foundation (v1.0)

---

## Rule 8: No Feature Implementation in This Phase

v1.1 Alignment is a **documentation and alignment** phase only.

**DO NOT:**
- Build new product features
- Add new routes, pages, or components
- Add new database models or migrations
- Implement LocalContentOS workspace
- Implement AQLIYA Studio
- Implement On-Prem packaging
- Implement Local AI integration

**THIS PHASE ONLY:**
- Creates official v1.1 reference docs
- Updates README and docs index
- Adds agent/skill context files
- Aligns UI copy/labels
