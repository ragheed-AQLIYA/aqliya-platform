# Rollback Readiness Assessment

**Date:** 2026-06-06  
**Agent:** AGENT-C (task C-07)

---

## Buyer questions — answers

| Question | Answer |
| -------- | ------ |
| How is previous image identified? | ECR image tag = `github.sha` + `latest` per `deploy.yml` |
| Does `promote.yml` rollback restore prior image? | **Partially honest:** rollback job re-runs `force-new-deployment` only; **does not pin previous task definition digest** unless ECS service uses immutable tag strategy |
| Who approves rollback? | GitHub `environment: production` on promote workflow |
| RTO estimate (app rollback) | ~5–15 min (ECS rollout + smoke sleep 60s) — **assumption** |
| Database rollback | **Forward-only** migrations (`migrate deploy`); DB restore = separate backup restore procedure |
| Last-known-good verification | `scripts/post-deploy-smoke.mjs` after deploy |
| Drill status | **simulated** (workflow review) — **not_executed** live rollback |

---

## Recommendation

Before enterprise sales: add ECS task definition revision pin on promote, or document **manual** rollback runbook with previous image digest.

**Verdict:** Rollback **documented**, not **proven**.
