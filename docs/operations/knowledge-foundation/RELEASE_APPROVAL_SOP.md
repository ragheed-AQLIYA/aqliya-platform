# Knowledge Foundation — Release Approval SOP

> **Version:** 1.0  
> **Date:** 2026-06-21  
> **Status:** Approved (Phase 29 P0)  
> **Scope:** Governed release of platform-wide Knowledge Foundation versions (MODEL_B)  
> **Audience:** Platform Operator, Release Approver (ADMIN), Governance reviewer  
> **System:** AQLIYA Knowledge Foundation — `/knowledge-foundation/*`

---

## 1. Purpose

This SOP defines the **human-controlled** procedure to move an institutional knowledge version from draft through approval, release, integrity verification, and activation.

It does **not** authorize autonomous release. Readiness scores and AI suggestions are **advisory only**.

**Governing principle:**

> Evidence governs releases — not candidate status alone, not timestamps, not operator intent alone.

---

## 2. Scope

### In scope

- Version lifecycle: `DRAFT → APPROVED → RELEASED → ACTIVE`
- Candidate binding at version creation
- Release package generation (version-scoped bindings only)
- Integrity verification before activation
- Audit trail reconstruction checkpoints

### Out of scope

- Knowledge Mining promotion (see `/knowledge-review`)
- Firm Memory (tenant-scoped TB learning)
- Static regulatory domains under `knowledge-foundation/domains/` (separate charter program)
- Rollback (see [ROLLBACK_SOP.md](./ROLLBACK_SOP.md))

---

## 3. Roles & Separation of Duties

| Role | Responsibilities in this SOP |
| ---- | ----------------------------- |
| **Mining Reviewer / OPERATOR** | Promote candidates; create DRAFT; bind candidates; generate release |
| **Release Approver / ADMIN** | Approve version content; activate after integrity pass |
| **Governance reviewer** | Read-only audit reconstruction; may block approval |

**Recommended separation:** The same person should **not** both approve and be the sole author of mining promotions for the same version, when institution policy requires four-eyes review.

---

## 4. Preconditions

Before starting this SOP, confirm:

- [ ] Candidate(s) reached `PROMOTED` via Knowledge Mining human review (`/knowledge-review`)
- [ ] Candidate(s) are **not** bound to another foundation version
- [ ] Version number follows semantic format (e.g. `1.0.0`, `1.1.0`)
- [ ] Operator has `OPERATOR` or `ADMIN` role
- [ ] Approver has `ADMIN` role for approval and activation steps

---

## 5. Procedure Overview

```text
Step A  Create DRAFT + bind promoted candidates     (OPERATOR)
Step B  Governance review + readiness assessment  (OPERATOR / reviewer)
Step C  Approve version                           (ADMIN)
Step D  Generate release package                  (OPERATOR)
Step E  Verify release integrity                  (OPERATOR / ADMIN)
Step F  Activate version                          (ADMIN)
Step G  Post-activation audit check               (ADMIN / reviewer)
```

---

## 6. Step A — Create Version & Bind Candidates

**Route:** `/knowledge-foundation/new`  
**Role:** OPERATOR or ADMIN

### Actions

1. Navigate to **أساس المعرفة** → **إنشاء إصدار جديد**
2. Enter version number and notes (Arabic-first description of scope)
3. From **eligible promoted pool**, select candidates to bind
   - Use filters: canonical code, confidence, promotion date
   - Review pool stats: total promoted / bound / unbound
4. Submit form

### System effects

- Version status: `DRAFT`
- Junction rows: `KnowledgeFoundationVersionCandidate`
- Audit: `knowledge.foundation.version.created`, `knowledge.foundation.candidate.bound`

### Operator checklist

- [ ] Each bound candidate is `PROMOTED` with evidence in mining review
- [ ] No duplicate canonical codes in selection (readiness will block if duplicated)
- [ ] Bound count matches intended release scope
- [ ] Notes explain **why** this version exists (business/governance context)

### Stop / Do not proceed if

- Zero candidates bound without documented exception
- Candidate bound to another version (system blocks)
- Operator lacks OPERATOR role

---

## 7. Step B — Governance Review (Advisory)

**Route:** `/knowledge-foundation/[id]`  
**Role:** OPERATOR (review); governance reviewer (read-only)

### Actions

1. Open version detail page
2. Review **Bound Candidates** panel
3. Review **Release Readiness** panel (Phase 28.3 — display only)
   - Score, blockers, warnings
4. Optionally export **Governance Report** (JSON) for records
5. Review **Provenance Summary** (candidate count, evidence aggregates — no raw tenant data)

### Readiness blockers (must resolve before approval)

| Blocker | Resolution |
| ------- | ---------- |
| Status not approvable | Complete Step A; ensure DRAFT |
| No bound candidates | Bind candidates or cancel version |
| Duplicate canonical codes | Unbind duplicates in DRAFT |
| Missing evidence (warning) | Return to mining review or document risk acceptance |

**Note:** Readiness does **not** auto-approve or auto-release.

---

## 8. Step C — Approve Version

**Route:** `/knowledge-foundation/[id]` → **اعتماد الإصدار**  
**Role:** **ADMIN only**

### Approver checklist (four-eyes)

- [ ] Readiness blockers = 0 (or documented risk acceptance signed offline)
- [ ] Provenance summary acceptable
- [ ] Version notes accurate
- [ ] Diff reviewed if superseding prior ACTIVE version (`/knowledge-foundation/diff`)
- [ ] No open mining review disputes for bound candidates

### Actions

1. Click **اعتماد الإصدار**
2. Confirm success message
3. Verify status = `APPROVED`

### System effects

- Audit: `knowledge.foundation.version.approved`

### Stop / Do not proceed if

- User is not ADMIN
- Readiness shows hard blockers unresolved
- Approver is sole author without institutional waiver

---

## 9. Step D — Generate Release Package

**Route:** `/knowledge-foundation/[id]` → **إطلاق الحزمة**  
**Role:** **OPERATOR or ADMIN**

### Actions

1. Confirm version status = `APPROVED`
2. Click **إطلاق الحزمة**
3. Wait for completion (Phase A DB transaction + Phase B filesystem artifacts)

### System effects

- Version status: `RELEASED`
- Bindings: `includedInRelease = true`
- DB source of truth on `KnowledgeFoundationRelease`:
  - `manifestSha256`
  - `provenanceSnapshot`
  - `artifactStatus`: `PENDING` → `COMPLETE` (or `FAILED` on FS error)
  - `previousReleaseId` / `previousReleaseHash` (trust chain)
- FS verification evidence under `knowledge/releases/v{versionNumber}/`:
  - `knowledge-foundation.json`
  - `provenance-manifest.json`
  - `manifest.json`
  - `candidate-list.json`, `change-summary.json`, `release-notes.md`
- Audit: `knowledge.foundation.version.released`

### Post-release checklist

- [ ] `artifactStatus = COMPLETE` in DB (via governance report or DBA query)
- [ ] Artifact directory exists on server/storage
- [ ] `candidateCount` matches bound set
- [ ] Trust chain parent recorded if not bootstrap release

### Stop / escalate if

- `artifactStatus = FAILED` → **do not activate**; follow RELEASED+FAILED Recovery Runbook (Phase 29 P1)
- Release button unavailable (not APPROVED)
- VIEWER role attempted release (system denies)

---

## 10. Step E — Integrity Verification (Mandatory Gate)

**Route:** `/knowledge-foundation/[id]` → **Integrity / إعادة التحقق من السلامة**  
**Role:** OPERATOR or ADMIN (before activation)

### What verification checks

**DB source of truth:**

- `KnowledgeFoundationRelease.artifactStatus = COMPLETE`
- `manifestSha256` present
- `provenanceSnapshot` present
- Trust chain: `previousReleaseHash` matches parent `manifestSha256` when set

**Filesystem verification evidence:**

- `knowledge-foundation.json` SHA256 matches DB `manifestSha256`
- `provenance-manifest.json` matches DB `provenanceSnapshot`
- `manifest.json` exists

### Actions

1. Open version detail (status must be `RELEASED`)
2. Review **Integrity Status** card
3. Click **إعادة التحقق من السلامة** if re-check required
4. Confirm: **تم التحقق** (all checks green)

### Audit events

- Pass: `knowledge.foundation.integrity.verified`
- Fail: `knowledge.foundation.integrity.failed` (includes blockers in metadata)

### Stop / do not activate if

- Any integrity blocker present
- Hash mismatch
- Missing artifacts
- Broken trust chain

---

## 11. Step F — Activate Version

**Route:** `/knowledge-foundation/[id]` → **تفعيل الإصدار**  
**Role:** **ADMIN only**

### Actions

1. Confirm Step E integrity = verified
2. Click **تفعيل الإصدار**
3. Verify status = `ACTIVE`
4. Confirm prior ACTIVE version → `DEPRECATED` (if existed)

### System effects

- Integrity gate runs again inside `activateVersion()` (no bypass)
- Audit: `knowledge.foundation.version.activated`
- Prior ACTIVE deprecated automatically

### Post-activation checklist

- [ ] Exactly one `ACTIVE` version (platform-wide)
- [ ] Integrity event logged for activation attempt
- [ ] Dashboard KPI shows new active version number
- [ ] Governance report archived offline if required by policy

---

## 12. Step G — Audit Reconstruction

**Route:** `/knowledge-foundation/history` or `/settings/audit-logs`  
**Role:** ADMIN / governance reviewer

### Expected event sequence (happy path)

```text
knowledge.foundation.version.created
knowledge.foundation.candidate.bound (×N)
knowledge.foundation.readiness.generated (optional)
knowledge.foundation.version.approved
knowledge.foundation.version.released
knowledge.foundation.integrity.verified
knowledge.foundation.version.activated
```

### Reconstruction checklist

- [ ] Each bound `candidateId` traceable to mining promotion audit
- [ ] Release row `manifestSha256` matches archived artifact hash
- [ ] `previousReleaseId` chain coherent with prior releases
- [ ] No `integrity.failed` without documented remediation before activate

---

## 13. Prohibited Actions

| Prohibited | Reason |
| ---------- | ------ |
| Auto-release based on readiness score | Governance-only display (28.3) |
| Activate without integrity verified | Phase 28.4 gate |
| Release from APPROVED without OPERATOR role | RBAC (hotfix R-03) |
| Bind non-PROMOTED candidates | Bridge rules |
| Delete bound mining candidates | Cascade guard (28.1 R5) |
| Use deprecated `releaseFoundationVersion` path | Throws by design |

---

## 14. Escalation

| Condition | Escalate to | Action |
| --------- | ----------- | ------ |
| `artifactStatus = FAILED` | Platform ops + DBA | Recovery runbook; do not activate |
| Integrity hash mismatch | Security / platform ops | Treat as tamper investigation |
| Broken trust chain | Governance lead | Halt activation; review release history |
| Stuck RELEASED orphan | Platform ops | Document state; manual recovery per P1 runbook |

---

## 15. Records & Retention

- Platform audit log: `productKey = "knowledge-foundation"` — retain per [data retention policy](../data-retention-policy.md) (audit events: 7 years)
- Release artifacts: `knowledge/releases/v{version}/` — retain with platform backup policy
- Exported governance reports: store in institutional records per pilot contract

---

## 16. Document Control

| Version | Date | Change |
| ------- | ---- | ------ |
| 1.0 | 2026-06-21 | Initial Phase 29 P0 — post ADR-028 closure |

**Next review:** After first Tabletop Governance Exercise or first pilot release cycle.
