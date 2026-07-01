# Pilot AI Scope Decision

**Date:** 2026-06-21  
**Decision ID:** PILOT-AI-2026-06-21  
**Status:** Approved for pilot launch  
**Authority:** Platform operations + commercial alignment

---

## Decision

**Option B — AI excluded from pilot scope**

Production pilot runs with **governed workflows only**. Cloud AI providers are **not** enabled in production for the first institutional pilot.

---

## Rationale

| Factor | Assessment |
|--------|------------|
| Production Terraform | `FF_AI_REAL_PROVIDERS=false` in production ECS task definition |
| Key management | No production `AI_CLOUD_API_KEY` in Secrets Manager for pilot |
| Trust principle | AI assists; humans decide — pilot focuses on evidence, review, approval without external inference |
| Commercial clarity | Avoids over-promising AI-assisted outputs during first customer engagement |
| Risk reduction | Eliminates data-routing ambiguity to external LLM providers during pilot |

---

## In scope (pilot)

- Manual workflows: upload, classification, review, approval, export
- Evidence platform: lifecycle, audit trail, health monitoring
- Office AI Assistant UI may remain visible with **disabled / draft-only** messaging where configured
- Deterministic scoring and rule-based suggestions (LocalContentOS) where no external API is required

---

## Out of scope (pilot)

- Real-time cloud LLM inference (`FF_AI_REAL_PROVIDERS=true`)
- Autonomous AI approvals or exports
- AI-generated final audit opinions or legal conclusions
- External provider routing of customer evidence content

---

## Configuration evidence

| Environment | `FF_AI_REAL_PROVIDERS` | `AI_CLOUD_API_KEY` |
|-------------|------------------------|---------------------|
| Production (Terraform) | `false` | Not required for pilot |
| Staging | `true` (optional testing) | Optional |
| Local dev | Developer choice | Optional |

---

## SOW alignment

See `docs/commercial/PILOT_SOW_TEMPLATE.md` — **Appendix B: AI Exclusions (Pilot)** added 2026-06-21.

Customer-facing language:

> AI-assisted features are excluded from this pilot. All outputs are human-reviewed. Post-pilot, AI capabilities may be enabled under separate agreement and data-processing terms.

---

## Reversal criteria (post-pilot)

To enable Option A (Production AI enabled):

1. Customer DPA signed covering external AI provider
2. `AI_CLOUD_API_KEY` stored in Secrets Manager
3. Set `FF_AI_REAL_PROVIDERS=true` in production ECS
4. Run AI routing validation in staging
5. Update SOW appendix to include AI scope

---

## Sign-off

| Role | Name | Date |
|------|------|------|
| Platform lead | `[ASSIGN]` | 2026-06-21 |
| Commercial | `[ASSIGN]` | `[DATE]` |
