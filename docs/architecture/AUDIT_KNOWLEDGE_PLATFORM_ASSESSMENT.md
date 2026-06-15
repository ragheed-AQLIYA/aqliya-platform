# Audit Knowledge Platform Assessment

**Date:** 2026-06-15  
**Updated:** 2026-06-15 (post–Release Hardening)  
**Baseline:** `main` @ `291adda`  
**Evidence:** Phase 3A–3D artifacts, Shalfa pilot benchmarks, governance on `main`  
**Principle:** AI assists. Humans decide. Evidence governs.

---

## Positioning Question

Can AuditOS be positioned as an **Audit Knowledge Platform** instead of an **AI Classification Platform**?

**Answer: YES — with explicit boundaries.**  
Evidence supports **same-ERP reuse**; does **not** support general AI classifier or cross-ERP claims.

---

## Evidence Summary (Shalfa)

| Layer | Result | Implication |
| ----- | ------ | ----------- |
| Rules only | ~11% | Not the moat |
| Local AI | ~20% | Assist tier only — deferred |
| Hybrid / ERP hints | ~48% | Useful, not durable alone |
| Firm Memory (same ERP) | **100%** (578/578) | Technical replay proven |
| Hold-out (no memory) | **46.1%** | Closes cross-ERP generalization claims |
| TRUSTED auto-suggest (Year 1) | **0%** | Governance working; economics **not** proven |
| Reuse rate (Year 1) | **0%** | Expected — no Year 2 pass yet |

---

## Strengths

1. **Firm Memory** — confirmations become org-scoped reusable patterns
2. **Governance** — CONFIRMED ≠ TRUSTED; TRUSTED requires ≥5 hits + ≥2 reviewers
3. **Factory stack** — FS, presentation policies, IFRS/SOCPA on `main`
4. **Human-in-the-loop** — memory writes on confirm; no autonomous certification
5. **Released Baseline** — code on `origin/main`, tag `release-hardening-pr5`

---

## Weaknesses

1. **Cross-ERP generalization** — hold-out 46.1%; do not sell universal mapping
2. **Memory economics unproven** — reuse rate 0%, TRUSTED 0, **review hours saved not measured**
3. **Staging deploy** — not proven on real infra (AWS gate)
4. **Commercial validation** — Client #2/#3 not run
5. **R-013 cash flow** — operating logic real; investing/financing need prior-period data

---

## Moat Analysis

```text
Durable moat (if proven) = Audit Factory workflow
                         + Accumulated Firm Memory (per org / same ERP chart)
                         + Governance trust lifecycle
                         + Evidence-linked mappings
                         + Lower human review effort (Year 2 vs Year 1)  ← NOT PROVEN YET

NOT moat = LLM classification accuracy alone
         = RAG / embeddings (deferred)
         = Cross-client zero-shot generalization
         = "80% reuse" without hours saved
```

**Commercial framing (allowed today):**

> AuditOS captures how your firm mapped, reviewed, and confirmed accounts — and is designed to reuse that knowledge on the next engagement with the **same ERP**.

**Commercial framing (requires Cycle 2 proof):**

> AuditOS reduces mapping review hours on repeat engagements.

---

## Commercial Implications

| Claim | Allowed? |
| ----- | -------- |
| "Learns from your firm's confirmed mappings" | ✅ Same ERP only |
| "100% replay on repeated Shalfa chart" | ✅ With pilot caveat |
| "AI auto-mapping you can trust blindly" | ❌ |
| "Works on any ERP out of the box" | ❌ |
| "TRUSTED memory reduces review burden" | ⏳ After governance + Client #2 hours KPI |
| "Replaces auditors" | ❌ |

---

## Cycle 2 Proof Points (priority order)

| KPI | Measures | Source |
| --- | -------- | ------ |
| Memory reuse rate | Memory adoption | `tb-memory-reuse-rate.mjs` |
| Memory-only accuracy | Memory correctness | `phase-3c:validate` |
| TRUSTED pattern growth | Governance maturity | `phase-3d:validate-governance` |
| **Human review hours saved** | **Economic value** | **Manual time study — Year 1 vs Year 2** |

Clients buy **hours saved**, not percentage reuse alone.

---

## Verdict

**Audit Knowledge Platform positioning is evidence-backed** for pilot and same-ERP technical replay.

**AI Classification Platform positioning should remain retired** in commercial copy.

**Economic moat is not proven** until Client #2/#3 demonstrate lower review effort — not higher accuracy alone.

**Next work:** Cycle 2 measurement — **not** Local AI, RAG, or Trust Dashboard until commercial validation path is clearer.
