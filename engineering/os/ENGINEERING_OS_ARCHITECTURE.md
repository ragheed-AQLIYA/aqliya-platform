# AQLIYA Engineering OS — Full Architecture

**Status:** Active  
**Version:** 1.0  
**Date:** 2026-07-13  
**Owner:** Chief Architect (OpenCode Agent)  
**Authority:** Engineering governance — subject to `AGENTS.md` and `engineering/programs/AGENT_FREEZE.md`

---

## Mission

AQLIYA Engineering OS is a **self-improving engineering platform** that continuously governs, measures, and improves the entire AQLIYA repository. It does NOT just audit — it **operates**.

```
Audit → Learn → Decide → Execute → Verify → Remember → Improve → Repeat
```

---

## 12-Layer Architecture

### Layer 1: Executive (القيادة)

**Role:** Decide priorities, allocate work. Never write code.

| Agent | Implementation | Status |
|-------|---------------|--------|
| Chief Architect | OpenCode (this session) | Active |
| CTO | Program Governance (`engineering/programs/`) | Active |
| Product Governance | `engineering/os/PRODUCT_LIFECYCLE.md` | Active |
| Engineering Program Manager | `engineering/programs/` (Programs A-E) | Active |
| Release Manager | `engineering/os/RELEASE_READINESS.md` | Active |

**Authority:** This layer owns priority. All other layers execute what this layer decides.

---

### Layer 2: Repository Intelligence (تحليل المستودع)

**Role:** Produce a complete Digital Twin of the repository.

| Agent | Implementation | Output |
|-------|---------------|--------|
| Repository Intelligence | `engineering/agents/engineering-intelligence.mjs` | `MEMORY.md` |
| Dependency Analyzer | `engineering/agents/dependency.mjs` | dependency graph |
| Architecture Mapper | `engineering/os/knowledge-graph.mjs` | `KNOWLEDGE_GRAPH.md` |
| Domain Mapper | `engineering/os/KNOWLEDGE_GRAPH.md` (DDD view) | domain boundaries |
| API Mapper | `engineering/os/KNOWLEDGE_GRAPH.md` (route view) | route inventory |
| Database Mapper | Prisma schema + `engineering/intelligence/` | model inventory |
| Workflow Mapper | `engineering/os/PRODUCT_LIFECYCLE.md` | product states |
| Event Bus Analyzer | `engineering/os/` (PlatformOutboxEvent) | event registry |
| Feature Flag Analyzer | `src/lib/platform/feature-flags/` | flag inventory |
| AI Pipeline Analyzer | `engineering/intelligence/` + AI eval framework | AI pipeline map |

**Status:** 7/10 implemented. Gaps: Domain Mapper, AI Pipeline Analyzer, Feature Flag Analyzer (need intelligence integration).

---

### Layer 3: Code Quality (الجودة)

**Role:** Review every change for quality, maintainability, and patterns.

| Agent | Implementation | Status |
|-------|---------------|--------|
| Code Health | `engineering/agents/code-health.mjs` | Active |
| Refactoring | `engineering/refactors/` + `engineering/programs/C` | Active |
| Technical Debt | `engineering/agents/technical-debt.mjs` | Active |
| Dead Code | `engineering/agents/code-health.mjs` (duplication) | Active |
| Complexity Analyzer | `engineering/agents/code-health.mjs` | Active |
| Naming Consistency | **GAP — needs skill** | Missing |
| Design Pattern Validator | **GAP — needs skill** | Missing |
| SOLID Validator | **GAP — needs skill** | Missing |
| DDD Validator | **GAP — needs skill** | Missing |
| Clean Architecture Validator | `engineering/agents/architecture-drift.mjs` | Active |

---

### Layer 4: Security (الأمن)

**Role:** Continuous security posture validation.

| Agent | Implementation | Status |
|-------|---------------|--------|
| Security | `engineering/agents/security.mjs` | Active |
| RBAC | `engineering/os/COMPLIANCE.md` (ACTIONS_USE_ENFORCE) | Active |
| Tenant Isolation | `engineering/os/COMPLIANCE.md` (DOWNLOAD_ROUTES_TENANT_SCOPED) | Active |
| Secrets Scanner | **GAP — dependency scanner covers some** | Partial |
| Dependency Scanner | `engineering/agents/dependency.mjs` + Dependabot | Active |
| AI Security | `.skills/aqliya/aqliya-ai-feature-gate.md` | Active |
| Prompt Injection | `src/lib/security/prompt-sanitization.ts` | Active |
| Supply Chain | `npm audit` in CI | Active |
| Compliance | `engineering/os/COMPLIANCE.md` | Active |

---

### Layer 5: Performance (الأداء)

**Role:** Optimize database, rendering, bundle, and caching.

| Agent | Implementation | Status |
|-------|---------------|--------|
| Performance | `engineering/agents/performance.mjs` | Active |
| Database Optimizer | **GAP — needs integration** | Missing |
| Query Optimizer | `engineering/agents/performance.mjs` (N+1 detection) | Partial |
| React Performance | **GAP — needs skill** | Missing |
| Bundle Optimizer | `scripts/platform/bundle-analyzer.js` | Active |
| Cache Optimizer | `src/lib/platform/cache-strategy.ts` | Active |
| Queue Optimizer | `src/lib/platform/outbox/` | Active |

---

### Layer 6: Testing (الاختبارات)

**Role:** Ensure comprehensive test coverage and quality.

| Agent | Implementation | Status |
|-------|---------------|--------|
| Unit Test | `engineering/agents/test-intelligence.mjs` | Active |
| Integration Test | `engineering/agents/test-intelligence.mjs` | Active |
| Contract Test | **GAP — needs skill** | Missing |
| E2E Test | Cypress + Playwright (partial) | Partial |
| Load Test | **GAP — needs implementation** | Missing |
| Mutation Test | **GAP — needs implementation** | Missing |
| Coverage Agent | Jest coverage thresholds | Active |

---

### Layer 7: Product (المنتج)

**Role:** Validate product specifications, UX, and documentation against implementation.

| Agent | Implementation | Status |
|-------|---------------|--------|
| PRD/Spec Validator | `.skills/aqliya/aqliya-product-completion.md` | Active |
| UX Quality | `engineering/agents/ux-quality.mjs` | Active |
| Accessibility | **GAP — needs skill** | Missing |
| Documentation | `engineering/agents/documentation.mjs` | Active |
| Translation (Arabic/EN) | **GAP — needs skill** | Missing |

---

### Layer 8: AI Governance (الذكاء الاصطناعي)

**Role:** Govern AI pipelines, prompts, models, and costs.

| Agent | Implementation | Status |
|-------|---------------|--------|
| Prompt Engineer | `src/lib/core/ai/orchestrator.ts` (prompt registry) | Active |
| AI Evaluation | `src/lib/core/ai/eval-framework/` (25 skills) | Active |
| Cost Optimizer | `src/lib/core/ai/budget-manager.ts` | Active |
| Routing Optimizer | `src/lib/core/ai/orchestrator.ts` (selectOptimalProvider) | Active |
| Model Benchmark | **GAP — needs integration** | Missing |
| Hallucination Detector | **GAP — needs implementation** | Missing |
| AI Governance | `.skills/aqliya/aqliya-ai-feature-gate.md` | Active |

---

### Layer 9: DevOps (البنية التحتية)

**Role:** Manage CI/CD, infrastructure, deployment, and observability.

| Agent | Implementation | Status |
|-------|---------------|--------|
| CI/CD | `.github/workflows/ci.yml`, `promote.yml` | Active |
| Infrastructure | `infra/terraform/` (73+46 = 119 resources) | Active |
| Kubernetes | **Not implemented** (ECS Fargate instead) | Deferred |
| Docker | Dockerfile + docker-compose | Active |
| AWS | `infra/terraform/` (ECS, RDS, ElastiCache, S3, CloudFront, WAF) | Active |
| Observability | `src/lib/observability/logger.ts` (in progress) | Emerging |
| Incident Response | `docs/deployment/INCIDENT_ROLLBACK_RUNBOOK.md` | Active |

---

### ★ Layer 10: Skills Factory (مصنع المهارات)

**Role:** Convert repeated engineering work into reusable, versioned Skills.

**This is the most important addition.** Instead of solving the same problem every cycle, agents extract the solution pattern into a reusable Skill.

#### Skill Format

Every skill at `.skills/aqliya/eng-*.md`:

```yaml
---
name: eng-<name>
description: <one-line>
version: <semver>
date: <YYYY-MM-DD>
status: active | deprecated | draft
owner: <which layer owns this skill>
inputs: <what the skill needs>
outputs: <what the skill produces>
dependencies: <other skills or agents this depends on>
---
```

#### Initial Engineering Skills to Build

| # | Skill | Layer | Replaces repeated work |
|---|-------|-------|----------------------|
| 1 | `eng-code-review` | Quality (3) | Manual code review per file |
| 2 | `eng-architecture-review` | Intelligence (2) + Quality (3) | Architecture drift detection |
| 3 | `eng-security-audit` | Security (4) | Security posture check |
| 4 | `eng-performance-review` | Performance (5) | Performance bottleneck detection |
| 5 | `eng-test-strategy` | Testing (6) | Test coverage gap analysis |
| 6 | `eng-prisma-review` | Intelligence (2) + Quality (3) | Schema/migration review |
| 7 | `eng-api-review` | Intelligence (2) + Security (4) | API route compliance |
| 8 | `eng-docs-sync` | Product (7) | Documentation drift detection |
| 9 | `eng-release-validation` | DevOps (9) + Executive (1) | Pre-release gate check |
| 10 | `eng-ai-pipeline-review` | AI (8) | AI pipeline governance |
| 11 | `eng-rbac-review` | Security (4) | RBAC/authorization audit |
| 12 | `eng-tenant-isolation` | Security (4) | Tenant boundary validation |
| 13 | `eng-dependency-audit` | Security (4) + DevOps (9) | Dependency health check |
| 14 | `eng-coverage-analysis` | Testing (6) | Test coverage gap identification |
| 15 | `eng-refactor-plan` | Quality (3) | Refactoring strategy |
| 16 | `eng-dead-code-scan` | Quality (3) | Unused code detection |
| 17 | `eng-product-readiness` | Product (7) + Executive (1) | v0.1/L5/L6 readiness check |
| 18 | `eng-governance-compliance` | Governance (12) | Cross-layer compliance |

---

### Layer 11: Engineering Memory (الذاكرة الهندسية)

**Role:** Never start from scratch. Remember decisions, patterns, and lessons.

#### Memory Components

| Component | Location | Purpose |
|-----------|----------|---------|
| ADR Registry | `engineering/knowledge/adr/` | All architecture decisions |
| Decision Log | `engineering/knowledge/decisions.json` | Key choices + rationale |
| Pattern Library | `engineering/knowledge/patterns/` | Approved design patterns |
| Anti-Pattern Registry | `engineering/knowledge/anti-patterns/` | Known bad patterns to avoid |
| Refactor History | `engineering/refactors/` | Why each refactor happened |
| Technical Debt Ledger | `engineering/knowledge/tech-debt.json` | Debt inventory with repayment plan |
| Metrics Timeline | `engineering/data/metrics/` | Health score over time |
| Learning Journal | `engineering/intelligence/MEMORY.md` | What the OS learned each cycle |
| Root Cause Library | `engineering/knowledge/root-causes/` | Why common issues recur |

---

### Layer 12: Governance Engine (محرك الحوكمة)

**Role:** Prevent violations BEFORE they happen, not just detect them after.

#### Governance Rules

| Rule ID | Rule | Enforcement | Status |
|---------|------|-------------|--------|
| GOV-01 | No Prisma in Client Components | Pre-commit + `engineering/os/COMPLIANCE.md` | Active |
| GOV-02 | Server Actions must call enforce()/authorize() | `engineering/os/COMPLIANCE.md` | Active (52% current) |
| GOV-03 | No auth bypass patterns | `engineering/os/COMPLIANCE.md` | Active (100%) |
| GOV-04 | No cross-product domain deep imports | `engineering/os/COMPLIANCE.md` | Active (100%) |
| GOV-05 | Download routes must tenant-scope (404, not 403) | `engineering/os/COMPLIANCE.md` | Active (45% current) |
| GOV-06 | No `as any` in production code | Pre-commit check | Active (100%) |
| GOV-07 | All mutations must have audit trail | Skill check | Active |
| GOV-08 | No AI autonomous final decisions | `.skills/aqliya/aqliya-ai-feature-gate.md` | Active |
| GOV-09 | Product boundaries must not leak | `engineering/os/PRODUCT_LIFECYCLE.md` | Active |
| GOV-10 | No undefined platform names in marketing | `.skills/aqliya/aqliya-docs-authority.md` | Active |

---

## Operating Cycle

```
                  ┌────────────────────────┐
                  │   Executive (Layer 1)   │
                  │   Priority Decision     │
                  └───────────┬────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌───────────────┐  ┌─────────────────┐
│ Intelligence    │  │ Quality (3)   │  │ Security (4)    │
│ (Layer 2)       │  │ Performance   │  │ AI Gov (8)      │
│ Repository Scan │  │ (5), Test (6) │  │ DevOps (9)      │
└────────┬────────┘  └───────┬───────┘  └────────┬────────┘
         │                   │                    │
         └───────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │ Governance (12) │
                    │ Rule Check      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Skills Factory  │
                    │ (Layer 10)      │
                    │ Extract Pattern │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Implementation  │
                    │ OpenCode Agents │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Verification    │
                    │ Test + Validate │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Memory (11)     │
                    │ Record + Learn  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Health Dashboard│
                    │ Update Metrics  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Next Cycle      │
                    │ (back to Exec)  │
                    └─────────────────┘
```

---

## Integration: engineering/ ↔ OpenCode

The `engineering/` platform produces **intelligence** (findings, metrics, compliance reports). OpenCode consumes this intelligence and **implements** improvements.

```
engineering/agents/*.mjs → data lake → intelligence/ → OS/ modules
                                                           │
                              OpenCode reads ←─────────────┘
                              OpenCode implements
                              OpenCode commits
                              Engineering verifies (next cycle)
```

---

## Current State vs. Target

| Aspect | Current | Target |
|--------|---------|--------|
| **Agents** | 15 `.mjs` scripts (frozen) | Same scripts + Skills for reusable patterns |
| **Cycle** | Manual (`npm run eng:audit`) | Continuous (triggered by changes) |
| **Memory** | `intelligence/MEMORY.md` (thin) | Full ADR registry + pattern library + decision log |
| **Skills** | 8 product-domain skills | 18+ engineering skills + ability to auto-extract new ones |
| **Governance** | Post-audit detection | Pre-execution prevention via skills |
| **Self-Improvement** | Manual | Automatic pattern extraction → new skill creation |

---

## Hard Rules

1. **Respect AGENT_FREEZE**: No new `.mjs` agents without ADR exception. Add Skills (`.skills/aqliya/eng-*.md`) instead.
2. **Intelligence informs, OpenCode implements**: Never auto-modify `src/`.
3. **Memory is append-only**: Never delete history.
4. **Every cycle must produce at least one new reusable Skill**.
5. **Governance rules are checked before execution, not just after audit**.

---

## Amendment

This document is the **constitution** of the AQLIYA Engineering OS. Amendments require:
1. Documented ADR
2. Executive layer approval
3. Version bump + changelog
