# Client 2 — Firm Memory Onboarding Checklist

**Purpose:** Measure **Memory Reuse Rate** on a second real ERP/chart after Shalfa baseline.  
**Moat claim:** Same-ERP accumulated audit knowledge — not cross-ERP generalization.

---

## Pre-conditions

- [ ] Phase 3C/3D migrations deployed on target environment
- [ ] Engagement created with real TB upload
- [ ] ERP Map1/Map2 hints captured in classification history where available
- [ ] Reviewers identified (need ≥2 distinct reviewers for TRUSTED path)

---

## Onboarding steps

1. **Create engagement** for Client 2 (new `auditClientId` / ERP chart key if applicable).
2. **Upload TB** — first pass uses rules/hybrid/memory as configured in engine.
3. **Human confirm mappings** — each confirm calls `recordFirmMemoryFeedback` → grows patterns.
4. **Do not run Shalfa backfill** on Client 2 data (backfill is engagement-specific export).
5. **Second TB period (Year 2 simulation):**
   - Re-upload or re-classify same ERP accounts
   - Run `npm run phase-3c:validate` with `ENGAGEMENT_ID=<client-2>`
6. **Measure reuse:**
   ```bash
   node scripts/tb-memory-reuse-rate.mjs --engagement <client-2-engagement-id>
   ```

---

## KPIs to record

| KPI | Formula / source |
| --- | ---------------- |
| Memory-only accuracy | `phase-3c:validate` |
| Memory reuse rate | `tb-memory-reuse-rate.mjs` |
| TRUSTED pattern count | `phase-3d:validate-governance` |
| Time to first TRUSTED | Manual — after 5 hits + 2 reviewers |
| Factory accuracy (overall) | Existing factory metrics |

---

## Success criteria (pilot)

| Metric | Target (initial) |
| ------ | ---------------- |
| Memory reuse rate (Year 2 same ERP) | > 80% accounts hit firm memory |
| Memory-only accuracy (same ERP) | > 95% on confirmed set |
| TRUSTED patterns | > 0 after multi-reviewer reuse cycle |

---

## Anti-patterns

- Do not claim Client 2 results prove cross-ERP generalization
- Do not auto-approve TRUSTED suggestions without human review in pilot
- Do not copy Shalfa patterns into another client's organization

---

## References

- `docs/operations/firm-memory-deployment-runbook.md`
- `docs/operations/parallel-execution-cycle-TB-MEMORY.md`
