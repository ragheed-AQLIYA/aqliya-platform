# Knowledge Foundation — Tabletop Governance Exercise

> **Version:** 1.0  
> **Date:** 2026-06-21  
> **Status:** Approved (Phase 29 P1 — Exit Gate)  
> **Purpose:** Validate Phase 29 operational readiness using **documents only**  
> **Duration:** 2–3 hours (facilitated)  
> **Prerequisite docs:** All P0 + P1 documents in this folder

---

## 1. Exercise Objective

Prove that a **new operator** (non-developer) can execute the full governed lifecycle:

```text
Promotion → Binding → Approval → Release → Verify → Activate
    → Incident → Rollback → Audit Reconstruction (Day 30)
```

**Pass criterion:** Facilitator checklist 100% complete with document references cited for each step.

---

## 2. Participants

| Role | Person (fill in) | Simulated system role |
| ---- | ---------------- | --------------------- |
| Facilitator | | Observes; does not operate |
| Mining Reviewer | | OPERATOR |
| Release Operator | | OPERATOR |
| Release Approver | | ADMIN |
| Governance Auditor | | Read-only reviewer |
| Platform Ops | | Recovery / backup (Day 6 optional branch) |

**Rule:** Participants may use only:

- Documents in `docs/operations/knowledge-foundation/`
- Printed checklists from this script
- A **sandbox** or **role-play log** (not production unless explicitly scheduled)

They may **not** ask developers for ad-hoc steps.

---

## 3. Sandbox Setup (facilitator — before exercise)

- [ ] Staging environment available OR paper simulation with pre-seeded version IDs
- [ ] Test accounts: one OPERATOR, one ADMIN, one VIEWER
- [ ] At least 2 promoted mining candidates unbound
- [ ] One prior `ACTIVE` version exists (for rollback scenario)
- [ ] Audit history accessible at `/knowledge-foundation/history`
- [ ] Facilitator copy of this checklist

**Seed reference (staging):**

| Item | Example value | Notes |
| ---- | ------------- | ----- |
| Prior ACTIVE version | `v1.0.0` | Rollback target |
| New version | `v1.1.0` | Exercise target |
| Promoted candidates | `CAND-A`, `CAND-B` | From `/knowledge-review` |

---

## 4. Scenario Timeline

### Day 0 — Candidate Promoted

**Actor:** Mining Reviewer (OPERATOR)  
**Document:** [Release Approval SOP §6 prerequisite](./RELEASE_APPROVAL_SOP.md)

| Step | Action | Document ref | Pass |
| ---- | ------ | ------------ | ---- |
| 0.1 | Open `/knowledge-review` | Release Approval SOP §4 | ☐ |
| 0.2 | Review mining candidate evidence | Trust principle | ☐ |
| 0.3 | Promote candidate(s) to `PROMOTED` | Release Approval SOP §4 | ☐ |
| 0.4 | Record candidate IDs in exercise log | — | ☐ |

**Expected audit (if live):** Mining promotion events (product-specific).

---

### Day 1 — Version Created & Candidates Bound

**Actor:** Release Operator (OPERATOR)  
**Document:** [Release Approval SOP §6 Step A](./RELEASE_APPROVAL_SOP.md)

| Step | Action | Document ref | Pass |
| ---- | ------ | ------------ | ---- |
| 1.1 | Navigate `/knowledge-foundation/new` | README routes | ☐ |
| 1.2 | Enter version `1.1.0` + scope notes (Arabic) | Release Approval SOP Step A | ☐ |
| 1.3 | Bind promoted candidates from eligible pool | Release Approval SOP Step A | ☐ |
| 1.4 | Confirm status = `DRAFT` | Release Approval SOP Step A | ☐ |
| 1.5 | Verify audit: `version.created`, `candidate.bound` | Release Approval SOP §12 | ☐ |

**Stop test:** Operator cites SOP if zero candidates bound.

---

### Day 2 — Governance Review & Approval

**Actor:** Release Approver (ADMIN) — **not** the sole mining reviewer if four-eyes required  
**Document:** [Release Approval SOP §7–8](./RELEASE_APPROVAL_SOP.md)

| Step | Action | Document ref | Pass |
| ---- | ------ | ------------ | ---- |
| 2.1 | Open `/knowledge-foundation/[id]` | README | ☐ |
| 2.2 | Review Bound Candidates panel | Step B | ☐ |
| 2.3 | Review Release Readiness (blockers = 0) | Step B | ☐ |
| 2.4 | Export governance report (optional) | Step B | ☐ |
| 2.5 | Click **اعتماد الإصدار** | Step C | ☐ |
| 2.6 | Confirm status = `APPROVED` | Step C | ☐ |
| 2.7 | Verify audit: `version.approved` | §12 | ☐ |

**Stop test:** Approver refuses if readiness shows duplicate canonical codes (cite Step B table).

---

### Day 3 — Release Package

**Actor:** Release Operator (OPERATOR)  
**Document:** [Release Approval SOP §9](./RELEASE_APPROVAL_SOP.md)

| Step | Action | Document ref | Pass |
| ---- | ------ | ------------ | ---- |
| 3.1 | Confirm status = `APPROVED` | Step D | ☐ |
| 3.2 | Click **إطلاق الحزمة** | Step D | ☐ |
| 3.3 | Confirm status = `RELEASED` | Step D | ☐ |
| 3.4 | Confirm `artifactStatus = COMPLETE` | Step D checklist | ☐ |
| 3.5 | Verify FS path `knowledge/releases/v1.1.0/` (ops confirms) | Step D | ☐ |
| 3.6 | Verify audit: `version.released` | §12 | ☐ |

**Branch (optional — facilitator injects):** If `artifactStatus = FAILED`, switch to [RELEASE_FAILED_RECOVERY_RUNBOOK](./RELEASE_FAILED_RECOVERY_RUNBOOK.md) before continuing.

---

### Day 4 — Integrity Verification

**Actor:** Release Operator or ADMIN  
**Document:** [Release Approval SOP §10](./RELEASE_APPROVAL_SOP.md)

| Step | Action | Document ref | Pass |
| ---- | ------ | ------------ | ---- |
| 4.1 | Open version detail (RELEASED) | Step E | ☐ |
| 4.2 | Review Integrity Status card | Step E | ☐ |
| 4.3 | Run **إعادة التحقق من السلامة** | Step E | ☐ |
| 4.4 | Confirm all checks green | Step E | ☐ |
| 4.5 | Verify audit: `integrity.verified` | §12 | ☐ |

**Stop test:** Operator cites blockers if hash mismatch — no activation.

---

### Day 5 — Activation

**Actor:** Release Approver (ADMIN)  
**Document:** [Release Approval SOP §11](./RELEASE_APPROVAL_SOP.md)

| Step | Action | Document ref | Pass |
| ---- | ------ | ------------ | ---- |
| 5.1 | Confirm integrity verified | Step F | ☐ |
| 5.2 | Click **تفعيل الإصدار** | Step F | ☐ |
| 5.3 | Confirm status = `ACTIVE` | Step F | ☐ |
| 5.4 | Confirm prior ACTIVE → `DEPRECATED` | Step F | ☐ |
| 5.5 | Dashboard shows `v1.1.0` active | Step F checklist | ☐ |
| 5.6 | Verify audit: `version.activated`, prior `deprecated` | §12 | ☐ |

---

### Day 6 — Incident Discovered

**Actor:** Governance Auditor (declares incident)  
**Document:** [Rollback SOP §2](./ROLLBACK_SOP.md)

**Facilitator narrative:**

> A pilot user reports incorrect institutional rule in ACTIVE `v1.1.0`. Governance decides immediate rollback to last known-good `v1.0.0`.

| Step | Action | Document ref | Pass |
| ---- | ------ | ------------ | ---- |
| 6.1 | Open incident ticket with documented reason | Rollback SOP §5 | ☐ |
| 6.2 | Identify current ACTIVE = `v1.1.0` | Rollback SOP §5 | ☐ |
| 6.3 | Identify target = `v1.0.0` (RELEASED or ACTIVE eligible) | Rollback SOP §4 | ☐ |
| 6.4 | Confirm target not DEPRECATED-only | Rollback SOP §4 table | ☐ |

---

### Day 7 — Rollback

**Actor:** Release Approver (ADMIN)  
**Document:** [Rollback SOP §6–7](./ROLLBACK_SOP.md)

| Step | Action | Document ref | Pass |
| ---- | ------ | ------------ | ---- |
| 7.1 | Open **target** version `v1.0.0` integrity | Rollback SOP §6 | ☐ |
| 7.2 | Run integrity verification on target — PASS | Rollback SOP §6 | ☐ |
| 7.3 | Open current version `v1.1.0` detail | Rollback SOP §7 | ☐ |
| 7.4 | Execute rollback with documented reason | Rollback SOP §7 | ☐ |
| 7.5 | Confirm `v1.0.0` = ACTIVE | Rollback SOP §7 checklist | ☐ |
| 7.6 | Confirm `v1.1.0` = DEPRECATED | Rollback SOP §7 | ☐ |
| 7.7 | Verify audit: `rollback.executed`, `integrity.verified`, `deprecated` | Rollback SOP §8 | ☐ |

**Stop test:** OPERATOR attempts rollback — must cite ADMIN-only rule.

---

### Day 30 — Audit Reconstruction Request

**Actor:** Governance Auditor  
**Documents:** [Release Approval SOP §12](./RELEASE_APPROVAL_SOP.md), [Evidence Retention Policy §8](./EVIDENCE_RETENTION_POLICY.md)

**Facilitator narrative:**

> External auditor requests full reconstruction of the `v1.1.0` release cycle and rollback decision.

| Step | Action | Document ref | Pass |
| ---- | ------ | ------------ | ---- |
| 30.1 | Open `/knowledge-foundation/history` | Retention Policy §8 | ☐ |
| 30.2 | Reconstruct event timeline (table below) | Release Approval SOP §12 | ☐ |
| 30.3 | Locate release row + `manifestSha256` for `v1.1.0` | Retention Policy §2 | ☐ |
| 30.4 | Confirm FS artifacts retained per policy | Retention Policy §3 | ☐ |
| 30.5 | Produce reconstruction memo (template §5) | — | ☐ |

**Expected event sequence (minimum):**

```text
knowledge.foundation.version.created
knowledge.foundation.candidate.bound (×N)
knowledge.foundation.readiness.generated (optional)
knowledge.foundation.version.approved
knowledge.foundation.version.released
knowledge.foundation.integrity.verified
knowledge.foundation.version.activated
knowledge.foundation.version.deprecated (v1.0.0 at activation)
knowledge.foundation.integrity.verified (rollback target)
knowledge.foundation.rollback.executed
knowledge.foundation.version.deprecated (v1.1.0)
```

---

## 5. Audit Reconstruction Memo (template)

```markdown
# KF Audit Reconstruction — [Version / Incident ID]

**Request date:**
**Auditor:**
**Scope:** v1.1.0 release + rollback to v1.0.0

## Timeline

| UTC Time | Event type | Actor | Version | Evidence ref |
| -------- | ---------- | ----- | ------- | ------------ |
| | | | | |

## Source of truth checks

- [ ] DB release row manifestSha256 documented
- [ ] FS artifact hash matches DB
- [ ] Rollback reason in audit metadata
- [ ] Retention policy compliance confirmed

## Conclusion

[Pass / Gap identified — cite document update needed]

**Signed:** _______________  **Date:** _______________
```

---

## 6. Facilitator Scoring

| Section | Weight | Score (0/1) |
| ------- | ------ | ----------- |
| Day 0–1 Promotion & binding | 15% | |
| Day 2 Approval | 15% | |
| Day 3–4 Release & integrity | 20% | |
| Day 5 Activation | 15% | |
| Day 6–7 Incident & rollback | 20% | |
| Day 30 Audit reconstruction | 15% | |

**Pass:** ≥ 95% (all critical stops correctly applied)

**Critical stops (automatic fail if wrong):**

- Activation without integrity pass
- Rollback by non-ADMIN
- Rollback to DEPRECATED/APPROVED target
- Missing audit reconstruction for rollback reason

---

## 7. Optional Advanced Branch — RELEASED + FAILED

**Duration:** +30 minutes  
**Document:** [RELEASE_FAILED_RECOVERY_RUNBOOK](./RELEASE_FAILED_RECOVERY_RUNBOOK.md)

Facilitator simulates `artifactStatus = FAILED` after Day 3.

| Step | Participant cites | Pass |
| ---- | ----------------- | ---- |
| Freeze activation | Recovery runbook §3 | ☐ |
| Choose Path A/B/C | Recovery runbook §4 | ☐ |
| Close with COMPLETE + integrity PASS | Recovery runbook §9 | ☐ |

---

## 8. Exercise Completion Sign-off

| Item | Status |
| ---- | ------ |
| All participants completed roles | ☐ |
| No developer assistance required | ☐ |
| Gaps documented for doc update | ☐ |
| Phase 29 Tabletop Gate | ☐ PASS / ☐ FAIL |

**Facilitator signature:** _______________  
**Date:** _______________  
**Environment:** ☐ Staging ☐ Paper simulation ☐ Production (scheduled)

---

## 9. Related Documents

| Document | Role in exercise |
| -------- | ---------------- |
| [README](./README.md) | Index + routes |
| [RELEASE_APPROVAL_SOP](./RELEASE_APPROVAL_SOP.md) | Days 0–5 |
| [ROLLBACK_SOP](./ROLLBACK_SOP.md) | Days 6–7 |
| [EVIDENCE_RETENTION_POLICY](./EVIDENCE_RETENTION_POLICY.md) | Day 30 |
| [RELEASE_FAILED_RECOVERY_RUNBOOK](./RELEASE_FAILED_RECOVERY_RUNBOOK.md) | Optional branch |

---

## 10. Document Control

| Version | Date | Change |
| ------- | ---- | ------ |
| 1.0 | 2026-06-21 | Initial Phase 29 exit gate script |

**Next run:** Before first pilot go-live + quarterly thereafter.
