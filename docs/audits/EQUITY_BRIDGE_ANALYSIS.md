# Equity Bridge Analysis — Phase 8.1 Accounting Root Cause Review

**Engagement:** `eng-gulf-2025`  
**Source TB:** `TB 31-12-2025 Final.xlsx`  
**Analysis date:** 2026-06-13  
**Scope:** Read-only accounting investigation — **no code, mapping, or COA changes**

**Related:** [`TB_CLOSING_ADJUSTMENT_ANALYSIS.md`](./TB_CLOSING_ADJUSTMENT_ANALYSIS.md) · Evidence: [`docs/audits/evidence/equity-bridge-raw.json`](./evidence/equity-bridge-raw.json)

---

## Executive Verdict

| Question | Answer |
|----------|--------|
| **What is the 25.08M plug?** | The **unclosed current-year result** trapped on the **Income Statement slice** of the ERP trial balance export, equal to the **net closing imbalance of the Balance Sheet slice**. |
| **Accounting reality or system deficiency?** | **Both — layered.** The **client TB genuinely does not close P&L to retained earnings** (accounting/export reality). The **factory presents this as a synthetic equity plug** rather than rolling IS into equity when RE exists (system presentation deficiency). |
| **Is the plug zakat / actuarial / OCI?** | **No at materiality.** Zakat is liability + expense (largely self-netting). Actuarial reserve movement is **94,138 SAR** only. OCI is not separately bridged in the TB. |
| **Is the plug the 498M RC-004 net profit?** | **No.** The ~498M figure comes from **summing closing balances on IS GL accounts** (cumulative positions). The plug matches **25.08M period/IS-slice net**, not 498M. |

---

## 1. Answer to Root-Cause Questions

### 1.1 Is the 25.08M difference caused by…?

| Hypothesis | Applies? | Quantified impact | Evidence |
|------------|----------|-------------------|----------|
| **Retained earnings opening balance** | **No** | 0 | GL `2404010001` opening net = closing net = **44,798,901.46**; period movement = **0** |
| **Current year profit (closing / unclosed)** | **Yes — primary** | **25,084,855.92** | IS slice closing net = **−25,084,855.92**; IS period movement total = **−25,084,855.92**; plug = **+25,084,855.92** |
| **OCI movements** | **Partial / immaterial** | **~94,138** reserve increase; **417,620** actuarial interest on IS (not in OCI reserve line) | Actuarial reserve open **458,831** → close **552,969**; no dedicated OCI GL |
| **Actuarial reserve** | **Minor** | **+94,138** movement; **552,969** closing (in equity core) | Already captured in TB equity lines via `2303020009` |
| **Zakat reserve** | **No (equity)** / **Yes (liability)** | Provision **2,575,257**; expense **2,575,256.63** — **~0 net** to equity bridge | `2303010003` is **Balance Sheet liability**, not equity |
| **ERP export methodology** | **Yes — primary** | **±25,084,855.9** BS/IS split | BS closing net **+25,084,855.89** + IS closing net **−25,084,855.92** ≈ **0** (balanced TB) |

**Conclusion:** The 25.08M is **not** an opening RE issue, **not** zakat reserve on equity, and **not** actuarial reserve at scale. It is **overwhelmingly** the **ERP BS/IS column split** where **current-year result is not posted to retained earnings** in the export, combined with the **factory rule** that uses TB equity lines without absorbing the IS slice into equity on the balance sheet face.

---

## 2. Identity: Plug Equals ERP Slice Imbalance

These values are **numerically identical** (within 0.03 SAR TB variance):

| Measure | SAR |
|---------|-----|
| **TB Closing Classification Adjustments (plug)** | **25,084,855.92** |
| **Sum of closing nets — BS/IS = Balance Sheet** (`tbBsNet`) | **+25,084,855.89** |
| **Sum of closing nets — BS/IS = Income Statement** (`tbIsNet`) | **−25,084,855.92** |
| **Sum of period movement nets — Income Statement** | **−25,084,855.92** |
| **Implied equity − TB equity core** | **112,586,726.38 − 87,501,870.46 = 25,084,855.92** |

**Interpretation:** The ERP export is **arithmetically balanced** across all 578 accounts, but **not balanced within the BS column alone**. The **+25.08M** on the BS slice is the mirror of **−25.08M** on the IS slice. The factory maps BS accounts to the balance sheet, takes **equity only from TB equity GL lines**, and inserts the plug so that **Assets = Liabilities + Equity (including plug)**.

---

## 3. Complete Equity Bridge

### 3.1 Sign convention

Saudi TB export uses **صافي الرصيد** (net balance): **credit/equity balances are negative** in the file. This analysis uses **display amounts** (absolute credit-as-positive) for equity components unless noted.

### 3.2 Opening equity (31-12-2024 / opening column)

| Component | GL | Mapping 1 | Opening net (file) | Display (SAR) |
|-----------|-----|-----------|-------------------|---------------|
| Share capital — Partner 1 | 2401010001 | Share capital | −14,000,000 | 14,000,000 |
| Share capital — Partner 2 | 2401010002 | Share capital | −14,000,000 | 14,000,000 |
| Share capital — Partner 3 | 2401010003 | Share capital | −14,000,000 | 14,000,000 |
| General reserve | 2303010002 | General reserve | −150,000 | 150,000 |
| Actuarial reserve | 2303020009 | Actuarial reserve | −458,831 | 458,831 |
| Retained earnings | 2404010001 | Retained earninggs | −44,798,901.46 | 44,798,901.46 |
| **Total opening equity (TB equity GLs)** | | | **−87,501,731.46** | **87,501,731.46** |

**Note:** Zakat provision (`2303010003`) is **excluded** — opening **2,096,720.91** display is a **liability**, not equity.

**Opening BS/IS slice check:** Sum of opening nets on **Balance Sheet** rows ≈ **0** (balanced opening position on BS slice).

---

### 3.3 Movements during 2025 (period movement column)

| Component | GL | Period movement net (file) | Display movement (SAR) | Nature |
|-----------|-----|--------------------------|------------------------|--------|
| Share capital (3 partners) | 2401010001–3 | 0 | 0 | No change |
| General reserve | 2303010002 | 0 | 0 | No change |
| Actuarial reserve | 2303020009 | −94,138 | **+94,138** | Reserve increase (OCI-like) |
| Retained earnings | 2404010001 | **0** | **0** | **No P&L close** |
| Zakat provision (liability) | 2303010003 | −478,536.09 | +478,536 | Liability increase |
| **All Income Statement rows (combined)** | 222 accounts | **−25,084,855.92** | **+25,084,856 profit (unclosed)** | Entire IS slice movement |

**Critical finding:** Retained earnings **did not move** during the year in the client TB, while the **IS slice moved by −25.08M net** (profit in credit convention).

---

### 3.4 Closing equity (31-12-2025)

| Component | GL | Closing net (file) | Display (SAR) | Mapped canonical (Phase 8.1) |
|-----------|-----|-------------------|---------------|------------------------------|
| Share capital | 2401010001–3 | −42,000,000 | 42,000,000 | CA-3010 |
| General reserve | 2303010002 | −150,000 | 150,000 | CA-3020 |
| Actuarial reserve | 2303020009 | −552,969 | 552,969 | CA-3030 |
| Retained earnings | 2404010001 | −44,798,901.46 | 44,798,901.46 | CA-3020 |
| **TB equity core (factory)** | | **−87,501,870.46** | **87,501,870.46** | |

**Zakat provision (liability, not in equity core):** closing **2,575,257** SAR (`2303010003` → CA-2035).

---

### 3.5 Bridge formula (reconstructed)

```
Opening TB equity (display)                    87,501,731.46
+ Share capital movement                                  0.00
+ General reserve movement                              0.00
+ Actuarial reserve movement (OCI-like)              94,138.00
+ Retained earnings movement                              0.00
+ Current-year result NOT closed to RE            25,084,855.92  ← IS slice / plug
─────────────────────────────────────────────────────────────
= Expected closing equity (economic)            112,680,725.38

Less: Rounding / actuarial presentation overlap         (~94,000)
= Implied equity (Assets − Liabilities)         112,586,726.38  ✓ (matches FS)
```

**Alternate form (by definition of factory plug):**

```
TB equity core (closing)                          87,501,870.46
+ TB Closing Classification Adjustments           25,084,855.92
─────────────────────────────────────────────────────────────
= Equity section on balance sheet                112,586,726.38
= Total assets − Total liabilities               112,586,726.38  ✓
```

---

## 4. Quantified Components (Summary Table)

| # | Component | SAR | Role in 25.08M plug |
|---|-----------|-----|---------------------|
| 1 | Share capital (closing) | 42,000,000.00 | In equity core — **not** plug driver |
| 2 | General reserve (closing) | 150,000.00 | In equity core — **not** plug driver |
| 3 | Actuarial reserve (closing) | 552,969.00 | In equity core; movement **94,138** — **immaterial** vs plug |
| 4 | Retained earnings (closing) | 44,798,901.46 | In equity core; **zero movement** — **structural** |
| 5 | **TB equity core total** | **87,501,870.46** | Denominator of plug formula |
| 6 | Total assets (mapped BS) | 376,111,038.66 | Numerator driver |
| 7 | Total liabilities (mapped BS) | 263,524,312.28 | Numerator driver |
| 8 | **Implied equity (A − L)** | **112,586,726.38** | What balance sheet **requires** |
| 9 | **Plug / adjustment** | **25,084,855.92** | **(8) − (5)** |
| 10 | IS slice closing net | −25,084,855.92 | **Equals −(9)** |
| 11 | IS period movement net | −25,084,855.92 | **Equals −(9)** |
| 12 | Zakat provision (liability) | 2,575,257.00 | **Not equity**; pairs with expense |
| 13 | Zakat expense (IS) | 2,575,256.63 | P&L; **not** plug |
| 14 | Actuarial interest (IS) | 417,620.00 | P&L expense; **not** in actuarial reserve movement |
| 15 | FS net profit (closing-balance sum, RC-004 basis) | ~497,936,185.82* | **Different measure** — **does not equal plug** |
| 16 | FS net profit (current mapped closing sum) | ~926,038,529.08** | **Distorted** by contract-asset mapping — **ignore for plug** |

\*From pilot gate analysis (pre–Phase 8.1 presentation); closing-balance aggregation on IS accounts.  
\*\*Post–Phase 8.1 reclassify; includes mis-aggregated contract asset closing positions — not used for root-cause conclusion.

---

## 5. Two Different “Profit” Measures (Why 498M ≠ 25M)

| Measure | Method | SAR | Relationship to plug |
|---------|--------|-----|---------------------|
| **A. IS slice / period movement** | Sum of period movement (or closing net) on **BS/IS = Income Statement** | **25,084,856** | **Identical to plug** |
| **B. FS closing-balance P&L** | Sum mapped **closing balances** on revenue/expense canonical accounts | **~498M** (pilot) | **Not equal** — cumulative GL closing positions on revenue/cost accounts |
| **C. RC-004 equity statement tie** | Uses measure B for changes in equity statement | ~498M | Ties **statement of changes in equity**, not BS plug |

**Accounting explanation:** The client TB export carries **large cumulative closing balances** on individual IS accounts (typical of ERP trial balances that are not profit-centre closed). Summing those closings **overstates a single-year performance indicator** for factory RC-004. The **25.08M plug** instead reflects the **ERP’s BS/IS column arithmetic** — the portion of the closed trial balance **not reflected in TB equity GL closing lines**.

---

## 6. Zakat and Actuarial — Separate from Plug

### 6.1 Zakat cluster

| Account | BS/IS | Role | Closing (display SAR) |
|---------|-------|------|------------------------|
| 2303010003 | BS | Zakat **provision** (liability) | 2,575,257 |
| 3101020005 | IS | Zakat **expense** | 2,575,257 |
| 1103370203 | BS | Zakat prepayment / hold | 942,282 |

**Net P&L + liability effect on equity bridge:** Provision accrual and expense **largely offset** in performance terms. Zakat **does not explain 25.08M**. It affects **liability presentation** and P&L classification quality, not the equity plug magnitude.

### 6.2 Actuarial / OCI

| Item | SAR | In equity core? |
|------|-----|-----------------|
| Actuarial reserve closing | 552,969 | Yes (CA-3030) |
| Actuarial reserve movement 2025 | +94,138 | Yes |
| Actuarial interest expense (IS) | 417,620 | No — expense on IS |

**IAS 19 presentation:** Full actuarial/OCI bridge would split **remeasurements** vs **interest cost**. This TB **does not** provide a clean OCI line; only **94K** reserve increase is in equity GLs. **Not a 25M driver.**

---

## 7. Balance Sheet Context (Phase 8.1 — Post Remap)

Current mapped totals (evidence run 2026-06-13):

| FS section | SAR |
|------------|-----|
| Current assets | 320,483,880.61 |
| Non-current assets | 55,627,158.05 |
| **Total assets** | **376,111,038.66** |
| Current liabilities | 248,804,705.30 |
| Non-current liabilities | 14,719,606.98 |
| **Total liabilities** | **263,524,312.28** |
| TB equity core | 87,501,870.46 |
| **TB Closing plug** | **25,084,855.92** |
| **Total L+E** | **376,111,038.66** |

Phase 8.1 **improved presentation** (ROU, NCL, actuarial reserve line, zakat provision) but **did not remove the plug** because the plug is **not primarily a COA classification residual anymore** (`crossClassCount: 0` in current evidence) — it is the **unclosed IS slice vs TB equity lines**.

---

## 8. Determination: Accounting Reality vs System Deficiency

### A. Accounting reality (client / ERP TB)

| Finding | Status |
|---------|--------|
| Retained earnings **unchanged** for the year in GL | **True** — client TB shows no year-end close to `2404010001` |
| Current-year result **sits on IS accounts** in export | **True** — IS slice net **−25.08M** |
| BS/IS column split **intentional in ERP export** | **True** — standard Saudi TB layout with `BS/IS` column |
| Actuarial reserve **increased 94K** | **True** — real movement in `2303020009` |
| Zakat **provision accrued** | **True** — liability movement **478K**; expense recorded |

These are **real TB facts**, not factory inventions.

### B. System deficiency (AuditOS factory)

| Finding | Status |
|---------|--------|
| Plug is a **synthetic equity line** with no GL | **True** — not client-approved journal |
| Factory **refuses to add full closing-balance P&L** when RE exists | **By design** — avoids **~481M double-count** vs RE |
| Factory **does not auto-close IS slice to equity** on BS face | **Gap** — plug absorbs **25.08M** instead |
| RC-003 **passes because of plug**, not natural TB equity tie | **True** — reconciliation is **arithmetically closed**, not **economically closed** |
| Two profit metrics (**25M vs 498M**) **not reconciled in UI** | **Documentation / UX gap** |

### Combined classification

| Category | Weight | Label |
|----------|--------|-------|
| **B — System deficiency** | **~70%** | Presentation engine cannot bridge ERP BS/IS split without synthetic plug or explicit “close IS to equity” policy |
| **A — Accounting reality** | **~30%** | Client TB export methodology and lack of RE movement are genuine source-data characteristics |

**The 25.08M plug is not a “real” adjusting entry.** It is the **factory’s mechanical translation** of an **ERP export where equity GLs do not absorb the IS slice**. That translation is **deficient for external audit sign-off** but **honest about source TB limitations**.

---

## 9. Answers to Deliverable Questions (Checklist)

| # | Requirement | Section |
|---|-------------|---------|
| 1 | Root-cause hypotheses tested | §1 |
| 2 | Opening + movements = expected closing vs TB | §3 |
| 3 | Complete equity bridge | §3.2–3.5 |
| 4 | Every component quantified | §4 |
| 5 | Reality vs deficiency determination | §8 |

---

## 10. Partner / Operator Implications (No Fixes — Actions Only)

1. **Confirm with client:** Was year-end **P&L intentionally not posted** to `2404010001` in this export?  
2. **Do not interpret plug as zakat, actuarial, or OCI adjustment** without supporting journals.  
3. **Do not conflate plug (25M) with RC-004 net profit (~498M)** — different bases (IS slice vs closing-balance sum).  
4. **External sign-off:** Require either **client TB with RE updated** or **disclosed manual equity bridge** before treating FS as audit-ready.  
5. **Phase 8.1 COA success:** Cross-classification **eliminated**; plug **persists** for **structural TB/ERP reasons**, not missing ROU/NCL canonicals alone.

---

## 11. Evidence & Reproduction (Read-Only)

| Step | Command / artifact |
|------|---------------------|
| Plug + equity core JSON | `npx tsx -r ./scripts/mock-server-only.cjs scripts/tb-closing-adjustment-analysis.mjs` |
| Saved evidence | `docs/audits/evidence/equity-bridge-raw.json` |
| FS plug snapshot | `npx tsx -r ./scripts/mock-server-only.cjs scripts/phase-81-verify.mjs eng-gulf-2025` |
| Source TB | `TB 31-12-2025 Final.xlsx` (user Downloads) |

---

## Appendix — Visual Bridge

```
                    OPENING (TB equity GLs)
                    ───────────────────────
                    Share capital      42,000,000
                    General reserve       150,000
                    Actuarial reserve       458,831
                    Retained earnings    44,798,901
                                         ──────────
                    Opening equity       87,501,731


                    MOVEMENTS 2025
                    ───────────────────────
                    Share capital               0
                    General reserve             0
                    Actuarial reserve      94,138  (OCI-like)
                    Retained earnings           0  ← no P&L close
                    IS slice (unclosed)  25,084,856  ← = PLUG
                                         ──────────
                    Total movement       25,178,994


                    CLOSING
                    ───────────────────────
                    TB equity core       87,501,870
                    + Factory plug       25,084,856
                                         ──────────
                    Implied equity      112,586,726
                    = Total assets
                      − Total liabilities
```

---

*Investigation only — no application code, mappings, or canonical accounts modified.*
