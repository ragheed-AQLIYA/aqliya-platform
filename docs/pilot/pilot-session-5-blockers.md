# Pilot Session 5 — Blocker Log

| Blocker ID | Classification | Description | Impact | Workaround | Requires code change? | Priority to fix |
|---|---|---|---|---|---|---|
| B-001 | P0 + Governance | Governance allows any reviewer to override AI mapping silently — no second approval required on high-risk accounts | Control accounts (cash, intercompany) can be misclassified with no oversight | Manual supervisor check outside system | Y | Critical |
| B-002 | P0 + Mapping | AI mapped ~15% of accounts to "Unallocated" due to unrecognised account code prefixes in source TB | Reviewers had to manually research and remap each one | Maintain a sidecar Excel of manual overrides | Y | Critical |
| B-003 | P1 + Workflow | No bulk-select / batch-approve for evidence items — reviewers must click each row individually | ~40 min added per session for high-volume evidence review | Reviewers used browser multi-tab hack to speed up | Y | High |
| B-004 | P1 + Evidence | Evidence panel does not show file upload timestamps or uploader identity | Reviewer cannot assess recency or source reliability of uploaded evidence | Cross-reference file metadata via OS file explorer | N | High |
| B-005 | P1 + Data | Source TB had 3 different subtotal styles (intermediate sums, category totals, grand total) — system treated subtotals as data rows, double-counting balances | TB balance totals were inflated by ~23% | Reviewers manually subtracted subtotal rows from totals | Y | High |
| B-006 | P1 + Data | Opening balance column in source TB was misread as a second current-period value by parser | Prior-period comparisons unavailable during review | Reviewers manually checked prior period PDFs | Y | High |
| B-007 | P2 + Workflow | Column sort in evidence list resets when reviewer returns from viewing a file | Reviewer loses place in long evidence queues | Reviewer screenshotted evidence list before clicking in | N | Low |
| B-008 | P2 + Workflow | Scroll position in the mapping panel resets after every override confirmation | Reviewer must re-scroll to find next unmapped account | No viable workaround — minor annoyance | N | Low |
| B-009 | P2 + Mapping | Account code "0000" appears in 3 different categories with different descriptions across TB tabs | Reviewer confused about which category to map to | Cross-referenced TB tab context manually | Y | Medium |
| B-010 | Governance | Governance rule "require evidence for balances >10% of total" did not trigger for accounts with zero balance but high activity | High-volume low-balance accounts were not flagged for evidence review | Reviewers manually flagged these accounts | Y | Medium |
| B-011 | Governance | No audit trail visible in UI for why a governance rule fired (or did not fire) | Reviewer distrust in governance logic — could not verify correctness | No workaround; reviewer had to trust blindly | Y | High |
| B-012 | Data | Source TB used merged cells in header rows — parser assigned wrong column labels to ~8% of data columns | Some account balances were mapped to wrong nominal categories | Reviewers manually corrected column assignments | Y | High |
