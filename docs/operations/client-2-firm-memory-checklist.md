# Client 2 — Firm Memory Measurement Checklist

**Purpose:** Cycle 2 — prove **Audit Memory Economics** on same ERP after Shalfa Year 1 baseline.  
**This is a measurement cycle, not a product build cycle.**

**Moat claim (narrow):** Same-ERP accumulated audit knowledge — not cross-ERP generalization.

---

## Pre-conditions

- [ ] Phase 3C/3D migrations deployed on target environment
- [ ] Engagement created with real TB upload (`presentationProfile: generic` unless audited reclass required)
- [ ] ERP Map1/Map2 hints captured in classification history where available
- [ ] ≥2 distinct reviewers identified (TRUSTED path requires multi-reviewer confirms)
- [ ] **Year 1 review time baseline recorded** (see Human Review KPI below)

---

## Onboarding steps

1. **Create engagement** for Client 2 (same org, same ERP chart as Shalfa if measuring reuse).
2. **Upload TB** — first pass uses rules/hybrid/memory as configured.
3. **Human confirm mappings** — each confirm calls `recordFirmMemoryFeedback` → grows patterns.
4. **Do not run Shalfa backfill** on Client 2 data (backfill is engagement-specific export).
5. **Record Year 1 effort** — total reviewer minutes for TB upload → confirm → FS ready.
6. **Second TB period (Year 2 simulation):**
   - Re-upload or re-classify same ERP accounts
   - Run `npm run phase-3c:validate` with `ENGAGEMENT_ID=<client-2>`
7. **Measure technical KPIs:**
   ```bash
   npm run tb:memory-reuse-rate -- --engagement <client-2-engagement-id>
   npm run phase-3d:validate-governance
   ```
8. **Record Year 2 effort** — same workflow; compare minutes to Year 1.

---

## KPIs to record

| KPI | What it measures | Source |
| --- | ---------------- | ------ |
| Memory reuse rate | Memory adoption | `tb-memory-reuse-rate.mjs` |
| Memory-only accuracy | Memory correctness | `phase-3c:validate` |
| TRUSTED pattern count | Governance maturity | `phase-3d:validate-governance` |
| Time to first TRUSTED | Trust lifecycle speed | Manual — after 5 hits + 2 reviewers |
| Factory accuracy (overall) | End-to-end factory | `shalfa:validate` pattern (Client 2 TB) |
| **Human review hours saved** | **Economic value** | **Manual time study (see below)** |

### Human Review Hours Saved (primary commercial KPI)

**Definition:**

```text
Hours Saved = Year 1 review minutes − Year 2 review minutes
            (same ERP chart, same workflow: upload → classify → confirm → FS ready)
```

**How to measure (no automated script yet):**

| Step | Action |
| ---- | ------ |
| 1 | Define scope: mapping confirmation only, or full factory through FS |
| 2 | Same reviewers where possible; note headcount if different |
| 3 | Log start/end per session (spreadsheet or time tracker) |
| 4 | Split: auto-suggested accepts vs manual lookups vs corrections |
| 5 | Report net minutes and % reduction |

**Why this matters:** Clients buy **hours saved**, not reuse percentage alone.  
80% reuse with zero time savings is a technical metric, not a commercial moat.

**Shalfa Year 1 baseline:** 578 CONFIRMED, 0 TRUSTED, reuse rate 0% — economics **not yet proven**.

---

## Success criteria (pilot)

| Metric | Target (initial) |
| ------ | ---------------- |
| Memory reuse rate (Year 2, same ERP) | > 80% accounts hit firm memory |
| Memory-only accuracy (same ERP) | > 95% on confirmed set |
| TRUSTED patterns | > 0 after multi-reviewer reuse cycle |
| **Human review hours saved (Year 2 vs Year 1)** | **> 0 — directionally lower effort** |

Targets are initial pilot bars — adjust after Client #2 evidence.

### Go / No-Go definition

**Client #2 is considered successful only if all of the following are met:**

- Memory reuse **> 80%**
- Memory accuracy **> 95%**
- Review hours **reduced materially** vs Year 1 (same ERP, same workflow scope)
- TRUSTED patterns **increase from baseline** (578 CONFIRMED / 0 TRUSTED at Shalfa Year 1)

If any criterion fails, Cycle 2 continues as **measurement** — do not expand to Client #3 or commercial claims until root cause is documented.

---

## Anti-patterns

- Do not claim Client 2 results prove cross-ERP generalization (hold-out ~46%)
- Do not conflate CONFIRMED with TRUSTED
- Do not auto-approve TRUSTED suggestions without human review in pilot
- Do not copy Shalfa patterns into another organization's tenant
- Do not build features (dashboard, RAG, Local AI) before economics are measured

---

## References

- `docs/operations/firm-memory-deployment-runbook.md`
- `docs/operations/parallel-execution-cycle-TB-MEMORY.md`
- `docs/AUDITOS_PROGRAM_STATUS.md`
- `docs/architecture/AUDIT_KNOWLEDGE_PLATFORM_ASSESSMENT.md`
