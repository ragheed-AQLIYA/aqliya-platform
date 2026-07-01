# Cycle 2 — Assumption Risk Register

**Audit date:** 2026-06-15  
**Purpose:** Hidden assumptions that could invalidate economics claims

---

| Assumption | Risk | Severity | Mitigation |
| ---------- | ---- | -------- | ---------- |
| **Same ERP / same GL chart** | Memory keyed by `organizationId + clientAccountCode` (`schema.prisma:3361`). Different chart → low reuse, false negative on economics | **Critical** | Client #2 must use same chart; document chart ID. Do not claim cross-ERP (`hold-out ~46.1%`) |
| **Same organization tenant** | Patterns org-scoped. Copying across orgs invalid | **High** | Keep Client #2 in same `auditOrganization` as Shalfa baseline |
| **Year 1 time baseline exists** | No Shalfa review hours in repo | **High** | Start time log on first pass; do not compare Y2 to estimated Y1 |
| **Reviewers log time honestly** | Under/over-reporting breaks Tier 1 KPI | **High** | Wall-clock per session; same scope definition; audit partner spot-check |
| **Reviewer count / seniority constant** | 10 manager hours ≠ 10 partner hours | **High** | Log Senior / Manager / Partner separately; note headcount changes |
| **Manual confirm remains bottleneck** | High reuse in DB but reviewers re-check every line → no hours saved | **High** | Track auto-accept vs manual corrections; Tier 1 failure triggers process review |
| **Reuse rate ≠ hours saved** | `tb-memory-reuse-rate.mjs` counts classification source, not review behavior | **High** | Primary success = Hours Saved %; reuse is Tier 2 only |
| **TRUSTED requires 2 reviewers** | Single-reviewer backfill → 0 TRUSTED (`phase-3d` evidence) | **Medium** | Assign 2+ reviewers on Year 2 confirms |
| **TRUSTED requires hitCount ≥ 5** | First Year 2 pass may not reach TRUSTED | **Medium** | Measure TRUSTED growth over multiple confirms/periods |
| **Backfill vs live confirm** | `phase-3c:backfill` sets single reviewer — not representative of live TRUSTED path | **Medium** | Use live `confirmMappingAction` for Client #2; no backfill on C2 data |
| **Classification `source` field accuracy** | Reuse script trusts `TBClassificationHistory.source === "firm_memory"` | **Medium** | Spot-check history rows vs UI behavior |
| **Accuracy ≥ Year 1 undefined for new client** | New TB may differ from Shalfa audited FS | **Medium** | Define accuracy baseline per engagement (`phase-3c` or factory validate) |
| **KPI gaming** | Bulk confirm without review inflates reuse, not hours saved | **High** | Tier 1 hours gate; exception log for corrections |
| **Presentation profile mismatch** | Shalfa uses `pilot-audited`; generic default for new engagements | **Low** | Use `generic` unless audited reclass needed; do not mix profiles mid-study |
| **AWS / staging drift** | Measurement on stale DB | **Medium** | `migrate deploy` + `migrate status` before run |
| **582 patterns ≠ economic proof** | Technical replay proven; economics not | **Critical** | Do not conflate Phase 3C JSON with Client #2 Economics Report |

---

## Invalidated Claims (do not make)

| Claim | Why invalid |
| ----- | ----------- |
| "Firm Memory reduces audit cost" | No hours saved data |
| "Works on any ERP" | Hold-out ~46.1% |
| "TRUSTED auto-suggest reduces review" | 0 TRUSTED at baseline |
| "Reuse 80% = success" | Checklist: insufficient without >25% hours saved |
| "Program complete" | Cycle 2 not executed |

---

## Monitoring triggers

| Signal | Action |
| ------ | ------ |
| Reuse ↑, hours flat | UX/trust investigation — reviewers not trusting suggestions |
| Hours ↓, accuracy ↓ | Stop — quality regression |
| Hours ↓, corrections flat | Possible gaming or scope change — audit scope definition |
| TRUSTED stuck at 0 | Reviewer count / hitCount — expected early; extend measurement window |
