# Knowledge Foundation — Rollback SOP

> **Version:** 1.0  
> **Date:** 2026-06-21  
> **Status:** Approved (Phase 29 P0)  
> **Scope:** Governed rollback of ACTIVE Knowledge Foundation version to a prior verified release  
> **Audience:** Platform ADMIN, Governance lead, On-call operator  
> **System:** AQLIYA Knowledge Foundation — `/knowledge-foundation/[id]`

---

## 1. Purpose

This SOP defines when and how to **rollback** the platform-wide ACTIVE knowledge version to a previously released version, with the **same integrity gate** as forward activation.

Rollback is a **governed recovery action**, not a shortcut around release controls.

**Invariant (post Phase 28.4 hotfix):**

```text
No path reaches ACTIVE without verifyReleaseIntegrity()
—including executeRollback()
```

---

## 2. When to Rollback

### Appropriate use

- Critical defect discovered in ACTIVE institutional rules after activation
- Pilot customer impact requiring immediate return to last known-good release
- Governance decision to revert pending fix in a new forward version
- Failed forward activation attempt after partial operational change (with governance approval)

### Not appropriate

- Skipping approval/release for new content (use forward release SOP instead)
- Rolling to a version that was never released (`APPROVED` only)
- Rolling to `DEPRECATED` archive without prior RELEASED/ACTIVE lineage
- Bypassing integrity failures on target version

---

## 3. Roles

| Role | Permission |
| ---- | ---------- |
| **ADMIN** | Execute rollback (required) |
| OPERATOR | May identify issue; **cannot** execute rollback |
| VIEWER | Read-only; no rollback |

Rollback requires:

- Authenticated ADMIN session
- Non-empty **reason** (logged to audit trail)

---

## 4. Rollback Target Policy (Code-Enforced)

### Allowed target statuses

| Status | Allowed? | Notes |
| ------ | -------- | ----- |
| `RELEASED` | ✅ | Typical rollback target (prior release never activated, or re-activation) |
| `ACTIVE` | ✅ | Only if not already the current ACTIVE (system blocks self-rollback) |
| `APPROVED` | ❌ | Never released — no manifest / provenance |
| `DRAFT` | ❌ | No release package |
| `DEPRECATED` | ❌ | Explicit policy rejection (hotfix R-02) |

**Operator UI note:** Target picker excludes `DRAFT`; service layer enforces full policy.

---

## 5. Preconditions

Before rollback:

- [ ] Incident or governance decision documented (ticket / memo)
- [ ] Current ACTIVE version identified (`/knowledge-foundation` dashboard)
- [ ] Target version identified with status `RELEASED` (or eligible `ACTIVE`)
- [ ] Target has `KnowledgeFoundationRelease` row with `artifactStatus = COMPLETE`
- [ ] Integrity verification on **target** passes (Step 6)
- [ ] Stakeholders notified (pilot customer / governance lead)
- [ ] Forward fix version plan recorded (rollback is not a substitute for patch release)

---

## 6. Pre-Rollback Integrity Check (Mandatory)

**Route:** `/knowledge-foundation/[targetVersionId]`

### Actions

1. Open **target** version detail (not current ACTIVE unless verifying both)
2. Review **Integrity Status** card
3. Run **إعادة التحقق من السلامة**
4. Confirm all checks pass:
   - Release row COMPLETE
   - Hash match (DB `manifestSha256` vs `knowledge-foundation.json`)
   - Provenance match
   - Trust chain valid (if chained)
   - FS evidence present

### If integrity fails

- **Do not rollback** to this target
- Select different target OR restore artifacts from backup (Phase 29 P1 recovery runbook)
- Log investigation if tamper suspected (`integrity.failed` in audit)

---

## 7. Rollback Procedure

**Route:** `/knowledge-foundation/[currentVersionId]` → **↙ استرجاع الإصدار**  
**Role:** **ADMIN only**

### Steps

1. Document rollback reason in incident ticket
2. Navigate to current version detail (typically ACTIVE)
3. Expand **استرجاع الإصدار** section
4. Select **target version** from dropdown
   - Must be `RELEASED` or eligible per policy
   - Prefer last known-good `RELEASED` with verified integrity
5. Enter **reason** (Arabic or English — will appear in audit log)
6. Execute rollback
7. Confirm success message
8. Verify dashboard shows target as `ACTIVE`
9. Verify former ACTIVE version → `DEPRECATED`

### System effects (in order)

1. `verifyReleaseIntegrity(target, { forActivation: true })` — **before any mutation**
2. Current ACTIVE → `DEPRECATED` (+ deprecation audit event)
3. Target → `ACTIVE` with `rollbackVersionId` pointing to former ACTIVE
4. Audit: `knowledge.foundation.rollback.executed`
5. Integrity audit: `integrity.verified` or `integrity.failed`

### Rollback checklist (post-execution)

- [ ] Exactly one `ACTIVE` version
- [ ] Target matches intended version number
- [ ] `rollbackVersionId` set on target
- [ ] Deprecation event for former ACTIVE logged
- [ ] Rollback event includes `reason`, `fromVersionId`, `integrityVerified: true`
- [ ] Pilot/customer notified of active version change

---

## 8. Post-Rollback Verification

### Functional checks

- [ ] Dashboard KPI: active version number correct
- [ ] Bound candidate count on ACTIVE matches expected release
- [ ] Diff from rolled-back ACTIVE to new ACTIVE available if needed (`/knowledge-foundation/diff`)

### Audit reconstruction

**Route:** `/knowledge-foundation/history`

Expected new events:

```text
knowledge.foundation.version.deprecated  (former ACTIVE)
knowledge.foundation.integrity.verified  (target, pre-rollback)
knowledge.foundation.rollback.executed
```

Reconstruct timeline:

| Time | Event | Actor | Evidence |
| ---- | ----- | ----- | -------- |
| T0 | Issue detected | Operator | Ticket |
| T1 | Target integrity verified | ADMIN | `integrity.verified` |
| T2 | Rollback executed | ADMIN | `rollback.executed` + reason |
| T3 | New ACTIVE confirmed | ADMIN | Dashboard + `version.activated` N/A (rollback sets ACTIVE directly) |

---

## 9. Failure Modes & Responses

| Failure | Cause | Response |
| ------- | ----- | -------- |
| `Rollback integrity verification failed` | Target hash/artifact/chain invalid | Choose other target; restore FS; do not force |
| `RELEASED or ACTIVE` policy error | Invalid target status | Select RELEASED version with COMPLETE release |
| `Access denied: ADMIN` | Wrong role | Escalate to ADMIN on-call |
| `Target already active` | No-op | Confirm state; no action needed |
| Rollback succeeded but pilot still broken | Wrong target selected | Forward fix or second rollback with governance approval |

---

## 10. Relationship to Forward Release

After rollback, the **forward path** for fixes remains:

```text
New DRAFT version
    → bind corrected candidates
    → approve → release → verify → activate
```

Do **not** edit RELEASED artifacts in place. Create a new version.

---

## 11. Prohibited Actions

| Prohibited | Reason |
| ---------- | ------ |
| OPERATOR executing rollback | ADMIN-only |
| Rollback without reason | System blocks |
| Rollback to APPROVED / DRAFT / DEPRECATED | Policy + code enforced |
| Manual DB status change to ACTIVE | Bypasses integrity gate |
| Skipping integrity check because "it worked before" | Artifacts may have changed |

---

## 12. Escalation Matrix

| Severity | Example | Action |
| -------- | ------- | ------ |
| **S1** | ACTIVE rules causing pilot data integrity issue | Immediate rollback per this SOP + notify customer |
| **S2** | Integrity fail on all available targets | Engage platform ops; FS/DB recovery (P1 runbook) |
| **S3** | Suspected tampering (hash mismatch) | Security incident + halt all activations |

---

## 13. Records

- Rollback reason stored in:
  - `knowledge.foundation.rollback.executed` → PlatformAuditLog metadata
  - `knowledge.foundation.version.deprecated` notes on former ACTIVE
- Attach incident ticket ID to governance records
- Retention: 7 years (audit events per platform retention policy)

---

## 14. Document Control

| Version | Date | Change |
| ------- | ---- | ------ |
| 1.0 | 2026-06-21 | Initial Phase 29 P0 — rollback integrity gate aligned with hotfix R-01/R-02 |

**Next review:** After Tabletop Governance Exercise rollback scenario.
