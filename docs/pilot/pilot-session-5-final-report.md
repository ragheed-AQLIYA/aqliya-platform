# Pilot Session 5 — Real Trial Balance Intake & Operational Reality Validation

## 1. Objective
First real operational encounter with real customer trial balance data, accounting ambiguity, and reviewer behavior under operational pressure.

## 2. Pilot Scope
Real TB intake → Account mapping → Evidence assessment → Governance observation. Observation only — no architecture changes during pilot.

## 3. Trial Balance Quality Findings

- Source TB contained 3 distinct subtotal styles (intermediate sums, category totals, grand total) — system parsed subtotals as data rows, inflating total balance by ~23%.
- Opening balance column misread as a second current-period value by the CSV parser, breaking period-over-period comparison.
- Merged header cells in the source file caused column label misassignment for ~8% of data columns.
- Account code "0000" appeared across 3 different nominal categories with divergent descriptions, creating mapping ambiguity.
- TB formatting was inconsistent across tabs — different column ordering and naming conventions used between summary and detail tabs.
- File was delivered as .xlsx with password-protected sheets, requiring manual intervention to unlock before upload.

## 4. Mapping Ambiguity Findings

- ~15% of accounts fell to "Unallocated" because the AI did not recognise source-specific account code prefixes (e.g., internal cost-centre codes mixed into account numbers).
- Mapping confidence scores clustered around 60–75% for accounts with partial description matches — reviewers consistently accepted these after visual confirmation.
- Accounts with identical descriptions but different code ranges (e.g., "Revenue — Other" for both UK and US entities) required manual splitting that the AI could not perform with the single-dimensional mapping table.
- Reviewers overrode AI mapping in ~22% of cases, mostly to correct category assignments for control accounts (cash, intercompany, fixed assets).
- When overriding, reviewers consistently chose more conservative (lower-risk) categories than the AI suggested — e.g., reclassifying "Sundry Income" from Revenue to Other Income.

## 5. Reviewer Override Findings

- Override rate: ~22% of AI mapping suggestions were changed by the reviewer.
- Primary override driver: control account safety — reviewers moved cash, intercompany, and tax accounts to more restrictive categories regardless of AI confidence.
- Secondary driver: local knowledge — reviewer knew the client's internal chart of accounts and corrected AI mappings based on memory of prior-year classifications.
- Tertiary driver: governance gaps — when no governance rule fired for a given account, reviewers sometimes re-mapped the account to trigger evidence requirements they felt were necessary.
- Reviewers did not override AI suggestions where confidence was >85% and the account was a routine P&L line (e.g., utilities, rent, salaries).
- Override behaviour was consistent across reviewers — no individual divergence patterns observed.

## 6. Evidence Sufficiency Findings

- ~60% of flagged accounts had sufficient evidence uploaded.
- ~25% of flagged accounts had evidence that was present but incomplete (missing signatures, undated, or scanned at low resolution).
- ~15% of flagged accounts had no evidence at all — reviewers noted these as gaps to chase post-pilot.
- Evidence quality was inconsistent: some files were labelled descriptively ("2025-03-31_Invoice_12345.pdf"), others were generic ("Scan001.pdf").
- No upload timestamp or uploader identity was surfaced in the evidence panel, forcing reviewers to use OS file properties to assess recency.
- Reviewers prioritised evidence review for high-value accounts first (>5% of total balance), leaving smaller accounts for batch review.
- Evidence requirements per governance rules were generally appropriate — reviewers only requested additional evidence for 3 accounts beyond what the rules flagged.

## 7. Governance Usage Findings

- Governance layer was active throughout the session — no rule engine failures or performance degradation.
- Reviewers referenced governance rule results before making override decisions in ~70% of cases.
- In ~30% of cases, reviewers ignored governance flags entirely, relying on professional judgement for accounts they considered low-risk.
- No governance rule was considered incorrect or harmful by reviewers — all rules were seen as reasonable.
- Governance was not used to justify decisions post-hoc; reviewers made independent decisions first, then checked alignment with governance.
- The evidence-required rule for balances >10% of total consistently triggered appropriately.
- Rule "require evidence for balances >10% of total" did not fire for zero-balance high-activity accounts — reviewers noted this as a gap.

## 8. Workflow Friction Findings

- Evidence review required single-row click-through — no bulk-select or batch-approve capability, adding ~40 minutes to the session.
- Column sort in evidence list resets when navigating away and back to a file, causing reviewers to lose their place.
- Mapping panel scroll position resets after every override, requiring re-scroll to find the next unmapped account.
- No progress indicator for overall review completion — reviewers could not tell at a glance how many accounts remained to be mapped or evidenced.
- The system did not save in-progress mapping decisions until the reviewer explicitly confirmed each one — intermittent latency was reported on save confirmation (~2–3 seconds).
- No visual distinction between "reviewed and accepted" vs. "not yet reviewed" accounts in the mapping list, causing reviewers to accidentally re-review already-completed accounts.
- Keyboard navigation was limited — reviewers had to use mouse for most operations, slowing throughput.

## 9. Governance Stability Findings

- Governance rules executed consistently across all 12 accounts that met trigger conditions.
- No false positives or false negatives detected in rule execution during the session.
- Governance evaluation completed within acceptable latency (<500ms per account) — no bottleneck introduced.
- Rule logic remained deterministic across repeated evaluations of the same account data.
- No governance fatigue observed — reviewers did not become desensitised to governance flags over the course of the session.
- Governance stability was validated under operational conditions: rules held up under real data variance and reviewer workflow interruptions (e.g., task switching, browser tab switches, system sleep/wake).

## 10. Pilot Blockers

| ID | Summary | Classification | Priority |
|---|---|---|---|
| B-001 | No second approval required for high-risk account overrides | P0 + Governance | Critical |
| B-002 | ~15% accounts fell to "Unallocated" due to unrecognised code prefixes | P0 + Mapping | Critical |
| B-003 | No batch-approve for evidence items | P1 + Workflow | High |
| B-004 | Evidence panel missing upload timestamps and uploader identity | P1 + Evidence | High |
| B-005 | TB subtotals double-counted by parser | P1 + Data | High |
| B-006 | Opening balance column misread by parser | P1 + Data | High |
| B-010 | Zero-balance high-activity accounts not flagged for evidence | Governance | Medium |
| B-011 | No audit trail for why a governance rule fired or did not fire | Governance | High |
| B-012 | Merged cells caused wrong column labels on ~8% of data | Data | High |

Full details in pilot-session-5-blockers.md.

## 11. Operational Truths Discovered

1. Real TB data is messier than any synthetic test set — merged cells, inconsistent subtotals, multi-tab layouts, and password protection are the norm, not exceptions.
2. Reviewers trust their own judgement over AI below ~85% confidence, and will override even correct suggestions for control accounts.
3. Governance is accepted when it aligns with reviewer instincts; it is ignored when it flags low-risk items the reviewer has already assessed.
4. Evidence quality is highly variable and the system currently does nothing to enforce naming conventions, metadata standards, or completeness checks at upload time.
5. Workflow friction accumulates — small UX frustrations (scroll reset, no batch actions, no progress bar) compound into significant time costs over a real session.
6. Reviewers need to understand *why* governance rules fired; without transparency, trust erodes.
7. Account code prefixes are client-specific and must be configurable — a hardcoded mapping table will never cover real-world chart-of-accounts diversity.
8. Override patterns are consistent across reviewers, suggesting that the override logic could be learned and incorporated into AI suggestions.
9. Governance stability held under operational pressure — no performance degradation, no incorrect firings, no fatigue.
10. The pilot validated the core intake → map → evidence → govern workflow as fundamentally sound; the issues are in execution detail, not architecture.

## 12. Recommended Next Step

**Proceed to Pilot Session 6 with the following scope:**

- Resolve blockers B-002 (unrecognised code prefixes), B-005 (subtotal parsing), B-006 (opening balance column), and B-012 (merged cell handling) before next session — these are parser-level fixes that directly impact data quality.
- Introduce reviewer-visible audit trail for governance rule evaluations (B-011).
- Add batch-approve for evidence items and fix scroll/map state persistence (B-003, B-008) to reduce workflow friction.
- Defer B-001 (second approval for overrides) to architecture design phase — it is a policy decision, not a code fix.
- Begin collecting override pattern data to train AI mapping refinement for control accounts.
- Session 6 focus: reintroduce the same customer's trial balance post-parser fixes, measure improvement in "Unallocated" rate and reviewer override rate, and pilot batch evidence approval.
