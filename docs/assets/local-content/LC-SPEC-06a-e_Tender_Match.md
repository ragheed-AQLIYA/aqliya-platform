# LC-SPEC-06a: Domain Specification — Tender Match

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28
> **Parent:** `LC-PRD-06_Tender_Match.md` | **Template:** LC-SPEC-01a

---

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Evidence Classification** | Executive Evidence |

**Entities:** Tender spec stored as JSON in `LocalContentProject.metadata`, no separate model. Match report is computed at query time.

**No schema change required.** Tender spec uses existing `metadata` JSON field.

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ `tender-matching.ts` with types, parsing, matching logic |
| **Documented** | ✅ This spec retroactively describes existing domain |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

# LC-SPEC-06b: API Specification — Tender Match

> **Status:** Draft v0.1 | **Parent:** `LC-PRD-06` | **Template:** LC-SPEC-01b

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Evidence Classification** | Executable Evidence |

| Action | Signature | Returns | Permission |
|---|---|---|---|
| `getLocalContentTenderMatchAction` | `(projectId) ⇒ ActionResult<TenderMatchReport>` | Match report | `view` |

No audit event (read-only computation).

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ `getLocalContentTenderMatchAction` in localcontent-actions.ts |
| **Documented** | ✅ This spec retroactively describes existing API surface |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

# LC-SPEC-06c: Workflow Specification — Tender Match

> **Status:** Draft v0.1 | **Parent:** `LC-PRD-06` | **Template:** LC-SPEC-01c

| Field | Value |
|---|---|
| **Evidence Classification** | Governance Evidence |

```
1. Project metadata includes tender spec (optional JSON block)
2. User views Tender Match page
3. Server:
   a. Parses tender spec from metadata
   b. Fetches supplier + spend data
   c. Builds match report (deterministic, no AI)
   d. Returns report with fit level + warnings
4. UI renders bilingual report with pass/conditional/fail indicator
```

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ Read-only computation in `tender-matching.ts` |
| **Documented** | ✅ This spec retroactively describes existing workflow |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

# LC-SPEC-06d: UX Specification — Tender Match

> **Status:** Draft v0.1 | **Parent:** `LC-PRD-06` | **Template:** LC-SPEC-01d

| Field | Value |
|---|---|
| **Evidence Classification** | Executive Evidence |

### Screen (`/local-content/[projectId]/tender-match`)

| Element | Behavior |
|---|---|
| Fit level badge | green (pass), yellow (conditional), red (fail) |
| Tender title | Bilingual from metadata |
| Score cards | localContent%, nonLocalSpend%, supplier counts |
| Category match table | Category + matched + missing |
| Warnings list | Bilingual violation messages |

### Navigation

| Link | Arabic Label |
|---|---|
| `/local-content/[projectId]/tender-match` | مطابقة المناقصة |

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ `tender-match-view.tsx` with bilingual report rendering |
| **Documented** | ✅ This spec retroactively describes existing UX |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

# LC-SPEC-06e: Test Specification — Tender Match

> **Status:** Draft v0.1 | **Parent:** `LC-PRD-06` | **Template:** LC-SPEC-01e

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Evidence Classification** | Executable Evidence |

### Test File

| File | Tests | What It Tests |
|---|---|---|
| `tender-matching.test.ts` | 3+ | Parsing, comparison, fit level |

### Key Scenarios
```
✓ Parses tender from valid project metadata
✓ Fails when local content below min
✓ Passes when spend and suppliers meet tender
✓ Correct fit level calculation
✓ Bilingual warning generation
```

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ `tender-matching.test.ts` with passing tests |
| **Documented** | ✅ This spec retroactively describes existing test coverage |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

## Freeze Checklist — LC-EPIC-06

| Check | Status |
|---|---|
| Blueprint Traceability | ✅ LC-EPIC-06 mapped from Capability Backlog |
| All 5 Specs Frozen | ✅ LC-PRD-06 + LC-SPEC-06a–06e |
| Code Evidence Verified | ✅ tender-matching.ts, .test.ts, tender-match-view.tsx |
| Architecture Drift | None |
