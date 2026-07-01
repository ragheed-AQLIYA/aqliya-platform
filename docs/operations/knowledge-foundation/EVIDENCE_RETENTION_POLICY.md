# Knowledge Foundation — Evidence Retention Policy

> **Version:** 1.0  
> **Date:** 2026-06-21  
> **Status:** Approved (Phase 29 P1)  
> **Scope:** Knowledge Foundation release evidence, artifacts, and audit records  
> **Parent policy:** [Platform Data Retention Policy](../data-retention-policy.md)  
> **Product:** Knowledge Foundation (MODEL_B — platform-wide institutional knowledge)

---

## 1. Purpose

This policy extends the platform retention framework for **Knowledge Foundation** governed releases. It defines how long release evidence must be kept, how backups and restores are verified, and how legal hold and destruction apply.

**Principle:**

> DB is source of truth. Filesystem artifacts are verification evidence. Both must be retained coherently.

---

## 2. Source of Truth Hierarchy

When records conflict, resolve in this order:

| Priority | Layer | Authority | Used for |
| -------- | ----- | --------- | -------- |
| 1 | **PostgreSQL** | `KnowledgeFoundationRelease`, `KnowledgeFoundationVersion`, junction bindings | Status, hashes, provenance snapshot, trust chain |
| 2 | **Platform audit log** | `PlatformAuditLog` where `productKey = "knowledge-foundation"` | Who did what, when, with metadata |
| 3 | **Filesystem artifacts** | `knowledge/releases/v{version}/` | Independent verification of DB hashes |
| 4 | **Exported reports** | Governance report JSON, offline tabletop records | Institutional records / pilot contracts |

**Never treat FS alone as authoritative** if DB row exists with different `manifestSha256`.

---

## 3. Retention Schedule

### 3.1 Core retention table

| Asset | Location / Model | Retention | Rationale |
| ----- | ---------------- | --------- | --------- |
| `KnowledgeFoundationRelease` row | PostgreSQL | **Permanent** | Immutable release record; trust chain anchor |
| `KnowledgeFoundationVersion` row | PostgreSQL | **Permanent** | Lifecycle + rollback lineage |
| Version–candidate bindings | `KnowledgeFoundationVersionCandidate` | **Permanent** | Provenance of what was released |
| `manifest.json` | `knowledge/releases/v{X}/` | **Permanent** | Release manifest + SHA-256 reference |
| `knowledge-foundation.json` | Same directory | **Permanent** | Canonical rule payload (hash = `manifestSha256`) |
| `provenance-manifest.json` | Same directory | **Permanent** | Must match DB `provenanceSnapshot` |
| `candidate-list.json` | Same directory | **Permanent** | Bound candidate enumeration |
| `change-summary.json` | Same directory | **Permanent** | Release diff metadata |
| `release-notes.md` | Same directory | **Permanent** | Human-readable release context |
| KF audit events | `PlatformAuditLog` | **7+ years** | Aligns with platform audit policy |
| Mining promotion evidence | Knowledge Mining tables + review UI | **7+ years** | Upstream provenance for bound candidates |
| Application operational logs | CloudWatch / container stdout | **90–365 days** | Incident triage (365 for production) |
| ECS task / ALB access logs | AWS logging | **90 days** (365 if SIEM export) | Security monitoring |
| Daily DB backups | RDS / `/backups/db/` | **30 days rolling** | Operational restore |
| Long-term DB archive | S3 Glacier / cold storage | **7+ years** | Regulatory + institutional audit |
| FS artifact backup | S3 sync of `knowledge/releases/` | **Permanent mirror** | DR for verification evidence |

### 3.2 Status-specific rules

| Version status | DB row | FS artifacts | Notes |
| -------------- | ------ | ------------ | ----- |
| `DRAFT` / `APPROVED` | Retain | N/A (no release yet) | Pre-release; no artifact obligation |
| `RELEASED` | Retain | **Required** | Must reach `artifactStatus = COMPLETE` before activation |
| `RELEASED` + `FAILED` | Retain | Repair or restore per [recovery runbook](./RELEASE_FAILED_RECOVERY_RUNBOOK.md) | Do not delete failed row |
| `ACTIVE` | Retain | **Required** | Current institutional truth |
| `DEPRECATED` | Retain | **Required** | Historical releases; never purge for convenience |

---

## 4. Backup Policy

### 4.1 What must be backed up

| Component | Method | Frequency |
| --------- | ------ | --------- |
| PostgreSQL (includes all KF tables) | RDS automated backup + optional `pg_dump` | Daily (RDS); on-demand before major release |
| `knowledge/releases/` directory | S3 sync / storage backup job | Daily incremental |
| Governance report exports | Institutional records store | At each approval / release / rollback |
| Tabletop exercise evidence | Signed facilitator checklist | Per exercise |

### 4.2 Backup locations (cloud)

| Environment | DB | Artifacts |
| ----------- | -- | --------- |
| Production | RDS Multi-AZ + cross-region snapshot | S3 bucket (same retention as uploads policy) |
| Staging | RDS snapshot | Local or S3 mirror |
| Development | `docker compose` volume / manual dump | `./knowledge/releases/` in repo workspace |

Reference: [HA/DR Plan](../ha-dr-plan.md), [Production Deployment Runbook](../production-deployment-runbook.md).

### 4.3 Coherence requirement

A backup set is **KF-valid** only if:

- [ ] DB restore includes `KnowledgeFoundationRelease` for all `RELEASED`/`ACTIVE`/`DEPRECATED` versions
- [ ] FS restore includes matching `knowledge/releases/v{versionNumber}/` paths
- [ ] Spot-check: `manifestSha256` in DB matches SHA-256 of restored `knowledge-foundation.json`

---

## 5. Restore Testing Cadence

| Test | Cadence | Owner | Evidence |
| ---- | ------- | ----- | -------- |
| DB restore drill | **Monthly** (production/staging) | Platform ops | `scripts/platform/restore-drill.mjs` JSON report |
| KF artifact spot-check after drill | **Monthly** (with drill) | Platform ops | Manual hash verify on latest ACTIVE version |
| Full tabletop governance exercise | **Quarterly** (pilot) | Governance lead | [TABLETOP_GOVERNANCE_EXERCISE.md](./TABLETOP_GOVERNANCE_EXERCISE.md) signed checklist |
| Cross-region DR failover | **Quarterly** | Platform ops | HA/DR drill log |

### 5.1 KF-specific restore verification steps

After any DB or FS restore:

1. Identify current `ACTIVE` version (`/knowledge-foundation` dashboard)
2. Open version detail → run **Integrity verification**
3. Confirm `verifyReleaseIntegrity` = PASS (all green)
4. Query audit log: last 10 `knowledge.foundation.*` events present
5. Document result in restore drill report under **KF Evidence Check**

---

## 6. Legal Hold Procedure

When legal hold applies to a release, incident, or pilot contract:

### 6.1 Trigger

- Written request from legal / compliance
- Regulatory investigation affecting institutional knowledge releases
- Customer contract dispute involving a specific version

### 6.2 Actions

1. Create **Legal Hold record** (case ID, scope, date, approver)
2. Scope minimum:
   - Affected `KnowledgeFoundationVersion` id(s)
   - All related `KnowledgeFoundationRelease` rows
   - FS directory `knowledge/releases/v{version}/`
   - All `PlatformAuditLog` rows for those version IDs
   - Exported governance reports referencing those versions
3. **Suspend** any automated purge affecting scoped records (see parent policy §3.3)
4. Notify platform ops: no FS directory deletion, no DB row hard-delete
5. Log hold activation in platform audit log (operator action)

### 6.3 Release

- Legal counsel confirms in writing
- Document release date and scope
- Resume normal retention schedule only for non-held records

---

## 7. Destruction Procedure

### 7.1 General rule

**Knowledge Foundation release records are not eligible for routine destruction.**

Deprecated versions remain permanent institutional evidence.

### 7.2 Permitted destruction (exceptional only)

| Data | Destruction allowed? | Conditions |
| ---- | -------------------- | ---------- |
| Release DB rows | **No** (default) | Only with explicit governance board + legal approval |
| Release FS artifacts | **No** (default) | Same as above; must not destroy while DB references exist |
| Operational logs (90–365d) | **Yes** | Standard log rotation |
| Failed partial FS writes (orphan files) | **Yes** | After recovery runbook completes and COMPLETE row verified; document in incident ticket |
| DRAFT versions never released | **Yes** (soft) | After 1 year inactive + no legal hold; export governance report first |

### 7.3 Destruction workflow (when approved)

```text
1. Export machine-readable archive (DB rows + FS tarball + audit extract)
2. Generate SHA-256 manifest of export
3. Store export in cold storage (7+ years)
4. Second approver (ADMIN + governance lead) signs destruction memo
5. Execute deletion
6. Log destruction event with export manifest reference
```

---

## 8. Audit Event Retention

All Knowledge Foundation events in `PlatformAuditLog`:

| Event family | Examples | Retention |
| ------------ | -------- | --------- |
| Lifecycle | `version.created`, `approved`, `released`, `activated`, `deprecated` | 7+ years |
| Binding | `candidate.bound`, `candidate.unbound` | 7+ years |
| Integrity | `integrity.verified`, `integrity.failed` | 7+ years |
| Rollback | `rollback.executed` | 7+ years |
| Advisory | `readiness.generated`, `report.generated`, `diff.generated` | 7+ years |

Query filter: `productKey = "knowledge-foundation"`.

Route: `/knowledge-foundation/history` (OPERATOR/ADMIN).

---

## 9. Roles

| Role | Responsibility |
| ---- | -------------- |
| **Platform ops** | Backups, restore drills, FS/S3 sync |
| **ADMIN** | Approve destruction exceptions; integrity verification |
| **Governance lead** | Legal hold scope; retention compliance review |
| **Legal / compliance** | Hold trigger and release |

---

## 10. Arabic Summary (ملخص)

| الأصل | مدة الاحتفاظ |
| ----- | ------------- |
| سجل الإصدار في قاعدة البيانات | دائم |
| ملفات الحزمة (`manifest`, `knowledge-foundation.json`, `provenance-manifest`) | دائم |
| أحداث التدقيق (KF) | 7 سنوات فأكثر |
| السجلات التشغيلية | 90–365 يومًا |
| النسخ الاحتياطي اليومي | 30 يومًا (قاعدة البيانات) |
| الأرشيف طويل الأمد | 7 سنوات فأكثر |

**مبدأ:** قاعدة البيانات هي مصدر الحقيقة؛ الملفات للتحقق. لا حذف لإصدارات RELEASED/ACTIVE/DEPRECATED دون موافقة حوكمة وقانونية.

---

## 11. Related Documents

- [Release Approval SOP](./RELEASE_APPROVAL_SOP.md)
- [Rollback SOP](./ROLLBACK_SOP.md)
- [RELEASED+FAILED Recovery Runbook](./RELEASE_FAILED_RECOVERY_RUNBOOK.md)
- [Platform Data Retention Policy](../data-retention-policy.md)

---

## 12. Document Control

| Version | Date | Change |
| ------- | ---- | ------ |
| 1.0 | 2026-06-21 | Initial Phase 29 P1 — KF extension |

**Review cycle:** Annual, or after first pilot release cycle / legal hold event.
