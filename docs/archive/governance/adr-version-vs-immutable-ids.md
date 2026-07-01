# ADR-001: Version vs Immutable IDs — Operational Policy

> **Status:** ✅ **Approved — Policy in Effect**
> **Date:** 2026-06-30
> **Type:** Architecture Decision Record (Governance)
> **Governing Model:** M2 Knowledge Data Model v1.2 (§4 Immutable IDs Rule)
> **Prerequisite:** M2 Baseline v1.2 Freeze (in effect)

---

## 1. Problem

The M2 Knowledge Data Model §4 establishes an **Immutable IDs Rule**: when a claim, evidence, decision, or authority substantively changes, a new ID must be created and the old entity superseded.

However, entities also carry a `version` field (SemVer, e.g., `1.0`, `1.1`, `2.0`). The tension is:

> **Immutable IDs Rule says:** "create new ID on change."
> **Version field says:** "increment version, keep same ID."

Without an operational policy defining the boundary between "minor change" (version increment, same ID) and "substantive change" (new ID + `SupersededBy`), automated tooling cannot function deterministically, and manual operators lack clear guidance.

---

## 2. Decisions Required

| Decision | Question |
|----------|----------|
| D-01 | What constitutes a "metadata-only" change vs a "substantive" change? |
| D-02 | Does a score change on Evidence require a new EV-ID or just a version bump? |
| D-03 | Does changing a Claim's `dimension` require a new CLM-ID? |
| D-04 | Does updating an Authority's governing document reference require a new AUTH-ID? |
| D-05 | Does a Decision's review date extension require a new DEC-ID or just a version bump? |
| D-06 | What is the policy for `SupersededBy` and `Supersedes` fields on entity replacement? |

---

## 3. Proposed Resolution

### 3.1 Policy Rules

| Change Type | Examples | Rule | M2 Clauses Affected |
|-------------|----------|------|-------------------|
| **Metadata only** | Fix typo in `claimText` or `description`, update `freshness.expires`, fix formatting in `rationale` | Version increment only (e.g., `1.0` → `1.1`) | §2.3–2.6 (Version fields), §4 (Immutable IDs) |
| **Scope adjustment** | Expand or narrow claim scope, change `dimension`, change `confidence` level | **New ID** + `SupersededBy` on old entity | §4 (Immutable IDs), §2.3 (Claim ID pattern) |
| **Score change** | Evidence `score` changes (0→1, 2→3), `strength` changes (Weak→Strong) | **New EV-ID** + `SupersededBy` on old evidence | §4 (Immutable IDs), §2.4 (Evidence ID pattern) |
| **Authority change** | Claim's governing authority document is updated but claim substance stays the same | Version increment only (authority ref is a relation, not claim substance) | §2.3 (Claim authorities field) |
| **Decision outcome change** | `accepted`/`rejected`/`conditions` lists change, decision type changes | **New DEC-ID**, old set to `Superseded` | §2.6 (Decision ID pattern), §8 (Supersession Rules) |
| **Decision review extension** | Review date extended, decision reaffirmed unchanged | Amendment only (same DEC-ID, version bump, new `reviewDate`) | §8 (Supersession Rules) |
| **Entity deprecation** | Product is archived, Knowledge Area is merged | **SupersededBy** set on old entity, no new ID needed for the deprecation itself | §4 (Immutable IDs), §2.1–2.6 |
| **Authority document update** | Authority doc content changes but AUTH-ID remains the same authority | Version increment on Authority entity. AUTH-ID is tied to the **area/gov function**, not the document version. | §2.5 (Authority ID pattern) |

### 3.2 Decision Outcomes

| Decision | Resolution | Rationale |
|----------|-----------|-----------|
| D-01 | **Metadata = version only; substance = new ID** | Text changes that do not alter meaning or scope are metadata. Any change to `dimension`, `confidence`, `score`, `strength`, or accepted/rejected lists is substantive. |
| D-02 | **New EV-ID required** | Score and strength are the primary assertion of evidence quality. Changing them invalidates the evidence's original claim support. |
| D-03 | **New CLM-ID required** | `dimension` is a core attribute of a claim (Implementation Reality vs Strategic Intent). Changing it creates a fundamentally different governance claim. |
| D-04 | **Version increment only** | AUTH-ID identifies the governance function/area, not the document snapshot. Document updates are new versions of the same authority. |
| D-05 | **Version increment only** | Review dates are administrative. A reaffirmed decision with an extended review date is the same decision. |
| D-06 | **Both fields mandatory on replacement** | When entity A is replaced by entity B: A.`supersededBy` = B.id AND B.`supersedes` = A.id. Both fields must be set to maintain bidirectional traceability. |

---

## 4. Impact on M2 Baseline

| Check | Result |
|-------|--------|
| New entity needed? | ❌ No |
| New relationship needed? | ❌ No (C14: Authority supersedes Authority covers the pattern) |
| New cardinality needed? | ❌ No |
| New ID pattern needed? | ❌ No |
| New governance rule needed? | ❌ No (GR-001 Immutable IDs already covers this — policy clarifies, doesn't add) |
| **M2 Change Required?** | **NO ✅** |

---

## 5. Operational Guidance

### 5.1 Quick Reference

| If you want to... | Do this |
|------------------|---------|
| Fix a typo in claim text | Version bump: `1.0` → `1.1` |
| Change a claim from L5 to L4 | New CLM-ID: `CLM-AREA-0002` supersedes `CLM-AREA-0001` |
| Update evidence expiry date | Version bump: `1.0` → `1.1` |
| Increase evidence score from 1 to 3 | New EV-ID: `EV-0002` supersedes `EV-0001` |
| Extend a decision's review date | Version bump on same DEC-ID |
| Change what a decision accepted/rejected | New DEC-ID: `DEC-2026-0005` supersedes `DEC-2026-0004` |
| Merge two Knowledge Areas | SupersededBy on old KAs referencing new KA |

### 5.2 `SupersededBy` / `Supersedes` Enforcement

Both fields must always be set together:

```text
Entity-A (old):
  supersededBy: "Entity-B"

Entity-B (new):
  supersedes: "Entity-A"
```

This ensures bidirectional traceability. A validator (GR-001) should flag any superseded entity that lacks a matching supersedes reference on the successor.

---

## 6. Next Steps

1. ✅ Policy approved and documented
2. Implement GR-001 rule validation for bidirectional Supersedes/SupersededBy enforcement
3. Add operational guidance to operator runbook
4. Train governance operators on the quick reference table
