# Client 2 — Firm Memory Measurement Checklist

**Purpose:** Cycle 2 — **Evidence Collection Cycle** — prove **Audit Memory Economics** on same ERP after Shalfa Year 1 baseline.

**This is not a development cycle.** No features, refactor, Local AI, RAG, dashboard, or Client #2 setup scripts until economics are measured.

**Moat claim (narrow):** Same-ERP accumulated audit knowledge — not cross-ERP generalization.

**Commercial moat chain (what we must prove):**

```text
Knowledge Reuse
      ↓
Less Human Review
      ↓
Less Audit Hours
      ↓
Higher Margin
```

---

## KPI hierarchy (read this first)

Many AI projects stop here:

```text
Accuracy ↑ → Reuse ↑ → Adoption ↑ → … no measurable financial impact
```

**Reuse rate is not the primary KPI.**

| Tier | KPI | Why |
| ---- | --- | --- |
| **Tier 1 (primary)** | **Human Review Hours Saved (≥ 25%)** | Client buys time/cost reduction, not % reuse |
| **Tier 2** | Memory Reuse Rate · TRUSTED Growth · Exception mix | Adoption, governance, **reuse quality** |
| **Tier 3** | Memory Accuracy | Mostly proven on same ERP; hold **≥ Year 1** |

**Trap to avoid:** Reuse = 90% but reviewers spend the same minutes → **no economic moat**.

The unproven question is not *"Does memory work?"* (answered: yes, same ERP). It is:

```text
Does knowledge reuse actually reduce human work and audit hours?
```

---

## Pre-conditions

- [ ] Phase 3C/3D migrations deployed on target environment
- [ ] Engagement created with real TB upload (`presentationProfile: generic` unless audited reclass required)
- [ ] ERP Map1/Map2 hints captured in classification history where available
- [ ] ≥2 distinct reviewers identified (TRUSTED path requires multi-reviewer confirms)
- [ ] **Activity time log + exception log started** — **before first Client #2 run**

---

## Activity time log (required — before first run)

**Biggest Cycle 2 risk:** same ERP, but **no one logs time** → no economic proof after two months.

Copy into a spreadsheet. Log **wall-clock minutes** per activity, same scope Year 1 vs Year 2.

### Time by activity

| Activity | Year 1 (min) | Year 2 (min) | Notes |
| -------- | ------------ | ------------ | ----- |
| Upload TB | | | |
| Mapping review | | | split auto-accept vs manual correction |
| FS validation | | | |
| Governance review | | | |
| **Total minutes** | | | |
| **Hours saved %** | — | — | `(Y1 − Y2) / Y1 × 100` |
| **Cost saved (optional)** | — | — | weighted by reviewer rates below |

### Reviewer count & seniority (required — avoids biased totals)

10 senior hours ≠ 10 manager hours economically. Log separately each run:

| Field | Year 1 | Year 2 |
| ----- | ------ | ------ |
| Reviewer count (distinct people) | | |
| Senior review hours | | |
| Manager review hours | | |
| Other / operator hours | | |
| Blended cost rate used (optional) | | |

Rules:

- Same workflow scope both years (define once; do not change mid-cycle).
- Log per session (start/end), not estimates from memory.
- If reviewer count differs Year 1 vs Year 2, note it — do not compare raw totals without context.

This table matters more than any in-app dashboard today.

---

## Exception count log (reuse quality — required)

Reuse **quantity** without reuse **quality** is misleading. Log per Year 1 and Year 2 pass:

| Metric | Year 1 | Year 2 |
| ------ | ------ | ------ |
| Mappings reused automatically (accepted as suggested) | | |
| Mappings manually corrected | | |
| New mappings created (no memory hit) | | |
| **Total mappings** | | |
| Auto-accept rate | — | — | auto / total |
| Correction rate | — | — | corrected / total |

**Reuse quality signal:** Year 2 should show higher auto-accept and lower correction **if** memory is reducing real work — not just hitting memory in the database while humans re-check everything.

---

## Onboarding steps

1. **Create engagement** for Client 2 (same org, same ERP chart as Shalfa if measuring reuse).
2. **Start time log + exception log** before any TB work.
3. **Upload TB** — first pass uses rules/hybrid/memory as configured.
4. **Human confirm mappings** — each confirm calls `recordFirmMemoryFeedback` → grows patterns.
5. **Do not run Shalfa backfill** on Client 2 data (backfill is engagement-specific export).
6. **Close Year 1 log** — total minutes, reviewer breakdown, exception counts.
7. **Second TB period (Year 2 simulation):**
   - Re-upload or re-classify same ERP accounts
   - Run `npm run phase-3c:validate` with `ENGAGEMENT_ID=<client-2>`
8. **Measure technical KPIs:**
   ```bash
   npm run tb:memory-reuse-rate -- --engagement <client-2-engagement-id>
   npm run phase-3d:validate-governance
   ```
9. **Close Year 2 log** — compare hours saved %, accuracy, exception mix.

---

## KPIs to record (by tier)

### Tier 1 — Economic (primary)

| KPI | Source | Target |
| --- | ------ | ------ |
| **Hours saved %** | Activity time log | **> 25%** vs Year 1 |
| **Accuracy ≥ Year 1** | `phase-3c:validate` / factory metrics | No regression |
| Cost saved (optional) | Weighted senior/manager hours × rates | Directionally positive |

### Tier 2 — Adoption, governance & reuse quality

| KPI | Source |
| --- | ------ |
| Memory reuse rate | `tb-memory-reuse-rate.mjs` |
| TRUSTED pattern count / growth | `phase-3d:validate-governance` |
| Auto-accept vs manual correction mix | Exception count log |
| Time to first TRUSTED | Manual — after 5 hits + 2 reviewers |

### Tier 3 — Technical confirmation

| KPI | Source |
| --- | ------ |
| Memory-only accuracy | `phase-3c:validate` |
| Factory accuracy (overall) | `shalfa:validate` pattern (Client 2 TB) |

**Shalfa Year 1 baseline:** 578 CONFIRMED, 0 TRUSTED, reuse rate 0% — economics **not yet proven**.

---

## Go / No-Go definition

### Primary success (commercial story)

**Client #2 is a commercial success if:**

```text
Hours Saved > 25%   (vs Year 1, same workflow scope)
AND
Accuracy ≥ Year 1   (no quality regression)
```

If this pair holds, you have a strong commercial narrative — even before Client #3.

### Supporting evidence (expected, not sufficient alone)

| Criterion | Target | Note |
| --------- | ------ | ---- |
| Memory reuse | > 80% | Tier 2 — insufficient without hours saved |
| TRUSTED growth | > 0 from baseline | 578 CONFIRMED / 0 TRUSTED at Shalfa Year 1 |
| Reuse quality | Auto-accept ↑, corrections ↓ | Exception log |

### Failure modes

| Outcome | Verdict |
| ------- | ------- |
| High reuse, hours saved < 25% | **No economic moat** — investigate UX/trust/process |
| Hours saved > 25%, accuracy drops | **No go** — fix quality before Client #3 |
| Tier 1 passes | Proceed to **Client #3** for repeatability |
| Client #3 repeats pattern | **Commercial validation** conversation is data-backed |

Do not expand to Client #3 or commercial claims if Tier 1 fails.

---

## Evidence collection path

```text
Client #2 → Time Study + Exception Log
         → Client #3 → Repeatability
         → Commercial Validation (only if pattern holds twice)
```

---

## Anti-patterns

- Do not claim Client 2 results prove cross-ERP generalization (hold-out ~46%)
- Do not conflate CONFIRMED with TRUSTED
- Do not treat reuse > 80% as success without hours saved > 25%
- Do not compare total minutes without reviewer count / seniority breakdown
- Do not run Client #2 without time log + exception log (spreadsheet is enough)
- Do not build dashboard, automation, Trust UI, Local AI, or setup scripts before evidence
- Do not copy Shalfa patterns into another organization's tenant

---

## References

- `docs/operations/firm-memory-deployment-runbook.md`
- `docs/operations/parallel-execution-cycle-TB-MEMORY.md`
- `docs/AUDITOS_PROGRAM_STATUS.md`
- `docs/architecture/AUDIT_KNOWLEDGE_PLATFORM_ASSESSMENT.md`
