# Knowledge Foundation — Pilot Governance Runbook

> **Version:** 1.0  
> **Date:** 2026-06-21  
> **Status:** Approved (Phase 29 P2)  
> **Scope:** Institutional pilot operations for Knowledge Foundation (MODEL_B)  
> **Audience:** Pilot customer admin, AQLIYA operator, platform ADMIN, governance lead  
> **Parent:** [Enterprise Operations Index](./README.md)

---

## 1. Purpose

This runbook consolidates all Knowledge Foundation operational documents into a **single pilot operating guide**. It defines roles, monthly release rhythm, exception handling, incident coordination, evidence requirements, and pilot acceptance criteria.

**Trust principle:** AI assists. Humans decide. Evidence governs.

**This runbook does not replace** detailed SOPs — it routes operators to them.

---

## 2. Document Map (pilot operator)

| Phase | Document | When to use |
| ----- | -------- | ----------- |
| Release lifecycle | [Release Approval SOP](./RELEASE_APPROVAL_SOP.md) | Every version forward |
| Rollback | [Rollback SOP](./ROLLBACK_SOP.md) | Defect or governance revert |
| Evidence retention | [Evidence Retention Policy](./EVIDENCE_RETENTION_POLICY.md) | Audit requests, legal hold |
| FAILED release | [RELEASE_FAILED_RECOVERY_RUNBOOK](./RELEASE_FAILED_RECOVERY_RUNBOOK.md) | `artifactStatus = FAILED` |
| Monitoring | [Monitoring & Incident Response](./MONITORING_AND_INCIDENT_RESPONSE.md) | Alerts, severity, escalation |
| Tabletop (exit gate) | [Tabletop Governance Exercise](./TABLETOP_GOVERNANCE_EXERCISE.md) | Pre go-live acceptance test |
| Tabletop prep | [Tabletop Readiness Checklist](./TABLETOP_READINESS_CHECKLIST.md) | Before scheduling exercise |

---

## 3. Roles & Responsibilities

### 3.1 Role definitions

| Role | Typical assignee | System role | Authority |
| ---- | ---------------- | ----------- | --------- |
| **Mining Reviewer** | Domain SME / LC analyst | OPERATOR | Promote mining candidates only |
| **Release Operator** | AQLIYA platform operator | OPERATOR | Create version, bind, release package |
| **Release Approver** | Customer governance lead or AQLIYA ADMIN | ADMIN | Approve, activate, rollback |
| **Governance Auditor** | Internal audit / compliance | VIEWER+ (read) | Audit reconstruction, no mutations |
| **Platform Ops** | AQLIYA infrastructure | Ops (non-UI) | Backup, FS restore, FAILED recovery |
| **Platform Owner** | AQLIYA product/engineering lead | Escalation | SEV-1/2 decisions, pilot comms |

### 3.2 Separation of duties (pilot default)

| Control | Requirement |
| ------- | ------------- |
| Four-eyes approval | Approver ≠ sole mining promoter for same version (when customer policy requires) |
| Release vs activate | OPERATOR may release; only ADMIN activates |
| Rollback | ADMIN only with documented reason |
| FAILED recovery DB update | Platform ops + ADMIN dual approval |

---

## 4. RACI Matrix

**R** = Responsible · **A** = Accountable · **C** = Consulted · **I** = Informed

| Activity | Mining Reviewer | Release Operator | Release Approver | Governance Auditor | Platform Ops | Platform Owner |
| -------- | --------------- | ---------------- | ---------------- | ------------------ | ------------ | -------------- |
| Promote mining candidate | **R/A** | I | I | C | — | — |
| Create DRAFT + bind | C | **R/A** | I | I | — | — |
| Readiness review | C | **R** | C | **C** | — | — |
| Approve version | I | C | **R/A** | C | — | — |
| Generate release | I | **R/A** | I | I | C | — |
| Integrity verification | C | **R** | **A** | I | C | — |
| Activate version | I | C | **R/A** | I | — | I |
| Rollback | I | C | **R/A** | C | C | I |
| FAILED recovery | I | C | **A** | I | **R** | C |
| Audit reconstruction | C | C | C | **R/A** | C | I |
| Monthly release cadence | C | **R** | **A** | C | I | I |
| Pilot exception request | C | C | **R** | **A** | C | C |
| SEV-1 incident | I | C | C | C | **R** | **A** |

---

## 5. Monthly Release Cycle (pilot cadence)

Default pilot rhythm: **one governed Knowledge Foundation release per month** unless exception approved (§6).

### Week 1 — Intake & promotion

| Day | Action | Owner | Output |
| --- | ------ | ----- | ------ |
| 1–2 | Review mining queue `/knowledge-review` | Mining Reviewer | Promoted candidates |
| 3 | Governance intake meeting | Approver + Operator | Scope for version `vX.Y.Z` |
| 5 | Freeze promotion set for month | Approver | Signed candidate list |

### Week 2 — Version build

| Day | Action | Owner | Doc |
| --- | ------ | ----- | --- |
| 1 | Create DRAFT + bind | Release Operator | Release Approval SOP Step A |
| 2–3 | Readiness + diff review | Operator + Auditor | Steps B–C |
| 5 | Approve (if blockers = 0) | Release Approver | Step C |

### Week 3 — Release & verify

| Day | Action | Owner | Doc |
| --- | ------ | ----- | --- |
| 1 | Generate release package | Release Operator | Step D |
| 2 | Confirm `artifactStatus = COMPLETE` | Operator + Platform Ops | Step D checklist |
| 3 | Integrity verification | Operator or ADMIN | Step E |
| 5 | Change advisory to pilot users (if breaking) | Approver | Customer comms template §8 |

### Week 4 — Activation & review

| Day | Action | Owner | Doc |
| --- | ------ | ----- | --- |
| 1 | Activate (maintenance window) | Release Approver | Step F |
| 2 | Post-activation smoke | Operator | Dashboard + ACTIVE rules |
| 3 | Monthly governance review | Auditor | Audit reconstruction sample |
| 5 | Retrospective + exception log update | All roles | §6 |

**Maintenance window (recommended):** Sunday 02:00–04:00 AST (align with platform runbook).

---

## 6. Exception Management

### 6.1 Exception types

| ID | Exception | Default | Approval |
| -- | --------- | ------- | -------- |
| EX-01 | Skip monthly release (no changes) | Allowed | Approver documents "no release month" |
| EX-02 | Emergency release (< 7 days) | Restricted | Approver + Platform Owner |
| EX-03 | Activate without full readiness (warnings only) | **Not allowed** | N/A — resolve blockers |
| EX-04 | Rollback outside maintenance window | Allowed if SEV-1/2 | Approver + incident ticket |
| EX-05 | Manual `FAILED → COMPLETE` DB update | Restricted | Platform ops + ADMIN + ticket |
| EX-06 | Bind candidate after approval | **Not allowed** | Create new DRAFT version |
| EX-07 | Pilot customer requests rule change mid-cycle | Case-by-case | Forward version or hotfix path |

### 6.2 Exception request template

```markdown
## KF Exception Request — EX-XX

**Requestor:**
**Date:**
**Version affected:**
**Exception type:** EX-XX
**Business justification:**
**Risk assessment:**
**Mitigation:**
**Approver signature:**
**Expiry date:**
```

Store with pilot governance records (retention: 7+ years per evidence policy).

---

## 7. Incident Management (pilot)

### 7.1 Incident categories

| Category | Example | Primary doc |
| -------- | ------- | ----------- |
| Release failure | `artifactStatus = FAILED` | Recovery runbook |
| Integrity failure | Hash mismatch | Monitoring SEV-2 |
| Wrong ACTIVE rules | Pilot user impact | Rollback SOP |
| Trust chain break | Activation blocked | Recovery + Platform Owner |
| Unauthorized access attempt | RBAC / middleware | Platform security runbook |

### 7.2 Incident workflow

```text
Detect → Classify severity (Monitoring doc)
       → Open ticket + notify ADMIN
       → Contain (freeze activation if release-related)
       → Resolve (SOP / runbook path)
       → Audit reconstruction
       → Close + retrospective
```

### 7.3 Pilot communication template

```markdown
Subject: [AQLIYA KF] Knowledge Foundation Update — v{X.Y.Z}

Status: Scheduled | Completed | Rolled back

Summary (Arabic):
- ...

Impact:
- Active version: v...
- User action required: Yes/No

Support:
- Customer admin: ...
- AQLIYA operator: ...
```

---

## 8. Evidence Requirements (pilot)

Every monthly release cycle must produce:

| Evidence | Source | Retention |
| -------- | ------ | --------- |
| Promoted candidate audit trail | Mining review + `candidate.bound` | 7+ years |
| Approval record | `version.approved` + optional signed memo | 7+ years |
| Release package | DB row + `knowledge/releases/v{X}/` | Permanent |
| Integrity proof | `integrity.verified` event | 7+ years |
| Activation record | `version.activated` | 7+ years |
| Governance report export | JSON from UI (optional) | Pilot contract archive |
| Monthly review minutes | Facilitator notes | 7+ years |

**Minimum audit reconstruction query:** `/knowledge-foundation/history` filtered by version ID.

---

## 9. Pilot Acceptance Criteria

Knowledge Foundation is **pilot-operational** when all criteria pass:

### 9.1 Documentation gate

- [ ] All Phase 29 documents approved (see [Tabletop Readiness Checklist](./TABLETOP_READINESS_CHECKLIST.md))
- [ ] Roles assigned and named in pilot charter
- [ ] RACI acknowledged by customer admin

### 9.2 Technical gate

- [ ] Staging release cycle completed once (DRAFT → ACTIVE)
- [ ] Integrity verification passes on staging ACTIVE version
- [ ] Backup + FS sync configured for `knowledge/releases/`
- [ ] `/knowledge-foundation` middleware RBAC verified

### 9.3 Governance gate

- [ ] At least one rollback drill on staging (or tabletop Day 7)
- [ ] Audit reconstruction completed for test version
- [ ] Exception log process tested (EX-01 minimum)
- [ ] **Tabletop Governance Exercise** passed (final exit gate — not before P2 complete)

### 9.4 Commercial truthfulness

- [ ] Customer briefed: KF is platform-wide institutional knowledge, not tenant Firm Memory
- [ ] No claim of autonomous AI release or approval
- [ ] FAILED recovery path understood by Platform Ops

---

## 10. Pilot Onboarding Checklist (KF-specific)

Add to customer Day 0 provisioning:

- [ ] OPERATOR and ADMIN accounts provisioned for KF workspace
- [ ] Customer governance lead assigned as Release Approver
- [ ] `/knowledge-foundation` access verified (not `/auditos` demo)
- [ ] Mining review queue accessible at `/knowledge-review`
- [ ] Prior ACTIVE version documented (bootstrap or seed)
- [ ] Monthly release calendar agreed (§5)
- [ ] Escalation contacts exchanged (Monitoring doc §4)

---

## 11. Escalation Summary

```text
Operator (OPERATOR)
  → Admin (ADMIN / Release Approver)
    → Platform Owner (SEV-1/2, pilot comms)
      → Executive sponsor (SEV-1 customer impact)
```

Detail: [Monitoring & Incident Response](./MONITORING_AND_INCIDENT_RESPONSE.md).

---

## 12. Arabic Summary (ملخص تشغيل Pilot)

**دليل حوكمة Pilot لأساس المعرفة** يجمع إجراءات الإصدار والاسترجاع والاحتفاظ بالأدلة في دورة شهرية واحدة.

| العنصر | القاعدة |
| ------ | ------- |
| الإصدار الشهري | ترقية → ربط → اعتماد → إطلاق → تحقق → تفعيل |
| الاستثناءات | موثقة ومعتمدة — لا تفعيل دون سلامة |
| الحوادث | تجميد → SOP → إعادة بناء التدقيق |
| قبول Pilot | وثائق + staging + Tabletop |

---

## 13. Document Control

| Version | Date | Change |
| ------- | ---- | ------ |
| 1.0 | 2026-06-21 | Initial Phase 29 P2 — pilot consolidation runbook |

**Review:** After first pilot release cycle or Tabletop completion.
