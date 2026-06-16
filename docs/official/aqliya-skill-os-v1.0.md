# AQLIYA Skill Operating System v1.0

> **Status:** Official Architecture  
> **Version:** 1.0  
> **Purpose:** Define the complete architecture for AQLIYA's institutional AI capability system — the Skill Operating System (SkillOS).  
> **Scope:** Platform-wide. Not product-specific. Survives model replacement. Works with local and cloud AI models.  
> **Constraint:** Skills are first-class governed assets, not prompts, not documentation, not product-specific logic.  
> **Reality Grounding:** This document describes the full aspirational architecture. For current implementation status, see the Reality Status section below. The Skill OS builds on ~75% existing AQLIYA AI infrastructure (AIOrchestrator, 5 AI providers, Governance Framework, Eval Framework, InstitutionalMemory, Prompt Registry, Agent Memory) — only the Skill Registry manifests, Runtime wrapper, Composition engine, and meta-skills are new.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Core Design Principles](#2-core-design-principles)
3. [Skill Taxonomy](#3-skill-taxonomy)
4. [Skill Manifest Standard](#4-skill-manifest-standard)
5. [Skill Registry](#5-skill-registry)
6. [Skill Runtime](#6-skill-runtime)
7. [Skill Composition Engine](#7-skill-composition-engine)
8. [Skill Evaluation Framework](#8-skill-evaluation-framework)
9. [Skill Governance Model](#9-skill-governance-model)
10. [Skill Builder Architecture](#10-skill-builder-architecture)
11. [Folder Structure](#11-folder-structure)
12. [Institutional Memory Integration](#12-institutional-memory-integration)
13. [Model Replacement Strategy](#13-model-replacement-strategy)
14. [Implementation Roadmap](#14-implementation-roadmap)
15. [Risks & Assumptions](#15-risks--assumptions)

---

## 0. Reality Status

### 0.1 What Already Existed (Pre-SkillOS)

| Component | Location | Status | Reused By SkillOS |
|-----------|----------|--------|-------------------|
| AI Orchestrator | `src/lib/ai/orchestrator.ts` | ✅ Production | Skill Runtime wraps this for execution |
| AI Providers (5) | `src/lib/ai/providers/` | ✅ Production | Model Adapter Layer maps directly |
| Prompt Registry | `src/lib/ai/prompt-registry.ts` | ✅ Production | Extended for skill routing |
| Governance Framework | `src/lib/governance/` | ✅ Production | Skill governance reuses types |
| Eval Framework | `src/lib/ai/eval/` | ✅ Production | Skill evaluation extends this |
| Institutional Memory | `src/lib/platform/institutional-memory/` | ✅ Production | Knowledge extraction populates this |
| Agent Memory | `src/lib/platform/agent-memory.ts` | ✅ Production | Execution context stores here |
| Platform Knowledge Graph | `prisma/schema.prisma` (KnowledgeEntity, KnowledgeRelationship) | ✅ Production | Entity extraction feeds this |

### 0.2 What Was Built (Phase 0 — This Implementation)

| Component | Location | Status | Notes |
|-----------|----------|--------|-------|
| Manifest Schema | `.skills/schemas/skill-manifest-schema.yaml` | ✅ v0.1 | Complete YAML schema for all 25 skills |
| Registry Index | `.skills/registry/index.yaml` | ✅ v0.1 | 25 skills across 5 levels registered |
| Capability Map | `.skills/registry/capability-map.yaml` | ✅ v0.1 | 6 capability categories mapped |
| Dependency Graph | `.skills/registry/dependency-graph.yaml` | ✅ v0.1 | 45 dependency edges validated |
| L0 Foundation Manifests (5) | `.skills/manifests/foundation/` | ✅ Draft | repo-analysis, doc-analysis, arch-mapping, dependency-map, knowledge-extract |
| L1 Engineering Manifests (3) | `.skills/manifests/engineering/` | ✅ Draft | security-audit, migration-audit, test-coverage |
| L4 Meta Manifests (2) | `.skills/manifests/meta/` | ✅ Draft | skill-builder, skill-evaluator |
| Access Policies | `.skills/governance/access-policies.yaml` | ✅ v0.1 | Role-based + auth + audit per level/skill |
| Lifecycle Policies | `.skills/governance/lifecycle-policies.yaml` | ✅ v0.1 | 6 transitions with gates, review cadence |
| Composition Workflow | `.skills/workflows/full-repository-audit.yaml` | ✅ v0.1 | 4-phase DAG: foundation → architecture → engineering → synthesis |
| Skill Templates (3) | `.skills/templates/` | ✅ v0.1 | analysis, review, extraction base patterns |
| AI Infrastructure Map | `docs/official/aqliya-ai-infrastructure-map-v1.0.md` | ✅ v1.0 | Full inventory of 70+ AI files across 18 subsystems |

### 0.3 What Remains (Future Phases)

| Component | Phase | Notes |
|-----------|-------|-------|
| Remaining L1 manifests (3) | Phase 1 | performance-review, release-audit, tech-debt |
| L2 Product manifests (4) | Phase 2 | auditos-review, localcontent-review, salesos-review, complianceos-review |
| L3 Business manifests (5) | Phase 2 | commercial-validation, roi-analysis, pricing-analysis, market-assessment, product-positioning |
| Remaining L4 manifests (3) | Phase 2 | skill-auditor, skill-optimizer, skill-composer |
| Skill Runtime (TypeScript) | Phase 1 | `src/lib/skill-runtime/runtime.ts` — thin wrapper around AIOrchestrator |
| Skill Composition Engine | Phase 2 | Multi-skill DAG orchestrator |
| Skill Builder (full implementation) | Phase 3 | Meta-skill that generates new skills |
| Evaluation datasets | Phase 2 | Curated test cases per skill |
| Evaluation results | Phase 2 | Baseline evaluations for all skills |
| Database-backed registry | Phase 3+ | Migration from file-based to DB |
| Institutional memory integration | Phase 4 | Feedback loops, pattern libraries |

### 0.4 Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Storage for Phase 1 | File-based YAML manifests | Zero infrastructure, immediately usable, searchable, version-controlled |
| Skill Runtime | Thin wrapper around existing AIOrchestrator | Prevent duplication — SkillOS orchestrates, IC executes |
| Prompt reuse | Extend existing PromptRegistry with skill:xxx IDs | Don't build a second prompt system |
| Governance reuse | Map skill levels to existing GovernanceTaskType | Don't duplicate governance infrastructure |
| Evaluation reuse | Extend existing Eval Framework types | Don't build a second eval system |
| Language | Arabic-first names + English identifiers | Consistent with AQLIYA platform conventions |
| L4 before L2-L3 | Build closing-the-loop skills first | Enables self-improvement; Skill Builder can generate lower-level skills |

---

## 1. Architecture Overview

### 1.1 What is the Skill Operating System?

The Skill Operating System (SkillOS) is AQLIYA's institutional layer for defining, executing, evaluating, composing, and governing AI capabilities. It is not a prompt library. It is not a documentation system. It is an executable capability platform.

SkillOS answers these questions:

- **What can the AI do?** — Capability catalog (Skill Registry)
- **How does it do it?** — Executable workflow (Skill Manifest + Runtime)
- **How well does it do it?** — Measurement framework (Skill Evaluation)
- **Who controls it?** — Governance layer (Skill Governance)
- **How does it evolve?** — Meta-capability (Skill Builder)
- **How does it survive?** — Model resilience and institutional memory

### 1.2 System Context

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AQLIYA PLATFORM                              │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │  AuditOS    │  │LocalContent │  │  SalesOS    │  ...products    │
│  │             │  │    OS       │  │             │                │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                │
│         │               │               │                          │
│         └───────────────┼───────────────┘                          │
│                         ▼                                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                 Intelligence Core (IC)                        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │  │
│  │  │ AI       │ │ Orchest- │ │ RAG      │ │ Skill Runtime  │  │  │
│  │  │ Adapter  │ │ rator    │ │ Engine   │ │ (SkillOS)      │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                         │                                           │
│                         ▼                                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   Skill Operating System                      │  │
│  │                                                               │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │  │
│  │  │Registry  │ │ Runtime  │ │Compos-   │ │   Governor     │  │  │
│  │  │          │ │          │ │ition     │ │                │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────────┘  │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │  │
│  │  │Evaluator │ │ Builder  │ │ Memory   │                    │  │
│  │  │          │ │ (meta)   │ │ Store    │                    │  │
│  │  └──────────┘ └──────────┘ └──────────┘                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.3 Skill Lifecycle

Every skill in SkillOS follows this lifecycle:

```
                    ┌──────────────┐
                    │   Concept    │  (Skill Builder generates idea)
                    └──────┬───────┘
                           ▼
                    ┌──────────────┐
                    │  Registered  │  (Manifest created, cataloged)
                    └──────┬───────┘
                           ▼
                    ┌──────────────┐
                    │   Draft      │  (Workflow defined, not tested)
                    └──────┬───────┘
                           ▼
                    ┌──────────────┐
                    │  Validated   │  (Tests pass, evaluations run)
                    └──────┬───────┘
                           ▼
                    ┌──────────────┐
                    │   Published  │  (Available for execution)
                    └──────┬───────┘
                           ▼
              ┌──────────────────────┐
              │  Active / Executing  │  (In production use)
              └──────────┬───────────┘
                         ▼
              ┌──────────────────────┐
              │  Under Review        │  (Periodic evaluation)
              └──────────┬───────────┘
                         ▼
              ┌──────────────────────┐
              │  Deprecated          │  (Replaced or obsolete)
              └──────────┬───────────┘
                         ▼
              ┌──────────────────────┐
              │  Retired             │  (Removed from registry)
              └──────────────────────┘
```

---

## 2. Core Design Principles

### Principle 1: Skills Are First-Class Assets

Skills are not byproducts or documentation. They are designed, versioned, reviewed, and audited assets with the same rigor as code, schema, or infrastructure.

### Principle 2: Skills Must Be Executable

Every skill has a defined execution workflow that produces a measurable output. A skill that cannot be executed is not a skill — it is documentation.

### Principle 3: Skills Must Be Measurable

Every skill has evaluation criteria, success metrics, and quality thresholds. Without measurement, a skill cannot be improved, compared, or trusted.

### Principle 4: Skills Must Be Versioned

Skills change over time. Versioning enables:
- Rollback when quality degrades
- A/B comparison between versions
- Audit trail of capability evolution
- Dependency management across skills

### Principle 5: Skills Must Be Composable

Skills are building blocks. Complex capabilities are compositions of simpler skills. The composition must be traceable, auditable, and governable.

### Principle 6: Skills Must Be Governed

Every skill execution is subject to:
- Permission checks (who can invoke)
- Audit logging (what happened)
- Evidence capture (why the output is what it is)
- Approval gates (when human review is required)

### Principle 7: Skills Must Evolve

Skills improve through evaluation feedback, user corrections, and the Skill Builder meta-capability. A static skill library is a dead skill library.

### Principle 8: Skills Must Survive Model Replacement

Skills are defined independent of the underlying AI model. The manifest and workflow are model-agnostic. Only the lowest-level invocation adapter touches the model. This ensures skills survive when models are upgraded, replaced, or swapped between local and cloud.

### Principle 9: Skills Must Work with Local AI Models

The Skill Runtime must operate with:
- Cloud models (GPT-4o, Claude, Gemini)
- Local models (Llama, Mistral, Qwen)
- Hybrid configurations (sensitive skills → local, complex skills → cloud)
- No external dependency for foundational skills

### Principle 10: Skills Must Support Institutional Memory

Skill outputs, evaluations, and usage patterns feed into Institutional Memory. Skills learn from past executions. Institutional Memory ensures that knowledge accumulated through skill execution is not lost when models change.

---

## 3. Skill Taxonomy

### 3.1 Taxonomy Overview

Skills are organized into five levels (L0-L4) from foundational to meta. Each level builds on the levels below it.

```
L4: Meta Skills          ┌──────────────────────────────┐
(Skill about skills)     │ Builder │ Auditor │ Optimizer│
                         │ Composer │ Evaluator          │
                         └──────────────────────────────┘
                                         │ depends on
L3: Business Skills      ┌──────────────────────────────┐
(Commercial, strategic)  │ Commercial │ ROI │ Pricing   │
                         │ Market │ Positioning          │
                         └──────────────────────────────┘
                                         │ depends on
L2: Product Skills       ┌──────────────────────────────┐
(Domain-specific)        │ AuditOS │ LocalContent │ Sales│
                         │ Compliance                   │
                         └──────────────────────────────┘
                                         │ depends on
L1: Engineering Skills   ┌──────────────────────────────┐
(Code, data, infra)      │ Security │ Migration │ Perf  │
                         │ Test Coverage │ Release │ TD  │
                         └──────────────────────────────┘
                                         │ depends on
L0: Foundation Skills    ┌──────────────────────────────┐
(Understanding, analysis)│ Repository │ Doc │ Arch      │
                         │ Dependency │ Knowledge        │
                         └──────────────────────────────┘
```

### 3.2 L0 — Foundation Skills

**Purpose:** Understand, analyze, and extract knowledge from the repository, documentation, and architecture. These are the base skills that all higher skills depend on.

#### L0.1 Repository Analysis Skill

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:foundation:repo-analysis` |
| **Purpose** | Analyze repository structure, file organization, module boundaries, and code patterns |
| **Inputs** | Repository path, target scope (optional directory/module) |
| **Outputs** | Repository map, module dependency graph, pattern inventory, file classification |
| **Dependencies** | None (self-contained) |
| **Model Requirement** | Minimal — can run with local embedding + classification |
| **Maturity Model** | L1: File listing → L2: Module mapping → L3: Dependency graph → L4: Pattern analysis → L5: Architecture inference |
| **Governance** | Read-only, no auth needed for structure, no audit required |

#### L0.2 Documentation Analysis Skill

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:foundation:doc-analysis` |
| **Purpose** | Read, classify, and cross-reference documentation across the repository |
| **Inputs** | Document paths or search terms |
| **Outputs** | Document index, cross-reference map, stale detection, terminology consistency check |
| **Dependencies** | L0.1 (repository structure) |
| **Model Requirement** | Low — classification + text analysis |
| **Maturity Model** | L1: Document listing → L2: Content extraction → L3: Cross-referencing → L4: Stale detection → L5: Consistency verification |
| **Governance** | Read-only, follows doc authority hierarchy |

#### L0.3 Architecture Mapping Skill

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:foundation:arch-mapping` |
| **Purpose** | Map architecture layers, component relationships, data flow, and service boundaries |
| **Inputs** | Repository path, architecture documentation |
| **Outputs** | Architecture model, component diagram, data flow map, boundary analysis |
| **Dependencies** | L0.1, L0.2 |
| **Model Requirement** | Medium — requires reasoning about structure |
| **Maturity Model** | L1: Route map → L2: Component map → L3: Data flow → L4: Boundary analysis → L5: Impact analysis |
| **Governance** | Read-only |

#### L0.4 Dependency Mapping Skill

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:foundation:dependency-map` |
| **Purpose** | Map dependencies between modules, packages, services, and external systems |
| **Inputs** | Repository path, package files, import analysis |
| **Outputs** | Dependency graph, circular dependency detection, unused dependency report |
| **Dependencies** | L0.1 |
| **Model Requirement** | Low — structural analysis |
| **Maturity Model** | L1: Package deps → L2: Import deps → L3: Service deps → L4: Runtime deps → L5: Impact propagation |
| **Governance** | Read-only |

#### L0.5 Knowledge Extraction Skill

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:foundation:knowledge-extract` |
| **Purpose** | Extract entities, relationships, workflows, and business rules from code, docs, and configuration |
| **Inputs** | Repository path, domain scope, extraction schema |
| **Outputs** | Knowledge graph, entity index, relationship map, business rule catalog |
| **Dependencies** | L0.1, L0.2, L0.3 |
| **Model Requirement** | Medium-High — requires semantic understanding |
| **Maturity Model** | L1: Entity extraction → L2: Relationship extraction → L3: Workflow extraction → L4: Business rule extraction → L5: Full domain model |
| **Governance** | Read-only, outputs stored for IA |

### 3.3 L1 — Engineering Skills

**Purpose:** Audit, review, and analyze code quality, security, performance, and engineering practices.

#### L1.1 Security Audit Skill

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:engineering:security-audit` |
| **Purpose** | Audit code for security issues: auth gaps, tenant isolation, exposure of secrets, injection vulnerabilities |
| **Inputs** | Repository path, scope (module/file), security policy reference |
| **Outputs** | Security finding list, severity ratings, remediation recommendations, evidence references |
| **Dependencies** | L0.1, L0.3 |
| **Model Requirement** | High — requires security knowledge |
| **Maturity Model** | L1: Pattern matching → L2: Auth audit → L3: Tenant isolation check → L4: Full security review → L5: Automated pen-test equivalent |
| **Governance** | Findings require human review before action. Audit trail required. |

#### L1.2 Migration Audit Skill

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:engineering:migration-audit` |
| **Purpose** | Analyze migration readiness, breaking changes, backward compatibility, and data integrity risks |
| **Inputs** | Source schema, target schema, migration scripts, data samples |
| **Outputs** | Migration impact report, breaking change list, data integrity risks, rollback plan |
| **Dependencies** | L0.1, L0.4 |
| **Model Requirement** | Medium |
| **Maturity Model** | L1: Schema diff → L2: Breaking change detection → L3: Data impact → L4: Rollback plan → L5: Automated migration verification |
| **Governance** | Must produce signed report. Human approval required for execution. |

#### L1.3 Performance Review Skill

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:engineering:performance-review` |
| **Purpose** | Identify performance bottlenecks, N+1 queries, memory issues, and optimization opportunities |
| **Inputs** | Code path, query logs (optional), profiling data (optional) |
| **Outputs** | Bottleneck list, query analysis, optimization recommendations, estimated impact |
| **Dependencies** | L0.1, L0.4 |
| **Model Requirement** | Medium |
| **Maturity Model** | L1: Query analysis → L2: Bundle analysis → L3: Runtime profiling → L4: Load testing review → L5: Predictive optimization |
| **Governance** | Read-only, advisory |

#### L1.4 Test Coverage Review Skill

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:engineering:test-coverage` |
| **Purpose** | Analyze test coverage, identify untested paths, and recommend test improvements |
| **Inputs** | Repository path, test reports (optional) |
| **Outputs** | Coverage gaps, critical untested paths, test quality assessment, improvement plan |
| **Dependencies** | L0.1, L0.3 |
| **Model Requirement** | Medium |
| **Maturity Model** | L1: Coverage percentage → L2: Critical path analysis → L3: Test quality assessment → L4: Integration gap analysis → L5: Automated test generation |
| **Governance** | Advisory. Test generation (L5) requires human review |

#### L1.5 Release Audit Skill

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:engineering:release-audit` |
| **Purpose** | Verify release readiness against checklist: auth, demo safety, data integrity, docs, validation |
| **Inputs** | Release scope, git diff, product status |
| **Outputs** | Release readiness report, blocker list, Go/No-Go recommendation |
| **Dependencies** | L0.1, L0.2, L1.1 |
| **Model Requirement** | Medium |
| **Maturity Model** | L1: Checklist → L2: Automated checks → L3: Dependency analysis → L4: Risk scoring → L5: Full release verification |
| **Governance** | Produces authoritative release report. Human Go/No-Go required. |

#### L1.6 Technical Debt Review Skill

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:engineering:tech-debt` |
| **Purpose** | Identify technical debt: dead code, deprecated patterns, duplicated logic, architectural drift |
| **Inputs** | Repository path, scope |
| **Outputs** | Debt inventory, severity ratings, remediation cost estimate, prioritization |
| **Dependencies** | L0.1, L0.3, L0.4 |
| **Model Requirement** | Medium |
| **Maturity Model** | L1: Pattern detection → L2: Duplication analysis → L3: Architecture drift → L4: Cost estimation → L5: Automated remediation |
| **Governance** | Advisory. Remediation requires human planning. |

### 3.4 L2 — Product Skills

**Purpose:** Domain-specific skills for AQLIYA products. These skills understand product models, workflows, and governance.

#### L2.1 AuditOS Review Skill

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:product:auditos-review` |
| **Purpose** | Review audit engagements, trial balances, financial statements, findings, and evidence for completeness and compliance |
| **Inputs** | Engagement ID, audit data, product model reference |
| **Outputs** | Completeness report, compliance gaps, risk indicators, reviewer assistance |
| **Dependencies** | L0.1, L0.3, L0.5, L1.1 |
| **Model Requirement** | High — requires domain understanding |
| **Maturity Model** | L1: Data completeness → L2: Workflow compliance → L3: Finding quality → L4: Risk assessment → L5: Full review assistance |
| **Governance** | AI output is assistive only. Cannot make final audit decisions. Must be reviewed by human auditor. Full audit trail. |

#### L2.2 LocalContentOS Review Skill

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:product:localcontent-review` |
| **Purpose** | Review local content records, supplier classifications, spend data, and scoring for compliance with Saudi local content rules |
| **Inputs** | Project ID, supplier data, classification records, scoring criteria |
| **Outputs** | Classification verification, scoring validation, gap analysis, compliance report |
| **Dependencies** | L0.5, L1.1 |
| **Model Requirement** | High — requires Saudi local content domain knowledge |
| **Maturity Model** | L1: Data validation → L2: Classification check → L3: Scoring verification → L4: Compliance audit → L5: Full regulatory review |
| **Governance** | Assistive. Human review required. Evidence must be linked. |

#### L2.3 SalesOS Review Skill

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:product:salesos-review` |
| **Purpose** | Review sales pipeline, opportunity qualification, stakeholder mapping, and sales governance |
| **Inputs** | Account ID, opportunity data, interaction history |
| **Outputs** | Qualification assessment, pipeline health, risk flags, next-action recommendations |
| **Dependencies** | L0.5, L1.1 |
| **Model Requirement** | Medium-High |
| **Maturity Model** | L1: Pipeline view → L2: Qualification review → L3: Risk detection → L4: Forecast assistance → L5: Strategic recommendations |
| **Governance** | Advisory. No autonomous pricing or commitment authority. |

#### L2.4 ComplianceOS Review Skill (Future)

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:product:complianceos-review` |
| **Purpose** | Review compliance records, regulatory obligations, control evidence, and compliance status |
| **Inputs** | Compliance framework reference, control evidence, obligation register |
| **Outputs** | Compliance gap analysis, control effectiveness, risk ratings, remediation suggestions |
| **Dependencies** | L0.5, L1.1, L1.6 |
| **Model Requirement** | High |
| **Maturity Model** | L1: Obligation mapping → L2: Control review → L3: Gap analysis → L4: Risk assessment → L5: Full compliance audit |
| **Governance** | Advisory. Human compliance officer required for sign-off. |

### 3.5 L3 — Business Skills

**Purpose:** Strategic, commercial, and market-facing skills that operate on business-level concerns.

#### L3.1 Commercial Validation Skill

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:business:commercial-validation` |
| **Purpose** | Validate commercial claims against implementation reality. Ensure no overclaiming of capabilities. |
| **Inputs** | Product status, marketing copy, feature list, route map |
| **Outputs** | Validation report, overclaim detection, correction recommendations, truthfulness score |
| **Dependencies** | L0.1, L0.2, L0.3 (implementation reality), L1.5 (release status) |
| **Model Requirement** | High — requires reasoning about claims vs reality |
| **Maturity Model** | L1: Claim extraction → L2: Reality matching → L3: Overclaim detection → L4: Full truthfulness audit → L5: Automated commercial guard |
| **Governance** | Hard gate. Overclaims must be corrected before publication. Audit trail required. |

#### L3.2 ROI Analysis Skill

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:business:roi-analysis` |
| **Purpose** | Analyze return on investment for features, products, or technical investments |
| **Inputs** | Cost data, effort estimates, benefit projections, usage metrics |
| **Outputs** | ROI calculation, break-even analysis, sensitivity analysis, recommendation |
| **Dependencies** | L0.5 |
| **Model Requirement** | Medium |
| **Maturity Model** | L1: Cost calculation → L2: Benefit estimation → L3: ROI computation → L4: Sensitivity analysis → L5: Predictive ROI |
| **Governance** | Advisory. Financial decisions require human approval. |

#### L3.3 Pricing Analysis Skill

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:business:pricing-analysis` |
| **Purpose** | Analyze pricing models, competitive positioning, and pricing strategy |
| **Inputs** | Cost structure, competitor data, market positioning, feature map |
| **Outputs** | Pricing model recommendation, tier analysis, competitive comparison |
| **Dependencies** | L0.5, L3.1 |
| **Model Requirement** | Medium-High |
| **Maturity Model** | L1: Cost analysis → L2: Competitor comparison → L3: Pricing model design → L4: Elasticity analysis → L5: Dynamic pricing |
| **Governance** | Advisory. Final pricing decisions require executive approval. |

#### L3.4 Market Assessment Skill

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:business:market-assessment` |
| **Purpose** | Assess market segments, competitive landscape, and go-to-market strategy |
| **Inputs** | Market data, competitor profiles, product capability map |
| **Outputs** | Segment analysis, competitive position, GTM recommendations, risk assessment |
| **Dependencies** | L0.5, L3.1 |
| **Model Requirement** | High |
| **Maturity Model** | L1: Segment mapping → L2: Competitor analysis → L3: Position assessment → L4: GTM strategy → L5: Market prediction |
| **Governance** | Advisory. Strategic decisions require human review. |

#### L3.5 Product Positioning Skill

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:business:product-positioning` |
| **Purpose** | Analyze and recommend product positioning, messaging, and differentiation |
| **Inputs** | Product capabilities, target segments, competitor positions, brand guidelines |
| **Outputs** | Positioning statement, messaging framework, differentiation analysis |
| **Dependencies** | L0.2, L3.1, L3.4 |
| **Model Requirement** | High |
| **Maturity Model** | L1: Feature analysis → L2: Differentiation → L3: Positioning draft → L4: Full messaging → L5: Market optimization |
| **Governance** | Consistent with brand guidelines. Requires human approval for publication. |

### 3.6 L4 — Meta Skills

**Purpose:** Skills about skills. The highest level of capability — building, auditing, optimizing, composing, and evaluating other skills.

#### L4.1 Skill Builder

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:meta:skill-builder` |
| **Purpose** | Generate new skills from repository analysis, workflow descriptions, or domain definitions |
| **Inputs** | Target domain, workflow description, reference code/docs, existing skill patterns |
| **Outputs** | Complete skill package: manifest, workflow, tests, evaluation criteria, documentation |
| **Dependencies** | All L0 skills, L4.5 (self-evaluation) |
| **Model Requirement** | Highest — requires meta-cognitive capability |
| **Maturity Model** | L1: Manifest generation → L2: Workflow generation → L3: Test generation → L4: Full skill generation → L5: Autonomous skill discovery |
| **Governance** | Generated skills must pass review before registration. Human approval required for publishing. Full audit trail. |

Full architecture in [Section 10](#10-skill-builder-architecture).

#### L4.2 Skill Auditor

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:meta:skill-auditor` |
| **Purpose** | Audit existing skills for quality, consistency, completeness, and compliance with standards |
| **Inputs** | Skill IDs, manifest files, evaluation history |
| **Outputs** | Audit report, quality score, compliance gaps, improvement recommendations |
| **Dependencies** | All L0 skills, L4.5, all manifests in registry |
| **Model Requirement** | High |
| **Maturity Model** | L1: Manifest audit → L2: Workflow audit → L3: Quality audit → L4: Consistency audit → L5: Full governance audit |
| **Governance** | Audit findings require human review. Skills below threshold are flagged. |

#### L4.3 Skill Optimizer

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:meta:skill-optimizer` |
| **Purpose** | Analyze skill execution data and optimize performance, cost, quality, and reliability |
| **Inputs** | Skill execution logs, evaluation history, performance metrics |
| **Outputs** | Optimization plan, parameter changes, workflow improvements, cost reduction |
| **Dependencies** | L4.2, all L0 skills, evaluation data store |
| **Model Requirement** | High |
| **Maturity Model** | L1: Parameter optimization → L2: Workflow optimization → L3: Cost optimization → L4: Quality optimization → L5: Autonomous optimization |
| **Governance** | Optimization changes require human approval before deployment. A/B testing required for significant changes. |

#### L4.4 Skill Composer

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:meta:skill-composer` |
| **Purpose** | Compose multiple skills into complex workflows. Handle orchestration, data passing, error handling, and sequencing. |
| **Inputs** | Target workflow description, required skills, composition parameters |
| **Outputs** | Composition manifest, orchestration plan, error handling strategy, validation results |
| **Dependencies** | All L0-L3 skills, L4.5 |
| **Model Requirement** | High — requires workflow reasoning |
| **Maturity Model** | L1: Sequential composition → L2: Parallel composition → L3: Conditional branching → L4: Error recovery → L5: Autonomous workflow generation |
| **Governance** | Compositions must be validated before execution. Human review for high-risk compositions. |

#### L4.5 Skill Evaluator

| Attribute | Value |
|-----------|-------|
| **ID** | `skill:meta:skill-evaluator` |
| **Purpose** | Evaluate any skill against its defined criteria. Generate quality scores, confidence metrics, and improvement feedback. |
| **Inputs** | Skill ID, evaluation dataset, reference outputs |
| **Outputs** | Quality score, confidence metrics, failure analysis, improvement suggestions |
| **Dependencies** | All L0 skills, evaluation framework, evaluation data |
| **Model Requirement** | High — requires objective assessment |
| **Maturity Model** | L1: Pass/fail evaluation → L2: Scored evaluation → L3: Confidence assessment → L4: Failure analysis → L5: Predictive quality |
| **Governance** | Evaluation results are immutable (append-only). Used for governance decisions. |

---

## 4. Skill Manifest Standard

### 4.1 Manifest Schema

Every skill has a manifest file that fully defines it. The manifest is the source of truth for a skill's identity, capabilities, requirements, and governance.

**File format:** YAML (`.skill.yaml`)  
**Location:** `.skills/manifests/<category>/<skill-id>.skill.yaml`  
**Validation:** Schema validation on registration

### 4.2 Complete Schema

```yaml
# ============================================================
# Skill Manifest v1.0
# ============================================================

# --- Identity ---
id: string                    # Unique skill ID: "skill:{category}:{name}"
name: string                  # Human-readable name (Arabic and English)
version: string               # Semver: "1.0.0"
description: string           # One-paragraph description
descriptionAr: string         # Arabic description

# --- Classification ---
category: string              # "foundation" | "engineering" | "product" | "business" | "meta"
level: integer                # 0 | 1 | 2 | 3 | 4
tags: string[]                # Searchable tags: ["security", "audit", "compliance", ...]
products: string[]            # Applicable products: ["auditos", "localcontent", "platform", "*"]

# --- Lifecycle ---
status: string                # "concept" | "draft" | "validated" | "published" | "deprecated" | "retired"
createdAt: string             # ISO 8601
updatedAt: string             # ISO 8601
createdBy: string             # Entity that created it (user ID or "skill-builder:v1")
owner: string                 # Responsible team/user

# --- Dependencies ---
dependencies:
  skills: string[]            # Required skill IDs: ["skill:foundation:repo-analysis"]
  models:
    minCapability: string     # Minimum model capability: "low" | "medium" | "high" | "highest"
    preferredProvider: string # "any" | "local" | "anthropic" | "openai" | "hybrid"
    localCapable: boolean     # Can this skill run with a local model?
  dataSources: string[]       # Required data sources: ["repository", "database", "filesystem"]

# --- Inputs ---
inputs:
  required:
    - name: string            # Parameter name
      type: string            # "string" | "number" | "boolean" | "object" | "array" | "file"
      description: string     # Description
      validation: string      # Optional validation rule (JSON Schema)
  optional:
    - name: string
      type: string
      description: string
      default: any            # Default value

# --- Outputs ---
outputs:
  primary:
    type: string              # Output type
    description: string       # What is produced
    schema: object            # Optional JSON Schema for output validation
  artifacts:
    - name: string            # Artifact name
      type: string            # "report" | "data" | "graph" | "file" | "action"
      description: string

# --- Execution ---
execution:
  type: string                # "workflow" | "function" | "prompt-chain" | "composite"
  workflow:                   # Required if type is "workflow"
    steps:
      - id: string
        type: string          # "prompt" | "tool" | "skill" | "decision" | "transform"
        config: object        # Step-specific configuration
        inputs: object        # Step input mapping
        outputs: object       # Step output mapping
        retry: object         # Retry configuration
        timeout: number       # Step timeout in seconds
  timeout: number             # Total execution timeout in seconds
  maxRetries: integer         # Maximum retry attempts
  retryDelay: integer         # Delay between retries in seconds

# --- Evaluation ---
evaluation:
  criteria:
    - name: string            # Criterion name
      type: string            # "accuracy" | "completeness" | "consistency" | "speed" | "cost" | "custom"
      weight: number          # 0.0 - 1.0, weights sum to 1.0
      threshold: number       # Minimum acceptable score (0.0 - 1.0)
      metric: string          # Metric identifier
  datasets:
    - name: string            # Dataset name
      path: string            # Path to dataset
      description: string     # What this dataset tests
  frequency: string           # "always" | "per-execution" | "daily" | "weekly" | "per-release"

# --- Governance ---
governance:
  access:
    roles: string[]           # Roles allowed to invoke: ["admin", "auditor", "reviewer", "system"]
    requireAuth: boolean      # Does this require authentication?
  audit:
    level: string             # "all" | "errors-only" | "summary"
    retainFor: string         # Retention period: "30d" | "90d" | "1y" | "forever"
  approval:
    required: boolean         # Does output require human approval?
    roles: string[]           # Roles that can approve
    evidenceRequired: boolean # Must output link to evidence?
  review:
    required: boolean         # Does skill itself require periodic review?
    interval: string          # Review interval: "30d" | "90d" | "180d"

# --- Documentation ---
documentation:
  quickstart: string          # Path to quickstart guide (relative to skills root)
  reference: string           # Path to reference documentation
  examples: string[]          # Paths to example files
  changelog: string           # Path to changelog

# --- Model Replacement ---
modelResilience:
  alternativeModels: string[] # Alternative models that can run this skill
  fallbackEnabled: boolean    # Can fall back to alternative model?
  localEquivalent: string     # Local model equivalent identifier
  degradationProfile: string  # "none" | "minimal" | "moderate" | "severe" (when using fallback)
```

### 4.3 Minimal Manifest (for rapid prototyping)

```yaml
# Minimal valid manifest — all fields not shown use defaults
id: "skill:engineering:security-audit"
name: "Security Audit"
version: "1.0.0"
description: "Audit code for security vulnerabilities"
category: "engineering"
level: 1
status: "draft"
execution:
  type: "workflow"
  workflow:
    steps:
      - id: "analyze"
        type: "prompt"
        config:
          prompt: "Analyze the following code for security issues..."
```

### 4.4 Manifest Validation Rules

| Rule | Constraint |
|------|-----------|
| ID uniqueness | No two skills may share an ID |
| Version format | Strict semver: `MAJOR.MINOR.PATCH` |
| Dependency DAG | No circular dependencies between skills |
| Level constraint | A skill can only depend on skills at the same or lower level |
| Input validation | Required inputs must have defined types |
| Output schema | Output type must be defined |
| Category must exist | Must be one of the five defined categories |
| Model capability match | `minCapability` must match evaluation framework |

---

## 5. Skill Registry

### 5.1 Purpose

The Skill Registry is the central catalog of all skills in the AQLIYA platform. It supports discovery, indexing, search, dependency resolution, version management, deprecation, and capability mapping.

### 5.2 Registry Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    SKILL REGISTRY                             │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Index Layer   │  │ Search Layer │  │ Dependency Graph  │   │
│  │ (file-based)  │  │ (inverted    │  │ (DAG engine)      │   │
│  │               │  │  index)      │  │                   │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Cache Layer   │  │ Capability   │  │ Lifecycle Manager │   │
│  │ (LRU)         │  │ Map          │  │ (state machine)   │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              Storage Backend                          │    │
│  │  File System (Phase 1) → Database (Phase 3+)         │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 Storage Model

#### Phase 1: File-based Registry

The file system is the source of truth for Phase 1. Each skill manifest is a file at a defined path.

**File naming convention:**
```
.skills/manifests/<category>/<skill-id>.skill.yaml
```

**Index file:**
```yaml
# .skills/registry/index.yaml
version: 1
updatedAt: "2026-06-15T00:00:00Z"
skills:
  - id: "skill:foundation:repo-analysis"
    path: "manifests/foundation/repo-analysis.skill.yaml"
    status: "published"
    version: "1.0.0"
  - id: "skill:foundation:doc-analysis"
    path: "manifests/foundation/doc-analysis.skill.yaml"
    status: "published"
    version: "1.0.0"
  ...
```

**Capability map:**
```yaml
# .skills/registry/capability-map.yaml
version: 1
capabilities:
  analysis:
    - skill:foundation:repo-analysis
    - skill:foundation:doc-analysis
    - skill:foundation:knowledge-extract
  audit:
    - skill:engineering:security-audit
    - skill:engineering:release-audit
  review:
    - skill:product:auditos-review
    - skill:product:localcontent-review
  meta:
    - skill:meta:skill-builder
    - skill:meta:skill-auditor
```

**Dependency graph:**
```yaml
# .skills/registry/dependency-graph.yaml
version: 1
edges:
  - from: "skill:foundation:doc-analysis"
    to: "skill:foundation:repo-analysis"
  - from: "skill:engineering:security-audit"
    to: "skill:foundation:repo-analysis"
  - from: "skill:product:auditos-review"
    to: "skill:foundation:knowledge-extract"
```

#### Phase 3+: Database-backed Registry

The registry migrates to a database for:
- Real-time queries
- Multi-user access
- Full-text search
- Usage analytics
- Version history

### 5.4 Registry API

```typescript
// Registry Service Interface (Phase 2+)
interface SkillRegistry {
  // Discovery
  search(query: string, filters?: Filter[]): SkillSummary[];
  listByCategory(category: string): SkillSummary[];
  listByProduct(product: string): SkillSummary[];
  listByCapability(capability: string): SkillSummary[];

  // Access
  get(id: string): SkillManifest;
  getVersion(id: string, version: string): SkillManifest;
  resolveDependencies(id: string): DependencyGraph;

  // Lifecycle
  register(manifest: SkillManifest): void;
  deprecate(id: string, reason: string): void;
  retire(id: string): void;
  updateStatus(id: string, status: SkillStatus): void;

  // Analysis
  getDependencyGraph(): Graph;
  getCapabilityMap(): CapabilityMap;
  findGaps(targetCapabilities: string[]): GapAnalysis;
}
```

### 5.5 Discovery Flow

```
User Query
    │
    ▼
┌──────────────────┐
│ Parse intent      │ ← SkillOS parses "I need to audit security"
└──────┬───────────┘
       ▼
┌──────────────────┐
│ Capability match  │ ← "audit" → security-audit, release-audit
└──────┬───────────┘
       ▼
┌──────────────────┐
│ Filter by level   │ ← L1 engineering skills
└──────┬───────────┘
       ▼
┌──────────────────┐
│ Check deps ready  │ ← repo-analysis dependency check
└──────┬───────────┘
       ▼
┌──────────────────┐
│ Return results    │ ← [security-audit:1.0.0, release-audit:1.0.0]
└──────────────────┘
```

---

## 6. Skill Runtime

### 6.1 Runtime Architecture

The Skill Runtime executes skills. It handles invocation, input passing, step execution, output generation, error handling, and retries.

```
┌──────────────────────────────────────────────────────────┐
│                    SKILL RUNTIME                          │
│                                                          │
│  Invocation ──► ┌─────────────────────────────────────┐  │
│                 │    Execution Engine                    │  │
│                 │                                       │  │
│                 │  ┌─────────┐ ┌─────────┐ ┌────────┐  │  │
│                 │  │Step     │ │Step     │ │Step    │  │  │
│                 │  │Resolver │ │ Executor│ │Router  │  │  │
│                 │  └─────────┘ └─────────┘ └────────┘  │  │
│                 │                                       │  │
│                 │  ┌─────────┐ ┌─────────┐ ┌────────┐  │  │
│                 │  │Context  │ │Memory   │ │Audit   │  │  │
│                 │  │Manager  │ │Provider │ │Logger  │  │  │
│                 │  └─────────┘ └─────────┘ └────────┘  │  │
│                 └─────────────────────────────────────┘  │
│                            │                             │
│                            ▼                             │
│                 ┌─────────────────────────────────────┐  │
│                 │    Model Adapter Layer               │  │
│                 │  ┌────────┐ ┌────────┐ ┌────────┐   │  │
│                 │  │Local   │ │Cloud   │ │Hybrid  │   │  │
│                 │  │Adapter │ │Adapter │ │Router  │   │  │
│                 │  └────────┘ └────────┘ └────────┘   │  │
│                 └─────────────────────────────────────┘  │
│                            │                             │
│                            ▼                             │
│                    Output + Artifacts                    │
└──────────────────────────────────────────────────────────┘
```

### 6.2 Execution Model

#### Invocation

Skills can be invoked in three ways:

| Method | Use Case | Trigger |
|--------|----------|---------|
| **Direct** | Single skill execution | User or system calls skill by ID with inputs |
| **Composition** | Multi-skill workflow | Composition engine calls skills as steps |
| **Event** | Reactive execution | Registry change, schedule, or system event triggers skill |

#### Input Passing

Inputs are passed as a structured context object:

```json
{
  "skillId": "skill:engineering:security-audit",
  "version": "1.0.0",
  "invocationId": "inv_abc123",
  "inputs": {
    "target": "src/app/api/download/",
    "depth": "full",
    "includeFindings": true
  },
  "context": {
    "session": { "userId": "...", "organizationId": "...", "role": "admin" },
    "trace: ["parent_workflow_id"],
    "timestamp": "2026-06-15T10:00:00Z"
  }
}
```

#### Step Execution

Each workflow step executes with:
1. **Input resolution** — map inputs from context or previous step outputs
2. **Execution** — run the step (prompt, tool, sub-skill, decision, transform)
3. **Output capture** — capture step output for downstream steps
4. **Audit** — log the step execution
5. **Error check** — handle errors or pass output forward

```typescript
interface ExecutionStep {
  id: string;
  type: 'prompt' | 'tool' | 'skill' | 'decision' | 'transform';
  
  async execute(context: ExecutionContext): Promise<StepResult> {
    const inputs = this.resolveInputs(context);
    const result = await this.run(inputs, context);
    await this.audit(result, context);
    return result;
  }
}
```

#### Prompt Steps

Prompt steps use a prompt template with variable substitution:

```yaml
- id: "analyze-code"
  type: "prompt"
  config:
    prompt: |
      You are a security auditor. Analyze the following code for vulnerabilities:
      
      Repository: {{context.repoName}}
      File: {{inputs.filePath}}
      
      Code:
      ```
      {{inputs.code}}
      ```
      
      Focus on:
      1. Authentication bypasses
      2. SQL/NoSQL injection
      3. Path traversal
      4. XSS vulnerabilities
      5. Insecure direct object references
      6. Missing authorization checks
      
      For each finding, provide:
      - Severity (Critical/High/Medium/Low)
      - Location (file:line)
      - Description
      - Remediation
    model: "primary"  # Uses configured primary model
    temperature: 0.1
    maxTokens: 4000
```

#### Tool Steps

Tool steps call predefined functions or APIs:

```yaml
- id: "read-file"
  type: "tool"
  config:
    tool: "filesystem:read"
    params:
      path: "{{inputs.target}}"
```

#### Skill Steps

Skill steps invoke sub-skills:

```yaml
- id: "analyze-repo"
  type: "skill"
  config:
    skill: "skill:foundation:repo-analysis"
    inputs:
      target: "{{inputs.target}}"
```

### 6.3 Error Handling

| Error Type | Strategy | Retry? |
|-----------|----------|--------|
| Model timeout | Exponential backoff | Yes (3x) |
| Rate limit | Wait + retry | Yes (5x) |
| Invalid input | Return validation error | No |
| Model error (server) | Retry with backoff | Yes (3x) |
| Dependency failure | Propagate error | Depends on step |
| Permission denied | Return auth error | No |

### 6.4 Execution Recording

Every execution produces a record:

```json
{
  "invocationId": "inv_abc123",
  "skillId": "skill:engineering:security-audit",
  "version": "1.0.0",
  "status": "completed",
  "startedAt": "2026-06-15T10:00:00Z",
  "completedAt": "2026-06-15T10:00:15Z",
  "duration": 15000,
  "inputs": { ... },
  "outputs": { ... },
  "steps": [
    {
      "id": "read-files",
      "status": "completed",
      "duration": 2000,
      "output": "..."
    },
    {
      "id": "analyze-code",
      "status": "completed",
      "duration": 10000,
      "output": "..."
    }
  ],
  "errors": [],
  "modelUsed": "claude-sonnet-4",
  "cost": 0.002,
  "auditLog": "audit://logs/skill-exec/abc123"
}
```

### 6.5 Model Adapter Layer

The Model Adapter Layer abstracts the AI model from the skill logic.

```typescript
interface ModelAdapter {
  // Core execution
  execute(prompt: string, config: ModelConfig): Promise<ModelResult>;
  
  // Streaming (for real-time skills)
  executeStream(prompt: string, config: ModelConfig): AsyncIterable<ModelChunk>;
  
  // Embedding (for RAG-based skills)
  embed(text: string): Promise<number[]>;
  
  // Capability check
  supports(capability: string): boolean;
  
  // Cost tracking
  estimateCost(prompt: string, config: ModelConfig): CostEstimate;
}
```

**Adapters provided:**
- `LocalAdapter` — for local models (Llama, Mistral, Qwen)
- `CloudAdapter` — for cloud models (Claude, GPT, Gemini)
- `HybridRouter` — routes based on skill sensitivity, cost, capability requirements

---

## 7. Skill Composition Engine

### 7.1 Purpose

The Skill Composition Engine orchestrates multi-skill workflows. It handles sequencing, parallel execution, data passing, error recovery, and aggregation.

### 7.2 Composition Architecture

```
┌──────────────────────────────────────────────────────────┐
│                COMPOSITION ENGINE                         │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                Workflow Parser                      │  │
│  │  Reads composition manifest → DAG of skill calls   │  │
│  └────────────────────┬───────────────────────────────┘  │
│                       ▼                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Dependency Resolver                    │  │
│  │  Resolves skill dependencies, validates versions   │  │
│  └────────────────────┬───────────────────────────────┘  │
│                       ▼                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Execution Scheduler                    │  │
│  │  Determines parallel vs sequential execution       │  │
│  └────────────────────┬───────────────────────────────┘  │
│                       ▼                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Orchestrator                           │  │
│  │  Executes steps, passes data, handles errors       │  │
│  │                                                    │  │
│  │  Skill A ──► Skill B ──► Skill C                   │  │
│  │       │          │          │                       │  │
│  │       ▼          ▼          ▼                       │  │
│  │  +--------+ +--------+ +--------+                   │  │
│  │  │ Auditing│ │Auditing│ │Auditing│                   │  │
│  │  +--------+ +--------+ +--------+                   │  │
│  │       │          │          │                       │  │
│  │       └──────────┴──────────┘                       │  │
│  │                      │                               │  │
│  │                      ▼                               │  │
│  │              +------------+                          │  │
│  │              │ Aggregator │                          │  │
│  │              +------------+                          │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### 7.3 Composition Manifest

A composition is defined as a YAML file:

```yaml
# .skills/workflows/audit-workflow.yaml
id: "workflow:full-audit"
name: "Full Audit Workflow"
version: "1.0.0"
description: "Complete audit of a repository: structure, security, migration, and release readiness"

steps:
  - id: "repo-analysis"
    skill: "skill:foundation:repo-analysis"
    inputs:
      target: "{{workflow.target}}"
    outputs:
      repoMap: "output"
  
  - id: "security-audit"
    skill: "skill:engineering:security-audit"
    dependsOn: ["repo-analysis"]
    inputs:
      target: "{{workflow.target}}"
      repoMap: "{{steps.repo-analysis.repoMap}}"
    outputs:
      securityFindings: "findings"
      securityScore: "score"
  
  - id: "migration-audit"
    skill: "skill:engineering:migration-audit"
    dependsOn: ["repo-analysis"]
    inputs:
      target: "{{workflow.target}}"
      repoMap: "{{steps.repo-analysis.repoMap}}"
    outputs:
      migrationFindings: "findings"
      migrationScore: "score"
  
  - id: "release-audit"
    skill: "skill:engineering:release-audit"
    dependsOn: ["security-audit", "migration-audit"]
    inputs:
      securityFindings: "{{steps.security-audit.securityFindings}}"
      migrationFindings: "{{steps.migration-audit.migrationFindings}}"
    outputs:
      releaseReadiness: "readiness"
  
  - id: "generate-report"
    type: "prompt"
    dependsOn: ["release-audit"]
    config:
      prompt: |
        Generate an executive audit report based on:
        
        Security Findings: {{steps.security-audit.securityFindings}}
        Migration Findings: {{steps.migration-audit.migrationFindings}}
        Release Readiness: {{steps.release-audit.releaseReadiness}}
        
        Format as a structured report with:
        1. Executive Summary
        2. Findings by category
        3. Risk assessment
        4. Recommendations
        5. Go/No-Go recommendation

parallel:
  enabled: true  # security-audit and migration-audit run in parallel

errorHandling:
  strategy: "continue-on-error"  # "fail-fast" | "continue-on-error" | "skip-dependency"
  maxRetries: 2
  fallbackOutput: "default"

audit:
  level: "all"
  evidenceCapture: true
```

### 7.4 Orchestration Patterns

| Pattern | Description | Use Case |
|---------|-------------|----------|
| **Pipeline** | Sequential, one skill feeds next | Report generation |
| **Fan-out** | Single input → multiple parallel skills | Full audit (security + migration + perf) |
| **Fan-in** | Multiple skills → aggregator | Executive report |
| **Conditional** | Branch based on previous output | If security fails → deep security audit |
| **Loop** | Iterate with feedback | Skill optimization: evaluate → improve → re-evaluate |
| **Adaptive** | Dynamically add/remove steps based on context | Smart workflow that adjusts depth |

### 7.5 Data Passing

Data between skills flows through a shared context:

```typescript
interface CompositionContext {
  workflowId: string;
  inputs: Record<string, any>;
  
  // Populated as steps execute
  steps: Map<string, StepResult>;
  
  // Global state
  errors: Error[];
  warnings: string[];
  
  // Metadata
  startedAt: number;
  completedAt?: number;
}
```

**Data mapping syntax:**
```
{{workflow.inputs.target}}         # From workflow inputs
{{steps.repo-analysis.output}}     # From step output
{{context.session.userId}}         # From execution context
{{config.maxRetries}}              # From workflow config
```

### 7.6 Error Recovery in Compositions

```
Step Fails
    │
    ▼
┌──────────────────────┐
│ Check retry policy    │
│ Max retries exceeded? │
└──────────┬───────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
  Retry         No retry
    │             │
    ▼             ▼
┌────────┐  ┌──────────────────┐
│ Backoff│  │ Error strategy?  │
│ + retry│  └──────┬───────────┘
└────┬───┘         │
     │      ┌──────┴──────┐
     │      ▼             ▼
     │  fail-fast    continue-on-error
     │      │             │
     │      ▼             ▼
     │  Abort all    Use fallback
     │  workflow     output, mark
     │               step degraded
     │                    │
     └────────────────────┘
              │
              ▼
        Log to audit
        Report in output
```

---

## 8. Skill Evaluation Framework

### 8.1 Purpose

Every skill must be measurable. The Evaluation Framework provides standardized metrics, scoring, and quality assessment for all skills.

### 8.2 Evaluation Dimensions

| Dimension | Metric | Range | Weight |
|-----------|--------|-------|--------|
| **Accuracy** | Correctness of outputs vs ground truth | 0.0 - 1.0 | 0.35 |
| **Completeness** | Coverage of expected outputs | 0.0 - 1.0 | 0.20 |
| **Consistency** | Same inputs → similar outputs | 0.0 - 1.0 | 0.15 |
| **Speed** | Execution time vs benchmark | 0.0 - 1.0 | 0.10 |
| **Cost** | Resource efficiency | 0.0 - 1.0 | 0.10 |
| **Robustness** | Handles edge cases, errors gracefully | 0.0 - 1.0 | 0.10 |

### 8.3 Scoring Framework

Each evaluation produces a scored assessment:

```yaml
# .skills/evaluations/skill:engineering:security-audit/2026-06-15-eval.yaml
evaluation:
  skillId: "skill:engineering:security-audit"
  version: "1.0.0"
  evaluatedAt: "2026-06-15T12:00:00Z"
  evaluator: "skill:meta:skill-evaluator:v1"
  dataset: "security-audit-eval-v1"

scores:
  accuracy: 0.87
  completeness: 0.92
  consistency: 0.85
  speed: 0.78
  cost: 0.95
  robustness: 0.82

compositeScore: 0.86  # Weighted average
confidence: 0.91       # Confidence in the evaluation

thresholds:
  minimum: 0.70
  target: 0.85
  excellent: 0.95
  
status: "meets-target"  # "below-minimum" | "meets-minimum" | "meets-target" | "excellent"

details:
  accuracy:
    correctFindings: 42
    totalFindings: 48
    falsePositives: 4
    falseNegatives: 2
    groundTruthVersion: "v1.2"
  
  completeness:
    expectedCategories: 6
    coveredCategories: 6
    missingCategories: []
  
  consistency:
    trials: 5
    score: 0.85
    variance: 0.03

improvements:
  - dimension: "speed"
    recommendation: "Optimize file reading step — batch reads reduce iterations"
    estimatedImpact: 0.15
    priority: "medium"
```

### 8.4 Evaluation Types

| Type | When | Method |
|------|------|--------|
| **Pre-registration** | Before skill is published | Synthetic dataset, ground truth comparison |
| **Per-execution** | Every time skill runs | Self-assessment, consistency check |
| **Periodic** | Scheduled (daily/weekly) | Full evaluation against evaluation dataset |
| **Regression** | After skill or model change | Compare against previous evaluation results |
| **Championship** | Model comparison | Run same skill on multiple models, compare |
| **Drift detection** | Continuous | Monitor quality metrics over time for degradation |

### 8.5 Evaluation Datasets

Each skill can have one or more evaluation datasets:

```
.skills/evaluations/<skill-id>/
├── datasets/
│   ├── v1.yaml              # Dataset version 1
│   ├── v2.yaml              # Dataset version 2
│   └── regression.yaml      # Regression test cases
├── results/
│   ├── 2026-06-01-eval.yaml
│   ├── 2026-06-08-eval.yaml
│   └── 2026-06-15-eval.yaml
└── drift/
    ├── accuracy-trend.yaml
    └── quality-trend.yaml
```

### 8.6 Quality Thresholds

| Score Range | Label | Action |
|-------------|-------|--------|
| 0.00 - 0.49 | **Critical** | Skill is auto-flagged. Cannot be used in production. Notify owner. |
| 0.50 - 0.69 | **Below Minimum** | Skill is degraded. Can be used with warnings. Scheduled review required. |
| 0.70 - 0.84 | **Meets Minimum** | Usable. Standard monitoring. |
| 0.85 - 0.94 | **Meets Target** | Good quality. Target for most skills. |
| 0.95 - 1.00 | **Excellent** | Exceptional quality. May be used as reference for other skills. |

### 8.7 Drift Detection

Quality drift is detected by tracking scores over time:

```
Score
 1.0 │
     │        ★              ★ ← model upgrade
 0.9 │  ★  ★  ★  ★  ★  ★  ★
     │                    ↘
 0.8 │                     ★ ← drift detected
     │                      ↘  
 0.7 │                       ★ ← below threshold
     │
     └─────────────────────────────── Time
        Week1 Week2 Week3 Week4 Week5
```

**Drift response:**
1. Detect: quality drops below threshold or drops >0.10 in one dimension
2. Analyze: identify root cause (model change? data change? usage pattern?)
3. Decide: rollback model, retrain skill, update workflow, or deprecate
4. Execute: implement the decision
5. Verify: re-evaluate after fix

---

## 9. Skill Governance Model

### 9.1 Governance Principles

1. **Every skill has an owner** — a person or team responsible for its quality and compliance
2. **Every execution is audited** — who ran what, when, with what inputs and outputs
3. **Every output is reviewable** — human review capability for any skill output
4. **Skills have access controls** — not every role can invoke every skill
5. **Skills have lifecycle governance** — review, approval, deprecation, retirement
6. **Governance is itself auditable** — governance actions are also logged

### 9.2 Access Control Model

```yaml
# .skills/governance/access-policies.yaml
policies:
  - skill: "skill:foundation:*"       # All foundation skills
    roles: ["admin", "developer", "auditor", "reviewer", "system"]
    authRequired: false               # Low sensitivity
    
  - skill: "skill:engineering:*"      # All engineering skills
    roles: ["admin", "developer", "auditor"]
    authRequired: true
    
  - skill: "skill:product:auditos-review"
    roles: ["admin", "auditor"]        # Restricted to audit roles
    authRequired: true
    approvalRequired: true            # Output requires human approval
    
  - skill: "skill:product:salesos-review"
    roles: ["admin", "sales-manager"]
    authRequired: true
    
  - skill: "skill:business:*"         # All business skills
    roles: ["admin", "executive"]
    authRequired: true
    approvalRequired: true            # Business outputs are sensitive
    
  - skill: "skill:meta:skill-builder"
    roles: ["admin", "ai-engineer"]
    authRequired: true
    auditLevel: "all"                 # Every step is audited
```

### 9.3 Lifecycle Governance

| Stage | Entry Criteria | Actions | Approver |
|-------|---------------|---------|----------|
| **Concept** | Idea documented | Create manifest, set status=concept | None |
| **Draft** | Manifest complete | Author develops workflow | Owner |
| **Validated** | Evaluation passes minimum threshold | Run evaluation, set status=validated | Skill Auditor (L4.2) |
| **Published** | Review complete | Set status=published, register in catalog | Governance Board |
| **Active** | Published + first execution | Routine monitoring | Owner |
| **Under Review** | Scheduled review or triggered | Full evaluation, comparison against targets | Skill Auditor |
| **Deprecated** | Replacement exists or quality degraded | Set status=deprecated, notify users | Governance Board |
| **Retired** | Deprecated period ends | Remove from active registry, archive | Governance Board |

### 9.4 Review Cadence

| Skill Level | Review Interval | Triggered Review Threshold |
|-------------|----------------|---------------------------|
| L0 Foundation | Every 180 days | Quality drops below 0.70 |
| L1 Engineering | Every 90 days | Quality drops below 0.75 |
| L2 Product | Every 60 days | Quality drops below 0.80 |
| L3 Business | Every 30 days | Quality drops below 0.80 |
| L4 Meta | Every 30 days | Any dimension drops below 0.85 |

### 9.5 Audit Trail

Every skill execution, lifecycle change, and governance action is logged:

```json
{
  "auditId": "audit_xyz789",
  "timestamp": "2026-06-15T10:00:00Z",
  "action": "skill.execute",
  "actor": {
    "type": "user",
    "id": "user_abc",
    "role": "auditor"
  },
  "resource": {
    "type": "skill",
    "id": "skill:engineering:security-audit",
    "version": "1.0.0"
  },
  "context": {
    "invocationId": "inv_abc123",
    "workflowId": "workflow:full-audit",
    "organizationId": "org_demo"
  },
  "changes": null,
  "metadata": {
    "duration": 15000,
    "model": "claude-sonnet-4",
    "cost": 0.002
  }
}
```

### 9.6 Responsibility Matrix

| Role | Responsibilities |
|------|-----------------|
| **Skill Owner** | Maintains skill quality. Reviews evaluation results. Approves minor updates. |
| **Governance Board** | Approves publications, deprecations, retirements. Sets governance policy. |
| **Skill Auditor** | Evaluates skills. Performs reviews. Flags quality issues. |
| **Security Officer** | Reviews security-related skills. Sets security policy. |
| **Product Owner** | Defines product-skill requirements. Validates product skill outputs. |
| **Developer** | Creates skills via Skill Builder. Fixes skill issues. |

---

## 10. Skill Builder Architecture

### 10.1 Purpose

The Skill Builder is the most important meta-capability. It enables the AI to generate complete, production-grade skills from descriptions of domains, workflows, or requirements. This is not a code generator — it is a capability generator.

### 10.2 Skill Builder Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     SKILL BUILDER                             │
│                     (L4 Meta Skill)                           │
│                                                              │
│  Input ──► ┌────────────────────────────────────────────┐   │
│  Domain/   │            Analyzer Phase                    │   │
│  Workflow  │  ┌────────┐ ┌────────┐ ┌────────────────┐  │   │
│  /Repo     │  │Domain  │ │Pattern │ │Capability Gap   │  │   │
│            │  │Parser  │ │Matcher │ │Detector         │  │   │
│            │  └────────┘ └────────┘ └────────────────┘  │   │
│            └───────────────────┬────────────────────────┘   │
│                                ▼                            │
│            ┌────────────────────────────────────────────┐   │
│            │            Design Phase                     │   │
│            │  ┌────────┐ ┌────────┐ ┌────────────────┐  │   │
│            │  │Skill   │ │Workflow│ │Input/Output     │  │   │
│            │  │Archi-  │ │Designer│ │Schema Designer  │  │   │
│            │  │tect    │ │        │ │                  │  │   │
│            │  └────────┘ └────────┘ └────────────────┘  │   │
│            └───────────────────┬────────────────────────┘   │
│                                ▼                            │
│            ┌────────────────────────────────────────────┐   │
│            │            Generation Phase                 │   │
│            │  ┌────────┐ ┌────────┐ ┌────────────────┐  │   │
│            │  │Manifest│ │Workflow│ │Test Cases       │  │   │
│            │  │Writer  │ │Writer  │ │Generator        │  │   │
│            │  └────────┘ └────────┘ └────────────────┘  │   │
│            │  ┌────────┐ ┌────────┐ ┌────────────────┐  │   │
│            │  │Eval    │ │Doc     │ │Governance       │  │   │
│            │  │Writer  │ │Writer  │ │Rules Generator  │  │   │
│            │  └────────┘ └────────┘ └────────────────┘  │   │
│            └───────────────────┬────────────────────────┘   │
│                                ▼                            │
│            ┌────────────────────────────────────────────┐   │
│            │            Validation Phase                 │   │
│            │  ┌────────┐ ┌────────┐ ┌────────────────┐  │   │
│            │  │Manifest│ │Workflow│ │Evaluation      │  │   │
│            │  │Validator│ │Tester  │ │Runner          │  │   │
│            │  └────────┘ └────────┘ └────────────────┘  │   │
│            └───────────────────┬────────────────────────┘   │
│                                ▼                            │
│                         Output: Complete Skill Package      │
└──────────────────────────────────────────────────────────────┘
```

### 10.3 Builder Inputs

The Skill Builder accepts diverse input types:

| Input Type | Example | Description |
|-----------|---------|-------------|
| **Repository** | `repository: .` | Analyze repository and generate skills for it |
| **Module** | `module: src/lib/audit` | Generate skill for a specific code module |
| **Workflow** | `workflow: "review finding → assign to auditor → approve → export"` | Generate skill from workflow description |
| **Domain** | `domain: "Saudi local content compliance"` | Generate skill for a business domain |
| **Existing Skill** | `evolve: skill:engineering:security-audit` | Improve or extend an existing skill |
| **Product** | `product: auditos` | Generate all skills needed by a product |

### 10.4 Builder Output

The Skill Builder produces a complete skill package:

```
.skills/skills/<category>/<skill-id>/
├── manifest.yaml                 # Skill manifest
├── workflow.yaml                 # Execution workflow
├── prompts/                      # Prompt templates
│   ├── step-1-prompt.md
│   ├── step-2-prompt.md
│   └── step-3-prompt.md
├── tests/                        # Test cases and datasets
│   ├── test-cases.yaml
│   ├── fixtures/
│   │   ├── input-sample-1.json
│   │   └── expected-output-1.json
│   └── test-runner.js
├── evaluation/                   # Evaluation configuration
│   ├── criteria.yaml
│   ├── datasets/
│   │   └── v1.yaml
│   └── thresholds.yaml
├── governance/                   # Governance rules
│   ├── access-policy.yaml
│   ├── audit-rules.yaml
│   └── approval-rules.yaml
└── docs/                         # Documentation
    ├── README.md
    ├── quickstart.md
    ├── reference.md
    └── examples/
        └── basic-usage.md
```

### 10.5 Builder Generation Workflow

```
Step 1: Analyze
├── Parse input (repository, workflow, domain)
├── Identify existing patterns (if repo given)
├── Detect capability gaps
└── Generate skill architecture

Step 2: Design
├── Design manifest structure
├── Design workflow steps
├── Design input/output schemas
└── Design evaluation criteria

Step 3: Generate
├── Write manifest YAML
├── Write workflow YAML
├── Write prompt templates
├── Write test cases
├── Write evaluation configuration
├── Write governance rules
└── Write documentation

Step 4: Validate
├── Validate manifest against schema
├── Validate workflow (DAG check)
├── Validate prompt templates (variable check)
├── Run test cases (if evaluable)
└── Generate validation report

Step 5: Register (if approved)
├── Register in skill registry
├── Set status = "draft"
└── Notify skill owner for review
```

### 10.6 Skill Templates

The Skill Builder uses templates as base patterns:

```
.skills/templates/
├── foundation/
│   ├── analysis-skill.yaml        # Base pattern for analysis skills
│   └── extraction-skill.yaml      # Base pattern for extraction skills
├── engineering/
│   ├── audit-skill.yaml           # Base pattern for audit skills
│   └── review-skill.yaml          # Base pattern for review skills
├── product/
│   ├── domain-review-skill.yaml   # Base pattern for product reviews
│   └── compliance-check.yaml      # Base pattern for compliance
├── business/
│   ├── analysis-skill.yaml        # Base pattern for business analysis
│   └── strategy-skill.yaml        # Base pattern for strategy
└── meta/
    └── builder-template.yaml      # Template for new builder outputs
```

### 10.7 Self-Improvement Loop

The Skill Builder is the only skill that can improve itself:

```
Skill Builder v1.0
    │
    ▼
Execute → Generate Skill X
    │
    ▼
Evaluate Skill X against criteria
    │
    ▼
Identify builder weakness
    │
    ▼
Skill Builder v1.1 (self-generated)
    │
    ▼
Execute → Generate Better Skills
```

This is the highest-order meta-capability and is gated by strict governance in Phase 4+.

---

## 11. Folder Structure

### 11.1 Complete Structure

```
.skills/                                    # Skill Operating System root
│
├── README.md                               # Entry point, quick reference
│
├── aqliya/                                 # EXISTING: Agent operating skills (7 files)
│   ├── aqliya-opencode-agent.md
│   ├── aqliya-security-gate.md
│   ├── aqliya-low-load-dev.md
│   ├── aqliya-docs-authority.md
│   ├── aqliya-demo-safety.md
│   ├── aqliya-product-completion.md
│   ├── aqliya-release-checklist.md
│   └── aqliya-parallel-director.md
│
├── registry/                               # Skill Registry
│   ├── index.yaml                          # Master index of all skills
│   ├── capability-map.yaml                 # Capability → skills mapping
│   ├── dependency-graph.yaml               # Dependency edges
│   └── search-index.yaml                   # Inverted search index
│
├── manifests/                              # Skill Manifest definitions
│   ├── foundation/
│   │   ├── repo-analysis.skill.yaml
│   │   ├── doc-analysis.skill.yaml
│   │   ├── arch-mapping.skill.yaml
│   │   ├── dependency-map.skill.yaml
│   │   └── knowledge-extract.skill.yaml
│   ├── engineering/
│   │   ├── security-audit.skill.yaml
│   │   ├── migration-audit.skill.yaml
│   │   ├── performance-review.skill.yaml
│   │   ├── test-coverage.skill.yaml
│   │   ├── release-audit.skill.yaml
│   │   └── tech-debt.skill.yaml
│   ├── product/
│   │   ├── auditos-review.skill.yaml
│   │   ├── localcontent-review.skill.yaml
│   │   ├── salesos-review.skill.yaml
│   │   └── complianceos-review.skill.yaml
│   ├── business/
│   │   ├── commercial-validation.skill.yaml
│   │   ├── roi-analysis.skill.yaml
│   │   ├── pricing-analysis.skill.yaml
│   │   ├── market-assessment.skill.yaml
│   │   └── product-positioning.skill.yaml
│   └── meta/
│       ├── skill-builder.skill.yaml
│       ├── skill-auditor.skill.yaml
│       ├── skill-optimizer.skill.yaml
│       ├── skill-composer.skill.yaml
│       └── skill-evaluator.skill.yaml
│
├── evaluations/                            # Skill Evaluation data
│   ├── skill:foundation:repo-analysis/
│   │   ├── datasets/
│   │   │   └── v1.yaml
│   │   ├── results/
│   │   │   └── 2026-06-15-eval.yaml
│   │   └── drift/
│   │       └── quality-trend.yaml
│   ├── skill:engineering:security-audit/
│   │   ├── datasets/
│   │   │   └── v1.yaml
│   │   └── results/
│   │       └── 2026-06-15-eval.yaml
│   └── ...                                 # Per-skill evaluation data
│
├── governance/                             # Governance policies
│   ├── access-policies.yaml                # Role-based access rules
│   ├── lifecycle-policies.yaml             # Lifecycle transition rules
│   ├── review-schedule.yaml                # Review cadence configuration
│   ├── audit-config.yaml                   # Audit logging configuration
│   └── approval-matrix.yaml                # Approval requirements per level
│
├── workflows/                              # Composition workflow definitions
│   ├── core/
│   │   ├── full-repository-audit.yaml      # Repo → Arch → Security → Report
│   │   ├── pre-release-check.yaml          # Release audit workflow
│   │   └── product-health-check.yaml       # Multi-product health workflow
│   ├── product/
│   │   ├── auditos-review-flow.yaml        # AuditOS-specific workflow
│   │   ├── localcontent-review-flow.yaml   # LocalContentOS workflow
│   │   └── salesos-review-flow.yaml        # SalesOS workflow
│   └── meta/
│       ├── skill-creation-flow.yaml        # Skill Builder workflow
│       └── skill-evaluation-flow.yaml      # Skill evaluation workflow
│
├── templates/                              # Skill Builder templates
│   ├── foundation/
│   │   ├── analysis-skill.yaml
│   │   └── extraction-skill.yaml
│   ├── engineering/
│   │   ├── audit-skill.yaml
│   │   └── review-skill.yaml
│   ├── product/
│   │   ├── domain-review-skill.yaml
│   │   └── compliance-check.yaml
│   ├── business/
│   │   ├── analysis-skill.yaml
│   │   └── strategy-skill.yaml
│   └── meta/
│       ├── builder-template.yaml
│       └── evaluator-template.yaml
│
├── skills/                                 # Executable skill implementations
│   ├── foundation/
│   │   ├── repo-analysis/
│   │   │   ├── prompts/
│   │   │   ├── tests/
│   │   │   └── docs/
│   │   └── ... 
│   ├── engineering/
│   │   ├── security-audit/
│   │   │   ├── prompts/
│   │   │   ├── tests/
│   │   │   └── docs/
│   │   └── ...
│   ├── product/
│   │   ├── auditos-review/
│   │   └── ...
│   ├── business/
│   │   └── ...
│   └── meta/
│       ├── skill-builder/
│       └── ...
│
└── archive/                                # Deprecated/retired skills
    └── ...                                 # Historical skill versions
```

### 11.2 Folder Purpose Summary

| Folder | Purpose | Status |
|--------|---------|--------|
| `aqliya/` | Agent operating skills (existing) | ✅ Existing |
| `schemas/` | Canonical manifest schema | ✅ Phase 0 |
| `registry/` | Central catalog, capability maps, dependency graph | ✅ Phase 0 |
| `manifests/` | Skill definitions (YAML) — 10 of 25 done | ✅ Phase 0 (partial) |
| `governance/` | Access control, lifecycle, audit config | ✅ Phase 0 |
| `workflows/` | Composition definitions — 1 done | ✅ Phase 0 (partial) |
| `templates/` | Skill Builder templates — 3 base patterns | ✅ Phase 0 |
| `evaluations/` | Evaluation results, datasets, drift data | 📅 Phase 2 |
| `skills/` | Executable implementations (future runtime) | 📅 Phase 1 |
| `archive/` | Historical versions | 📅 Phase 2 |

### 11.3 File Naming Conventions

| Asset | Convention | Example |
|-------|-----------|---------|
| Manifest | `<skill-id>.skill.yaml` | `security-audit.skill.yaml` |
| Workflow | `<workflow-id>.yaml` | `full-repository-audit.yaml` |
| Evaluation | `<date>-eval.yaml` | `2026-06-15-eval.yaml` |
| Dataset | `v<version>.yaml` | `v1.yaml` |
| Prompt | `<step-id>-prompt.md` | `analyze-code-prompt.md` |
| Policy | `<policy-type>.yaml` | `access-policies.yaml` |
| Template | `<template-name>.yaml` | `audit-skill.yaml` |

---

## 12. Institutional Memory Integration

### 12.1 Purpose

Institutional Memory (IM) is the layer that preserves knowledge across model changes, skill versions, and user interactions. It ensures that what the AI learns through skill execution is not lost when models are replaced.

### 12.2 Memory Types

| Memory Type | Content | Retention | Access |
|-------------|---------|-----------|--------|
| **Execution History** | Skill invocation records, inputs, outputs | 90 days | System only |
| **Evaluation History** | Quality scores, drift data, improvement records | Forever | Governance, Auditors |
| **User Corrections** | Corrections provided to skill outputs | 180 days | Skill Builder, Skill Optimizer |
| **Feedback Loops** | User ratings, human review outcomes | 180 days | Skill Evaluator |
| **Pattern Libraries** | Repeatedly useful patterns, edge cases discovered | Forever | Skill Builder, all skills |
| **Model Profiles** | Model performance per skill type | Forever | Runtime, Hybrid Router |
| **Knowledge Graphs** | Extracted entities, relationships, workflows | Forever | All skills |
| **Failure Records** | Errors, edge cases, failure modes | 1 year | Skill Optimizer |

### 12.3 Integration Points

```
Skill Execution
    │
    ├──► Execution Record → IM Store (execution history)
    │
    ├──► User Correction → IM Store (correction → pattern library)
    │
    ├──► Feedback → IM Store (quality feedback → evaluator)
    │
    ▼
Skill Evaluation
    │
    ├──► Evaluation Results → IM Store (trend → drift detection)
    │
    ▼
Skill Builder
    │
    ├──► Pattern Library → Better skill generation
    │
    ▼
Model Replacement
    │
    ├──► IM Store → New model adapts via stored patterns
```

### 12.4 Model Replacement Survival

When a model is replaced (upgrade, swap, local migration):

1. **Skill manifests survive** — model-agnostic definitions
2. **Workflows survive** — steps defined independently of model
3. **Prompts may need adaptation** — IM stores prompt effectiveness per model
4. **Evaluation baselines survive** — comparison possible across model versions
5. **Knowledge graphs survive** — extracted knowledge not dependent on model
6. **Failure patterns survive** — known issues inherited by new model
7. **Model adapter swaps** — only the adapter layer changes

---

## 13. Model Replacement Strategy

### 13.1 Design for Replacement

Every component in SkillOS is designed to be model-agnostic:

```
┌────────────────────┐     ┌──────────────────┐
│ Skill Manifest     │     │ Workflow          │
│ (model-agnostic)   │     │ (model-agnostic)  │
└────────┬───────────┘     └────────┬─────────┘
         │                         │
         ▼                         ▼
┌──────────────────────────────────────────────┐
│           Execution Engine                    │
│         (model-agnostic orchestration)         │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│           Model Adapter Layer                 │
│   ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│   │ Adapter  │ │ Adapter  │ │ Adapter    │  │
│   │ Claude   │ │ GPT      │ │ Local      │  │
│   └──────────┘ └──────────┘ └────────────┘  │
│              (swap adapters, not skills)       │
└──────────────────────────────────────────────┘
```

### 13.2 Model Replacement Protocol

```
┌────────────────────────────┐
│ Model Replacement Needed   │
│ (upgrade, swap, localize)  │
└───────────┬────────────────┘
            ▼
┌────────────────────────────┐
│ 1. Record current baselines │ ← Run evaluations on ALL skills
│    with current model       │    Store in IM
└───────────┬────────────────┘
            ▼
┌────────────────────────────┐
│ 2. Deploy new model         │
│    adapter                  │
└───────────┬────────────────┘
            ▼
┌────────────────────────────┐
│ 3. Run championship         │ ← Compare: same skills, both models
│    evaluation               │    Score differences recorded
└───────────┬────────────────┘
            ▼
┌────────────────────────────┐
│ 4. Identify drift           │ ← Which skills degraded? Which improved?
└───────────┬────────────────┘
            ▼
┌────────────────────────────┐
│ 5. Adapt affected skills    │ ← Update prompts for new model
│    (prompt adaptation)      │    Use IM patterns as reference
└───────────┬────────────────┘
            ▼
┌────────────────────────────┐
│ 6. Re-evaluate adapted       │ ← Verify restoration of quality
│    skills                   │
└───────────┬────────────────┘
            ▼
┌────────────────────────────┐
│ 7. Promote new model        │ ← When quality >= baselines
│    to production            │    Update model registry
└────────────────────────────┘
```

### 13.3 Fallback Strategy

| Scenario | Fallback | Impact |
|----------|----------|--------|
| New model degraded | Rollback to previous model | Minimal (quick rollback) |
| Cloud model unavailable | Switch to local model | May reduce quality for complex skills |
| Local model insufficient | Route to cloud model | Latency increase, cost increase |
| Specific skill degraded | Route only that skill to old model | Operational complexity |

---

## 14. Implementation Roadmap

### 14.1 Phase 0: Foundation Complete (Week 0 — Delivered 2026-06-15)

**Goal:** File-based Skill OS foundation with manifests, registry, governance, workflow templates. All built on existing IC infrastructure.

| Deliverable | Status | Details |
|-------------|--------|---------|
| Manifest schema | ✅ Done | Full YAML schema at `.skills/schemas/skill-manifest-schema.yaml` |
| Registry index | ✅ Done | 25 skills registered at `.skills/registry/index.yaml` |
| Capability map | ✅ Done | 6 capability categories at `.skills/registry/capability-map.yaml` |
| Dependency graph | ✅ Done | 45 edges at `.skills/registry/dependency-graph.yaml` |
| L0 Foundation manifests (5) | ✅ Done | repo-analysis, doc-analysis, arch-mapping, dependency-map, knowledge-extract |
| L1 Engineering manifests (3) | ✅ Done | security-audit, migration-audit, test-coverage |
| L4 Meta manifests (2) | ✅ Done | skill-builder, skill-evaluator |
| Access policies | ✅ Done | Role-based + auth + audit per level |
| Lifecycle policies | ✅ Done | 6 transitions, review cadence, quality thresholds |
| Composition workflow | ✅ Done | `full-repository-audit.yaml` (4-phase DAG) |
| Skill templates (3) | ✅ Done | analysis, review, extraction base patterns |
| AI infrastructure map | ✅ Done | Full inventory of 70+ AI files across 18 subsystems |
| Architecture doc updated | ✅ Done | Reality-grounded with status notes |

**Phase 0 Success Criteria (Met ✅):**
- 10 skill manifests created with full execution workflows
- Registry index with capability map and dependency graph
- Governance policies for all levels
- 1 composition workflow defined
- 3 skill builder templates ready
- All documentation aligned

### 14.2 Phase 1: Minimum Viable Runtime (Next)

**Goal:** Foundation and Engineering skills executable. Skill Runtime TypeScript implementation. Remaining L1 manifests.

| Task | Details |
|------|---------|
| Remaining L1 manifests (3) | performance-review, release-audit, tech-debt |
| Skill Runtime | `src/lib/skill-runtime/runtime.ts` — thin wrapper around AIOrchestrator |
| First execution | Run repo-analysis or security-audit via runtime |
| Light validation | `npx tsc --noEmit`, `npm test`

### 14.3 Phase 2: Evaluation & Governance (Next+)

**Goal:** All skills measurable. Product and Business skills added. Evaluation framework operational.

| Week | Deliverables |
|------|-------------|
| 5 | **Evaluation framework**: scoring engine, evaluation datasets |
| 5 | **L2 Product manifests**: 4 product skill manifests |
| 6 | **L3 Business manifests**: 5 business skill manifests |
| 6 | **Evaluation results**: all Phase 1 skills evaluated |
| 7 | **Drift detection**: monitoring infrastructure |
| 7 | **Composition engine**: workflow definitions, orchestration |
| 8 | **Phase 2 validation**: all skills evaluated, compositions run |

**Phase 2 Scope:**
- L2 Product manifests (4): auditos-review, localcontent-review, salesos-review, complianceos-review
- L3 Business manifests (5): commercial-validation, roi-analysis, pricing-analysis, market-assessment, product-positioning
- Remaining L4 Meta manifests (3): skill-auditor, skill-optimizer, skill-composer
- Evaluation datasets and baseline evaluations
- Skill Composition Engine
- Drift detection infrastructure

**Phase 2 Success Criteria:**
- 20 skill manifests (all L0-L3) registered and valid
- Evaluation framework scores all skills
- At least 5 skills have evaluation datasets
- Composition engine can run a 3-skill workflow
- Drift detection baseline established

**Phase 2 Risk:**
- Evaluation data quality — poor datasets lead to misleading scores
- Mitigation: Start with human-curated evaluation datasets, add automation gradually

### 14.4 Phase 3: Skill Builder

**Goal:** Meta-skills operational. Skill Builder can generate L0-L1 skills.

| Week | Deliverables |
|------|-------------|
| 9 | **L4 Meta manifests**: 5 meta skill manifests |
| 9 | **Skill Builder v1**: analyzer + designer + generator phases |
| 10 | **Skill Builder validation**: generate 3 new skills from descriptions |
| 10 | **Skill Auditor**: audit existing skills, produce reports |
| 11 | **Skill Composer**: compose multi-skill workflows |
| 11 | **Skill Evaluator v1**: automated evaluation of any skill |
| 12 | **Phase 3 validation**: Skill Builder generates production-grade skills |

**Phase 3 Success Criteria:**
- All 25 skill manifests registered
- Skill Builder generates valid L0-L1 skills from descriptions
- Skill Auditor produces accurate audit reports
- Skill Composer can execute 5-skill parallel workflows
- Evaluation covers all published skills

**Phase 3 Risk:**
- Skill Builder generates low-quality skills that need heavy editing
- Mitigation: Build with templates first, add free generation only when templates validated

### 14.5 Phase 4: Institutional Memory

**Goal:** Memory store operational. Model replacement protocol tested.

| Week | Deliverables |
|------|-------------|
| 13 | **Memory store**: execution history, evaluation history, feedback storage |
| 14 | **Pattern library**: automated extraction from execution data |
| 14 | **User correction loop**: corrections feed back into skill improvement |
| 15 | **Model replacement protocol**: documented and tested |
| 15 | **Championship evaluation**: complete model comparison framework |
| 16 | **Phase 4 validation**: memory survives model swap |

**Phase 4 Success Criteria:**
- Institutional Memory stores all skill execution records
- Pattern library contains at least 50 extracted patterns
- Model replacement demonstrated with <10% quality loss
- User corrections successfully improve skill quality
- Championship evaluation works across 3+ model types

**Phase 4 Risk:**
- Memory store grows unbounded
- Mitigation: Retention policies, archiving, summarization

### 14.6 Phase 5: Autonomous Capability Expansion

**Goal:** SkillOS autonomously identifies gaps and proposes new skills. Self-improvement loop active.

| Week | Deliverables |
|------|-------------|
| 17 | **Gap detection**: automatic identification of missing capabilities |
| 18 | **Skill Builder autonomy**: AI proposes and generates new skills |
| 18 | **Self-improvement loop**: Skill Builder improves itself |
| 19 | **Product integration**: all products can discover and invoke skills |
| 20 | **Phase 5 validation**: autonomous skill generation in production |

**Phase 5 Success Criteria:**
- SkillOS autonomously detects capability gaps from execution patterns
- Skill Builder generates skills with >80% acceptance rate
- Self-improvement loop demonstrated (Builder v1 → Builder v1.1)
- Products (AuditOS, LocalContentOS) successfully invoke skills
- Full regression: all Phase 1-4 capabilities still functional

**Phase 5 Risk:**
- Autonomous generation produces low-quality or unsafe skills
- Mitigation: Strict governance gate on auto-generated skills. Human approval required for publication until proven safe.

---

## 15. Risks & Assumptions

### 15.1 Key Assumptions

| # | Assumption | Impact if Wrong |
|---|-----------|-----------------|
| 1 | Local AI models capable of executing L0-L1 skills | Without local model capability, skills require cloud dependency |
| 2 | File-based registry is sufficient through Phase 2 | Premature database migration needed |
| 3 | Prompt-based execution covers most skill needs | Additional tool/function integration required |
| 4 | YAML manifests are maintainable by humans | GUI registry manager needed |
| 5 | Evaluation datasets can be curated for all skills | Some skills may not be measurable without significant investment |

### 15.2 Risks

| # | Risk | Probability | Impact | Mitigation |
|---|------|------------|--------|------------|
| 1 | Skills degrade when models upgrade | High | High | Model replacement protocol, championship evaluation |
| 2 | Evaluation data reflects bias | Medium | High | Multiple evaluators, cross-validation, human review |
| 3 | Skill Builder generates unsafe skills | Medium | High | Strict governance, human approval gate, sandbox testing |
| 4 | Registry becomes inconsistent | Medium | Medium | Validation on every write, periodic consistency checks |
| 5 | Composition complexity grows unbounded | Medium | Medium | Workflow templates, reuse patterns, complexity limits |
| 6 | Local models cannot execute high-level skills | High | Medium | Hybrid routing, graceful degradation, cloud fallback |
| 7 | Institutional Memory becomes too large | Medium | Low | Retention policies, summarization, tiered storage |
| 8 | Teams bypass governance to create skills | Low | High | Audit trail, mandatory review gate, automated detection |

### 15.3 Dependencies

| Dependency | Type | Phase | Criticality |
|-----------|------|-------|-------------|
| Model adapter layer (existing IC) | Technical | 1 | High — runtime needs it |
| File system access | Infrastructure | 1 | High — file-based registry |
| YAML parsing | Library | 1 | Medium |
| Evaluation dataset curation | Human | 2 | High — data quality |
| Skill Builder template review | Human | 3 | Medium |
| Institutional Memory store | Technical | 4 | High |
| Product integration (AuditOS, etc.) | Integration | 5 | High |

---

## 16. Appendix: Relationship to Existing Systems

### 16.1 Existing Agent Skills vs. SkillOS Skills

| Dimension | Agent Skills (`.skills/aqliya/`) | SkillOS Skills (`.skills/skills/`) |
|-----------|----------------------------------|-------------------------------------|
| **Purpose** | Guide AI coding agent behavior | Define AI platform capabilities |
| **Executable** | No — reference instructions | Yes — defined workflow, measurable output |
| **Audience** | OpenCode AI agent | AQLIYA Intelligence Core, products |
| **Category** | Agent operation | L0-L4 institutional capabilities |
| **Governance** | AGENTS.md + selected docs | SkillOS governance framework |
| **Lifecycle** | Manual file management | Full lifecycle: concept → retired |

Both coexist. Agent skills control how the coding agent operates. SkillOS skills are capabilities the AI platform can execute.

### 16.2 Integration with Intelligence Core

The Skill Runtime integrates with the existing Intelligence Core:

- **Model Adapter** → shared with IC's AI adapter layer
- **Audit Logging** → uses existing AuditEvent model
- **Governance** → uses existing RBAC and tenant isolation
- **Execution Records** → stored as AuditEvent entries
- **Knowledge Extraction** → feeds into IC's knowledge graph

### 16.3 Integration with Products

Products invoke skills through the Skill Registry + Runtime:

```
Product (AuditOS)
    │
    ├──► "skill:product:auditos-review"
    │       │
    │       ▼
    │   Skill Registry (resolve)
    │       │
    │       ▼
    │   Skill Runtime (execute)
    │       │
    │       ▼
    │   Output + Audit + Evidence
    │
    └──► Review results in product UI
```

---

## 17. Appendix: Quick Start Guide

### 17.1 Creating Your First Skill

```yaml
# .skills/manifests/engineering/my-custom-skill.skill.yaml
id: "skill:engineering:my-custom"
name: "My Custom Skill"
version: "1.0.0"
description: "A custom engineering skill that analyzes code patterns"
category: "engineering"
level: 1
status: "draft"

inputs:
  required:
    - name: "target"
      type: "string"
      description: "File or directory to analyze"

outputs:
  primary:
    type: "object"
    description: "Analysis results"

execution:
  type: "workflow"
  workflow:
    steps:
      - id: "read"
        type: "tool"
        config:
          tool: "filesystem:read"
          params:
            path: "{{inputs.target}}"
      - id: "analyze"
        type: "prompt"
        config:
          prompt: "Analyze this code: {{steps.read.output}}"

evaluation:
  criteria:
    - name: "accuracy"
      type: "accuracy"
      weight: 1.0
      threshold: 0.7

governance:
  access:
    roles: ["developer", "admin"]
  audit:
    level: "all"
```

### 17.2 Adding to Registry

```bash
# Add to registry index
# Edit: .skills/registry/index.yaml
# Add entry:
#   - id: "skill:engineering:my-custom"
#     path: "manifests/engineering/my-custom-skill.skill.yaml"
#     status: "draft"
#     version: "1.0.0"
```

### 17.3 Executing a Skill

```
POST /api/skills/execute
{
  "skillId": "skill:engineering:my-custom",
  "inputs": {
    "target": "src/lib/example.ts"
  }
}
```

---

> **Document Version:** 1.0  
> **Last Updated:** 2026-06-15  
> **Status:** Official Architecture  
> **Next Review:** 2026-09-15  
> **Owner:** AQLIYA Intelligence Core
