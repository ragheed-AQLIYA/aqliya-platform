# Economic Hypothesis Review

**Audit date:** 2026-06-15  
**Hypothesis under test:**

```text
Firm Memory creates measurable economic value when the same audit (same ERP/chart)
is repeated: human review hours fall materially without accuracy regression.
```

**Formal success criteria (checklist):**

```text
Success = Hours Saved > 25%
      AND Accuracy ≥ Year 1
```

---

## 1. Is 25% Justified?

| Argument | Assessment |
| -------- | ---------- |
| **For 25%** | Material enough for partner/investor conversation; not so high that noise dominates; aligns with example 50% reduction (14h→7h) as strong pass |
| **Against fixed 25%** | Small engagements may have high variance; one senior partner hour shifts %; first pilot may land 15–20% with real value |
| **Recommendation** | Keep **>25%** as Cycle 2 **initial** gate; document actual % regardless; revisit threshold after Client #2 data |

**Verdict:** **Reasonable pilot bar**, not statistically proven. Treat as **directional hypothesis**, not contract SLA.

---

## 2. What Would Invalidate the Hypothesis?

| Outcome | Interpretation |
| ------- | -------------- |
| Hours saved < 25% (or flat/increase) **with high reuse** | Memory works technically but **does not reduce work** — hypothesis **invalidated** for economic moat |
| Hours saved > 25% **with accuracy drop** | Efficiency at quality cost — **invalidated** for commercial use |
| Hours saved > 25% on **one reviewer only** | Not scalable firm process |
| Results only on **backfill path**, not live UI confirms | Not representative of production behavior |
| Different scope Year 1 vs Year 2 | Invalid comparison — study invalid, not hypothesis |
| Cross-ERP client used | Wrong test — invalidates claim scope, not same-ERP hypothesis |

**Strongest invalidation signal:** Reuse > 80% AND hours saved ≈ 0%.

---

## 3. Hidden Assumptions

| Assumption | Risk if false |
| ---------- | ------------- |
| Reviewers trust memory suggestions | They re-verify everything → no time saved |
| Year 1 baseline reflects normal firm effort | Shalfa Y1 may include one-time learning — distorts savings |
| Same people, same process both years | Headcount change confounds hours |
| Confirm action ≈ review effort | Bulk confirm hides per-line review time |
| Classification `source` reflects reviewer behavior | Reuse metric decoupled from UX |
| TRUSTED → faster review | TRUSTED may not mature within one Cycle 2 window |
| 25% applies to total engagement hours | Mapping-only savings may differ from FS/governance |
| Partner hours weighted equally to operator | Economic value understated/overstated |

See full register: `ASSUMPTION_RISK_REGISTER.md`.

---

## 4. Evidence Still Missing

| Evidence | Required for |
| -------- | ------------ |
| Year 1 wall-clock hours (all activities) | Hours Saved % |
| Year 2 wall-clock hours | Hours Saved % |
| Reviewer-level breakdown (Senior/Manager/Partner) | ROI narrative |
| Exception log (auto / corrected / new) | Reuse quality |
| Client #2 Economics Report v1 | Any commercial claim |
| Client #3 repeat | Commercial validation |
| Cost rates × hours (optional) | Investor/management ROI |
| Staging/production run log | Operational gate (parallel track) |

**Already in repo (technical, not economic):**

- 578/578 memory replay  
- ~94% Shalfa factory accuracy  
- 0 TRUSTED baseline  
- 0% reuse rate baseline (Year 1 backfill context)

---

## 5. Alternative Hypotheses (Not Primary)

| Alternative | When to pivot |
| ----------- | ------------- |
| Memory reduces **errors**, not hours | If accuracy ↑ but hours flat |
| Memory valuable for **onboarding juniors** only | If senior hours flat, junior hours ↓ |
| TRUSTED required before economics appear | Extend study past first Year 2 pass |
| Economics only at **>500 accounts** | Smaller clients may not show 25% |

---

## Hypothesis Status (Today)

```text
Technical sub-hypothesis (memory replays on same ERP):  SUPPORTED
Economic sub-hypothesis (hours saved > 25%):            UNTESTED
Overall Firm Memory economic moat:                      OPEN
```

**No engineering required to test** — only Client #2 execution + time study.
