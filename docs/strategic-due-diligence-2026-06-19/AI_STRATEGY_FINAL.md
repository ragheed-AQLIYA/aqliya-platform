# AQLIYA AI Strategy — Final

**Classification:** Board AI Governance Decision  
**Date:** 2026-06-19  
**Trust principle:** *AI assists. Humans decide. Evidence governs.*

---

## AI Strategy Verdict

AQLIYA's **AI moat is governance, not models**. The correct customer story is **"governed assistive intelligence with evidence and human review"**—not "AI-powered automation" or "local private GPT."

---

## Capability Assessment

### Deterministic AI — PRODUCTION DEFAULT ✅

| Aspect | Status |
|--------|--------|
| Default inference path | Deterministic handlers |
| Feature flags for real LLM | `FF_AI_REAL_PROVIDERS` |
| Test stability | Disabled in Jest (prevents flake) |
| Customer message | "Predictable, reviewable suggestions—not black box" |

**Decision:** Keep deterministic as default through 2027. Real LLM opt-in per tenant/task.

---

### Local AI — PILOT CAPABILITY ⚠️

| Aspect | Status |
|--------|--------|
| Ollama integration | Real; smoke PASS |
| Model | qwen3:8b documented |
| TB classification | 87% exact (n=100 benchmark) |
| Latency | 12–32s — needs async queue |
| Packaging | Operator-managed; not appliance |

**Customer story:** "Optional local inference for sensitive workloads when customer operates Ollama endpoint."

**Never promise:** Air-gapped appliance, guaranteed local-only without operator config, sub-second inference.

---

### Cloud AI — OPTIONAL ASSIST ⚠️

| Aspect | Status |
|--------|--------|
| Adapters | OpenAI/Anthropic paths in orchestrator |
| Production default | No |
| Testing | Blocked without API keys in CI |
| Data routing | Governance context injected |

**Customer story:** "Cloud models available behind governance layer with audit trail—customer chooses provider policy."

**Never promise:** Autonomous decisions, certified outputs, zero data egress without contract review.

---

### Governance — COMPETITIVE STRENGTH ✅

| Mechanism | Implemented |
|-----------|-------------|
| AIOrchestrator | Provider selection, fallback |
| AIGovernanceMetadata | Prompt, model, confidence |
| Human review gates | LC review center, assistant lifecycle |
| Audit events on AI actions | Platform + product |
| Export gating | Approval before final output |
| Skill evaluation framework | 25 skills, calibrated thresholds |

**Customer story:** "Every AI output is a draft subject to human review, linked to evidence, logged in audit trail."

---

### Evaluation Framework — OPERATIONAL L4 ✅

| Component | Status |
|-----------|--------|
| Skill eval CLI + API | `/api/skills/evaluate`, ADMIN-gated |
| TB benchmarks | Documented artifacts |
| LC quality metrics | Quality dashboard, 95% acceptance |
| Live Ollama baseline | Useful output; strict scoring mismatch noted |

**Investment:** Semantic/fuzzy scoring for skill eval (Q4 2026)—internal quality, not customer SKU.

---

## Customer-Facing AI Story (Approved Narrative)

### What to tell customers

> AQLIYA embeds **assistive intelligence** inside **governed institutional workflows**. AI suggests mappings, classifications, and drafts. **Your team reviews, approves, and owns every outcome.** Every suggestion links to **evidence**. Every action is **audited**. You can run with **deterministic assist** (default), **local models** (Ollama), or **cloud models**—under your policy.

**Proof points (use in sales):**
- LocalContent: 95% suggestion acceptance after human review; 0% hallucination in grounded re-run
- AuditOS: 87% TB classification benchmark; factory accuracy ≥85% on pilot TB
- Platform: MFA, RBAC, export gates, bilingual exports

### Elevator (Arabic institutional buyers)

> الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.  
> عقلية لا تستبدل المدقق أو مسؤول المحتوى المحلي—بل تسرّع عمله باقتراحات مربوطة بأدلة وقابلة للمراجعة.

---

## What NEVER to Promise

| Forbidden claim | Why |
|-----------------|-----|
| Autonomous compliance decisions | Violates trust principle; not implemented |
| LCGPA certification from software | LC doctrine explicitly disclaims |
| Licensed audit opinions | AuditOS assists auditors; does not certify |
| "Private AI" appliance / air-gap package | L0; not productized |
| "Better than GPT" model claims | Commodity; unprovable |
| 100% AI accuracy | Benchmarks show 87–95% in controlled conditions |
| Real-time AI at scale without queue | Latency evidence contradicts |
| SOC2-certified AI processing | Not achieved |
| Replacement for ERP or audit methodology | Platform assists; does not replace |
| Institutional Memory as "company brain" that decides | Linking only; humans decide |

---

## AI Investment Priority (12 months)

| Rank | Investment | Rationale |
|------|------------|-----------|
| 1 | LC grounded suggestions + review UX | Revenue product |
| 2 | Audit TB factory accuracy maintenance | Proof product |
| 3 | Async AI job queue | Operational UX |
| 4 | Tenant AI policy flags (local vs cloud vs deterministic) | Enterprise ask |
| 5 | Semantic eval scoring (internal) | Quality loop |

**Zero investment:** Model marketplace, autonomous agents, AQLIYA Studio AI builder, Risk AI product.

---

## AI Maturity Score

| Dimension | Score |
|-----------|------:|
| Governance architecture | 82 |
| Deterministic production readiness | 85 |
| Local AI readiness | 68 |
| Cloud AI readiness | 55 |
| Evaluation / quality loop | 74 |
| Commercial AI narrative clarity | 70 |
| **AI strategy score** | **72/100** |

---

*Evidence: local-ai smoke, TB benchmarks, LC quality mission, `src/lib/ai/` governance structure.*
