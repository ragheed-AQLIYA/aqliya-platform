# Knowledge Foundation — Monitoring & Incident Response

> **Version:** 1.0  
> **Date:** 2026-06-21  
> **Status:** Approved (Phase 29 P2)  
> **Scope:** Operational monitoring and incident response for Knowledge Foundation  
> **Closes:** R-05 (detection), R-07 (operational awareness)  
> **Related:** [Pilot Governance Runbook](./PILOT_GOVERNANCE_RUNBOOK.md), [Recovery Runbook](./RELEASE_FAILED_RECOVERY_RUNBOOK.md)

---

## 1. Purpose

Define **what to monitor**, **how to classify incidents**, and **how to escalate** for Knowledge Foundation governed releases.

Monitoring is **governance-aware** — alerts tie to audit events and DB truth, not only application errors.

---

## 2. Monitoring Scope

### 2.1 Primary signals

| Signal | Detection | Severity default | Response doc |
| ------ | --------- | ---------------- | ------------ |
| `integrity.failed` | Platform audit log | SEV-2 (SEV-1 if activation attempted after) | Release Approval SOP §10 |
| `integrity.verified` | Audit log (positive control) | Info | Monthly review |
| `rollback.executed` | Audit log | SEV-2 | Rollback SOP |
| `artifactStatus = FAILED` | DB query / governance report | SEV-3 | Recovery runbook |
| `artifactStatus = PENDING` (> 15 min) | DB query | SEV-3 | Platform ops — stuck Phase B |
| Activation attempt on failed integrity | App error + audit | SEV-2 | Block expected — investigate root cause |
| Release generation failure | App error / 500 on release action | SEV-3 | Recovery runbook §3 |
| Trust chain blocker | Integrity result metadata | SEV-2 | Recovery runbook Path C |
| Unauthorized KF route access | Middleware 403 / access-denied | SEV-2 | Security review |

### 2.2 Audit event reference

All events: `PlatformAuditLog` where `productKey = "knowledge-foundation"`.

| Event type | Severity hint | Meaning |
| ---------- | ------------- | ------- |
| `knowledge.foundation.integrity.failed` | Warning | Hash, FS, or chain check failed |
| `knowledge.foundation.integrity.verified` | Info | Verification passed |
| `knowledge.foundation.rollback.executed` | Warning | ACTIVE changed via rollback |
| `knowledge.foundation.version.released` | Info | Successful release (artifact COMPLETE) |
| `knowledge.foundation.version.activated` | Info | New ACTIVE version |
| `knowledge.foundation.version.deprecated` | Warning | Prior version archived |

UI route: `/knowledge-foundation/history` (OPERATOR/ADMIN).

---

## 3. Detection Methods

### 3.1 Platform audit log (primary)

**Daily operator check:**

1. Open `/knowledge-foundation/history`
2. Filter last 24h for `integrity.failed`, `rollback.executed`
3. If any → open incident ticket per §5

### 3.2 Database queries (platform ops)

**FAILED releases:**

```sql
SELECT v."versionNumber", v.status, r."artifactStatus", r."createdAt"
FROM "KnowledgeFoundationVersion" v
JOIN "KnowledgeFoundationRelease" r ON r."versionId" = v.id
WHERE r."artifactStatus" IN ('FAILED', 'PENDING')
  AND r."createdAt" < NOW() - INTERVAL '15 minutes';
```

**Stuck PENDING (Phase B incomplete):**

```sql
SELECT * FROM "KnowledgeFoundationRelease"
WHERE "artifactStatus" = 'PENDING'
  AND "createdAt" < NOW() - INTERVAL '15 minutes';
```

**Orphan ACTIVE without COMPLETE release (R-05 indicator):**

```sql
SELECT v.id, v."versionNumber", v.status
FROM "KnowledgeFoundationVersion" v
WHERE v.status = 'ACTIVE'
  AND NOT EXISTS (
    SELECT 1 FROM "KnowledgeFoundationRelease" r
    WHERE r."versionId" = v.id AND r."artifactStatus" = 'COMPLETE'
  );
```

### 3.3 Application logs

| Log pattern | Meaning |
| ----------- | ------- |
| `Rollback integrity verification failed` | Rollback blocked (expected guard) |
| `Cannot release version in status` | Invalid release attempt |
| `Access denied: OPERATOR role required` | RBAC block |
| `Access denied: ADMIN role required` | RBAC block |
| Filesystem `EACCES` / `ENOSPC` on `knowledge/releases` | Likely SEV-3 FAILED artifact |

**Production:** CloudWatch log group for ECS service — filter `knowledge-foundation` or `release-generator`.

### 3.4 Infrastructure monitoring

| Check | Frequency | Alert if |
| ----- | --------- | -------- |
| Disk volume for `knowledge/releases/` | Continuous | > 80% |
| RDS backup success | Daily | Failed backup |
| S3 sync of release artifacts | Daily | Missing sync job |
| `/api/health` | 30s (ALB) | Unhealthy task |

Reference: [Production Deployment Runbook](../production-deployment-runbook.md), [HA/DR Plan](../ha-dr-plan.md).

### 3.5 Recommended alerts (implementation backlog)

| Alert name | Condition | Channel |
| ---------- | --------- | ------- |
| `KF-INTEGRITY-FAILED` | Audit ingest of `integrity.failed` | Ops Pager / Slack |
| `KF-ROLLBACK` | Audit ingest of `rollback.executed` | Ops + Governance |
| `KF-ARTIFACT-FAILED` | SQL poll `artifactStatus = FAILED` | Platform ops |
| `KF-ACTIVE-ORPHAN` | R-05 SQL returns rows | Platform Owner |

> **Note:** Alert wiring to CloudWatch/Sentry is operational infrastructure — this document defines signal definitions. Pilot may use manual daily checks until automated alerts deployed.

---

## 4. Severity Model

| Severity | Definition | Examples | Response target |
| -------- | ---------- | -------- | --------------- |
| **SEV-1** | Integrity bypass attempt or ACTIVE rules causing critical pilot harm with no rollback path | Suspected tamper; wrong ACTIVE with no valid rollback target | **15 min** acknowledge · **1 hr** contain |
| **SEV-2** | Release verification failure or governed recovery action required | `integrity.failed`; rollback executed; trust chain break | **30 min** acknowledge · **4 hr** resolve |
| **SEV-3** | Artifact generation failure; release stuck | `artifactStatus = FAILED`; FS write error | **1 hr** acknowledge · **8 hr** resolve |
| **SEV-4** | Documentation/process gap; no production impact | SOP ambiguity; training gap | **Next business day** |

### 4.1 Severity decision tree

```text
Is ACTIVE version wrong for pilot users?
  YES → Can rollback to verified target?
    YES → SEV-2 (execute Rollback SOP)
    NO  → SEV-1 (escalate Platform Owner)
  NO → Is artifactStatus FAILED or integrity.failed?
    YES → SEV-3 or SEV-2
    NO → SEV-4
```

---

## 5. Incident Response Workflow

### 5.1 Standard phases

| Phase | Actions |
| ----- | ------- |
| **Detect** | Alert, audit review, or user report |
| **Triage** | Assign severity (§4); owner = Release Operator or Platform Ops |
| **Contain** | Freeze activation; preserve DB + FS; notify ADMIN |
| **Diagnose** | Run integrity check; SQL queries (§3.2); review logs |
| **Resolve** | Execute linked SOP/runbook |
| **Recover** | Verify ACTIVE state; customer comms if needed |
| **Review** | Audit reconstruction; update exception log if applicable |

### 5.2 Playbook routing

| Condition | Playbook |
| --------- | -------- |
| `artifactStatus = FAILED` | [RELEASE_FAILED_RECOVERY_RUNBOOK](./RELEASE_FAILED_RECOVERY_RUNBOOK.md) |
| Wrong ACTIVE content | [ROLLBACK_SOP](./ROLLBACK_SOP.md) |
| Hash mismatch | Recovery runbook + treat as SEV-2; SEV-1 if suspected tamper |
| Release button fails | Recovery runbook §3 + check disk/RBAC |
| RBAC bypass suspicion | Platform security incident — halt KF mutations |

---

## 6. Escalation Chain

```text
Operator (OPERATOR)
  → Admin (ADMIN / Release Approver)
    → Platform Owner (AQLIYA product + engineering lead)
      → Executive sponsor (customer-facing SEV-1)
```

### 6.1 Escalation matrix

| Severity | Notify immediately | Update cadence |
| -------- | ------------------ | -------------- |
| SEV-1 | ADMIN + Platform Owner + customer admin | Every 30 min until contained |
| SEV-2 | ADMIN + Platform Ops | Every 2 hr |
| SEV-3 | Platform Ops | Every 4 hr |
| SEV-4 | Release Operator | Daily standup |

### 6.2 Contact roles (fill per pilot)

| Role | Name | Channel |
| ---- | ---- | ------- |
| Release Operator | __________ | |
| Release Approver (ADMIN) | __________ | |
| Platform Ops | __________ | |
| Platform Owner | __________ | |
| Customer admin | __________ | |

---

## 7. Incident Record Template

```markdown
# KF Incident — INC-YYYY-MM-DD-NNN

**Severity:** SEV-_
**Detected:** YYYY-MM-DD HH:MM UTC
**Detector:** Alert | Audit review | User report
**Version(s):** v...
**Status:** Open | Contained | Resolved

## Timeline

| Time | Event |
| ---- | ----- |
| | |

## Signals

- [ ] integrity.failed
- [ ] rollback.executed
- [ ] artifactStatus FAILED
- [ ] Other: ___

## Actions taken

1.

## Resolution

**Playbook used:**
**Exit criteria met:** Yes/No
**Audit events attached:**

**Closed by:** ___ **Date:** ___
```

Retain incidents **7+ years** (align with audit retention policy).

---

## 8. Post-Incident Requirements

After SEV-1 or SEV-2:

- [ ] Audit reconstruction memo (Tabletop template §5)
- [ ] Root cause documented (FS, RBAC, process, or data)
- [ ] Customer communication if pilot impacted
- [ ] Exception record if policy deviation (Pilot Runbook §6)
- [ ] Monitoring gap logged if alert was manual-only

After SEV-3:

- [ ] Confirm recovery runbook exit criteria
- [ ] Verify backup/FS sync health
- [ ] Schedule restore drill if FS loss involved

---

## 9. Operational Risk Mapping

| Risk ID | Monitoring coverage |
| ------- | ------------------- |
| R-05 | §3.2 orphan ACTIVE query + SEV-2 |
| R-06 | §2.1 FAILED + SEV-3 playbook |
| R-07 | Rollback audit + post-incident review |
| R-08 | Rollback event metadata must include reason |

---

## 10. Daily / Weekly Operator Routine (KF add-on)

Add to platform daily routine ([Pilot Operational Handbook](../PILOT_OPERATIONAL_HANDBOOK.md)):

**Daily (5 min):**

- [ ] Check `/knowledge-foundation/history` for `integrity.failed` / `rollback.executed`
- [ ] Confirm dashboard ACTIVE version matches expected pilot baseline

**Weekly (15 min):**

- [ ] Run FAILED/PENDING SQL check (§3.2)
- [ ] Export governance report for ACTIVE version (archive)
- [ ] Review open KF incidents

**Monthly:**

- [ ] KF release cycle per Pilot Governance Runbook §5
- [ ] Restore drill includes KF artifact spot-check (Retention Policy §5)

---

## 11. Document Control

| Version | Date | Change |
| ------- | ---- | ------ |
| 1.0 | 2026-06-21 | Initial Phase 29 P2 — monitoring + IR |

**Review:** After first SEV-2+ incident or Tabletop completion.
