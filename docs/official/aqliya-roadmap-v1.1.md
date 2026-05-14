# AQLIYA Roadmap v1.1

**Version:** 1.1
**Status:** Official execution roadmap
**Aligned with:** `aqliya-vision-v1.1.md`

---

## Phase Summary

| Phase | Name | Timeline | Status |
|---|---|---|---|
| 1 | AQLIYA Core Stabilization | Now | **In Progress** |
| 2 | AuditOS | Now | **Pilot-ready** |
| 3 | AI Abstraction | 0–3 months | Planned |
| 4 | Local AI Prototype | 0–3 months | Planned |
| 5 | LocalContentOS | 3–6 months | Strategic |
| 6 | Governance Hardening | 3–6 months | Planned |
| 7 | On-Prem Package | 6–12 months | Planned |
| 8 | AQLIYA Studio | 6–12 months | Planned |
| 9 | SalesOS + LocalContactOS | 12–18 months | Future |
| 10 | DecisionOS / RiskOS / ComplianceOS | 12–18 months | Future |
| 11 | LegalOS + GovOS | 18–24 months | Future |

---

## Phase 1: AQLIYA Core Stabilization (Current)

**Goal:** Establish AQLIYA's official identity, architecture, and product taxonomy.

**Scope:**
- AQLIYA v1.1 official vision and positioning
- AQLIYA Intelligence Core definition
- Product taxonomy and architecture baseline
- Cloud + Private deployment model framing
- Agent/skill context files

**Deliverables:**
- [x] `docs/official/aqliya-vision-v1.1.md`
- [x] `docs/official/aqliya-roadmap-v1.1.md` (this file)
- [x] `docs/official/aqliya-agent-context-v1.1.md`
- [x] `docs/official/aqliya-skill-context-v1.1.md`
- [x] `docs/official/aqliya-implementation-rules-v1.1.md`
- [x] `docs/official/aqliya-product-taxonomy-v1.1.md`
- [x] `docs/official/aqliya-core-architecture-v1.1.md`
- [x] `docs/official/aqliya-glossary-v1.1.md`
- [x] Updated README.md and docs/README.md
- [x] Aligned UI copy (metadata, sidebar labels)

**Success criteria:**
- No confusion between AQLIYA platform and any single product
- Every product clearly positioned above AQLIYA Core
- All development decisions tied to Core or an official product

---

## Phase 2: AuditOS (Current)

**Goal:** Build the first proof product on AQLIYA Core.

**Status:** Pilot-ready with known gaps (integration tests require Docker PostgreSQL, pre-existing ESLint warnings/errors in shared code, manual backup only).

**Modules delivered:**
- [x] Engagement Management
- [x] Trial Balance Upload
- [x] Account Mapping
- [x] Financial Statements
- [x] Notes Builder
- [x] Evidence Vault
- [x] Findings Management
- [x] Review Workflow
- [x] Approval Workflow
- [x] PDF/XLSX Export
- [x] Audit Trail
- [x] AI Financial Review

---

## Phase 3: AI Abstraction

**Goal:** Decouple products from single AI provider.

**First step (no schema change):**
- [ ] Define `AIProvider` interface and provider abstraction layer
- [ ] Implement Cloud AI adapter against the interface
- [ ] Build prompt registry with versioning (file-based or DB config table)
- [ ] Assess existing `AuditEvent` model for AI action log coverage
- [ ] Add AI action logging using existing audit trail (no new model)
- [ ] Implement output validation against provider interface

**Only after gap analysis confirms it is required:**
- [ ] Model configuration per environment (DB config table only if file-based is insufficient)
- [ ] Do NOT modify Prisma schema or add new models unless a documented gap analysis proves it is strictly required

---

## Phase 4: Local AI Prototype

**Goal:** Prove AQLIYA can run with local AI inside customer environment.

**Deliverables:**
- [ ] Local model runtime (Ollama/vLLM)
- [ ] Local embeddings
- [ ] Local document analysis
- [ ] Local notes/summary generation
- [ ] No-external-API mode prototype

---

## Phase 5: LocalContentOS

**Goal:** Launch second product aligned with Saudi market.

**Deliverables:**
- [ ] Local Content Dashboard
- [ ] Procurement Analyzer
- [ ] Supplier Locality Engine
- [ ] Spend Classification
- [ ] Evidence Vault
- [ ] Tender Readiness
- [ ] Commitment Tracking
- [ ] Local Content Report Builder
- [ ] AI Compliance Assistant
- [ ] Approval Workflow

---

## Phase 6: Governance Hardening

**Goal:** Strengthen shared governance across all products.

**Deliverables:**
- [ ] Permission matrix
- [ ] Access governance
- [ ] Data governance policies
- [ ] AI governance policies
- [ ] Evidence governance
- [ ] Security governance
- [ ] Model governance
- [ ] Retention policies
- [ ] Export control policies

---

## Phase 7: On-Prem Package

**Goal:** Make AQLIYA deployable inside customer environments.

**Deliverables:**
- [ ] On-Prem deployment package (Docker Compose)
- [ ] Local database setup guide
- [ ] Local file storage setup
- [ ] Local AI setup option
- [ ] Backup/restore scripts
- [ ] Install guide
- [ ] Health checks
- [ ] Security checklist

---

## Phase 8: AQLIYA Studio

**Goal:** Enable building custom institutional systems on AQLIYA Core.

**Deliverables:**
- [ ] Workflow builder
- [ ] Form builder
- [ ] Approval configuration
- [ ] Evidence model configuration
- [ ] AI prompt/action configuration
- [ ] Custom reports
- [ ] Custom roles
- [ ] Custom policies

---

## Phases 9-11: Product Expansion

**Phase 9:** SalesOS + LocalContactOS — revenue and relationship intelligence
**Phase 10:** DecisionOS / RiskOS / ComplianceOS — executive, risk, compliance
**Phase 11:** LegalOS + GovOS — legal and government intelligence

---

## What to Do NOW

1. **Stabilize AQLIYA Core identity** — prevent reduction to AuditOS
2. **Complete AuditOS** as first proof product
3. **Prepare AI Abstraction** before deep expansion
4. **Build Local AI Prototype** early (core to AQLIYA Private promise)
5. **Prepare LocalContentOS** as second Saudi-market product
6. **Strengthen shared governance** before multi-product scale
7. **Build On-Prem Package** before selling to sensitive sectors
8. **Build Studio** after Core and shared engines are clear

---

## What to AVOID

- Presenting AQLIYA as AuditOS only
- Presenting AQLIYA as AI chatbot
- Building all products simultaneously
- Launching Private/Air-Gapped without real On-Prem package
- Building Studio before Core, Governance, and Workflow are clear
- Launching any product without governance, evidence, RBAC, logs, and reporting
